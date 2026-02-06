/**
 * Admin script to clear all team data from Redis
 * Run with: node --loader ts-node/esm scripts/clear-teams.ts
 */

import { createClient } from 'redis';

async function clearTeams() {
    const redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    await redis.connect();

    console.log('🔍 Scanning for team-related keys...');

    // Find all team-related keys
    const patterns = [
        'team_*',
        'user:*:teams',
        'invitation:*'
    ];

    let totalDeleted = 0;

    for (const pattern of patterns) {
        console.log(`\n📋 Scanning pattern: ${pattern}`);
        let cursor = '0';
        const keysToDelete: string[] = [];

        do {
            const result = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });

            cursor = result.cursor.toString();
            keysToDelete.push(...result.keys);
        } while (cursor !== '0');

        if (keysToDelete.length > 0) {
            console.log(`🗑️  Deleting ${keysToDelete.length} keys...`);
            await redis.del(keysToDelete);
            totalDeleted += keysToDelete.length;
        } else {
            console.log('   No keys found');
        }
    }

    console.log(`\n✅ Done! Deleted ${totalDeleted} keys total`);
    console.log('🔄 Refresh your browser to see the changes');

    await redis.quit();
}

clearTeams().catch(console.error);
