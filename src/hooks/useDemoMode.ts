import { useAuth } from "@clerk/nextjs";

export function useDemoMode() {
    const { userId, isLoaded } = useAuth();

    // Check environment variable on client side
    // Note: NEXT_PUBLIC_ variables are available on client
    const isDemoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && !userId;

    // Read-Only if: Demo is Enabled AND User is NOT logged in
    // We wait for isLoaded to avoid flashing read-only state during loading
    const isReadOnly = isLoaded && !userId && isDemoEnabled;

    return {
        isReadOnly,
        isDemoEnabled,
        isAuthenticated: !!userId
    };
}
