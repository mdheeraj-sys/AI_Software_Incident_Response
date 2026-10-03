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
