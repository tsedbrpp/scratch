# Policy Prism — Validation & Limitations

This document summarises known limitations, failure modes, epistemic safeguards, and validation strategies for the Policy Prism analytical platform.

---

## 1. LLM-Specific Limitations

### 1.1 Length Refusal Paradox
**Affected components**: TLF meta-synthesis (both tracks), GNDP Pass 2/3.

Reasoning-optimised models (o1-series, GPT-5.1) consume their completion budget during internal chain-of-thought processing and frequently return empty responses with `finish_reason: length`. Policy Prism mitigates this by using **GPT-4o** for all structured extraction tasks, with a 4,000-token completion budget. This produces reliably formatted JSON but at the cost of potentially less theoretically nuanced interpretations compared to reasoning models.

### 1.2 Probabilistic Closure
LLMs tend to fill structural absences with plausible inferences, potentially inflating ghost node counts. The GNDP protocol mitigates this via:
- **Evidence gating**: E1/E2 candidates are automatically invalidated.
- **NegEx filtering**: Rule-based (non-LLM) pass prunes false positives.
- **Fuzzy trigram rescue**: Guards against false negatives from terminological variation.

### 1.3 Training Data Bias
LLM training corpora over-represent Global North governance norms. The GNDP explicitly prohibits assuming Western-centric governance norms in Pass 1B. However, subtle framing biases may persist in how actors, risks, and governance structures are interpreted.

### 1.4 Non-Determinism
LLM outputs are inherently non-deterministic. Identical inputs may produce somewhat different analytical outputs across runs. Mitigation: results are cached in Redis (86,400s TTL), ensuring reproducibility within a session. Cross-run consistency is not guaranteed.

---

## 2. Analytical Limitations

### 2.1 Temporal Snapshot
All analyses reflect the state of policy documents at the time of ingestion. The system does not automatically update for subsequent amendments, enforcement developments, or evolving judicial interpretation.

### 2.2 Context Compression
The TLF meta-synthesis operates on compressed summaries of prior analytical outputs. Information loss during compression may affect the granularity and nuance of findings. The compression logic aggressively strips raw evidence quotes, retaining only strategy-level descriptions and summary findings.

### 2.3 Parallel Architecture (TLF)
TLF Tracks 1 and 2 execute concurrently on the same context rather than sequentially. The structured extraction in Track 2 is not directly grounded in Track 1's qualitative reading within the same invocation. Consistency between outputs is achieved through shared context and post-hoc researcher review, not architectural dependency.

### 2.4 Jurisdiction Scope
The TLF extraction prompt includes configurable jurisdiction-scope rules. Different prompt configurations may be required for different jurisdiction groupings. Cross-jurisdictional claims must be validated across all configurations.

### 2.5 Ghost Node Speculation Boundary
The counterfactual power test (GNDP Pass 3) is intentionally speculative. All outputs are framed as conditional. However, users must exercise vigilance:
- Counterfactual scenarios should not be cited as empirical findings.
- The enforcement ladder is constrained (penalty steps require existing binding obligations when guidance is non-binding), but users should verify bindingness claims independently.

---

## 3. Epistemic Safeguards

| Safeguard | Implementation | Location |
|---|---|---|
| **Evidence Gating** | E1/E2 evidence grades automatically invalidate ghost node candidates | GNDP Pass 2 |
| **Quarantined Speculation** | Counterfactual reasoning structurally isolated from evidentiary assessment | GNDP Pass 3 (separate from Pass 2) |
| **Role Semantics** | Standing/obligation distinction prevents misattribution of duties to affected groups | GNDP Pass 3 prompt |
| **Analytical Challenges** | Every counterfactual scenario must include 2–4 acknowledged downsides | GNDP Pass 3 (mandatory field) |
| **Epistemic Partition** | Every proposition evaluation partitions evidence into grounded/inferred/unknown | GNDP Pass 3, TLF |
| **Anti-Bias Constraint** | "Do NOT assume Western-centric governance norms" | GNDP Pass 1B prompt |
| **Analyst Reflexive Assessment** | Three-criterion human evaluation with immutable provenance chain | Ghost Node assessment UI |
| **Positionality Recording** | Analyst records how their positionality may shape the reading | PositionalityDialog component |
| **Disagreement Preservation** | Analyst disagreements documented and retained, not resolved by editing | Provenance chain |
| **Cross-Stratum Triangulation** | Convergent findings across independently generated strata carry greater weight | TLF validation strategy |

---

## 4. Validation Strategy

### 4.1 Implemented Validation

| Type | Description | Status |
|---|---|---|
| Cross-stratum triangulation | Six independent analytical strata; convergent findings carry greater weight | ✅ Implemented |
| Evidence gating (GNDP) | E1/E2 → automatic invalidation | ✅ Implemented |
| NegEx filtering | Rule-based false-positive elimination | ✅ Implemented |
| Fuzzy trigram rescue | Guard against false negatives from terminological variation | ✅ Implemented |
| Analyst reflexive assessment | Three-criterion human evaluation with provenance | ✅ Implemented |
| Positionality recording | Analyst positionality captured before analysis | ✅ Implemented |
| Schema validation | Zod runtime validation of all LLM JSON outputs | ✅ Implemented |
| GNDP schema tests | Unit tests for schema compliance | ✅ Implemented |

### 4.2 External Validation (Not System-Automated)

| Type | Description | Status |
|---|---|---|
| Human evaluator triangulation | Ghost node detections independently evaluated by human raters in a blinded study protocol | External procedure |
| Inter-rater reliability | Formal agreement metrics across multiple analysts | Future work |
| External evaluator comparison | Comparison of system outputs against independent expert assessments | Future work |
| Longitudinal deployment tracking | Tracking analytical consistency over time and across policy updates | Future work |

---

## 5. Known Edge Cases

| Scenario | Behaviour | Mitigation |
|---|---|---|
| Very short documents (<500 words) | Insufficient context for meaningful ghost node detection | System warns; results should be treated as preliminary |
| Non-English documents | LLM analysis quality degrades for non-English policy texts | Currently English-only; multi-language support is future work |
| Highly technical standards (ISO, CEN) | Dense referential language may produce false negatives in ghost node detection | Fuzzy trigram rescue partially mitigates |
| Documents with extensive cross-references | Context compression may lose referential chains | Manual review recommended for heavily cross-referenced texts |
| Conflicting analyst assessments | Both assessments preserved; no automated resolution | Disagreement documented in provenance chain |

---

## 6. Cost & Performance

| Operation | Approx. Cost | Approx. Time |
|---|---|---|
| Single analysis (GPT-4o) | $0.05–0.20 | 30–90 seconds |
| GNDP full pipeline (4 passes) | $0.30–0.80 | 2–4 minutes |
| TLF meta-synthesis (dual track) | $0.15–0.40 | 60–120 seconds |
| Web search + trace processing | $0.01–0.05 | 10–30 seconds |
| Redis cache hit | $0.00 | <100ms |

---

*This document should be read alongside the [GNDP v1.0 Full Protocol](./GNDP_v1.0_full_protocol.md) for detailed descriptions of each safeguard mechanism.*
