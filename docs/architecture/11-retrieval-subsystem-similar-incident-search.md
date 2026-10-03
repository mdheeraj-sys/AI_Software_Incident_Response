# PART 11 — RETRIEVAL SUBSYSTEM (SIMILAR INCIDENT SEARCH)

## 11.1 Why hybrid retrieval

Pure keyword search (BM25) misses semantically similar incidents phrased differently ("repeated failed logins" vs "credential stuffing attempt"). Pure embedding search can over-match on surface similarity and miss exact, important keyword overlaps (a specific error code, a specific endpoint name). Combining both and comparing is a clean, well-understood information-retrieval technique and a strong talking point.

## 11.2 Implementation sketch

- Index every closed incident's summary + classification + key evidence snippets.
- BM25: use a lightweight library (`rank_bm25` in Python) over tokenized incident text.
- Embeddings: embed incident summaries with a sentence-embedding model, store vectors (even a flat numpy array with cosine similarity is fine at lab scale — no need for a vector DB).
- Combine: normalize both score lists to [0,1] and take a weighted sum (e.g., 0.4 BM25 + 0.6 embedding, tune empirically), or use reciprocal rank fusion.

```python
def hybrid_search(query, k=5):
    bm25_scores = bm25_index.get_scores(tokenize(query))
    query_vec = embed(query)
    cos_scores = [cosine_similarity(query_vec, v) for v in incident_vectors]
    combined = [0.4 * normalize(b) + 0.6 * normalize(c)
                for b, c in zip(bm25_scores, cos_scores)]
    top_k = argsort(combined, descending=True)[:k]
    return [incidents[i] for i in top_k]
```

## 11.3 Evaluation of retrieval

Hold out a set of incidents, remove them from the index, and check whether querying with a near-duplicate (same attack type, different timing/IPs) retrieves them in the top-k. Report recall@3 and recall@5, and compare hybrid vs BM25-only vs embedding-only (your third ablation).

---
