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
        const normOwner = ownerId.toLowerCase();

        // 1. Check Quota
        const userTeams = await this.listMyTeams(normOwner);
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
            createdBy: normOwner,
            createdAt: timestamp,
            status: 'active'
        });

        // Membership
        pipeline.sadd(`${teamId}:members`, normOwner);

        // Role
        pipeline.hset(`${teamId}:roles`, {
            [normOwner]: 'OWNER'
        });

        // Add to User's list (Index)
        pipeline.sadd(`user:${normOwner}:teams`, teamId);

        await pipeline.exec();

        // 4. Audit Log
        await AuditService.log('TEAM_CREATED', normOwner, {
            targetId: teamId,
            metadata: { name }
        });

        return { success: true, teamId };
    }

    static async listMyTeams(userId: string): Promise<string[]> {
        return await redis.smembers(`user:${userId.toLowerCase()}:teams`);
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
                // In a real app, fetch user details from Clerk or user service
                // For now, return basic info
                return {
                    userId,
                    email: userId, // Placeholder - should fetch from user service
                    role: (roles[userId] || 'EDITOR') as TeamRole,
                    joinedAt: Date.now() // Placeholder - should track actual join time
                };
            })
        );

        return members;
    }

    /**
     * Check if user is a member of the team
     */
    static async isTeamMember(teamId: string, userId: string): Promise<boolean> {
        // Normalize userId to lowercase to match createTeam behavior
        const normUserId = userId.toLowerCase();
        return await redis.sismember(`${teamId}:members`, normUserId) === 1;
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
}


