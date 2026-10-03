# PART 16 — NOTIFICATIONS AND ESCALATION

## 16.1 Minimum viable implementation

- In-app notification bell for new incidents and pending approvals.
- Email or a webhook (e.g., to a Slack/Discord channel) for high/critical severity incidents — this is easy to add and demonstrates the "notifications and escalation alerts" deliverable concretely.
- Escalation rule: if a `high` or `critical` incident sits in `awaiting_approval` for longer than a configurable threshold (e.g., 5 minutes) without human action, send a follow-up/escalation notification and optionally reassign.

---
