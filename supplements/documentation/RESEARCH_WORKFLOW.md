# Policy Prism — Research Workflow

This guide outlines the recommended workflow for conducting critical analysis of AI governance policy using **Policy Prism**.

## Overview

The system guides you from raw data collection to meta-theoretical synthesis through a multi-layered analytical process:

1. **Data Collection** — Ingest & index policy documents
2. **Micro Analysis** — Per-document extraction and resistance detection
3. **Meso Analysis** — Ecosystem mapping, ghost node detection, and ontology generation
4. **Macro Analysis** — Cultural framing, institutional logics, and governance analysis
5. **Synthesis** — Cross-document comparison, TST meta-synthesis, and reporting

---

## Phase 1: Data Collection

### 1.1 Documents (`/data`)
**Goal**: Build your primary archive.
- **Upload**: Add PDF documents (policies, regulations, whitepapers).
- **Scrape**: Add URLs to capture web-based content.
- **Tag**: Assign jurisdiction, date, and document type metadata.
- **Processing**: The system automatically extracts and indexes text.

### 1.2 Empirical Traces (`/empirical`)
**Goal**: Ground theoretical claims in lived experience.
- **Search**: Use the integrated web search (Google Custom Search + Gemini 1.5 Flash) to find forum posts, news articles, and community discussions.
- **Capture**: Save relevant "traces" that evidence resistance or specific attitudes toward AI governance.
- **Link**: Connect traces to primary policy documents.

---

## Phase 2: Micro Analysis

### 2.1 Per-Document Extraction (`/data`)
**Goal**: Extract structured analytical data from each source.
- **ANT Tracing**: Actors, associations, mediator classifications.
- **Assemblage Extraction**: Territorialisation, deterritorialisation, coding, lines of flight.
- **Abstract Machine**: Deleuzo-Guattarian operations, double articulations, affective capacities.

### 2.2 Resistance Analysis (`/resistance`)
**Goal**: Identify agency and counter-conduct.
- **Detect**: AI identifies micro-resistance strategies (Gambiarra, Obfuscation, Refusal) within traces.
- **Catalogue**: Build a library of resistance tactics used by actors in the system.
- **Synthesise**: Cross-source resistance synthesis identifies dominant patterns and alternative trajectories.

---

## Phase 3: Meso Analysis

### 3.1 Ecosystem Mapping (`/ecosystem`)
**Goal**: Map the governance actor-network.
- **Visualise**: Interactive force-directed graph of actors and relationships.
- **Classify**: Edges typed as Power, Logic, or Ghost; classified as mediators or intermediaries.
- **Analyse**: Identify obligatory passage points, power concentrations, and structural gaps.

### 3.2 Ghost Node Detection (GNDP v1.0)
**Goal**: Identify structurally significant absences.
- **Run**: Four-pass automated pipeline (extraction → subtraction → NegEx → deep-dive → counterfactual).
- **Score**: 100-point weighted absence scoring with E1–E4 evidence grading.
- **Assess**: Three-criterion analyst reflexive assessment with immutable provenance chain.
- **Connect**: Ghost Nodes appear on the Ecosystem Map with Ghost edge type.

### 3.3 Ontology Generation (`/ontology`)
**Goal**: Map the conceptual landscape.
- **Extract**: Key concepts and terms from documents.
- **Compare**: Cross-jurisdictional ontology comparison reveals where the "same" concept occupies different governance positions.

---

## Phase 4: Macro Analysis

### 4.1 Cultural Framing
**Goal**: Decode dominant narratives.
- **Framing**: State-market-society configurations, technology imaginaries, rights conceptions.
- **Institutional Logics**: Competing organising principles (Market, State, Professional, Community).
- **Legitimacy**: Moral justifications mapped via Orders of Worth.

### 4.2 Structural Analysis
**Goal**: Evaluate governance architecture.
- **Structural Concern**: Evidence-grounded structural exclusion mapping.
- **Anti-Structural Concern**: Counter-argument challenging proposed exclusions.
- **Structural Escalation**: Evaluates which argument (structural vs. anti-structural) is methodologically stronger.

### 4.3 Critical Evaluation
**Goal**: Stress-test analytical claims.
- **Critique Panel**: Simulated 3-person academic review (Decolonial, ANT, Legal perspectives).
- **Stress Test**: Red-teams policy through an opposing ideological lens.

---

## Phase 5: Synthesis

### 5.1 Comparative Synthesis (`/comparison`)
**Goal**: Cross-document divergence analysis.
- **Compare**: Select two or more frameworks and analyse divergent definitions, shared structural spines, unique jurisdictional components, and axes of divergence.
- **Resonance Graphing**: Visualise reinforcing, tension, and flight dynamics across policy regimes.

### 5.2 Meta-Synthesis (`/data` → Theory tab)
**Goal**: Generate overarching theoretical insights.
- **Controversy Mapping**: Cross-stratum synthesis of consensus zones, active frictions, and structural contradictions.
- **Translational Stratification Theory (TST)**: Dual-track parallel analysis producing five-column structured extraction and proposition evaluation across all sources.
- **TEA Analysis**: View structured TST output with stratified legibility assessment.

### 5.3 Reporting
**Goal**: Publication-ready outputs.
- **DOCX Export**: Comprehensive reports with native image capture of visualisations.
- **JSON/CSV Export**: Graph data for external tools (Gephi, Kumu).
- **Provenance Chain**: All analytical assessments preserved with analyst positionality records.

---

## Tips for Rigorous Research

- **Iterate**: Research is non-linear. Move between phases as new evidence emerges.
- **Ground**: Link high-level claims to specific textual evidence and empirical traces.
- **Contest**: Use the Analyst Reflexive Assessment to challenge your own assumptions. Record disagreements rather than editing them away.
- **Triangulate**: Cross-stratum convergence (findings confirmed across multiple analytical layers) carries greater evidentiary weight than single-stratum claims.
