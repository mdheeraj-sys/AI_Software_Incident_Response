# PART 6 — LOG PARSING SUBSYSTEM (DRAIN ALGORITHM, FROM SCRATCH)

## 6.1 Why parsing matters

Raw log lines like `401 POST /login user=admin ip=10.10.10.11` and `401 POST /login user=bob ip=10.10.10.11` are different strings but the *same event type* with different parameters. Everything downstream — anomaly detection, correlation, "is this a new kind of event" — works far better on template IDs than on raw strings. This is also one of the two or three places in the project where implementing something from scratch (rather than calling a library) will visibly demonstrate understanding.

## 6.2 The Drain algorithm, explained simply

Drain organizes known templates into a fixed-depth tree:

1. Root node branches by log length (number of tokens), since lines with different token counts are almost always different templates.
2. Next few levels branch by the first few tokens, which are usually stable (e.g., the log level, the HTTP method).
3. Leaf nodes hold a small list of candidate templates. A new line is compared token-by-token against each candidate; if the fraction of matching tokens exceeds a similarity threshold, it's a match, and positions that differ become wildcards (`<*>`) in the template.
4. If no candidate matches well enough, a new template is created.

## 6.3 From-scratch implementation outline (pseudocode)

```
class DrainParser:
    def __init__(self, max_depth=4, sim_threshold=0.5, max_children=100):
        self.root = Node()
        self.max_depth = max_depth
        self.sim_threshold = sim_threshold
        self.templates = {}  # template_id -> list of tokens with wildcards
        self.next_id = 0

    def parse(self, line):
        tokens = preprocess_and_tokenize(line)
        length = len(tokens)
        node = self.root.get_or_create_child(length)

        depth = 1
        current = node
        for token in tokens[: self.max_depth - 1]:
            current = current.get_or_create_child(token)
            depth += 1

        candidates = current.leaf_templates  # small list
        best_match, best_score = None, 0
        for template_id in candidates:
            score = token_similarity(self.templates[template_id], tokens)
            if score > best_score:
                best_match, best_score = template_id, score

        if best_match is not None and best_score >= self.sim_threshold:
            self.templates[best_match] = merge_with_wildcards(
                self.templates[best_match], tokens
            )
            return best_match, extract_params(self.templates[best_match], tokens)
        else:
            new_id = self.next_id
            self.next_id += 1
            self.templates[new_id] = tokens
            current.leaf_templates.append(new_id)
            return new_id, {}
```

```
def token_similarity(template_tokens, line_tokens):
    if len(template_tokens) != len(line_tokens):
        return 0
    matches = sum(
        1 for t, l in zip(template_tokens, line_tokens)
        if t == "<*>" or t == l
    )
    return matches / len(template_tokens)

def merge_with_wildcards(template_tokens, line_tokens):
    return [
        t if t == l else "<*>"
        for t, l in zip(template_tokens, line_tokens)
    ]
```

## 6.4 Preprocessing rules specific to your log sources

- Mask IPs, timestamps, and numeric IDs with placeholder tokens *before* tokenizing, so the tree doesn't fragment into thousands of near-duplicate branches. But keep the original values available in `fields` for correlation — masking is for template matching only, not for discarding information.
- Treat nginx access logs, app JSON logs, and auth logs as separate parsing namespaces (separate Drain trees), since mixing wildly different formats into one tree degrades matching quality.

## 6.5 Validating the parser

Before trusting it for anomaly detection, validate manually: run it over a day of normal baseline traffic and a sample of each attack type, and confirm that:

- Normal traffic collapses into a small, stable set of templates (tens, not thousands)
- Each attack type produces either a genuinely new template (e.g., SQL injection payloads) or a sharp spike in an existing template's frequency (e.g., 401 on `/login`)
- The number of templates stabilizes over time rather than growing unboundedly (a sign your similarity threshold or masking is miscalibrated)

## 6.6 What "new template" tells you

A line that creates a brand-new template ID is itself a weak anomaly signal — it is something the parser has never seen before. Track a "new template rate" per time window as one of your detector's input features; a burst of new templates (e.g., from sqlmap's unusual payloads) is often a stronger and earlier signal than volume-based features alone.

---
