import { useState, useEffect, useCallback, useMemo } from 'react';
import { SimulationNode } from '@/hooks/useForceGraph';

interface UseSimulationCacheProps<T> {
    endpoint: string;
    inputNodes: SimulationNode[];
    isExpanded: boolean;
    onSuccess?: (data: T) => void;
}

export function useSimulationCache<T>({
    endpoint,
    inputNodes,
    isExpanded,
    onSuccess
}: UseSimulationCacheProps<T>) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCached, setIsCached] = useState(false);
    const [lastFetchedHash, setLastFetchedHash] = useState<string>("");

    // Hash based on node IDs to detect meaningful map changes
    const actorsHash = useMemo(() => JSON.stringify(inputNodes.map(n => n.id).sort()), [inputNodes]);

    const isMapChanged = useMemo(() => {
        return !!data && actorsHash !== lastFetchedHash;
    }, [data, actorsHash, lastFetchedHash]);

    const fetchSimulation = useCallback(async (force = false) => {
        if (inputNodes.length === 0) {
            setError("No actors available to analyze.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actors: inputNodes.map(n => ({ id: n.id, name: n.name, type: n.type })),
                    relationships: [],
                    context: "User Ecosystem Map",
                    force
                })
            });

            if (!response.ok) throw new Error(`Analysis failed (${response.status})`);

            const result = await response.json();
            if (result.success && result.data) {
                setData(result.data);
                setIsCached(result.cached || false);
                setLastFetchedHash(actorsHash);
                if (onSuccess) onSuccess(result.data);
            } else {
                throw new Error(result.error || "Invalid response");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to generate analysis";
            console.error(`${endpoint} analysis failed:`, err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [inputNodes, actorsHash, endpoint, onSuccess]);

    // Automatic Cache Check on Map Change
    useEffect(() => {
        const checkCache = async () => {
            if (inputNodes.length === 0 || actorsHash === lastFetchedHash) return;

            try {
                const actors = inputNodes.map(n => ({ id: n.id, name: n.name, type: n.type }));
                const params = new URLSearchParams({
                    actors: JSON.stringify(actors),
                });
                const response = await fetch(`${endpoint}?${params}`);
                const result = await response.json();

                if (result.success && result.data) {
                    setData(result.data);
                    setIsCached(true);
                    setLastFetchedHash(actorsHash);
                    if (onSuccess) onSuccess(result.data);
                }
            } catch (e) {
                console.warn("Silent cache check failed", e);
            }
        };

        checkCache();
    }, [inputNodes, actorsHash, lastFetchedHash, endpoint, onSuccess]);

    // Initial Trigger
    useEffect(() => {
        if (isExpanded && !data && !isLoading) {
            fetchSimulation(false);
        }
    }, [isExpanded, data, isLoading, fetchSimulation]);

    return {
        data,
        isLoading,
        error,
        isCached,
        isMapChanged,
        actorsHash,
        fetchSimulation
    };
}
