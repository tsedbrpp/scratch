import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/ratelimit';
import { auth } from '@clerk/nextjs/server';
import { createRateLimitResponse, createUnauthorizedResponse, createErrorResponse } from '@/lib/api-helpers';
import { safeJSONParse } from '@/lib/analysis-utils';
import { PromptRegistry } from '@/lib/prompts/registry';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return createUnauthorizedResponse();
    }

    // Rate Limiting
    const rateLimit = await checkRateLimit(userId); // Uses default 25 requests per minute
    if (!rateLimit.success) {
        return createRateLimitResponse(rateLimit);
    }

    try {
        const { keyInsight } = await req.json();

        if (!keyInsight) {
            return NextResponse.json(
                { success: false, error: 'Key insight is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return createErrorResponse(new Error("OpenAI API key not configured"), "Server Configuration Error");
        }

        const openai = new OpenAI({ apiKey });

        const systemPrompt = await PromptRegistry.getEffectivePrompt(userId, 'generate_search_terms');

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a search optimization expert. Extract the most relevant search terms for finding online discussions.'
                },
                { role: 'user', content: `${systemPrompt}\n\nInsight: "${keyInsight}"` }
            ],
            // temperature: 0.3, // Removed for fine-tuned compatibility
            max_completion_tokens: 200
        });

        const content = response.choices[0].message.content?.trim() || '[]';

        // Parse using safeJSONParse
        const searchTerms = safeJSONParse<string[]>(content, []);

        // Validate that we got an array of strings
        if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid search terms generated' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, searchTerms });

    } catch (error) {
        return createErrorResponse(error, 'Internal Server Error');
    }
}
