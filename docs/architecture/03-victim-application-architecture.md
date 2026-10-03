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
