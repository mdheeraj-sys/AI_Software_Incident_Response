# PART 19 — WEEK-BY-WEEK BUILD PLAN

This assumes roughly 6-8 weeks; compress or extend by dropping/adding ablations and attack variants as needed, but keep the core order intact — each week depends on the previous one producing real, working output, not placeholders.

## Week 1 — Foundations
- Set up both VMs, internal network, NTP sync, snapshots.
- Build the victim app (auth, search, CRUD, admin endpoint) behind nginx.
- Build the baseline traffic generator.
- Define the canonical log schema and get all five log sources flowing in that format.

## Week 2 — Parsing and storage
- Implement the Drain parser from scratch; validate on baseline + sample attack logs.
- Stand up Postgres with the schema from Part 9.
- Build the ingestion/tailing pipeline writing normalized, parsed records to the DB.

## Week 3 — Detection
- Implement feature engineering (per-service and per-source).
- Implement EWMA/MAD baseline detector.
- Implement Isolation Forest detector trained on clean baseline data.
- Start the attack catalog scripts on VM-A (Part 4) with ground-truth logging.

## Week 4 — Correlation, classification, severity
- Implement the correlation engine.
- Implement rule-based classification and the severity scoring formula.
- Get a full pipeline working end to end: attack on VM-A → incident appears in the DB with classification and severity, no LLM yet, no UI yet (check with direct DB queries).

## Week 5 — Dashboard
- Build the incident list, incident detail, and live feed views.
- Wire up WebSocket/polling for live updates.
- At this point you have a demoable, fully deterministic incident detection system — a solid fallback if later weeks run short (see Part 20).

## Week 6 — Agentic layer
- Implement the five tools and the agent loop (tool-calling LLM).
- Implement the evidence-citation validation check.
- Wire agent output (hypotheses, summary, recommended actions) into the incident record and UI.

## Week 7 — Approval workflow, audit trail, retrieval, KB
- Implement action tiers, the executor with its allow-list, and the approval UI.
- Implement the hash-chained audit log and evidence timeline view.
- Implement hybrid retrieval and the post-incident report generator.
- Seed the runbook library.

## Week 8 — Evaluation and polish
- Run full evaluation trials (Part 18) across all attack types plus the false-positive test.
- Produce the ablation tables.
- Rehearse the demo script (Part 21).
- Fix the highest-impact bugs only; resist adding new features this late.

---
