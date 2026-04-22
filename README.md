# Policy Prism

**An open-source research platform for critical analysis of AI governance policy through Actor-Network Theory and Assemblage Theory.**

[![Live Demo](https://img.shields.io/badge/demo-policyprism.io-blue)](https://policyprism.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

---

## Overview

Policy Prism transforms static policy documents into dynamic, multi-dimensional analytical artefacts. It maps actors, relationships, structural absences, and governance architectures across jurisdictions using a coordinated LLM ensemble and an eight-layer analytical framework grounded in Actor-Network Theory (ANT) and Assemblage Theory.

### Core Capabilities

- **Multi-Lens Analysis** — 30+ versioned theoretical lenses (Institutional Logics, Cultural Framing, Legitimacy, Resistance, Abstract Machine Extraction)
- **Ghost Node Detection (GNDP v1.0)** — Four-pass pipeline identifying structurally significant absences with evidence-gated scoring, counterfactual power testing, and analyst reflexive assessment
- **Ecosystem Mapping** — Interactive force-directed network graphs with typed edges (Power, Logic, Ghost) and mediator/intermediary classification
- **Translational Stratification Theory (TST)** — Dual-track meta-synthesis producing five-column structured extraction and proposition evaluation
- **Comparative Synthesis** — Cross-document divergence analysis identifying shared structural spines and axes of divergence
- **Empirical Grounding** — Integrated web search surfacing real-world resistance and counter-conduct evidence

### Design Principles

| Principle | Description |
|---|---|
| **Traceability** | Every claim grounded in verbatim textual evidence with provenance tracking |
| **Contestability** | Analyst override, disagreement logging, positionality recording |
| **Productive Friction** | Surfaces ambiguity and contradiction rather than resolving prematurely |

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| LLM Ensemble | GPT-4o (analysis), GPT-4o-mini (parsing), Gemini 1.5 Flash (search) |
| Data | Redis (Upstash) |
| Auth | Clerk |
| Visualisation | D3.js, React Force Graph, Recharts |

---

## Quick Start

```bash
# Clone
git clone https://github.com/tsedbrpp/scratch.git
cd scratch

# Install
npm install

# Configure (copy and edit .env.local)
cp .env.example .env.local

# Run
npm run dev
```

See [AI Analysis Setup](./supplements/documentation/AI_ANALYSIS_SETUP.md) for environment variable configuration.

---

## Documentation

### System & User Documentation

| Document | Description |
|---|---|
| [System Documentation](./supplements/documentation/SYSTEM_DOCUMENTATION.md) | Technical architecture, eight-layer framework, data flow |
| [System Description](./supplements/documentation/SYSTEM_DESCRIPTION.md) | Core capabilities overview |
| [User Manual](./supplements/documentation/USER_MANUAL.md) | Comprehensive user guide |
| [User Guide](./supplements/documentation/USER_DOCUMENTATION.md) | Concise quick-reference |
| [Research Workflow](./supplements/documentation/RESEARCH_WORKFLOW.md) | Five-phase research methodology |
| [Quick Start](./supplements/documentation/QUICK_START_CFP.md) | Eight-step guide from upload to export |
| [AI Analysis Setup](./supplements/documentation/AI_ANALYSIS_SETUP.md) | LLM configuration and API setup |
| [Deployment](./supplements/documentation/DEPLOY.md) | Vercel deployment instructions |

### Research Supplements

| Document | Description |
|---|---|
| [GNDP v1.0 Full Protocol](./supplements/GNDP_v1.0_full_protocol.md) | Complete Ghost Node Detection Protocol specification |
| [GNDP Tables (Word)](./supplements/GNDP_v1.0_Tables.docx) | Formatted supplement tables (S1–S8) |
| [Prompt Registry Reference](./supplements/prompt_registry_reference.md) | All 30+ analysis prompts with IDs and descriptions |
| [Analytical Modes Inventory](./supplements/analytical_modes_inventory.md) | Every analytical surface with theoretical grounding |
| [Schema Reference](./supplements/schema_reference.md) | JSON output schemas for key analytical types |
| [Validation & Limitations](./supplements/validation_and_limitations.md) | Known limitations, failure modes, and safeguards |

### Prompt Templates

| Pass | Description |
|---|---|
| [Pass 1A](./supplements/pass_1a_extraction.md) | Structural extraction (actors, claims, OPPs) |
| [Pass 1B](./supplements/pass_1b_candidates.md) | Candidate synthesis via structural subtraction |
| [Pass 2](./supplements/pass_2_deep_dive.md) | Evidence grading + weighted scoring |
| [Pass 3](./supplements/pass_3_counterfactual.md) | Counterfactual power test |

---

## Citation

If you use Policy Prism in your research, please cite:

```bibtex
@software{policyprism2026,
  title = {Policy Prism: An Open-Source Platform for Critical Analysis of AI Governance Policy},
  author = {[Author Name]},
  year = {2026},
  url = {https://github.com/tsedbrpp/scratch},
  note = {Live demo: https://policyprism.io}
}
```

See [CITATION.cff](./CITATION.cff) for machine-readable citation metadata.

---

## License

[MIT](./LICENSE)
