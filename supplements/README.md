# GNDP v1.1 — Prompt Pipeline

This directory contains the prompt templates used in the Ghost Node Detection Protocol (GNDP v1.1). Each file corresponds to one pass of the multi-pass pipeline described in the [full protocol supplement](./GNDP_v1.1_full_protocol.md).

## Pipeline Sequence

| File | Pass | Model | Purpose |
|---|---|---|---|
| [`pass_1a_extraction.md`](./pass_1a_extraction.md) | 1A | GPT-4o-mini | Structural extraction: actors, affected claims, OPPs |
| [`pass_1b_candidates.md`](./pass_1b_candidates.md) | 1B | GPT-4o-mini | Candidate synthesis via structural subtraction; **v1.1: subsumption pathway detection** |
| [`pass_2_deep_dive.md`](./pass_2_deep_dive.md) | 2 | GPT-4o | Evidence grading, typology, weighted scoring; **v1.1: schematic adequacy assessment** |
| [`pass_3_counterfactual.md`](./pass_3_counterfactual.md) | 3 | GPT-4o | Counterfactual power test (quarantined speculation); **v1.1: subsumption-aware context** |

## What Changed in v1.1

- **Pass 1B** now detects `ghostPathway` (structural / proxy / subsumption / uncertain) and produces `subsumptionSource` with a three-gate evidentiary filter for subsumption candidates.
- **Pass 1.5** (NegEx) now includes `detectSubsumptionOverrides` — a regex-safe, alias-aware check that flags subsumed candidates with dedicated provisions for manual review.
- **Pass 2** now performs schematic adequacy assessment (Adequate / Partial / Deficient) for subsumption-pathway candidates. `schematicAdequacyScore` (0–10) is stored separately from the core 100-point absence score.
- **Pass 3** receives subsumption context (absorbing category, differentiated claims, adequacy assessment) to support differential-capacity counterfactual analysis.
- **Analyst Review** gains a fourth criterion (`subsumptionJudgment`) for subsumption-pathway ghosts, with analyst override capability.
- **Normalizer** (`normalizeGhostNode.ts`) transparently infers v1.1 fields for cached v1.0 results.

## Source Implementation

The canonical implementation of these prompts is in [`src/lib/prompts/gndp-v1.ts`](../src/lib/prompts/gndp-v1.ts). The markdown files in this directory are human-readable extracts for replication and review purposes.

## Usage Notes

- All prompts use `{{PLACEHOLDER}}` syntax for variable injection.
- Prompts enforce strict JSON output with no markdown or prose.
- Evidence-gating rules (E1/E2 → invalid) are embedded in the Pass 2 prompt itself.
- Pass 3 structural separation from Pass 2 is intentional — see "Why Quarantined Speculation" in the full protocol supplement.
- v1.1 subsumption fields are optional in all schemas for backward compatibility.
