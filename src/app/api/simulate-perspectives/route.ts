
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/ratelimit';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { AVAILABLE_PERSPECTIVES } from '@/lib/perspectives';

export const maxDuration = 60; // 1 minute max
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.success) {
        return NextResponse.json(
            { error: rateLimit.error || "Too Many Requests" },
            { status: 429 }
        );
    }

    try {
        const { topic, perspectiveAId, perspectiveBId } = await request.json();

        if (!topic || !perspectiveAId || !perspectiveBId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const perspA = AVAILABLE_PERSPECTIVES.find(p => p.id === perspectiveAId);
        const perspB = AVAILABLE_PERSPECTIVES.find(p => p.id === perspectiveBId);

        if (!perspA || !perspB) {
            return NextResponse.json({ error: "Invalid perspective IDs" }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            // Demo Mode fallback if no key
            return NextResponse.json({
                success: true,
                perspectives: {
                    perspectiveA: `[DEMO] From the ${perspA.name} view: The topic of '${topic}' presents significant opportunities for efficiency, provided we minimize regulatory friction.`,
                    perspectiveB: `[DEMO] From the ${perspB.name} view: We must approach '${topic}' with caution, prioritizing human rights and systemic stability over speed.`
                }
            });
        }

        const openai = new OpenAI({ apiKey: apiKey, baseURL: process.env.OPENAI_BASE_URL });

        const prompt = `
You are a political simulation engine.
Topic: "${topic}"

Simulate two distinct perspectives on this topic.

Perspective A: ${perspA.name}
Core Values: ${perspA.description}

Perspective B: ${perspB.name}
Core Values: ${perspB.description}

Task: Write a short, first-person reaction (50-80 words) from EACH perspective.
Capture their specific vocabulary, concerns, and epistemic framing.
Do not start with "As a..." or "From a...". Jump straight into the argument.

Output JSON:
{
  "perspectiveA": "...",
  "perspectiveB": "..."
}
`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: "You are a specialized simulation engine for political discourse analysis." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || "{}";
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (e) {
            console.error("JSON parse error", e);
            parsed = { perspectiveA: "Error parsing AI response.", perspectiveB: "Error parsing AI response." };
        }

        return NextResponse.json({
            success: true,
            perspectives: {
                perspectiveA: parsed.perspectiveA || "No response generated.",
                perspectiveB: parsed.perspectiveB || "No response generated."
            }
        });

    } catch (error) {
        console.error("[SIMULATION ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
