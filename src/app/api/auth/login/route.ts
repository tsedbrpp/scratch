import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();
        const correctCode = process.env.ACCESS_CODE;

        if (!correctCode) {
            console.error("ACCESS_CODE is not defined in environment variables");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        if (code === correctCode) {
            // Set the cookie
            // Note: In a real production app, you'd want 'secure: true' (requires HTTPS)
            // and maybe a signed JWT instead of a plain flag.
            // For this local/personal tool, a simple value is okay, but we'll make it HttpOnly.
            const cookieStore = await cookies();
            cookieStore.set('auth_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                // Expire in 7 days
                maxAge: 60 * 60 * 24 * 7,
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Invalid access code" },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
