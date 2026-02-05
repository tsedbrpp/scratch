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

    // 2. Normalize Casing (Case-Sensitivity Defense)
    const normUser = userId.toLowerCase();
    const normContext = contextId.toLowerCase();

    // 3. Prefix Injection Defense
    // Users cannot spoof system or team IDs as their own userId
    const RESERVED_PREFIXES = ['team_', 'system_', 'admin_'];
    if (RESERVED_PREFIXES.some(pre => normUser.startsWith(pre))) {
        // Log this security event (Audit Log TODO)
        logger.error(`[SECURITY] Prefix Injection Attempt: User ${userId} tried to act as reserved entity.`);
        return { allowed: false, scope: 'PERSONAL', reason: 'Invalid User Identity', statusCode: 403 };
    }

    // 4. Personal Scope Check
    if (normContext === normUser) {
        return { allowed: true, scope: 'PERSONAL', role: 'OWNER', statusCode: 200 };
    }

    // 5. Team Scope Check
    if (normContext.startsWith('team_')) {
        const teamKey = `team:${normContext}`;

        // A. Existence Check (Prevent Enumeration by masking 404 as 403)
        // We do NOT return "Team Not Found" to the user, we return "Access Denied".
        // This prevents attackers from guessing IDs to see which ones return 404 vs 403.
        const exists = await redis.exists(`${teamKey}:metadata`);
        if (!exists) {
            // Log for debugging/security but return generic error
            return { allowed: false, scope: 'TEAM', reason: 'Access Denied', statusCode: 403 };
        }

        // B. Membership Check
        // SISMEMBER is O(1) - Fast
        const isMember = await redis.sismember(`${teamKey}:members`, normUser);
        if (!isMember) {
            return { allowed: false, scope: 'TEAM', reason: 'Access Denied', statusCode: 403 };
        }

        // C. Role Retrieval
        // If they are a member, they MUST have a role. Fallback to VIEWER if missing (Fail Safe).
        const roleRaw = await redis.hget(`${teamKey}:roles`, normUser);
        const role = (roleRaw || 'VIEWER') as TeamRole;

        return { allowed: true, scope: 'TEAM', role, statusCode: 200 };
    }

    // 6. Unknown Context Type (Fail Closed)
    return { allowed: false, scope: 'PERSONAL', reason: 'Invalid Context Type', statusCode: 403 };
}
