import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
            console.log('[MIDDLEWARE] Bypassing auth due to Demo Mode');
            return;
        }
    }

    // C. Protected Routes: Enforce Login
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