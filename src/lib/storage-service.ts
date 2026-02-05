import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export class ConflictError extends Error {
    constructor(message: string, public serverTimestamp: number) {
        super(message);
        this.name = 'ConflictError';
    }
}

export class StorageService {
    private static getContextKey(contextId: string, key: string, namespace: string = 'storage'): string {
        return `user:${contextId}:${namespace}:${key}`;
    }

    private static getMetadataKey(contextId: string, key: string): string {
        return `user:${contextId}:metadata:${key}`;
    }

    /**
     * Persistent storage for user/team data.
     * contextId: Can be a 'userId' or a 'teamId' (prefixed).
     */
    static async get<T>(contextId: string, key: string): Promise<T | null> {
        try {
            const redisKey = this.getContextKey(contextId, key);
            const data = await redis.get(redisKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`StorageService Get Error [${key}]:`, error);
            return null;
        }
    }

    /**
     * Gets data along with its last updated timestamp.
     * Useful for initializing optimistic locking state on the client.
     */
    static async getWithMeta<T>(contextId: string, key: string): Promise<{ data: T | null, lastUpdated: number }> {
        try {
            const redisKey = this.getContextKey(contextId, key);
            const metaKey = this.getMetadataKey(contextId, key);

            const [data, lastUpdated] = await Promise.all([
                redis.get(redisKey),
                redis.get(metaKey)
            ]);

            return {
                data: data ? JSON.parse(data) : null,
                lastUpdated: lastUpdated ? parseInt(lastUpdated, 10) : 0
            };
        } catch (error) {
            logger.error(`StorageService GetWithMeta Error [${key}]:`, error);
            return { data: null, lastUpdated: 0 };
        }
    }

    /**
     * Saves data with optional Optimistic Locking.
     * @param expectedTimestamp - If provided, ensures server data hasn't changed since this time.
     * @throws ConflictError if a newer version exists on server.
     */
    static async set<T>(contextId: string, key: string, value: T, expectedTimestamp?: number): Promise<number> {
        try {
            const redisKey = this.getContextKey(contextId, key);
            const metaKey = this.getMetadataKey(contextId, key);
            const now = Date.now();

            // 1. Optimistic Lock Check
            if (expectedTimestamp !== undefined) {
                const currentMeta = await redis.get(metaKey);
                const serverTime = currentMeta ? parseInt(currentMeta, 10) : 0;

                // If server has a newer version than what client expects (and client expected something > 0)
                // Note: If expectedTimestamp is 0 (new file), we allow overwrite only if server is also 0.
                if (serverTime > expectedTimestamp) {
                    throw new ConflictError('Server data is newer than client version', serverTime);
                }
            }

            // 2. Atomic Save (Data + Metadata)
            const pipeline = redis.pipeline();
            pipeline.set(redisKey, JSON.stringify(value));
            pipeline.set(metaKey, now.toString()); // Persist timestamp
            await pipeline.exec();

            return now; // Return new version ID
        } catch (error) {
            if (error instanceof ConflictError) throw error;
            logger.error(`StorageService Set Error [${key}]:`, error);
            throw error;
        }
    }

    static async delete(contextId: string, key: string): Promise<void> {
        try {
            const redisKey = this.getContextKey(contextId, key);
            const metaKey = this.getMetadataKey(contextId, key);
            await redis.del(redisKey, metaKey);
        } catch (error) {
            logger.error(`StorageService Delete Error [${key}]:`, error);
            throw error;
        }
    }

    /**
     * Hash Operations for Atomic Item Management
     */
    static async getHash<T>(contextId: string, key: string): Promise<Record<string, T> | null> {
        try {
            const redisKey = this.getContextKey(contextId, key);
            const data = await redis.hgetall(redisKey);
            if (!data || Object.keys(data).length === 0) return null;

            // Parse each field value
            const result: Record<string, T> = {};
            for (const [field, value] of Object.entries(data)) {
                result[field] = JSON.parse(value);
            }
            return result;
        } catch (error) {
            logger.error(`StorageService GetHash Error [${key}]:`, error);
            return null;
        }
    }

    static async setHashField<T>(contextId: string, key: string, field: string, value: T): Promise<void> {
        try {
            const redisKey = this.getContextKey(contextId, key);
            await redis.hset(redisKey, { [field]: JSON.stringify(value) });
        } catch (error) {
            logger.error(`StorageService SetHashField Error [${key}:${field}]:`, error);
            throw error;
        }
    }

    static async deleteHashField(contextId: string, key: string, field: string): Promise<number> {
        try {
            const redisKey = this.getContextKey(contextId, key);
            return await redis.hdel(redisKey, field);
        } catch (error) {
            logger.error(`StorageService DeleteHashField Error [${key}:${field}]:`, error);
            throw error;
        }
    }

    /**
     * Cache methods with TTL
     */
    static async getCache<T>(contextId: string, key: string): Promise<T | null> {
        try {
            const redisKey = this.getContextKey(contextId, key, 'cache');
            const data = await redis.get(redisKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`StorageService Cache Get Error [${key}]:`, error);
            return null;
        }
    }

    static async setCache<T>(contextId: string, key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
        try {
            const redisKey = this.getContextKey(contextId, key, 'cache');
            await redis.set(redisKey, JSON.stringify(value), 'EX', ttlSeconds);
        } catch (error) {
            logger.error(`StorageService Cache Set Error [${key}]:`, error);
            throw error;
        }
    }

    static async deleteCache(contextId: string, key: string): Promise<void> {
        try {
            const redisKey = this.getContextKey(contextId, key, 'cache');
            await redis.del(redisKey);
        } catch (error) {
            logger.error(`StorageService Cache Delete Error [${key}]:`, error);
            throw error;
        }
    }
}
