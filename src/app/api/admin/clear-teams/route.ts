import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { redis } from '@/lib/redis';

/**
 * Admin endpoint to clear all team data
 * DELETE /api/admin/clear-teams
 */
export async function DELETE(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[Clear Teams] Starting cleanup...');

        // Find all team-related keys
        const patterns = [
            'team_*',
            'user:*:teams',
            'invitation:*'
        ];

        let totalDeleted = 0;

        for (const pattern of patterns) {
            console.log(`[Clear Teams] Scanning pattern: ${pattern}`);
            let cursor = '0';
            const keysToDelete: string[] = [];

            do {
                const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = nextCursor;
                keysToDelete.push(...keys);
            } while (cursor !== '0');

            if (keysToDelete.length > 0) {
                console.log(`[Clear Teams] Deleting ${keysToDelete.length} keys for pattern ${pattern}`);
                await redis.del(...keysToDelete);
                totalDeleted += keysToDelete.length;
            }
        }

        console.log(`[Clear Teams] Done! Deleted ${totalDeleted} keys total`);

        return NextResponse.json({
            success: true,
            keysDeleted: totalDeleted,
            message: 'All team data cleared. Refresh your browser.'
        });
    } catch (error) {
        console.error('[Clear Teams] Error:', error);
        return NextResponse.json(
            { error: 'Failed to clear teams' },
            { status: 500 }
        );
    }
}
