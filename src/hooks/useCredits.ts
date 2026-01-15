import { useState, useEffect } from 'react';
import { useDemoMode } from './useDemoMode';

export function useCredits() {
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const { isReadOnly } = useDemoMode();

    const fetchCredits = async () => {
        if (isReadOnly) {
            // Demo users have infinite "virtual" credits for UI purposes, or 0 if we want to restrict them?
            // Actually, demo mode restrictions are usually handled by `isReadOnly` flags directly.
            // But if we want to reuse this hook for real users, we fetch from API.
            // Let's return a safe default for demo mode or handle it upstream.
            // For now, let's say demo users have 0 "real" credits but we rely on isReadOnly for permissions.
            // Wait, the requirement is "users with zero credit".
            // Demo user logic is separate.
            setCredits(0);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/credits');
            if (response.ok) {
                const data = await response.json();
                setCredits(data.credits);
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, [isReadOnly]);

    return {
        credits,
        loading,
        refetch: fetchCredits,
        hasCredits: (credits !== null && credits > 0)
    };
}
