import { ProvisionalInscription, FragilityScore } from '@/types/provisional';

/**
 * Provisional Wrapper Service
 * Wraps AI outputs with fragility scores and authority conditions
 * 
 * Key Principle: All AI outputs are PROVISIONAL, not authoritative
 */
export class ProvisionalWrapper {
    /**
     * Wrap content as provisional inscription
     */
    static wrap(
        content: string,
        source: "ai_generated" | "user_validated" | "document_extracted",
        inputCompleteness: number = 0.7
    ): ProvisionalInscription {
        const fragility = this.calculateFragility(source, inputCompleteness);

        return {
            content,
            source,
            fragility_score: fragility,
            authority_conditions: this.generateAuthorityConditions(fragility),
            contestation_risks: this.generateContestationRisks(fragility),
            created_at: new Date().toISOString()
        };
    }

    /**
     * Calculate fragility score based on multiple factors
     */
    private static calculateFragility(
        source: "ai_generated" | "user_validated" | "document_extracted",
        inputCompleteness: number
    ): FragilityScore {
        // Model uncertainty varies by source
        const modelUncertainty = source === "ai_generated" ? 0.6 :
            source === "user_validated" ? 0.3 : 0.2;

        // Theoretical tension (ANT vs Assemblage instrumentalization)
        const theoreticalTension = 0.5; // Constant for hybrid mode

        // Empirical grounding based on input
        const empiricalGrounding = inputCompleteness;

        // Weighted average
        const value = (
            (1 - inputCompleteness) * 0.3 +
            modelUncertainty * 0.4 +
            theoreticalTension * 0.2 +
            (1 - empiricalGrounding) * 0.1
        );

        return {
            value,
            factors: {
                input_completeness: inputCompleteness,
                model_uncertainty: modelUncertainty,
                theoretical_tension: theoreticalTension,
                empirical_grounding: empiricalGrounding
            },
            interpretation: this.interpretFragility(value)
        };
    }

    /**
     * Interpret fragility value
     */
    private static interpretFragility(value: number): "stable" | "contested" | "provisional" | "speculative" {
        if (value > 0.7) return "speculative";
        if (value > 0.5) return "provisional";
        if (value > 0.3) return "contested";
        return "stable";
    }

    /**
     * Generate authority conditions (when inscription gains traction)
     */
    private static generateAuthorityConditions(fragility: FragilityScore): string[] {
        const conditions = [
            "Empirical validation with additional data",
            "Peer review and academic citation",
            "Stakeholder enrollment and acceptance"
        ];

        if (fragility.value > 0.6) {
            conditions.push("Significant additional evidence required");
            conditions.push("Alternative interpretations must be ruled out");
        }

        if (fragility.factors.model_uncertainty > 0.5) {
            conditions.push("Human expert validation needed");
        }

        return conditions;
    }

    /**
     * Generate contestation risks (how it could be challenged)
     */
    private static generateContestationRisks(fragility: FragilityScore): string[] {
        const risks = [
            "Alternative theoretical interpretations possible",
            "Limited empirical grounding may be challenged"
        ];

        if (fragility.factors.model_uncertainty > 0.5) {
            risks.push("AI model uncertainty creates vulnerability to contestation");
        }

        if (fragility.factors.theoretical_tension > 0.4) {
            risks.push("Theoretical instrumentalization may be rejected by purists");
        }

        if (fragility.factors.input_completeness < 0.6) {
            risks.push("Incomplete input data undermines credibility");
        }

        return risks;
    }

    /**
     * Add alternative interpretation to existing inscription
     */
    static addAlternativeInterpretation(
        inscription: ProvisionalInscription,
        interpretation: string,
        theoreticalBasis: string,
        plausibility: number
    ): ProvisionalInscription {
        const alternatives = inscription.alternative_interpretations || [];

        return {
            ...inscription,
            alternative_interpretations: [
                ...alternatives,
                {
                    interpretation,
                    theoretical_basis: theoreticalBasis,
                    plausibility
                }
            ],
            last_contested_at: new Date().toISOString()
        };
    }
}
