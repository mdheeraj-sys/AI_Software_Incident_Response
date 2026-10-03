# PART 1 — SYSTEM OVERVIEW AND DESIGN PHILOSOPHY

## 1.1 One-sentence description

A platform that watches an application's logs and alerts, turns raw noise into structured incidents, investigates them with an LLM agent that cites evidence, and lets a human approve or reject every sensitive response action, while recording everything for audit.

## 1.2 Core design principle

Deterministic code detects and correlates. The LLM only reasons over already-structured incident data. This is the single most important architectural decision in the whole project, and it should be stated explicitly in your report and defense, because it directly answers three requirements in the problem statement at once: explainability, human review, and auditability.

Reasons this matters:

- An LLM reading raw logs line-by-line is slow, expensive, and non-reproducible. Ask it to "find the anomaly" in 50,000 lines and you get inconsistent answers across runs.
- A statistical/ML detector is cheap, fast, deterministic (or at least reproducible with a fixed seed), and can be unit-tested against ground truth.
- Once anomalies are detected and correlated into a single structured incident object (a few hundred tokens, not fifty thousand), the LLM's job becomes small, bounded, and verifiable: rank hypotheses, cite evidence IDs, draft a summary, propose actions.
- This division also means the system degrades gracefully. If the LLM API is unavailable, the detector and correlator still produce incidents a human can read. The agent is an enhancement layer, not a single point of failure.

## 1.3 What "agentic" means in this project

The LLM is not just prompted once with a big log dump. It operates as an agent with a small, fixed toolset it can call multiple times to gather evidence before answering:

- `query_logs(filters)` — structured search over parsed log templates
- `get_recent_deploys(service, window)` — deployment/config-change history
- `find_similar_incidents(incident_id, k)` — hybrid retrieval over past incidents
- `get_service_dependencies(service)` — static dependency graph lookup
- `get_runbook(incident_type)` — canned remediation guidance

Bounding the toolset is itself a design decision worth defending: it keeps the agent's behavior predictable and keeps the attack surface of "agent can do things" small and auditable.

## 1.4 What "human in the loop" means concretely

Every action the agent can propose is classified into one of three tiers:

- **Read-only** — querying logs, reading dashboards. No approval needed.
- **Reversible** — rate-limiting an IP for 10 minutes, flagging an account for review. Auto-applied but logged and reversible with one click.
- **Sensitive** — blocking an IP at the firewall, disabling an account, rolling back a deploy, rotating a credential. Requires explicit human approval before execution. The agent only ever *proposes*; a separate, deterministic executor *acts*, and only after a human click.

This tiering should appear in your DB schema, your UI, and your audit log as a first-class concept, not an afterthought.

## 1.5 Why two VMs, and what each one is proving

- **VM-A (Attacker):** proves the system under real attack traffic rather than synthetic test fixtures. Running actual tools (Hydra, sqlmap, nikto, hey) against your own lab produces logs with the genuine noise and timing irregularities of real attacks, which a hand-written log generator will never fully capture.
- **VM-B (Victim + Agent):** proves the full defensive pipeline end-to-end: ingestion, detection, correlation, investigation, human approval, action, and audit.

Using two separate machines (even if both are VMs on the same host) also lets you demonstrate a believable "attacker's view" during your defense: show VM-A's terminal, show the attack running, then cut to VM-B's dashboard lighting up and the agent building its case in real time. This narrative is worth more in a demo than almost anything else you could build.

---
