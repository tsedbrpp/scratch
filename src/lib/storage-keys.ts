/**
 * Storage key constants and helpers to avoid magic strings
 */

export const STORAGE_KEYS = {
    // Ecosystem keys
    ECOSYSTEM_ACTIVE_POLICY: 'ecosystem_active_policy_id',
    ECOSYSTEM_ACTORS: (policyId: string | null) =>
        policyId ? `ecosystem_actors_${policyId}` : 'ecosystem_actors_temp',
    ECOSYSTEM_CONFIGURATIONS: (policyId: string | null) =>
        policyId ? `ecosystem_configurations_${policyId}` : 'ecosystem_configurations_temp',
    ECOSYSTEM_SELECTED_ACTOR: (policyId: string | null) =>
        policyId ? `ecosystem_selected_actor_id_${policyId}` : 'ecosystem_selected_actor_id_temp',
    ECOSYSTEM_ABSENCE_ANALYSIS: (policyId: string | null) =>
        policyId ? `ecosystem_absence_analysis_${policyId}` : 'ecosystem_absence_analysis_temp',

    // Resistance keys
    RESISTANCE_ARTIFACTS: 'resistance_artifacts',

    // Reflexivity keys
    REFLEXIVITY_POSITIONALITY: 'reflexivity_positionality',
    REFLEXIVITY_LOGS: 'reflexivity_logs',

    // Sources keys
    SOURCES: 'sources',

    // Prompt overrides
    PROMPT_OVERRIDE: (promptId: string) => `prompt_override:${promptId}`,
} as const;

/**
 * Helper to generate cache keys consistently
 */
export function generateCacheKey(userId: string, operation: string, params: Record<string, any>): string {
    const paramString = Buffer.from(JSON.stringify(params)).toString('base64');
    return `user:${userId}:${operation}:${paramString}`;
}
