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
