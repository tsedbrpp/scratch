import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";
// import { Source } from "../types"; // Imported via ReportData
import { ReportData } from "../types/report";
import { Source } from "../types";

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
        } else {
            this.addText("No analysis data available for this source.", STYLE.colors.subtle);
        }
    }

    private renderExistingAnalysisSections(source: Source) {
        // Cultural Framing
        if (source.cultural_framing) {
            this.addSubHeader("Cultural Framing Analysis");

            if (source.cultural_framing.state_market_society) {
                this.addText("State-Market-Society Relations:", STYLE.colors.secondary, 0, true);
                this.addText(source.cultural_framing.state_market_society);
            }
            if (source.cultural_framing.technology_role) {
                this.addText("Role of Technology:", STYLE.colors.secondary, 0, true);
                this.addText(source.cultural_framing.technology_role);
            }
            if (source.cultural_framing.rights_conception) {
                this.addText("Conception of Rights:", STYLE.colors.secondary, 0, true);
                this.addText(source.cultural_framing.rights_conception);
            }
            if (source.cultural_framing.dominant_cultural_logic) {
                this.addText("Dominant Cultural Logic:", STYLE.colors.secondary, 0, true);
                this.addText(source.cultural_framing.dominant_cultural_logic);
            }
        }

        // Institutional Logics
        if (source.institutional_logics) {
            this.addSubHeader("Institutional Logics");

            if (source.institutional_logics.dominant_logic) {
                this.addText("Dominant Logic: " + source.institutional_logics.dominant_logic, STYLE.colors.primary, 0, true);
            }

            if (source.institutional_logics.logics) {
                const l = source.institutional_logics.logics;
                let stats = "";
                if (l.market) stats += `• Market Logic: ${l.market.strength}/10\n`;
                if (l.state) stats += `• State Logic: ${l.state.strength}/10\n`;
                if (l.professional) stats += `• Professional Logic: ${l.professional.strength}/10\n`;
                if (l.community) stats += `• Community Logic: ${l.community.strength}/10`;
                this.addText(stats);
            }

            if (source.institutional_logics.logic_conflicts && source.institutional_logics.logic_conflicts.length > 0) {
                this.addText("Key Institutional Conflicts:", STYLE.colors.secondary, 0, true);
                source.institutional_logics.logic_conflicts.forEach(c => {
                    this.addText(`• ${c.between}: ${c.site_of_conflict} (Resolution: ${c.resolution_strategy})`);
                });
            }
        }

        // Legitimacy Analysis
        if (source.legitimacy_analysis) {
            this.addSubHeader("Legitimacy Analysis");

            if (source.legitimacy_analysis.dominant_order) {
                let domOrder = source.legitimacy_analysis.dominant_order;
                if (typeof domOrder === 'object') domOrder = "Mixed/Complex Orders";
                this.addText("Dominant Order: " + domOrder, STYLE.colors.primary, 0, true);
            }

            if (source.legitimacy_analysis.orders) {
                const o = source.legitimacy_analysis.orders;

                const formatScore = (val: any) => {
                    if (typeof val === 'object' && val !== null) {
                        return val.score || val.value || val.strength || "N/A";
                    }
                    return val;
                };

                const scores = `• Market: ${formatScore(o.market)}   • Industrial: ${formatScore(o.industrial)}   • Civic: ${formatScore(o.civic)}\n• Domestic: ${formatScore(o.domestic)}   • Inspired: ${formatScore(o.inspired)}   • Fame: ${formatScore(o.fame)}`;
                this.addText(scores);
            }

            if (source.legitimacy_analysis.conflict_spot) {
                this.addText("Conflict Spot:", STYLE.colors.secondary, 0, true);
                const conflict = source.legitimacy_analysis.conflict_spot;
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

        // Governance Compass (DSF)
        if (source.analysis && source.analysis.governance_scores) {
            this.addSubHeader("Governance Compass & Decolonial Analysis (DSF)");

            const g = source.analysis.governance_scores;
            const gScores = `• Centralization: ${g.centralization}\n• Rights Focus: ${g.rights_focus}\n• Flexibility: ${g.flexibility}\n• Market Power: ${g.market_power}\n• Procedurality: ${g.procedurality}`;
            this.addText(gScores);

            if (source.analysis.key_insight) {
                this.addText("Key Insight:", STYLE.colors.secondary, 0, true);
                this.addText(source.analysis.key_insight);
            }

            // Qualitative Analysis Fields
            if (source.analysis.governance_power_accountability) {
                this.addText("Governance, Power & Accountability:", STYLE.colors.secondary, 0, true);
                this.addText(source.analysis.governance_power_accountability);
            }
            if (source.analysis.plurality_inclusion_embodiment) {
                this.addText("Plurality & Inclusion:", STYLE.colors.secondary, 0, true);
                this.addText(source.analysis.plurality_inclusion_embodiment);
            }
            if (source.analysis.agency_codesign_self_determination) {
                this.addText("Agency & Self-Determination:", STYLE.colors.secondary, 0, true);
                this.addText(source.analysis.agency_codesign_self_determination);
            }
            if (source.analysis.reflexivity_situated_praxis) {
                this.addText("Reflexivity & Situated Praxis:", STYLE.colors.secondary, 0, true);
                this.addText(source.analysis.reflexivity_situated_praxis);
            }

            // Assemblage Dynamics
            if (source.analysis.assemblage_dynamics) {
                this.addSubHeader("Assemblage Dynamics");
                const dyn = source.analysis.assemblage_dynamics;
                this.addText(`• Territorialization: ${dyn.territorialization}`);
                this.addText(`• Deterritorialization: ${dyn.deterritorialization}`);
                this.addText(`• Coding: ${dyn.coding}`);
            }

            // Structural Pillars
            if (source.analysis.structural_pillars) {
                this.addSubHeader("Structural Pillars");
                const pillars = source.analysis.structural_pillars;
                if (pillars.risk) this.addText(`Risk: ${pillars.risk.description} (${pillars.risk.badge})`);
                if (pillars.rights) this.addText(`Rights: ${pillars.rights.description} (${pillars.rights.badge})`);
                if (pillars.enforcement) this.addText(`Enforcement: ${pillars.enforcement.description} (${pillars.enforcement.badge})`);
                if (pillars.scope) this.addText(`Scope: ${pillars.scope.description} (${pillars.scope.badge})`);
            }

            if (source.analysis.governance_score_explanations) {
                this.addText("Score Explanations:", STYLE.colors.secondary, 0, true);
                const e = source.analysis.governance_score_explanations;
                let expl = "";
                if (e.centralization) expl += `• Centralization: ${e.centralization}\n`;
                if (e.rights_focus) expl += `• Rights Focus: ${e.rights_focus}\n`;
                if (e.flexibility) expl += `• Flexibility: ${e.flexibility}`;
                this.addText(expl);
            }
        }
    }

    private renderDataPageCalculations(source: Source) {
        if (!source.analysis) return;

        // 1. Verification Gap
        if (source.analysis.verification_gap) {
            this.addSubHeader("Verification Gap Analysis");
            const gap = source.analysis.verification_gap;

            const gapStatus = gap.high_rhetoric_low_verification
                ? "DETECTED: High Rhetoric / Low Verification"
                : "Pass: Rhetoric is grounded";

            this.addText(gapStatus, gap.high_rhetoric_low_verification ? STYLE.colors.danger : STYLE.colors.success, 0, true);
            this.addText(gap.gap_explanation);
        }

        // 2. Stress Test Report
        if (source.analysis.stress_test_report) {
            this.addSubHeader("Counter-Narrative Stress Test");
            const stress = source.analysis.stress_test_report;

            this.addText(`Sensitivity: ${stress.framing_sensitivity} | Score Shift: ${stress.original_score} -> ${stress.perturbed_score}`, STYLE.colors.secondary);

            if (stress.shift_explanation) {
                this.addText("Explanation of Shift:", STYLE.colors.secondary, 0, true);
                this.addText(stress.shift_explanation);
            }

            if (stress.rhetorical_shifts) {
                this.addText("Rhetorical Shifts Detected:", STYLE.colors.secondary, 0, true);
                stress.rhetorical_shifts.forEach(shift => {
                    this.addText(`• Original: "${shift.original}" -> New: "${shift.new}"`);
                });
            }
        }

        // 3. System Critique (Blind Spots)
        if (source.analysis.system_critique) {
            this.addSubHeader("System Critique & Blind Spots");
            const critique = source.analysis.system_critique;

            if (critique.blind_spots && critique.blind_spots.length > 0) {
                this.addText("Potential Blind Spots:", STYLE.colors.danger, 0, true);
                critique.blind_spots.forEach(spot => this.addText(`• ${spot}`));
            }

            if (critique.legitimacy_correction) {
                this.addText("Legitimacy Correction:", STYLE.colors.secondary, 0, true);
                this.addText(critique.legitimacy_correction);
            }
        }

        // 4. Canonical Evidence
        if (source.analysis.verified_quotes && source.analysis.verified_quotes.length > 0) {
            this.addSubHeader("Canonical Evidence (Verified Quotes)");
            source.analysis.verified_quotes.forEach(quote => {
                this.addText(`"${quote.text}"`, STYLE.colors.secondary, 0, false);
                this.addText(`(Confidence: ${quote.confidence}, Context: ${quote.context})`, STYLE.colors.meta, 1);
            });
        }
    }

    public renderCrossCaseSynthesis(data: ReportData["synthesis"]) {
        if (!data || !data.comparison) return;
        this.addSectionHeader("Cross-Case Synthesis", true);

        const comp = data.comparison;

        // Executive Matrix
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

        // System Critique
        if (comp.system_critique) {
            this.addSubHeader("System-Level Critique");
            const crit = comp.system_critique;
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

        // Actors Table
        if (data.actors && data.actors.length > 0) {
            this.addSubHeader("Key Ecosystem Actors");

            // Create Table Rows
            const headerRow = new TableRow({
                children: [
                    new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Actor Name", run: { bold: true } })] }),
                    new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Type", run: { bold: true } })] }),
                    new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Influence", run: { bold: true } })] }),
                    new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Description", run: { bold: true } })] }),
                ],
                tableHeader: true,
            });

            const rows = data.actors.map(actor => new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(actor.name)] }),
                    new TableCell({ children: [new Paragraph(actor.type)] }),
                    new TableCell({ children: [new Paragraph(actor.influence)] }),
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

        // Cultural Holes
        if (data.culturalHoles) {
            this.addSubHeader("Structural Holes Analysis");
            if (data.culturalHoles.summary) {
                this.addText(data.culturalHoles.summary);
            }
            if (data.culturalHoles.holes && data.culturalHoles.holes.length > 0) {
                this.addText("Identified Holes:", STYLE.colors.secondary, 0, true);
                data.culturalHoles.holes.forEach(hole => {
                    this.addText(`• Between ${hole.clusterA} & ${hole.clusterB}: ${hole.opportunity}`);
                });
            }
        }
    }

    public renderOntology(data: ReportData["ontology"]) {
        if (!data) return;
        this.addSectionHeader("Ontological Cartography", true);

        const maps = Object.values(data.maps);
        if (maps.length === 0) {
            this.addText("No ontological maps generated.");
            return;
        }

        maps.forEach((map, idx) => {
            this.addSubHeader(`Map Analysis ${idx + 1}`);
            if (map.summary) this.addText(map.summary);
        });

        if (data.comparison) {
            this.addSubHeader("Comparative Ontology");
            this.addText(data.comparison.summary);
            this.addText("Structural Differences:", STYLE.colors.secondary, 0, true);
            this.addText(data.comparison.structural_differences);
        }
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
            const result = data.results[lens.id as any]; // Keeping as any for now to avoid import collision issues if LensType isn't exported as value. 
            // Actually, LensType is a type, so 'as LensType' works. Let's try to be cleaner but 'as any' is fine if it works. 
            // Wait, I should just leave it 'as any' if it works, but the lint error compliant was about implicit any. 
            // If I changed LensType in report.ts, 'as any' silences errors. 
            // The previous error `Element implicitly has an 'any' type` suggests strict mapping. 
            // Let's just keep the code as is since I updated the type definition which was the root cause of the mismatch.
            // But I will verify the fix I made for `formatScore` is there.

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


export async function generateFullReportDOCX(data: ReportData) {
    const generator = new ReportGeneratorDOCX();

    // 1. Title Page
    generator.addTitlePage("Comprehensive Analysis Report", "Decolonial Situatedness in Global AI Governance");

    // 2. Document Analysis (Iterate Sources)
    const analyzedSources = data.sources.filter(s =>
        s.analysis || s.cultural_framing || s.institutional_logics || s.legitimacy_analysis || s.resistance_analysis
    );

    if (analyzedSources.length > 0) {
        generator.addSectionHeader("Document Analysis", true);
        analyzedSources.forEach((source, index) => {
            generator.renderSourceAnalysis(source, index + 1);
        });
    }

    // 3. Synthesis
    if (data.synthesis) {
        generator.renderCrossCaseSynthesis(data.synthesis);
    }

    // 4. Resistance
    if (data.resistance) {
        generator.renderResistanceAnalysis(data.resistance);
    }

    // 5. Ecosystem
    if (data.ecosystem) {
        generator.renderEcosystemAnalysis(data.ecosystem);
    }

    // 6. Ontology
    if (data.ontology) {
        generator.renderOntology(data.ontology);
    }

    // 7. Multi-Lens (Reflexivity)
    if (data.multiLens) {
        generator.renderMultiLensAnalysis(data.multiLens);
    }

    await generator.generateAndDownload(`Comprehensive_Report_${new Date().toISOString().split('T')[0]}.docx`);
}
