import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define public paths that don't require authentication
    const publicPaths = [
        '/login',
        '/api/auth/login',
        '/_next',
        '/favicon.ico',
        '/public',
    ];

    // Check if the current path is public
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (isPublicPath) {
        return NextResponse.next();
    }

    // 2. Check for the auth token
    const authToken = request.cookies.get('auth_token');
    const isAuthenticated = !!authToken;

    // 3. Handle unauthenticated access
    if (!isAuthenticated) {
        // If it's an API route, return 401 Unauthorized
        if (pathname.startsWith('/api')) {
            return NextResponse.json(
                { error: 'Unauthorized: Please log in.' },
                { status: 401 }
            );
        }

        // For page visits, redirect to /login
        const loginUrl = new URL('/login', request.url);
        // Optional: Add ?from=... to redirect back after login
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Allow authenticated access
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (handled in logic, but good to keep broad matcher)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
