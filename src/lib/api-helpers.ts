import { NextResponse } from 'next/server';

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    error?: string;
}

/**
 * Creates a standardized 429 Too Many Requests response.
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
    return NextResponse.json(
        { error: result.error || "Too Many Requests" },
        {
            status: 429,
            headers: {
                'X-RateLimit-Limit': result.limit.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.reset.toString()
            }
        }
    );
}

/**
 * Creates a standardized 401 Unauthorized response.
 */
export function createUnauthorizedResponse(message: string = "Unauthorized"): NextResponse {
    return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Creates a standardized 500 Internal Server Error response.
 */
export function createErrorResponse(error: unknown, defaultMessage: string = "Internal Server Error"): NextResponse {
    console.error(defaultMessage, error);
    const message = error instanceof Error ? error.message : defaultMessage;
    return NextResponse.json(
        { error: defaultMessage, details: message },
        { status: 500 }
    );
}
