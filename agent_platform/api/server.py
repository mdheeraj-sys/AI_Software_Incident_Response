"""
Agent Platform Backend API and Orchestrator.
Runs the streaming pipeline:
Log Tailing -> Drain Parser -> Anomaly Detector -> Correlation Engine -> Agent Investigation -> Database & Audit Log
Provides REST & WebSocket APIs for the Command Center Dashboard.
Reference: Parts 14, 15, and 22.2 of PS-61 Architecture Document.
"""

import os
import json
import time
import asyncio
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from agent_platform.parser.drain import DrainParser
from agent_platform.detection.detector import AnomalyDetector
from agent_platform.correlation.engine import CorrelationEngine
from agent_platform.agent.investigator import IncidentInvestigator, ActionExecutor
from agent_platform.db.database import (
    get_db_connection,
    log_audit_event,
    get_iso_now
)

# Workspace directories
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
VICTIM_LOGS_DIR = PROJECT_ROOT / "victim_app" / "logs"
VICTIM_LOGS_DIR.mkdir(parents=True, exist_ok=True)

ACCESS_LOG = VICTIM_LOGS_DIR / "access.log"
APP_LOG = VICTIM_LOGS_DIR / "app.log"
AUTH_LOG = VICTIM_LOGS_DIR / "auth.log"

app = FastAPI(title="AI Incident Response Agent Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Pipeline Singletons
drain_parser = DrainParser(max_depth=4, sim_threshold=0.5)
detector = AnomalyDetector(z_threshold=2.8)
correlator = CorrelationEngine(time_window_seconds=60)

# Connected WebSocket clients for real-time live feed
active_websockets: List[WebSocket] = []

async def broadcast_ws(payload: dict):
    """Broadcast real-time events to all open dashboard screens."""
    dead_connections = []
    for ws in active_websockets:
        try:
            await ws.send_json(payload)
        except Exception:
            dead_connections.append(ws)
    for dead in dead_connections:
        if dead in active_websockets:
            active_websockets.remove(dead)

# ----------------- Streaming Pipeline Loop -----------------
# Tails the log files, computes streaming metrics, triggers detector and correlator

pipeline_state = {
    "total_logs_processed": 0,
    "last_window_features": {},
    "recent_anomalies": []
}

async def process_log_record(record: dict):
    pipeline_state["total_logs_processed"] += 1
    raw = record.get("raw", "")

    # 1. Drain log parsing
    template_id, template_str, is_new = drain_parser.parse(raw)
    record["template_id"] = template_id
    record["template_str"] = template_str
    record["is_new_template"] = is_new

    # Store into correlator event stream
    correlator.add_event(record)

    # Broadcast raw log snippet to dashboard live feed
    await broadcast_ws({
        "type": "log_event",
        "data": {
            "timestamp": record.get("timestamp"),
            "source": record.get("source"),
            "service": record.get("service"),
            "raw": raw,
            "template_id": template_id,
            "is_new_template": is_new,
            "ip": record.get("fields", {}).get("ip", "unknown")
        }
    })

async def ingestion_worker():
    """Continuously tails victim app logs and feeds the detector."""
    # Ensure log files exist
    for f in [ACCESS_LOG, APP_LOG, AUTH_LOG]:
        if not f.exists():
            f.touch()

    file_pointers = {
        ACCESS_LOG: 0,
        APP_LOG: 0,
        AUTH_LOG: 0,
    }

    # Tracking counters over 5-second sampling intervals
    window_start = time.time()
    req_count = 0
    err_4xx = 0
    err_5xx = 0
    latencies = []
    ips = set()
    paths = set()
    failed_logins = 0
    success_logins = 0
    new_templates = 0

    while True:
        had_data = False
        for filepath, pos in list(file_pointers.items()):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    f.seek(pos)
                    lines = f.readlines()
                    file_pointers[filepath] = f.tell()

                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        record = json.loads(line)
                    except json.JSONDecodeError:
                        record = {"timestamp": get_iso_now(), "raw": line, "fields": {}}

                    await process_log_record(record)
                    had_data = True

                    # Update sampling counters
                    req_count += 1
                    fields = record.get("fields", {})
                    ip = fields.get("ip")
                    if ip:
                        ips.add(ip)
                    path = fields.get("path")
                    if path:
                        paths.add(path)
                    status_code = fields.get("status", 200)
                    if 400 <= status_code < 500:
                        err_4xx += 1
                    elif status_code >= 500:
                        err_5xx += 1

                    if "response_time_ms" in fields:
                        latencies.append(fields["response_time_ms"])

                    if record.get("source") == "auth":
                        if fields.get("success") is False:
                            failed_logins += 1
                        elif fields.get("success") is True:
                            success_logins += 1

                    if record.get("is_new_template"):
                        new_templates += 1

            except Exception:
                pass

        # Every 5 seconds, evaluate the anomaly detection window
        now = time.time()
        elapsed = now - window_start
        if elapsed >= 5.0:
            rps = round(req_count / elapsed, 2)
            p95_lat = sorted(latencies)[int(len(latencies) * 0.95)] if latencies else 15.0

            features = {
                "rps": rps,
                "error_4xx_rate": round(err_4xx / max(req_count, 1), 3),
                "error_5xx_rate": round(err_5xx / max(req_count, 1), 3),
                "p95_latency_ms": p95_lat,
                "distinct_ips": len(ips),
                "path_entropy": len(paths),
                "failed_logins": failed_logins,
                "success_logins": success_logins,
                "new_template_count": new_templates
            }
            pipeline_state["last_window_features"] = features

            # Run Two-Tier Detection
            anomaly_res = detector.detect_window(features)

            if anomaly_res["is_anomaly"]:
                pipeline_state["recent_anomalies"].append(anomaly_res)
                await broadcast_ws({
                    "type": "anomaly_alert",
                    "data": anomaly_res
                })

                # Check if correlation triggers an incident
                candidate = correlator.build_incident_candidate(anomaly_res, features)
                if candidate:
                    await handle_new_incident(candidate)

            # Reset window
            window_start = now
            req_count = 0
            err_4xx = 0
            err_5xx = 0
            latencies = []
            ips = set()
            paths = set()
            failed_logins = 0
            success_logins = 0
            new_templates = 0

        await asyncio.sleep(0.5 if not had_data else 0.1)

async def handle_new_incident(candidate: dict):
    """
    Investigates new incident candidate with agent, saves to DB,
    and logs hash-chained audit records.
    """
    incident_id = candidate["id"]
    conn = get_db_connection()
    cur = conn.cursor()

    # Avoid duplicate incident creation if one of the same classification was created in last 30s
    cur.execute(
        "SELECT id FROM incidents WHERE classification = ? AND status IN ('new', 'investigating', 'awaiting_approval') LIMIT 1",
        (candidate["classification"],)
    )
    existing = cur.fetchone()
    if existing:
        conn.close()
        return

    # 1. Agent Investigation
    investigation = IncidentInvestigator.investigate(candidate)

    # 2. Insert Incident
    cur.execute("""
        INSERT INTO incidents (
            id, created_at, updated_at, status, classification, severity, severity_score,
            title, summary, assigned_to, source_ips, affected_services
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_id,
        candidate["created_at"],
        candidate["created_at"],
        "awaiting_approval",
        candidate["classification"],
        candidate["severity"],
        candidate["severity_score"],
        candidate["title"],
        investigation["summary"],
        "Security Team",
        json.dumps(candidate["source_ips"]),
        json.dumps(candidate["affected_services"])
    ))

    # 3. Insert Evidence records
    for i, ev in enumerate(candidate.get("evidence_events", [])[:10]):
        ev_id = f"ev_{i+1:03d}_{incident_id[:6]}"
        cur.execute("""
            INSERT INTO evidence (id, incident_id, timestamp, source, description, raw_log, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            ev_id,
            incident_id,
            ev.get("timestamp", get_iso_now()),
            ev.get("source", "system"),
            f"Correlated anomaly evidence from {ev.get('service', 'app')}",
            ev.get("raw", ""),
            json.dumps(ev.get("fields", {}))
        ))

    # 4. Insert Hypotheses
    for hyp in investigation["hypotheses"]:
        cur.execute("""
            INSERT INTO hypotheses (id, incident_id, rank, description, confidence, evidence_ids)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            f"hyp_{uuid.uuid4().hex[:6]}",
            incident_id,
            hyp["rank"],
            hyp["description"],
            hyp["confidence"],
            json.dumps(hyp["evidence_ids"])
        ))

    # 5. Insert Recommended Actions
    actions_to_broadcast = []
    for act in investigation["recommended_actions"]:
        act_id = f"act_{uuid.uuid4().hex[:6]}"
        status_val = "proposed"
        executed_at = None
        result_val = None

        # Reversible / Read-only actions can auto-apply
        if act["tier"] in ["read_only", "reversible"]:
            try:
                exec_res = ActionExecutor.execute(act["action_type"], act["target"], "system", act["tier"])
                status_val = "executed"
                executed_at = get_iso_now()
                result_val = json.dumps(exec_res)
            except Exception as e:
                status_val = "failed"
                result_val = str(e)

        cur.execute("""
            INSERT INTO recommended_actions (
                id, incident_id, action_type, target, tier, status, proposed_by, decided_by, decided_at, executed_at, rationale, result
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            act_id,
            incident_id,
            act["action_type"],
            act["target"],
            act["tier"],
            status_val,
            "agent",
            "system" if status_val == "executed" else None,
            executed_at,
            executed_at,
            act["rationale"],
            result_val
        ))

        actions_to_broadcast.append({
            "id": act_id,
            "action_type": act["action_type"],
            "target": act["target"],
            "tier": act["tier"],
            "status": status_val,
            "rationale": act["rationale"]
        })

    conn.commit()
    conn.close()

    # 6. Audit Trail Entry
    audit_hash = log_audit_event(
        incident_id=incident_id,
        actor="agent",
        action="INCIDENT_CREATED_AND_INVESTIGATED",
        detail={
            "classification": candidate["classification"],
            "severity": candidate["severity"],
            "hypotheses_count": len(investigation["hypotheses"]),
            "actions_proposed": len(investigation["recommended_actions"])
        }
    )

    # 7. Notify Dashboard via WebSocket
    await broadcast_ws({
        "type": "new_incident",
        "data": {
            "id": incident_id,
            "title": candidate["title"],
            "classification": candidate["classification"],
            "severity": candidate["severity"],
            "severity_score": candidate["severity_score"],
            "summary": investigation["summary"],
            "source_ips": candidate["source_ips"],
            "actions": actions_to_broadcast,
            "audit_hash": audit_hash
        }
    })

@app.on_event("startup")
async def startup_event():
    # Start ingestion tailing in background task
    asyncio.create_task(ingestion_worker())

# ----------------- REST API Endpoints (Appendix 22.2) -----------------

@app.get("/incidents")
def list_incidents(status: Optional[str] = None, severity: Optional[str] = None):
    conn = get_db_connection()
    cur = conn.cursor()
    query = "SELECT * FROM incidents WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    if severity:
        query += " AND severity = ?"
        params.append(severity)
    query += " ORDER BY created_at DESC"
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    inc = cur.fetchone()
    if not inc:
        conn.close()
        raise HTTPException(status_code=404, detail="Incident not found")

    cur.execute("SELECT * FROM evidence WHERE incident_id = ?", (incident_id,))
    evidence = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM hypotheses WHERE incident_id = ? ORDER BY rank ASC", (incident_id,))
    hypotheses = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM recommended_actions WHERE incident_id = ?", (incident_id,))
    actions = [dict(r) for r in cur.fetchall()]

    conn.close()
    data = dict(inc)
    data["evidence"] = evidence
    data["hypotheses"] = hypotheses
    data["recommended_actions"] = actions
    return data

@app.get("/incidents/{incident_id}/timeline")
def get_incident_timeline(incident_id: str):
    """Returns hash-chained audit timeline for this incident."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM audit_log WHERE incident_id = ? ORDER BY id ASC", (incident_id,))
    records = [dict(r) for r in cur.fetchall()]
    conn.close()
    return records

class HumanDecisionRequest(BaseModel):
    decided_by: str = "security_lead"

@app.post("/incidents/{incident_id}/actions/{action_id}/approve")
async def approve_action(incident_id: str, action_id: str, req: HumanDecisionRequest):
    """
    Human Approves a sensitive remediation action.
    Triggers the Executor and records the decision in the audit log.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM recommended_actions WHERE id = ? AND incident_id = ?", (action_id, incident_id))
    action = cur.fetchone()
    if not action:
        conn.close()
        raise HTTPException(status_code=404, detail="Action not found")

    action_dict = dict(action)
    now_iso = get_iso_now()

    # Execute action via Executor
    try:
        exec_result = ActionExecutor.execute(
            action_type=action_dict["action_type"],
            target=action_dict["target"],
            decided_by=req.decided_by,
            tier=action_dict["tier"]
        )
        status_val = "executed"
        result_str = json.dumps(exec_result)
    except Exception as e:
        status_val = "failed"
        result_str = str(e)

    cur.execute("""
        UPDATE recommended_actions
        SET status = ?, decided_by = ?, decided_at = ?, executed_at = ?, result = ?
        WHERE id = ?
    """, (status_val, req.decided_by, now_iso, now_iso, result_str, action_id))

    # Update incident state towards resolved
    cur.execute("UPDATE incidents SET status = 'mitigating', updated_at = ? WHERE id = ?", (now_iso, incident_id))
    conn.commit()
    conn.close()

    # Log to tamper-proof hash-chained audit log
    audit_hash = log_audit_event(
        incident_id=incident_id,
        actor=req.decided_by,
        action="ACTION_APPROVED_AND_EXECUTED",
        detail={"action_id": action_id, "action_type": action_dict["action_type"], "result": result_str}
    )

    await broadcast_ws({
        "type": "action_updated",
        "data": {
            "incident_id": incident_id,
            "action_id": action_id,
            "status": status_val,
            "decided_by": req.decided_by,
            "audit_hash": audit_hash
        }
    })

    return {"message": "Action approved and executed.", "result": result_str, "audit_hash": audit_hash}

@app.post("/incidents/{incident_id}/actions/{action_id}/reject")
async def reject_action(incident_id: str, action_id: str, req: HumanDecisionRequest):
    """Human Rejects a sensitive remediation action."""
    conn = get_db_connection()
    cur = conn.cursor()
    now_iso = get_iso_now()
    cur.execute("""
        UPDATE recommended_actions
        SET status = 'rejected', decided_by = ?, decided_at = ?
        WHERE id = ? AND incident_id = ?
    """, (req.decided_by, now_iso, action_id, incident_id))
    conn.commit()
    conn.close()

    audit_hash = log_audit_event(
        incident_id=incident_id,
        actor=req.decided_by,
        action="ACTION_REJECTED",
        detail={"action_id": action_id}
    )

    await broadcast_ws({
        "type": "action_updated",
        "data": {
            "incident_id": incident_id,
            "action_id": action_id,
            "status": "rejected",
            "decided_by": req.decided_by,
            "audit_hash": audit_hash
        }
    })

    return {"message": "Action rejected.", "audit_hash": audit_hash}

@app.get("/analytics/summary")
def get_analytics():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM incidents")
    total_incidents = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM incidents WHERE status = 'awaiting_approval'")
    pending_actions = cur.fetchone()[0]

    cur.execute("SELECT classification, COUNT(*) FROM incidents GROUP BY classification")
    by_class = dict(cur.fetchall())

    cur.execute("SELECT severity, COUNT(*) FROM incidents GROUP BY severity")
    by_sev = dict(cur.fetchall())

    conn.close()
    return {
        "total_incidents": total_incidents,
        "pending_actions": pending_actions,
        "classification_breakdown": by_class,
        "severity_breakdown": by_sev,
        "total_logs_streamed": pipeline_state["total_logs_processed"],
        "current_window_features": pipeline_state["last_window_features"]
    }

# ----------------- WebSocket Live Feed -----------------
@app.websocket("/live-feed")
async def websocket_live_feed(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            # Keep-alive ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)

# ----------------- Attack Trigger & Simulation API -----------------
class AttackTriggerRequest(BaseModel):
    attack_type: str = "brute"  # brute, sqli, scan, deploy
    source_ip: str = "10.10.10.11"

@app.post("/api/trigger-attack")
async def api_trigger_attack(req: AttackTriggerRequest, background_tasks: BackgroundTasks):
    from attack_scripts.attack_runner import run_brute_force, run_sqli_attack, run_directory_scan, trigger_bad_deploy

    def execute_attack():
        if req.attack_type == "brute":
            run_brute_force(source_ip=req.source_ip, attempts=30)
        elif req.attack_type == "sqli":
            run_sqli_attack(source_ip=req.source_ip)
        elif req.attack_type == "scan":
            run_directory_scan(source_ip=req.source_ip)
        elif req.attack_type == "deploy":
            trigger_bad_deploy()

    background_tasks.add_task(execute_attack)
    return {"message": f"Attack '{req.attack_type}' launched from {req.source_ip}."}

@app.post("/api/unblock-all")
def api_unblock_all():
    from victim_app.main import FAULT_STATE
    FAULT_STATE["blocked_ips"].clear()
    FAULT_STATE["rate_limited_ips"].clear()
    FAULT_STATE["bad_deploy_active"] = False
    return {"message": "All firewall blocks and rate limits cleared."}

# ----------------- Built-in Interactive Web Command Center Dashboard -----------------
@app.get("/dashboard", response_class=HTMLResponse)
def get_dashboard_html():
    dashboard_file = PROJECT_ROOT / "dashboard" / "index.html"
    if dashboard_file.exists():
        return dashboard_file.read_text(encoding="utf-8")
    return "<h1>Dashboard Loading...</h1>"
