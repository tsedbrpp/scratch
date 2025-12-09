import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
    let { userId } = await auth();

    // Check for demo user if not authenticated
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

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

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and other non-content elements
        $('script, style, noscript, iframe, svg, header, footer, nav').remove();

        // Extract title
        const title = $('title').text().trim() || url;

        // Extract text content
        // We look for main content areas first, or fall back to body
        const contentSelector = 'main, article, #content, .content, body';
        let text = $(contentSelector).first().text();

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Limit text length to avoid overwhelming the analysis
        const maxLength = 50000;
        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '... (truncated)';
        }

        return NextResponse.json({
            success: true,
            title,
            content: text,
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
