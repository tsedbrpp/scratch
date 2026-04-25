/**
 * generate_supplement_index.mjs
 *
 * Generates a Word document listing all supplementary materials for the
 * Policy Prism / I&O manuscript submission.
 *
 * Usage:  node supplements/generate_supplement_index.mjs
 * Output: supplements/Supplementary_Materials_Index.docx
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, HeadingLevel,
  ExternalHyperlink
} from "docx";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── GitHub base ──────────────────────────────────────────────────────────
const GITHUB_BASE =
  "https://anonymous.4open.science/r/scratch-41CE/supplements";
const GITHUB_TREE =
  "https://anonymous.4open.science/r/scratch-41CE/supplements";

// ── Supplementary materials catalogue ────────────────────────────────────
const materials = [
  // ── Category A: GNDP Protocol & Pipeline ──
  {
    category: "A. Ghost Node Detection Protocol (GNDP v1.0)",
    items: [
      {
        id: "A1",
        title: "GNDP v1.0 — Full Technical Supplement",
        file: "GNDP_v1.0_full_protocol.md",
        description:
          "Complete specification of the four-pass Ghost Node Detection Protocol, including pipeline architecture, evidence-gating rules, weighted absence scoring (100-point scale), ghost typology taxonomy, and analyst reflexive assessment criteria. This is the primary methodological supplement referenced in the manuscript (Section 3).",
      },
      {
        id: "A2",
        title: "GNDP v1.0 — Summary Tables",
        file: "GNDP_v1.0_Tables.docx",
        description:
          "Publication-ready tables summarising the GNDP pipeline stages, evidence grading scale (E1–E4), absence scoring dimensions, ghost node typology, and exclusion type classifications.",
      },
      {
        id: "A3",
        title: "Pass 1A — Structural Extraction Prompt",
        file: "pass_1a_extraction.md",
        description:
          "Prompt template for Pass 1A (GPT-4o-mini). Extracts all explicitly named actors, affected-population claims, and obligatory passage points (OPPs) from the source document. No inference or speculation permitted.",
      },
      {
        id: "A4",
        title: "Pass 1B — Candidate Synthesis Prompt",
        file: "pass_1b_candidates.md",
        description:
          "Prompt template for Pass 1B (GPT-4o-mini). Generates 8–10 ghost node candidates via structural subtraction, assessing five GNDP dimensions (material impact, OPP access, sanction power, data visibility, representation type). Includes anti-bias constraint.",
      },
      {
        id: "A5",
        title: "Pass 2 — Deep Dive: Evidence Grading & Classification",
        file: "pass_2_deep_dive.md",
        description:
          "Prompt template for Pass 2 (GPT-4o). Forensic evidence grounding with E1–E4 grading, weighted absence scoring, ghost typology assignment, and full GNDP classification. Evidence grades E1/E2 automatically invalidate candidates.",
      },
      {
        id: "A6",
        title: "Pass 3 — Counterfactual Power Test",
        file: "pass_3_counterfactual.md",
        description:
          "Prompt template for Pass 3 (GPT-4o). Quarantined speculation projecting structural consequences of hypothetical inclusion at governance chokepoints. Structurally isolated from Pass 2 to prevent speculative contamination of evidence grades.",
      },
    ],
  },
  // ── Category B: Schema & Prompt Reference ──
  {
    category: "B. Schema & Prompt Reference",
    items: [
      {
        id: "B1",
        title: "Schema Reference",
        file: "schema_reference.md",
        description:
          "Key JSON output schemas for the system's primary analytical types, including TEA/TLF analysis (Translational Legibility Framework), GNDP ghost node detection, ecosystem mapping, and comparative synthesis. Schemas are implemented as TypeScript interfaces and Zod validation schemas.",
      },
      {
        id: "B2",
        title: "Prompt Registry Reference",
        file: "prompt_registry_reference.md",
        description:
          "Complete inventory of all 36 registered analysis prompts across seven categories: Analysis (18), Extraction (6), Simulation (1), Critique (2), GNDP (2), Theoretical Lenses (4), and Search/Retrieval (2). Each entry includes prompt ID, name, description, and output format.",
      },
      {
        id: "B3",
        title: "Analytical Modes Inventory",
        file: "analytical_modes_inventory.md",
        description:
          "Maps every analytical surface in the system to its theoretical grounding (ANT, Assemblage Theory, Institutional Logics, Orders of Worth, Critical Data Studies, DSF), implementation location, and output type. Organised by the eight-layer analytical framework.",
      },
    ],
  },
  // ── Category C: System Architecture & Validation ──
  {
    category: "C. System Architecture & Validation",
    items: [
      {
        id: "C1",
        title: "System Architecture Diagram",
        file: "system_architecture_diagram.md",
        description:
          "Mermaid-based architecture diagram illustrating the end-to-end analytical pipeline: researcher interaction, document ingestion, LLM ensemble orchestration (GPT-4o, GPT-4o-mini, Gemini 1.5 Flash), eight-layer analysis, GNDP pipeline, TLF meta-synthesis, and export. Accompanied by a rendered PNG.",
      },
      {
        id: "C2",
        title: "System Architecture Diagram (Rendered)",
        file: "system_architecture_diagram.png",
        description:
          "Pre-rendered PNG of the system architecture for inclusion in manuscripts or presentations where Mermaid rendering is not available.",
      },
      {
        id: "C3",
        title: "Validation & Limitations",
        file: "validation_and_limitations.md",
        description:
          "Comprehensive documentation of known limitations (probabilistic closure, training data bias, non-determinism, context compression), epistemic safeguards (evidence gating, quarantined speculation, analyst reflexive assessment, positionality recording), validation strategy (cross-stratum triangulation, schema validation), known edge cases, and cost/performance benchmarks.",
      },
    ],
  },
  // ── Category D: Documentation ──
  {
    category: "D. Platform Documentation",
    items: [
      {
        id: "D1",
        title: "System Overview",
        file: "documentation/SYSTEM_DESCRIPTION.md",
        description:
          "High-level overview of Policy Prism's core capabilities: multi-lens algorithmic analysis, GNDP v1.0, ecosystem mapping, Translational Legibility Framework, comparative synthesis, and empirical grounding. Includes design principles (traceability, contestability, productive friction).",
      },
      {
        id: "D2",
        title: "System Documentation",
        file: "documentation/SYSTEM_DOCUMENTATION.md",
        description:
          "Full technical documentation covering architecture (Next.js 16, TypeScript, Redis, Clerk, Stripe), eight-layer analytical framework, data flow, GNDP pipeline implementation, prompt registry, report export, payments, security, configuration, and deployment.",
      },
      {
        id: "D3",
        title: "Research Workflow",
        file: "documentation/RESEARCH_WORKFLOW.md",
        description:
          "Recommended five-phase research workflow: Data Collection → Micro Analysis (per-document extraction) → Meso Analysis (ecosystem mapping, GNDP, ontology) → Macro Analysis (cultural framing, structural analysis, critique) → Synthesis (comparative, TLF meta-synthesis, reporting).",
      },
      {
        id: "D4",
        title: "User Manual",
        file: "documentation/USER_MANUAL.md",
        description:
          "Comprehensive user manual covering account creation, data management, analysis modes (12+), ecosystem map visualisation, GNDP pipeline operation, analyst reflexive assessment, TLF meta-synthesis, comparative analysis, DOCX/JSON/CSV export, credits/billing, and FAQ.",
      },
      {
        id: "D5",
        title: "User Guide (Condensed)",
        file: "documentation/USER_DOCUMENTATION.md",
        description:
          "Abbreviated user guide covering core workflows: data management, running analyses, ghost node detection, ecosystem map, meta-synthesis, comparative analysis, export, and FAQ.",
      },
      {
        id: "D6",
        title: "Quick Start Guide",
        file: "documentation/QUICK_START_CFP.md",
        description:
          "Step-by-step quick start for running a first analysis in under five minutes: sign in, upload document, run analysis, detect ghost nodes, explore ecosystem, compare documents, generate TLF meta-synthesis, and export results.",
      },
      {
        id: "D7",
        title: "AI Analysis Setup",
        file: "documentation/AI_ANALYSIS_SETUP.md",
        description:
          "Developer setup guide for configuring the LLM ensemble (OpenAI, Google Search, Gemini), environment variables, prompt registry, API endpoint usage, and cost considerations.",
      },
      {
        id: "D8",
        title: "Deployment Guide",
        file: "documentation/DEPLOY.md",
        description:
          "Deployment instructions for three options: Vercel (recommended), self-hosting (Node.js), and Docker. Includes custom domain configuration, environment variable setup, and post-deployment verification checklist.",
      },
      {
        id: "D9",
        title: "Migration Guide: Theoretical Repositioning",
        file: "documentation/MIGRATION_GUIDE.md",
        description:
          "Developer guide for the migration from a conflated ANT/Assemblage system to a three-layer architecture (ANT as method → Assemblage as ontology → Provisional inscriptions). Includes new type system, service layer usage, backward compatibility notes, and theoretical positioning.",
      },
    ],
  },
  // ── Category E: Manuscript Figure ──
  {
    category: "E. Manuscript Figures",
    items: [
      {
        id: "E1",
        title:
          "Figure 5: The Legibility Shield — How Compliance Layers Reproduce Structural Absence",
        file: "figure5_legibility_shield.html",
        description:
          "Interactive HTML figure visualising the compliance architecture described in Section 4.5. Shows governance text cascading through five organisational layers (Standards → Audit → Corporate Legal → Procurement → Internal Documentation), with upward accountability flows to oversight bodies and blocked outward channels to affected communities, producing three largely disconnected accountability circuits. Print-ready (white background, high-contrast, serif captions).",
      },
    ],
  },
];

// ── Helper: build a hyperlink run ────────────────────────────────────────
function linkRun(text, url) {
  return new ExternalHyperlink({
    children: [
      new TextRun({
        text,
        style: "Hyperlink",
        font: "Calibri",
        size: 20,
      }),
    ],
    link: url,
  });
}

// ── Build table rows ─────────────────────────────────────────────────────
function buildRows() {
  const rows = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: ["ID", "Title", "Description", "GitHub Location"].map(
        (label) =>
          new TableCell({
            width: { size: label === "Description" ? 45 : label === "Title" ? 22 : label === "ID" ? 5 : 28, type: WidthType.PERCENTAGE },
            shading: { fill: "2B579A" },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    bold: true,
                    color: "FFFFFF",
                    font: "Calibri",
                    size: 20,
                  }),
                ],
              }),
            ],
          })
      ),
    })
  );

  let rowIndex = 0;
  for (const cat of materials) {
    // Category header row (spanning all 4 columns)
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 4,
            shading: { fill: "D6E4F0" },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cat.category,
                    bold: true,
                    font: "Calibri",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    for (const item of cat.items) {
      const fill = rowIndex % 2 === 0 ? "FFFFFF" : "F2F2F2";
      const githubUrl = item.file.includes("/")
        ? `${GITHUB_BASE}/${item.file}`
        : `${GITHUB_BASE}/${item.file}`;

      rows.push(
        new TableRow({
          children: [
            // ID
            new TableCell({
              shading: { fill },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: item.id, font: "Calibri", size: 20 }),
                  ],
                }),
              ],
            }),
            // Title
            new TableCell({
              shading: { fill },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.title,
                      bold: true,
                      font: "Calibri",
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
            // Description
            new TableCell({
              shading: { fill },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.description,
                      font: "Calibri",
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
            // GitHub Location (hyperlink)
            new TableCell({
              shading: { fill },
              children: [
                new Paragraph({
                  children: [linkRun(item.file, githubUrl)],
                }),
              ],
            }),
          ],
        })
      );
      rowIndex++;
    }
  }

  return rows;
}

// ── Build the document ───────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22 },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
        },
      },
      children: [
        // Title
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "Supplementary Materials Index",
              bold: true,
              font: "Calibri",
              size: 28,
            }),
          ],
        }),
        // Subtitle
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "Policy Prism: Tracing Structural Absence in Algorithmic Governance Assemblages",
              italics: true,
              font: "Calibri",
              size: 22,
              color: "555555",
            }),
          ],
        }),
        // Repo link
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "Repository: ",
              font: "Calibri",
              size: 20,
              color: "555555",
            }),
            linkRun(
              "https://anonymous.4open.science/r/scratch-41CE",
              "https://anonymous.4open.science/r/scratch-41CE"
            ),
            new TextRun({
              text: "  |  Supplements: ",
              font: "Calibri",
              size: 20,
              color: "555555",
            }),
            linkRun(GITHUB_TREE, GITHUB_TREE),
          ],
        }),
        // Intro
        new Paragraph({
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "This document catalogues all supplementary materials accompanying the manuscript. Each entry includes a unique identifier, title, description, and the GitHub location where the full file can be accessed. Materials are organised into five categories: (A) Ghost Node Detection Protocol, (B) Schema & Prompt Reference, (C) System Architecture & Validation, (D) Platform Documentation, and (E) Manuscript Figures.",
              font: "Calibri",
              size: 20,
            }),
          ],
        }),
        // Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: buildRows(),
        }),
        // Footer note
        new Paragraph({
          spacing: { before: 300 },
          children: [
            new TextRun({
              text: `Generated: ${new Date().toISOString().split("T")[0]}. Total supplementary files: ${materials.reduce((n, c) => n + c.items.length, 0)}.`,
              font: "Calibri",
              size: 18,
              color: "888888",
              italics: true,
            }),
          ],
        }),
      ],
    },
  ],
});

// ── Write ────────────────────────────────────────────────────────────────
const buffer = await Packer.toBuffer(doc);
const outPath = join(__dirname, "Supplementary_Materials_Index.docx");
writeFileSync(outPath, buffer);
console.log(`✅ Written: ${outPath}`);
