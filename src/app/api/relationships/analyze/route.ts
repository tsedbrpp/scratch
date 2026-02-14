
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
// import { currentUser } from '@clerk/nextjs'; // Optional auth check

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


/**
 * Attempts to parse JSON, with basic repair for common LLM failures (like missing trailing braces).
 */
function safeParseJson(content: string) {
    let cleanContent = content.trim();

    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
        return JSON.parse(cleanContent);
    } catch (e) {
        // Fallback: Check for missing trailing braces
        const openBraces = (cleanContent.match(/\{/g) || []).length;
        const closeBraces = (cleanContent.match(/\}/g) || []).length;

        if (openBraces > closeBraces) {
            console.warn(`[REPAIR] Detected ${openBraces - closeBraces} missing closing braces. Attempting repair.`);
            let repaired = cleanContent;
            for (let i = 0; i < openBraces - closeBraces; i++) {
                repaired += '}';
            }
            try {
                return JSON.parse(repaired);
            } catch (innerError) {
                console.error("[REPAIR FAILED]", innerError);
                throw e; // Throw original error if repair fails
            }
        }
        throw e;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, mode, model } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in environment variables.");
        }

        const response = await openai.chat.completions.create({
            model: model || "gpt-4o", // Allow override, default to stable
            messages: [
                { role: "system", content: "You are a helpful AI assistant specialized in Actor-Network Theory analysis. You must output valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: mode === 'json' ? { type: "json_object" } : undefined,
            temperature: 0.1, // Even lower for higher consistency
            max_tokens: 1500, // Ensure enough headroom for complex justifications
        });

        const content = response.choices[0].message.content;
        let analysis = content;

        if (mode === 'json') {
            if (!content) {
                console.error("OpenAI returned empty content");
                return NextResponse.json({ error: 'OpenAI returned empty content' }, { status: 500 });
            }
            try {
                analysis = safeParseJson(content);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                console.error("Raw Content:", content);
                return NextResponse.json({ error: 'Failed to parse AI response as JSON', content }, { status: 500 });
            }
        }

        return NextResponse.json({ analysis });

    } catch (error) {
        console.error('Analysis API Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown Error',
            // Do not expose stack trace in production usually, but helpful for debug
            details: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
