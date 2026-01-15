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

/**
 * Checks if the current request represents a "Read-Only" access state.
 * Read-Only = No active Clerk session AND Demo Mode is enabled.
 * In this state, the user acts as 'demo-user' but cannot perform write/costly operations.
 */
export async function isReadOnlyAccess(): Promise<boolean> {
    const { userId } = await auth();
    // If user is logged in (Clerk), they are NOT read-only (even in demo mode, they are a 'real' user or admin)
    if (userId) return false;

    // If not logged in, they are read-only ONLY if demo mode is enabled (otherwise they are just unauthorized)
    return process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
}

/**
 * Checks if the given user ID is an admin.
 * Reads from process.env.ADMIN_USER_IDS (comma-separated).
 */
export async function isAdmin(userId: string): Promise<boolean> {
    // 1. Explicitly Deny Demo User
    // Even if added to admin list by mistake, the demo user should never have admin privileges
    if (userId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
        return false;
    }

    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    // Trim ids just in case of whitespace in env var
    return adminIds.map(id => id.trim()).includes(userId);
}
