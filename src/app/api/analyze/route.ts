import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StorageService } from '@/lib/storage-service';
import { checkRateLimit } from '@/lib/ratelimit';
import { getAuthenticatedUserId, isReadOnlyAccess } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';
import {
  getAnalysisConfig,
  runCritiqueLoop,
  performAnalysis,
  generateCacheKey,
  runComprehensiveAnalysis
} from '@/lib/analysis-service';
import { AnalysisResult } from '@/types';

export const maxDuration = 300; // Allow up to 5 minutes for analysis
export const dynamic = 'force-dynamic';

// Increment this version to invalidate all cached analyses
const PROMPT_VERSION = 'v38-audit-metadata'; // Incremented to ensure audit metadata is captured

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

// Helper to resolve effective context
async function getEffectiveContext(req: NextRequest, userId: string) {
  const workspaceId = req.headers.get('x-workspace-id');
  const targetContext = workspaceId || userId;
  const access = await validateWorkspaceAccess(userId, targetContext);

  if (!access.allowed) throw new Error('Access Denied to Workspace');
  return { contextId: targetContext, role: access.role };
}


export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[ANALYSIS] Request started at ${new Date(startTime).toISOString()} `);

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    console.log('[ANALYSIS] Unauthorized. Headers:', Object.fromEntries(request.headers));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // [NEW] Resolve Context (Personal vs Team)
  let contextId = userId;
  try {
    const ctx = await getEffectiveContext(request, userId);
    contextId = ctx.contextId;
  } catch (e: unknown) {
    if (e.message === 'Access Denied to Workspace') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw e;
  }

  try {
    const requestData = await request.json();
    const { text, sourceType, analysisMode, sourceA, sourceB, sourceC, force, documents, documentId, title, positionality, lens, mode, checkCacheOnly, assemblageId } = requestData;
    console.log(`[ANALYSIS] Received request. Context: ${contextId}, Text length: ${text?.length || 0}, Mode: ${analysisMode}, TheoryMode: ${mode}, Force: ${force}, DocID: ${documentId}, AssemblageID: ${assemblageId}, Positionality: ${!!positionality}, CheckCacheOnly: ${!!checkCacheOnly}`);

    // [NEW] BLOCK READ-ONLY DEMO USERS (unless they're only checking cache)
    if (!checkCacheOnly && await isReadOnlyAccess()) {
      return NextResponse.json({ error: "Demo Mode is Read-Only. Sign in to generate analysis." }, { status: 403 });
    }

    // --- CACHING LOGIC HOP (Moved Up) ---
    console.log('[ANALYSIS] Starting cache check...');
    let textForCache = text || '';

    // Append documentId to ensure uniqueness even if text is identical
    if (documentId) {
      textForCache += `| doc:${documentId} `;
    }

    // Append assemblageId
    if (assemblageId) {
      textForCache += `| assemblage:${assemblageId} `;
    }

    // Append positionality
    if (positionality) {
      const posString = typeof positionality === 'object' ? JSON.stringify(positionality) : positionality;
      textForCache += `| pos:${posString} `;
    }

    // Helper function to generate cache text for comparison modes
    const generateComparisonCacheText = () => {
      if (analysisMode === 'comparison' && sourceA && sourceB) {
        const sources = [
          { title: sourceA.title, text: sourceA.text },
          { title: sourceB.title, text: sourceB.text }
        ].sort((a, b) => a.title.localeCompare(b.title));
        return `${sources[0].title}:${sources[0].text}| ${sources[1].title}:${sources[1].text}`;
      }

      if (analysisMode === 'ontology_comparison' && sourceA && sourceB) {
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
    let cachedAnalysis = null;
    const isCacheHit = false;

    try {
      if (!force) {
        console.log('[ANALYSIS] Checking Redis cache...');
        const cacheUserId = getCacheUserId(analysisMode, contextId); // Use contextId here
        cachedAnalysis = await StorageService.getCache(cacheUserId, cacheKey);

        if (cachedAnalysis) {
          console.log(`[CACHE HIT] Returning cached analysis for key: ${cacheKey} `);

          // [FIX] Ensure cached ecosystem analysis is an array
          if (analysisMode === 'ecosystem' && !Array.isArray(cachedAnalysis)) {
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
        } else {
          console.log('[ANALYSIS] Cache Miss.');
          if (checkCacheOnly) {
            console.log('[ANALYSIS] checkCacheOnly=true, no cache found, returning null');
            return NextResponse.json({ success: true, analysis: null, fromCache: false });
          }
        }
      }
    } catch (cacheError) {
      console.warn('Redis cache read failed:', cacheError);
    }

    // --- PAYWALL / RATE LIMIT (Only if Cache Miss) ---
    if (!cachedAnalysis) { // Should always be true here if we didn't return above
      // Rate limit check uses Real User ID (UserId), not ContextId, as quotas are per-user
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

      try {
        const { deductCredits } = await import('@/lib/redis-scripts');
        // Credits are deducted from the USER, even if working in a Team
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
          const cached = await StorageService.getCache(contextId, cacheKey); // Use contextId
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
          const { analysis } = await performAnalysis(openai, contextId, { // Use contextId
            text: "ANT Trace Analysis Wrapper", // Dummy text to satisfy interface
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
          const { analysis } = await performAnalysis(openai, contextId, { // Use contextId
            text: "Assemblage Realist Analysis Wrapper",
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
          const { analysis } = await performAnalysis(openai, contextId, { // Use contextId
            text: "Hybrid Reflexive Analysis Wrapper",
            analysisMode: 'hybrid_reflexive',
            actors: tracedActors, // [NEW] Pass full actor objects for visual usage
            links: associations,  // [NEW] Pass full links for visual usage
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
      await StorageService.setCache(contextId, cacheKey, analysisResult, 86400); // Use contextId

      return NextResponse.json({
        success: true,
        analysis: analysisResult
      });
    }

    // --- STANDARD ANALYSIS FLOW ---

    // [Feature] Assemblage Extraction & Discovery
    if (analysisMode === 'text_extraction' || analysisMode === 'topic_discovery') {
      if (!openai) {
        return NextResponse.json({ error: "OpenAI API Key required for Extraction" }, { status: 500 });
      }

      console.log(`[ANALYSIS] Mode is ${analysisMode}. Routing to AssemblageExtractionService.`);
      const { AssemblageExtractionService } = await import('@/lib/assemblage-extraction-service');

      let result;
      try {
        if (analysisMode === 'text_extraction') {
          console.log(`[ANALYSIS] Text Extraction. Text length: ${text?.length}`);
          if (!text || text.length < 10) return NextResponse.json({ error: "Text content required" }, { status: 400 });
          result = await AssemblageExtractionService.extractAssemblageFromText(text, openai);
        } else {
          // topic_discovery
          console.log(`[ANALYSIS] Topic Discovery. Query: ${requestData.query}`);
          if (!requestData.query) return NextResponse.json({ error: "Query required for discovery" }, { status: 400 });
          result = await AssemblageExtractionService.discoverActorsFromTopic(requestData.query, openai);
        }

        console.log("[ANALYSIS] Extraction Result:", JSON.stringify(result, null, 2));

        if (!result) {
          console.error("[ANALYSIS] Result is undefined!");
          return NextResponse.json({ error: "Extraction returned undefined" }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          analysis: result
        });
      } catch (err) {
        console.error("Extraction failed", err);

        return NextResponse.json({ error: "Extraction failed", details: (err as Error).message }, { status: 500 });
      }
    }



    if ((!text || text.length < 50) && analysisMode !== 'comparative_synthesis' && analysisMode !== 'resistance_synthesis' && analysisMode !== 'comparison' && analysisMode !== 'ontology_comparison' && analysisMode !== 'critique' && analysisMode !== 'assemblage_explanation' && analysisMode !== 'theoretical_synthesis' && analysisMode !== 'escalation_evaluation') {
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

    // --- CACHING LOGIC (Handled Above) ---

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
      const critique = await runCritiqueLoop(openai, contextId, text, requestData.existingAnalysis); // Use ContextId
      return NextResponse.json({
        success: true,
        analysis: { system_critique: critique } // Wrap in analysis object for consistency
      });
    }

    // [Feature] Theoretical Synthesis Mode
    if (analysisMode === 'theoretical_synthesis') {
      if (!openai) {
        return NextResponse.json({ error: "OpenAI API Key required for Theoretical Synthesis" }, { status: 500 });
      }

      console.log('[ANALYSIS] Mode is THEORETICAL SYNTHESIS.');
      const reportContext = requestData.reportContext; // Expects JSON string of key findings

      const prompt = `
        You are an expert socio-technical theorist specializing in Actor-Network Theory (Latour, Callon, Law) and Assemblage Theory (Deleuze, Guattari, DeLanda).
        
        Your task is to translate the provided Policy Analysis Findings into high-level theoretical readings.
        
        INPUT DATA:
        ${reportContext}
        
        INSTRUCTIONS:
        For each suitable key finding (select the top 3-5 most structural/systemic findings):
        1. State the Finding (Result N).
        2. Provide an "ANT Reading": Use concepts like Obligatory Passage Point (OPP), Inscription Devices, Translation, Enrollment, Black-boxing, Immutable Mobiles.
        3. Provide an "Assemblage Reading": Use concepts like Territorialization, Deterritorialization, Coding/Decoding, Stratification, Lines of Flight, Agencement.
        4. Add a final "Theoretical Contribution" section summary (Hevner-style relevance).
        
        FORMAT:
        Result 1: [Finding Summary]
        
        ANT Reading: [Analysis]
        
        Assemblage Reading: [Analysis]
        
        ...
        
        Theoretical Implications:
        [Summary]
        `;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o", // Strong model for theory
        messages: [
          { role: "system", content: "You are a senior STS (Science and Technology Studies) scholar." },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 4000
      });

      const resultText = completion.choices[0].message.content || "Failed to generate synthesis.";

      return NextResponse.json({
        success: true,
        analysis: { theoretical_synthesis: resultText }
      });
    }

    // [New] Pattern Sentinel (Escalation Evaluation)
    if (analysisMode === 'escalation_evaluation') {
      if (!openai) {
        return NextResponse.json({ error: "OpenAI API Key required for Pattern Sentinel" }, { status: 500 });
      }

      console.log('[ANALYSIS] Mode is ESCALATION_EVALUATION (Pattern Sentinel).');
      const { runEscalationEvaluation } = await import('@/lib/governance/escalation-service');

      const analysisToevaluate = requestData.existingAnalysis;
      const config = {
        recurrence_count: requestData.recurrence_count || 0,
        evaluator_variance: requestData.evaluator_variance || 0 // Default
      };

      if (!analysisToevaluate) {
        return NextResponse.json({ error: "Missing existingAnalysis" }, { status: 400 });
      }

      const escalationStatus = await runEscalationEvaluation(openai, analysisToevaluate, config);

      return NextResponse.json({
        success: true,
        analysis: { escalation_status: escalationStatus }
      });
    }



    // [Feature] Comprehensive Scan
    if (analysisMode === 'comprehensive_scan') {
      if (!openai) {
        return NextResponse.json({ error: "OpenAI API Key required for Comprehensive Scan" }, { status: 500 });
      }

      // Check cache unless force=true
      if (!force) {
        console.log('[COMPREHENSIVE] Checking cache...');
        const cacheUserId = getCacheUserId(analysisMode, contextId); // Use ContextId
        const cachedAnalysis = await StorageService.getCache(cacheUserId, cacheKey);

        if (cachedAnalysis) {
          console.log(`[CACHE HIT] Returning cached comprehensive analysis for key: ${cacheKey}`);
          console.log(`[ANALYSIS] Completed(Cache Hit) in ${Date.now() - startTime} ms`);
          return NextResponse.json({
            success: true,
            analysis: cachedAnalysis,
            cached: true
          });
        }
        console.log('[COMPREHENSIVE] Cache miss, running fresh analysis.');
      } else {
        console.log('[COMPREHENSIVE] Force=true, skipping cache check.');
      }

      console.log('[ANALYSIS] Mode is COMPREHENSIVE. Running multi-stage workflow.');
      const result = await runComprehensiveAnalysis(openai, contextId, requestData); // Use ContextId

      // Cache the comprehensive result
      try {
        if (result.analysis && typeof result.analysis === 'object') {
          const cacheUserId = getCacheUserId(analysisMode, contextId); // Use ContextId
          await StorageService.setCache(cacheUserId, cacheKey, result.analysis, 86400); // 24 hours
          console.log(`[COMPREHENSIVE] Saved to cache: ${cacheKey}`);
        }
      } catch (saveError) {
        console.warn('[COMPREHENSIVE] Failed to save to cache:', saveError);
      }

      return NextResponse.json({
        success: true,
        analysis: result.analysis,
        usage: result.usage
      });
    }

    // --- PERFORM ANALYSIS VIA SERVICE ---
    if (!openai) {
      return NextResponse.json({ error: "OpenAI API Key required for Standard Analysis" }, { status: 500 });
    }
    const { analysis, usage } = await performAnalysis(openai, contextId, requestData); // Use ContextId

    // --- GHOST NODE DETECTION FOR ONTOLOGY MODE ---
    if (analysisMode === 'ontology' && analysis && analysis.nodes) {
      try {
        console.log('[API] Starting ghost node detection...');
        const { analyzeInstitutionalLogicsAndDetectGhostNodes } = await import('@/lib/ghost-nodes');
        const ghostNodesResult = await analyzeInstitutionalLogicsAndDetectGhostNodes(openai, text, analysis, sourceType);
        console.log('[API] Ghost node detection completed:', {
          ghostNodeCount: ghostNodesResult.ghostNodes?.length || 0,
          hasInstitutionalLogics: !!ghostNodesResult.institutionalLogics
        });
        
        // Add ghost nodes to the analysis
        if (ghostNodesResult.ghostNodes && ghostNodesResult.ghostNodes.length > 0) {
          analysis.nodes = [...analysis.nodes, ...ghostNodesResult.ghostNodes];
          analysis.institutionalLogics = ghostNodesResult.institutionalLogics;
          analysis.ghostNodeCount = ghostNodesResult.ghostNodes.length;
          console.log('[API] Added', ghostNodesResult.ghostNodes.length, 'ghost nodes to analysis');
        }
      } catch (error) {
        console.error('[API] Ghost node detection failed:', error);
        console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      }
    }

    // ---------------------
    // Cache the result
    try {
      if (analysis && typeof analysis === 'object' && !analysis.error) {
        const cacheUserId = getCacheUserId(analysisMode, contextId); // Use ContextId

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

    const { TransparencyService } = await import('@/services/transparency-service');
    const transparency = TransparencyService.generateTransparencyReport(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      usage,
      transparency
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
