/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PromptRegistry } from '@/lib/prompts/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runCritiqueLoop(openai: OpenAI, userId: string, verificationText: string, analysis: any) {
    try {
        console.log('[CRITIQUE] Starting Devil\'s Advocate loop...');
        let critiquePrompt = await PromptRegistry.getEffectivePrompt(userId, 'critique_panel');

        // [Fix] Hardcoded fallback if registry fails
        if (!critiquePrompt || critiquePrompt.length < 10) {
            console.warn('[CRITIQUE] System prompt missing from registry! Using hardcoded fallback.');
            critiquePrompt = "You are a 'Devil's Advocate' AI. Your goal is to critique the provided analysis. Identify blind spots, over-interpretations, and missing perspectives. Output your critique in plain text.";
        }

        // [Optimization] Aggressively simplify the analysis to avoid token limits
        // Only send the high-level insights and scores needed for a critique
        const critiquePayload = {
            key_insight: analysis.key_insight,
            governance_scores: analysis.governance_scores,
            dominant_logic: analysis.dominant_logic,
            overall_assessment: analysis.overall_assessment,
            // Include summary if short, otherwise truncate
            summary: (analysis.narrative || analysis.start_market_society || analysis.summary || "").substring(0, 500)
        };

        const critiqueUserContent = "ORIGINAL SOURCE TEXT(Excerpts): \n" + (verificationText || '').substring(0, 800) + "...\n\nGENERATED ANALYSIS(Summary): \n" + JSON.stringify(critiquePayload, null, 2) + " \n\nCritique this analysis.";

        console.log(`[CRITIQUE] Sending Request. Prompt Length: ${critiquePrompt.length}, Content Length: ${critiqueUserContent.length}`);

        const critiqueCompletion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: 'system', content: critiquePrompt },
                { role: 'user', content: critiqueUserContent }
            ],
            max_completion_tokens: 4096
        });

        const choice = critiqueCompletion.choices[0];
        const critiqueText = choice?.message?.content || '';

        console.log(`[CRITIQUE] Valid Response? ${!!critiqueText}. Finish Reason: ${choice?.finish_reason}`);
        console.log(`[CRITIQUE] Raw Response: ${critiqueText.substring(0, 200)}`);

        if (!critiqueText) {
            return {
                critique: `Generation failed. OpenAI returned empty content. Reason: ${choice?.finish_reason || 'Unknown'}`,
                blind_spots: ["System Error"],
                implications: ["Check if the model filtered the response."]
            };
        }

        let critiqueJson;
        try {
            // robust clean
            const cleanedCritique = critiqueText
                .replace(/```json\s*/gi, '')
                .replace(/```/g, '')
                .replace(/^JSON:/i, '')
                .trim();

            if (cleanedCritique.startsWith('{')) {
                critiqueJson = JSON.parse(cleanedCritique);
            } else {
                // It's just text
                throw new Error("Not JSON");
            }

            // [Robustness] Validate schema. If empty or missing keys, force fallback.
            if (!critiqueJson.critique && !critiqueJson.blind_spots && !critiqueJson.over_interpretation) {
                console.warn('[CRITIQUE] Valid JSON but missing schema. Outputting raw text.');
                critiqueJson = {
                    critique: critiqueText,
                    blind_spots: critiqueJson.blind_spots || [],
                    over_interpretation: critiqueJson.over_interpretation,
                    ...critiqueJson
                };

                // If it's still barely populated, force a message
                if (!critiqueJson.critique || critiqueJson.critique === '{}') {
                    const foundKeys = Object.keys(critiqueJson).filter(k => k !== 'critique' && k !== 'blind_spots' && k !== 'over_interpretation');
                    critiqueJson.critique = `Critique generated but unstructured. Keys found: [${foundKeys.join(', ')}]. \nRaw: ${critiqueText.substring(0, 100)}`;
                }
            }

        } catch (e) {
            // Fallback for plain text response
            console.debug('JSON parse failed for critique, falling back to text', e);
            // Fallback for plain text response
            critiqueJson = {
                critique: critiqueText,
                blind_spots: ["(Unstructured Response)"],
                implications: ["Please review the raw critique text."]
            };
        }

        console.log('[CRITIQUE] Completed.');
        return critiqueJson;

    } catch (critiqueError) {
        console.warn('[CRITIQUE] Failed:', critiqueError);
        return {
            critique: "Automatic critique failed.",
            blind_spots: ["System Error"],
            implications: [critiqueError instanceof Error ? critiqueError.message : String(critiqueError)]
        };
    }
}
