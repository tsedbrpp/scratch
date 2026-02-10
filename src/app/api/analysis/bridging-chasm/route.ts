import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthenticatedUserId, isReadOnlyAccess } from '@/lib/auth-helper';

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Demo mode check
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Analysis disabled in Demo Mode" }, { status: 403 });
    }

    const { policyText, technicalText } = await request.json();
    if (!policyText || !technicalText) {
        return NextResponse.json({ error: "Missing text content" }, { status: 400 });
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                // 1. Planning Phase
                sendEvent({ type: 'status', message: 'Analyzing Policy Rhetoric and Technical Reality...' });

                // Parallel Extraction with clearer instructions
                const [rhetoric, reality] = await Promise.all([
                    extractRhetoric(openai, policyText),
                    extractReality(openai, technicalText)
                ]);

                sendEvent({ type: 'status', message: 'Tracing Assemblage Connections...' });

                // 2. Dimensional Tracing (Sequential or Batched for streaming progress)
                const dimensions = [
                    'doc_analysis', 'tech_analysis', 'implementation',
                    'outcome', 'enforcement', 'timeline'
                ];

                for (const dimId of dimensions) {
                    sendEvent({ type: 'status', message: `Analyzing Dimension: ${dimId}...` });

                    const result = await traceDimension(openai, dimId, rhetoric, reality);

                    sendEvent({
                        type: 'result',
                        data: result
                    });
                }

                sendEvent({ type: 'done' });
                controller.close();

            } catch (error) {
                console.error("Streaming analysis failed:", error);
                sendEvent({ type: 'error', message: 'Analysis failed.' });
                controller.close();
            }
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

async function extractRhetoric(openai: OpenAI, text: string) {
    console.log(`[DRIFT API] Extracting rhetoric from ${text.length} chars...`);
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert policy analyst. Extract and summarize the core ethical promises, safety claims, and societal values asserted in this document. Focus on what it *claims* it will achieve. Return a clear text summary." },
                { role: "user", content: text.substring(0, 50000) }
            ],
            max_completion_tokens: 2000
        });
        const result = response.choices[0].message.content || "";
        if (result.length < 20) throw new Error("Extraction result too short"); // Loosened from 50

        console.log(`[DRIFT API] Rhetoric extracted (${result.length} chars)`);
        return result;
    } catch (err) {
        console.warn(`[DRIFT API] Rhetoric extraction failed. Using raw text fallback. Error: ${(err as Error).message}`);
        return "Raw Document Excerpt (Extraction Failed):\n" + text.substring(0, 4000); // Reduced to ensure fit
    }
}

async function extractReality(openai: OpenAI, text: string) {
    console.log(`[DRIFT API] Extracting reality from ${text.length} chars...`);
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert technical auditor. Extract and summarize the actual technical implementation details, architectural decisions, and enforcement mechanisms described. Focus on *how* it works concretely. Return a clear text summary." },
                { role: "user", content: text.substring(0, 50000) }
            ],
            max_completion_tokens: 2000
        });
        const result = response.choices[0].message.content || "";
        if (result.length < 20) throw new Error("Extraction result too short");

        console.log(`[DRIFT API] Reality extracted (${result.length} chars)`);
        return result;
    } catch (err) {
        console.warn(`[DRIFT API] Reality extraction failed. Using raw text fallback. Error: ${(err as Error).message}`);
        return "Raw Document Excerpt (Extraction Failed):\n" + text.substring(0, 4000);
    }
}

async function traceDimension(openai: OpenAI, dimensionId: string, rhetoric: string, reality: string) {
    const dimensionPrompts: Record<string, string> = {
        doc_analysis: "Analyze the gap between the document's high-level ethical promises and its specific definitions/details.",
        tech_analysis: "Analyze the gap between the policy's requirements and the actual technical architecture/code implementation.",
        implementation: "Analyze how the system is deployed in practice vs how it was ideally described.",
        outcome: "Analyze the difference between intended positive impacts and observable real-world complications/harms.",
        enforcement: "Analyze the gap between promised accountability mechanisms and actual recourse/penalties.",
        timeline: "Analyze how the system's purpose or function has drifted or expanded over time (function creep)."
    };

    const prompt = dimensionPrompts[dimensionId] || "Analyze the gap.";
    console.log(`[DRIFT API] Tracing ${dimensionId}...`);

    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                {
                    role: "system", content: `You are an expert impartial auditor tracing the "drift" between valid Policy Rhetoric and Technical Reality.
      
      Task: ${prompt}
      
      Instructions:
      1. Compare the "Rhetoric" (claims) vs "Reality" (implementation).
      2. If "Raw Document Excerpt" is provided, do your best to analyze the raw text directly.
      3. Identify concrete contradictions or gaps.
      4. Assign a Drift Score (0.0 = aligned, 1.0 = total failure).
      
      Return JSON:
      {
        "driftScore": number,
        "summary": "Short qualitative description of the gap (max 2 sentences)",
        "evidence": {
           "rhetoric": "Quote or specific claim from the text",
           "reality": "Quote or specific mechanism from the text",
           "reasoning": "Why this represents a drift or gap"
        }
      }` },
                { role: "user", content: `Rhetoric Source:\n${rhetoric}\n\nReality Source:\n${reality}` }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 1000
        });

        const rawContent = response.choices[0].message.content || "{}";
        console.log(`[DRIFT API] Response for ${dimensionId}:`, rawContent.substring(0, 100) + "...");

        const content = JSON.parse(rawContent);

        // Validate and sanitise
        return {
            dimensionId,
            driftScore: typeof content.driftScore === 'number' ? content.driftScore : parseFloat(content.driftScore) || 0,
            summary: content.summary || "No summary found.",
            evidence: {
                rhetoric: content.evidence?.rhetoric || "No rhetoric extracted.",
                reality: content.evidence?.reality || "No reality extracted.",
                reasoning: content.evidence?.reasoning || "No reasoning provided."
            }
        };
    } catch (e) {
        console.error(`[DRIFT API] Failed to parse/generate dimension ${dimensionId}:`, e);
        return {
            dimensionId,
            driftScore: 0,
            summary: "Analysis generation failed.",
            evidence: { rhetoric: "Error", reality: "Error", reasoning: "AI Error: " + (e as Error).message }
        };
    }
}
