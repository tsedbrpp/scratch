import { Document, Packer, Paragraph, TextRun, ExternalHyperlink, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType } from 'docx';
import * as fs from 'fs';

const REPO = 'https://anonymous.4open.science/r/scratch-41CE';
const FONT = 'Times New Roman';
const SZ = 24;
const SZ_SM = 20;
const HEADING_COLOR = '1a1a2e';
const HEADER_BG = 'e8e8e8';
const LINK_COLOR = '2d6cdf';
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: 'aaaaaa' };
const CB = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

// Helpers
const bold = (t, s) => new TextRun({ text: t, font: FONT, size: s ?? SZ, bold: true, color: HEADING_COLOR });
const normal = (t, s) => new TextRun({ text: t, font: FONT, size: s ?? SZ });
const italic = (t, s) => new TextRun({ text: t, font: FONT, size: s ?? SZ, italics: true, color: '555555' });
const codeTxt = (t) => new TextRun({ text: t, font: 'Consolas', size: SZ_SM, color: '6c5ce7' });

function link(path, label) {
    const url = `${REPO}/${path}`;
    return new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text: label ?? path, font: 'Consolas', size: SZ_SM, color: LINK_COLOR, underline: { type: 'single' } })],
    });
}

function p(children, opts = {}) {
    return new Paragraph({
        spacing: { after: opts.after ?? 120, line: opts.line ?? 276 },
        alignment: opts.align ?? AlignmentType.LEFT,
        heading: opts.heading,
        children: Array.isArray(children) ? children : [normal(children)],
    });
}

function hCell(t) {
    return new TableCell({
        shading: { type: ShadingType.SOLID, color: HEADER_BG },
        borders: CB,
        children: [new Paragraph({ children: [bold(t, SZ_SM)], spacing: { before: 40, after: 40 } })],
    });
}

function cell(runs, w) {
    const c = Array.isArray(runs)
        ? [new Paragraph({ children: runs, spacing: { before: 30, after: 30 } })]
        : [new Paragraph({ children: [normal(runs, SZ_SM)], spacing: { before: 30, after: 30 } })];
    return new TableCell({ borders: CB, width: w ? { size: w, type: WidthType.PERCENTAGE } : undefined, children: c });
}

function tbl(headers, rows) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: headers.map(h => hCell(h)), tableHeader: true }),
            ...rows.map(r => new TableRow({ children: r.map(c => cell(c)) })),
        ],
    });
}

const sp = (n) => p('', { after: n ?? 200 });

// ============================================================
const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: SZ } } } },
    sections: [{
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: [
            // Title
            p([bold('Appendix: Technical Documentation Index', 32)], { align: AlignmentType.CENTER, after: 80 }),
            p([bold('Supplementary Material A1 — Policy Prism Source Code and Technical Protocol', SZ)], { align: AlignmentType.CENTER, after: 200 }),

            // Intro
            p('The complete source code, technical protocol, prompt templates, schema definitions, and validation test suite for Policy Prism are available in a blinded repository for peer review:'),
            p([normal('Repository URL:  '), new ExternalHyperlink({
                link: REPO,
                children: [new TextRun({ text: REPO, font: 'Consolas', size: SZ_SM, color: LINK_COLOR, underline: { type: 'single' } })],
            })], { after: 160 }),
            p('The repository contains the full implementation described in the manuscript, including the Ghost Node Detection Protocol (GNDP v1.1), all eight analytical strata, and the analyst assessment infrastructure. The following tables summarize the contents by category. All file paths are clickable links to the blinded repository.'),

            // ====================== A1.1 ======================
            sp(),
            p([bold('A1.1  Protocol Documentation', 26)], { after: 80 }),
            p('These files document the Ghost Node Detection Protocol, evidence-grading rules, scoring dimensions, pipeline architecture, and analyst assessment criteria referenced in the manuscript.', { after: 120 }),

            tbl(['Document', 'Path', 'Description'], [
                ['Full Protocol (v1.1)', [link('supplements/GNDP_v1.1_full_protocol.md')], 'Complete six-pass pipeline specification: extraction, candidate synthesis, NegEx filtering, evidence grading, counterfactual analysis, and analyst review. Includes worked example, scoring tables, ghost typology, and evidence-grade definitions.'],
                ['Full Protocol (v1.0)', [link('supplements/GNDP_v1.0_full_protocol.md')], 'Archived v1.0 protocol retained for backward compatibility with cached results.'],
                ['Pass 1A — Extraction', [link('supplements/pass_1a_extraction.md')], 'Prompt template for structural extraction of formal actors, affected-population claims, and obligatory passage points.'],
                ['Pass 1B — Candidate Synthesis', [link('supplements/pass_1b_candidates.md')], 'Prompt template for candidate synthesis via structural subtraction. Includes v1.1 subsumption pathway detection and three-gate evidentiary filter.'],
                ['Pass 2 — Evidence Grading', [link('supplements/pass_2_deep_dive.md')], 'Prompt template for forensic evidence grading (E1–E4), weighted absence scoring (100-point scale), ghost typology assignment, and v1.1 schematic adequacy assessment.'],
                ['Pass 3 — Counterfactual Analysis', [link('supplements/pass_3_counterfactual.md')], 'Prompt template for quarantined counterfactual reasoning with role semantics, enforcement ladders, and mandatory analytical challenges.'],
                ['Validation and Limitations', [link('supplements/validation_and_limitations.md')], 'Epistemic safeguards, known limitations, and edge cases.'],
                ['Schema Reference', [link('supplements/schema_reference.md')], 'JSON output schemas for all analytical types, including ghost node, TEA analysis, and ecosystem network.'],
                ['System Architecture', [link('supplements/system_architecture_diagram.md')], 'Pipeline diagrams for the eight-layer analytical framework and GNDP v1.1 pipeline.'],
                ['Prompt Registry', [link('supplements/prompt_registry_reference.md')], 'Registry of 36 prompt definitions across eight analytical strata.'],
                ['Analytical Modes Inventory', [link('supplements/analytical_modes_inventory.md')], 'Inventory of all analytical modes with theoretical grounding, prompt IDs, source files, and output types.'],
            ]),

            // ====================== A1.2 ======================
            sp(),
            p([bold('A1.2  Source Code — Ghost Node Detection Pipeline', 26)], { after: 80 }),
            p([normal('The core implementation of the GNDP pipeline described in the manuscript. All files are in '), link('src/lib/ghost-nodes', 'src/lib/ghost-nodes/'), normal('.')], { after: 120 }),

            tbl(['File', 'Lines', 'Description'], [
                [[link('src/lib/ghost-nodes/types.ts', 'types.ts')], '441', 'TypeScript type definitions: ghost pathways, subsumption gates, schematic adequacy, score breakdowns, evidence grades, analyst assessment, and provenance chain types.'],
                [[link('src/lib/ghost-nodes/schemas.ts', 'schemas.ts')], '314', 'Zod runtime validation schemas for all four pipeline passes. Enforces evidence-gating rules, score ranges, and output structure at runtime.'],
                [[link('src/lib/ghost-nodes/core.ts', 'core.ts')], '578', 'Pipeline orchestrator: executes Pass 1A → 1B → 1.5 → 2 → 3 sequentially, with schema validation at each stage.'],
                [[link('src/lib/ghost-nodes/negex.ts', 'negex.ts')], '145', 'NegEx filter (Pass 1.5): rule-based detection of explicit exclusion language and v1.1 subsumption override detection. No LLM involved.'],
                [[link('src/lib/ghost-nodes/prompt-builders.ts', 'prompt-builders.ts')], '169', 'Prompt construction for each pipeline pass, with variable injection and context assembly.'],
                [[link('src/lib/ghost-nodes/constants.ts', 'constants.ts')], '153', 'Negation triggers, pseudo-negation patterns, scope terminators, discourse taxonomy.'],
                [[link('src/lib/ghost-nodes/validation.ts', 'validation.ts')], '173', 'Response validation and trigram similarity for fuzzy rescue checks.'],
                [[link('src/lib/ghost-nodes/parser.ts', 'parser.ts')], '140', 'Document section parser for structured text extraction.'],
                [[link('src/lib/ghost-nodes/normalizeGhostNode.ts', 'normalizeGhostNode.ts')], '31', 'Backward compatibility normalizer: infers v1.1 fields for cached v1.0 results.'],
                [[link('src/lib/ghost-nodes/normalizeCounterfactual.ts', 'normalizeCounterfactual.ts')], '121', 'Normalizer for counterfactual output across schema versions.'],
                [[link('src/lib/ghost-nodes/utils.ts', 'utils.ts')], '107', 'Ghost node detection utilities, batch processing, and deduplication.'],
                [[link('src/lib/ghost-nodes/index.ts', 'index.ts')], '8', 'Module exports.'],
            ]),

            p([bold('Test suite: ', SZ_SM), link('src/lib/ghost-nodes/__tests__/gndp-schemas.test.ts', 'gndp-schemas.test.ts'), normal(' (507 lines) — golden-file validation tests for all four pipeline passes, evidence-grade gating, score-range enforcement, and schema compliance.', SZ_SM)]),

            // ====================== A1.3 ======================
            sp(),
            p([bold('A1.3  Source Code — Prompt Templates', 26)], { after: 80 }),
            p([normal('Prompt definitions for all eight analytical strata. All files are in '), link('src/lib/prompts', 'src/lib/prompts/'), normal('.')], { after: 120 }),

            tbl(['File', 'Description'], [
                [[link('src/lib/prompts/gndp-v1.ts', 'gndp-v1.ts')], 'Ghost Node Detection Protocol v1.1 prompt templates (Pass 1A, 1B, 2, 3).'],
                [[link('src/lib/prompts/registry.ts', 'registry.ts')], 'Centralized prompt registry (36 prompt definitions).'],
                [[link('src/lib/prompts/ecosystem.ts', 'ecosystem.ts')], 'Ecosystem impact mapping prompts (ANT + Assemblage hybrid).'],
                [[link('src/lib/prompts/assemblage.ts', 'assemblage.ts')], 'Assemblage extraction prompts (Deleuze and Guattari, DeLanda).'],
                [[link('src/lib/prompts/ant-mediators.ts', 'ant-mediators.ts')], 'ANT mediator analysis prompts (Latour intermediary/mediator).'],
                [[link('src/lib/prompts/institutional-logics.ts', 'institutional-logics.ts')], 'Institutional logics prompts (Thornton, Ocasio, and Lounsbury).'],
                [[link('src/lib/prompts/cultural-framing.ts', 'cultural-framing.ts')], 'Cultural framing and discourse analysis prompts.'],
                [[link('src/lib/prompts/ontology.ts', 'ontology.ts')], 'Ontology extraction and comparison prompts.'],
                [[link('src/lib/prompts/resistance-analysis.ts', 'resistance-analysis.ts')], 'Resistance and counter-conduct analysis prompts.'],
                [[link('src/lib/prompts/critique.ts', 'critique.ts')], 'Critique panel simulation (Decolonial, ANT, Legal reviewers).'],
                [[link('src/lib/prompts/stress-test.ts', 'stress-test.ts')], 'Adversarial stress-test prompts.'],
                [[link('src/lib/prompts/comparative-synthesis.ts', 'comparative-synthesis.ts')], 'Cross-document comparative synthesis prompts.'],
                [[link('src/lib/prompts/controversy-mapping.ts', 'controversy-mapping.ts')], 'Controversy mapping prompts.'],
                [[link('src/lib/prompts/abstract-machine.ts', 'abstract-machine.ts')], 'Abstract machine extraction prompts.'],
                [[link('src/lib/prompts/structural-concern.ts', 'structural-concern.ts')], 'Structural concern analysis prompts.'],
                [[link('src/lib/prompts/legitimacy.ts', 'legitimacy.ts')], 'Legitimacy claims analysis prompts.'],
                [[link('src/lib/prompts/dsf.ts', 'dsf.ts')], 'Discursive strategy framework prompts.'],
            ]),

            // ====================== A1.4 ======================
            sp(),
            p([bold('A1.4  Source Code — Analyst Assessment Interface', 26)], { after: 80 }),
            p([normal('The analyst-in-the-loop components that implement contestability and the immutable provenance chain. Located in '), link('src/components/analysis', 'src/components/analysis/'), normal('.')], { after: 120 }),

            tbl(['File', 'Description'], [
                [[link('src/components/analysis/GhostNodeReflexiveAssessment.tsx', 'GhostNodeReflexiveAssessment.tsx')], 'Three-criterion rubric interface (functional relevance, textual invocation, structural foreclosure). Implements immutable provenance chain, positionality recording, contest-reason capture, v1.1 subsumption judgment, and evidence-to-criterion mapping.'],
                [[link('src/components/analysis/GhostNodeAssessmentSummary.tsx', 'GhostNodeAssessmentSummary.tsx')], 'Aggregate assessment dashboard showing confirmation rates, provenance chain statistics, and contested entries.'],
                [[link('src/components/analysis/TransparencyPanel.tsx', 'TransparencyPanel.tsx')], 'Full prompt and model-output transparency panel for audit purposes.'],
                [[link('src/components/analysis/AIAuditPanel.tsx', 'AIAuditPanel.tsx')], 'AI interaction audit log for methodological accountability.'],
                [[link('src/lib/ghost-node-store.ts', 'ghost-node-store.ts')], 'Redis-backed atomic storage with SHA-256 fingerprinting and immutable history append (no overwrite of prior entries).'],
            ]),

            // ====================== A1.5 ======================
            sp(),
            p([bold('A1.5  Correspondence Between Manuscript Claims and Source Artifacts', 26)], { after: 80 }),
            p('The following table maps key methodological claims made in the manuscript to the specific artifacts that substantiate them.', { after: 120 }),

            tbl(['Manuscript Claim', 'Artifact'], [
                ['Evidence grades E1–E4 with automatic invalidation', [link('src/lib/ghost-nodes/schemas.ts', 'schemas.ts'), normal(' (line 27); ', SZ_SM), link('src/lib/ghost-nodes/core.ts', 'core.ts'), normal(' (lines 363–389)', SZ_SM)]],
                ['Five-dimensional absence score (100-point scale)', [link('src/lib/ghost-nodes/types.ts', 'types.ts'), normal(' (lines 172–180); ', SZ_SM), link('src/lib/ghost-nodes/schemas.ts', 'schemas.ts'), normal(' (lines 35–43)', SZ_SM)]],
                ['Three-criterion analyst rubric', [link('src/components/analysis/GhostNodeReflexiveAssessment.tsx', 'GhostNodeReflexiveAssessment.tsx'), normal(' (lines 155–179)', SZ_SM)]],
                ['Immutable provenance chain', [link('src/lib/ghost-node-store.ts', 'ghost-node-store.ts'), normal(' (lines 96–124); ', SZ_SM), link('src/lib/ghost-nodes/types.ts', 'types.ts'), normal(' (lines 62–84)', SZ_SM)]],
                ['Counterfactual quarantine from evidentiary assessment', [link('supplements/GNDP_v1.1_full_protocol.md', 'GNDP_v1.1_full_protocol.md'), normal(' (§9)', SZ_SM)]],
                ['NegEx false-positive filtering (rule-based, no LLM)', [link('src/lib/ghost-nodes/negex.ts', 'negex.ts'), normal(' (lines 1–89)', SZ_SM)]],
                ['Six-pass pipeline architecture', [link('src/lib/ghost-nodes/core.ts', 'core.ts'), normal(' (full file); ', SZ_SM), link('supplements/GNDP_v1.1_full_protocol.md', 'GNDP_v1.1_full_protocol.md'), normal(' (§2)', SZ_SM)]],
                ['Schema-constrained outputs (Zod validation)', [link('src/lib/ghost-nodes/core.ts', 'core.ts'), normal(' (lines 198, 237, 336, 482)', SZ_SM)]],
                ['Positionality recording', [link('src/components/analysis/GhostNodeReflexiveAssessment.tsx', 'GhostNodeReflexiveAssessment.tsx'), normal(' (line 166)', SZ_SM)]],
                ['Rejection preserved in provenance chain', [link('src/lib/ghost-node-store.ts', 'ghost-node-store.ts'), normal(' (lines 100–107)', SZ_SM)]],
                ['Worked example: EU AI Act worker analysis', [link('supplements/GNDP_v1.1_full_protocol.md', 'GNDP_v1.1_full_protocol.md'), normal(' (§14)', SZ_SM)]],
            ]),

            // Footer
            sp(),
            p([italic('Supplementary Material A1 accompanies: [TITLE REDACTED FOR REVIEW]. Submitted to Information & Organization, Special Issue: Algorithmic Assemblages — Fields, Ecosystems, and Platforms.')], { align: AlignmentType.CENTER }),
        ],
    }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('./supplements/Appendix_Technical_Documentation_v2.docx', buffer);
console.log('✅ Appendix_Technical_Documentation_v2.docx created (with live links)');
