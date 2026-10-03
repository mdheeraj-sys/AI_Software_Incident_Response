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
