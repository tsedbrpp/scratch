import { Source } from '@/types';
import { StorageService } from '@/lib/storage-service';
import { BASELINE_SOURCES } from '@/lib/data/baselines';

// Helper to managing explicitly deleted baselines
const getDeletedBaselines = async (userId: string): Promise<string[]> => {
    return (await StorageService.get<string[]>(userId, 'deleted_baselines')) || [];
};

const markBaselineAsDeleted = async (userId: string, id: string) => {
    const deleted = await getDeletedBaselines(userId);
    if (!deleted.includes(id)) {
        await StorageService.set(userId, 'deleted_baselines', [...deleted, id]);
    }
};

// Read sources from Redis (Atomic Hash Implementation)
export const getSources = async (userId: string): Promise<Source[]> => {
    // 1. Try to get from new Hash structure
    const sourceHash = await StorageService.getHash<Source>(userId, 'sources_v2');

    let sources: Source[] = [];

    if (sourceHash) {
        sources = Object.values(sourceHash);

        // [FIX] Ensure zombie baselines (stuck in storage but marked deleted) are filtered out
        if (sources.length > 0) {
            const deletedBaselines = await getDeletedBaselines(userId);
            if (deletedBaselines.length > 0) {
                sources = sources.filter(s => !deletedBaselines.includes(s.id));
            }
        }
    } else {
        // 2. Migration Path: Check for legacy array
        const legacySources = await StorageService.get<Source[]>(userId, 'sources');
        if (legacySources && legacySources.length > 0) {
            console.log(`[Migration] Migrating ${legacySources.length} sources to Hash for user ${userId}`);
            sources = legacySources;

            // Migrate to Hash
            for (const source of sources) {
                await StorageService.setHashField(userId, 'sources_v2', source.id, source);
            }

            // Cleanup legacy key to prevent zombie data if v2 becomes empty
            await StorageService.delete(userId, 'sources');
        } else {
            // New user or empty
            sources = [];
            // Seed if completely empty (and no legacy)
            // Note: Seeding intentionally skipped here to avoid logic duplication.
            // If seeding is needed, it should be done explicitly via addSource calls.
            // But for compatibility with old logic where we *returned empty array*, we start empty.
            // If the app relies on "if empty, add defaults", that logic belongs in the caller or here.
            // Re-adding simple seeding for empty state if needed, but Hash structure is cleaner empty.
        }
    }

    // Seeding: Ensure all BASELINE_SOURCES exist in the user's list
    // UNLESS they were explicitly deleted
    const deletedBaselines = await getDeletedBaselines(userId);

    for (const baseline of BASELINE_SOURCES) {
        if (deletedBaselines.includes(baseline.id)) {
            continue; // Skip if explicitly deleted
        }

        const exists = sources.some(s => s.id === baseline.id);
        if (!exists) {
            console.log(`[Seeding] Adding new baseline source: ${baseline.id}`);
            sources.push(baseline);
            // Persist immediately so it behaves like a normal source (editable etc)
            await StorageService.setHashField(userId, 'sources_v2', baseline.id, baseline);
        }
    }

    // Hot-patch loop: check for missing features in baselines (DR3/DR4 updates)
    // Optimization: Only patch if needed and save back to HASH specific fields
    const needsUpdate = false;
    const patchedSources = await Promise.all(sources.map(async (source) => {
        const baseline = BASELINE_SOURCES.find(b => b.id === source.id);
        let wasPatched = false;
        if (baseline) {
            const patched = { ...source };
            // Check for missing accountability_map (DR3)
            if (baseline.analysis?.accountability_map && !source.analysis?.accountability_map) {
                patched.analysis = {
                    ...patched.analysis,
                    accountability_map: baseline.analysis.accountability_map
                };
                wasPatched = true;
            }
            // Check for missing rebuttals (DR4)
            if (baseline.analysis?.rebuttals && !source.analysis?.rebuttals) {
                patched.analysis = {
                    ...patched.analysis,
                    rebuttals: baseline.analysis.rebuttals
                };
                wasPatched = true;
            }

            // Patch for missing Cultural/Logics/Legitimacy fields
            const cf = source.cultural_framing as Record<string, any> | undefined;
            if (baseline.cultural_framing && (!cf || !cf.technology_role)) {
                patched.cultural_framing = baseline.cultural_framing;
                wasPatched = true;
            }
            if (baseline.institutional_logics && !source.institutional_logics) {
                patched.institutional_logics = baseline.institutional_logics;
                wasPatched = true;
            }
            if (baseline.legitimacy_analysis && !source.legitimacy_analysis) {
                patched.legitimacy_analysis = baseline.legitimacy_analysis;
                wasPatched = true;
            }

            if (wasPatched) {
                // Atomic Patch: Save just this source back to Hash
                await StorageService.setHashField(userId, 'sources_v2', patched.id, patched);
                return patched;
            }
        }
        return source;
    }));

    return patchedSources;
};

// Save sources (Deprecated for arrays, kept for compatibility if needed elsewhere)
export const saveSources = async (userId: string, sources: Source[]): Promise<void> => {
    // Overwrite entire hash for consistency? 
    // Better to just loop and set. 
    // WARN: This is dangerous if strictly atomic is needed, but "saveSources" implies overwrite.
    for (const source of sources) {
        await StorageService.setHashField(userId, 'sources_v2', source.id, source);
    }
};

// Add a new source (Atomic)
export const addSource = async (userId: string, source: Source): Promise<Source> => {
    // Directly write to Hash. No read-modify-write race condition for the list!
    await StorageService.setHashField(userId, 'sources_v2', source.id, source);
    return source;
};

// Update a source (Atomic)
export const updateSource = async (userId: string, id: string, updates: Partial<Source>): Promise<Source | null> => {
    // 1. Get specific field (Optimized)
    // We don't have getHashField yet, but we can fetch all or just rely on the fact that we need the current state to merge.
    // Ideally we add getHashField to StorageService. 
    // For now, let's fetch all (safe enough) or use getSources().
    // Wait, getSources() does migration. We should use getSources() to be safe.

    // Better: Fetch specific source from Hash?
    // Let's rely on getSources() for now to handle migration implicitely.
    // But standard "getHash" returns a map.

    const sourceHash = await StorageService.getHash<Source>(userId, 'sources_v2');
    let currentSource = sourceHash ? sourceHash[id] : null;

    // Retry from legacy if not found (Double check migration)
    if (!currentSource) {
        const sources = await getSources(userId); // checks legacy and migrates
        currentSource = sources.find(s => s.id === id) || null;
    }

    if (!currentSource) return null;

    const updatedSource = { ...currentSource, ...updates };

    // Atomic Write
    await StorageService.setHashField(userId, 'sources_v2', id, updatedSource);

    return updatedSource;
};

// Delete a source (Atomic)
export const deleteSource = async (userId: string, id: string): Promise<boolean> => {
    // Ensure migration happened so we don't delete from empty hash while data sits in legacy
    const allSources = await getSources(userId);

    // [FIX] Check if it's a baseline source and mark as deleted
    const isBaseline = BASELINE_SOURCES.some(b => b.id === id);
    if (isBaseline) {
        await markBaselineAsDeleted(userId, id);
    }

    // [FIX] Cascade Delete: Remove any traces linked to this policy
    const childSources = allSources.filter(s => s.policyId === id);
    if (childSources.length > 0) {
        console.log(`[Cascade Delete] Removing ${childSources.length} traces associated with policy ${id}`);
        for (const child of childSources) {
            await StorageService.deleteHashField(userId, 'sources_v2', child.id);
        }
    }

    const count = await StorageService.deleteHashField(userId, 'sources_v2', id);
    return count > 0;
};

