# PART 9 — INCIDENT DATA MODEL AND LIFECYCLE STATE MACHINE

## 9.1 Core entities (relational schema sketch)

```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL, -- new, investigating, awaiting_approval, mitigating, resolved, closed
    classification TEXT,  -- brute_force, sqli_attempt, scan, flood, resource_exhaustion, bad_deploy, unknown
    severity TEXT,         -- low, medium, high, critical
    severity_score NUMERIC,
    title TEXT,
    summary TEXT,          -- AI-generated, always paired with evidence
    assigned_to TEXT,
    source_ips TEXT[],
    affected_services TEXT[]
);

CREATE TABLE evidence (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id),
    log_record_id UUID,
    description TEXT,
    timestamp TIMESTAMPTZ
);

CREATE TABLE hypotheses (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id),
    rank INT,
    description TEXT,
    confidence NUMERIC,
    evidence_ids UUID[]
);

CREATE TABLE recommended_actions (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id),
    action_type TEXT,       -- block_ip, disable_account, rate_limit, rollback_deploy, notify_only
    tier TEXT,              -- read_only, reversible, sensitive
    status TEXT,            -- proposed, approved, rejected, executed, failed
    proposed_by TEXT,       -- 'agent'
    decided_by TEXT,        -- human identifier
    decided_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    result TEXT
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    incident_id UUID,
    actor TEXT,              -- 'agent' or human username
    action TEXT,
    detail JSONB,
    timestamp TIMESTAMPTZ,
    prev_hash TEXT,
    this_hash TEXT
);
```

## 9.2 Lifecycle state machine

```
new ──► investigating ──► awaiting_approval ──► mitigating ──► resolved ──► closed
  │                             │
  │                             ▼
  │                          rejected (action declined, incident stays investigating or closes as false positive)
  ▼
 false_positive (closed directly, with a reason recorded)
```

Transitions should be logged to `audit_log` on every change, with the actor (agent or human) recorded. A false-positive close should feed back into the baseline (Part 18) rather than being discarded.

## 9.3 Why `prev_hash` / `this_hash` on the audit log

Hash-chaining each audit entry to the previous one (similar in spirit to a simple blockchain, without needing distributed consensus) means any tampering with historical audit records is detectable — recompute the chain and see where it breaks. This directly strengthens your "audit trail of AI recommendations and human actions" deliverable and is an easy, high-value addition.

```python
import hashlib, json

def compute_hash(prev_hash, entry):
    payload = json.dumps(entry, sort_keys=True) + prev_hash
    return hashlib.sha256(payload.encode()).hexdigest()
```

---
