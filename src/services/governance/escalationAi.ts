import { AnalysisResult } from "@/types";
import { EscalationConfiguration, EscalationStatus } from "@/types/escalation";

interface EscalationEvaluationResponse {
    success: boolean;
    analysis: {
        escalation_status?: Partial<EscalationStatus>;
    };
    error?: string;
}

/**
 * Invokes the AI "Pattern Sentinel" via the backend API.
 * This is called by the rule engine (escalationRules.ts) when hybrid evaluation is needed.
 */
export async function evaluateEscalationWithAI(
    analysis: AnalysisResult,
    config: EscalationConfiguration
): Promise<Partial<EscalationStatus> | null> {

    // Optimization: Don't call AI if analysis is trivial or empty
    if (!analysis.key_insight || analysis.key_insight.length < 10) {
        return null;
    }

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                analysisMode: 'escalation_evaluation',
                existingAnalysis: analysis,
                // We pass config implicitly or explicitly if needed by backend, 
                // currently backend logic uses standard thresholds but could use config.evaluator_variance
                recurrence_count: config.recurrence_count
            })
        });

        if (!response.ok) {
            throw new Error(`AI Escalation check failed: ${response.statusText}`);
        }

        const result: EscalationEvaluationResponse = await response.json();

        if (result.success && result.analysis && result.analysis.escalation_status) {
            return result.analysis.escalation_status;
        }

        return null;

    } catch (error) {
        console.error("Pattern Sentinel Client Error:", error);
        // On network/client error, we do NOT block (fail open? or fail closed?)
        // Per "Uncertainty defaults to scrutiny", strictly we should return a fallback.
        // However, this client function returns Partial<Status> | null.
        // The consumer (hook/rule engine) should handle null/failure.
        // If we want to enforce scrutiny on connection failure:
        return {
            level: 'MEDIUM',
            status: 'DETECTED',
            reasons: ['MANUAL_TRIGGER'],
            rationale: "Connection to Pattern Sentinel failed. Defaulting to scrutiny."
        };
    }
}
