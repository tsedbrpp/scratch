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
    "/admin(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
    // Explicitly allow the landing page
    if (request.nextUrl.pathname === "/") {
        return;
    }

    // Bypass auth if demo mode is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true") {
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
