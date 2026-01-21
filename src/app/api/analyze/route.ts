import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StorageService } from '@/lib/storage-service';
import { checkRateLimit } from '@/lib/ratelimit';
import { getAuthenticatedUserId, isReadOnlyAccess } from '@/lib/auth-helper';
import {
  getAnalysisConfig,
  runCritiqueLoop,
  performAnalysis,
  generateCacheKey
} from '@/lib/analysis-service';
import { AnalysisResult } from '@/types';

export const maxDuration = 300; // Allow up to 5 minutes for analysis
export const dynamic = 'force-dynamic';

// Increment this version to invalidate all cached analyses
const PROMPT_VERSION = 'v37-scope-fix'; // Incremented to fix missing territorial scope graph

/**
 * Determines the user ID to use for cache operations.
 * Comparison analyses use a shared namespace (demo user ID) to allow all users to access the same cached results.
 * Other analysis types use the actual user ID for user-specific caching.
 */
function getCacheUserId(analysisMode: string, actualUserId: string): string {
  return analysisMode === 'comparison'
    ? (process.env.NEXT_PUBLIC_DEMO_USER_ID || actualUserId)
    : actualUserId;
}


export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[ANALYSIS] Request started at ${new Date(startTime).toISOString()} `);

  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    console.log('[ANALYSIS] Unauthorized. Headers:', Object.fromEntries(request.headers));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestData = await request.json();
    const { text, sourceType, analysisMode, sourceA, sourceB, sourceC, force, documents, documentId, title, positionality, lens, mode, checkCacheOnly } = requestData;
    console.log(`[ANALYSIS] Received request. Text length: ${text?.length || 0}, Mode: ${analysisMode}, TheoryMode: ${mode}, Force: ${force}, DocID: ${documentId}, Positionality: ${!!positionality}, CheckCacheOnly: ${!!checkCacheOnly}`);

    // [NEW] BLOCK READ-ONLY DEMO USERS (unless they're only checking cache)
    if (!checkCacheOnly && await isReadOnlyAccess()) {
      return NextResponse.json({ error: "Demo Mode is Read-Only. Sign in to generate analysis." }, { status: 403 });
    }

    // [NEW] Rate Limiting (skip for cache-only requests)
    if (!checkCacheOnly) {
      const rateLimit = await checkRateLimit(userId);
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
    }

    // [NEW] CREDIT CHECK (skip for cache-only requests)
    if (!checkCacheOnly) {
      try {
        const { deductCredits } = await import('@/lib/redis-scripts');
        const newBalance = await deductCredits(userId, 1, 'SYSTEM', `run-${Date.now()}-${Math.random().toString(36).substring(7)}`);

        if (newBalance === -1) {
          console.log(`[ANALYSIS] Insufficient credits for user ${userId}`);
          return NextResponse.json(
            { error: "Insufficient Credits. Please top up to continue." },
            { status: 402 }
          );
        }
        console.log(`[ANALYSIS] Credit deducted. New balance: ${newBalance}`);
      } catch (creditError) {
        console.error('Credit deduction failed:', creditError);
        return NextResponse.json(
          { error: "Payment Service Unavailable" },
          { status: 503 }
        );
      }
    }


    // Check for API key and Initialize OpenAI
    // Check for API key and Initialize OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    let openai;

    if (apiKey) {
      openai = new OpenAI({
        apiKey: apiKey,
        baseURL: process.env.OPENAI_BASE_URL,
      });
    } else {
      console.warn("[ANALYSIS] Missing OPENAI_API_KEY. Running in Limited/Demo mode without LLM.");
    }

    // NEW: Mode-based routing for theoretical separation
    // If explicit theory mode is specified, route to appropriate logic
    if (mode === 'ant_trace' || mode === 'assemblage_realist' || mode === 'hybrid_reflexive') {
      console.log(`[ANALYSIS] Routing to ${mode} endpoint logic for theoretical separation`);

      // Generate cache key for theoretical analysis
      const cacheKey = generateCacheKey(mode, text || '', sourceType || 'unknown', PROMPT_VERSION + '_theo');

      try {
        if (!force) {
          const cached = await StorageService.getCache(userId, cacheKey);
          if (cached) {
            console.log(`[CACHE HIT] Returning cached ${mode} analysis`);
            return NextResponse.json({ success: true, analysis: cached, cached: true });
          }
        }
      } catch (e) { console.warn("Cache read failed", e); }

      // Import services dynamically
      const { ANTTraceService } = await import('@/lib/ant-trace-service');
      const { AssemblageMechanismService } = await import('@/lib/assemblage-mechanism-service');
      const { ProvisionalWrapper } = await import('@/lib/provisional-wrapper');

      let analysisResult = {};

      if (mode === 'ant_trace') {
        const tracedActors = ANTTraceService.hydrateWithProvenance(requestData.actors || [], "ai_inference");
        const associations = ANTTraceService.traceAssociations(tracedActors, requestData.links || []);
        const result = ANTTraceService.generateTraceResult(tracedActors, associations);

        if (openai) {
          // Generate Narrative via LLM
          const { analysis } = await performAnalysis(openai, userId, {
            analysisMode: 'ant_trace',
            actors: tracedActors,
            links: associations
          });

          // Adapt to UI expectation
          analysisResult = {
            ...result,
            narrative: analysis.narrative,
            isTrace: true
          };
        } else {
          // Fallback: Static Narrative (Demo Mode / No API Key)
          analysisResult = {
            ...result,
            narrative: `Methodological ANT Trace completed. Traced ${tracedActors.length} actors and ${associations.length} associations using strict empirical trailing. No ontological mechanisms assumed. (Static Demo Response)`,
            isTrace: true
          };
        }
      } else if (mode === 'assemblage_realist') {
        // Requires trace input - if not present, perform quick trace first
        let tracedActors = requestData.traced_actors;
        let associations = requestData.associations;

        if (!tracedActors || !associations) {
          console.log("[ANALYSIS] Assemblage mode missing trace, performing ad-hoc trace first");
          tracedActors = ANTTraceService.hydrateWithProvenance(requestData.actors || [], "ai_inference");
          associations = ANTTraceService.traceAssociations(tracedActors, requestData.links || []);
        }

        const mechanisms = AssemblageMechanismService.detectTerritorialization(tracedActors, associations, requestData.configurations || []);
        const capacities = AssemblageMechanismService.identifyCapacities(tracedActors, associations);

        let narrativeContent = "";
        const narrativeStatus = null;

        if (openai) {
          // Generate Narrative via LLM
          const { analysis } = await performAnalysis(openai, userId, {
            analysisMode: 'assemblage_realist',
            traced_actors: tracedActors,
            detected_mechanisms: mechanisms,
            identified_capacities: capacities
          });
          narrativeContent = analysis.narrative;
        } else {
          // Fallback
          narrativeContent = `Detected ${mechanisms.length} mechanisms (Territorialization/Deterritorialization) and ${capacities.length} capacities in the assemblage. (Static Demo Response)`;
        }

        const narrativeCtx = ProvisionalWrapper.wrap(
          narrativeContent || "Analysis failed to generate narrative.",
          "ai_generated", 0.7
        );

        analysisResult = {
          narrative: narrativeCtx.content, // Map for UI narrative display
          provisional_status: narrativeCtx, // Full object for badge
          detected_mechanisms: mechanisms,
          identified_capacities: capacities
        };
      } else if (mode === 'hybrid_reflexive') {
        // 1. Trace
        const tracedActors = ANTTraceService.hydrateWithProvenance(requestData.actors || [], "ai_inference");
        const associations = ANTTraceService.traceAssociations(tracedActors, requestData.links || []);

        // 2. Assemblage
        const mechanisms = AssemblageMechanismService.detectTerritorialization(tracedActors, associations, requestData.configurations || []);

        // 3. Tensions
        const tensions = [
          { description: "Instrumentalizing ANT trace for DeLandian ontological claims", latour_would_reject: "Yes" }
        ];

        let narrativeContent = "";

        if (openai) {
          // Generate Narrative via LLM
          const { analysis } = await performAnalysis(openai, userId, {
            analysisMode: 'hybrid_reflexive',
            ant_trace: { actor_count: tracedActors.length },
            assemblage_analysis: { mechanism_count: mechanisms.length, mechanisms },
            tensions: tensions
          });
          narrativeContent = analysis.narrative;
        } else {
          narrativeContent = `Hybrid analysis: Used ANT to trace ${tracedActors.length} actors, then interpreted ${mechanisms.length} mechanisms. Theoretical tension: Instrumentalizing ANT for Ontology. (Static Demo Response)`;
        }

        const narrativeCtx = ProvisionalWrapper.wrap(
          narrativeContent || "Hybrid analysis generated.",
          "ai_generated", 0.6
        );

        analysisResult = {
          narrative: narrativeCtx.content,
          provisional_status: narrativeCtx,
          tensions: tensions,
          ant_trace: { actor_count: tracedActors.length },
          assemblage_analysis: { mechanism_count: mechanisms.length }
        };
      }

      // Cache and Return
      await StorageService.setCache(userId, cacheKey, analysisResult, 86400);

      return NextResponse.json({
        success: true,
        analysis: analysisResult
      });
    }

    // --- STANDARD ANALYSIS FLOW ---

    if ((!text || text.length < 50) && analysisMode !== 'comparative_synthesis' && analysisMode !== 'resistance_synthesis' && analysisMode !== 'comparison' && analysisMode !== 'ontology_comparison' && analysisMode !== 'critique' && analysisMode !== 'assemblage_explanation') {
      console.warn(`[ANALYSIS] Rejected request with insufficient text length: ${text?.length || 0}`);
      return NextResponse.json(
        { error: 'Insufficient text content. Please ensure the document has text (not just images) and try again.' },
        { status: 400 }
      );
    }

    if (analysisMode === 'comparison') {
      const textA = sourceA?.text || '';
      const textB = sourceB?.text || '';

      console.log(`[ANALYSIS] Comparison Text Checks - A: ${textA.length}, B: ${textB.length}`);

      if (textA.length < 50 || textB.length < 50) {
        return NextResponse.json(
          { error: 'Insufficient text content in selected sources. Please ensure both documents have extracted text.' },
          { status: 400 }
        );
      }
      // Pass traces to the analysis service via the requestData object
      // (They are already in requestData, so no extra work needed here other than validation if strict)
    }

    if (analysisMode === 'ontology_comparison') {
      if (!sourceA?.data || !sourceB?.data) {
        return NextResponse.json(
          { error: 'Missing ontology data for comparison (at least 2 required).' },
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

    // Helper function to generate cache text for comparison modes
    const generateComparisonCacheText = () => {
      if (analysisMode === 'comparison' && sourceA && sourceB) {
        // Sort sources alphabetically to make cache key order-independent
        const sources = [
          { title: sourceA.title, text: sourceA.text },
          { title: sourceB.title, text: sourceB.text }
        ].sort((a, b) => a.title.localeCompare(b.title));
        return `${sources[0].title}:${sources[0].text}| ${sources[1].title}:${sources[1].text}`;
      }

      if (analysisMode === 'ontology_comparison' && sourceA && sourceB) {
        // Use titles and summary/node count for cache key to avoid huge JSON strings
        let cacheText = `ONTOLOGY_COMPARE:${sourceA.title} (${sourceA.data.nodes.length})| ${sourceB.title} (${sourceB.data.nodes.length})`;
        if (sourceC) {
          cacheText += `| ${sourceC.title} (${sourceC.data.nodes.length})`;
        }
        return cacheText;
      }

      if (analysisMode === 'comparative_synthesis' && documents) {
        let cacheText = documents.map((d: { id: string }) => d.id).sort().join(',');
        if (lens) {
          cacheText += `| lens:${lens}`;
        }
        return cacheText;
      }

      if (analysisMode === 'resistance_synthesis' && documents) {
        return documents.map((d: { title: string }) => d.title).sort().join(',');
      }

      return textForCache;
    };

    textForCache = generateComparisonCacheText();

    const cacheKey = generateCacheKey(analysisMode || 'default', textForCache, sourceType || 'unknown', PROMPT_VERSION);

    try {
      // Skip cache if force is true
      if (!force) {
        console.log('[ANALYSIS] Checking Redis cache...');

        const cacheUserId = getCacheUserId(analysisMode, userId);
        let cachedAnalysis = await StorageService.getCache(cacheUserId, cacheKey);

        if (cachedAnalysis) {
          console.log(`[CACHE HIT] Returning cached analysis for key: ${cacheKey} `);

          // [FIX] Ensure cached ecosystem analysis is an array
          if (analysisMode === 'ecosystem' && !Array.isArray(cachedAnalysis)) {
            // Cast to generic object to check for nested fields
            const ca = cachedAnalysis as Record<string, unknown>;
            if (Array.isArray(ca.impacts)) {
              cachedAnalysis = ca.impacts;
            } else if (ca.analysis && Array.isArray(ca.analysis)) {
              cachedAnalysis = ca.analysis;
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

        // [NEW] If checkCacheOnly flag is set, return early without running analysis
        if (requestData.checkCacheOnly) {
          console.log('[ANALYSIS] checkCacheOnly=true, no cache found, returning null');
          return NextResponse.json({
            success: true,
            analysis: null,
            fromCache: false
          });
        }
      }
    } catch (cacheError) {
      console.warn('Redis cache read failed:', cacheError);
    }
    // --- CACHING LOGIC END ---

    // [Feature] Decoupled Critique Mode
    if (analysisMode === 'critique') {
      if (!requestData.existingAnalysis) {
        return NextResponse.json({ error: "Missing existingAnalysis for critique mode" }, { status: 400 });
      }

      if (!openai) {
        return NextResponse.json({ error: "OpenAI API Key required for Critique Mode" }, { status: 500 });
      }

      console.log('[ANALYSIS] Mode is CRITIQUE. bypassing main generation.');
      // Run only the critique loop
      const critique = await runCritiqueLoop(openai, userId, text, requestData.existingAnalysis);
      return NextResponse.json({
        success: true,
        analysis: { system_critique: critique } // Wrap in analysis object for consistency
      });
    }

    // --- PERFORM ANALYSIS VIA SERVICE ---
    if (!openai) {
      return NextResponse.json({ error: "OpenAI API Key required for Standard Analysis" }, { status: 500 });
    }
    const { analysis, usage } = await performAnalysis(openai, userId, requestData);

    // ---------------------
    // Cache the result
    try {
      if (analysis && typeof analysis === 'object' && !analysis.error) {
        const cacheUserId = getCacheUserId(analysisMode, userId);

        await StorageService.setCache(cacheUserId, cacheKey, analysis, 86400); // 24 hours
        console.log(`[ANALYSIS] Saved to cache: ${cacheKey}`);
      } else {
        console.warn(`[ANALYSIS] Skipping cache for failed/partial analysis. Key: ${cacheKey}`);
      }
    } catch (saveError) {
      console.warn('[ANALYSIS] Failed to save to cache:', saveError);
    }

    console.log(`[ANALYSIS] Request completed successfully in ${Date.now() - startTime} ms`);

    // [DEBUG] Log Node Count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debugNodes = (analysis as any)?.assemblage_network?.nodes;
    if (Array.isArray(debugNodes)) {
      console.log(`[DEBUG_DENSITY] AI Generated Node Count: ${debugNodes.length}`);
    } else {
      console.log(`[DEBUG_DENSITY] No assemblage_network found or nodes is not an array.`);
    }

    // [FIX] Normalize topology keys (AI sometimes uses 'territorial' or 'territorial_scope' instead of 'scope')
    const topology = (analysis as any)?.topology_analysis;
    if (topology) {
      const keys = Object.keys(topology);
      console.log(`[DEBUG_TOPOLOGY] Received topology keys: ${keys.join(', ')}`);

      if (!topology.scope) {
        console.warn('[DEBUG_TOPOLOGY] "scope" key missing! Attempting to find alias...');
        const alias = keys.find(k => k.includes('territorial') || k.includes('scope'));
        if (alias && topology[alias]) {
          console.log(`[DEBUG_TOPOLOGY] Found alias "${alias}", mapping to "scope"`);
          topology.scope = topology[alias];
        } else {
          console.warn('[DEBUG_TOPOLOGY] No alias found. Injecting default empty scope to prevent UI collapse.');
          // Inject default to prevent UI disappearing solely due to missing data
          topology.scope = {
            axis: "Territorial Scope",
            a_score: 5, b_score: 5,
            anchors: { low: "Domestic/Sovereign", high: "Extraterritorial/Market" },
            description: "Data for this axis was not generated by the AI model.",
            confidence: 0,
            evidence: { a_quotes: [], b_quotes: [] }
          };
        }
      }
    } else {
      console.warn('[DEBUG_TOPOLOGY] topology_analysis object is MISSING entirely.');
    }

    return NextResponse.json({
      success: true,
      analysis,
      usage
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
