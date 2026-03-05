import { jsPDF } from "jspdf";
import { SynthesisComparisonResult } from "@/types/synthesis";

export function generateSynthesisPDF(
    data: SynthesisComparisonResult,
    sourceA: string,
    sourceB: string,
    abstractMachines?: any,
    controversyA?: any,
    controversyB?: any
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = margin;

    // Helper: Add Page Check
    const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > pageHeight - margin) {
            doc.addPage();
            y = margin;
            return true;
        }
        return false;
    };

    // Helper: Add Title
    const addTitle = (text: string, size = 16) => {
        checkPageBreak(size);
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59); // Slate-900
        doc.text(text, margin, y + 6);
        y += size * 0.8 + 8;
    };

    // Helper: Add Section Header
    const addSection = (text: string) => {
        y += 5;
        checkPageBreak(20);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105); // Slate-600
        doc.text(text, margin, y + 5);
        // Underline
        doc.setDrawColor(203, 213, 225); // Slate-300
        doc.line(margin, y + 8, pageWidth - margin, y + 8);
        y += 18;
    };

    // Helper: Add Paragraph
    const addParagraph = (text: string, size = 10, color: [number, number, number] = [0, 0, 0]) => {
        if (!text) return;
        doc.setFontSize(size);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentWidth);
        const height = lines.length * size * 0.45; // Approx line height

        checkPageBreak(height + 5);
        doc.text(lines, margin, y);
        y += height + 4;
    };

    // Helper: Add Key-Value Box
    const addBox = (label: string, text: string, bgColor: [number, number, number]) => {
        if (!text || text === "...") return; // Skip empty

        doc.setFontSize(10);
        const lines = doc.splitTextToSize(text, contentWidth - 6); // Padding
        const height = lines.length * 5 + 12; // Text height + Padding

        checkPageBreak(height + 5);

        // Background
        doc.setFillColor(...bgColor);
        doc.setDrawColor(bgColor[0] - 20, bgColor[1] - 20, bgColor[2] - 20); // Darker border
        doc.roundedRect(margin, y, contentWidth, height, 2, 2, "FD");

        // Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.text(label.toUpperCase(), margin + 3, y + 6);

        // Content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(lines, margin + 3, y + 14);

        y += height + 4;
    };

    // --- REPORT GENERATION ---

    // 1. Cover / Header
    addTitle("Decolonial Situatedness Analysis", 22);
    addParagraph(`Comparing: ${sourceA} vs ${sourceB}`, 12, [71, 85, 105]);
    addParagraph(`Generated: ${new Date().toLocaleDateString()}`, 10, [148, 163, 184]);
    y += 10;

    // 2. Executive Summary (if available)
    if (data.resonances?.narrative) {
        addSection("Executive Summary");
        addParagraph(data.resonances.narrative);
    }

    // 3. Matrix Analysis (Risk, Governance, Rights, Scope)
    const dimensions = [
        { key: 'risk', label: 'Risk Definition' },
        { key: 'governance', label: 'Governance Structure' },
        { key: 'rights', label: 'Rights Framework' },
        { key: 'scope', label: 'Territorial Scope' }
    ];

    dimensions.forEach(dim => {
        const item = data[dim.key as keyof SynthesisComparisonResult] as any;
        if (!item) return;

        addSection(dim.label);

        addBox("Convergence", item.convergence, [220, 252, 231]); // Green-100
        addBox("Divergence", item.divergence, [219, 234, 254]); // Blue-100
        addBox("Coloniality", item.coloniality, [254, 226, 226]); // Red-100
        addBox("Resistance", item.resistance, [243, 232, 255]); // Purple-100
    });

    // 4. Rhizomatic Resonances (Shared Strategies)
    if (data.resonances?.shared_strategies && data.resonances.shared_strategies.length > 0) {
        addSection("Rhizomatic Resonances");
        doc.setFont("helvetica", "bold");
        doc.text("Shared Strategies & Concepts:", margin, y);
        y += 6;

        data.resonances.shared_strategies.forEach(strat => {
            checkPageBreak(8);
            doc.setFont("helvetica", "normal");
            doc.text(`• ${strat}`, margin + 5, y);
            y += 6;
        });
    }

    // 5. Abstract Machines Comparison
    if (abstractMachines?.comparison?.double_articulation) {
        addSection("Abstract Machines Comparison");

        abstractMachines.comparison.double_articulation.forEach((art: any, index: number) => {
            checkPageBreak(30);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59); // Slate-900
            doc.text(`${index + 1}. ${art.stratum_name}`, margin, y);
            y += 8;

            addBox("Convergence", art.convergence, [220, 252, 231]);
            addBox("Divergence", art.divergence, [219, 234, 254]);
            addBox("Coloniality", art.colonial_asymmetry, [254, 226, 226]);
            addBox("Resistance", art.resistance_potential, [243, 232, 255]);
            addBox("Synthesis", art.synthesis, [248, 250, 252]);
        });
    }

    // Helper: Add Controversy Map
    const addControversyMap = (controversy: any, sourceName: string) => {
        if (!controversy?.core_controversy) return;

        addSection(`Controversy Map: ${sourceName}`);

        // Overview
        addBox("Core Dispute", controversy.core_controversy.description, [254, 243, 199]); // Amber-100
        addBox("Stakes", controversy.core_controversy.stakes, [255, 255, 255]);

        // Top Frictions
        if (controversy.frictions && controversy.frictions.length > 0) {
            y += 5;
            checkPageBreak(15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50, 50, 50);
            doc.text("High-Intensity Frictions:", margin, y);
            y += 8;

            controversy.frictions
                .filter((f: any) => f.intensity === 'High')
                .forEach((fric: any) => {
                    checkPageBreak(25);

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(185, 28, 28); // Red-700
                    doc.text(`• ${fric.name}`, margin + 2, y);
                    y += 5;

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.setTextColor(71, 85, 105);
                    const actorsText = `Primary Actors: ${fric.primary_actors.join(", ")}`;
                    doc.text(doc.splitTextToSize(actorsText, contentWidth - 10), margin + 6, y);
                    y += doc.splitTextToSize(actorsText, contentWidth - 10).length * 4 + 2;

                    doc.setTextColor(15, 23, 42);
                    const descText = fric.description;
                    doc.text(doc.splitTextToSize(descText, contentWidth - 10), margin + 6, y);
                    y += doc.splitTextToSize(descText, contentWidth - 10).length * 4 + 4;
                });
        }
    };

    // 6. Controversy Maps
    addControversyMap(controversyA, sourceA);
    addControversyMap(controversyB, sourceB);

    // 7. Verified Quotes
    if (data.verified_quotes && data.verified_quotes.length > 0) {
        addSection("Verified Canonical Evidence");
        data.verified_quotes.forEach(quote => {
            const text = `"${quote.text}"`;
            const meta = `— ${quote.source} (${quote.relevance})`;

            checkPageBreak(30); // Approx
            addParagraph(text, 10, [51, 65, 85]); // Slate-700

            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(meta, margin + 5, y - 2); // Tweak y back up slightly
            y += 6;
        });
    }

    // Footer Page Numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(
            `Page ${i} of ${totalPages}  |  Generated by Antigravity`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );
    }

    // Save
    const filename = `analysis-${sourceA.substring(0, 10)}-vs-${sourceB.substring(0, 10)}.pdf`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(filename);
}
