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
