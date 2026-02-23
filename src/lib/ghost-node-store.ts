import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { GhostNode } from '@/types';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class GhostNodeStore {
    /**
     * Generates a context-aware SHA-256 fingerprint for a ghost node.
     */
    static generateFingerprint(name: string, policyId: string, themes?: string[]): string {
        try {
            const normalizedName = name.trim().toLowerCase();
            const themesString = themes ? [...themes].map(t => t.trim().toLowerCase()).sort().join('|') : '';
            const rawData = `${policyId}:${normalizedName}:${themesString}`;
            return createHash('sha256').update(rawData, 'utf8').digest('hex');
        } catch (error) {
            logger.error(`Error generating fingerprint for GhostNode: ${name}`, error);
            throw new Error('Failed to generate GhostNode fingerprint');
        }
    }

    private static getRedisKey(contextId: string, policyId: string): string {
        return `user:${contextId}:storage:ghost_nodes_${policyId}`;
    }

    /**
     * Atomically appends a GhostNode to the unified catalog if its fingerprint does not already exist.
     * Returns true if inserted, false if it already existed.
     */
    static async createGhostNode(contextId: string, node: Omit<GhostNode, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<boolean> {
        try {
            const redisKey = this.getRedisKey(contextId, node.policyId);
            const now = new Date().toISOString();

            const fullNode: GhostNode = {
                ...node,
                id: uuidv4(),
                status: 'proposed',
                createdAt: now,
                updatedAt: now,
            };

            // Use HSET instead of HSETNX to upsert, ensuring new fields (like discourseThreats) are preserved
            const result = await redis.hset(redisKey, fullNode.fingerprint, JSON.stringify(fullNode));
            return result === 1 || result === 0;
        } catch (error) {
            logger.error(`Failed to create ghost node for policy ${node.policyId}`, error);
            throw error;
        }
    }

    /**
     * Retrieves all ghost nodes for a given policy.
     */
    static async getGhostNodes(contextId: string, policyId: string): Promise<GhostNode[]> {
        try {
            const redisKey = this.getRedisKey(contextId, policyId);
            const data = await redis.hgetall(redisKey);

            if (!data || Object.keys(data).length === 0) return [];

            return Object.values(data).map(val => {
                if (typeof val === 'string') {
                    return JSON.parse(val) as GhostNode;
                }
                return val as unknown as GhostNode;
            });
        } catch (error) {
            logger.error(`Failed to retrieve ghost nodes for policy ${policyId}`, error);
            return [];
        }
    }
}
