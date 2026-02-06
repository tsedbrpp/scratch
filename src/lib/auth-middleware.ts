import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

// --------------------------------------------------------------------------
// Roles & Permissions
// --------------------------------------------------------------------------

export type TeamRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface AccessResult {
    allowed: boolean;
    scope: 'PERSONAL' | 'TEAM';
    role?: TeamRole;
    reason?: string;
    statusCode: number; // 200, 400, 403
}

// --------------------------------------------------------------------------
// Security Logic
// --------------------------------------------------------------------------

/**
 * Validates whether a User has access to a specific Context (Personal or Team).
 * HARDENED: Prevents prefix injection, ID enumeration, and case-sensitivity attacks.
 * 
 * Usage:
 * const access = await validateWorkspaceAccess(userId, contextId);
 * if (!access.allowed) return NextResponse.json({ error: access.reason }, { status: access.statusCode });
 */
export async function validateWorkspaceAccess(
    userId: string,
    contextId: string
): Promise<AccessResult> {

    // 1. Input Validation (Fail Closed)
    if (!userId || !contextId) {
        return { allowed: false, scope: 'PERSONAL', reason: 'Invalid ID inputs', statusCode: 400 };
    }

    // 2. Prefix Injection Defense
    // Users cannot spoof system or team IDs as their own userId
    const RESERVED_PREFIXES = ['team_', 'system_', 'admin_'];
    if (RESERVED_PREFIXES.some(pre => userId.toLowerCase().startsWith(pre))) {
        // Log this security event (Audit Log TODO)
        logger.error(`[SECURITY] Prefix Injection Attempt: User ${userId} tried to act as reserved entity.`);
        return { allowed: false, scope: 'PERSONAL', reason: 'Invalid User Identity', statusCode: 403 };
    }

    // 3. Determine Scope
    if (contextId.startsWith('team_')) {
        // Team Workspace Access
        const isMember = await redis.sismember(`${contextId}:members`, userId);

        if (!isMember) {
            return { allowed: false, scope: 'TEAM', reason: 'Access Denied', statusCode: 403 };
        }

        // Fetch Role
        const role = await redis.hget(`${contextId}:roles`, userId) as TeamRole | null;

        return {
            allowed: true,
            scope: 'TEAM',
            role: role || 'VIEWER',
            statusCode: 200
        };
    } else {
        // Personal Workspace Access
        if (contextId === userId) {
            return { allowed: true, scope: 'PERSONAL', role: 'OWNER', statusCode: 200 };
        } else {
            return { allowed: false, scope: 'PERSONAL', reason: 'Access Denied', statusCode: 403 };
        }
    }
}
