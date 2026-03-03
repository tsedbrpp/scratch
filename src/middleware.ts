import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define Routes that MUST be protected
const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/data(.*)",
    "/ecosystem(.*)",
    "/cultural(.*)",
    "/reflexivity(.*)",
    "/synthesis(.*)",
    "/ontology(.*)",
    "/resistance(.*)",
    "/governance(.*)",
    "/timeline(.*)",
    "/empirical(.*)",
    "/comparison(.*)",
    "/admin(.*)",
    "/settings(.*)",
    "/api(.*)" // Protects all API routes by default
]);

// 2. Define Public Routes (Homepage + Webhooks)
// These take precedence over protected routes
const isPublicRoute = createRouteMatcher([
    "/",
    "/api/webhooks(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
    // A. Public Routes: Allow immediately (Crucial for SEO)
    if (isPublicRoute(request)) {
        return;
    }

    // B. Demo Mode Logic
    // Handles access for demo users without forcing Clerk login
    const demoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE || process.env.ENABLE_DEMO_MODE;

    if (demoMode === "true") {
        const { userId } = await auth();
        // If user is NOT logged in, bypass auth so they can see the demo
        if (!userId) {
            // console.log('[MIDDLEWARE] Bypassing auth due to Demo Mode');

            // Global Sync Override: Intercept frontend demo requests and map to real user
            const getSyncUserId = () => {
                if (process.env.NODE_ENV === 'development') {
                    return process.env.LOCAL_SYNC_USER_ID?.replace(/^["']|["']$/g, '');
                }
                const adminId = process.env.ADMIN_USER_IDS?.split(',')[0];
                return adminId ? adminId.replace(/^["']|["']$/g, '').trim() : null;
            };

            const syncUserId = getSyncUserId();

            if (syncUserId) {
                const demoId = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';

                let modified = false;
                const requestHeaders = new Headers(request.headers);

                if (requestHeaders.get('x-demo-user-id') === demoId) {
                    requestHeaders.set('x-demo-user-id', syncUserId);
                    modified = true;
                }

                if (requestHeaders.get('x-workspace-id') === demoId) {
                    requestHeaders.set('x-workspace-id', syncUserId);
                    modified = true;
                }

                if (modified) {
                    return NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    });
                }
            }

            return;
        }
    }

    // C. Development Sync Logic
    // In local development, the backend auth-helper forces the user identity to LOCAL_SYNC_USER_ID.
    // However, the frontend WorkspaceProvider still sends the true local Clerk ID as the x-workspace-id.
    // We intercept and rewrite personal workspace requests to the sync ID to prevent 403 Access Denied.
    if (process.env.NODE_ENV === 'development') {
        const { userId } = await auth();
        if (userId) {
            const syncUserId = process.env.LOCAL_SYNC_USER_ID?.replace(/^["']|["']$/g, '');
            if (syncUserId && syncUserId.length > 0) {
                const requestHeaders = new Headers(request.headers);
                const currentWorkspaceId = requestHeaders.get('x-workspace-id');

                // If requesting a personal workspace (not a team), rewrite it to the sync identity
                if (currentWorkspaceId && !currentWorkspaceId.startsWith('team_')) {
                    requestHeaders.set('x-workspace-id', syncUserId);
                    return NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    });
                }
            }
        }
    }

    // D. Protected Routes: Enforce Login
    if (isProtectedRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, plus SEO files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)|robots\\.txt|sitemap\\.xml).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
