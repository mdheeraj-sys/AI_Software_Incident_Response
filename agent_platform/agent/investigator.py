"""
Agentic Investigation Layer with Bounded Toolset and Evidence Validation.
Reference: Part 12 & Part 13 of AI Incident Response Architecture Document.
"""

import os
import json
import uuid
import requests
from typing import Dict, List, Any, Optional

VICTIM_API_URL = os.getenv("VICTIM_API_URL", "http://127.0.0.1:8000")

# ----------------- Static Dependencies and Runbooks -----------------
DEPENDENCY_GRAPH = {
    "web": ["api"],
    "api": ["db", "auth"],
    "auth": ["db"],
    "db": []
}

RUNBOOKS = {
    "brute_force": {
        "title": "Mitigation Procedure for Brute Force Password Attacks",
        "guidance": "1. Identify the offending IP address. 2. Verify failed authentication count. 3. Immediately block or rate-limit the source IP. 4. Check if any accounts were compromised."
    },
    "credential_stuffing": {
        "title": "Mitigation Procedure for Distributed Credential Stuffing",
        "guidance": "1. Identify multiple user accounts targeted in short bursts. 2. Block offending IP(s). 3. Force password resets for any targeted accounts that experienced a 200 OK login."
    },
    "sqli_attempt": {
        "title": "Mitigation Procedure for SQL Injection Probing",
        "guidance": "1. Block the attacker IP at the perimeter. 2. Inspect query parameters in app logs. 3. Check database logs for abnormal data dumps. 4. Patch SQL parameterization."
    },
    "scanning": {
        "title": "Mitigation Procedure for Directory / Endpoint Scanning",
        "guidance": "1. Rate limit or block the scanning IP. 2. Verify all sensitive endpoints return 401/403. 3. Check for any 200 responses to unauthenticated scan paths."
    },
    "flood_or_dos": {
        "title": "Mitigation Procedure for Traffic Floods and Denial of Service",
        "guidance": "1. Apply rate-limiting (e.g. 5 req/s) at reverse proxy. 2. Scale API worker processes. 3. Drop malicious IP range at firewall."
    },
    "bad_deploy": {
        "title": "Mitigation Procedure for Bad Deploy Regression",
        "guidance": "1. Verify high 5xx error rate coincides with recent deployment event. 2. Trigger automated or approved rollback to previous release tag. 3. Clear cache."
    }
}

# ----------------- 5 Bounded Tools (Part 12.2) -----------------
class AgentTools:
    @staticmethod
    def query_logs(incident_candidate: Dict[str, Any], filter_str: str = "") -> List[Dict[str, Any]]:
        """Structured search over parsed log templates and evidence records."""
        events = incident_candidate.get("evidence_events", [])
        if not filter_str:
            return events[-10:]
        return [e for e in events if filter_str.lower() in json.dumps(e).lower()][:10]

    @staticmethod
    def get_recent_deploys(service: str = "all") -> List[Dict[str, Any]]:
        """Return deploy/config-change events within recent window."""
        return [
            {"timestamp": "2026-10-03T10:00:00Z", "service": "api", "version": "v2.4.1", "actor": "ci/cd", "status": "deployed"},
            {"timestamp": "2026-10-03T09:30:00Z", "service": "db", "version": "schema_v12", "actor": "dba", "status": "applied"}
        ]

    @staticmethod
    def find_similar_incidents(classification: str) -> List[Dict[str, Any]]:
        """Hybrid/canned retrieval over historical incident resolutions."""
        past_incidents = {
            "brute_force": [
                {"id": "inc_hist_01", "summary": "Hydra password attack from external IP. Resolved by blocking IP.", "action_taken": "block_ip"}
            ],
            "sqli_attempt": [
                {"id": "inc_hist_02", "summary": "SQLMap scanning /search endpoint with UNION SELECT. Resolved by firewall block.", "action_taken": "block_ip"}
            ],
            "bad_deploy": [
                {"id": "inc_hist_03", "summary": "Null pointer exception after v2.4.0 deploy. Resolved by rollback.", "action_taken": "rollback_deploy"}
            ]
        }
        return past_incidents.get(classification, [])

    @staticmethod
    def get_service_dependencies(service: str) -> List[str]:
        """Return static dependency graph entry."""
        return DEPENDENCY_GRAPH.get(service, [])

    @staticmethod
    def get_runbook(classification: str) -> Dict[str, Any]:
        """Return canned remediation guidance for incident type."""
        return RUNBOOKS.get(classification, {
            "title": "Standard Incident Response",
            "guidance": "Isolate affected components, collect forensic logs, and review recent configuration changes."
        })

# ----------------- Investigation Engine -----------------
class IncidentInvestigator:
    @staticmethod
    def investigate(incident: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes structured hypotheses, human-readable summary, and tiered action proposals.
        Works deterministically or with LLM backing, citing exact evidence IDs.
        """
        classification = incident.get("classification", "unknown")
        source_ips = incident.get("source_ips", ["127.0.0.1"])
        primary_ip = source_ips[0] if source_ips else "127.0.0.1"
        evidence_list = incident.get("evidence_events", [])
        evidence_ids = [f"ev_{i+1:03d}" for i in range(min(len(evidence_list), 5))]

        # Query tools
        runbook = AgentTools.get_runbook(classification)
        deps = AgentTools.get_service_dependencies("web")
        similar = AgentTools.find_similar_incidents(classification)

        # Generate grounded hypotheses and tiered actions
        if classification == "brute_force":
            summary = (
                f"High-frequency failed login attempts detected targeting the authentication service from IP {primary_ip}. "
                f"Exceeds statistical EWMA baseline by a significant margin. Runbook advises immediate perimeter IP restriction."
            )
            hypotheses = [
                {
                    "rank": 1,
                    "description": f"Automated credential brute-force attack originating from {primary_ip}",
                    "confidence": 0.94,
                    "evidence_ids": evidence_ids
                }
            ]
            recommended_actions = [
                {
                    "action_type": "block_ip",
                    "target": primary_ip,
                    "tier": "sensitive",  # Requires human approval
                    "rationale": f"Block malicious IP {primary_ip} to halt repeated login brute forcing."
                },
                {
                    "action_type": "rate_limit_ip",
                    "target": primary_ip,
                    "tier": "reversible",  # Auto-applicable with undo
                    "rationale": f"Apply temporary 10-minute rate limit on {primary_ip}."
                }
            ]

        elif classification == "credential_stuffing":
            summary = (
                f"Distributed credential stuffing attack detected across multiple usernames from IP {primary_ip}. "
                f"Pattern matches credential list reuse against /login."
            )
            hypotheses = [
                {
                    "rank": 1,
                    "description": f"Credential stuffing attempt utilizing stolen username/password lists from {primary_ip}",
                    "confidence": 0.91,
                    "evidence_ids": evidence_ids
                }
            ]
            recommended_actions = [
                {
                    "action_type": "block_ip",
                    "target": primary_ip,
                    "tier": "sensitive",
                    "rationale": f"Block IP {primary_ip} at the firewall perimeter."
                }
            ]

        elif classification == "sqli_attempt":
            summary = (
                f"SQL injection probes detected against the /search product catalog endpoint from {primary_ip}. "
                f"App logs recorded syntax error anomalies caused by SQL metacharacters (UNION/SELECT/' OR 1=1)."
            )
            hypotheses = [
                {
                    "rank": 1,
                    "description": f"SQL Injection vulnerability scanning/exploitation against database query parser from {primary_ip}",
                    "confidence": 0.96,
                    "evidence_ids": evidence_ids
                }
            ]
            recommended_actions = [
                {
                    "action_type": "block_ip",
                    "target": primary_ip,
                    "tier": "sensitive",
                    "rationale": f"Block attacker IP {primary_ip} to prevent database data exfiltration."
                }
            ]

        elif classification == "scanning":
            summary = (
                f"Directory fuzzing / path enumeration attack detected from {primary_ip}. "
                f"Surge in 404 Not Found responses observed across varied sensitive endpoints."
            )
            hypotheses = [
                {
                    "rank": 1,
                    "description": f"Automated web scanner (e.g., gobuster/nikto) enumerating non-existent application routes from {primary_ip}",
                    "confidence": 0.89,
                    "evidence_ids": evidence_ids
                }
            ]
            recommended_actions = [
                {
                    "action_type": "rate_limit_ip",
                    "target": primary_ip,
                    "tier": "reversible",
                    "rationale": f"Throttle scanner IP {primary_ip} to protect web service availability."
                },
                {
                    "action_type": "block_ip",
                    "target": primary_ip,
                    "tier": "sensitive",
                    "rationale": f"Add {primary_ip} to firewall blocklist if scanning continues."
                }
            ]

        elif classification == "bad_deploy":
            summary = (
                "Spike in 500 Internal Server Errors detected across API endpoints correlating directly "
                "with recent deployment event for release v2.4.1."
            )
            hypotheses = [
                {
                    "rank": 1,
                    "description": "Code regression introduced in deployment release v2.4.1 causing unhandled exceptions",
                    "confidence": 0.92,
                    "evidence_ids": evidence_ids
                }
            ]
            recommended_actions = [
                {
                    "action_type": "rollback_deploy",
                    "target": "v2.4.0",
                    "tier": "sensitive",
                    "rationale": "Roll back to previous stable release v2.4.0 to restore service availability."
                }
            ]

        else:
            summary = f"Anomalous traffic pattern detected affecting services. Investigation in progress."
            hypotheses = [
                {
                    "rank": 1,
                    "description": "Unclassified traffic anomaly requiring human review",
                    "confidence": 0.60,
                    "evidence_ids": evidence_ids
                }
            ]
            recommended_actions = [
                {
                    "action_type": "notify_only",
                    "target": "on-call",
                    "tier": "read_only",
                    "rationale": "Alert on-call engineering team for manual inspection."
                }
            ]

        return {
            "summary": summary,
            "hypotheses": hypotheses,
            "recommended_actions": recommended_actions,
            "runbook": runbook
        }

# ----------------- Action Executor (Part 13) -----------------
class ActionExecutor:
    @staticmethod
    def execute(action_type: str, target: str, decided_by: str, tier: str) -> Dict[str, Any]:
        """
        Executes allow-listed remediation actions against the victim application or firewall.
        Enforces human approval check for 'sensitive' actions.
        """
        if tier == "sensitive" and decided_by == "agent":
            raise PermissionError("Sensitive actions require explicit human approval before execution!")

        try:
            if action_type == "block_ip":
                resp = requests.post(f"{VICTIM_API_URL}/internal/remediate/block_ip", params={"ip": target}, timeout=5)
                return resp.json()
            elif action_type == "unblock_ip":
                resp = requests.post(f"{VICTIM_API_URL}/internal/remediate/unblock_ip", params={"ip": target}, timeout=5)
                return resp.json()
            elif action_type == "rate_limit_ip":
                resp = requests.post(f"{VICTIM_API_URL}/internal/remediate/rate_limit_ip", params={"ip": target, "duration_seconds": 600}, timeout=5)
                return resp.json()
            elif action_type == "disable_account":
                resp = requests.post(f"{VICTIM_API_URL}/internal/remediate/disable_account", params={"user": target}, timeout=5)
                return resp.json()
            elif action_type == "rollback_deploy":
                resp = requests.post(f"{VICTIM_API_URL}/admin/fault/bad_deploy", params={"active": False}, timeout=5)
                return {"message": f"Successfully rolled back release to stable version. {resp.json().get('message')}"}
            elif action_type == "notify_only":
                return {"message": f"Notification dispatched to on-call team for {target}."}
            else:
                return {"error": f"Unknown action type: {action_type}"}
        except Exception as e:
            return {"error": f"Executor failed to contact victim service: {str(e)}"}

