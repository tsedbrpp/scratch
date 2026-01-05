import { PromptRegistry } from '@/lib/prompts/registry';
import { strategies } from './analysis-strategies';
import crypto from 'crypto';
import OpenAI from 'openai';
import { StorageService } from '@/lib/storage-service';
import { verifyQuotes } from '@/lib/analysis-utils';
import { PositionalityData } from '@/types';
import { parseAnalysisResponse } from '@/lib/analysis-parser';

export interface AnalysisConfig {
    systemPrompt: string;
    userContent: string;
}

export async function getAnalysisConfig(
    userId: string,
    analysisMode: string,
    data: {
        text?: string;
        title?: string;
        sourceType?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceA?: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceB?: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceC?: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documents?: any[];
        lens?: string;
    }
): Promise<AnalysisConfig> {
    const safeUserId = userId || 'default';

    // Select strategy or fallback to default
    const strategy = strategies[analysisMode] || strategies.default;

    return strategy(safeUserId, data);
}

// =================================================================================================
// EXTRACTED ANALYSIS LOGIC
// =================================================================================================

export function generateCacheKey(mode: string, text: string, sourceType: string, version: string = 'v20'): string {
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    return `analysis:${mode}:${sourceType}:${version}:${hash}`;
}

export function generateCalibrationContext(positionality: string | PositionalityData | undefined): string {
    if (!positionality) return "";

    if (typeof positionality === 'object') {
        const { locus, discipline, reflexiveGap, enableCounterNarrative } = positionality as PositionalityData;

        return `
### *** DYNAMIC POSITIONALITY OVERLAY ***
** USER CONTEXT:** The human analyst identifies as ** ${locus}** with a ** ${discipline}** lens.
** RISK FACTOR:** They have flagged a potential blind spot regarding ** ${reflexiveGap}**.

### YOUR PRIME DIRECTIVES(CALIBRATED):
1. ** COUNTER - BIAS PROTOCOL:**
  ${locus.includes('Global North') ? `Because the analyst is from the Global North, you must NOT accept standard Western legal definitions of "privacy" or "ownership" as default.
    * *Action:* If the text mentions "Data Ownership," immediately query: "Does this imply individual property (Western) or sovereign stewardship (Indigenous)?"` : ''}
    ${discipline.includes('Legal') ? `Because the analyst uses a Legal lens, you must explicitly highlight technical or sociological implications they might miss.` : ''}

2. ** BLIND SPOT WATCHDOG:**
  The analyst fears missing ** ${reflexiveGap}**.
    * * Action:* Scan the document specifically for concepts related to this gap.If these terms are absent, flag a "Critical Silence".

3. ** ADVERSARIAL SUMMARY:**
  ${enableCounterNarrative ? `After your standard summary, you must generate a "Counter-Narrative" written from the perspective of the most marginalized actors identified (or silenced) in the text, critiquing the policy's reliance on dominant standards.` : ''}
`;
    } else if (typeof positionality === 'string') {
        return `
        *** ANALYST POSITIONALITY STATEMENT ***
          The analyst has provided the following positionality statement: "${positionality}"
      INSTRUCTION: Use this statement to contextualize your analysis.Flag any concepts in the text that might conflict with or be invisible to this specific worldview.
`;
    }
    return "";
}

/**
 * Orchestrates the full analysis workflow: Config -> AI Call -> Parsing -> Stress Test -> Verification
 */
export async function performAnalysis(
    openai: OpenAI,
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestData: any
) {
    const { text, sourceType, analysisMode, positionality, lens } = requestData;

    // Config
    const config = await getAnalysisConfig(userId, analysisMode, requestData);
    let { systemPrompt } = config;
    const { userContent } = config;

    // Calibration
    if (['dsf', 'cultural_framing', 'institutional_logics', 'legitimacy'].includes(analysisMode || 'dsf')) {
        systemPrompt += generateCalibrationContext(positionality);
    }

    console.log(`[ANALYSIS] Calling OpenAI for mode: ${analysisMode} `);
    const aiStartTime = Date.now();

    // AI Call
    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ],
        max_completion_tokens: 16384,
        response_format: { type: "json_object" }
    });
    console.log(`[ANALYSIS] OpenAI response received in ${Date.now() - aiStartTime} ms`);

    const responseText = completion.choices[0]?.message?.content || '';

    // Parsing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let analysis: any = parseAnalysisResponse(responseText, analysisMode);

    // Stress Test
    if (analysisMode === 'stress_test') {
        analysis = await runStressTest(openai, userId, text, analysis, requestData.existingAnalysis);
    }

    // Verification
    let verificationText = text || '';
    if (analysisMode === 'comparison' && requestData.sourceA?.text && requestData.sourceB?.text) {
        verificationText = requestData.sourceA.text + ' ' + requestData.sourceB.text;
    }

    if (verificationText && analysis && typeof analysis === 'object') {
        try {
            console.log('[VERIFICATION] Running Fact-Tracer...');
            const verifiedQuotes = verifyQuotes(verificationText, analysis);
            analysis.verified_quotes = verifiedQuotes;
            console.log(`[VERIFICATION] Verified ${verifiedQuotes.length} quotes.`);
        } catch (verError) {
            console.warn('[VERIFICATION] Failed:', verError);
        }
    }

    return { analysis, usage: completion.usage };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runStressTest(openai: OpenAI, userId: string, text: string, currentAnalysis: any, existingAnalysis: any = null) {
    console.log('[ANALYSIS] Running Stress Test sub-analyses...');
    const stressRes = currentAnalysis || {};
    const invertedText = stressRes.inverted_text_excerpt || stressRes.inverted_text;

    // 1. Analyze Inverted Text
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let invAnalysis: any = {};
    if (invertedText) {
        const dsfPrompt = await PromptRegistry.getEffectivePrompt(userId, 'dsf_lens');
        const invCompletion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: 'system', content: dsfPrompt },
                { role: 'user', content: `TEXT CONTENT: \n${invertedText} \n\nAnalyze this text using the Decolonial Situatedness Framework.` }
            ],
            response_format: { type: "json_object" }
        });
        invAnalysis = JSON.parse(invCompletion.choices[0]?.message?.content || '{}');
    } else {
        console.warn('[ANALYSIS WARNING] Stress test failed to generate inverted text.');
    }

    // 2. Analyze Original Text (Standard DSF)
    let origAnalysis = existingAnalysis;
    if (origAnalysis && origAnalysis.governance_scores) {
        console.log('[ANALYSIS] Utilizing EXISTING analysis from client. Skipping re-run.');
    } else {
        console.log('[ANALYSIS] No existing analysis provided. Re-running standard DSF...');
        const dsfPrompt = await PromptRegistry.getEffectivePrompt(userId, 'dsf_lens');
        const origCompletion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: 'system', content: dsfPrompt },
                { role: 'user', content: `TEXT CONTENT: \n${text} \n\nAnalyze this text using the Decolonial Situatedness Framework.` }
            ],
            response_format: { type: "json_object" }
        });

        const rawContent = origCompletion.choices[0]?.message?.content || '{}';
        origAnalysis = parseAnalysisResponse(rawContent, 'dsf');

        if (!origAnalysis.governance_scores) {
            console.warn('[ANALYSIS WARNING] Standard DSF re-run failed to produce governance scores. Parsing likely failed.');
            origAnalysis.governance_scores = {
                centralization: 50, rights_focus: 50, flexibility: 50, market_power: 50, procedurality: 50
            };
        }
    }

    // 3. Compute Deviation
    const scoreA = origAnalysis.governance_scores?.market_power || 50;
    const scoreB = invAnalysis.governance_scores?.market_power || 50;
    const diff = Math.abs(scoreA - scoreB);

    // 4. Construct Final Object
    return {
        ...origAnalysis,
        stress_test_report: {
            original_score: scoreA,
            perturbed_score: scoreB,
            framing_sensitivity: diff > 30 ? "High" : (diff > 15 ? "Medium" : "Low"),
            shift_explanation: stressRes.shift_explanation || "No explanation provided.",
            inverted_text_excerpt: invertedText ? (invertedText.substring(0, 300) + "...") : "Generation failed",
            rhetorical_shifts: stressRes.rhetorical_shifts || []
        }
    };
}

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
            summary: (analysis.start_market_society || analysis.summary || "").substring(0, 500)
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
