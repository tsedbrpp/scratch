import { z } from 'zod';

import OpenAI from 'openai';
import { PromptRegistry } from '@/lib/prompts/registry';

// Define the structured output schema
// Define the structured output schema first as a base
export const BaseStructuralConcernSchema = z.object({
    insufficientEvidence: z.boolean().describe("Set to true ONLY if the provided excerpts do not contain enough structural or role-allocating text to make grounded claims about governance standing or explicit exclusion. Do NOT hallucinate roles based on outside knowledge."),
    thesis: z.string().optional().describe("A 1-2 sentence overall conclusion of the structural exclusion or integration. E.g., 'Across these excerpts, the law completely domesticates authority, granting no formal standing to international organizations.'"),
    claims: z.array(z.object({
        sectionTitle: z.string().describe("Categorical boundary being analyzed (e.g., 'Authority', 'Coordination', 'Transnational Cooperation')."),
        claimText: z.string().describe("The hard analytical claim. e.g., 'Authority is fully domesticated (no shared or external governance seat).' Must be supported by excerpts."),
        supportedBy: z.array(z.string()).describe("Array of EXACT excerpt IDs from the input that prove this claim. YOU MUST ONLY USE IDs PROVIDED IN THE INPUT."),
        logicType: z.string().describe("The type of structural logic operating in these excerpts for this claim, e.g. role-allocation, categorical boundary, or silencing.")
    })).describe("The detailed structural points. Max 6 points.")
});

// Since the service recursively attaches antiStructuralAnalysis, we need recursive types or manual extension
export type BaseStructuralConcernResult = z.infer<typeof BaseStructuralConcernSchema>;

export type StructuralConcernResult = BaseStructuralConcernResult & {
    antiStructuralAnalysis?: BaseStructuralConcernResult;
};

// Replace old schema with base schema in runtime parser
export const StructuralConcernSchema = BaseStructuralConcernSchema;

export interface ExcerptInput {
    id: string;
    text: string;
    sourceRef?: any;
}

export class StructuralConcernService {

    /**
     * Executes the deep structural concern analysis on an actor using provided excerpts.
     */
    static async analyzeStructuralConcern(
        openai: OpenAI,
        userId: string,
        actorName: string,
        documentTitle: string,
        excerpts: ExcerptInput[],
        additionalContext?: string,
        promptId: 'structural_concern' | 'anti_structural_concern' = 'structural_concern'
    ): Promise<StructuralConcernResult> {

        if (!excerpts || excerpts.length === 0) {
            return {
                insufficientEvidence: true,
                thesis: "No excerpts provided for analysis.",
                claims: []
            };
        }

        const formattedExcerpts = excerpts.map(e => `[ID: ${e.id}]\nQuote: "${e.text}"\n---`).join('\n\n');

        let systemPrompt = await PromptRegistry.getEffectivePrompt(userId, promptId);
        systemPrompt = systemPrompt
            .replace(/{{ACTOR_NAME}}/g, actorName)
            .replace(/{{DOCUMENT_TITLE}}/g, documentTitle);

        if (additionalContext) {
            systemPrompt += `\n\nContext: ${additionalContext}`;
        }

        const userPrompt = `Actor to analyze: ${actorName}
Document: ${documentTitle}

EXCERPTS TO ANALYZE:
${formattedExcerpts}

Generate a tight, structural concern analysis. Return the structured JSON.`;

        try {
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-2024-08-06',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0].message.content || '{}';
            let result = StructuralConcernSchema.parse(JSON.parse(content));

            // STRICT GROUNDING VALIDATION: Reject hallucinated IDs
            result = this.enforceGrounding(result, excerpts);

            // [NEW] Automatic Pipeline: If standard mode finishes, run anti-structural mode immediately
            if (promptId === 'structural_concern' && !result.insufficientEvidence && excerpts.length > 0) {
                console.log(`[StructuralConcernService] Structural analysis successful, automatically triggering anti-structural concern...`);
                try {
                    const antiResult = await this.analyzeStructuralConcern(
                        openai,
                        userId,
                        actorName,
                        documentTitle,
                        excerpts,
                        additionalContext,
                        'anti_structural_concern'
                    );

                    // Return both formats. The API route currently unwraps `analysis.structural_concern`.
                    // We'll wrap it so both are sent down correctly to ConceptDetailsModal.
                    return {
                        ...result,
                        // Attach the secondary result as a nested property
                        antiStructuralAnalysis: antiResult
                    };
                } catch (antiError) {
                    console.warn(`[StructuralConcernService] Anti-structural concern failed, but returning main result. Error:`, antiError);
                }
            }

            return result;
        } catch (error) {
            console.error('[StructuralConcernService] Analysis failed:', error);
            throw error;
        }
    }

    /**
     * Validates that all output `supportedBy` IDs exist in the input set.
     * Strips hallucinated claims or flags insufficient evidence if everything is hallucinated.
     */
    static enforceGrounding(result: StructuralConcernResult, inputExcerpts: ExcerptInput[]): StructuralConcernResult {
        if (result.insufficientEvidence || !result.claims) {
            return result;
        }

        const validIds = new Set(inputExcerpts.map(e => e.id));
        const filteredClaims = [];

        for (const claim of result.claims) {
            // Filter the supportedBy array to only include valid IDs
            const validSupportedBy = claim.supportedBy.filter(id => validIds.has(id));

            // If checking strict grounding drops all evidence for a claim, the claim is hallucinated/invalid
            if (validSupportedBy.length > 0) {
                // Keep the claim but update it with the valid IDs
                filteredClaims.push({
                    ...claim,
                    supportedBy: validSupportedBy
                });
            } else {
                console.warn(`[StructuralConcernService] Dropped claim "${claim.sectionTitle}" due to hallucinated or missing excerpt IDs: ${claim.supportedBy.join(', ')}`);
            }
        }

        // If filtering removed all claims, retroactively flag as insufficient evidence
        if (filteredClaims.length === 0 && result.claims.length > 0) {
            return {
                insufficientEvidence: true,
                thesis: "Analysis generated claims that could not be grounded in the provided excerpt IDs. The text lacks the structure to support valid claims.",
                claims: []
            };
        }

        return {
            ...result,
            claims: filteredClaims
        };
    }
}
