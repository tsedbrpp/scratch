import { Source } from '@/types';
import { redis } from '@/lib/redis';

// Read sources from Redis
export const getSources = async (userId: string): Promise<Source[]> => {
    try {
        const data = await redis.get(`user:${userId}:sources`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to fetch sources from Redis:', error);
        return [];
    }
};

// Save sources to Redis
export const saveSources = async (userId: string, sources: Source[]): Promise<void> => {
    try {
        await redis.set(`user:${userId}:sources`, JSON.stringify(sources));
    } catch (error) {
        console.error('Failed to save sources to Redis:', error);
        throw error;
    }
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

