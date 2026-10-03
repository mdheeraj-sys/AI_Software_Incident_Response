# AI Incident Response — AI Software Incident Response Agent
## Full Architecture and Build Plan

---

# PART 0 — DOCUMENT MAP

This document is organized so you can build the system in the order it is written.

1. System overview and design philosophy
2. Two-VM lab topology and network design
3. Victim application architecture
4. Attacker VM toolkit and attack catalog
5. Telemetry and log schema
6. Log parsing subsystem (Drain algorithm, from scratch)
7. Anomaly detection subsystem (statistical + ML)
8. Correlation engine
9. Incident data model and lifecycle state machine
10. Classification and severity scoring
11. Retrieval subsystem (similar incident search)
12. Agentic investigation layer (LLM + tools)
13. Action gating and human-approval workflow
14. Audit trail and evidence timeline
15. Dashboard and UI
16. Notifications and escalation
17. Knowledge base and post-incident documentation
18. Evaluation harness and metrics
19. Week-by-week build plan
20. Risk register and fallback plan
21. Demo script for evaluators
22. Appendix: API contracts, DB schema, file layout

---

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

# PART 2 — TWO-VM LAB TOPOLOGY AND NETWORK DESIGN

## 2.1 Network diagram (described)

Both VMs sit on a single host-only or internal virtual network, isolated from the internet and from your host's regular LAN. No bridged networking, no port forwarding to the outside world. This is a closed lab.

```
                 Host machine (hypervisor: VirtualBox / VMware / libvirt)
  ┌───────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │   Internal / Host-only network: 10.10.10.0/24                      │
  │                                                                     │
  │   ┌────────────────────┐              ┌────────────────────────┐  │
  │   │  VM-A: Attacker     │   attacks    │  VM-B: Victim + Agent  │  │
  │   │  10.10.10.11        │ ───────────► │  10.10.10.12            │  │
  │   │  Kali or Ubuntu     │              │  nginx :80              │  │
  │   │  Hydra, sqlmap,     │              │  app :8000              │  │
  │   │  nikto, hey, gobuster│             │  agent/dashboard :9000  │  │
  │   │                      │              │  (mgmt-only bind)       │  │
  │   └────────────────────┘              └────────────────────────┘  │
  │                                                                     │
  └───────────────────────────────────────────────────────────────────┘
```

## 2.2 Why the dashboard port is "management-only"

Bind the agent dashboard (port 9000) to an interface or address the attacker VM cannot reach, or at minimum put it behind a separate iptables rule that only allows your host's management IP. This matters for two reasons: it is realistic (real SOC dashboards are never exposed to the thing they are monitoring), and it protects your demo — a stray attack script should never be able to accidentally hit your own dashboard.

## 2.3 VM specs (minimum workable)

- VM-A: 2 vCPU, 2 GB RAM, Kali Linux or Ubuntu with security tools installed.
- VM-B: 4 vCPU, 8 GB RAM (the LLM calls happen over the network to an API, so local compute needs are modest; this budget is mostly for running nginx + app + Postgres + the detection pipeline + log generator concurrently).

## 2.4 Clock synchronization

Make sure both VMs are NTP-synced to the same source, or at minimum to the host clock. Your entire evaluation methodology depends on timestamp correlation between "attack launched at VM-A" and "incident detected at VM-B." A clock skew of even a few seconds will corrupt your time-to-detect measurements.

## 2.5 Snapshotting

Take a clean snapshot of both VMs after initial setup, before you start running attacks. This lets you reset to a known-good state between demo runs and between evaluation trials, which you will want to do many times.

---

# PART 3 — VICTIM APPLICATION ARCHITECTURE

## 3.1 Why build your own app instead of using DVWA or Juice Shop

Pre-built vulnerable apps are fine for attack practice but their logs are not under your control, which makes building a custom parser and detector harder to demonstrate cleanly. Writing a small app yourself means:

- You control the exact log format, so your parser design is a real decision you can defend, not something forced on you by someone else's logging library.
- You can inject custom fault scenarios (slow DB query, memory leak, bad deploy) that a generic vulnerable app won't have.
- It is small enough to fully understand and explain during your defense.

## 3.2 Minimum feature set

- User registration and login (so brute force and credential stuffing have a real target)
- A search endpoint backed by a database query (so SQL injection has a real target — you can intentionally leave it unparameterized for the lab, clearly commented as intentionally vulnerable)
- A handful of CRUD endpoints (so scanning/enumeration has real surface area)
- An admin endpoint requiring elevated privilege (so "unusual access" scenarios are possible)
- A simple health/metrics endpoint

## 3.3 Suggested stack

- Backend: FastAPI (Python) or Express (Node) — either is fine, pick whichever you're faster in
- Database: PostgreSQL
- Reverse proxy: nginx in front of the app, because nginx's access log format is a well-known, realistic artifact and gives you a clean separation between "network-level" signals (status codes, paths, rates) and "application-level" signals (business logic errors, slow queries)
- Process manager: systemd or a simple supervisor script, so you can reliably start/stop/restart during fault injection

## 3.4 Fault injection hooks

Build explicit, scriptable fault triggers into the app, exposed only on localhost or via an internal admin flag, never attacker-reachable:

- `inject_slow_query(duration_ms)` — simulate a slow DB query by sleeping inside a query handler
- `inject_memory_leak(rate)` — allocate and retain memory at a controlled rate
- `inject_bad_deploy()` — toggle a code path to return 500s for a subset of requests, simulating a bad release
- `inject_db_pool_exhaustion(max_connections)` — artificially shrink the connection pool

These let you demonstrate the "non-attack" incident types (the problem statement is about *software incidents* broadly, not only security attacks) and let you build a false-positive test: a legitimate traffic surge should not be classified the same as an attack.

## 3.5 Baseline traffic generator

This is not optional. Without realistic background traffic, every anomaly you inject is trivially detectable by a threshold on request count, and your detector proves nothing. Build a script that:

- Simulates N concurrent "normal users" hitting the app with realistic request mixes (login, search, browse, occasional errors from fat-fingered input)
- Runs continuously in the background during both development and evaluation
- Has a small amount of natural randomness in timing and volume (Poisson-ish arrivals) so your statistical baseline has something real to model

---

# PART 4 — ATTACKER VM TOOLKIT AND ATTACK CATALOG

## 4.1 Toolkit to install on VM-A

- `hydra` — credential brute forcing
- `sqlmap` — SQL injection detection and exploitation
- `nikto` — web server vulnerability scanning
- `gobuster` or `dirb` — directory/endpoint enumeration
- `hey` or `ab` (Apache Bench) — HTTP load generation for flood/DoS-style scenarios
- `curl` / custom Python scripts — for anything bespoke (slow-and-low brute force, logic abuse)

## 4.2 Attack catalog with ground-truth labeling requirements

For every attack you run, record: attack type, start timestamp, end timestamp, source IP, target endpoint, and tool/command used. This is your ground truth file and your entire evaluation depends on it being precise.

### 4.2.1 Credential brute force / stuffing

- Tool: `hydra -l admin -P wordlist.txt 10.10.10.12 http-post-form "/login:user=^USER^&pass=^PASS^:F=incorrect"`
- Expected signal: burst of 401/403 responses on `/login`, concentrated on one source IP, many distinct usernames or many distinct passwords for one username in a short window
- Variant: credential stuffing uses a list of real username:password pairs (simulate with a small custom list) rather than a wordlist against one account — the log signature differs (many distinct accounts, one attempt each, versus one account, many attempts) and your detector should be able to distinguish the two

### 4.2.2 SQL injection probing and exploitation

- Tool: `sqlmap -u "http://10.10.10.12/search?q=test" --batch --level=3`
- Expected signal: query strings containing SQL metacharacters, a spike in 500-level responses, new log *templates* appearing (the parser should flag these as never-seen-before patterns) and possibly a change in DB error log volume

### 4.2.3 Directory and endpoint scanning

- Tool: `gobuster dir -u http://10.10.10.12 -w common.txt`
- Expected signal: a burst of 404s across many distinct paths from a single source IP in a short window, high "path entropy" per source

### 4.2.4 Request flood / availability attack

- Tool: `hey -z 60s -c 50 http://10.10.10.12/search?q=x`
- Expected signal: RPS spike well above baseline, latency increase, possibly connection pool exhaustion correlating with your fault-injection signal

### 4.2.5 Slow-and-low brute force (evasion attempt)

- Tool: custom Python script spacing login attempts 10-30 seconds apart from a rotating small set of source ports (same IP)
- Expected signal: this is the hard case — your statistical baseline needs a long enough window and a per-account (not just per-IP) failed-login counter to catch it, since the per-minute rate alone will look normal. Document this as a known limitation if your detector misses it, and explain what longer-horizon feature engineering would fix it. Being honest about a detector's blind spot is more credible than claiming it catches everything.

### 4.2.6 Post-exploit / anomalous legitimate-looking access

- Manual: after a successful brute force, log in as the compromised account and hit the admin endpoint, or access the account from an unusual hour
- Expected signal: rare log template (first time this account has hit `/admin`), or access outside the account's historical usage pattern

## 4.3 Attack scripting for reproducibility

Wrap every attack in a shell script that logs its own start/end time to a shared ground-truth file (e.g., append a CSV line to a file on VM-A, or POST to a small logging endpoint on a third isolated channel). This makes your evaluation runs repeatable and removes manual-timing error from your metrics.

---

# PART 5 — TELEMETRY AND LOG SCHEMA

## 5.1 Log sources

1. nginx access log (every HTTP request: timestamp, source IP, method, path, status, response time, bytes)
2. nginx error log (upstream errors, timeouts)
3. Application log (structured JSON: timestamp, level, service, event, user_id if applicable, message, trace_id)
4. Auth log (login attempts: timestamp, username, source IP, success/failure, reason)
5. Database log (slow queries, connection pool stats, errors)
6. Deploy/config-change event feed (timestamp, service, change description, actor) — this can be as simple as a manually-appended JSON lines file you write to every time you toggle a fault or restart a service; in a real system this would come from your CI/CD pipeline

## 5.2 Canonical internal log record format

Normalize every source into one internal schema before anything downstream touches it:

```json
{
  "timestamp": "2026-10-03T10:15:32.401Z",
  "source": "nginx_access | app | auth | db | deploy",
  "service": "web | api | db | auth",
  "raw": "<original line, preserved for audit>",
  "template_id": null,
  "fields": {
    "ip": "10.10.10.11",
    "method": "POST",
    "path": "/login",
    "status": 401,
    "response_time_ms": 42,
    "user": "admin",
    "trace_id": "abc123"
  }
}
```

`template_id` is filled in by the parser (Part 6). `fields` is source-specific; not every field applies to every source.

## 5.3 Ingestion mechanism

For a lab project, file-tailing is simpler and more defensible than standing up Kafka. Use a lightweight tailer (Python `watchdog` or a simple polling loop) per log file, normalize each new line into the canonical schema, and push it onto an internal queue (even an in-process `asyncio.Queue` or a Redis list is fine) for the parser to consume. Document that a production version would use Fluent Bit or Vector feeding into Kafka, but justify the simpler choice for a lab-scale project: it is correct, testable, and avoids operational complexity that adds no evaluative value here.

---

# PART 6 — LOG PARSING SUBSYSTEM (DRAIN ALGORITHM, FROM SCRATCH)

## 6.1 Why parsing matters

Raw log lines like `401 POST /login user=admin ip=10.10.10.11` and `401 POST /login user=bob ip=10.10.10.11` are different strings but the *same event type* with different parameters. Everything downstream — anomaly detection, correlation, "is this a new kind of event" — works far better on template IDs than on raw strings. This is also one of the two or three places in the project where implementing something from scratch (rather than calling a library) will visibly demonstrate understanding.

## 6.2 The Drain algorithm, explained simply

Drain organizes known templates into a fixed-depth tree:

1. Root node branches by log length (number of tokens), since lines with different token counts are almost always different templates.
2. Next few levels branch by the first few tokens, which are usually stable (e.g., the log level, the HTTP method).
3. Leaf nodes hold a small list of candidate templates. A new line is compared token-by-token against each candidate; if the fraction of matching tokens exceeds a similarity threshold, it's a match, and positions that differ become wildcards (`<*>`) in the template.
4. If no candidate matches well enough, a new template is created.

## 6.3 From-scratch implementation outline (pseudocode)

```
class DrainParser:
    def __init__(self, max_depth=4, sim_threshold=0.5, max_children=100):
        self.root = Node()
        self.max_depth = max_depth
        self.sim_threshold = sim_threshold
        self.templates = {}  # template_id -> list of tokens with wildcards
        self.next_id = 0

    def parse(self, line):
        tokens = preprocess_and_tokenize(line)
        length = len(tokens)
        node = self.root.get_or_create_child(length)

        depth = 1
        current = node
        for token in tokens[: self.max_depth - 1]:
            current = current.get_or_create_child(token)
            depth += 1

        candidates = current.leaf_templates  # small list
        best_match, best_score = None, 0
        for template_id in candidates:
            score = token_similarity(self.templates[template_id], tokens)
            if score > best_score:
                best_match, best_score = template_id, score

        if best_match is not None and best_score >= self.sim_threshold:
            self.templates[best_match] = merge_with_wildcards(
                self.templates[best_match], tokens
            )
            return best_match, extract_params(self.templates[best_match], tokens)
        else:
            new_id = self.next_id
            self.next_id += 1
            self.templates[new_id] = tokens
            current.leaf_templates.append(new_id)
            return new_id, {}
```

```
def token_similarity(template_tokens, line_tokens):
    if len(template_tokens) != len(line_tokens):
        return 0
    matches = sum(
        1 for t, l in zip(template_tokens, line_tokens)
        if t == "<*>" or t == l
    )
    return matches / len(template_tokens)

def merge_with_wildcards(template_tokens, line_tokens):
    return [
        t if t == l else "<*>"
        for t, l in zip(template_tokens, line_tokens)
    ]
```

## 6.4 Preprocessing rules specific to your log sources

- Mask IPs, timestamps, and numeric IDs with placeholder tokens *before* tokenizing, so the tree doesn't fragment into thousands of near-duplicate branches. But keep the original values available in `fields` for correlation — masking is for template matching only, not for discarding information.
- Treat nginx access logs, app JSON logs, and auth logs as separate parsing namespaces (separate Drain trees), since mixing wildly different formats into one tree degrades matching quality.

## 6.5 Validating the parser

Before trusting it for anomaly detection, validate manually: run it over a day of normal baseline traffic and a sample of each attack type, and confirm that:

- Normal traffic collapses into a small, stable set of templates (tens, not thousands)
- Each attack type produces either a genuinely new template (e.g., SQL injection payloads) or a sharp spike in an existing template's frequency (e.g., 401 on `/login`)
- The number of templates stabilizes over time rather than growing unboundedly (a sign your similarity threshold or masking is miscalibrated)

## 6.6 What "new template" tells you

A line that creates a brand-new template ID is itself a weak anomaly signal — it is something the parser has never seen before. Track a "new template rate" per time window as one of your detector's input features; a burst of new templates (e.g., from sqlmap's unusual payloads) is often a stronger and earlier signal than volume-based features alone.

---

# PART 7 — ANOMALY DETECTION SUBSYSTEM

## 7.1 Two-tier approach, and why

Tier 1 (statistical baselines) is fast, interpretable, and a strong baseline you can explain to a non-technical evaluator in one sentence: "if something is far outside its normal range, flag it." Tier 2 (Isolation Forest) catches multivariate anomalies the univariate statistical baselines miss — e.g., a combination of moderately elevated error rate *and* moderately elevated new-template rate, neither individually alarming, but together suspicious.

Running both and comparing them directly answers a likely evaluator question ("why not just use one method?") and gives you a built-in ablation for your evaluation section.

## 7.2 Feature engineering

Compute these per service, per fixed time window (suggest 30-second or 1-minute windows):

- Request count (RPS)
- Error rate (4xx rate, 5xx rate, separately)
- Mean and p95 response time
- Distinct source IP count
- Distinct path count hit per source IP (path entropy)
- Failed-login count, globally and per account
- New-template count (from the parser)
- DB connection pool utilization, DB error count

## 7.3 Tier 1: statistical baseline (EWMA / MAD)

For each feature, maintain an exponentially weighted moving average and an exponentially weighted estimate of deviation:

```
ewma = alpha * x_t + (1 - alpha) * ewma_prev
deviation = alpha * abs(x_t - ewma) + (1 - alpha) * deviation_prev
z_like_score = abs(x_t - ewma) / (deviation + epsilon)
```

Flag the window as anomalous on that feature if `z_like_score` exceeds a threshold (start with 3, tune empirically). Using median/MAD-style deviation rather than raw standard deviation makes this robust to the occasional legitimate spike (robust statistics resist being dragged off-course by the spikes they're supposed to detect).

Why EWMA over a fixed historical window: it adapts smoothly to genuine traffic pattern shifts (e.g., daily cycles) without needing to store and recompute over a sliding window array, and it's a well-understood, easily explained technique.

## 7.4 Tier 2: Isolation Forest

Feed the same per-window feature vector (all features together, not one at a time) into a scikit-learn `IsolationForest`. Train it on a baseline period containing only normal traffic (labeled using your ground-truth file — exclude windows during which you know an attack was running). Score every subsequent window; low (more negative) scores indicate anomalies.

```python
from sklearn.ensemble import IsolationForest

clf = IsolationForest(n_estimators=200, contamination=0.02, random_state=42)
clf.fit(baseline_feature_matrix)

scores = clf.decision_function(new_window_features)
anomaly_flag = scores < threshold
```

Isolation Forest's advantage here is specifically multivariate anomalies: it isolates outliers by how few random splits it takes to separate a point from the rest, which naturally captures "this combination of features is unusual" without you hand-engineering every combination rule.

## 7.5 Combining the two tiers

Report a window as anomalous if either tier flags it, but record *which* tier(s) fired as part of the incident's evidence — this becomes a natural explainability feature ("flagged by: failed-login rate 8.2 std devs above baseline, confirmed as multivariate outlier by Isolation Forest") and a natural ablation table for your evaluation (tier 1 alone vs tier 2 alone vs combined).

## 7.6 Per-source vs global features

Compute the IP-level and account-level features *in addition to* the global per-service features. Many attacks (brute force, scanning) are invisible in global aggregates but obvious when you slice by source IP. This is the single most common mistake in naive anomaly detection setups for this kind of project — don't only look at global traffic.

---

# PART 8 — CORRELATION ENGINE

## 8.1 Purpose

Raw anomaly flags arrive as a stream of small events (this IP's failed-login rate is high at 10:15:03, this IP's 404 rate is high at 10:15:04). A real incident is a *group* of related anomalies that together tell one story. Correlation turns dozens of flags into one incident object.

## 8.2 Correlation signals

- **Temporal proximity**: anomalies within the same or adjacent time windows are candidates for grouping.
- **Source identity**: same source IP, same account, or same trace/request ID strongly suggests relation.
- **Service dependency graph**: a small static graph you define (web → api → db) lets you reason that an anomaly in `db` (slow queries) likely explains a correlated anomaly in `api` (elevated latency) and `web` (elevated error rate) — rank the upstream service higher as the likely root, since failures propagate downstream.

## 8.3 Algorithm outline

```
def correlate(anomaly_events, window=120):
    anomaly_events.sort(by=timestamp)
    groups = []
    for event in anomaly_events:
        matched_group = find_group_where(
            groups,
            lambda g: (
                event.timestamp - g.last_timestamp <= window
                and (
                    event.source_ip == g.source_ip
                    or event.trace_id in g.trace_ids
                    or depends_on(event.service, g.services)
                )
            )
        )
        if matched_group:
            matched_group.add(event)
        else:
            groups.append(new_group(event))
    return [g for g in groups if len(g) >= MIN_GROUP_SIZE]
```

## 8.4 Output: the incident candidate object

Each group becomes an incident candidate containing: the set of anomaly events, the time span, the set of affected services, the set of source IPs/accounts involved, and the raw evidence IDs (log line references) backing each anomaly. This object is what gets handed to classification, scoring, and eventually the LLM agent — never raw logs.

---

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

# PART 10 — CLASSIFICATION AND SEVERITY SCORING

## 10.1 Classification approach

Start rule-based, since your incident types are well-defined and the rules are explainable (a requirement) — this is more defensible than a black-box classifier for a system whose whole point is explainability:

```
if failed_login_rate_anomaly and distinct_usernames_per_ip > threshold:
    classification = "credential_stuffing"
elif failed_login_rate_anomaly and distinct_usernames_per_ip <= threshold:
    classification = "brute_force"
elif new_template_rate_anomaly and sql_metacharacter_ratio > threshold:
    classification = "sqli_attempt"
elif distinct_paths_per_ip_anomaly and status_404_ratio_anomaly:
    classification = "scanning"
elif rps_anomaly and latency_anomaly and not deploy_event_recent:
    classification = "flood_or_dos"
elif error_rate_anomaly and deploy_event_recent:
    classification = "bad_deploy"
elif resource_metric_anomaly:
    classification = "resource_exhaustion"
else:
    classification = "unknown"
```

If time allows, add a secondary ML classifier (e.g., a small gradient-boosted tree) trained on your labeled incidents as a comparison point in the evaluation section — report rule-based vs ML accuracy, which, again, doubles as an ablation.

## 10.2 Severity scoring formula

Make this fully transparent, a weighted sum of normalized sub-scores, so every severity number is explainable in one sentence:

```
severity_score = (
    0.35 * blast_radius_score      # fraction of users/services affected
  + 0.25 * success_indicator_score # e.g., a 200 after many 401s = likely successful breach
  + 0.20 * service_criticality     # weight by which service is hit (auth/db > static assets)
  + 0.20 * volume_score            # magnitude of the anomaly relative to baseline
)

if severity_score >= 0.8: severity = "critical"
elif severity_score >= 0.6: severity = "high"
elif severity_score >= 0.35: severity = "medium"
else: severity = "low"
```

Each sub-score should be computable from the incident candidate object and log directly into the incident record alongside the final number, so a human reviewing the incident can see the breakdown, not just the label.

---

# PART 11 — RETRIEVAL SUBSYSTEM (SIMILAR INCIDENT SEARCH)

## 11.1 Why hybrid retrieval

Pure keyword search (BM25) misses semantically similar incidents phrased differently ("repeated failed logins" vs "credential stuffing attempt"). Pure embedding search can over-match on surface similarity and miss exact, important keyword overlaps (a specific error code, a specific endpoint name). Combining both and comparing is a clean, well-understood information-retrieval technique and a strong talking point.

## 11.2 Implementation sketch

- Index every closed incident's summary + classification + key evidence snippets.
- BM25: use a lightweight library (`rank_bm25` in Python) over tokenized incident text.
- Embeddings: embed incident summaries with a sentence-embedding model, store vectors (even a flat numpy array with cosine similarity is fine at lab scale — no need for a vector DB).
- Combine: normalize both score lists to [0,1] and take a weighted sum (e.g., 0.4 BM25 + 0.6 embedding, tune empirically), or use reciprocal rank fusion.

```python
def hybrid_search(query, k=5):
    bm25_scores = bm25_index.get_scores(tokenize(query))
    query_vec = embed(query)
    cos_scores = [cosine_similarity(query_vec, v) for v in incident_vectors]
    combined = [0.4 * normalize(b) + 0.6 * normalize(c)
                for b, c in zip(bm25_scores, cos_scores)]
    top_k = argsort(combined, descending=True)[:k]
    return [incidents[i] for i in top_k]
```

## 11.3 Evaluation of retrieval

Hold out a set of incidents, remove them from the index, and check whether querying with a near-duplicate (same attack type, different timing/IPs) retrieves them in the top-k. Report recall@3 and recall@5, and compare hybrid vs BM25-only vs embedding-only (your third ablation).

---

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

# PART 13 — ACTION GATING AND HUMAN-APPROVAL WORKFLOW

## 13.1 Action tiers, restated as enforcement rules

- Read-only actions: executed automatically, logged, never require approval.
- Reversible actions: executed automatically but flagged in the UI with a one-click undo, and logged.
- Sensitive actions: inserted into `recommended_actions` with status `proposed`; the executor service refuses to run anything in this tier unless its status is `approved` and `decided_by` is a non-null human identifier.

## 13.2 Executor design

The executor is a small, separate service with narrowly scoped permissions (e.g., it can only run a specific, parameterized iptables script, never an arbitrary shell command). This separation matters for your defense: even if the LLM's output were somehow manipulated (prompt injection via a malicious log line, for instance — worth mentioning as a threat you considered), the executor's allow-list of exact, parameterized actions limits the blast radius.

```python
ALLOWED_ACTIONS = {
    "block_ip": lambda ip: run(["iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"]),
    "unblock_ip": lambda ip: run(["iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"]),
    "rate_limit_ip": lambda ip, rate: configure_nginx_limit(ip, rate),
    "disable_account": lambda user: set_account_status(user, "disabled"),
}

def execute(action):
    if action.tier == "sensitive" and action.status != "approved":
        raise PermissionError("sensitive action requires approval")
    fn = ALLOWED_ACTIONS[action.action_type]
    result = fn(*action.params)
    log_audit(action, result)
    return result
```

## 13.3 Approval UI requirements

- Show the action, its tier, the rationale, and the linked evidence in one view.
- Require a single explicit click to approve or reject — no silent defaults, no auto-approve timers for sensitive actions.
- Record who approved/rejected and when, immutably.

---

# PART 14 — AUDIT TRAIL AND EVIDENCE TIMELINE

## 14.1 What must be in the audit trail

Every state transition, every tool call the agent makes, every hypothesis generated, every action proposed, every human decision, and every execution result. Nothing is deleted or overwritten; corrections are new entries referencing the old one.

## 14.2 Evidence timeline UI

A chronological view per incident: raw log lines (with template IDs), anomaly flags with their scores, correlation grouping decisions, agent tool calls and their results, hypotheses as they were generated, and human actions — all on one scrollable timeline with timestamps. This single view answers "show me everything that happened" for both your evaluators and, in a real deployment, for compliance review.

---

# PART 15 — DASHBOARD AND UI

## 15.1 Required views

- **Incident list**: sortable/filterable by status, severity, classification, time, assigned_to.
- **Incident detail**: summary, hypotheses with confidence and evidence links, recommended actions with approve/reject buttons, evidence timeline.
- **Live feed**: a real-time view (WebSocket or polling) showing new anomalies and incidents as they appear — this is what makes your demo compelling, watching the dashboard light up live as VM-A attacks.
- **Analytics**: incident counts over time by type and severity, mean time-to-detect, mean time-to-resolve, false-positive rate.
- **Knowledge base**: searchable list of past incidents and their resolutions (Part 17).

## 15.2 Suggested stack

A simple React frontend talking to a FastAPI/Express backend over REST plus one WebSocket channel for live updates is more than sufficient; do not over-invest here relative to the detection/agent layers, since the dashboard is the easiest part to evaluate at a glance and the hardest to actually add technical depth to.

---

# PART 16 — NOTIFICATIONS AND ESCALATION

## 16.1 Minimum viable implementation

- In-app notification bell for new incidents and pending approvals.
- Email or a webhook (e.g., to a Slack/Discord channel) for high/critical severity incidents — this is easy to add and demonstrates the "notifications and escalation alerts" deliverable concretely.
- Escalation rule: if a `high` or `critical` incident sits in `awaiting_approval` for longer than a configurable threshold (e.g., 5 minutes) without human action, send a follow-up/escalation notification and optionally reassign.

---

# PART 17 — KNOWLEDGE BASE AND POST-INCIDENT DOCUMENTATION

## 17.1 Auto-generated post-incident report

On closing an incident, have the agent generate a structured report from the incident's full record: what happened, how it was detected, root cause, actions taken, outcome, and a suggested runbook update if this was a new pattern. Store this as the canonical knowledge-base entry and feed it into the retrieval index (Part 11) for future similar-incident lookups — this closes the loop between "learn" and "investigate."

## 17.2 Runbook library

A small set of markdown runbooks per incident type (credential stuffing, SQLi, scanning, flood, bad deploy, resource exhaustion), referenced by `get_runbook` and shown to the human reviewer alongside the agent's recommendation. Seed this manually at first; let it grow from post-incident reports over time.

---

# PART 18 — EVALUATION HARNESS AND METRICS

## 18.1 Why this section matters most

Most student submissions for a project like this stop at "it works in the demo." A quantified evaluation section, with ground truth and clear numbers, is what will differentiate yours. Build the harness early, not at the end, so you have time to iterate on the numbers.

## 18.2 Ground truth

Your attack scripts (Part 4.3) already log exact start/end times, type, and source IP for every attack run. This is your label set. Store it as a simple table: `attack_id, type, start, end, source_ip, target`.

## 18.3 Detection metrics

- **Precision/Recall**: for each time window, does the detector's anomaly flag overlap with a labeled attack window? Compute standard precision, recall, F1 across a full evaluation run (e.g., 2 hours of baseline traffic interspersed with 10-15 labeled attacks of each type).
- **Time-to-detect**: for each attack, the delay between its labeled start time and the first incident created that correlates to it (same source IP/time window). Report mean and p95.

## 18.4 Classification and severity metrics

- Classification accuracy against the labeled attack type.
- Severity score sanity check: are critical/high incidents reliably the ones with the largest blast radius or clearest success indicators in your labeled set? A simple correlation between severity score and labeled attack impact (e.g., "successful login achieved" vs "no success") is a good sanity metric.

## 18.5 RCA metrics

- **Top-1 / Top-3 accuracy**: does the agent's highest-ranked (or any of its top-3) hypothesis match the actual injected cause? Compute this across all labeled incidents.

## 18.6 Retrieval metrics

- Recall@3 and Recall@5 for similar-incident retrieval, as described in Part 11.3.

## 18.7 Hallucination rate

- Fraction of agent citations that fail the evidence-existence/support check described in Part 12.5. Report this explicitly; a low but nonzero number is more credible than claiming zero.

## 18.8 False-positive test

- Run a legitimate traffic surge (simulate a flash-sale-like spike with your baseline generator, no actual attack) and confirm the system does not raise it to the same severity/classification as a real attack. Report whether it correctly stays "low" severity or gets suppressed as a false positive, and why.

## 18.9 Ablations to include

- Statistical-only vs Isolation-Forest-only vs combined detection (Part 7.5).
- Rule-based vs ML classification (Part 10.1).
- BM25-only vs embedding-only vs hybrid retrieval (Part 11.3).

Presenting these as a small table in your report is one of the highest-value, lowest-effort additions you can make — it directly demonstrates rigorous, from-first-principles thinking rather than "I called an API and it worked."

---

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

# PART 20 — RISK REGISTER AND FALLBACK PLAN

| Risk | Likelihood | Mitigation |
|---|---|---|
| LLM API latency/cost makes live demo slow | Medium | Cache a known-good investigation result for your primary demo attack as a fallback; still show live calls for a secondary, smaller attack |
| Drain parser mis-tunes and over/under-fragments templates | Medium | Validate early (Week 2) on real baseline data before building anything on top of it |
| Slow-and-low brute force evades detection | High (by design, Part 4.2.5) | Document as a known limitation with a proposed fix; do not hide it — identifying your own system's blind spot is a strength in a defense |
| Running out of time before the agentic layer | Medium | Weeks 1-5 alone produce a complete, demoable deterministic system (see Week 5 note); the agent is an enhancement, not a dependency |
| Evaluation numbers look weak | Medium | Report them honestly with explanation; a modest F1 with a clear discussion of why beats an unverifiable claim of near-perfect detection |
| VM networking misconfiguration exposes dashboard to attacker VM | Low but embarrassing in a demo | Verify firewall rules explicitly before every demo run, not just once at setup |

---

# PART 21 — DEMO SCRIPT FOR EVALUATORS

1. Show the topology diagram (Part 2.1) and explain the two-VM setup in one sentence.
2. Show VM-B's dashboard with the live feed, baseline traffic flowing, all quiet.
3. Switch to VM-A's terminal, run the brute-force attack script live.
4. Cut back to VM-B's dashboard: show the live feed lighting up with anomaly flags, then an incident appearing.
5. Open the incident detail view: walk through the classification, severity breakdown, the agent's hypothesis with cited evidence, and the recommended action.
6. Click "approve" on the block-IP action.
7. Switch back to VM-A and show the attacker's next request being refused/dropped.
8. Return to VM-B, show the incident auto-transitioning toward resolved, and open the evidence timeline to show the full audit trail of what just happened.
9. Close with the evaluation numbers: a one-slide table of precision/recall, time-to-detect, RCA accuracy, and the ablations.
10. End with the honestly-stated limitation (the slow-and-low brute force case) and what you'd do next — this reliably reads as maturity, not weakness, in a defense setting.

---

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
