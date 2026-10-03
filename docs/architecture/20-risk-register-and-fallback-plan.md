# PART 20 — RISK REGISTER AND FALLBACK PLAN

| Risk | Likelihood | Mitigation |
|---|---|---|
| LLM API latency/cost makes live demo slow | Medium | Cache a known-good investigation result for your primary demo attack as a fallback; still show live calls for a secondary, smaller attack |
| Drain parser mis-tunes and over/under-fragments templates | Medium | Validate early (Week 2) on real baseline data before building anything on top of it |
| Slow-and-low brute force evades detection | High (by design, Part 4.2.5) | Document as a known limitation with a proposed fix; do not hide it — identifying your own system's blind spot is a strength in a defense |
| Running out of time before the agentic layer | Medium | Weeks 1-5 alone produce a complete, demoable deterministic system (see Week 5 note); the agent is an enhancement, not a dependency |
| Evaluation numbers look weak | Medium | Report them honestly with explanation; a modest F1 with a clear discussion of why beats an unverifiable claim of near-perfect detection |
| VM networking misconfiguration exposes dashboard to attacker VM | Low but embarrassing in a demo | Verify firewall rules explicitly before every demo run, not just once at setup |

---
