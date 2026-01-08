import { Source } from '@/types';
import { StorageService } from '@/lib/storage-service';
import { BASELINE_SOURCES } from '@/lib/data/baselines';

// Read sources from Redis
export const getSources = async (userId: string): Promise<Source[]> => {
    let sources = await StorageService.get<Source[]>(userId, 'sources');

    // Seed if empty
    if (!sources || sources.length === 0) {
        sources = BASELINE_SOURCES;
        await saveSources(userId, sources);
    }

    // Hot-patch loop: check for missing features in baselines (DR3/DR4 updates)
    let needsUpdate = false;
    const patchedSources = sources.map(source => {
        const baseline = BASELINE_SOURCES.find(b => b.id === source.id);
        if (baseline) {
            const patched = { ...source };
            // Check for missing accountability_map (DR3)
            if (baseline.analysis?.accountability_map && !source.analysis?.accountability_map) {
                patched.analysis = {
                    ...patched.analysis,
                    accountability_map: baseline.analysis.accountability_map
                };
                needsUpdate = true;
            }
            // Check for missing rebuttals (DR4)
            if (baseline.analysis?.rebuttals && !source.analysis?.rebuttals) {
                patched.analysis = {
                    ...patched.analysis,
                    rebuttals: baseline.analysis.rebuttals
                };
                needsUpdate = true;
            }

            // Patch for missing Cultural/Logics/Legitimacy fields
            // Aggressive check: if missing OR if specific keys are missing (handling stale partial data)
            const cf = source.cultural_framing as Record<string, any> | undefined;
            if (baseline.cultural_framing && (!cf || !cf.technology_role)) {
                patched.cultural_framing = baseline.cultural_framing;
                needsUpdate = true;
            }
            if (baseline.institutional_logics && !source.institutional_logics) {
                patched.institutional_logics = baseline.institutional_logics;
                needsUpdate = true;
            }
            if (baseline.legitimacy_analysis && !source.legitimacy_analysis) {
                patched.legitimacy_analysis = baseline.legitimacy_analysis; // Note: type mismatch might occur if LegitimacyAnalysis vs AnalysisResult
                needsUpdate = true;
            }

            return patched;
        }
        return source;
    });

    if (needsUpdate) {
        await saveSources(userId, patchedSources);
        return patchedSources;
    }

    return sources;
};

// Save sources to Redis
export const saveSources = async (userId: string, sources: Source[]): Promise<void> => {
    await StorageService.set(userId, 'sources', sources);
};

// Add a new source
export const addSource = async (userId: string, source: Source): Promise<Source> => {
    const sources = await getSources(userId);
    const newSources = [...sources, source];
    await saveSources(userId, newSources);
    return source;
};

// Update a source
export const updateSource = async (userId: string, id: string, updates: Partial<Source>): Promise<Source | null> => {
    const sources = await getSources(userId);
    const index = sources.findIndex(s => s.id === id);

    if (index === -1) return null;

    const updatedSource = { ...sources[index], ...updates };
    sources[index] = updatedSource;
    await saveSources(userId, sources);

    return updatedSource;
};

// Delete a source
export const deleteSource = async (userId: string, id: string): Promise<boolean> => {
    const sources = await getSources(userId);
    const filteredSources = sources.filter(s => s.id !== id);

    if (filteredSources.length === sources.length) return false;

    await saveSources(userId, filteredSources);
    return true;
};

