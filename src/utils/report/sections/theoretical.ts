import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderTheoreticalSynthesis(generator: ReportGeneratorDOCX, synthesisText: string) {
    generator.addPageBreak();
    generator.addSectionHeader("Theoretical Translation: ANT & Assemblage");

    // Disclaimer
    generator.addText(
        "This section translates the empirical findings into high-level socio-technical theory concepts (Actor-Network Theory and Assemblage Theory).",
        STYLE.colors.meta,
        0,
        false // Not bold
    );
    generator.addSpacer();

    const lines = synthesisText.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            generator.addSpacer();
            continue;
        }

        if (trimmed.startsWith("Result") || trimmed.startsWith("Theoretical Implications")) {
            // Main headers
            generator.addText(trimmed, STYLE.colors.primary, 0, true);
        } else if (trimmed.startsWith("ANT Reading:")) {
            // ANT sections
            generator.addText(trimmed, STYLE.colors.primary, 0, true);
        } else if (trimmed.startsWith("Assemblage Reading:")) {
            // Assemblage sections
            // Use secondary or explicit color if STYLE.colors.secondary exists. 
            // STYLE.colors.secondary is usually lighter in some themes, checking styles.ts would be best but using text color is safe too.
            // Let's assume standard text color but bold for the label part? 
            // The split approach is crude. Let's just bold the whole line if it's a header.
            generator.addText(trimmed, STYLE.colors.primary, 0, true);
        } else {
            // Body text
            generator.addText(trimmed);
        }
    }
}
