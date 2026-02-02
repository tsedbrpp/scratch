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
    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
            { role: "system", content: "Extract key ethical claims, promises, and values from this policy document. Return as a bulleted list." },
            { role: "user", content: text.substring(0, 15000) } // Truncate to safe limit
        ],
        max_completion_tokens: 500
    });
    return response.choices[0].message.content || "";
}

async function extractReality(openai: OpenAI, text: string) {
    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
            { role: "system", content: "Extract technical mechanisms, implementation details, and architectural decisions from this technical document. Return as a bulleted list." },
            { role: "user", content: text.substring(0, 15000) }
        ],
        max_completion_tokens: 500
    });
    return response.choices[0].message.content || "";
}

async function traceDimension(openai: OpenAI, dimensionId: string, rhetoric: string, reality: string) {
    const dimensionPrompts: Record<string, string> = {
        doc_analysis: "Analyze the gap between the document's high-level ethical promises and its specific definitions.",
        tech_analysis: "Analyze the gap between the policy's requirements and the actual technical architecture/code.",
        implementation: "Analyze how the system is deployed vs how it was described.",
        outcome: "Analyze the difference between intended impacts and observable real-world complications.",
        enforcement: "Analyze the gap between promised accountability and actual recourse mechanisms.",
        timeline: "Analyze how the system's purpose or function has drifted over time."
    };

    const prompt = dimensionPrompts[dimensionId] || "Analyze the gap.";

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
            {
                role: "system", content: `You are an expert impartial auditor tracing the "drift" between policy rhetoric and technical reality. 
      
      Task: ${prompt}
      
      Return JSON:
      {
        "driftScore": number (0.0 to 1.0, where 1.0 is total disconnect),
        "summary": "Short qualitative description of the gap",
        "evidence": {
           "rhetoric": "Quote or summary of the promise",
           "reality": "Quote or summary of the mechanism",
           "reasoning": "Why this is a gap"
        }
      }` },
            { role: "user", content: `Rhetoric:\n${rhetoric}\n\nReality:\n${reality}` }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 500
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    return {
        dimensionId,
        ...content
    };
}
