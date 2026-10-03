# PART 10 — CLASSIFICATION AND SEVERITY SCORING

## 10.1 Classification approach

Start rule-based, since your incident types are well-defined and the rules are explainable (a requirement) — this is more defensible than a black-box classifier for a system whose whole point is explainability:

```
if failed_login_rate_anomaly and distinct_usernames_per_ip > threshold:
    classification = "credential_stuffing"
elif failed_login_rate_anomaly and distinct_usernames_per_ip <= threshold:
    classification = "brute_force"
elif new_template_rate_anomaly and sql_metacharacter_ratio > threshold:
    classification = "sqli_attempt"
elif distinct_paths_per_ip_anomaly and status_404_ratio_anomaly:
    classification = "scanning"
elif rps_anomaly and latency_anomaly and not deploy_event_recent:
    classification = "flood_or_dos"
elif error_rate_anomaly and deploy_event_recent:
    classification = "bad_deploy"
elif resource_metric_anomaly:
    classification = "resource_exhaustion"
else:
    classification = "unknown"
```

If time allows, add a secondary ML classifier (e.g., a small gradient-boosted tree) trained on your labeled incidents as a comparison point in the evaluation section — report rule-based vs ML accuracy, which, again, doubles as an ablation.

## 10.2 Severity scoring formula

Make this fully transparent, a weighted sum of normalized sub-scores, so every severity number is explainable in one sentence:

```
severity_score = (
    0.35 * blast_radius_score      # fraction of users/services affected
  + 0.25 * success_indicator_score # e.g., a 200 after many 401s = likely successful breach
  + 0.20 * service_criticality     # weight by which service is hit (auth/db > static assets)
  + 0.20 * volume_score            # magnitude of the anomaly relative to baseline
)

if severity_score >= 0.8: severity = "critical"
elif severity_score >= 0.6: severity = "high"
elif severity_score >= 0.35: severity = "medium"
else: severity = "low"
```

Each sub-score should be computable from the incident candidate object and log directly into the incident record alongside the final number, so a human reviewing the incident can see the breakdown, not just the label.

---
