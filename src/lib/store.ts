import fs from 'fs/promises';
import path from 'path';
import { Source } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'sources.json');

// Ensure data directory exists
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

// Read sources from file
export const getSources = async (): Promise<Source[]> => {
    await ensureDataDir();
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is empty, return empty array
        return [];
    }
};

// Save sources to file
export const saveSources = async (sources: Source[]): Promise<void> => {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(sources, null, 2), 'utf-8');
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
