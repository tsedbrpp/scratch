import { LegitimacyAnalysis } from "@/types";
import { ReportGeneratorDOCX } from "../generator";
import { STYLE } from "../styles";

export function renderLegitimacyAnalysis(generator: ReportGeneratorDOCX, legitimacy: LegitimacyAnalysis) {
    generator.addSubHeader("Legitimacy Analysis");

    if (legitimacy.dominant_order) {
        let domOrder = legitimacy.dominant_order;
        if (typeof domOrder === 'object') domOrder = "Mixed/Complex Orders";
        generator.addText("Dominant Order: " + domOrder, STYLE.colors.primary, 0, true);

        // [NEW] Justification Logic
        if (legitimacy.justification_logic) {
            let justification = legitimacy.justification_logic;
            if (typeof justification !== 'string') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const jObj = justification as any;
                justification = jObj.summary || jObj.text || jObj.description || JSON.stringify(jObj);
            }
            generator.addText(justification as string);
        }
        generator.addSpacer();
    }

    // [NEW] Moral Vocabulary
    if (legitimacy.moral_vocabulary) {
        const vocab = legitimacy.moral_vocabulary;
        if (Array.isArray(vocab)) {
            generator.addText("Moral Vocabulary:", STYLE.colors.secondary, 0, true);
            generator.addText(vocab.join(", "));
            generator.addSpacer();
        } else if (typeof vocab === 'string') {
            generator.addText("Moral Vocabulary:", STYLE.colors.secondary, 0, true);
            generator.addText(vocab);
            generator.addSpacer();
        }
    }

    if (legitimacy.orders) {
        const o = legitimacy.orders;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatScore = (val: any) => {
            if (typeof val === 'object' && val !== null) {
                return val.score || val.value || val.strength || "N/A";
            }
            return val;
        };

        const scores = `• Market: ${formatScore(o.market)}   • Industrial: ${formatScore(o.industrial)}   • Civic: ${formatScore(o.civic)}\n• Domestic: ${formatScore(o.domestic)}   • Inspired: ${formatScore(o.inspired)}   • Fame: ${formatScore(o.fame)}`;
        generator.addText(scores);
    }

    if (legitimacy.conflict_spot) {
        generator.addText("Conflict Spot:", STYLE.colors.secondary, 0, true);
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
        generator.addText(conflictDesc);
    }
}
