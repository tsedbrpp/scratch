# Policy Prism — System Overview

**Policy Prism** is an open-source research platform for critical analysis of AI governance policy. It operationalises Actor-Network Theory (ANT) and Assemblage Theory to transform static policy documents into dynamic, multi-dimensional analytical artefacts — mapping actors, relationships, structural absences, and governance architectures across jurisdictions.

## Core Capabilities

### 1. Multi-Lens Algorithmic Analysis
The system employs a coordinated LLM ensemble (GPT-4o for analysis, GPT-4o-mini for parsing, Gemini 1.5 Flash for web search) to interpret documents through 30+ versioned theoretical lenses organised into an eight-layer analytical framework:
- **Institutional Logics**: Competing organising principles (Market, State, Professional, Community) and their material/discursive manifestations.
- **Cultural Framing**: State-market-society configurations, dominant discursive frames, technology imaginaries, and rights conceptions.
- **Legitimacy Dynamics**: Moral justifications (Boltanski & Thévenot's Orders of Worth) used to defend governance authority.
- **Resistance Analysis**: Counter-conduct strategies, micro-resistance typologies (Gambiarra, Obfuscation, Refusal), and alternative trajectories.

### 2. Ghost Node Detection (GNDP v1.0)
A four-pass pipeline identifies actors, institutions, or stakeholder groups whose absence from policy documents is structurally significant. The protocol combines:
- **Structural extraction** (Pass 1A/1B): Formal actors, affected-population claims, and obligatory passage points.
- **Evidence-gated scoring** (Pass 2): 100-point weighted absence scoring across five dimensions with E1–E4 evidence grading. Candidates with weak evidence (E1/E2) are automatically invalidated.
- **Counterfactual power testing** (Pass 3): Quarantined speculation projecting structural consequences of hypothetical inclusion at governance chokepoints.
- **Analyst reflexive assessment**: Three-criterion human evaluation (Functional Relevance, Textual Trace, Structural Foreclosure) with immutable provenance chain.

### 3. Ecosystem & Assemblage Mapping
Interactive force-directed network graphs visualise governance architectures as active assemblages. Edges are typed (Power, Logic, Ghost) and classified as mediators or intermediaries. The system traces how specific policy mechanisms constrain or afford possibilities for diverse actors, distinguishing material infrastructures from discursive norms.

### 4. Translational Stratification Theory (TST)
A dual-track meta-synthesis pipeline that maps empirical findings into a five-column analytical schema (Portable Vocabularies, Local Translations, Embedding Infrastructures, Apex Nodes, Contestation Dynamics). The system evaluates five propositions covering referential drift, infrastructural embedding, and stratified legibility — connecting directly to Ghost Node detection results.

### 5. Comparative Synthesis
A cross-document divergence engine identifies shared structural spines, unique jurisdictional components, and primary axes of divergence (risk topology, enforcement architecture, accountability structures). Includes resonance/divergence graphing across policy regimes.

### 6. Empirical Grounding
An integrated web search engine (Google Custom Search + Gemini 1.5 Flash) finds real-world evidence of resistance and counter-conduct — grounding theoretical claims in lived experience by surfacing forum discussions, news articles, and community responses to algorithmic governance.

## Design Principles

| Principle | Implementation |
|---|---|
| **Traceability** | Every analytical claim grounded in verbatim textual evidence with source references |
| **Contestability** | Analyst override, disagreement logging, positionality recording; no classification is final without human review |
| **Productive Friction** | Surfaces ambiguity, contradiction, and structural tension rather than resolving them prematurely |

## Resources

| Resource | URL |
|---|---|
| Live Demo | https://policyprism.io |
| Source Code | https://github.com/tsedbrpp/scratch |
| GNDP Protocol | https://github.com/tsedbrpp/scratch/blob/main/supplements/GNDP_v1.0_full_protocol.md |
| Documentation | https://github.com/tsedbrpp/scratch/tree/main/supplements/documentation |
