# Policy Prism — Quick Start Guide

Get your first analysis running in under 5 minutes.

## Step 1: Sign In

Go to https://policyprism.io and create an account (email or Google Auth).

## Step 2: Upload a Document

1. Navigate to the **Data** page.
2. Click **Upload Source**.
3. Select a PDF (e.g., the EU AI Act, Brazil PL 2338, Colorado SB 24-205).
4. Wait for automatic text extraction and indexing (~10 seconds).

## Step 3: Run Your First Analysis

1. Select your uploaded document from the source list.
2. Choose an analysis mode:
   - **Institutional Logics** — Identifies competing organising principles (Market, State, Professional, Community)
   - **Cultural Framing** — Exposes state-market-society assumptions and technology imaginaries
   - **ANT Tracing** — Maps actors, associations, and mediator classifications
3. Click **Analyse**. Results appear in 30–90 seconds.

## Step 4: Detect Ghost Nodes

1. With your document selected, click **Detect Ghost Nodes**.
2. The GNDP v1.0 pipeline runs automatically (4 passes, ~2 minutes).
3. Review the results: each Ghost Node shows an absence score, evidence grade, and ghost type.
4. Perform **Analyst Reflexive Assessment** to confirm or contest the findings.

## Step 5: Explore the Ecosystem

1. Navigate to the **Ecosystem** page.
2. View the interactive network graph of actors and relationships.
3. Ghost Nodes appear with dashed edges. Click any node for details.

## Step 6: Compare Documents

1. Upload a second document (different jurisdiction).
2. Run analyses on both.
3. Navigate to **Comparison** and select both documents.
4. View: divergent definitions, shared structural spines, and axes of divergence.

## Step 7: Generate TST Meta-Synthesis

1. After analysing multiple documents, go to the **Theory** tab on the Data page.
2. Select all sources and click **Generate Theory**.
3. View the five-column TST schema: Portable Vocabularies, Local Translations, Embedding Infrastructures, Apex Nodes, Contestation Dynamics.
4. Review proposition evaluation and stratified legibility findings.

## Step 8: Export

- **DOCX Report**: Click **Export** for a comprehensive document with embedded visualisations.
- **JSON/CSV**: Export ecosystem graph data for Gephi or Kumu.

---

## What Each Analysis Tab Shows

| Tab | Outputs |
|---|---|
| **Cultural Framing** | Cultural Distinctiveness Score, State-Market-Society comparison, Technology Role, Rights Conception |
| **Institutional Logics** | Logic Strength bars (Market/State/Professional/Community), Dominant Logic, Material & Discursive manifestations, Logic Conflicts |
| **Ecosystem** | Interactive network graph, actor detail panels, mediator/intermediary classifications |
| **Ghost Nodes** | Absence scores, evidence grades, ghost types, counterfactual power tests, analyst assessments |
| **Ontology** | Conceptual map, cross-jurisdictional concept distances |
| **TST / Theory** | Five-column schema, proposition evaluation, stratified legibility |

---

## Troubleshooting

**"Analysis failed"**
- Ensure `OPENAI_API_KEY` is set in `.env.local` and the dev server has been restarted.

**"No documents found"**
- Upload a PDF on the Data page first.

**Results seem cached**
- Click the refresh/bypass-cache option to force a new analysis.

---

*Live demo: https://policyprism.io | Full docs: [USER_MANUAL.md](./USER_MANUAL.md)*
