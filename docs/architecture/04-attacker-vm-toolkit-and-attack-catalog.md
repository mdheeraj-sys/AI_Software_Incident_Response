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
