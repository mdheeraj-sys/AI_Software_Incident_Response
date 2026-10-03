# PART 12 — AGENTIC INVESTIGATION LAYER

## 12.1 Input to the agent

The agent receives the incident candidate object (Part 8.4) plus the classification and severity score — never raw log files. This keeps token usage small and keeps the agent's reasoning grounded in already-verified structured facts.

## 12.2 Tool definitions

```json
[
  {
    "name": "query_logs",
    "description": "Search parsed log records by service, time range, source IP, or template ID",
    "input_schema": {
      "type": "object",
      "properties": {
        "service": {"type": "string"},
        "start": {"type": "string"},
        "end": {"type": "string"},
        "source_ip": {"type": "string"},
        "template_id": {"type": "integer"}
      }
    }
  },
  {
    "name": "get_recent_deploys",
    "description": "Return deploy/config-change events for a service within a time window",
    "input_schema": {
      "type": "object",
      "properties": {
        "service": {"type": "string"},
        "window_minutes": {"type": "integer"}
      }
    }
  },
  {
    "name": "find_similar_incidents",
    "description": "Hybrid search over historical closed incidents",
    "input_schema": {
      "type": "object",
      "properties": {
        "query": {"type": "string"},
        "k": {"type": "integer"}
      }
    }
  },
  {
    "name": "get_service_dependencies",
    "description": "Return the static dependency graph entry for a service",
    "input_schema": {
      "type": "object",
      "properties": {"service": {"type": "string"}}
    }
  },
  {
    "name": "get_runbook",
    "description": "Return canned remediation guidance for an incident type",
    "input_schema": {
      "type": "object",
      "properties": {"incident_type": {"type": "string"}}
    }
  }
]
```

## 12.3 System prompt design principles

- Require every factual claim to cite an evidence ID or tool-call result; forbid unsupported claims.
- Require output in a fixed JSON schema (ranked hypotheses with confidence and evidence_ids, a short human-readable summary, a list of recommended actions each tagged with a proposed tier).
- Explicitly instruct the agent that it never executes actions — it only proposes them.
- Cap the number of tool calls per investigation (e.g., 6) to bound latency and cost, and log every tool call as part of the incident's evidence timeline (this also makes the agent's reasoning process itself auditable, not just its conclusion).

## 12.4 Output schema

```json
{
  "hypotheses": [
    {
      "description": "Credential stuffing attack against /login from 10.10.10.11",
      "confidence": 0.86,
      "evidence_ids": ["ev_001", "ev_004", "ev_007"]
    }
  ],
  "summary": "340 failed login attempts across 310 distinct usernames from a single source IP within 90 seconds, followed by one successful login. Classified as credential stuffing.",
  "recommended_actions": [
    {"action_type": "block_ip", "tier": "sensitive", "rationale": "..."},
    {"action_type": "force_password_reset", "tier": "sensitive", "rationale": "..."}
  ]
}
```

## 12.5 Hallucination control and measurement

After the agent responds, run a cheap validation pass: for every evidence_id it cites, confirm that ID actually exists in the incident's evidence set and that the cited evidence record's content plausibly supports the claim (a simple keyword/entity overlap check is enough for a lab project). Track the fraction of citations that fail this check as your hallucination-rate metric (Part 18).

---
