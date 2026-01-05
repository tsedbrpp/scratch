import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

/**
 * robustly retrieves the authenticated user ID.
 * Handles both standard Clerk authentication and Demo Mode fallback.
 */
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
    const { userId } = await auth();

    if (userId) {
        return userId;
    }

    // Demo Mode Fallback
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        const validDemoId = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';

        // Robust check: Matches env var OR is default 'demo-user' if header matches or env is missing
        if (demoUserId === validDemoId || (!demoUserId && !process.env.NEXT_PUBLIC_DEMO_USER_ID)) {
            // Optional: Log successful demo auth for debugging (verbose)
            // console.log('[AUTH] Authorized as Demo User:', validDemoId);
            return validDemoId;
        }
    }

    return null;
}
