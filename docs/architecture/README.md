# 📚 System Architecture & Build Plan Index

This directory breaks down the full architectural specification and engineering build plan of the **Autonomous AI Software Incident Response Agent (SIRA)** into modular, easy-to-read chapters.

---

### 🗺️ Chapters & Documentation Map

| Chapter | Document | Topic Description |
| :---: | :--- | :--- |
| **00** | [00-document-map.md](00-document-map.md) | High-level index and roadmap |
| **01** | [01-system-overview-and-design-philosophy.md](01-system-overview-and-design-philosophy.md) | Design principles, deterministic vs. LLM boundary |
| **02** | [02-two-vm-lab-topology-and-network-design.md](02-two-vm-lab-topology-and-network-design.md) | Dual-VM topology, Kali Linux & Victim infrastructure |
| **03** | [03-victim-application-architecture.md](03-victim-application-architecture.md) | FastAPI victim app, SQLite DB, and fault injectors |
| **04** | [04-attacker-vm-toolkit-and-attack-catalog.md](04-attacker-vm-toolkit-and-attack-catalog.md) | Hydra, SQLMap, Gobuster, and bad deploy regression attacks |
| **05** | [05-telemetry-and-log-schema.md](05-telemetry-and-log-schema.md) | Structured JSON telemetry & event attributes |
| **06** | [06-log-parsing-subsystem-drain-algorithm-from-scratch.md](06-log-parsing-subsystem-drain-algorithm-from-scratch.md) | Custom Drain 3.0 prefix-tree log parser |
| **07** | [07-anomaly-detection-subsystem.md](07-anomaly-detection-subsystem.md) | Streaming EWMA/MAD statistical bounds & Isolation Forest |
| **08** | [08-correlation-engine.md](08-correlation-engine.md) | Sliding window multi-service event correlation |
| **09** | [09-incident-data-model-and-lifecycle-state-machine.md](09-incident-data-model-and-lifecycle-state-machine.md) | Incident states, schema, transitions, and evidence bundles |
| **10** | [10-classification-and-severity-scoring.md](10-classification-and-severity-scoring.md) | Threat taxonomy and explainable severity scoring |
| **11** | [11-retrieval-subsystem-similar-incident-search.md](11-retrieval-subsystem-similar-incident-search.md) | Hybrid BM25 & dense vector incident retrieval |
| **12** | [12-agentic-investigation-layer.md](12-agentic-investigation-layer.md) | LLM forensic investigator & sandboxed tool contracts |
| **13** | [13-action-gating-and-human-approval-workflow.md](13-action-gating-and-human-approval-workflow.md) | Human-in-the-loop gating & mitigation allow-lists |
| **14** | [14-audit-trail-and-evidence-timeline.md](14-audit-trail-and-evidence-timeline.md) | Cryptographic SHA-256 hash-chained audit logging |
| **15** | [15-dashboard-and-ui.md](15-dashboard-and-ui.md) | SOC Mission-Control Command Center specifications |
| **16** | [16-notifications-and-escalation.md](16-notifications-and-escalation.md) | Telegram audio calls, bot alerts, and webhooks |
| **17** | [17-knowledge-base-and-post-incident-documentation.md](17-knowledge-base-and-post-incident-documentation.md) | Automated runbooks and post-mortem generation |
| **18** | [18-evaluation-harness-and-metrics.md](18-evaluation-harness-and-metrics.md) | Precision, recall, F1, and hallucination evaluation |
| **19** | [19-week-by-week-build-plan.md](19-week-by-week-build-plan.md) | Implementation roadmap and milestone phases |
| **20** | [20-risk-register-and-fallback-plan.md](20-risk-register-and-fallback-plan.md) | Risk analysis, mitigation strategies, and graceful degradation |
| **21** | [21-demo-script-for-evaluators.md](21-demo-script-for-evaluators.md) | Evaluator walkthrough script & live attack scenarios |
| **22** | [22-appendix.md](22-appendix.md) | REST endpoints, SQLite DB DDL, and file layout |
