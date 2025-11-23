import { jsPDF } from "jspdf";

interface SynthesisFinding {
    dimension: string;
    convergence: string;
    divergence: string;
    coloniality: string;
    resistance: string;
}

export function generateSynthesisPDF(findings: SynthesisFinding[]) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(text, maxWidth);

        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.4) > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }

        doc.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.4 + 5;
    };

    // Title
    addText("Cross-Case Synthesis Report", 20, true, [30, 41, 59]);
    addText(`Decolonial Situatedness in Global AI Governance`, 14, false, [71, 85, 105]);
    yPosition += 5;
    addText(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 10, false, [100, 116, 139]);
    addText("Synthesis Matrix", 16, true, [30, 41, 59]);
    yPosition += 5;

    findings.forEach((finding, index) => {
        // Dimension title
        addText(`${index + 1}. ${finding.dimension}`, 13, true, [30, 41, 59]);
        yPosition += 2;

        // Convergence
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, yPosition - 5, maxWidth, 8, "F");
        addText(`Convergence: ${finding.convergence}`, 10);

        // Divergence
        doc.setFillColor(219, 234, 254);
        doc.rect(margin, yPosition - 5, maxWidth, 8, "F");
        addText(`Divergence: ${finding.divergence}`, 10);

        // Coloniality
        doc.setFillColor(254, 226, 226);
        doc.rect(margin, yPosition - 5, maxWidth, 8, "F");
        addText(`Coloniality: ${finding.coloniality}`, 10);

        // Resistance
        doc.setFillColor(243, 232, 255);
        doc.rect(margin, yPosition - 5, maxWidth, 8, "F");
        addText(`Resistance: ${finding.resistance}`, 10);

        yPosition += 5;
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );
    }

    // Save the PDF
    doc.save(`synthesis-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
