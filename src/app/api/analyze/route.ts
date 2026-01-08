import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StorageService } from '@/lib/storage-service';
import { checkRateLimit } from '@/lib/ratelimit';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
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
const PROMPT_VERSION = 'v26'; // Incremented for structured, pedagogical assemblage explanation format

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[ANALYSIS] Request started at ${new Date(startTime).toISOString()} `);

  const userId = await getAuthenticatedUserId(request);

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
    const { text, sourceType, analysisMode, sourceA, sourceB, sourceC, force, documents, documentId, title, positionality, lens } = requestData;
    console.log(`[ANALYSIS] Received request.Text length: ${text?.length || 0}, Mode: ${analysisMode}, Force: ${force}, DocID: ${documentId}, Positionality: ${!!positionality} `);

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    if ((!text || text.length < 50) && analysisMode !== 'comparative_synthesis' && analysisMode !== 'resistance_synthesis' && analysisMode !== 'comparison' && analysisMode !== 'ontology_comparison' && analysisMode !== 'critique' && analysisMode !== 'assemblage_explanation') {
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

    if (analysisMode === 'comparison' && sourceA && sourceB) {
      textForCache = `${sourceA.title}:${sourceA.text}| ${sourceB.title}:${sourceB.text} `;
    } else if (analysisMode === 'ontology_comparison' && sourceA && sourceB) {
      // Use titles and summary/node count for cache key to avoid huge JSON strings
      textForCache = `ONTOLOGY_COMPARE:${sourceA.title} (${sourceA.data.nodes.length})| ${sourceB.title} (${sourceB.data.nodes.length})`;
      if (sourceC) {
        textForCache += `| ${sourceC.title} (${sourceC.data.nodes.length})`;
      }
    } else if (analysisMode === 'comparative_synthesis' && documents) {
      textForCache = documents.map((d: { id: string }) => d.id).sort().join(',');
      if (lens) {
        textForCache += `| lens:${lens}`;
      }
    } else if (analysisMode === 'resistance_synthesis' && documents) {
      textForCache = documents.map((d: { title: string }) => d.title).sort().join(',');
    }

    const cacheKey = generateCacheKey(analysisMode || 'default', textForCache, sourceType || 'unknown', PROMPT_VERSION);

    try {
      // Skip cache if force is true
      if (!force) {
        console.log('[ANALYSIS] Checking Redis cache...');
        let cachedAnalysis = await StorageService.getCache(userId, cacheKey);

        if (cachedAnalysis) {
          console.log(`[CACHE HIT] Returning cached analysis for key: ${cacheKey} `);

          // [FIX] Ensure cached ecosystem analysis is an array
          if (analysisMode === 'ecosystem' && !Array.isArray(cachedAnalysis)) {
            // Cast to any to access potential fields if type is weird
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ca = cachedAnalysis as any;
            if (ca.impacts && Array.isArray(ca.impacts)) {
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
      }
    } catch (cacheError) {
      console.warn('Redis cache read failed:', cacheError);
    }
    // --- CACHING LOGIC END ---

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

    // --- PERFORM ANALYSIS VIA SERVICE ---
    const { analysis, usage } = await performAnalysis(openai, userId, requestData);

    // ---------------------
    // Cache the result
    try {
      if (analysis && typeof analysis === 'object' && !analysis.error) {
        await StorageService.setCache(userId, cacheKey, analysis, 86400); // 24 hours
        console.log(`[ANALYSIS] Saved to cache: ${cacheKey}`);
      } else {
        console.warn(`[ANALYSIS] Skipping cache for failed/partial analysis. Key: ${cacheKey}`);
      }
    } catch (saveError) {
      console.warn('[ANALYSIS] Failed to save to cache:', saveError);
    }

    console.log(`[ANALYSIS] Request completed successfully in ${Date.now() - startTime} ms`);

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
