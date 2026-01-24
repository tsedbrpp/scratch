import { AnalysisResult } from "@/types";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderInstitutionalLogics(generator: ReportGeneratorDOCX, logics: AnalysisResult) {
    generator.addSubHeader("Institutional Logics");

    if (logics.dominant_logic) {
        generator.addText("Dominant Logic: " + logics.dominant_logic, STYLE.colors.primary, 0, true);
    }

    if (logics.logics) {
        const l = logics.logics;
        let stats = "";
        if (l.market) stats += `• Market Logic: ${l.market.strength}/10\n`;
        if (l.state) stats += `• State Logic: ${l.state.strength}/10\n`;
        if (l.professional) stats += `• Professional Logic: ${l.professional.strength}/10\n`;
        if (l.community) stats += `• Community Logic: ${l.community.strength}/10`;
        generator.addText(stats);
    }

    if (logics.logic_conflicts && logics.logic_conflicts.length > 0) {
        generator.addText("Key Institutional Conflicts:", STYLE.colors.secondary, 0, true);
        logics.logic_conflicts.forEach((c) => {
            generator.addText(`• ${c.between}: ${c.site_of_conflict} (Resolution: ${c.resolution_strategy})`);
        });
    }
}
