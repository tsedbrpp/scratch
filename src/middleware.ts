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
    if (isProtectedRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Only run middleware on these specific protected routes and API routes
        '/dashboard(.*)',
        '/data(.*)',
        '/ecosystem(.*)',
        '/cultural(.*)',
        '/reflexivity(.*)',
        '/synthesis(.*)',
        '/ontology(.*)',
        '/resistance(.*)',
        '/governance(.*)',
        '/timeline(.*)',
        '/empirical(.*)',
        '/comparison(.*)',
        '/admin(.*)',
        '/api(.*)',
        '/trpc(.*)'
    ],
};
