import { Source } from "@/types";
import { Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle } from "docx";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";
import { calculateMicroFascismRisk } from "@/lib/risk-calculator";
import { calculateLiberatoryCapacity } from "@/lib/liberatory-calculator";

export function renderComparisonMatrix(generator: ReportGeneratorDOCX, sources: Source[]) {
    if (!sources || sources.length < 2) return;

    // Filter for sources with analysis
    const validSources = sources.filter(s => s.analysis);
    if (validSources.length < 2) return;

    generator.addSectionHeader("Comparative Diagnostic Matrix", true);
    generator.addText("Flattened matrix view for rapid cross-policy signal analysis.", STYLE.colors.meta);

    // 1. Comparison Table
    renderComparisonTable(generator, validSources);

    // 2. Detailed Breakdown text (to avoid super wide tables)
    renderComparisonSignalBreakdown(generator, validSources);
}

function renderComparisonTable(generator: ReportGeneratorDOCX, validSources: Source[]) {
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

    generator.sections.push(matrixTable);
    generator.addSpacer();
    generator.addSpacer();
}

function renderComparisonSignalBreakdown(generator: ReportGeneratorDOCX, validSources: Source[]) {
    generator.addSubHeader("Detailed Signal Breakdown");

    validSources.forEach(s => {
        const risk = calculateMicroFascismRisk(s.analysis!);
        const cap = calculateLiberatoryCapacity(s.analysis!);

        generator.addText(`${s.title}:`, STYLE.colors.primary, 0, true);

        if (risk) {
            const riskFlags = Object.entries(risk.flags).filter(([k, v]) => v).map(([k]) => k.replace(/_/g, ' '));
            if (riskFlags.length > 0) {
                generator.addText(`• Risk Signals: ${riskFlags.join(", ")}`, STYLE.colors.danger);
            }
        }
        if (cap) {
            const capFlags = Object.entries(cap.signals).filter(([k, v]) => v).map(([k]) => k.replace(/_/g, ' '));
            if (capFlags.length > 0) {
                generator.addText(`• Liberatory Capacities: ${capFlags.join(", ")}`, STYLE.colors.success);
            }
        }
        generator.addText("");
    });
}

export function renderGovernanceMatrix(generator: ReportGeneratorDOCX, sources: Source[]) {
    if (!sources || sources.length < 2) return;

    // Filter for sources with governance scores
    const validSources = sources.filter(s => s.analysis && s.analysis.governance_scores);
    if (validSources.length < 2) return;

    generator.addSectionHeader("Governance Compass Matrix", true);
    generator.addText("Comparative analysis of governance mechanisms across frameworks.", STYLE.colors.meta);

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

    generator.sections.push(matrixTable);
    generator.addSpacer();
}
