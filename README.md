# AI Software Incident Response Agent

An end-to-end autonomous incident response platform that ingests application telemetry, parses noisy raw logs into structured templates using a from-scratch **Drain 3.0** algorithm, detects anomalies with a combined **EWMA/MAD + Isolation Forest** model, correlates multi-service signals into unified incidents, investigates them with a **bounded-tool agent**, and gates sensitive mitigations behind **human approval** with a **tamper-proof SHA-256 hash-chained audit log**.

---

## Architecture Overview

```
                      [ Attacker Simulation / VM-A ]
       (Hydra Brute Force, SQLMap Injection, Gobuster Directory Scan)
                                   │
                                   ▼
                       [ Victim App / VM-B :8000 ]
             (FastAPI, SQLite, Telemetry Logger, Fault Injections)
                                   │
                      (Streaming JSON Log Files)
                                   │
                                   ▼
                 [ Autonomous Agent Platform / :9000 ]
  ┌──────────────────────────────────────────────────────────────────┐
  │ 1. From-scratch Drain 3.0 Tree Log Parser                        │
  │ 2. Two-Tier Anomaly Detector (EWMA/MAD + Isolation Forest)       │
  │ 3. Correlation Engine & Explainable Severity Scorer              │
  │ 4. Investigation Layer (5 Bounded Forensic Tools)                │
  │ 5. Human-in-the-Loop Gating & Allow-listed Action Executor       │
  │ 6. Cryptographic SHA-256 Hash-Chained Audit Trail                │
  └──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
         [ SOC Command Center Dashboard (WebSocket + REST) ]
```

---

## Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Victim Application (Terminal 1)
```bash
uvicorn victim_app.main:app --port 8000
```
*Victim API is now live at `http://127.0.0.1:8000` (Docs at `/docs`).*

### 3. Start the Autonomous Agent Platform (Terminal 2)
```bash
uvicorn agent_platform.api.server:app --port 9000
```
*Platform & Dashboard live at `http://127.0.0.1:9000/dashboard`.*

### 4. Start Normal Background Traffic Generator (Terminal 3)
```bash
python victim_app/traffic_generator.py
```
*Generates Poisson-distributed legitimate user traffic.*

### 5. Launch Simulated Attacks (Terminal 4)
```bash
# Credential Brute Force Attack
python attack_scripts/attack_runner.py brute

# SQL Injection Probing
python attack_scripts/attack_runner.py sqli

# Directory Scanning
python attack_scripts/attack_runner.py scan

# Bad Deploy Regression Fault
python attack_scripts/attack_runner.py deploy
```

### 6. Review Live Command Center
Open **`http://127.0.0.1:9000/dashboard`** in your browser:
- Watch the live telemetry feed stream in real-time.
- See the Drain parser categorize log templates.
- Watch incident alerts trigger when anomalies spike.
- Click **Approve Action** on sensitive mitigations (e.g. `block_ip`).
- Verify in Terminal 4 that the attacker's subsequent requests are immediately blocked (HTTP 403)!

### 7. Run Quantitative Evaluation Harness
```bash
python evaluation/run_eval.py
```
Computes Precision, Recall, F1 score, Root-Cause Classification Accuracy, and Evidence Citation Hallucination Rate against ground truth.

---

## Running Unit Tests
```bash
python -m pytest tests/test_core.py
```
