# PART 7 — ANOMALY DETECTION SUBSYSTEM

## 7.1 Two-tier approach, and why

Tier 1 (statistical baselines) is fast, interpretable, and a strong baseline you can explain to a non-technical evaluator in one sentence: "if something is far outside its normal range, flag it." Tier 2 (Isolation Forest) catches multivariate anomalies the univariate statistical baselines miss — e.g., a combination of moderately elevated error rate *and* moderately elevated new-template rate, neither individually alarming, but together suspicious.

Running both and comparing them directly answers a likely evaluator question ("why not just use one method?") and gives you a built-in ablation for your evaluation section.

## 7.2 Feature engineering

Compute these per service, per fixed time window (suggest 30-second or 1-minute windows):

- Request count (RPS)
- Error rate (4xx rate, 5xx rate, separately)
- Mean and p95 response time
- Distinct source IP count
- Distinct path count hit per source IP (path entropy)
- Failed-login count, globally and per account
- New-template count (from the parser)
- DB connection pool utilization, DB error count

## 7.3 Tier 1: statistical baseline (EWMA / MAD)

For each feature, maintain an exponentially weighted moving average and an exponentially weighted estimate of deviation:

```
ewma = alpha * x_t + (1 - alpha) * ewma_prev
deviation = alpha * abs(x_t - ewma) + (1 - alpha) * deviation_prev
z_like_score = abs(x_t - ewma) / (deviation + epsilon)
```

Flag the window as anomalous on that feature if `z_like_score` exceeds a threshold (start with 3, tune empirically). Using median/MAD-style deviation rather than raw standard deviation makes this robust to the occasional legitimate spike (robust statistics resist being dragged off-course by the spikes they're supposed to detect).

Why EWMA over a fixed historical window: it adapts smoothly to genuine traffic pattern shifts (e.g., daily cycles) without needing to store and recompute over a sliding window array, and it's a well-understood, easily explained technique.

## 7.4 Tier 2: Isolation Forest

Feed the same per-window feature vector (all features together, not one at a time) into a scikit-learn `IsolationForest`. Train it on a baseline period containing only normal traffic (labeled using your ground-truth file — exclude windows during which you know an attack was running). Score every subsequent window; low (more negative) scores indicate anomalies.

```python
from sklearn.ensemble import IsolationForest

clf = IsolationForest(n_estimators=200, contamination=0.02, random_state=42)
clf.fit(baseline_feature_matrix)

scores = clf.decision_function(new_window_features)
anomaly_flag = scores < threshold
```

Isolation Forest's advantage here is specifically multivariate anomalies: it isolates outliers by how few random splits it takes to separate a point from the rest, which naturally captures "this combination of features is unusual" without you hand-engineering every combination rule.

## 7.5 Combining the two tiers

Report a window as anomalous if either tier flags it, but record *which* tier(s) fired as part of the incident's evidence — this becomes a natural explainability feature ("flagged by: failed-login rate 8.2 std devs above baseline, confirmed as multivariate outlier by Isolation Forest") and a natural ablation table for your evaluation (tier 1 alone vs tier 2 alone vs combined).

## 7.6 Per-source vs global features

Compute the IP-level and account-level features *in addition to* the global per-service features. Many attacks (brute force, scanning) are invisible in global aggregates but obvious when you slice by source IP. This is the single most common mistake in naive anomaly detection setups for this kind of project — don't only look at global traffic.

---
