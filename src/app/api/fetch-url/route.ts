import { NextRequest, NextResponse } from 'next/server';
import { ContentExtractor } from '@/lib/content-extractor';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { checkRateLimit } from '@/lib/ratelimit';

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
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Fetch the URL
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const extracted = await ContentExtractor.extract(response, url);

        return NextResponse.json({
            success: true,
            title: extracted.title,
            text: extracted.text, // Frontend expects 'text'
            content: extracted.text, // Backward compatibility
            url
        });

    } catch (error: unknown) {
        console.error('URL fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch URL', details: errorMessage },
            { status: 500 }
        );
    }
}
