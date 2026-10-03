# PART 18 — EVALUATION HARNESS AND METRICS

## 18.1 Why this section matters most

Most student submissions for a project like this stop at "it works in the demo." A quantified evaluation section, with ground truth and clear numbers, is what will differentiate yours. Build the harness early, not at the end, so you have time to iterate on the numbers.

## 18.2 Ground truth

Your attack scripts (Part 4.3) already log exact start/end times, type, and source IP for every attack run. This is your label set. Store it as a simple table: `attack_id, type, start, end, source_ip, target`.

## 18.3 Detection metrics

- **Precision/Recall**: for each time window, does the detector's anomaly flag overlap with a labeled attack window? Compute standard precision, recall, F1 across a full evaluation run (e.g., 2 hours of baseline traffic interspersed with 10-15 labeled attacks of each type).
- **Time-to-detect**: for each attack, the delay between its labeled start time and the first incident created that correlates to it (same source IP/time window). Report mean and p95.

## 18.4 Classification and severity metrics

- Classification accuracy against the labeled attack type.
- Severity score sanity check: are critical/high incidents reliably the ones with the largest blast radius or clearest success indicators in your labeled set? A simple correlation between severity score and labeled attack impact (e.g., "successful login achieved" vs "no success") is a good sanity metric.

## 18.5 RCA metrics

- **Top-1 / Top-3 accuracy**: does the agent's highest-ranked (or any of its top-3) hypothesis match the actual injected cause? Compute this across all labeled incidents.

## 18.6 Retrieval metrics

- Recall@3 and Recall@5 for similar-incident retrieval, as described in Part 11.3.

## 18.7 Hallucination rate

- Fraction of agent citations that fail the evidence-existence/support check described in Part 12.5. Report this explicitly; a low but nonzero number is more credible than claiming zero.

## 18.8 False-positive test

- Run a legitimate traffic surge (simulate a flash-sale-like spike with your baseline generator, no actual attack) and confirm the system does not raise it to the same severity/classification as a real attack. Report whether it correctly stays "low" severity or gets suppressed as a false positive, and why.

## 18.9 Ablations to include

- Statistical-only vs Isolation-Forest-only vs combined detection (Part 7.5).
- Rule-based vs ML classification (Part 10.1).
- BM25-only vs embedding-only vs hybrid retrieval (Part 11.3).

Presenting these as a small table in your report is one of the highest-value, lowest-effort additions you can make — it directly demonstrates rigorous, from-first-principles thinking rather than "I called an API and it worked."

---
