import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from './useDemoMode';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function useCredits() {
    const { currentWorkspaceId } = useWorkspace();
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const { isReadOnly } = useDemoMode();

    const fetchCredits = useCallback(async () => {
        if (isReadOnly) {
            setCredits(0);
            setLoading(false);
            return;
        }

        try {
            const headers: HeadersInit = {};
            if (currentWorkspaceId) {
                headers['x-workspace-id'] = currentWorkspaceId;
            }

            const response = await fetch('/api/credits', { headers });
            if (response.ok) {
                const data = await response.json();
                setCredits(data.credits);
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        } finally {
            setLoading(false);
        }
    }, [isReadOnly, currentWorkspaceId]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    return {
        credits,
        loading,
        refetch: fetchCredits,
        hasCredits: (credits !== null && credits > 0)
    };
}
