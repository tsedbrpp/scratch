import { useState, useCallback, useEffect } from 'react';
import { ResistanceArtifact } from '@/types/resistance';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function useResistanceArtifacts() {
    const { currentWorkspaceId } = useWorkspace();
    const [artifacts, setArtifacts] = useState<ResistanceArtifact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getHeaders = (base: HeadersInit = {}) => {
        const headers = { ...base } as Record<string, string>;
        if (currentWorkspaceId) {
            headers['x-workspace-id'] = currentWorkspaceId;
        }
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }
        return headers;
    };

    const loadArtifacts = useCallback(async () => {
        if (!currentWorkspaceId) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/resistance/artifacts', {
                headers: getHeaders()
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
    }, [currentWorkspaceId]);

    const addArtifact = useCallback(async (artifactData: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'>) => {
        try {
            const response = await fetch('/api/resistance/artifacts', {
                method: 'POST',
                headers: getHeaders({ 'Content-Type': 'application/json' }),
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
    }, [currentWorkspaceId]);

    const deleteArtifact = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/resistance/artifacts/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
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
    }, [currentWorkspaceId]);

    // Initial load
    useEffect(() => {
        if (currentWorkspaceId) {
            loadArtifacts();
        }
    }, [loadArtifacts, currentWorkspaceId]);

    return {
        artifacts,
        isLoading,
        error,
        loadArtifacts,
        addArtifact,
        deleteArtifact
    };
}
