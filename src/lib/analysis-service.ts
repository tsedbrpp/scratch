import { PromptRegistry } from '@/lib/prompts/registry';
import { strategies } from './analysis-strategies';
import crypto from 'crypto';
import OpenAI from 'openai';
import { StorageService } from '@/lib/storage-service';
import { verifyQuotes } from '@/lib/analysis-utils';
import { PositionalityData } from '@/types';
import { parseAnalysisResponse } from '@/lib/analysis-parser';
import { runStressTest } from '@/lib/analysis/stress-test-service';
import { runCritiqueLoop } from '@/lib/analysis/critique-service';

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

    // Return analysis result with usage stats
    return {
        analysis,
        usage: completion.usage
    };
}

export { runStressTest } from '@/lib/analysis/stress-test-service';
export { runCritiqueLoop } from '@/lib/analysis/critique-service';
