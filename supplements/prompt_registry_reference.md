# Policy Prism — Prompt Registry Reference

All analysis prompts are versioned and managed in `src/lib/prompts/registry.ts`. Admin users can override any prompt via `/settings/prompts`; overrides persist per-user in Redis.

## Analysis Prompts (18)

| Prompt ID | Name | Description | Output |
|---|---|---|---|
| `absence_analysis` | Absence Analysis | Analyses missing voices, silent actors, and structural voids in the ecosystem | JSON: narrative, missing_voices, structural_voids, blindspot_intensity |
| `assemblage_explanation` | Assemblage Explanation | Explains the political significance of Hull Stability and Porosity | JSON: narrative, hulls |
| `comparative_synthesis_v2` | Comparative Synthesis V2 | Synthesises findings across multiple analytic lenses (N-way comparison) | JSON |
| `comparison_framework` | Comparison Framework (DSF) | Compares two governance frameworks using the Decolonial Situatedness Framework | JSON |
| `controversy_mapping` | Controversy Mapping | Synthesises consensus, friction, and structural contradictions across all 7 analytical strata | JSON: consensus_zones, active_frictions, structural_contradictions |
| `cultural_framing` | Cultural Framing Lens | Analyses implicit cultural assumptions, metaphors, and state-market imaginaries | JSON |
| `dsf_lens` | Decolonial Situatedness Framework | Core lens for analysing power, coloniality, and situatedness in assemblages | JSON |
| `ecosystem_analysis` | Ecosystem Impact Mapping | Maps policy mechanisms to second and third-order impacts on ecosystem actors | JSON |
| `institutional_logics` | Institutional Logics Lens | Analyses competing organising principles (Market, State, Professional, Community) | JSON |
| `legitimacy_analysis` | Legitimacy (Orders of Worth) | Analyses moral justifications using Boltanski & Thévenot's Orders of Worth | JSON |
| `liberatory_capacity` | Liberatory Capacity Summary | Generates diagnostic narrative for the Liberatory Governance Capacity Index | Text |
| `micro_fascism_risk` | Micro-Fascism Risk Summary | Generates diagnostic narrative for the Risk Index card | Text |
| `resistance_analysis` | Resistance Analysis | Detects micro-resistance strategies (Gambiarra, Obfuscation, Refusal) in text | JSON |
| `resistance_synthesis` | Resistance Synthesis | Synthesises patterns from multiple resistance traces | JSON |
| `resistance_discourse_analysis` | Resistance Discourse Analysis | Analyses resistance artefacts through assemblage theory and critical discourse analysis | JSON: frames, rhetorical_strategies, reconfiguration |
| `structural_concern` | Structural Concern Analysis | Thesis-driven structural exclusion mapping grounded in exact excerpts | JSON |
| `anti_structural_concern` | Anti-Structural Concern Challenge | Challenges a proposed Ghost Node by arguing it is not justified | JSON |
| `structural_escalation` | Structural Escalation Evaluation | Evaluates whether the structural or anti-structural argument is stronger | JSON |

## Extraction Prompts (6)

| Prompt ID | Name | Description | Output |
|---|---|---|---|
| `assemblage_extraction_v3` | Assemblage Extraction | Extracts actors, mechanisms, and relations using Assemblage Theory | JSON: assemblage, actors, relations |
| `ontology_extraction` | Ontology Extraction | Extracts a structured Concept Map (nodes & links) from text | JSON |
| `ontology_comparison` | Ontology Comparison | Compares two different ontology maps | JSON |
| `theme_extraction` | Theme Extraction (Grounded Theory) | Extracts emic themes from policy documents | JSON: theme, quote |
| `key_term_extraction` | Key Term Extraction | Extracts searchable terms from policy documents | JSON |
| `subject_identification` | Subject Identification | Identifies the policy/entity name from text | JSON |
| `abstract_machine_extraction` | Abstract Machine Extraction | Extracts Deleuzo-Guattarian operations, double articulations, and affective capacities | JSON: diagram, double_articulation, affective_capacities, limits |

## Simulation Prompts (1)

| Prompt ID | Name | Description | Output |
|---|---|---|---|
| `trajectory_simulation` | Trajectory Simulation | Simulates how an assemblage evolves under specific scenario conditions | JSON: narrative, deltas |

## Critique Prompts (2)

| Prompt ID | Name | Description | Output |
|---|---|---|---|
| `critique_panel` | Critique Panel | Simulates a 3-person academic review panel (Decolonial, ANT, Legal) | JSON: blind_spots, over_interpretation, legitimacy_correction |
| `stress_test` | Adversarial Stress Test | Red-teams a policy by reframing through an opposing ideological lens | JSON |

## Ghost Node Detection Prompts (GNDP v1.0)

| Prompt ID | Name | Description | Output |
|---|---|---|---|
| `ghost_nodes_combined_pass_1` | Ghost Nodes: Theme & Actor Scan | Extracts dominant discourses and broadly identifies absent actor candidates | JSON: dominantDiscourses, ghostNodeCandidates |
| `ghost_nodes_pass_2` | Ghost Nodes: Deep Dive | Forensic evidence grounding on absent actor candidates | JSON |

For GNDP v1.0 full pipeline prompts (Pass 1A, 1B, 2, 3), see [`supplements/pass_1a_extraction.md`](./pass_1a_extraction.md) through [`pass_3_counterfactual.md`](./pass_3_counterfactual.md).

## Theoretical Lens Additions (4)

| Prompt ID | Name | Description |
|---|---|---|
| `cultural_lens_institutional_logics` | Lens: Institutional Logics | Supplementary lens for institutional logics analysis |
| `cultural_lens_critical_data_studies` | Lens: Critical Data Studies | Supplementary lens for critical data studies |
| `cultural_lens_actor_network_theory` | Lens: Actor-Network Theory | Supplementary lens for ANT analysis |
| `cultural_lens_dsf_lens` | Lens: DSF (Short) | Supplementary lens for Decolonial Situatedness Framework |

## Search & Retrieval Prompts (2)

| Prompt ID | Name | Description |
|---|---|---|
| `generate_search_terms` | Generate Search Terms | Extracts key search terms from policy insights for finding online discussions |
| `resistance_curation` | Resistance Curation | Classifies search results into resistance typologies |

## Theoretical Narrative Prompts (3)

| Prompt ID | Name | Description | Output |
|---|---|---|---|
| `ant_trace_explanation` | ANT Trace Explanation | Descriptive methodological trace of the actor-network | JSON: narrative |
| `assemblage_realist_explanation` | Assemblage Realist Explanation | Interprets mechanisms of territorialisation and coding | JSON: narrative, trajectory_analysis |
| `hybrid_reflexive_explanation` | Hybrid Reflexive Explanation | Synthesises ANT trace and Assemblage mechanisms with theoretical reflexivity | JSON: narrative |

---

*Source: `src/lib/prompts/registry.ts` — 36 registered prompts across 4 categories.*
