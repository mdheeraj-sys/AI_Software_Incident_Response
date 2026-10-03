# PART 14 — AUDIT TRAIL AND EVIDENCE TIMELINE

## 14.1 What must be in the audit trail

Every state transition, every tool call the agent makes, every hypothesis generated, every action proposed, every human decision, and every execution result. Nothing is deleted or overwritten; corrections are new entries referencing the old one.

## 14.2 Evidence timeline UI

A chronological view per incident: raw log lines (with template IDs), anomaly flags with their scores, correlation grouping decisions, agent tool calls and their results, hypotheses as they were generated, and human actions — all on one scrollable timeline with timestamps. This single view answers "show me everything that happened" for both your evaluators and, in a real deployment, for compliance review.

---
