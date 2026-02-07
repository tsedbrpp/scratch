import { PromptRegistry } from '@/lib/prompts/registry';
import { logAICall, AICallLog } from '@/lib/ai-call-logger';
import crypto from 'crypto';
import { strategies } from './analysis-strategies';
import OpenAI from 'openai';
import { StorageService } from '@/lib/storage-service';
import { verifyQuotes, checkFuzzyMatch } from '@/lib/analysis-utils';
import { PositionalityData, Source } from '@/types';
import { parseAnalysisResponse } from '@/lib/analysis-parser';
import { runStressTest } from '@/lib/analysis/stress-test-service';
import { runCritiqueLoop } from '@/lib/analysis/critique-service';
import { logger } from './logger';

export interface AnalysisConfig {
    systemPrompt: string;
    userContent: string;
    promptId?: string;
}

export async function getAnalysisConfig(
    userId: string,
    analysisMode: string,
    data: {
        text?: string;
        title?: string;
        sourceType?: string;
        sourceA?: Source;
        sourceB?: Source;
        sourceC?: Source;
        documents?: Source[];
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
    requestData: {
        text: string;
        sourceType?: string;
        analysisMode?: string;
        positionality?: string | PositionalityData;
        lens?: string;
        existingAnalysis?: unknown;
        [key: string]: unknown;
    }
) {
    const { text, sourceType, analysisMode = 'dsf', positionality, lens } = requestData;

    // Config
    const config = await getAnalysisConfig(userId, analysisMode, requestData);
    let { systemPrompt } = config;
    const { userContent } = config;

    // Calibration
    if (['dsf', 'cultural_framing', 'institutional_logics', 'legitimacy'].includes(analysisMode || 'dsf')) {
        systemPrompt += generateCalibrationContext(positionality);
    }

    logger.analysis(`Calling OpenAI for mode: ${analysisMode} `);
    const aiStartTime = Date.now();

    // AI Call
    const modelUsed = process.env.OPENAI_MODEL || "gpt-4o";
    logger.analysis(`Invoking OpenAI. Model: ${modelUsed}`);

    const completion = await openai.chat.completions.create({
        model: modelUsed,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ],
        max_completion_tokens: 16384,
        response_format: { type: "json_object" }
    });

    const choice = completion.choices[0];
    const responseText = choice?.message?.content || '';

    logger.analysis(`OpenAI Response: received in ${Date.now() - aiStartTime} ms`);
    logger.analysis(`Diagnostics: Finish Reason: ${choice?.finish_reason}, Prompt Tokens: ${completion.usage?.prompt_tokens}, Completion Tokens: ${completion.usage?.completion_tokens}`);

    if (!responseText) {
        logger.analysis(`[CRITICAL] Empty response received from OpenAI!`);
    }

    // Parsing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let analysis: any = parseAnalysisResponse(responseText, analysisMode);

    // Stress Test
    if (analysisMode === 'stress_test') {
        analysis = await runStressTest(openai, userId, text, analysis, requestData.existingAnalysis);
    }

    // [VERIFICATION] Run Fuzzy Match on extracted quotes to validate they exist in source text
    // This populates the 'verified' boolean which the UI requires to distinguish evidence from hallucinations.
    if (analysis && analysis.verified_quotes && Array.isArray(analysis.verified_quotes)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        analysis.verified_quotes = analysis.verified_quotes.map((q: any) => ({
            ...q,
            verified: checkFuzzyMatch(q.text || "", text).verified
        }));
    } else if (analysis) {
        // Fallback: Use the general verifyQuotes utility if the LLM didn't produce the array directly
        // This scrapes quotes from other fields (like structural_pillars)
        const scrapedQuotes = verifyQuotes(text, analysis);
        if (scrapedQuotes.length > 0) {
            analysis.verified_quotes = scrapedQuotes;
        }
    }

    // [TRANSPARENCY] Create and populate provenance chain
    const { capturePromptMetadata, createProvenanceChain, addProvenanceStep } = await import('@/lib/transparency-utils');

    // 1. Initialize Chain
    let chain = createProvenanceChain();

    // Resolve prompt details for logging
    const effectivePromptId = config.promptId || 'unknown_prompt';
    const promptDef = PromptRegistry.getDefinition(effectivePromptId);
    const promptVersion = promptDef ? promptDef.version : 'unknown';

    const metadata = capturePromptMetadata(
        systemPrompt + "\n\n" + userContent,
        modelUsed,
        0.2, // Default temperature
        undefined,
        effectivePromptId,
        promptVersion
    );

    // 2. Add Prompt Construction Step
    chain = addProvenanceStep(
        chain,
        "Prompt Construction",
        { analysisMode, positionality },
        { systemPrompt, userContent },
        "system"
    );

    // 3. Add AI Analysis Step
    chain = addProvenanceStep(
        chain,
        "AI Analysis Execution",
        { model: modelUsed, prompt_tokens: completion.usage?.prompt_tokens },
        { raw_response: responseText.substring(0, 1000) + "..." }, // Truncate for storage
        "openai"
    );

    // [AUDIT] Log the AI Call
    const aiLog: AICallLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId,
        analysisMode,
        promptId: effectivePromptId,
        promptVersion: promptVersion,
        model: modelUsed,
        temperature: 0.2,
        maxTokens: 16384,
        systemPromptHash: crypto.createHash('sha256').update(systemPrompt).digest('hex'),
        systemPromptPreview: systemPrompt.substring(0, 500),
        userContentPreview: userContent.substring(0, 500),
        rawResponsePreview: responseText.substring(0, 1000),
        tokenUsage: completion.usage ? {
            prompt: completion.usage.prompt_tokens,
            completion: completion.usage.completion_tokens,
            total: completion.usage.total_tokens
        } : undefined,
        latencyMs: Date.now() - aiStartTime, // Measure actual latency
        finishReason: completion.choices[0].finish_reason,
        parseSuccess: true
    };

    // Fire and forget logging
    logAICall(aiLog).catch(err => console.error("Failed to log AI call", err));

    // [TRANSPARENCY] Add metadata and chain to analysis result
    if (analysis && typeof analysis === 'object') {
        analysis.metadata = metadata;
        analysis.provenance_chain = chain;
    }

    // Return analysis result with usage stats and transparency data
    return {
        analysis,
        usage: completion.usage
    };
}

export async function runComprehensiveAnalysis(openai: OpenAI, userId: string, requestData: { text: string;[key: string]: unknown }) {
    logger.analysis(`[COMPREHENSIVE] Starting Comprehensive Scan for User ${userId}`);

    // 1. Run Standard Scan (Assemblage V3)
    logger.analysis(`[COMPREHENSIVE] Step 1: Standard Trace`);
    const standardResult = await performAnalysis(openai, userId, { ...requestData, analysisMode: 'assemblage_extraction_v3' });
    const baseAnalysis = standardResult.analysis;

    if (!baseAnalysis) {
        throw new Error("Standard Trace failed, cannot proceed with Comprehensive Scan.");
    }

    // 2. Run Realist Scan and Critique in Parallel
    // These steps are independent of each other but depend on Step 1
    logger.analysis(`[COMPREHENSIVE] Starting Parallel Tracks: Realist Scan + Critical Voids`);

    const runRealist = async () => {
        if (!baseAnalysis.actors && (!baseAnalysis.assemblage || !baseAnalysis.assemblage.actors)) return {};
        logger.analysis(`[COMPREHENSIVE] Track A: Realist Scan`);

        const actors = baseAnalysis.actors || baseAnalysis.assemblage?.actors || [];
        const mechanisms = baseAnalysis.stabilization_mechanisms || baseAnalysis.assemblage?.stabilization_mechanisms || [];

        const realistPayload = {
            ...requestData,
            analysisMode: 'assemblage_realist',
            traced_actors: actors,
            detected_mechanisms: mechanisms,
            identified_capacities: baseAnalysis.capacities || []
        };

        try {
            const result = await performAnalysis(openai, userId, realistPayload);
            return result.analysis;
        } catch (err) {
            logger.analysis(`[COMPREHENSIVE] Realist Scan failed (non-fatal): ${(err as Error).message}`);
            return {};
        }
    };

    const runCritique = async () => {
        logger.analysis(`[COMPREHENSIVE] Track B: Critical Voids`);
        try {
            const critiqueResult = await runCritiqueLoop(openai, userId, requestData.text, baseAnalysis);
            return { system_critique: critiqueResult };
        } catch (err) {
            logger.analysis(`[COMPREHENSIVE] Critique failed (non-fatal): ${(err as Error).message}`);
            return {};
        }
    };

    // [OPTIMIZATION] Wait for both
    const [realistAnalysis, critiqueAnalysis] = await Promise.all([runRealist(), runCritique()]);
    logger.analysis(`[COMPREHENSIVE] Parallel Tracks Complete`);

    // 4. Merge Results
    logger.analysis(`[COMPREHENSIVE] Merging results...`);

    // Combine narratives if both exist
    let combinedNarrative = baseAnalysis.narrative || "";
    if (realistAnalysis.narrative) {
        combinedNarrative += "\n\n### Realist Interpretation\n" + realistAnalysis.narrative;
    }

    return {
        analysis: {
            ...baseAnalysis,
            // Merge specialized fields
            realist_narrative: realistAnalysis.narrative,
            trajectory_analysis: realistAnalysis.trajectory_analysis, // [FIX] Merge Trajectory data
            system_critique: critiqueAnalysis.system_critique,

            // Ensure fields required for tabs are populated
            // Mechanism Tab is already populated by baseAnalysis.stabilization_mechanisms (Standard Trace does extraction)
            // But Realist scan might add depth? 'assemblage_realist' output schema is just narrative? 
            // In registry.ts: outputSchema: requiredKeys: ['narrative']. 
            // So Realist Scan is mostly an INTERPRETATION text.

            narrative: combinedNarrative
        },
        usage: standardResult.usage // Primary usage stats (approximate)
    };
}

export { runStressTest } from '@/lib/analysis/stress-test-service';
export { runCritiqueLoop } from '@/lib/analysis/critique-service';
