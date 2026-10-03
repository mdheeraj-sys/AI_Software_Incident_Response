"""
Incident Data Model, Hash-Chained Audit Trail, and SQLite Database.
Reference: Part 9 & Part 14 of AI Incident Response Architecture Document.
"""

import json
import sqlite3
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any

DB_PATH = Path(__file__).resolve().parent / "incidents.db"

def get_iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def compute_hash(prev_hash: str, entry_dict: dict) -> str:
    """Computes SHA-256 hash-chaining for tamper-proof audit trails."""
    payload = json.dumps(entry_dict, sort_keys=True) + prev_hash
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_incident_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Incidents table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            status TEXT NOT NULL,          -- new, investigating, awaiting_approval, mitigating, resolved, closed, false_positive
            classification TEXT,          -- brute_force, credential_stuffing, sqli_attempt, scanning, flood_or_dos, bad_deploy, resource_exhaustion, unknown
            severity TEXT,                -- low, medium, high, critical
            severity_score REAL,
            title TEXT,
            summary TEXT,
            assigned_to TEXT,
            source_ips TEXT,              -- JSON array
            affected_services TEXT        -- JSON array
        )
    """)

    # Evidence items
    cur.execute("""
        CREATE TABLE IF NOT EXISTS evidence (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            source TEXT,
            description TEXT,
            raw_log TEXT,
            metadata TEXT,               -- JSON dict
            FOREIGN KEY (incident_id) REFERENCES incidents(id)
        )
    """)

    # Hypotheses produced by agent
    cur.execute("""
        CREATE TABLE IF NOT EXISTS hypotheses (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL,
            rank INTEGER,
            description TEXT,
            confidence REAL,
            evidence_ids TEXT,           -- JSON array
            FOREIGN KEY (incident_id) REFERENCES incidents(id)
        )
    """)

    # Recommended Actions with Tiers & Human Decisions
    cur.execute("""
        CREATE TABLE IF NOT EXISTS recommended_actions (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL,
            action_type TEXT,            -- block_ip, disable_account, rate_limit_ip, rollback_deploy, notify_only
            target TEXT,                 -- IP or username
            tier TEXT,                   -- read_only, reversible, sensitive
            status TEXT,                 -- proposed, approved, rejected, executed, failed
            proposed_by TEXT,            -- 'agent'
            decided_by TEXT,             -- human username or 'system'
            decided_at TEXT,
            executed_at TEXT,
            rationale TEXT,
            result TEXT,
            FOREIGN KEY (incident_id) REFERENCES incidents(id)
        )
    """)

    # Hash-chained Audit Log
    cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id TEXT,
            actor TEXT,                  -- 'agent', 'human', 'detector'
            action TEXT,
            detail TEXT,                 -- JSON dict
            timestamp TEXT,
            prev_hash TEXT,
            this_hash TEXT
        )
    """)

    # Knowledge Base / Runbooks
    cur.execute("""
        CREATE TABLE IF NOT EXISTS runbooks (
            id TEXT PRIMARY KEY,
            classification TEXT UNIQUE,
            title TEXT,
            content TEXT
        )
    """)

    conn.commit()
    conn.close()

def log_audit_event(incident_id: Optional[str], actor: str, action: str, detail: dict) -> str:
    """Inserts a cryptographic hash-chained audit event."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT this_hash FROM audit_log ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    prev_hash = row["this_hash"] if row else "GENESIS_HASH_0000000000000000"

    timestamp = get_iso_now()
    entry_payload = {
        "incident_id": incident_id,
        "actor": actor,
        "action": action,
        "detail": detail,
        "timestamp": timestamp,
    }
    this_hash = compute_hash(prev_hash, entry_payload)

    cur.execute("""
        INSERT INTO audit_log (incident_id, actor, action, detail, timestamp, prev_hash, this_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (incident_id, actor, action, json.dumps(detail), timestamp, prev_hash, this_hash))

    conn.commit()
    conn.close()
    return this_hash

init_incident_db()

