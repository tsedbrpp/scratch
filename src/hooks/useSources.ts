import { useState, useEffect } from 'react';
import { Source } from '@/types';

export function useSources() {
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const headers: HeadersInit = {};
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch('/api/sources', {
                cache: 'no-store',
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch sources');
            const data = await response.json();
            setSources(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const addSource = async (source: Source) => {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch('/api/sources', {
                method: 'POST',
                headers: headers,
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
    };

    const updateSource = async (id: string, updates: Partial<Source>) => {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch(`/api/sources/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const text = await response.text();
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.error || 'Failed to update source');
                } catch {
                    // If JSON parse fails, throw the raw text (or a summary of it)
                    console.error('Non-JSON error response:', text);
                    throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
                }
            }
            const updatedSource = await response.json();
            setSources(prev => prev.map(s => s.id === id ? updatedSource : s));
            return updatedSource;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update source');
            throw err;
        }
    };

    const deleteSource = async (id: string) => {
        try {
            const headers: HeadersInit = {};
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch(`/api/sources/${id}`, {
                method: 'DELETE',
                headers: headers
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
    };

    return {
        sources,
        isLoading,
        error,
        addSource,
        updateSource,
        deleteSource,
        refresh: fetchSources
    };
}
