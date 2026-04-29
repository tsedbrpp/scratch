# Policy Prism — Analytical Modes Inventory

Every analytical surface available in the system, with its theoretical grounding, implementation location, and output type.

## Eight-Layer Analytical Framework

| Layer | Mode | Theoretical Framework | Prompt ID(s) | Implementation | Output Type |
|---|---|---|---|---|---|
| 1 | **ANT Tracing** | Actor-Network Theory (Latour, Callon) | `ant_trace_explanation` | `src/lib/prompts/theoretical-prompts.ts` | Actors, associations, mediator classifications |
| 1 | **Assemblage Extraction** | Assemblage Theory (Deleuze & Guattari, DeLanda) | `assemblage_extraction_v3` | `src/lib/prompts/assemblage.ts` | Components, mechanisms, territorialisation/deterritorialisation |
| 1 | **ANT Mediator Analysis** | Latour's intermediary/mediator distinction | Registry: `ant_trace_explanation` | `src/lib/prompts/ant-mediators.ts` | 5-dimension composite score (transformation, stability, multiplicity, generativity, contestation) |
| 2 | **Ecosystem Impact Mapping** | ANT + Assemblage hybrid | `ecosystem_analysis` | `src/lib/prompts/ecosystem.ts` | Force-directed network graph, typed edges (Power, Logic, Ghost) |
| 3 | **Ghost Node Detection (GNDP v1.1)** | Structural absence analysis (ANT-informed); v1.1 adds categorical subsumption pathway, three-gate filter, schematic adequacy scoring | `ghost_nodes_combined_pass_1`, `ghost_nodes_pass_2`, GNDP Pass 1A–3 | `src/lib/ghost-nodes/` (12 files), `src/lib/prompts/gndp-v1.ts` | Weighted scores, evidence grades, ghost typology, ghost pathway, schematic adequacy, counterfactuals |
| 4 | **Ontology Extraction** | Concept mapping | `ontology_extraction` | `src/lib/prompts/ontology.ts` | Concept nodes + links |
| 4 | **Ontology Comparison** | Cross-policy concept distance | `ontology_comparison` | `src/lib/prompts/ontology.ts` | Conceptual distances, structural divergences |
| 5 | **Institutional Logics** | Thornton, Ocasio & Lounsbury | `institutional_logics` | `src/lib/prompts/institutional-logics.ts` | Logic strength (Market/State/Professional/Community), conflicts |
| 5 | **Cultural Framing** | Discourse analysis, cultural political economy | `cultural_framing` | `src/lib/prompts/cultural-framing.ts` | State-market-society config, technology role, rights conception |
| 5 | **Legitimacy Analysis** | Boltanski & Thévenot (Orders of Worth) | `legitimacy_analysis` | `src/lib/prompts/legitimacy.ts` | Moral justification mapping |
| 5 | **DSF Lens** | Decolonial Situatedness Framework | `dsf_lens` | `src/lib/prompts/dsf.ts` | Power, coloniality, situatedness analysis |
| 6 | **Resistance Analysis** | Foucault (counter-conduct), Scott (hidden transcripts) | `resistance_analysis` | `src/lib/prompts/resistance.ts` | Micro-resistance strategies (Gambiarra, Obfuscation, Refusal) |
| 6 | **Resistance Synthesis** | Cross-source resistance pattern detection | `resistance_synthesis` | `src/lib/prompts/resistance.ts` | Dominant strategies, alternative trajectories |
| 6 | **Resistance Discourse Analysis** | Critical discourse analysis + assemblage theory | `resistance_discourse_analysis` | `src/lib/prompts/resistance-analysis.ts` | Frames, rhetorical strategies, reconfiguration dynamics |
| 7 | **Comparative Synthesis** | Cross-document assemblage comparison | `comparative_synthesis_v2` | `src/lib/prompts/comparative-synthesis.ts` | Shared spines, unique components, divergence axes |
| 7 | **Comparison Framework** | DSF-based two-framework comparison | `comparison_framework` | `src/lib/prompts/comparison.ts` | Divergent definitions, conflict points |
| 8 | **Translational Legibility Framework** | TLF (custom middle-range framework) | Custom prompts in `src/app/api/analyze/route.ts` | `src/app/data/page.tsx`, `src/types/tea.ts` | Five-column schema, proposition evaluation, stratified legibility |
| 8 | **Controversy Mapping** | Multi-stratum meta-synthesis | `controversy_mapping` | `src/lib/prompts/controversy-mapping.ts` | Consensus zones, active frictions, structural contradictions |
| 8 | **Abstract Machine Extraction** | Deleuze & Guattari (abstract machines, diagrams) | `abstract_machine_extraction` | `src/lib/prompts/abstract-machine.ts` | Diagram, double articulation, affective capacities, limits |

## Complementary Analytical Modes

| Mode | Theoretical Framework | Prompt ID | Output |
|---|---|---|---|
| **Absence Analysis** | Structural void detection | `absence_analysis` | Missing voices, structural voids, blindspot intensity |
| **Structural Concern** | Evidence-grounded exclusion mapping | `structural_concern` | Thesis-driven structural exclusion with verbatim evidence |
| **Anti-Structural Concern** | Deliberative contestation | `anti_structural_concern` | Counter-argument challenging exclusion claims |
| **Structural Escalation** | Methodological adjudication | `structural_escalation` | Argument strength evaluation |
| **Critique Panel** | Simulated peer review | `critique_panel` | Blind spots, over-interpretation, legitimacy corrections |
| **Stress Test** | Adversarial red-teaming | `stress_test` | Policy reframed through opposing ideological lens |
| **Micro-Fascism Risk** | Deleuze & Guattari (micro-fascism) | `micro_fascism_risk` | Risk Index diagnostic narrative |
| **Liberatory Capacity** | Liberatory governance assessment | `liberatory_capacity` | LGCI diagnostic narrative |
| **Trajectory Simulation** | Assemblage evolution modelling | `trajectory_simulation` | Deltas, stabilisation mechanisms, lines of flight |
| **Assemblage Explanation** | Hull stability / porosity | `assemblage_explanation` | Political significance narrative |

---

*Total: 29 distinct analytical modes across 8 layers + 10 complementary modes.*
