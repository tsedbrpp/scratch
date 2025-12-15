import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/ratelimit';
import { auth } from '@clerk/nextjs/server';
import { PromptRegistry } from '@/lib/prompts/registry';
import { verifyQuotes } from '@/lib/analysis-utils';
import { getAnalysisConfig, runStressTest, runCritiqueLoop } from '@/lib/analysis-service';
import { parseAnalysisResponse } from '@/lib/analysis-parser';
import { PositionalityData, AnalysisResult } from '@/types';

export const maxDuration = 300; // Allow up to 5 minutes for analysis
export const dynamic = 'force-dynamic';

// Increment this version to invalidate all cached analyses
const PROMPT_VERSION = 'v20';

// Helper to generate a deterministic cache key
function generateCacheKey(mode: string, text: string, sourceType: string): string {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  return `analysis:${mode}:${sourceType}:${PROMPT_VERSION}:${hash}`;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[ANALYSIS] Request started at ${new Date(startTime).toISOString()} `);

  let { userId } = await auth();

  // Check for demo user if not authenticated
  if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
    const demoUserId = request.headers.get('x-demo-user-id');
    console.log('[ANALYSIS] Demo auth check - Header:', demoUserId, 'Expected:', process.env.NEXT_PUBLIC_DEMO_USER_ID);
    if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
      userId = demoUserId;
    }
  }

  if (!userId) {
    console.log('[ANALYSIS] Unauthorized. Headers:', Object.fromEntries(request.headers));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const rateLimit = await checkRateLimit(userId); // Uses default 25 requests per minute
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: rateLimit.error || "Too Many Requests" },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString()
        }
      }
    );
  }

  try {
    const requestData = await request.json();
    const { text, sourceType, analysisMode, sourceA, sourceB, force, documents, documentId, title, positionality } = requestData;
    console.log(`[ANALYSIS] Received request.Text length: ${text?.length || 0}, Mode: ${analysisMode}, Force: ${force}, DocID: ${documentId}, Positionality: ${!!positionality} `);

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    if ((!text || text.length < 50) && analysisMode !== 'comparative_synthesis' && analysisMode !== 'resistance_synthesis' && analysisMode !== 'comparison' && analysisMode !== 'ontology_comparison' && analysisMode !== 'critique') {
      console.warn(`[ANALYSIS] Rejected request with insufficient text length: ${text?.length || 0} `);
      return NextResponse.json(
        { error: 'Insufficient text content. Please ensure the document has text (not just images) and try again.' },
        { status: 400 }
      );
    }

    if (analysisMode === 'comparison') {
      if (!sourceA?.text || sourceA.text.length < 50 || !sourceB?.text || sourceB.text.length < 50) {
        return NextResponse.json(
          { error: 'Insufficient text content in selected sources for comparison.' },
          { status: 400 }
        );
      }
    }

    if (analysisMode === 'ontology_comparison') {
      if (!sourceA?.data || !sourceB?.data) {
        return NextResponse.json(
          { error: 'Missing ontology data for comparison.' },
          { status: 400 }
        );
      }
    }

    // --- CACHING LOGIC START ---
    console.log('[ANALYSIS] Starting cache check...');
    let textForCache = text || '';

    // Append documentId to ensure uniqueness even if text is identical
    if (documentId) {
      textForCache += `| doc:${documentId} `;
    }

    // Append positionality to cache key to ensure different perspectives get different analyses
    if (positionality) {
      const posString = typeof positionality === 'object' ? JSON.stringify(positionality) : positionality;
      textForCache += `| pos:${posString} `;
    }

    if (analysisMode === 'comparison' && sourceA && sourceB) {
      textForCache = `${sourceA.title}:${sourceA.text}| ${sourceB.title}:${sourceB.text} `;
    } else if (analysisMode === 'ontology_comparison' && sourceA && sourceB) {
      // Use titles and summary/node count for cache key to avoid huge JSON strings
      textForCache = `ONTOLOGY_COMPARE:${sourceA.title} (${sourceA.data.nodes.length})| ${sourceB.title} (${sourceB.data.nodes.length})`;
    } else if (analysisMode === 'comparative_synthesis' && documents) {
      textForCache = documents.map((d: { id: string }) => d.id).sort().join(',');
    } else if (analysisMode === 'resistance_synthesis' && documents) {
      textForCache = documents.map((d: { title: string }) => d.title).sort().join(',');
    }

    const cacheKey = generateCacheKey(analysisMode || 'default', textForCache, sourceType || 'unknown');
    const userCacheKey = `user:${userId}:${cacheKey} `;
    console.log(`[ANALYSIS] Cache Key generated: ${userCacheKey} `);

    try {
      // Skip cache if force is true
      if (!force) {
        console.log('[ANALYSIS] Checking Redis cache...');
        const cachedResult = await redis.get(userCacheKey);
        if (cachedResult) {
          console.log(`[CACHE HIT] Returning cached analysis for key: ${userCacheKey} `);
          let cachedAnalysis = JSON.parse(cachedResult);

          // [FIX] Ensure cached ecosystem analysis is an array
          if (analysisMode === 'ecosystem' && !Array.isArray(cachedAnalysis)) {
            if (cachedAnalysis.impacts && Array.isArray(cachedAnalysis.impacts)) {
              cachedAnalysis = cachedAnalysis.impacts;
            } else if (cachedAnalysis.analysis && Array.isArray(cachedAnalysis.analysis)) {
              cachedAnalysis = cachedAnalysis.analysis;
            } else {
              cachedAnalysis = [cachedAnalysis];
            }
          }

          console.log(`[ANALYSIS] Completed(Cache Hit) in ${Date.now() - startTime} ms`);
          return NextResponse.json({
            success: true,
            analysis: cachedAnalysis,
            cached: true
          });
        }
        console.log('[ANALYSIS] Cache Miss.');
      } else {
        console.log(`[CACHE BYPASS] Force refresh requested for key: ${userCacheKey} `);
      }
    } catch (cacheError) {
      console.warn('Redis cache read failed:', cacheError);
    }
    // --- CACHING LOGIC END ---

    // Inject Positionality Calibration
    let calibrationContext = "";
    if (positionality && typeof positionality === 'object') {
      const { locus, discipline, reflexiveGap, enableCounterNarrative } = positionality as PositionalityData;

      calibrationContext = `
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
    } else if (positionality && typeof positionality === 'string') {
      calibrationContext = `
        *** ANALYST POSITIONALITY STATEMENT ***
          The analyst has provided the following positionality statement: "${positionality}"
      INSTRUCTION: Use this statement to contextualize your analysis.Flag any concepts in the text that might conflict with or be invisible to this specific worldview.
`;
    }

    console.log('[ANALYSIS] Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    // [Feature] Decoupled Critique Mode
    if (analysisMode === 'critique') {
      if (!requestData.existingAnalysis) {
        return NextResponse.json({ error: "Missing existingAnalysis for critique mode" }, { status: 400 });
      }
      console.log('[ANALYSIS] Mode is CRITIQUE. bypassing main generation.');
      // Run only the critique loop
      const critique = await runCritiqueLoop(openai, userId, text, requestData.existingAnalysis);
      return NextResponse.json({
        success: true,
        analysis: { system_critique: critique } // Wrap in analysis object for consistency
      });
    }

    // --- USE ANALYSIS SERVICE TO GET CONFIG ---
    let { systemPrompt, userContent } = await getAnalysisConfig(userId, analysisMode, requestData);

    // Append calibration context to system prompt for supported modes
    if (['dsf', 'cultural_framing', 'institutional_logics', 'legitimacy'].includes(analysisMode || 'dsf')) {
      systemPrompt += calibrationContext;
    }

    console.log(`[ANALYSIS] Calling OpenAI for mode: ${analysisMode} `);
    const aiStartTime = Date.now();

    // Call OpenAI API
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        max_completion_tokens: 16384,
        response_format: { type: "json_object" }
      });
      console.log(`[ANALYSIS] OpenAI response received in ${Date.now() - aiStartTime} ms`);
    } catch (openaiError) {
      console.error('[ANALYSIS CRITICAL ERROR] OpenAI API call failed:', openaiError);
      throw openaiError;
    }

    const responseText = completion.choices[0]?.message?.content || '';
    const finishReason = completion.choices[0]?.finish_reason;
    console.log(`[ANALYSIS] Raw OpenAI response(first 500 chars): ${responseText.substring(0, 500)} `);
    console.log(`[ANALYSIS] Finish Reason: ${finishReason}`);

    // --- USE ANALYSIS PARSER ---
    let analysis: AnalysisResult | any = parseAnalysisResponse(responseText, analysisMode);

    // --- STRESS TEST LOGIC ---
    if (analysisMode === 'stress_test') {
      analysis = await runStressTest(openai, userId, text, analysis, requestData.existingAnalysis);
    }

    let verificationText = text || '';
    if (analysisMode === 'comparison' && sourceA?.text && sourceB?.text) {
      verificationText = sourceA.text + ' ' + sourceB.text;
    }

    if (verificationText && analysis && typeof analysis === 'object') {
      try {
        console.log('[VERIFICATION] Running Fact-Tracer...');
        const verifiedQuotes = verifyQuotes(verificationText, analysis);
        // Inject into analysis object
        if (analysis) {
          analysis.verified_quotes = verifiedQuotes;
        }
        console.log(`[VERIFICATION] Verified ${verifiedQuotes.length} quotes.`);
      } catch (verError) {
        console.warn('[VERIFICATION] Failed:', verError);
      }
    }



    // ---------------------
    // Cache the result
    try {
      if (analysis && typeof analysis === 'object' && !analysis.error) {
        await redis.set(userCacheKey, JSON.stringify(analysis), 'EX', 86400); // 24 hours
        console.log(`[ANALYSIS] Saved to cache: ${userCacheKey}`);
      } else {
        console.warn(`[ANALYSIS] Skipping cache for failed/partial analysis. Key: ${userCacheKey}`);
      }
    } catch (saveError) {
      console.warn('[ANALYSIS] Failed to save to cache:', saveError);
    }

    console.log(`[ANALYSIS] Request completed successfully in ${Date.now() - startTime} ms`);

    return NextResponse.json({
      success: true,
      analysis,
      usage: completion.usage
    });

  } catch (error: unknown) {
    console.error(`[ANALYSIS ERROR] Failed after ${Date.now() - startTime} ms: `, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
