import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/login(.*)",
    "/sign-up(.*)",
    "/", // Landing page is public
    "/api/auth/login", // Keep for backward compatibility during migration if needed
    "/api/auth/logout",
    "/demo"
]);

const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, request) => {
    if (isApiRoute(request)) {
        // API routes handle their own auth and return JSON 401 if needed
        return;
    }
    if (!isPublicRoute(request)) {
        await auth.protect();
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
