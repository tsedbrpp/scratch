import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderMethodologicalLogs(generator: ReportGeneratorDOCX, logs: any[]) {
    if (!logs || logs.length === 0) return;

    generator.addSectionHeader("Methodological Reflexivity Log", true);
    generator.addText("Documentation of interpretive decisions, conflicts, and positionality throughout the analysis.");
    generator.addSpacer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logs.forEach((log: any) => {
        const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';
        generator.addText(`[${timestamp}] ${log.type}`, STYLE.colors.primary, 0, true);

        if (log.details) {
            if (log.details.conflict_type) {
                generator.addText(`Conflict Type: ${log.details.conflict_type}`, undefined, 1);
            }
            if (log.details.lens_applied) {
                generator.addText(`Lens Applied: ${log.details.lens_applied}`, undefined, 1);
            }
            if (log.details.resolution || log.details.rationale) {
                const text = log.details.resolution || log.details.rationale;
                generator.addText(text, undefined, 1);
            }
            if (log.details.discrepancy_score) {
                generator.addText(`Discrepancy Score: ${log.details.discrepancy_score}`, undefined, 1);
            }
        }

        generator.addSpacer();
    });
}
