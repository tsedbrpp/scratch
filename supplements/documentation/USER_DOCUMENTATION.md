# Policy Prism — User Guide

Welcome to **Policy Prism**, your platform for analysing AI governance policy through Actor-Network Theory and Assemblage Theory.

## 1. Getting Started

### Account Creation
1. Navigate to the **Sign Up** page at [REDACTED FOR REVIEW].
2. Enter your email and password, or use **Google Auth**.
3. New accounts start with free credits for trial use.

### Dashboard
Your dashboard shows: **Active Sources**, **Recent Analyses**, and **Credit Balance**.

### Demo Mode
A read-only view of existing data. You can explore all analyses but cannot upload files or spend credits.

---

## 2. Core Workflows

### 2.1 Managing Data Sources (`/data`)
- **Upload PDF**: Click "Upload Source" to add policy documents (PDF, 10MB limit).
- **Add URL**: Paste a link to scrape web content.
- **Indexing**: Documents are automatically text-extracted and indexed.

### 2.2 Running Analysis
1. Select a source from the list.
2. Choose an **Analysis Mode** (12+ available lenses including ANT Tracing, Institutional Logics, Cultural Framing, Resistance Analysis, Abstract Machine Extraction).
3. Click **Analyse** (1 credit, 30–90 seconds).

### 2.3 Ghost Node Detection
1. Select a source and click **Detect Ghost Nodes**.
2. The GNDP v1.0 pipeline runs four automated passes (structural extraction → candidate synthesis → NegEx filtering → deep-dive scoring → counterfactual testing).
3. Review results and perform **Analyst Reflexive Assessment** (three-criterion evaluation with provenance chain).

### 2.4 The Ecosystem Map (`/ecosystem`)
Interactive force-directed network graph visualising actors and relationships:
- **Nodes**: Entities from your documents.
- **Edges**: Typed as Power, Logic, or Ghost — classified as mediators or intermediaries.
- **Side Panels**: Left (actor list), Right (detailed analysis of selected actor).

### 2.5 Meta-Synthesis (`/data` → Theory tab)
Generate Translational Legibility Framework (TLF) analysis across multiple sources:
- Select sources and click **Generate Theory**.
- Dual-track output: qualitative synthesis + structured five-column extraction.
- Proposition evaluation with support levels.

---

## 3. Advanced Features

### 3.1 Comparative Synthesis
Select two or more sources for side-by-side analysis. The system identifies divergent definitions, shared structural spines, and axes of divergence.

### 3.2 Ontology Comparison (`/ontology`)
Generate and compare conceptual maps across jurisdictions. Identify where the same concept occupies fundamentally different governance positions.

### 3.3 Controversy Mapping
Cross-stratum meta-synthesis identifying consensus zones, active frictions, and structural contradictions.

### 3.4 Report Export
- **DOCX**: Comprehensive reports with embedded visualisations.
- **JSON/CSV**: Ecosystem graph data for Gephi, Kumu, or other tools.

---

## 4. Credits & Billing

- **1 Credit** = 1 AI analysis request.
- Viewing results and uploading documents is **free**.
- Purchase credits via Stripe integration.

---

## 5. FAQ

**Q: Is my data used to train AI models?**
A: **No.** User data is strictly segmented and never used for model training.

**Q: Which AI models are used?**
A: GPT-4o (analysis), GPT-4o-mini (parsing), Gemini 1.5 Flash (web search).

**Q: Can I export my graph?**
A: Yes. JSON and CSV export on the Ecosystem page.

**Q: Can I edit the AI prompts?**
A: Admin users can override all 30+ prompt templates via `/settings/prompts`.

---

*Live demo: [REDACTED FOR REVIEW] | Source: [REDACTED FOR REVIEW]*
