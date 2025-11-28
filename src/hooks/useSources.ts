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
            const response = await fetch('/api/sources');
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
            const response = await fetch('/api/sources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`/api/sources/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to update source');
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
            const response = await fetch(`/api/sources/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete source');
            setSources(prev => prev.filter(s => s.id !== id));
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
