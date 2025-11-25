import { Source } from '@/types';
import { redis } from '@/lib/redis';

const SOURCES_KEY = 'sources';

// Read sources from Redis
export const getSources = async (): Promise<Source[]> => {
    try {
        const data = await redis.get(SOURCES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to fetch sources from Redis:', error);
        return [];
    }
};

// Save sources to Redis
export const saveSources = async (sources: Source[]): Promise<void> => {
    try {
        await redis.set(SOURCES_KEY, JSON.stringify(sources));
    } catch (error) {
        console.error('Failed to save sources to Redis:', error);
        throw error;
    }
};

// Add a new source
export const addSource = async (source: Source): Promise<Source> => {
    const sources = await getSources();
    const newSources = [...sources, source];
    await saveSources(newSources);
    return source;
};

// Update a source
export const updateSource = async (id: string, updates: Partial<Source>): Promise<Source | null> => {
    const sources = await getSources();
    const index = sources.findIndex(s => s.id === id);

    if (index === -1) return null;

    const updatedSource = { ...sources[index], ...updates };
    sources[index] = updatedSource;
    await saveSources(sources);

    return updatedSource;
};

// Delete a source
export const deleteSource = async (id: string): Promise<boolean> => {
    const sources = await getSources();
    const filteredSources = sources.filter(s => s.id !== id);

    if (filteredSources.length === sources.length) return false;

    await saveSources(filteredSources);
    return true;
};

