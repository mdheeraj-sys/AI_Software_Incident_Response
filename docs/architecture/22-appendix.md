# PART 22 — APPENDIX

## 22.1 Suggested file layout

```
project-root/
  victim-app/
    app/ (FastAPI or Express source)
    nginx/
    fault_injection/
    traffic_generator/
  agent-platform/
    ingestion/
    parser/        (Drain implementation)
    detection/      (EWMA/MAD, Isolation Forest)
    correlation/
    classification/
    severity/
    retrieval/      (BM25 + embeddings)
    agent/          (tools, prompt, loop)
    executor/       (allow-listed action runner)
    api/            (FastAPI/Express backend)
    db/             (migrations, schema)
  dashboard/
    (React app)
  attack-scripts/
    hydra/
    sqlmap/
    gobuster/
    flood/
    slow_and_low/
    ground_truth.csv
  evaluation/
    run_eval.py
    metrics/
    ablations/
  docs/
    architecture.md (this document, trimmed for submission)
    runbooks/
    post_incident_reports/
```

## 22.2 Minimal API contract (backend)

```
GET  /incidents?status=&severity=&classification=
GET  /incidents/{id}
GET  /incidents/{id}/timeline
POST /incidents/{id}/actions/{action_id}/approve
POST /incidents/{id}/actions/{action_id}/reject
GET  /knowledge-base?query=
GET  /analytics/summary
WS   /live-feed
```

## 22.3 Key environment variables / config

```
DB_URL=postgresql://...
LLM_API_KEY=...
LLM_MODEL=claude-sonnet-4-6
DETECTION_WINDOW_SECONDS=30
EWMA_ALPHA=0.3
ANOMALY_Z_THRESHOLD=3.0
ISOLATION_FOREST_CONTAMINATION=0.02
CORRELATION_WINDOW_SECONDS=120
MAX_AGENT_TOOL_CALLS=6
APPROVAL_ESCALATION_MINUTES=5
```

## 22.4 One-paragraph summary for your report's abstract

This project implements an AI-assisted software incident response platform that ingests application telemetry, parses it into structured templates using a from-scratch Drain-based parser, detects anomalies with a combined statistical and Isolation-Forest-based approach, correlates related anomalies into incidents, and investigates them using an LLM agent restricted to a bounded toolset that cites evidence for every claim. All sensitive remediation actions require explicit human approval before a narrowly-permissioned executor carries them out, and every step is recorded in a hash-chained audit log. The system is evaluated against a two-VM attacker/victim lab using labeled, scripted attacks, reporting detection precision/recall, time-to-detect, root-cause accuracy, retrieval quality, and hallucination rate, with ablations isolating the contribution of each major design choice.

---

*End of document.*
