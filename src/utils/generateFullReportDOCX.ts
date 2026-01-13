import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";
// import { Source } from "../types"; // Imported via ReportData
import { ReportData, ReportSectionSelection } from "../types/report";
import { Source } from "../types";
import { CulturalAnalysisResult } from "../types/cultural";
import { calculateMicroFascismRisk } from "../lib/risk-calculator";
import { calculateLiberatoryCapacity } from "../lib/liberatory-calculator";

// --- Configuration ---

const STYLE = {
    fonts: {
        normal: "Helvetica",
        header: "Helvetica",
    },
    colors: {
        primary: "0F172A",   // Slate 900
        secondary: "334155", // Slate 700
        text: "000000",      // Black
        meta: "64748B",      // Slate 500
        subtle: "94A3B8",    // Slate 400
        accent: "F1F5F9",    // Slate 100
        danger: "B91C1C",    // Red 700
        success: "15803D",   // Green 700
    },
    sizes: {
        title: 48,      // 24pt
        header: 32,     // 16pt
        section: 28,    // 14pt (Increased slightly)
        subHeader: 24,  // 12pt
        body: 22,       // 11pt
        meta: 18,       // 9pt
        small: 16,      // 8pt
    },
    spacing: {
        lineHeight: 1.15,
        paragraph: 200,
    }
};

// --- Helper Functions ---

function sanitizeText(text: string): string {
    if (!text) return "";

    let clean = text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\u2026/g, "...")
        .replace(/[\u00A0\u200B\u202F\u205F]/g, " ");

    clean = clean
        .replace(/\*\*/g, "")
        .replace(/^#+\s/gm, "")
        .replace(/`/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\*/g, "");

    clean = clean.replace(/^- /gm, "• ");

    return clean;
}

// --- Report Generator Class ---

class ReportGeneratorDOCX {
    private sections: any[] = [];

    constructor() { }

    public addTitlePage(title: string, subtitle: string) {
        this.sections.push(
            new Paragraph({
                text: title,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { before: 4000, after: 300 },
                run: {
                    font: STYLE.fonts.header,
                    color: STYLE.colors.primary,
                    size: STYLE.sizes.title,
                    bold: true,
                }
            })
        );

        this.sections.push(
            new Paragraph({
                text: subtitle,
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                run: {
                    font: STYLE.fonts.normal,
                    color: STYLE.colors.meta,
                    size: STYLE.sizes.subHeader,
                }
            })
        );

        const dateStr = `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
        this.sections.push(
            new Paragraph({
                text: dateStr,
                alignment: AlignmentType.CENTER,
                run: {
                    font: STYLE.fonts.normal,
                    color: STYLE.colors.meta,
                    size: STYLE.sizes.body,
                }
            })
        );
    }

    public addPageBreak() {
        this.sections.push(new Paragraph({
            children: [new TextRun({ break: 1 })],
            pageBreakBefore: true
        }));
    }

    public addSectionHeader(title: string, pageBreak: boolean = false) {
        this.sections.push(
            new Paragraph({
                text: title.toUpperCase(),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 300, after: 150 },
                pageBreakBefore: pageBreak,
                run: {
                    font: STYLE.fonts.header,
                    color: STYLE.colors.primary,
                    size: STYLE.sizes.section,
                    bold: true,
                },
                border: {
                    bottom: { color: STYLE.colors.accent, space: 1, style: BorderStyle.SINGLE, size: 12 }
                }
            })
        );
    }

    public addSubHeader(title: string) {
        this.sections.push(
            new Paragraph({
                text: title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                run: {
                    font: STYLE.fonts.header,
                    color: STYLE.colors.primary,
                    size: STYLE.sizes.subHeader,
                    bold: true,
                }
            })
        );
    }

    public addText(text: string | null | undefined, color: string = STYLE.colors.text, indent: number = 0, bold: boolean = false) {
        if (!text) return;

        const cleanContent = sanitizeText(text);
        const paragraphs = cleanContent.split('\n');

        paragraphs.forEach(p => {
            let content = p.trim();
            if (!content) return;

            const isBullet = content.startsWith("•");
            if (isBullet) {
                content = content.replace(/^[•\s]+/, "").trim();
            }

            this.sections.push(
                new Paragraph({
                    text: content,
                    bullet: isBullet ? { level: 0 } : undefined,
                    indent: isBullet ? undefined : { left: indent * 100 },
                    spacing: { after: 120 },
                    run: {
                        font: STYLE.fonts.normal,
                        color: color,
                        size: STYLE.sizes.body,
                        bold: bold,
                    }
                })
            );
        });
    }

    public addSpacer() {
        this.sections.push(new Paragraph({ text: "" }));
    }

    // --- Specific Section Renderers ---

    public renderSourceAnalysis(source: Source, index: number) {
        const titleRun = new TextRun({
            text: `${index}. ${source.title}`,
            font: STYLE.fonts.header,
            color: STYLE.colors.primary,
            size: STYLE.sizes.header,
            bold: true,
        });

        this.sections.push(
            new Paragraph({
                children: [titleRun],
                spacing: { before: 400, after: 200 },
                pageBreakBefore: true,
                shading: {
                    fill: STYLE.colors.accent,
                    type: "clear",
                    color: "auto",
                },
                border: {
                    left: { color: STYLE.colors.primary, space: 10, style: BorderStyle.SINGLE, size: 6 }
                }
            })
        );

        const metaText = `TYPE: ${source.type.toUpperCase()}  |  ADDED: ${source.addedDate}  |  STATUS: ${source.status}`;
        this.sections.push(
            new Paragraph({
                text: metaText,
                spacing: { after: 400 },
                run: {
                    font: STYLE.fonts.normal,
                    color: STYLE.colors.meta,
                    size: STYLE.sizes.meta,
                }
            })
        );

        // 1. Core Analysis (Governance, etc)
        if (source.analysis || source.cultural_framing || source.institutional_logics || source.legitimacy_analysis) {
            // ... Logic from previous implementation ...
            this.renderExistingAnalysisSections(source);

            // NEW: Data Page Specific Sections
            this.renderDataPageCalculations(source);
        } else if (source.resistance_analysis) {
            // 1b. Resistance Trace Analysis
            this.renderResistanceTrace(source);
        } else {
            this.addText("No analysis data available for this source.", STYLE.colors.subtle);
        }
    }

    private renderExistingAnalysisSections(source: Source) {
        if (source.cultural_framing) this.renderCulturalFraming(source.cultural_framing);
        if (source.institutional_logics) this.renderInstitutionalLogics(source.institutional_logics);
        if (source.legitimacy_analysis) this.renderLegitimacyAnalysis(source.legitimacy_analysis);
        if (source.analysis) this.renderGovernanceAnalysis(source.analysis);
    }

    private renderCulturalFraming(framing: any) {
        this.addSubHeader("Cultural Framing Analysis");

        if (framing.state_market_society) {
            this.addText("State-Market-Society Relations:", STYLE.colors.secondary, 0, true);
            this.addText(framing.state_market_society);
        }
        if (framing.technology_role) {
            this.addText("Role of Technology:", STYLE.colors.secondary, 0, true);
            this.addText(framing.technology_role);
        }
        if (framing.rights_conception) {
            this.addText("Conception of Rights:", STYLE.colors.secondary, 0, true);
            this.addText(framing.rights_conception);
        }
        if (framing.dominant_cultural_logic) {
            this.addText("Dominant Cultural Logic:", STYLE.colors.secondary, 0, true);
            this.addText(framing.dominant_cultural_logic);
        }
    }

    private renderInstitutionalLogics(logics: any) {
        this.addSubHeader("Institutional Logics");

        if (logics.dominant_logic) {
            this.addText("Dominant Logic: " + logics.dominant_logic, STYLE.colors.primary, 0, true);
        }

        if (logics.logics) {
            const l = logics.logics;
            let stats = "";
            if (l.market) stats += `• Market Logic: ${l.market.strength}/10\n`;
            if (l.state) stats += `• State Logic: ${l.state.strength}/10\n`;
            if (l.professional) stats += `• Professional Logic: ${l.professional.strength}/10\n`;
            if (l.community) stats += `• Community Logic: ${l.community.strength}/10`;
            this.addText(stats);
        }

        if (logics.logic_conflicts && logics.logic_conflicts.length > 0) {
            this.addText("Key Institutional Conflicts:", STYLE.colors.secondary, 0, true);
            logics.logic_conflicts.forEach((c: any) => {
                this.addText(`• ${c.between}: ${c.site_of_conflict} (Resolution: ${c.resolution_strategy})`);
            });
        }
    }

    private renderLegitimacyAnalysis(legitimacy: any) {
        this.addSubHeader("Legitimacy Analysis");

        if (legitimacy.dominant_order) {
            let domOrder = legitimacy.dominant_order;
            if (typeof domOrder === 'object') domOrder = "Mixed/Complex Orders";
            this.addText("Dominant Order: " + domOrder, STYLE.colors.primary, 0, true);
        }

        if (legitimacy.orders) {
            const o = legitimacy.orders;
            const formatScore = (val: any) => {
                if (typeof val === 'object' && val !== null) {
                    return val.score || val.value || val.strength || "N/A";
                }
                return val;
            };

            const scores = `• Market: ${formatScore(o.market)}   • Industrial: ${formatScore(o.industrial)}   • Civic: ${formatScore(o.civic)}\n• Domestic: ${formatScore(o.domestic)}   • Inspired: ${formatScore(o.inspired)}   • Fame: ${formatScore(o.fame)}`;
            this.addText(scores);
        }

        if (legitimacy.conflict_spot) {
            this.addText("Conflict Spot:", STYLE.colors.secondary, 0, true);
            const conflict = legitimacy.conflict_spot;
            let conflictDesc = "";

            if (typeof conflict === 'string') {
                conflictDesc = conflict;
            } else {
                if (conflict.course_of_action) conflictDesc += `Location: ${conflict.location}\n`;
                if (conflict.location && !conflict.course_of_action) conflictDesc += `Location: ${conflict.location}\n`;
                if (conflict.description) conflictDesc += `${conflict.description}\n`;
                if (conflict.resolution_strategy) conflictDesc += `Strategy: ${conflict.resolution_strategy}`;
            }
            this.addText(conflictDesc);
        }
    }

    private renderGovernanceAnalysis(analysis: any) {
        if (!analysis.governance_scores) return;

        this.addSubHeader("Governance Compass & Decolonial Analysis (DSF)");

        const g = analysis.governance_scores;
        const gScores = `• Centralization: ${g.centralization}\n• Rights Focus: ${g.rights_focus}\n• Flexibility: ${g.flexibility}\n• Market Power: ${g.market_power}\n• Procedurality: ${g.procedurality}`;
        this.addText(gScores);

        if (analysis.key_insight) {
            this.addText("Key Insight:", STYLE.colors.secondary, 0, true);
            this.addText(analysis.key_insight);
        }

        // Qualitative Analysis Fields
        if (analysis.governance_power_accountability) {
            this.addText("Governance, Power & Accountability:", STYLE.colors.secondary, 0, true);
            this.addText(analysis.governance_power_accountability);
        }
        if (analysis.plurality_inclusion_embodiment) {
            this.addText("Plurality & Inclusion:", STYLE.colors.secondary, 0, true);
            this.addText(analysis.plurality_inclusion_embodiment);
        }
        if (analysis.agency_codesign_self_determination) {
            this.addText("Agency & Self-Determination:", STYLE.colors.secondary, 0, true);
            this.addText(analysis.agency_codesign_self_determination);
        }
        if (analysis.reflexivity_situated_praxis) {
            this.addText("Reflexivity & Situated Praxis:", STYLE.colors.secondary, 0, true);
            this.addText(analysis.reflexivity_situated_praxis);
        }

        this.renderAssemblageDynamics(analysis);
        this.renderStructuralPillars(analysis);
        this.renderGovernanceScoreExplanations(analysis);
    }

    private renderAssemblageDynamics(analysis: any) {
        if (analysis.assemblage_dynamics) {
            this.addSubHeader("Assemblage Dynamics");
            const dyn = analysis.assemblage_dynamics;
            this.addText(`• Territorialization: ${dyn.territorialization}`);
            this.addText(`• Deterritorialization: ${dyn.deterritorialization}`);
            this.addText(`• Coding: ${dyn.coding}`);
        }
    }

    private renderStructuralPillars(analysis: any) {
        if (analysis.structural_pillars) {
            this.addSubHeader("Structural Pillars");
            const pillars = analysis.structural_pillars;
            if (pillars.risk) this.addText(`Risk: ${pillars.risk.description} (${pillars.risk.badge})`);
            if (pillars.rights) this.addText(`Rights: ${pillars.rights.description} (${pillars.rights.badge})`);
            if (pillars.enforcement) this.addText(`Enforcement: ${pillars.enforcement.description} (${pillars.enforcement.badge})`);
            if (pillars.scope) this.addText(`Scope: ${pillars.scope.description} (${pillars.scope.badge})`);
        }
    }

    private renderGovernanceScoreExplanations(analysis: any) {
        if (analysis.governance_score_explanations) {
            this.addText("Score Explanations:", STYLE.colors.secondary, 0, true);
            const e = analysis.governance_score_explanations;
            let expl = "";
            if (e.centralization) expl += `• Centralization: ${e.centralization}\n`;
            if (e.rights_focus) expl += `• Rights Focus: ${e.rights_focus}\n`;
            if (e.flexibility) expl += `• Flexibility: ${e.flexibility}`;
            if (e.market_power) expl += `\n• Market Power: ${e.market_power}`;
            if (e.procedurality) expl += `\n• Procedurality: ${e.procedurality}`;
            if (e.coloniality) expl += `\n• Coloniality: ${e.coloniality}`;
            this.addText(expl);
        }
    }

    private renderDataPageCalculations(source: Source) {
        if (!source.analysis) return;

        // 0. Decision Ownership & Accountability - Narrative First
        if (source.analysis.accountability_map) {
            this.addSubHeader("Decision Ownership & Accountability");
            const acc = source.analysis.accountability_map;

            // Build interpretive narrative
            const hasFullAccountability = acc.signatory && acc.liability_holder && acc.appeals_mechanism;
            const narrative = hasFullAccountability
                ? `Accountability chains are formalized through explicit designation of ${acc.signatory} as signatory authority, with liability assigned to ${acc.liability_holder}. Appeals mechanisms (${acc.appeals_mechanism}) provide contestation pathways, suggesting robust procedural accountability architecture.`
                : `Accountability structures exhibit gaps or ambiguities. ${acc.signatory ? `While ${acc.signatory} serves as formal signatory, ` : 'Signatory authority remains unspecified, and '}${acc.liability_holder ? `liability rests with ${acc.liability_holder}, ` : 'liability assignment is unclear, '}creating potential enforcement weaknesses.`;

            this.addText(narrative);
            this.addSpacer();

            // Supporting details (subtle)
            if (acc.human_in_the_loop !== undefined) {
                this.addText(`  → Human oversight: ${acc.human_in_the_loop ? 'Required' : 'Not mandated'}`, STYLE.colors.subtle, 1);
            }
        }

        // Calculate risk and capacity first as they are used in multiple sections
        const risk = calculateMicroFascismRisk(source.analysis);
        const capacity = calculateLiberatoryCapacity(source.analysis);

        // 1. Authoritarian Tendencies - Interpretive Narrative
        if (risk) {
            this.addSubHeader("Authoritarian Tendencies Analysis");

            // Lead with rich interpretation
            const narrative = this.interpretRiskNarrative(risk);
            this.addText(narrative);
            this.addSpacer();

            // Evidence from observed indicators
            const triggeredFlags = Object.entries(risk.flags)
                .filter(([_, val]) => val)
                .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

            if (triggeredFlags.length > 0) {
                this.addText("Observed Indicators:", STYLE.colors.secondary, 0, true);
                triggeredFlags.forEach(flag => {
                    this.addText(`  → ${flag}`, undefined, 1);
                });
                this.addSpacer();
            }

            // Score goes to parenthetical reference
            this.addText(`(Parametric summary: ${risk.score}/6 ${risk.level} - see methodological appendix)`, STYLE.colors.meta, 0, false);
            this.addSpacer();
        }

        // 2. Liberatory Capacity - Interpretive Narrative
        if (capacity) {
            this.addSubHeader("Liberatory Capacity Assessment");

            // Lead with interpretation
            const narrative = this.interpretCapacityNarrative(capacity);
            this.addText(narrative);
            this.addSpacer();

            // Evidence from active signals
            const triggeredSignals = Object.entries(capacity.signals)
                .filter(([_, val]) => val)
                .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

            if (triggeredSignals.length > 0) {
                this.addText("Enabling Conditions:", STYLE.colors.secondary, 0, true);
                triggeredSignals.forEach(signal => {
                    this.addText(`  → ${signal}`, undefined, 1);
                });
                this.addSpacer();
            }

            // Score parenthetical
            this.addText(`(Parametric summary: ${capacity.score}/8 ${capacity.level})`, STYLE.colors.meta, 0, false);
            this.addSpacer();
        }

        // 3. Verification Gap - Narrative First
        if (source.analysis.verification_gap) {
            this.addSubHeader("Rhetorical-Empirical Alignment");
            const gap = source.analysis.verification_gap;

            // Interpretive narrative
            const narrative = gap.high_rhetoric_low_verification
                ? `A significant rhetorical-empirical gap emerges where aspirational language outpaces concrete enforcement mechanisms. ${gap.gap_explanation} This disconnect between text and practice creates space for symbolic compliance while substantive accountability remains elusive.`
                : `Claims are grounded in verifiable mechanisms, creating aligned rhetoric and enforcement. ${gap.gap_explanation} This coherence between stated intentions and operational capacity suggests the assemblage can deliver on its commitments.`;

            this.addText(narrative);
            this.addSpacer();
        }

        // 4. Counter-Narrative Stress Test - Narrative First
        if (source.analysis.stress_test_report) {
            this.addSubHeader("Rhetorical Robustness Assessment");
            const stress = source.analysis.stress_test_report;

            // Lead with interpretive narrative
            const narrative = this.interpretStressTestNarrative(
                stress.framing_sensitivity,
                stress.original_score,
                stress.perturbed_score
            );
            this.addText(narrative);
            this.addSpacer();

            // Supporting evidence - rhetorical shifts
            if (stress.rhetorical_shifts && stress.rhetorical_shifts.length > 0) {
                this.addText("Key Rhetorical Transformations:", STYLE.colors.secondary, 0, true);
                stress.rhetorical_shifts.forEach(shift => {
                    this.addText(`  → "${shift.original}" reframed as "${shift.new}"`, undefined, 1);
                    if (shift.explanation) {
                        this.addText(`    (${shift.explanation})`, STYLE.colors.subtle, 2);
                    }
                });
                this.addSpacer();
            }

            // Score as parenthetical
            this.addText(`(Score shift: ${stress.original_score} → ${stress.perturbed_score}, Sensitivity: ${stress.framing_sensitivity})`, STYLE.colors.meta, 0, false);
            this.addSpacer();
        }

        // 5. System Critique (Blind Spots) - Already narrative-heavy
        if (source.analysis.system_critique) {
            this.addSubHeader("Reflexive Critique & Epistemological Limits");
            const critique = source.analysis.system_critique;

            if (critique.blind_spots && critique.blind_spots.length > 0) {
                this.addText("Potential Blind Spots:", STYLE.colors.danger, 0, true);
                critique.blind_spots.forEach(spot => this.addText(`  → ${spot}`, undefined, 1));
                this.addSpacer();
            }

            if (critique.legitimacy_correction) {
                this.addText("Legitimacy Correction:", STYLE.colors.secondary, 0, true);
                this.addText(critique.legitimacy_correction);
                this.addSpacer();
            }
        }

        // 6. Canonical Evidence - Narrative context
        if (source.analysis.verified_quotes && source.analysis.verified_quotes.length > 0) {
            this.addSubHeader("Canonical Evidence");
            this.addText("The following textual anchors ground the above interpretations:");
            this.addSpacer();

            source.analysis.verified_quotes.forEach((quote, idx) => {
                this.addText(`[${idx + 1}] "${quote.text}"`, STYLE.colors.secondary, 0, false);
                this.addText(`    Context: ${quote.context} (Confidence: ${quote.confidence})`, STYLE.colors.meta, 1);
            });
        }
    }

    // New helper methods for narrative interpretation
    private interpretRiskNarrative(risk: any): string {
        if (risk.level === 'High') {
            return "The assemblage exhibits pronounced authoritarian characteristics, manifested through exclusionary boundaries, opaque decision-making, and punitive enforcement mechanisms that concentrate power while marginalizing affected communities. These dynamics create conditions for micro-fascist organizing where bureaucratic authority supersedes democratic accountability.";
        } else if (risk.level === 'Medium') {
            return "Moderate authoritarian tendencies emerge in bureaucratic rigidity and limited participatory channels, though countervailing democratic elements provide some accountability. The assemblage oscillates between technocratic efficiency and inclusive governance, creating friction points where power concentrates.";
        } else {
            return "The assemblage demonstrates democratic robustness with distributed authority, transparent procedures, and meaningful participation mechanisms. While not without hierarchies, power relations remain contestable and subject to procedural checks that prevent authoritarian drift.";
        }
    }

    private interpretCapacityNarrative(capacity: any): string {
        if (capacity.level === 'High') {
            return "The assemblage creates substantive openings for emancipatory practice through collective rights frameworks, participatory governance structures, and explicit recognition of marginalized epistemologies. These enabling conditions support bottom-up organizing and resist neoliberal enclosure of political possibility.";
        } else if (capacity.level === 'Medium') {
            return "Liberatory potential exists but remains constrained by institutional inertia and market logics. While formal rights and consultation mechanisms provide some agency, systemic barriers limit transformative capacity. The assemblage offers tactical openings rather than strategic reconfigurations of power.";
        } else {
            return "Limited liberatory capacity emerges within a predominantly technocratic framework that forecloses radical alternatives. Participation channels privilege expert knowledge over lived experience, and accountability mechanisms reinforce existing hierarchies rather than enabling collective self-determination.";
        }
    }

    private interpretStressTestNarrative(
        sensitivity: 'High' | 'Medium' | 'Low',
        originalScore: number,
        perturbedScore: number
    ): string {
        const shift = Math.abs(originalScore - perturbedScore);

        if (sensitivity === 'High') {
            return `Critical fragility detected: the assemblage's authority collapses under rhetorical inversion (${shift}-point degradation), revealing dependence on persuasive framing rather than robust structural mechanisms. This brittleness suggests the policy relies more on ideological legitimation than material accountability, making it vulnerable to hostile interpretation or bad-faith implementation.`;
        } else if (sensitivity === 'Medium') {
            return `Moderate rhetorical dependency emerges through adversarial reframing (${shift}-point shift). While the assemblage possesses some structural integrity, hostile actors could exploit framing ambiguities to weaken its authority. This suggests a need for more concrete enforcement mechanisms to insulate governance from interpretive manipulation.`;
        } else {
            return `Robust structural resilience withstands rhetorical inversion with minimal degradation (${shift}-point variance). The assemblage's authority derives from concrete mechanisms and specific mandates rather than aspirational language, enabling it to resist hostile spin and maintain operational coherence across varied interpretive contexts.`;
        }
    }

    private renderResistanceTrace(source: Source) {
        if (!source.resistance_analysis) return;

        const r = source.resistance_analysis;
        this.addSubHeader("Micro-Resistance Trace Analysis");

        this.addText(`Strategy: ${r.strategy_detected}`, STYLE.colors.primary, 0, true);
        this.addText(`Confidence: ${r.confidence}`, r.confidence === 'High' ? STYLE.colors.success : STYLE.colors.secondary, 0, true);

        if (r.evidence_quote) {
            this.addText(`Evidence: "${r.evidence_quote}"`, STYLE.colors.subtle, 1);
        }

        if (r.interpretation) {
            this.addText("Interpretation:", STYLE.colors.secondary, 0, true);
            this.addText(r.interpretation);
        }
    }

    public renderCrossCaseSynthesis(data: ReportData["synthesis"]) {
        if (!data || !data.comparison) return;
        this.addSectionHeader("Cross-Case Synthesis", true);

        const comp = data.comparison as any; // Using any for ComparativeSynthesis fields

        // Synthesis Summary (Relational Summary)
        if (comp.synthesis_summary) {
            this.addSubHeader("Relational Summary");
            this.addText(comp.synthesis_summary);
            this.addSpacer();
        }

        // Executive Matrix
        this.renderSynthesisMatrix(comp);

        // Concept Mutations (Policy Mobilities)
        if (comp.concept_mutations && comp.concept_mutations.length > 0) {
            this.addSubHeader("Policy Mobilities & Concept Mutations");
            this.addText("How concepts travel and mutate across jurisdictions:");
            this.addSpacer();

            comp.concept_mutations.forEach((mutation: any) => {
                this.addText(`• ${mutation.concept}`, STYLE.colors.primary, 0, true);
                this.addText(`Origin: ${mutation.origin_context}`, undefined, 1);
                this.addText(`Local Mutation: ${mutation.local_mutation}`, undefined, 1);
                this.addText(`Mechanism: ${mutation.mechanism}`, STYLE.colors.subtle, 1);
                this.addSpacer();
            });
        }

        // Stabilization Mechanisms
        if (comp.stabilization_mechanisms && comp.stabilization_mechanisms.length > 0) {
            this.addSubHeader("Stabilization Mechanisms");
            this.addText("How assemblages maintain coherence across territorial boundaries:");
            this.addSpacer();

            comp.stabilization_mechanisms.forEach((mech: any) => {
                this.addText(`• [${mech.type}] ${mech.jurisdiction}`, STYLE.colors.secondary, 0, true);
                this.addText(mech.mechanism, undefined, 1);
            });
            this.addSpacer();
        }

        // Desire and Friction
        if (comp.desire_and_friction && comp.desire_and_friction.length > 0) {
            this.addSubHeader("Desire & Friction Points");
            this.addText("Tensions between policy aspirations and structural constraints:");
            this.addSpacer();

            comp.desire_and_friction.forEach((item: any) => {
                this.addText(`${item.topic}`, STYLE.colors.primary, 0, true);
                this.addText(`Friction: ${item.friction_point}`, undefined, 1);
                this.addText(`Underlying Desire: ${item.underlying_desire}`, STYLE.colors.secondary, 1);
                this.addSpacer();
            });
        }

        // Institutional Conflicts
        if (comp.institutional_conflict && comp.institutional_conflict.length > 0) {
            this.addSubHeader("Institutional Conflicts");
            comp.institutional_conflict.forEach((conf: any) => {
                this.addText(conf.conflict_type, STYLE.colors.primary, 0, true);
                this.addText(conf.description, undefined, 1);
                this.addText(`Policy A Evidence: "${conf.policy_a_evidence}"`, STYLE.colors.subtle, 1);
                this.addText(`Policy B Evidence: "${conf.policy_b_evidence}"`, STYLE.colors.subtle, 1);
                this.addSpacer();
            });
        }

        // Legitimacy Tensions
        if (comp.legitimacy_tensions && comp.legitimacy_tensions.length > 0) {
            this.addSubHeader("Legitimacy Tensions");
            comp.legitimacy_tensions.forEach((tens: any) => {
                this.addText(tens.tension_type, STYLE.colors.primary, 0, true);
                this.addText(tens.description, undefined, 1);
                this.addText(`Policy A Evidence: "${tens.policy_a_evidence}"`, STYLE.colors.subtle, 1);
                this.addText(`Policy B Evidence: "${tens.policy_b_evidence}"`, STYLE.colors.subtle, 1);
                this.addSpacer();
            });
        }

        // Coloniality Assessment
        if (comp.coloniality_assessment) {
            this.addSubHeader("Coloniality Assessment");
            this.addText(comp.coloniality_assessment);
            this.addSpacer();
        }

        // System Critique
        if (comp.system_critique) this.renderSynthesisCritique(comp.system_critique);

        // Verified Quotes
        if (comp.verified_quotes && comp.verified_quotes.length > 0) this.renderVerifiedQuotes(comp.verified_quotes);

        // Ecosystem Impacts (Sankey Data)
        if (data.ecosystemImpacts && data.ecosystemImpacts.length > 0) this.renderEcosystemImpacts(data.ecosystemImpacts);

        // Assemblage Rhizome Network
        if (comp.assemblage_network) this.renderAssemblageRhizome(comp.assemblage_network);
    }

    private renderSynthesisMatrix(comp: any) {
        this.addSubHeader("Synthesis Framework Matrix");

        ['Risk', 'Governance', 'Rights', 'Scope'].forEach(dim => {
            const key = dim.toLowerCase() as keyof typeof comp;
            const val = comp[key] as any; // Type assertion since structure is uniform
            if (val) {
                this.addText(`${dim} Dimension:`, STYLE.colors.primary, 0, true);
                this.addText(`• Convergence: ${val.convergence}`);
                this.addText(`• Divergence: ${val.divergence}`);
                this.addText(`• Coloniality: ${val.coloniality}`);
                this.addText(""); // Separator
            }
        });
    }

    private renderSynthesisCritique(crit: any) {
        this.addSubHeader("System-Level Critique");
        if (typeof crit === 'string') {
            this.addText(crit);
        } else {
            if (crit.blind_spots) {
                this.addText("Blind Spots:", STYLE.colors.secondary, 0, true);
                crit.blind_spots.forEach((Spot: string) => this.addText(`• ${Spot}`));
            }
            if (crit.legitimacy_correction) {
                this.addText("Legitimacy Correction:", STYLE.colors.secondary, 0, true);
                this.addText(crit.legitimacy_correction);
            }
        }
    }

    private renderVerifiedQuotes(quotes: any[]) {
        this.addSubHeader("Verified Canonical Evidence");
        quotes.forEach(quote => {
            this.addText(`"${quote.text}"`, STYLE.colors.secondary, 0, false);
            this.addText(`(Source: ${quote.source} | Relevance: ${quote.relevance})`, STYLE.colors.meta, 1);
        });
    }

    private renderEcosystemImpacts(impacts: any[]) {
        this.addSubHeader("Ecosystem Impact Mapping");
        this.addText("Mapping of policy mechanisms to ecosystem actors.", STYLE.colors.meta);

        impacts.forEach(impact => {
            this.addText(`${impact.actor}`, STYLE.colors.primary, 0, true);
            this.addText(`• Mechanism: ${impact.mechanism}`);
            this.addText(`• Impact: ${impact.impact} (${impact.type})`);
            if (impact.interconnection_type) {
                this.addText(`• Connection: ${impact.interconnection_type}`, STYLE.colors.meta);
            }
            this.addSpacer();
        });
    }

    public renderResistanceAnalysis(data: ReportData["resistance"]) {
        if (!data) return;
        this.addSectionHeader("Micro-Resistance Analysis", true);

        if (data.executive_summary) {
            this.addText(data.executive_summary);
        }

        if (data.dominant_strategies && data.dominant_strategies.length > 0) {
            this.addSubHeader("Dominant Strategies");
            data.dominant_strategies.forEach(s => {
                this.addText(`${s.strategy} (${s.frequency}):`, STYLE.colors.primary, 0, true);
                this.addText(s.description);
            });
        }

        if (data.emerging_themes && data.emerging_themes.length > 0) {
            this.addSubHeader("Emerging Themes");
            data.emerging_themes.forEach(t => this.addText(`• ${t}`));
        }

        if (data.implications_for_policy) {
            this.addSubHeader("Implications for Policy");
            this.addText(data.implications_for_policy);
        }
    }

    public renderEcosystemAnalysis(data: ReportData["ecosystem"]) {
        if (!data) return;
        this.addSectionHeader("Ecosystem & Assemblage Analysis", true);

        if (data.actors) this.renderEcosystemActors(data.actors);
        if (data.configurations) this.renderEcosystemConfigurations(data.configurations);
        if (data.absenceAnalysis) this.renderAbsenceAnalysis(data.absenceAnalysis);
        if (data.assemblage) this.renderAssemblageAnalysis(data.assemblage);
    }

    private renderEcosystemActors(actors: any[]) { // Use EcosystemActor type but avoid bad imports for now
        if (actors.length === 0) return;

        this.addSubHeader("Key Ecosystem Actors");

        // Create Table Rows
        const headerRow = new TableRow({
            children: [
                new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Actor Name", run: { bold: true } })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Type", run: { bold: true } })] }),
                new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Infl.", run: { bold: true } })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Context", run: { bold: true } })] }),
                new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Description", run: { bold: true } })] }),
            ],
            tableHeader: true,
        });

        const rows = actors.map((actor: any) => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(actor.name)] }),
                new TableCell({ children: [new Paragraph(actor.type)] }),
                new TableCell({ children: [new Paragraph(actor.influence)] }),
                new TableCell({ children: [new Paragraph(actor.materialized_from?.context_type || "Direct")] }),
                new TableCell({ children: [new Paragraph(sanitizeText(actor.description || ""))] }),
            ]
        }));

        const table = new Table({
            rows: [headerRow, ...rows],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                left: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                right: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
            }
        });

        this.sections.push(table);
        this.sections.push(new Paragraph({ text: "" })); // Spacing
    }



    private renderAbsenceAnalysis(absenceAnalysis: any) {
        this.addSubHeader("Critique: Absences & Blindspots");
        if (absenceAnalysis.narrative) {
            this.addText(absenceAnalysis.narrative);
            this.addSpacer();
        }

        if (absenceAnalysis.missing_voices && absenceAnalysis.missing_voices.length > 0) {
            this.addText("Missing Voices:", STYLE.colors.secondary, 0, true);
            absenceAnalysis.missing_voices.forEach((voice: any) => {
                // Check if voice is an object or string
                const text = typeof voice === 'string' ? voice : `${voice.name} (${voice.category}): ${voice.reason}`;
                this.addText(`• ${text}`);
            });
            this.addSpacer();
        }
    }

    private renderAssemblageAnalysis(assemblage: any) {
        this.addSubHeader("Assemblage Analysis");

        // Parts (Socio-Technical Components)
        if (assemblage.socio_technical_components) {
            this.addText("Parts (Socio-Technical Components)", STYLE.colors.secondary, 0, true);
            const { infra, discourse } = assemblage.socio_technical_components;
            if (infra && infra.length > 0) this.addText(`Infrastructure: ${infra.join(", ")}`);
            if (discourse && discourse.length > 0) this.addText(`Discourse: ${discourse.join(", ")}`);
            this.addSpacer();
        }

        // Flow (Policy Mobilities)
        if (assemblage.policy_mobilities) {
            this.addText("Flow (Policy Mobilities)", STYLE.colors.secondary, 0, true);
            const { origin_concepts, local_mutations } = assemblage.policy_mobilities;
            if (origin_concepts && origin_concepts.length > 0) this.addText(`Origin Concepts: ${origin_concepts.join(", ")}`);
            if (local_mutations && local_mutations.length > 0) this.addText(`Local Mutations: ${local_mutations.join(", ")}`);
            this.addSpacer();
        }

        // Exterior (Relations of Exteriority)
        if (assemblage.relations_of_exteriority) {
            this.addText("Exterior (Relations of Exteriority)", STYLE.colors.secondary, 0, true);
            const { detachable, embedded, mobility_score } = assemblage.relations_of_exteriority;
            // Check if mobility_score exists before printing
            if (mobility_score) this.addText(`Mobility Score: ${mobility_score}`);
            if (detachable && detachable.length > 0) this.addText(`Detachable Relations: ${detachable.join(", ")}`);
            if (embedded && embedded.length > 0) this.addText(`Embedded Relations: ${embedded.join(", ")}`);
            this.addSpacer();
        }

        // Stable (Stabilization Mechanisms)
        if (assemblage.stabilization_mechanisms && assemblage.stabilization_mechanisms.length > 0) {
            this.addText("Stable (Stabilization Mechanisms)", STYLE.colors.secondary, 0, true);
            assemblage.stabilization_mechanisms.forEach((mech: any) => this.addText(`• ${mech}`));
            this.addSpacer();
        }
    }

    public renderCulturalAnalysis(data: CulturalAnalysisResult | null) {
        if (!data) return;
        this.addSectionHeader("Cultural Framing of Discursive Fields", true);

        if (data.summary) {
            this.addText(data.summary);
            this.addSpacer();
        }

        // Clusters
        if (data.clusters && data.clusters.length > 0) {
            this.addSubHeader("Discourse Clusters");
            data.clusters.forEach((cluster: any) => {
                this.addText(`${cluster.name} (Size: ${cluster.size})`, STYLE.colors.primary, 0, true);
                if (cluster.description) {
                    this.addText(cluster.description, STYLE.colors.secondary);
                }

                this.addText("Themes: " + cluster.themes.join(", "), STYLE.colors.meta);

                if (cluster.quotes && cluster.quotes.length > 0) {
                    this.addText("Evidence:", STYLE.colors.secondary, 0, true);
                    cluster.quotes.slice(0, 3).forEach((q: any) => this.addText(`"${q.text}" (${q.source})`, STYLE.colors.subtle));
                }
                this.addSpacer();
            });
        }


    }

    public renderOntology(data: ReportData["ontology"]) {
        if (!data) return;
        this.addSectionHeader("Ontological Cartography", true);

        const maps = Object.values(data.maps);
        if (maps.length === 0) {
            this.addText("No ontological maps generated.");
        } else {
            this.renderOntologyMaps(maps);
        }

        if (data.comparison) {
            this.renderOntologyComparison(data.comparison);
        }
    }

    private renderOntologyMaps(maps: any[]) {
        maps.forEach((map: any, idx) => {
            this.addSubHeader(`Map Analysis ${idx + 1}`);
            if (map.summary) this.addText(map.summary);

            // Nodes
            if (map.nodes && map.nodes.length > 0) {
                this.addText("Key Concepts (Nodes):", STYLE.colors.secondary, 0, true);
                map.nodes.forEach((node: any) => {
                    this.addText(`• ${node.label} [${node.category}]`, STYLE.colors.primary, 0, true);
                    if (node.description) this.addText(node.description);
                    if (node.quote) this.addText(`"${node.quote}"`, STYLE.colors.subtle, 1);
                });
                this.addSpacer();
            }

            // Links
            if (map.links && map.links.length > 0) {
                this.addText("Network Topology (Relations):", STYLE.colors.secondary, 0, true);
                const relations = map.links.map((l: any) => {
                    // Find node labels if possible, else use IDs
                    const sourceNode = map.nodes.find((n: any) => n.id === l.source)?.label || l.source;
                    const targetNode = map.nodes.find((n: any) => n.id === l.target)?.label || l.target;
                    return `${sourceNode} --[${l.relation}]--> ${targetNode}`;
                });
                relations.slice(0, 15).forEach((r: string) => this.addText(`• ${r}`)); // Limit to top 15 to avoid spam
                if (relations.length > 15) this.addText(`...and ${relations.length - 15} more relations.`);
                this.addSpacer();
            }
        });
    }

    private renderOntologyComparison(comp: any) {
        this.addSubHeader("Comparative Ontology");
        if (comp.summary) this.addText(comp.summary);

        // Metrics
        if (comp.assemblage_metrics && comp.assemblage_metrics.length > 0) {
            this.addText("Assemblage Metrics:", STYLE.colors.secondary, 0, true);
            comp.assemblage_metrics.forEach((m: any) => {
                this.addText(`${m.jurisdiction}:`, STYLE.colors.primary, 0, true);
                this.addText(`• Territorialization: ${m.territorialization}/100 - ${m.territorialization_justification}`);
                this.addText(`• Coding: ${m.coding}/100 - ${m.coding_justification}`);
            });
            this.addSpacer();
        }

        // Differences
        this.addText("Structural Differences:", STYLE.colors.secondary, 0, true);
        this.addText(comp.structural_differences);
        this.addSpacer();

        if (comp.shared_concepts && comp.shared_concepts.length > 0) {
            this.addText(`Shared Concepts: ${comp.shared_concepts.join(", ")}`);
        }

        if (comp.relationship_divergences && comp.relationship_divergences.length > 0) {
            this.addText("Relationship Divergences:", STYLE.colors.secondary, 0, true);
            comp.relationship_divergences.forEach((d: any) => {
                this.addText(`• ${d.concept}: ${d.difference}`);
            });
        }
    }

    public renderComparisonMatrix(sources: Source[]) {
        if (!sources || sources.length < 2) return;

        // Filter for sources with analysis
        const validSources = sources.filter(s => s.analysis);
        if (validSources.length < 2) return;

        this.addSectionHeader("Comparative Diagnostic Matrix", true);
        this.addText("Flattened matrix view for rapid cross-policy signal analysis.", STYLE.colors.meta);

        // 1. Comparison Table
        this.renderComparisonTable(validSources);

        // 2. Detailed Breakdown text (to avoid super wide tables)
        this.renderComparisonSignalBreakdown(validSources);
    }

    private renderComparisonTable(validSources: Source[]) {
        // Calculate headers: Diagnostic Criteria + Source Names
        const tableHeaders = [
            new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: "Diagnostic Criteria", run: { bold: true, size: STYLE.sizes.small } })]
            }),
            ...validSources.map(s => new TableCell({
                width: { size: (75 / validSources.length), type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: s.title, run: { bold: true, size: STYLE.sizes.small } })]
            }))
        ];

        const rows: TableRow[] = [];

        // Header Row
        rows.push(new TableRow({ children: tableHeaders, tableHeader: true }));

        // A. Overall Risk Index Row
        const riskRowCells = [
            new TableCell({ children: [new Paragraph({ text: "Overall Risk Index", run: { bold: true, size: STYLE.sizes.small } })] }),
            ...validSources.map(s => {
                const risk = calculateMicroFascismRisk(s.analysis!);
                const color = risk && risk.score >= 4 ? STYLE.colors.danger : STYLE.colors.primary;
                return new TableCell({
                    children: [new Paragraph({
                        text: risk ? `${risk.score}/6 (${risk.level})` : "-",
                        run: { color: color, bold: true, size: STYLE.sizes.small }
                    })]
                });
            })
        ];
        rows.push(new TableRow({ children: riskRowCells }));

        // B. Liberatory Potential Row
        const capacityRowCells = [
            new TableCell({ children: [new Paragraph({ text: "Liberatory Potential", run: { bold: true, size: STYLE.sizes.small } })] }),
            ...validSources.map(s => {
                const cap = calculateLiberatoryCapacity(s.analysis!);
                const color = cap && cap.score >= 5 ? STYLE.colors.success : STYLE.colors.primary;
                return new TableCell({
                    children: [new Paragraph({
                        text: cap ? `${cap.score}/8 (${cap.level})` : "-",
                        run: { color: color, bold: true, size: STYLE.sizes.small }
                    })]
                });
            })
        ];
        rows.push(new TableRow({ children: capacityRowCells }));

        // Table Construction
        const matrixTable = new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                left: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                right: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
            }
        });

        this.sections.push(matrixTable);
        this.addSpacer();
        this.addSpacer();
    }

    private renderComparisonSignalBreakdown(validSources: Source[]) {
        this.addSubHeader("Detailed Signal Breakdown");

        validSources.forEach(s => {
            const risk = calculateMicroFascismRisk(s.analysis!);
            const cap = calculateLiberatoryCapacity(s.analysis!);

            this.addText(`${s.title}:`, STYLE.colors.primary, 0, true);

            if (risk) {
                const riskFlags = Object.entries(risk.flags).filter(([k, v]) => v).map(([k]) => k.replace(/_/g, ' '));
                if (riskFlags.length > 0) {
                    this.addText(`• Risk Signals: ${riskFlags.join(", ")}`, STYLE.colors.danger);
                }
            }
            if (cap) {
                const capFlags = Object.entries(cap.signals).filter(([k, v]) => v).map(([k]) => k.replace(/_/g, ' '));
                if (capFlags.length > 0) {
                    this.addText(`• Liberatory Capacities: ${capFlags.join(", ")}`, STYLE.colors.success);
                }
            }
            this.addText("");
        });
    }

    public renderGovernanceMatrix(sources: Source[]) {
        if (!sources || sources.length < 2) return;

        // Filter for sources with governance scores
        const validSources = sources.filter(s => s.analysis && s.analysis.governance_scores);
        if (validSources.length < 2) return;

        this.addSectionHeader("Governance Compass Matrix", true);
        this.addText("Comparative analysis of governance mechanisms across frameworks.", STYLE.colors.meta);

        // Governance Dimensions
        const dimensions = [
            { id: "centralization", label: "Centralization" },
            { id: "rights_focus", label: "Rights Focus" },
            { id: "flexibility", label: "Flexibility" },
            { id: "market_power", label: "Market Power" },
            { id: "procedurality", label: "Procedurality" }
        ];

        // 1. Comparison Table
        const tableHeaders = [
            new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: "Governance Dimension", run: { bold: true, size: STYLE.sizes.small } })]
            }),
            ...validSources.map(s => new TableCell({
                width: { size: (75 / validSources.length), type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: s.title, run: { bold: true, size: STYLE.sizes.small } })]
            }))
        ];

        const rows: TableRow[] = [];
        rows.push(new TableRow({ children: tableHeaders, tableHeader: true }));

        dimensions.forEach(dim => {
            const rowCells = [
                new TableCell({ children: [new Paragraph({ text: dim.label, run: { bold: true, size: STYLE.sizes.small } })] }),
                ...validSources.map(s => {
                    const score = s.analysis?.governance_scores?.[dim.id as keyof typeof s.analysis.governance_scores] ?? "-";
                    return new TableCell({
                        children: [new Paragraph({
                            text: String(score),
                            run: { color: STYLE.colors.secondary, size: STYLE.sizes.small }
                        })]
                    });
                })
            ];
            rows.push(new TableRow({ children: rowCells }));
        });

        // Table Construction
        const matrixTable = new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                left: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                right: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.subtle },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: STYLE.colors.accent },
            }
        });

        this.sections.push(matrixTable);
        this.addSpacer();
    }


    private renderResistanceArtifacts(artifacts: any[]) {
        if (!artifacts || artifacts.length === 0) return;

        this.addSectionHeader("Primary Data: Resistance Artifacts", true);
        this.addText("Analysis of resistance materials (manifestos, policy drafts, etc.) revealing assemblage reconfiguration dynamics.", STYLE.colors.meta);
        this.addSpacer();

        artifacts.forEach((artifact, index) => {
            this.addSubHeader(`${index + 1}. ${artifact.title}`);

            const meta = [
                `Type: ${artifact.type.replace('_', ' ')}`,
                `Source: ${artifact.source}`,
                `Date: ${new Date(artifact.date).toLocaleDateString()}`
            ];
            this.addText(meta.join(" | "), STYLE.colors.subtle, 0, false);

            if (artifact.target_policy) {
                this.addText(`Target: ${artifact.target_policy}`, STYLE.colors.secondary, 0, false);
            }
            this.addSpacer();

            // Frames
            if (artifact.frames && artifact.frames.length > 0) {
                this.addText("Discourse Frames:", STYLE.colors.primary, 0, true);
                artifact.frames.forEach((frame: any) => {
                    this.addText(`• ${frame.frame_name}: ${frame.description}`, undefined, 1);
                    if (frame.evidence_quotes && frame.evidence_quotes.length > 0) {
                        this.addText(`"${frame.evidence_quotes[0]}"`, STYLE.colors.subtle, 2, false);
                    }
                });
                this.addSpacer();
            }

            // Reconfiguration
            if (artifact.reconfiguration_potential) {
                const reconfig = artifact.reconfiguration_potential;
                this.addText("Assemblage Reconfiguration:", STYLE.colors.primary, 0, true);

                if (reconfig.deterritorializes) {
                    this.addText(`Deterritorializes: ${reconfig.deterritorializes}`, undefined, 1);
                }
                if (reconfig.recodes) {
                    this.addText(`Recodes: ${reconfig.recodes}`, undefined, 1);
                }
                if (reconfig.theoretical_contribution) {
                    this.addText("Theoretical Contribution:", STYLE.colors.secondary, 1, true);
                    this.addText(reconfig.theoretical_contribution, undefined, 2);
                }
                this.addSpacer();
            }
        });

        this.addPageBreak();
    }

    public renderMultiLensAnalysis(data: ReportData["multiLens"]) {
        if (!data || !data.results) return;

        // Check if any results actually exist
        const hasResults = Object.values(data.results).some(r => r !== null);
        if (!hasResults) return;

        this.addSectionHeader("Reflexive Multi-Lens Analysis", true);
        this.addText("Theoretical Entanglement of: " + data.text.substring(0, 100) + "...", STYLE.colors.meta);

        // Iterate through known lenses
        const lenses = [
            { id: 'dsf', name: 'Decolonial Framework' },
            { id: 'cultural_framing', name: 'Cultural Framing' },
            { id: 'institutional_logics', name: 'Institutional Logics' },
            { id: 'legitimacy', name: 'Legitimacy Orders' }
        ];

        lenses.forEach(lens => {
            const result = data.results[lens.id as import("../types/report").LensType];

            // Actually, I will explicitly perform the replace to be sure.
            if (result) {
                this.addSubHeader(lens.name);

                // Key Insight
                if (result.key_insight) {
                    this.addText("Key Insight:", STYLE.colors.secondary, 0, true);
                    this.addText(result.key_insight);
                }

                // Specific Fields based on lens type
                if (lens.id === 'cultural_framing') {
                    if (result.dominant_cultural_logic) this.addText(`Dominant Logic: ${result.dominant_cultural_logic}`);
                    if (result.state_market_society) this.addText(result.state_market_society);
                }

                if (lens.id === 'institutional_logics') {
                    if (result.dominant_logic) this.addText(`Dominant Logic: ${result.dominant_logic}`);
                    if (result.overall_assessment) this.addText(result.overall_assessment);
                }

                if (lens.id === 'legitimacy') {
                    // Cast to any to access specific fields without importing the type locally if not needed
                    const l = result as any;
                    if (l.dominant_order) this.addText(`Dominant Order: ${l.dominant_order}`);
                    if (l.justification_logic) this.addText(`Justification: ${l.justification_logic}`);
                }
            }
        });
    }

    private renderEcosystemConfigurations(configurations: any[]) {
        if (!configurations || configurations.length === 0) return;

        this.addSubHeader("Ecosystem Configurations (Assemblages)");

        configurations.forEach((config: any, index: number) => {
            this.addText(`${index + 1}. ${config.name}`, STYLE.colors.primary, 0, true);
            if (config.description) {
                this.addText(config.description, STYLE.colors.subtle, 1);
            }

            if (config.properties) {
                this.addText(`Stability: ${config.properties.stability || 'N/A'}`, undefined, 1);
                this.addText(`Generativity: ${config.properties.generativity || 'N/A'}`, undefined, 1);
                if (config.properties.territorialization_score !== undefined) {
                    this.addText(`Territorialization: ${config.properties.territorialization_score}/10`, undefined, 1);
                }
                if (config.properties.coding_intensity_score !== undefined) {
                    this.addText(`Coding Intensity: ${config.properties.coding_intensity_score}/10`, undefined, 1);
                }
            }

            if (config.memberIds && config.memberIds.length > 0) {
                this.addText(`Member Actors: ${config.memberIds.length}`, STYLE.colors.secondary, 1);
            }

            this.addSpacer();
        });
    }

    public renderScenarios(scenarios: any) {
        if (!scenarios || Object.keys(scenarios).length === 0) return;

        this.addSectionHeader("Scenario Analysis", true);
        this.addText("Hypothetical scenarios testing the resilience and adaptability of the governance assemblage.");
        this.addSpacer();

        // Scenarios are typically stored as an object with scenario IDs as keys
        Object.entries(scenarios).forEach(([scenarioId, scenarioData]: [string, any]) => {
            if (scenarioData && scenarioData.name) {
                this.addSubHeader(scenarioData.name);
                if (scenarioData.description) {
                    this.addText(scenarioData.description);
                }
                if (scenarioData.effects) {
                    this.addText("Effects:", STYLE.colors.secondary, 0, true);
                    scenarioData.effects.forEach((effect: string) => {
                        this.addText(`• ${effect}`, undefined, 1);
                    });
                }
                this.addSpacer();
            }
        });
    }

    public renderMethodologicalLogs(logs: any[]) {
        if (!logs || logs.length === 0) return;

        this.addSectionHeader("Methodological Reflexivity Log", true);
        this.addText("Documentation of interpretive decisions, conflicts, and positionality throughout the analysis.");
        this.addSpacer();

        logs.forEach((log: any, index: number) => {
            const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';
            this.addText(`[${timestamp}] ${log.type}`, STYLE.colors.primary, 0, true);

            if (log.details) {
                if (log.details.conflict_type) {
                    this.addText(`Conflict Type: ${log.details.conflict_type}`, undefined, 1);
                }
                if (log.details.lens_applied) {
                    this.addText(`Lens Applied: ${log.details.lens_applied}`, undefined, 1);
                }
                if (log.details.resolution || log.details.rationale) {
                    const text = log.details.resolution || log.details.rationale;
                    this.addText(text, undefined, 1);
                }
                if (log.details.discrepancy_score) {
                    this.addText(`Discrepancy Score: ${log.details.discrepancy_score}`, undefined, 1);
                }
            }

            this.addSpacer();
        });
    }

    private renderAssemblageRhizome(network: any) {
        if (!network || !network.nodes || network.nodes.length === 0) return;

        this.addSubHeader("Assemblage Rhizome (Policy Network)");
        this.addText("Mapping shared ancestry and inter-referential citations across policy documents.");
        this.addSpacer();

        // Nodes
        this.addText("Network Nodes:", STYLE.colors.secondary, 0, true);
        network.nodes.forEach((node: string) => {
            this.addText(`• ${node}`, undefined, 1);
        });
        this.addSpacer();

        // Edges (Relationships)
        if (network.edges && network.edges.length > 0) {
            this.addText("Network Relationships:", STYLE.colors.secondary, 0, true);
            network.edges.forEach((edge: any) => {
                this.addText(`• ${edge.from} → ${edge.to} (${edge.type})`, undefined, 1);
            });
            this.addSpacer();
        }

        this.addText("Note: Visual network diagram available in the web interface.", STYLE.colors.subtle, 0, false);
    }

    public async generateAndDownload(filename: string) {
        const doc = new Document({
            sections: [{
                properties: {},
                children: this.sections,
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, filename);
    }
}


export async function generateFullReportDOCX(data: ReportData, options?: ReportSectionSelection) {
    const generator = new ReportGeneratorDOCX();

    // Default to true for all if options are not provided
    const show = options || {
        documentAnalysis: true,
        comparisonMatrix: true,
        synthesis: true,
        resistance: true,
        ecosystem: true,
        cultural: true,
        ontology: true,
        multiLens: true,
        scenarios: true,
        logs: true,
        configurations: true,
        resistanceArtifacts: true
    };

    // 1. Title Page
    generator.addTitlePage("Comprehensive Analysis Report", "Decolonial Situatedness in Global AI Governance");

    // 2. Document Analysis (Iterate Sources)
    if (show.documentAnalysis) {
        const analyzedSources = data.sources.filter(s =>
            s.analysis || s.cultural_framing || s.institutional_logics || s.legitimacy_analysis || s.resistance_analysis
        );

        if (analyzedSources.length > 0) {
            generator.addSectionHeader("Document Analysis", true);
            analyzedSources.forEach((source, index) => {
                generator.renderSourceAnalysis(source, index + 1);
            });
        }
    }

    // 3. Comparative Diagnostic Matrix
    if (show.comparisonMatrix) {
        // Need re-filtering if document analysis wasn't run earlier, but lightweight filter is fine
        const analyzedSourcesForMatrix = data.sources.filter(s =>
            s.analysis || s.cultural_framing || s.institutional_logics || s.legitimacy_analysis || s.resistance_analysis
        );

        if (analyzedSourcesForMatrix.length >= 2) {
            generator.renderComparisonMatrix(analyzedSourcesForMatrix);
            // 3a. Governance Compass Matrix - bundled with comparison for now logic-wise, or could be split if requested
            generator.renderGovernanceMatrix(analyzedSourcesForMatrix);
        }
    }

    // 4. Synthesis
    if (show.synthesis && data.synthesis) {
        generator.renderCrossCaseSynthesis(data.synthesis);
    }

    // 4. Resistance Synthesis
    if (show.resistance && data.resistance) {
        generator.renderResistanceAnalysis(data.resistance);
    }

    // 4b. Resistance Artifacts (Primary Data)
    if (show.resistanceArtifacts && data.resistanceArtifacts) {
        // @ts-ignore - Private method access
        generator.renderResistanceArtifacts(data.resistanceArtifacts);
    }

    // 5. Ecosystem
    if (show.ecosystem && data.ecosystem) {
        generator.renderEcosystemAnalysis(data.ecosystem);
    }

    // 6. Cultural (Discursive Fields)
    if (show.cultural && data.cultural) {
        generator.renderCulturalAnalysis(data.cultural);
    }

    // 7. Ontology
    if (show.ontology && data.ontology) {
        generator.renderOntology(data.ontology);
    }

    // 7. Multi-Lens (Reflexivity)
    if (show.multiLens && data.multiLens) {
        generator.renderMultiLensAnalysis(data.multiLens);
    }

    // 8. Scenarios
    if (show.scenarios && data.ecosystem?.configurations) {
        // For now, scenarios are not directly stored, but we can render configurations as a proxy
        // If scenarios are stored separately in the future, update this logic
        generator.renderScenarios({});
    }

    // 9. Methodological Logs
    if (show.logs && data.logs) {
        generator.renderMethodologicalLogs(data.logs);
    }

    await generator.generateAndDownload(`Comprehensive_Report_${new Date().toISOString().split('T')[0]}.docx`);
}
