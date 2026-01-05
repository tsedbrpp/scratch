import { AssemblageTrace, AssemblageExtractionResult } from "@/types/assemblage";

/**
 * Computes DeLanda Metrics from Extracted Traces.
 * 
 * Theory:
 * - Territorialization (T): The degree to which component roles are fixed and boundaries are sharpened.
 *   Calculated as: Density of Enforcements (Boundaries) + Narratives (Identity) weighted by Durability.
 * 
 * - Coding Intensity (C): The role of formal RULES (code, law) in defining behavior.
 *   Calculated as: Density of Rules (Code/Law) weighted by Durability.
 */

const DURABILITY_WEIGHTS = {
    "High": 3,   // Law, Code, Physics
    "Medium": 2, // Contracts, Standards
    "Low": 1     // Norms, Speech
};

export function computeDeLandaMetrics(traces: AssemblageTrace[] = []) {
    if (!traces || traces.length === 0) {
        return {
            territorialization_score: 0,
            coding_intensity_score: 0,
            territorialization_audit: ["No traces found."],
            coding_audit: ["No traces found."]
        };
    }

    let tScoreRaw = 0;
    let cScoreRaw = 0;
    const tAudit: string[] = [];
    const cAudit: string[] = [];

    traces.forEach(trace => {
        const weight = DURABILITY_WEIGHTS[trace.durability] || 1;

        // TERRITORIALIZATION: Mechanisms that define "Inside vs Outside" or "Identity"
        if (trace.type === "Enforcement" || trace.type === "Narrative") {
            tScoreRaw += weight;
            tAudit.push(`[${trace.type} | ${trace.durability}] ${trace.description} (+${weight})`);
        }

        // CODING INTENSITY: Mechanisms that define "Correct vs Incorrect" behavior (Rules)
        // Note: Enforcements often *enforce* coding, so they count partially too (half weight).
        if (trace.type === "Rule") {
            cScoreRaw += weight;
            cAudit.push(`[${trace.type} | ${trace.durability}] ${trace.description} (+${weight})`);
        } else if (trace.type === "Enforcement") {
            cScoreRaw += (weight * 0.5); // Enforcement proves coding exists
            cAudit.push(`[${trace.type} | ${trace.durability}] ${trace.description} (+${weight * 0.5})`);
        }
    });

    // Normalize Scores (Logarithmic scale to dampen explosion of traces)
    // We assume ~5 high-durability traces = "High" score (15 pts) for a typical 1-paragraph text.
    const normalize = (raw: number) => Math.min(10, Math.max(1, Math.round((Math.log2(raw + 1) / Math.log2(16)) * 10)));

    return {
        territorialization_score: normalize(tScoreRaw),
        coding_intensity_score: normalize(cScoreRaw),
        territorialization_audit: tAudit,
        coding_audit: cAudit
    };
}
