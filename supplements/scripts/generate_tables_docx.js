const { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, WidthType, AlignmentType, HeadingLevel, ShadingType } = require('docx');
const fs = require('fs');

// --- Styling helpers ---
const headerShading = { type: ShadingType.SOLID, color: "1e293b" };
const altRowShading = { type: ShadingType.SOLID, color: "f8fafc" };
const headerText = (text) => new Paragraph({
    children: [new TextRun({ text, bold: true, color: "ffffff", font: "Calibri", size: 18 })],
    spacing: { before: 40, after: 40 },
});
const cellText = (text, bold = false, size = 18) => new Paragraph({
    children: [new TextRun({ text, bold, font: "Calibri", size, italics: false })],
    spacing: { before: 30, after: 30 },
});

const borders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
};

function makeHeaderRow(cells, widths) {
    return new TableRow({
        tableHeader: true,
        children: cells.map((text, i) => new TableCell({
            children: [headerText(text)],
            shading: headerShading,
            borders,
            width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
        })),
    });
}

function makeRow(cells, widths, shade = false) {
    return new TableRow({
        children: cells.map((text, i) => new TableCell({
            children: [cellText(text)],
            borders,
            shading: shade ? altRowShading : undefined,
            width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
        })),
    });
}

function makeTable(headerCells, rows, widths) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            makeHeaderRow(headerCells, widths),
            ...rows.map((r, i) => makeRow(r, widths, i % 2 === 1)),
        ],
    });
}

const sectionTitle = (text) => new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    run: { font: "Calibri", bold: true },
});

const sectionSubtitle = (text) => new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 300, after: 150 },
});

const bodyPara = (text) => new Paragraph({
    children: [new TextRun({ text, font: "Calibri", size: 20 })],
    spacing: { before: 100, after: 100 },
});

// ===================================================================
// DOCUMENT
// ===================================================================

const doc = new Document({
    styles: {
        default: {
            document: { run: { font: "Calibri", size: 20 } },
        },
    },
    sections: [{
        properties: {
            page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
        },
        children: [
            // Title
            new Paragraph({
                children: [new TextRun({ text: "GNDP v1.0 — Ghost Node Detection Protocol", bold: true, font: "Calibri", size: 28 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
            }),
            new Paragraph({
                children: [new TextRun({ text: "Online Supplement: Detailed Tables", font: "Calibri", size: 22, color: "64748b" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),

            // Table S1: Pipeline Architecture
            sectionTitle("Table S1. Multi-Pass Pipeline Architecture"),
            makeTable(
                ["Stage", "Model", "Purpose"],
                [
                    ["Pass 1A — Structural Extraction", "GPT-4o-mini", "Extract formal actors, affected claims, and obligatory passage points (OPPs)"],
                    ["Pass 1B — Candidate Synthesis", "GPT-4o-mini", "Identify 8–12 absent-actor candidates via negation; triage by preliminary absence strength"],
                    ["Pass 1.5 — NegEx Filtering", "Rule-based", "Eliminate false positives by detecting explicit exclusion language"],
                    ["Pass 2 — Deep Dive", "GPT-4o", "Evidence grading, typology assignment, and weighted absence scoring"],
                    ["Pass 3 — Counterfactual Test", "GPT-4o", "Quarantined speculation: project impacts of hypothetical inclusion at governance chokepoints"],
                    ["Analyst Review", "Human", "Three-criterion reflexive assessment with immutable provenance chain"],
                ],
                [25, 15, 60]
            ),

            // Table S2: Evidence Grades
            sectionTitle("Table S2. Evidence Grades and Consequences"),
            makeTable(
                ["Grade", "Name", "Definition", "Consequence"],
                [
                    ["E4", "Explicit Exclusion", "Direct denial, boundary language, \"only X\" enumeration", "Full scoring and typology permitted"],
                    ["E3", "Structural Framing", "Enumerated roles systematically omit candidate", "Full scoring and typology permitted"],
                    ["E2", "Weak/Speculative", "Non-mention only; no enumerations or boundary language", "absenceScore = null; ghostType = null; isValid = false"],
                    ["E1", "No Evidence", "No textual evidence at all", "absenceScore = null; ghostType = null; isValid = false"],
                ],
                [8, 18, 42, 32]
            ),

            // Table S3: Weighted Scoring
            sectionTitle("Table S3. Weighted Absence Scoring Dimensions (100-point scale)"),
            makeTable(
                ["Dimension", "Max Points", "Definition"],
                [
                    ["Material Impact", "30", "Severity of distributional or livelihood consequences borne by the absent actor"],
                    ["OPP Exclusion", "25", "Degree to which the actor is locked out of governance decision gates"],
                    ["Sanction Absence", "20", "Whether the actor lacks any means to trigger enforcement or accountability"],
                    ["Data Invisibility", "15", "Extent to which the actor's harms are rendered illegible by the policy's data categories"],
                    ["Representation Gap", "10", "Deficit in formal voice: direct, collective, or proxy participation"],
                ],
                [22, 13, 65]
            ),

            // Table S4: Validation Tiers
            sectionTitle("Table S4. Validation Tiers"),
            makeTable(
                ["Tier", "Score Range", "Evidence Grade", "Criteria"],
                [
                    ["Tier 1", "61–100", "E4", "Explicit exclusion: direct denial, restricted standing, or definitional scope boundaries"],
                    ["Tier 2", "36–60", "E3", "Structural exclusion by framing: systematic absence from enumerated actor lists"],
                    ["Tier 3", "0–35", "E1/E2", "Speculative omission: non-mention without boundary-setting language. Typically invalidated."],
                ],
                [10, 14, 14, 62]
            ),

            // Table S5a: Ghost Types
            sectionTitle("Table S5a. Ghost Type — Mechanism of Absence"),
            makeTable(
                ["Type", "Definition", "Example"],
                [
                    ["Structural", "Excluded from formal governance architecture", "Worker unions absent from conformity assessment procedures"],
                    ["Data", "Experience not measured within compliance structures", "Gig workers' harms not captured by employment-category metrics"],
                    ["Representational", "Proxy speaks without accountability or binding representation", "Consumer groups invoked but with no standing to challenge outcomes"],
                    ["Scale", "Present at one governance scale but absent at another", "Municipal-level AI deployments absent from national-level frameworks"],
                    ["Temporal", "Affected later but excluded from early-stage design", "Future generations absent from risk classification procedures"],
                    ["Supply Chain", "Hidden upstream/downstream labour or resource contribution", "Data labellers absent from AI supply-chain governance"],
                ],
                [18, 42, 40]
            ),

            // Table S5b: Absence Type
            sectionTitle("Table S5b. Absence Type — Epistemic Register"),
            makeTable(
                ["Type", "Definition"],
                [
                    ["Methodological", "Excluded by definitions or metrics — the categories used to measure governance effects do not capture this actor"],
                    ["Practical", "Excluded by procedural barriers — participation pathways exist in principle but are inaccessible in practice"],
                    ["Ontological", "Excluded by what the document treats as real — the actor's existence or relevance is not recognised within the governance ontology"],
                ],
                [20, 80]
            ),

            // Table S5c: Exclusion Type
            sectionTitle("Table S5c. Exclusion Type — Mode of Exclusion"),
            makeTable(
                ["Type", "Definition"],
                [
                    ["Active", "Explicit prohibition: the document states the actor is excluded or the regulation does not apply"],
                    ["Passive", "Silent omission: the actor is absent without any exclusionary language"],
                    ["Structural", "Passive omission compounded by enumerated framing: the document lists qualifying actors and the candidate is not among them"],
                ],
                [20, 80]
            ),

            // Table S5d: Node Standing
            sectionTitle("Table S5d. Node Standing — Epistemic Status"),
            makeTable(
                ["Standing", "Definition"],
                [
                    ["Mention only", "Named in the document but without governance function or procedural role"],
                    ["Standing candidate", "Governance signals imply potential participation but no formal mechanism is provided"],
                    ["Structural ghost", "Confirmed absent despite high functional relevance — the prototypical Ghost Node"],
                ],
                [22, 78]
            ),

            // Table S6: Counterfactual Power Test Outputs
            sectionTitle("Table S6. Counterfactual Power Test — Structured Outputs"),
            makeTable(
                ["#", "Output", "Description"],
                [
                    ["1", "Chokepoint (Role Semantics)", "Specific procedural mechanism, OPP type, standing actor, obligated actor, obligation type"],
                    ["2", "Scenario Statement", "Conditional statement (max 300 chars): \"If [standing actor] had standing to [trigger]…\""],
                    ["3", "Estimated Impact + Enforcement Ladder", "Impact level (None/Moderate/Transformative), guidance bindingness, escalation sequence (max 6 steps)"],
                    ["4", "Typed Mechanism Chain", "3–8 ordered steps: EvidenceCollection → Aggregation → Admissibility → ReviewInitiation → ResponseDueProcess → RemedyEnforcement → Deterrence"],
                    ["5", "Beneficiary Mechanisms", "Actors benefiting from ghost node's absence, with causal mechanism referencing chain steps"],
                    ["6", "Shielded Actors", "Actors insulated from accountability by the exclusion"],
                    ["7", "Confidence Assessment", "Evidence base, speculative confidence, grounded/inferred/unknown epistemic partition, explicit assumptions"],
                ],
                [5, 28, 67]
            ),

            // Table S7: Why Quarantined Speculation
            sectionTitle("Table S7. Why Quarantined Speculation"),
            bodyPara("Rationale for structural separation of counterfactual reasoning from evidentiary assessment."),
            makeTable(
                ["Concern", "If Mixed with Evidence", "GNDP Design Response"],
                [
                    ["Probabilistic closure", "LLMs fill structural absences with plausible inferences, inflating ghost node counts", "Evidence-gated scoring (E1/E2 → invalid) ensures only textually grounded candidates reach counterfactual analysis"],
                    ["Epistemic contamination", "Counterfactual reasoning may retroactively increase confidence in weak evidence", "Pass 3 is structurally isolated from Pass 2; counterfactual outputs cannot modify absence scores or evidence grades"],
                    ["Advocacy risk", "Scenarios presented as analysis may function as advocacy for specific reforms", "All outputs explicitly conditional; analytical challenges (downsides) mandatory; epistemic partition prevents silent upgrades"],
                    ["Hegemonic framing", "Training corpora encode Global North governance assumptions as defaults", "Pass 1B prohibits assuming Western-centric governance norms; extraction anchored in document text only"],
                    ["Semantic compression", "Rhetorical mention and procedural standing may collapse in model output", "Two-criterion gate (Textual Invocation + Structural Foreclosure) requires separate evidence for each"],
                    ["Reproducibility", "Unconstrained speculation cannot be reproduced or audited", "Typed mechanism chains, enforcement ladder constraints, role semantics, and explicit assumptions create structured, inspectable output"],
                ],
                [18, 38, 44]
            ),

            // Table S8: Analyst Reflexive Assessment
            sectionTitle("Table S8. Analyst Reflexive Assessment"),
            makeTable(
                ["Field", "Values", "Definition"],
                [
                    ["Assessment Status", "Proposed / Confirmed / Contested / Deferred", "Analyst's current verdict on the ghost node"],
                    ["Functional Relevance", "Boolean", "A plausible governance function exists for which the actor could have been responsible"],
                    ["Textual Trace", "Boolean", "The regime identifies the actor as having an interest but precludes participation as an agent"],
                    ["Structural Foreclosure", "Boolean", "The procedural architecture eliminates any avenue for complaint or governance involvement"],
                    ["Moral Status", "Moral patient / Moral agent / Both / Undetermined", "Floridi-informed classification of the ghost node's moral standing"],
                    ["Reflexive Note", "Free text", "Analyst records how their positionality may shape the reading; preserved as immutable provenance entry"],
                ],
                [20, 32, 48]
            ),

            // Footer
            new Paragraph({ spacing: { before: 600 } }),
            new Paragraph({
                children: [new TextRun({
                    text: "GNDP v1.0 — Ghost Node Detection Protocol. Part of the Policy Prism analytical framework.",
                    font: "Calibri", size: 16, italics: true, color: "94a3b8"
                })],
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [new TextRun({
                    text: "Source: https://github.com/tsedbrpp/scratch",
                    font: "Calibri", size: 16, italics: true, color: "94a3b8"
                })],
                alignment: AlignmentType.CENTER,
            }),
        ],
    }],
});

// Generate
Packer.toBuffer(doc).then(buffer => {
    const outPath = process.argv[2] || 'GNDP_v1.0_Tables.docx';
    fs.writeFileSync(outPath, buffer);
    console.log(`Generated: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
});
