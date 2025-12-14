import { redis } from '@/lib/redis';

export class StorageService {
    private static getUserKey(userId: string, key: string, namespace: string = 'storage'): string {
        return `user:${userId}:${namespace}:${key}`;
    }

    /**
     * persistent storage for user data
     */
    static async get<T>(userId: string, key: string): Promise<T | null> {
        try {
            const redisKey = this.getUserKey(userId, key);
            const data = await redis.get(redisKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`StorageService Get Error [${key}]:`, error);
            return null;
        }
    }

    static async set<T>(userId: string, key: string, value: T): Promise<void> {
        try {
            const redisKey = this.getUserKey(userId, key);
            await redis.set(redisKey, JSON.stringify(value));
        } catch (error) {
            console.error(`StorageService Set Error [${key}]:`, error);
            throw error;
        }
    }

    static async delete(userId: string, key: string): Promise<void> {
        try {
            const redisKey = this.getUserKey(userId, key);
            await redis.del(redisKey);
        } catch (error) {
            console.error(`StorageService Delete Error [${key}]:`, error);
            throw error;
        }
    }

    /**
     * Cache methods with TTL
     */
    static async getCache<T>(userId: string, key: string): Promise<T | null> {
        try {
            const redisKey = this.getUserKey(userId, key, 'cache');
            const data = await redis.get(redisKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`StorageService Cache Get Error [${key}]:`, error);
            return null;
        }
    }

    static async setCache<T>(userId: string, key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
        try {
            const redisKey = this.getUserKey(userId, key, 'cache');
            await redis.set(redisKey, JSON.stringify(value), 'EX', ttlSeconds);
        } catch (error) {
            console.error(`StorageService Cache Set Error [${key}]:`, error);
            throw error;
        }
    }
}
