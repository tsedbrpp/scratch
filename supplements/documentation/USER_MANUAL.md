# Policy Prism — User Manual

Welcome to the user manual for **Policy Prism**, a research platform for analysing AI governance policy through Actor-Network Theory (ANT) and Assemblage Theory.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Data Management](#2-data-management)
3. [Running Analyses](#3-running-analyses)
4. [Visualising Data](#4-visualising-data)
5. [Ghost Node Detection](#5-ghost-node-detection)
6. [Meta-Synthesis & Theory](#6-meta-synthesis--theory)
7. [Comparative Analysis](#7-comparative-analysis)
8. [Exporting Results](#8-exporting-results)
9. [Credits & Billing](#9-credits--billing)
10. [FAQ](#10-faq)

---

## 1. Getting Started

### Account Creation
1. Navigate to the **Sign Up** page at https://policyprism.io.
2. Enter your email and create a password, or use **Google Auth** for quick access.
3. New accounts start with a small number of free credits for trial use.

### Dashboard Overview
Upon logging in, your **Dashboard** provides:
- **Active Sources**: Documents and URLs you have uploaded and indexed.
- **Recent Analyses**: The latest analytical results across all lenses.
- **Credit Balance**: Remaining credits for running AI analyses.

### Demo Mode
If you see a "Demo Mode" notification, you are viewing a read-only, sandboxed version. You can explore all existing data, view ecosystem maps, and examine pre-run analyses, but cannot upload new files or spend credits.

---

## 2. Data Management

### Uploading Sources (`/data`)
- **Upload PDF**: Click "Upload Source" to add policy documents, whitepapers, or academic articles. Supported format: PDF (10MB limit).
- **Add URL**: Paste a link to scrape textual content from a web page.
- **Indexing**: Documents are automatically text-extracted, chunked, and indexed for analysis.

### Source Selection
- Select individual sources for single-document analysis, or select multiple sources for cross-document comparison and synthesis.
- Tag sources with jurisdiction, date, and document type for organised retrieval.

---

## 3. Running Analyses

Select a source, choose an analysis mode, and click **Analyse**. Each analysis costs 1 credit and takes 30–90 seconds depending on document length.

### Analysis Modes

| Mode | Description |
|---|---|
| **ANT Tracing** | Traces actors, associations, and mediator/intermediary classifications |
| **Assemblage Extraction** | Maps territorialisation, deterritorialisation, coding, and lines of flight |
| **Institutional Logics** | Identifies competing organising principles (Market, State, Professional, Community) |
| **Cultural Framing** | Analyses state-market-society configurations, technology imaginaries, rights conceptions |
| **Legitimacy Analysis** | Maps moral justifications using Boltanski & Thévenot's Orders of Worth |
| **Resistance Analysis** | Detects micro-resistance strategies (Gambiarra, Obfuscation, Refusal) |
| **Structural Concern** | Evaluates structural exclusion mechanisms with evidence grounding |
| **Anti-Structural Concern** | Challenges proposed Ghost Nodes by arguing against exclusion |
| **Structural Escalation** | Evaluates structural vs. anti-structural argument strength |
| **Abstract Machine** | Extracts Deleuzo-Guattarian operations, double articulations, and affective capacities |
| **Critique Panel** | Simulates a 3-person academic review panel (Decolonial, ANT, Legal) |
| **Stress Test** | Red-teams a policy through an opposing ideological lens |

### Ghost Node Detection (GNDP v1.0)
See [Section 5](#5-ghost-node-detection) for the dedicated pipeline.

---

## 4. Visualising Data

### Ecosystem Map (`/ecosystem`)
The interactive network graph visualises actors and relationships traced across your documents.

- **Nodes**: Entities extracted from policy texts (e.g., "European Commission", "High-Risk AI System", "Civil Society").
- **Edges**: Typed relationships — **Power** (coercive force), **Logic** (institutional reasoning), **Ghost** (link to absent actor).
- **Edge Classification**: Each edge is classified as a **mediator** (transforms meaning) or **intermediary** (merely transports) based on five dimensions: transformation, stability, multiplicity, generativity, and contestation.
- **Side Panels**:
  - *Left Panel*: Searchable, filterable list of all identified actors.
  - *Right Panel*: Detailed breakdown of the selected actor's capacities, mechanisms, and evidence.

### Ontology Map (`/ontology`)
- Generate a high-level conceptual map synthesising your sources into a coherent network of concepts.
- Compare ontologies across jurisdictions to identify conceptual distances and structural divergences.

---

## 5. Ghost Node Detection

The Ghost Node Detection Pipeline (GNDP v1.0) identifies actors whose absence from a policy document is structurally significant.

### Running GNDP
1. Select a source on the `/data` page.
2. Click **Detect Ghost Nodes**.
3. The system runs a four-pass pipeline:
   - **Pass 1A/1B**: Extracts all formal actors and identifies absent-actor candidates via structural subtraction.
   - **Pass 1.5**: Rule-based NegEx filter removes false positives.
   - **Pass 2**: Evidence grading (E1–E4), weighted scoring (100-point scale), and ghost typology assignment. Weak evidence (E1/E2) automatically invalidates candidates.
   - **Pass 3**: Counterfactual power test — projects what would change if the absent actor were given governance standing.

### Analyst Assessment
After automated detection, you can perform a **Reflexive Assessment** for each Ghost Node:
- **Functional Relevance**: Does a plausible governance function exist?
- **Textual Trace**: Does the regime invoke this actor's interests without enrolling them?
- **Structural Foreclosure**: Does the procedural architecture eliminate participation avenues?
- **Moral Status**: Floridi-informed classification (Moral patient / Moral agent / Both / Undetermined).
- **Reflexive Note**: Record how your own positionality may shape the reading. All assessments are preserved as immutable provenance entries.

### Viewing Results
- Ghost Nodes appear on the Ecosystem Map with **Ghost** edge type.
- Each Ghost Node card shows: absence score, evidence grade, tier, ghost type, exclusion type, and score breakdown.
- Counterfactual scenarios are accessible via the detail panel.

---

## 6. Meta-Synthesis & Theory

### Translational Stratification Theory (`/data` → Theory tab)
After running analyses across multiple sources, generate a TST meta-synthesis:
1. Navigate to the **Theory** tab on the Data page.
2. Select the sources to include.
3. Click **Generate Theory**.
4. The system assembles compressed context from six prior analytical strata and runs a dual-track parallel analysis:
   - **Track 1**: Qualitative ANT/Assemblage synthesis narrative.
   - **Track 2**: Structured five-column JSON extraction (Portable Vocabularies, Local Translations, Embedding Infrastructures, Apex Nodes, Contestation Dynamics).
5. Results include proposition evaluation with support levels (Strong / Moderate / Weak / Insufficient) and stratified legibility assessment.

### TEA Analysis (`/tea-analysis`)
View the structured TST output with interactive visualisation of the five-column schema, proposition support levels, and stratified legibility findings.

### Controversy Mapping
Synthesises points of consensus, friction, and structural contradictions across all analytical strata.

---

## 7. Comparative Analysis

### Cross-Document Comparison
- Select two or more sources for side-by-side analysis.
- The system generates: divergent definitions, shared structural spines, unique jurisdictional components, and axes of divergence.

### Ontology Comparison
- Compare conceptual maps across jurisdictions to identify where the "same" concept occupies fundamentally different governance positions.

### Resistance Synthesis
- Cross-source synthesis of counter-conduct strategies, dominant resistance patterns, and emergent alternative trajectories.

---

## 8. Exporting Results

### DOCX Reports
- Generate comprehensive Word documents with embedded visualisations (D3/Recharts diagrams captured as native images).
- Reports include all analytical strata, Ghost Node findings, and TST results.

### Data Export
- **JSON**: Full ecosystem graph data for import into network analysis tools (Gephi, Kumu).
- **CSV**: Tabular export of actor lists, Ghost Node scores, and proposition evaluations.

---

## 9. Credits & Billing

### Understanding Credits
- **1 Credit** = 1 AI analysis request.
- **Free actions**: Viewing existing results, exploring graphs, uploading documents.

### Purchasing Credits
1. Click the **Credits** badge in the sidebar.
2. Select a package.
3. Complete payment via Stripe.
4. Credits are added immediately upon successful payment.

---

## 10. FAQ

**Q: Is my data used to train AI models?**
A: **No.** User data is strictly segmented. Uploaded documents and analytical results are not used for model training.

**Q: Which AI models does the system use?**
A: GPT-4o for analysis and GNDP deep-dive, GPT-4o-mini for parsing and lightweight extraction, and Gemini 1.5 Flash for web search.

**Q: Can I export my ecosystem graph?**
A: Yes. The Ecosystem page provides JSON and CSV export options for use in Gephi, Kumu, or other network analysis tools.

**Q: What is "Demo Mode"?**
A: A read-only, sandboxed view of existing data. You can explore all analyses but cannot upload files or spend credits.

**Q: How does Ghost Node detection differ from standard absence analysis?**
A: Standard absence analysis identifies missing voices descriptively. GNDP v1.0 is a structured, evidence-gated pipeline with weighted scoring, evidence grading, counterfactual testing, and human reflexive assessment — designed for methodological rigour in academic research.

**Q: Can I override the AI prompts?**
A: Yes. Admin users can edit all 30+ prompt templates via `/settings/prompts`. Overrides persist per-user in Redis.

---

*Need help? Contact support via the Help menu or refer to [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) for technical details.*
*Live demo: https://policyprism.io | Source: https://github.com/tsedbrpp/scratch*
