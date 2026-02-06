import { redis } from '@/lib/redis';
import { AuditService } from '@/lib/audit';
import { nanoid } from 'nanoid';
import { TeamRole } from '@/lib/auth-middleware';
import crypto from 'crypto';

export class CollaborationService {
    // ----------------------------------------------------------------------
    // Constants & Quotas
    // ----------------------------------------------------------------------
    private static readonly MAX_TEAMS_PER_USER = 5;
    private static readonly MAX_INVITES_PER_DAY = 10;
    private static readonly INVITE_EXPIRY_SECONDS = 72 * 60 * 60; // 72 Hours

    // ----------------------------------------------------------------------
    // Team Management
    // ----------------------------------------------------------------------

    /**
     * Creates a new Team Workspace with the creator as OWNER.
     */
    static async createTeam(name: string, ownerId: string): Promise<{ success: boolean; teamId?: string; error?: string }> {
        // Don't lowercase user IDs - Clerk IDs are case-sensitive

        // 1. Check Quota
        const userTeams = await this.listMyTeams(ownerId);
        if (userTeams.length >= this.MAX_TEAMS_PER_USER) {
            return { success: false, error: 'Quota Exceeded: Max 5 Teams per User.' };
        }

        // 2. Generate ID (Safe, random, prefixed)
        // Using nanoid for URL-safe, short-ish IDs, prefixed to avoid collisions
        const teamId = `team_${nanoid(12).toLowerCase()}`;

        // 3. Persist Metadata & Roles (Atomic-ish)
        const timestamp = Date.now();
        const pipeline = redis.pipeline();

        // Metadata
        pipeline.hset(`${teamId}:metadata`, {
            name,
            createdBy: ownerId,
            createdAt: timestamp,
            status: 'active'
        });

        // Membership
        pipeline.sadd(`${teamId}:members`, ownerId);

        // Role
        pipeline.hset(`${teamId}:roles`, {
            [ownerId]: 'OWNER'
        });

        // Add to User's list (Index)
        pipeline.sadd(`user:${ownerId}:teams`, teamId);

        await pipeline.exec();

        // 4. Audit Log
        await AuditService.log('TEAM_CREATED', ownerId, {
            targetId: teamId,
            metadata: { name }
        });

        return { success: true, teamId };
    }

    static async listMyTeams(userId: string): Promise<string[]> {
        return await redis.smembers(`user:${userId}:teams`);
    }

    // ----------------------------------------------------------------------
    // Invitation System
    // ----------------------------------------------------------------------

    /**
     * Generates a secure invitation token for a new member.
     */
    static async createInvitation(
        teamId: string,
        inviterId: string,
        targetEmail: string,
        role: TeamRole = 'EDITOR'
    ): Promise<{ token: string; expiresAt: number }> {

        // 1. Generate Secure Token (32 bytes hex)
        const token = crypto.randomBytes(32).toString('hex');

        // 2. Hash Token for storage (Security Best Practice)
        // We only store the hash, user gets the raw token via email (simulated return here)
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const inviteId = `invite_${nanoid(10)}`;

        const expiresAt = Date.now() + (this.INVITE_EXPIRY_SECONDS * 1000);

        // 3. Store Invitation
        await redis.setex(`invitation:${inviteId}`, this.INVITE_EXPIRY_SECONDS, JSON.stringify({
            teamId,
            inviterId,
            email: targetEmail.toLowerCase(),
            role,
            tokenHash, // Verify against this
            expiresAt
        }));

        // In a real system, we'd add this to a 'daily quota' counter here
        // await redis.incr(`quota:invites:${date}:${inviterId}`)

        await AuditService.log('MEMBER_INVITED', inviterId, {
            targetId: teamId,
            metadata: { email: targetEmail, role }
        });

        return { token: `${inviteId}:${token}`, expiresAt };
    }

    /**
     * Accepts an invitation using the composite token (id:secret).
     */
    static async acceptInvitation(userId: string, compositeToken: string): Promise<{ success: boolean; error?: string; teamId?: string }> {
        const [inviteId, secret] = compositeToken.split(':');
        if (!inviteId || !secret) return { success: false, error: 'Invalid Token Format' };

        // 1. Retrieve Invite
        const raw = await redis.get(`invitation:${inviteId}`);
        if (!raw) return { success: false, error: 'Invitation Expired or Invalid' };

        const invite = JSON.parse(raw);

        // 2. Verify Token Hash
        const providedHash = crypto.createHash('sha256').update(secret).digest('hex');
        if (providedHash !== invite.tokenHash) {
            await AuditService.log('SECURITY_ACCESS_DENIED', userId, { metadata: { reason: 'Invalid Invite Token' } });
            return { success: false, error: 'Invalid Token Secret' };
        }

        // 3. Execute Membership Add
        const pipeline = redis.pipeline();
        pipeline.sadd(`${invite.teamId}:members`, userId);
        pipeline.hset(`${invite.teamId}:roles`, { [userId]: invite.role });
        pipeline.sadd(`user:${userId}:teams`, invite.teamId);
        pipeline.del(`invitation:${inviteId}`); // Consume token (One-time use)

        await pipeline.exec();

        await AuditService.log('MEMBER_ADDED', userId, {
            targetId: invite.teamId,
            metadata: { role: invite.role, via: 'invite' }
        });


        return { success: true, teamId: invite.teamId };
    }

    /**
     * Retrieves basic Team Metadata.
     */
    static async getTeam(teamId: string): Promise<{ id: string; name: string; createdAt: number; status: string; createdBy: string; } | null> {
        const raw = await redis.hgetall(`${teamId}:metadata`);
        if (!raw || Object.keys(raw).length === 0) return null;

        return {
            id: teamId,
            name: raw.name,
            createdAt: parseInt(raw.createdAt || '0'),
            status: raw.status,
            createdBy: raw.createdBy
        };
    }

    /**
     * Alias for getTeam - used by API endpoints
     */
    static async getTeamInfo(teamId: string) {
        return this.getTeam(teamId);
    }

    /**
     * Get all team members with their roles and details
     */
    static async getTeamMembers(teamId: string): Promise<Array<{
        userId: string;
        email: string;
        role: TeamRole;
        joinedAt: number;
    }>> {
        const memberIds = await redis.smembers(`${teamId}:members`);
        const roles = await redis.hgetall(`${teamId}:roles`);

        const members = await Promise.all(
            memberIds.map(async (userId) => {
                // Fetch user details from Clerk
                let email = userId; // Fallback to userId if Clerk fetch fails

                console.log(`[getTeamMembers] Fetching user details for: ${userId}`);

                try {
                    const { clerkClient } = await import('@clerk/nextjs/server');
                    const client = await clerkClient();
                    const user = await client.users.getUser(userId);

                    console.log(`[getTeamMembers] Clerk user data:`, {
                        userId: user.id,
                        emailCount: user.emailAddresses.length,
                        primaryEmail: user.emailAddresses[0]?.emailAddress
                    });

                    email = user.emailAddresses[0]?.emailAddress || userId;
                    console.log(`[getTeamMembers] Using email: ${email}`);
                } catch (error) {
                    console.error(`[getTeamMembers] Failed to fetch user ${userId} from Clerk:`, error);
                    // Keep fallback email = userId
                }

                return {
                    userId,
                    email,
                    role: (roles[userId] || 'EDITOR') as TeamRole,
                    joinedAt: Date.now() // Placeholder - should track actual join time
                };
            })
        );

        console.log(`[getTeamMembers] Final members:`, members.map(m => ({ userId: m.userId, email: m.email })));
        return members;
    }

    /**
     * Check if user is a member of the team
     */
    static async isTeamMember(teamId: string, userId: string): Promise<boolean> {
        const members = await redis.smembers(`${teamId}:members`);
        return members.includes(userId);
    }

    /**
     * Remove a member from the team
     */
    static async removeMember(teamId: string, userId: string): Promise<void> {
        const pipeline = redis.pipeline();
        pipeline.srem(`${teamId}:members`, userId);
        pipeline.hdel(`${teamId}:roles`, userId);
        pipeline.srem(`user:${userId}:teams`, teamId);
        await pipeline.exec();

        await AuditService.log('MEMBER_REMOVED', userId, {
            targetId: teamId,
            metadata: { removedBy: 'owner' }
        });
    }

    /**
     * Get invitation details (for preview before accepting)
     */
    static async getInviteDetails(compositeToken: string): Promise<{
        teamName: string;
        inviterEmail: string;
        role: string;
    } | null> {
        const [inviteId] = compositeToken.split(':');
        if (!inviteId) return null;

        const raw = await redis.get(`invitation:${inviteId}`);
        if (!raw) return null;

        const invite = JSON.parse(raw);
        const team = await this.getTeam(invite.teamId);

        if (!team) return null;

        return {
            teamName: team.name,
            inviterEmail: invite.email,
            role: invite.role
        };
    }

    /**
     * Permanently deletes a team and all associated data.
     * Only callable by team OWNER.
     */
    static async deleteTeam(teamId: string, requesterId: string): Promise<{
        success: boolean;
        error?: string;
        members?: string[];
        teamName?: string;
    }> {
        // 1. Pre-deletion checks
        // Verify team exists and get metadata
        const metadataRaw = await redis.hgetall(`${teamId}:metadata`);
        if (!metadataRaw || Object.keys(metadataRaw).length === 0) {
            // Team already deleted - idempotent
            return { success: true, members: [] };
        }

        const teamName = metadataRaw.name;

        // Verify requester is OWNER
        const requesterRole = await redis.hget(`${teamId}:roles`, requesterId);
        if (requesterRole !== 'OWNER') {
            return { success: false, error: 'Only team owners can delete teams' };
        }

        // Get member list for notifications
        const members = await redis.smembers(`${teamId}:members`);

        // 2. Delete team-owned content using SCAN (safe for production)
        // Explicit patterns to avoid over-deletion
        const contentPatterns = [
            `${teamId}:sources`,
            `${teamId}:chunks`,
            `${teamId}:embeddings`,
            `${teamId}:analysis`,
            `${teamId}:*` // Catch-all for any other team-scoped keys
        ];

        const pipeline = redis.pipeline();

        // Use SCAN for safe iteration (non-blocking)
        for (const pattern of contentPatterns) {
            let cursor = '0';
            do {
                const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                if (keys.length > 0) {
                    keys.forEach(key => pipeline.del(key));
                }
                cursor = nextCursor;
            } while (cursor !== '0');
        }

        // 3. Delete collaboration metadata
        pipeline.del(`${teamId}:metadata`);
        pipeline.del(`${teamId}:members`);
        pipeline.del(`${teamId}:roles`);

        // 4. Remove team from all members' team lists
        members.forEach(userId => {
            pipeline.srem(`user:${userId}:teams`, teamId);
        });

        // 5. Delete pending invitations for this team
        // Note: Current invitation storage doesn't prefix by team
        // This is a known limitation - we scan all invitations
        // Future: Store as `invitation:${teamId}:${inviteId}` for efficient cleanup
        let inviteCursor = '0';
        do {
            const [nextCursor, inviteKeys] = await redis.scan(inviteCursor, 'MATCH', 'invitation:*', 'COUNT', 100);
            for (const key of inviteKeys) {
                const inviteData = await redis.get(key);
                if (inviteData) {
                    const invite = JSON.parse(inviteData);
                    if (invite.teamId === teamId) {
                        pipeline.del(key);
                    }
                }
            }
            inviteCursor = nextCursor;
        } while (inviteCursor !== '0');

        // 6. Execute deletion pipeline
        const results = await pipeline.exec();

        // Check for pipeline failures
        const failures = results?.filter(([err]) => err !== null);
        if (failures && failures.length > 0) {
            console.error('[Delete Team] Pipeline failures:', failures);
            return { success: false, error: 'Partial deletion failure - please contact support' };
        }

        // 7. Audit log
        await AuditService.log('TEAM_DELETED', requesterId, {
            targetId: teamId,
            metadata: {
                teamName,
                memberCount: members.length,
                deletedBy: requesterId
            }
        });

        return {
            success: true,
            members,
            teamName
        };
    }
}


