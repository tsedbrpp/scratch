import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export type AuditEventType =
    | 'SECURITY_ACCESS_DENIED'
    | 'SECURITY_PREFIX_INJECTION'
    | 'TEAM_CREATED'
    | 'TEAM_DELETED'
    | 'MEMBER_INVITED'
    | 'MEMBER_ADDED'
    | 'MEMBER_REMOVED'
    | 'GOVERNANCE_OVERRIDE';

export interface AuditEvent {
    eventId: string;
    type: AuditEventType;
    actorId: string; // Real User ID
    targetId?: string; // Context/Team/Resource ID
    timestamp: number;
    metadata?: Record<string, any>;
    ipAddress?: string; // If available
}

export class AuditService {
    private static readonly STREAM_KEY = 'audit:events:stream';

    /**
     * Log a tamper-evident record of a system event.
     */
    static async log(
        type: AuditEventType,
        actorId: string,
        data: { targetId?: string, metadata?: Record<string, any>, ip?: string }
    ): Promise<string> {
        const eventId = crypto.randomUUID();
        const event: AuditEvent = {
            eventId,
            type,
            actorId,
            targetId: data.targetId,
            timestamp: Date.now(),
            metadata: data.metadata,
            ipAddress: data.ip
        };

        try {
            // Store simple JSON for MVP. 
            // In Phase 6 (SQL), this moves to a proper table.
            await redis.lpush('audit:events:log', JSON.stringify(event));

            // Console output for vercel logs
            logger.audit(`${type} | Actor: ${actorId} | Target: ${data.targetId || 'N/A'}`);

            return eventId;
        } catch (error) {
            logger.error('[AUDIT FAILED] Could not persist audit log:', error);
            // We do NOT throw here to prevent bringing down the main app flow,
            // but in high-security mode, we might want to fail-closed.
            return 'error-logging-event';
        }
    }

    static async getRecentLogs(limit = 50): Promise<AuditEvent[]> {
        const raws = await redis.lrange('audit:events:log', 0, limit - 1);
        return raws.map(s => JSON.parse(s));
    }
}
