import { Source } from '@/types';
import { StorageService } from '@/lib/storage-service';

// Read sources from Redis
export const getSources = async (userId: string): Promise<Source[]> => {
    const sources = await StorageService.get<Source[]>(userId, 'sources');
    return sources || [];
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

