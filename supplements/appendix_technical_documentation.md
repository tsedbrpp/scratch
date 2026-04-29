# Appendix: Technical Documentation Index

**Supplementary Material A1 — Policy Prism Source Code and Technical Protocol**

The complete source code, technical protocol, prompt templates, schema definitions, and validation test suite for Policy Prism are available in a blinded repository for peer review:

> **Repository URL:** [https://anonymous.4open.science/r/scratch-41CE/](https://anonymous.4open.science/r/scratch-41CE/)

The repository contains the full implementation described in the manuscript, including the Ghost Node Detection Protocol (GNDP v1.1), all eight analytical strata, and the analyst assessment infrastructure. The following tables summarize the contents by category.

---

## A1.1 Protocol Documentation

These files document the Ghost Node Detection Protocol, evidence-grading rules, scoring dimensions, pipeline architecture, and analyst assessment criteria referenced in the manuscript.

| Document | Path | Description |
|---|---|---|
| Full Protocol (v1.1) | `supplements/GNDP_v1.1_full_protocol.md` | Complete six-pass pipeline specification: extraction, candidate synthesis, NegEx filtering, evidence grading, counterfactual analysis, and analyst review. Includes worked example (EU AI Act worker analysis), scoring tables, ghost typology, and evidence-grade definitions. |
| Full Protocol (v1.0) | `supplements/GNDP_v1.0_full_protocol.md` | Archived v1.0 protocol retained for backward compatibility with cached results. |
| Pass 1A — Extraction | `supplements/pass_1a_extraction.md` | Prompt template for structural extraction of formal actors, affected-population claims, and obligatory passage points. |
| Pass 1B — Candidate Synthesis | `supplements/pass_1b_candidates.md` | Prompt template for candidate synthesis via structural subtraction. Includes v1.1 subsumption pathway detection and three-gate evidentiary filter. |
| Pass 2 — Evidence Grading | `supplements/pass_2_deep_dive.md` | Prompt template for forensic evidence grading (E1–E4), weighted absence scoring (100-point scale), ghost typology assignment, and v1.1 schematic adequacy assessment. |
| Pass 3 — Counterfactual Analysis | `supplements/pass_3_counterfactual.md` | Prompt template for quarantined counterfactual reasoning with role semantics, enforcement ladders, and mandatory analytical challenges. |
| Validation and Limitations | `supplements/validation_and_limitations.md` | Epistemic safeguards, known limitations, and edge cases. |
| Schema Reference | `supplements/schema_reference.md` | JSON output schemas for all analytical types, including ghost node, TEA analysis, and ecosystem network. |
| System Architecture | `supplements/system_architecture_diagram.md` | Pipeline diagrams for the eight-layer analytical framework and GNDP v1.1 pipeline. |
| Prompt Registry | `supplements/prompt_registry_reference.md` | Registry of 36 prompt definitions across eight analytical strata. |
| Analytical Modes Inventory | `supplements/analytical_modes_inventory.md` | Inventory of all analytical modes with theoretical grounding, prompt IDs, source files, and output types. |

---

## A1.2 Source Code — Ghost Node Detection Pipeline

The core implementation of the GNDP pipeline described in the manuscript. All files are in `src/lib/ghost-nodes/`.

| File | Lines | Description |
|---|---|---|
| `types.ts` | 441 | TypeScript type definitions: ghost pathways, subsumption gates, schematic adequacy, score breakdowns, evidence grades, analyst assessment, and provenance chain types. |
| `schemas.ts` | 314 | Zod runtime validation schemas for all four pipeline passes. Enforces evidence-gating rules, score ranges, and output structure at runtime. |
| `core.ts` | 578 | Pipeline orchestrator: executes Pass 1A → 1B → 1.5 → 2 → 3 sequentially, with schema validation at each stage. |
| `negex.ts` | 145 | NegEx filter (Pass 1.5): rule-based detection of explicit exclusion language and v1.1 subsumption override detection. No LLM involved. |
| `prompt-builders.ts` | 169 | Prompt construction for each pipeline pass, with variable injection and context assembly. |
| `constants.ts` | 153 | Negation triggers, pseudo-negation patterns, scope terminators, discourse taxonomy. |
| `validation.ts` | 173 | Response validation and trigram similarity for fuzzy rescue checks. |
| `parser.ts` | 140 | Document section parser for structured text extraction. |
| `normalizeGhostNode.ts` | 31 | Backward compatibility normalizer: infers v1.1 fields for cached v1.0 results. |
| `normalizeCounterfactual.ts` | 121 | Normalizer for counterfactual output across schema versions. |
| `utils.ts` | 107 | Ghost node detection utilities, batch processing, and deduplication. |
| `index.ts` | 8 | Module exports. |

**Test suite:** `src/lib/ghost-nodes/__tests__/gndp-schemas.test.ts` (507 lines) — golden-file validation tests for all four pipeline passes, evidence-grade gating, score-range enforcement, and schema compliance.

---

## A1.3 Source Code — Prompt Templates

Prompt definitions for all eight analytical strata. All files are in `src/lib/prompts/`.

| File | Description |
|---|---|
| `gndp-v1.ts` | Ghost Node Detection Protocol v1.1 prompt templates (Pass 1A, 1B, 2, 3). |
| `registry.ts` | Centralized prompt registry (36 prompt definitions). |
| `ecosystem.ts` | Ecosystem impact mapping prompts (ANT + Assemblage hybrid). |
| `assemblage.ts` | Assemblage extraction prompts (Deleuze and Guattari, DeLanda). |
| `ant-mediators.ts` | ANT mediator analysis prompts (Latour intermediary/mediator). |
| `institutional-logics.ts` | Institutional logics prompts (Thornton, Ocasio, and Lounsbury). |
| `cultural-framing.ts` | Cultural framing and discourse analysis prompts. |
| `ontology.ts` | Ontology extraction and comparison prompts. |
| `resistance-analysis.ts` | Resistance and counter-conduct analysis prompts. |
| `critique.ts` | Critique panel simulation (Decolonial, ANT, Legal reviewers). |
| `stress-test.ts` | Adversarial stress-test prompts. |
| `comparative-synthesis.ts` | Cross-document comparative synthesis prompts. |
| `controversy-mapping.ts` | Controversy mapping prompts. |
| `abstract-machine.ts` | Abstract machine extraction prompts. |
| `structural-concern.ts` | Structural concern analysis prompts. |
| `legitimacy.ts` | Legitimacy claims analysis prompts. |
| `dsf.ts` | Discursive strategy framework prompts. |

---

## A1.4 Source Code — Analyst Assessment Interface

The analyst-in-the-loop components that implement contestability and the immutable provenance chain. Located in `src/components/analysis/`.

| File | Description |
|---|---|
| `GhostNodeReflexiveAssessment.tsx` | Three-criterion rubric interface (functional relevance, textual invocation, structural foreclosure). Implements immutable provenance chain, positionality recording, contest-reason capture, v1.1 subsumption judgment, and evidence-to-criterion mapping. |
| `GhostNodeAssessmentSummary.tsx` | Aggregate assessment dashboard showing confirmation rates, provenance chain statistics, and contested entries. |
| `TransparencyPanel.tsx` | Full prompt and model-output transparency panel for audit purposes. |
| `AIAuditPanel.tsx` | AI interaction audit log for methodological accountability. |

**Provenance chain persistence:** `src/lib/ghost-node-store.ts` — Redis-backed atomic storage with SHA-256 fingerprinting and immutable history append (no overwrite of prior entries).

---

## A1.5 Correspondence Between Manuscript Claims and Source Artifacts

The following table maps key methodological claims made in the manuscript to the specific artifacts that substantiate them.

| Manuscript claim | Artifact |
|---|---|
| Evidence grades E1–E4 with automatic invalidation | `schemas.ts` (line 27); `core.ts` (lines 363–389) |
| Five-dimensional absence score (100-point scale) | `types.ts` (lines 172–180); `schemas.ts` (lines 35–43) |
| Three-criterion analyst rubric | `GhostNodeReflexiveAssessment.tsx` (lines 155–179) |
| Immutable provenance chain | `ghost-node-store.ts` (lines 96–124); `types.ts` (lines 62–84) |
| Counterfactual quarantine from evidentiary assessment | `GNDP_v1.1_full_protocol.md` (§9); `pass_3_counterfactual.md` (line 6) |
| NegEx false-positive filtering (rule-based, no LLM) | `negex.ts` (lines 1–89) |
| Six-pass pipeline architecture | `core.ts` (full file); `GNDP_v1.1_full_protocol.md` (§2) |
| Schema-constrained outputs (Zod validation) | `core.ts` (lines 198, 237, 336, 482) |
| Positionality recording | `GhostNodeReflexiveAssessment.tsx` (line 166) |
| Rejection preserved in provenance chain | `ghost-node-store.ts` (lines 100–107: action typing) |
| Worked example: EU AI Act worker analysis | `GNDP_v1.1_full_protocol.md` (§14) |

---

*Supplementary Material A1 accompanies: [TITLE REDACTED FOR REVIEW]. Submitted to Information & Organization, Special Issue: Algorithmic Assemblages.*
