# PART 17 — KNOWLEDGE BASE AND POST-INCIDENT DOCUMENTATION

## 17.1 Auto-generated post-incident report

On closing an incident, have the agent generate a structured report from the incident's full record: what happened, how it was detected, root cause, actions taken, outcome, and a suggested runbook update if this was a new pattern. Store this as the canonical knowledge-base entry and feed it into the retrieval index (Part 11) for future similar-incident lookups — this closes the loop between "learn" and "investigate."

## 17.2 Runbook library

A small set of markdown runbooks per incident type (credential stuffing, SQLi, scanning, flood, bad deploy, resource exhaustion), referenced by `get_runbook` and shown to the human reviewer alongside the agent's recommendation. Seed this manually at first; let it grow from post-incident reports over time.

---
