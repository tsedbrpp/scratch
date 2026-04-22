# instantTEA User Manual

Welcome to the comprehensive user manual for **instantTEA**, a specialized platform designed for analyzing complex socio-technical systems through the theoretical lenses of Actor-Network Theory (ANT) and Assemblage Theory.

This manual will guide you through all aspects of using the system, from getting started to utilizing our advanced theoretical AI analysis pipelines.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
   - [Account Creation](#account-creation)
   - [Dashboard Overview](#dashboard-overview)
   - [Demo Mode vs Admin Mode](#demo-mode-vs-admin-mode)
2. [Data Management](#2-data-management)
   - [Uploading Sources](#uploading-sources)
   - [Supported Formats & Limits](#supported-formats--limits)
3. [Running AI Analyses](#3-running-ai-analyses)
   - [Available Analysis Modes](#available-analysis-modes)
   - [Advanced Structural Analysis](#advanced-structural-analysis)
   - [Running the Survey / Research UI](#running-the-survey--research-ui)
4. [Visualizing Data](#4-visualizing-data)
   - [The Ecosystem Map](#the-ecosystem-map)
   - [Tracing Ghost Nodes](#tracing-ghost-nodes)
   - [Ontology Generation](#ontology-generation)
5. [Advanced Features](#5-advanced-features)
   - [Comparative Synthesis](#comparative-synthesis)
   - [Assemblage Mechanisms](#assemblage-mechanisms)
6. [Credits & Billing](#6-credits--billing)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions)

---

## 1. Getting Started

### Account Creation
1. Navigate to the **Sign Up** page.
2. Enter your email and create a password (or use Google Auth for quick access).
3. **Note:** New accounts typically start with a small number of free credits for trial use so you can explore the features.

### Dashboard Overview
Upon logging in, your **Dashboard** provides an "at-a-glance" view of:
- **Active Sources:** Documents and URLs you have uploaded and indexed.
- **Recent Analyses:** The latest theoretical insights mapped by the AI.
- **Credit Balance:** Remaining credits available for running new AI analyses.

### Demo Mode vs Admin Mode
- **Demo Mode:** If you see a notification about "Demo Mode," you are viewing a read-only, sandboxed version of the app. You can freely explore existing data, view the Ecosystem maps, and examine pre-run analyses, but you cannot upload new files or spend credits. Data in Demo Mode mirrors Admin data but is isolated.
- **Admin/Standard Mode:** The full-featured experience where you define mappings and consume processing credits.

---

## 2. Data Management

### Uploading Sources
Navigate to the **Data** page to manage your primary research materials.
- **Upload File:** Click "Upload Source" to add policy documents, whitepapers, interview transcripts, or academic articles.
- **Add URL:** Paste a link to a web page or article to automatically scrape its textual content.

### Supported Formats & Limits
- **Formats:** PDF files are the primary supported document format.
- **Limit:** 10MB per file.
- **Indexing:** Once uploaded, your document is automatically text-extracted, chunked, and indexed for subsequent AI analysis.

---

## 3. Running AI Analyses

Once a source is available and indexed, you can apply our specialized theoretical lenses to it. 

### Available Analysis Modes
Navigate to a specific source from your list, choose your mode, and hit **Analyze**:
- **Situated Teleology:** Examines the stated goals of the document versus its actual or implicit effects.
- **Normative Attractors:** Identifies what "should" be true according to this text, finding the magnetic centers of moral or procedural gravity.
- **Colonial Blind Spots:** Analyzes whose voice, perspective, or systemic presence is missing from the dominant narrative.

### Advanced Structural Analysis
In addition to standard modes, instantTEA provides structural tools:
- **Structural Concerns:** Evaluates how the text builds systemic rigidities or boundaries.
- **Anti-Structural Concerns:** Looks for elements in the text that dismantle, bypass, or dissolve existing structures (recently integrated). 

### Running the Survey / Research UI
For structured data gathering or rigorous academic review, the **Research Mode** provides a highly specialized survey interface:
- You will be presented with specific questions directly relating to the text.
- Use the **interactive sliders** to input metrics such as your *confidence* level, identified *missing roles*, present *institutional logics*, and *reflexivity*.
- Changes are tracked and partially saved as you interact, ensuring your research data is seamlessly logged.

---

## 4. Visualizing Data

### The Ecosystem Map
The **Ecosystem** page is the heart of instantTEA. It provides an interactive node graph visualizing the actors and relationships you have traced across your documents.
- **Nodes (Actors):** Entities found in your texts (e.g., "European Commission", "High-Risk AI System").
- **Edges (Relations):** How these actors interact (e.g., "regulates", "prohibits", "funds").
- **Side Panels:** 
  - *Left Panel:* A searchable, filterable list of all identified actors.
  - *Right Panel:* A detailed breakdown of the selected actor's capacities, mechanisms, and referenced text portions.

### Tracing Ghost Nodes
Sometimes the most important actors in a system are the ones not explicitly named.
- **Ghost Node Detection:** The system uses a two-pass pipeline to infer the presence of "Ghost Nodes" based on institutional logics. 
- You can **trace** these ghost nodes directly within the Ecosystem Map to see how unspoken rules or missing stakeholders exert gravity on the explicitly named actors.

### Ontology Generation
The **Ontology** page allows you to generate a high-level conceptual map of your research domain.
- Use the **Generate Map** button to force the AI to synthesize your current sources into a coherent ontology of concepts.
- *Note:* Bypassing the cache allows you to generate fresh ontologies as you add more data.

---

## 5. Advanced Features

### Comparative Synthesis
Use the **Synthesis** page to compare two or more documents or data sets.
- Select Source A and Source B.
- The AI will generate a synthesis report highlighting:
  - **Divergent Definitions:** How do the sources define core concepts (like "Risk" or "Fairness") differently?
  - **Conflict Points:** Where do their policies or stated logics clash?

### Assemblage Mechanisms
Dive deeper into how the socio-technical network stabilizes or destabilizes:
- **Territorialization:** Processes and actors that stabilize the identity of the assemblage (e.g., strict legal definitions, compliance standards).
- **Deterritorialization:** Forces that destabilize, open up, or shift the assemblage (e.g., ambiguous language, disruptive new technologies).

---

## 6. Credits & Billing

### Understanding Credits
- **1 Credit** = 1 AI Analysis Request (e.g., running Normative Attractor analysis on a document).
- **Free Actions:** Viewing existing results, exploring graphs, and uploading documents do not consume credits.

### Topping Up
1. Click the **Credits** badge in the sidebar or header.
2. Select a package (e.g., "Research Bundle").
3. Complete payment via our secure Stripe integration.
4. Credits are added immediately upon successful payment.

---

## 7. Frequently Asked Questions (FAQ)

**Q: Is my data used to train AI models?**  
A: **No.** We strictly segment user data. Your uploaded documents and generated insights are not used for generalized model training.

**Q: Can I export my graph?**  
A: Yes. On the Ecosystem page, specific export options allow you to download the graph data as JSON or CSV for use in tools like Gephi or Kumu.

**Q: Why is my "Generate Map" button not showing new data?**  
A: It's possible the ontology is cached. Click the button again (it is now configured to forcefully bypass cache when requested) to fetch the latest nodes.

**Q: What do the sliders do in the Survey UI?**  
A: The sliders capture your qualitative assessment of the AI's extraction (e.g., your confidence in the output, the degree of institutional logic present). This data is saved alongside the analysis for rigorous academic review and exported as part of your study configuration.

---

*Need more help? Contact support via the Help menu or refer to SYSTEM_DOCUMENTATION.md for technical backend details.*
