# GNDP v1.0 — Prompt Pipeline

This directory contains the prompt templates used in the Ghost Node Detection Protocol (GNDP v1.0). Each file corresponds to one pass of the multi-pass pipeline described in the [full protocol supplement](../../supplements/GNDP_v1.0_full_protocol.md).

## Pipeline Sequence

| File | Pass | Model | Purpose |
|---|---|---|---|
| [`pass_1a_extraction.md`](./pass_1a_extraction.md) | 1A | GPT-4o-mini | Structural extraction: actors, affected claims, OPPs |
| [`pass_1b_candidates.md`](./pass_1b_candidates.md) | 1B | GPT-4o-mini | Candidate synthesis via structural subtraction |
| [`pass_2_deep_dive.md`](./pass_2_deep_dive.md) | 2 | GPT-4o | Evidence grading, typology, weighted scoring |
| [`pass_3_counterfactual.md`](./pass_3_counterfactual.md) | 3 | GPT-4o | Counterfactual power test (quarantined speculation) |

## Source Implementation

The canonical implementation of these prompts is in [`src/lib/prompts/gndp-v1.ts`](../../src/lib/prompts/gndp-v1.ts). The markdown files in this directory are human-readable extracts for replication and review purposes.

## Usage Notes

- All prompts use `{{PLACEHOLDER}}` syntax for variable injection.
- Prompts enforce strict JSON output with no markdown or prose.
- Evidence-gating rules (E1/E2 → invalid) are embedded in the Pass 2 prompt itself.
- Pass 3 structural separation from Pass 2 is intentional — see "Why Quarantined Speculation" in the full protocol supplement.
