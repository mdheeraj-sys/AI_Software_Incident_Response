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
