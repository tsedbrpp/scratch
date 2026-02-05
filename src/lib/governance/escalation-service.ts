import OpenAI from 'openai';
import { AnalysisResult } from '@/types';
import { EscalationStatus, EscalationConfiguration, EscalationLevel, EscalationReasonCode } from '@/types/escalation';

// Define the structure for the AI's internal analysis response
interface AIPatternDetection {
    subtle_determinism: {
        detected: boolean;
        confidence: number;
        evidence: string[]; // Quotes
        mechanism?: string; // [NEW] Explanation of how language functions
    };
    hidden_normativity: {
        detected: boolean;
        confidence: number;
        evidence: string[];
        mechanism?: string;
    };
    scope_creep: {
        detected: boolean;
        confidence: number;
        evidence: string[];
        mechanism?: string;
    };
    overall_confidence: number;
    epistemic_uncertainty: boolean; // True if the model feels unqualified or context is missing
}

/**
 * The "Pattern Sentinel" - Epistemic Auditor.
 * Scans analysis results for specific discursive risks that deterministic rules miss.
 */
export async function runEscalationEvaluation(
    openai: OpenAI,
    analysis: AnalysisResult,
    config: EscalationConfiguration
): Promise<Partial<EscalationStatus>> {

    const context = `
    Analysis Summary: ${analysis.overall_assessment || analysis.key_insight || "N/A"}
    Key Insights: ${analysis.key_insight || "N/A"}
    Blindspots: ${analysis.system_critique?.blind_spots?.map((b: any) => typeof b === 'string' ? b : b.title).join('; ') || "None"}
    `;

    const prompt = (await import('@/prompts/escalation-sentinel')).PATTERN_SENTINEL_PROMPT;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use standard model for compatibility
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: `CONTEXT TO AUDIT:\n${context}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2 // Low temperature for consistent detection
        });

        const resultText = response.choices[0].message.content || "{}";
        const detection: AIPatternDetection = JSON.parse(resultText);

        // --- MAPPING LOGIC (The "Binding Policy") ---
        // The AI detects patterns; WE decide the consequences.

        const reasons: EscalationReasonCode[] = [];
        let level: EscalationLevel = 'NONE';
        let rationaleParts: string[] = [];

        // 1. Check for Epistemic Uncertainty (The "Uncertainty Principle")
        // If the auditor is unsure, we escalate to MEDIUM for human review.
        if (detection.epistemic_uncertainty || detection.overall_confidence < 0.6) {
            let explanation = "Pattern Sentinel reported high epistemic uncertainty. Human review required to verify analysis validity.";

            // Append any specific partial detections that contributed to confusion
            const fragments = [];
            if (detection.subtle_determinism?.evidence?.length) {
                const mech = detection.subtle_determinism.mechanism || "Phrasing that presents contingent outcomes as inevitable.";
                fragments.push(`Possible Determinism: ${mech}\nEvidence: "${detection.subtle_determinism.evidence.join('", "')}"`);
            }
            if (detection.hidden_normativity?.evidence?.length) {
                const mech = detection.hidden_normativity.mechanism || "Prescriptive statements disguised as descriptive facts.";
                fragments.push(`Possible Normativity: ${mech}\nEvidence: "${detection.hidden_normativity.evidence.join('", "')}"`);
            }
            if (detection.scope_creep?.evidence?.length) {
                const mech = detection.scope_creep.mechanism || "Claims of global validity based on local evidence.";
                fragments.push(`Possible Scope Creep: ${mech}\nEvidence: "${detection.scope_creep.evidence.join('", "')}"`);
            }

            if (fragments.length > 0) {
                explanation += `\n\nAmbiguity Context:\n${fragments.join('\n\n')}`;
            }

            return {
                level: 'MEDIUM',
                status: 'DETECTED',
                reasons: ['MANUAL_TRIGGER'], // Mapping uncertainty to manual trigger for review
                rationale: explanation
            };
        }

        // 2. Map Detections to Risks
        if (detection.subtle_determinism.detected && detection.subtle_determinism.confidence > 0.7) {
            reasons.push('RECURRENT_PATTERN'); // Using closest code, or we might need a new one like 'DISCURSIVE_RISK'
            const mech = detection.subtle_determinism.mechanism || "Phrasing that presents contingent outcomes as inevitable.";
            rationaleParts.push(`Subtle Determinism: ${mech} | Evidence: ${detection.subtle_determinism.evidence.join('; ')}`);
        }

        if (detection.hidden_normativity.detected && detection.hidden_normativity.confidence > 0.7) {
            reasons.push('HIGH_COLONIALITY'); // Conceptual mapping: Normativity often implies coloniality
            const mech = detection.hidden_normativity.mechanism || "Prescriptive statements disguised as descriptive facts.";
            rationaleParts.push(`Hidden Normativity: ${mech} | Evidence: ${detection.hidden_normativity.evidence.join('; ')}`);
        }

        if (detection.scope_creep.detected && detection.scope_creep.confidence > 0.7) {
            reasons.push('HIGH_ABSENCE'); // Conceptual mapping: Scope creep ignores absence of evidence
            const mech = detection.scope_creep.mechanism || "Claims of global validity based on local evidence.";
            rationaleParts.push(`Scope Creep: ${mech} | Evidence: ${detection.scope_creep.evidence.join('; ')}`);
        }

        // 3. Determine Level
        if (reasons.length > 0) {
            // "Grey Area" risks default to SOFT (Advisory) unless Recurrence or config says otherwise.
            // But per critique: "Uncertainty defaults to scrutiny".
            // Since we have specific detections here with high confidence, we set to SOFT to prompt reassembly,
            // but we can upgrade to MEDIUM if multiple risks are present.

            if (reasons.length >= 2) {
                level = 'MEDIUM'; // Multiple discursive risks -> Binding Reassembly
            } else {
                level = 'SOFT'; // Single discursive risk -> Advisory
            }
        }

        return {
            level,
            status: level === 'NONE' ? 'RESOLVED' : 'DETECTED',
            reasons,
            rationale: rationaleParts.join('\n') || "No discursive risks detected by Pattern Sentinel."
        };

    } catch (error) {
        console.error("Pattern Sentinel Failure:", error);
        // Fallback: If AI fails, we escalate to MEDIUM (Uncertainty Principle)
        return {
            level: 'MEDIUM',
            status: 'DETECTED',
            reasons: ['MANUAL_TRIGGER'],
            rationale: "Pattern Sentinel failed to execute. System defaulting to scrutiny (MEDIUM)."
        };
    }
}
