import { useState, useCallback, useEffect } from 'react';
import { ResistanceArtifact } from '@/types/resistance';

export function useResistanceArtifacts() {
    const [artifacts, setArtifacts] = useState<ResistanceArtifact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadArtifacts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const headers: HeadersInit = {};
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch('/api/resistance/artifacts', {
                headers
            });
            const data = await response.json();
            if (data.success) {
                setArtifacts(data.artifacts);
            } else {
                setError(data.error || 'Failed to load artifacts');
            }
        } catch (err) {
            console.error('Failed to load artifacts:', err);
            setError('Failed to load artifacts');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addArtifact = useCallback(async (artifactData: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'>) => {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch('/api/resistance/artifacts', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(artifactData)
            });

            const data = await response.json();
            if (data.success) {
                setArtifacts(prev => [...prev, data.artifact]);
                return data.artifact;
            } else {
                throw new Error(data.error || 'Failed to add artifact');
            }
        } catch (err) {
            console.error('Failed to add artifact:', err);
            throw err;
        }
    }, []);

    const deleteArtifact = useCallback(async (id: string) => {
        try {
            const headers: HeadersInit = {};
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch(`/api/resistance/artifacts/${id}`, {
                method: 'DELETE',
                headers
            });

            const data = await response.json();
            if (data.success) {
                setArtifacts(prev => prev.filter(a => a.id !== id));
            } else {
                throw new Error(data.error || 'Failed to delete artifact');
            }
        } catch (err) {
            console.error('Failed to delete artifact:', err);
            throw err;
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadArtifacts();
    }, [loadArtifacts]);

    return {
        artifacts,
        isLoading,
        error,
        loadArtifacts,
        addArtifact,
        deleteArtifact
    };
}
