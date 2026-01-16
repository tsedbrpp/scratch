import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
    "/api(.*)" // [NEW] Protect all API routes by default
]);

// Explicitly define public routes (webhooks must be public for Stripe)
const isPublicRoute = createRouteMatcher([
    "/",
    "/api/webhooks(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
    // Explicitly allow landin page and public routes (webhooks)
    if (isPublicRoute(request)) {
        console.log('[MIDDLEWARE] Allowing public route:', request.nextUrl.pathname);
        return;
    }

    // Bypass auth if demo mode is enabled (but NOT for API routes generally, unless specific logic handles it - though here we might want to be careful. 
    // Actually, demo mode usually implies read-only access to protected UI, but API access still needs control. 
    // However, the previous logic was: if demo mode, return. This effectively disables auth for the whole app in demo mode. 
    // We should probably keep that for the UI but maybe enforced stricter for API? 
    // For now, I will preserve existing behavior but ensure API catch-all works when NOT in demo mode.)
    // Bypass auth if demo mode is enabled
    // We log the value to debug Vercel environment behavior
    const demoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE;
    console.log('[MIDDLEWARE] Path:', request.nextUrl.pathname, 'Demo Mode Env:', demoMode);

    if (demoMode === "true") {
        console.log('[MIDDLEWARE] Bypassing auth due to Demo Mode');
        return;
    }



    if (isProtectedRoute(request)) {
        console.log('[MIDDLEWARE] Protecting route:', request.nextUrl.pathname);
        await auth.protect();
    } else {
        console.log('[MIDDLEWARE] Allowing public route:', request.nextUrl.pathname);
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
