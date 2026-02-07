import { StorageService } from '@/lib/storage-service';

export interface AICallLog {
    id: string;
    timestamp: string;
    userId: string;
    analysisMode: string;

    // Request
    promptId: string;
    promptVersion: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPromptHash?: string;
    systemPromptPreview: string;  // First 500 chars
    userContentPreview: string;   // First 500 chars

    // Response
    rawResponsePreview: string;   // First 1000 chars
    tokenUsage?: { prompt: number; completion: number; total: number };
    latencyMs: number;
    finishReason?: string;

    // Result
    parseSuccess: boolean;
    errorMessage?: string;
}

const STORAGE_KEY_PREFIX = 'ai_audit_log:';
const USER_LOGS_INDEX_PREFIX = 'user_audit_logs:';

export async function logAICall(log: AICallLog): Promise<void> {
    try {
        // 1. Store the individual log entry
        await StorageService.set(log.userId, `${STORAGE_KEY_PREFIX}${log.id}`, log);

        // 2. Add to user's index of logs (simplified for now, ideally this would be a list)
        // Since StorageService is key-value, we can't easily append to a list without reading it first.
        // For this implementation, we will mainly rely on the individual log storage.
        // A full implementation would use a proper DB or Redis list.

        console.log(`[AI-AUDIT] Logged call ${log.id} for user ${log.userId} (Prompt: ${log.promptId} v${log.promptVersion})`);

    } catch (error) {
        console.error('[AI-AUDIT] Failed to log AI call:', error);
        // Don't throw, we don't want to break the analysis flow if logging fails
    }
}

export async function getAICallLog(userId: string, logId: string): Promise<AICallLog | null> {
    return await StorageService.get<AICallLog>(userId, `${STORAGE_KEY_PREFIX}${logId}`);
}
