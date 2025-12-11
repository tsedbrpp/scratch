import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/ratelimit';

import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
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
        const { keyInsight } = await req.json();

        if (!keyInsight) {
            return NextResponse.json(
                { success: false, error: 'Key insight is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({ apiKey });

        const prompt = `Given this policy insight, extract 3-5 key search terms or phrases that would be most effective for finding related discussions on Reddit. Focus on concrete topics, issues, or controversies that people would actually discuss online.

Insight: "${keyInsight}"

Return ONLY a JSON array of search terms, without any markdown formatting or explanation. Example format:
["algorithmic bias", "AI regulation", "facial recognition"]`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a search optimization expert. Extract the most relevant search terms for finding online discussions.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 200
        });

        const content = response.choices[0].message.content?.trim() || '[]';

        // Parse the JSON response (handle potential markdown wrapping)
        let searchTerms: string[];
        try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                searchTerms = JSON.parse(jsonMatch[0]);
            } else {
                searchTerms = JSON.parse(content);
            }
        } catch {
            console.error('Failed to parse AI response:', content);
            return NextResponse.json(
                { success: false, error: 'Failed to parse AI response' },
                { status: 500 }
            );
        }

        // Validate that we got an array of strings
        if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid search terms generated' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, searchTerms });

    } catch (error) {
        console.error('Search term generation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
