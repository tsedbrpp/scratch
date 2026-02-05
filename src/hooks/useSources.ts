import { useState, useEffect, useCallback, useMemo } from 'react';
import { Source } from '@/types';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function useSources() {
    const { currentWorkspaceId } = useWorkspace();
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getHeaders = useCallback((base: HeadersInit = {}) => {
        const headers = { ...base } as Record<string, string>;
        if (currentWorkspaceId) {
            headers['x-workspace-id'] = currentWorkspaceId;
        }
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }
        return headers;
    }, [currentWorkspaceId]);

    const fetchSources = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/sources', {
                cache: 'no-store',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch sources');
            const data = await response.json();
            setSources(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        if (currentWorkspaceId) {
            fetchSources();
        }
    }, [currentWorkspaceId, fetchSources]);

    const addSource = useCallback(async (source: Source) => {
        try {
            const response = await fetch('/api/sources', {
                method: 'POST',
                headers: getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(source),
            });
            if (!response.ok) throw new Error('Failed to add source');
            const newSource = await response.json();
            setSources(prev => [...prev, newSource]);
            return newSource;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add source');
            throw err;
        }
    }, [getHeaders]);

    const updateSource = useCallback(async (id: string, updates: Partial<Source>) => {
        try {
            const response = await fetch(`/api/sources/${id}`, {
                method: 'PUT',
                headers: getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const text = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(text);
                } catch {
                    console.error('Non-JSON error response:', text);
                    throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
                }
                throw new Error(errorData.error || 'Failed to update source');
            }
            const updatedSource = await response.json();
            setSources(prev => prev.map(s => s.id === id ? updatedSource : s));
            return updatedSource;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update source');
            throw err;
        }
    }, [getHeaders]);

    const deleteSource = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/sources/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            // If successful OR if 404 (already deleted), update state
            if (response.ok || response.status === 404) {
                setSources(prev => prev.filter(s => s.id !== id));
            } else {
                throw new Error('Failed to delete source');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete source');
            throw err;
        }
    }, [getHeaders]);

    return useMemo(() => ({
        sources,
        isLoading,
        error,
        addSource,
        updateSource,
        deleteSource,
        refresh: fetchSources
    }), [sources, isLoading, error, addSource, updateSource, deleteSource, fetchSources]);
}
