import { AnalysisResult, Source } from '@/types';
import { EscalationConfiguration } from '@/types/escalation';

/**
 * Service to track the persistence/durability of logic patterns across the corpus.
 * This operationalizes the requirement that "Recurring High-Risk Patterns" trigger 
 * HARD escalation (Blocking), whereas isolated instances may be SOFT/MEDIUM.
 */

export interface RecurrenceContext {
    recurrence_count: number;
    similar_process_ids: string[]; // List of source IDs with similar patterns
    corpus_size: number;
}

export const RecurrenceService = {
    /**
     * Scans the corpus to find how many times the current analysis's "Dominant Logic"
     * has appeared in other documents with HIGH blindspot intensity.
     */
    calculateRecurrence: (
        currentAnalysis: AnalysisResult,
        allSources: Source[],
        currentSourceId?: string
    ): RecurrenceContext => {

        // 1. Identify the pattern to track
        // We track "High Blindspot" + "Dominant Logic"
        const currentIntensity = currentAnalysis.assemblage_analysis?.blindspot_intensity;
        const currentLogic = currentAnalysis.assemblage_analysis?.dominant_logic;

        if (currentIntensity !== 'High' || !currentLogic) {
            return { recurrence_count: 0, similar_process_ids: [], corpus_size: allSources.length };
        }

        // 2. Scan corpus
        const similarSources = allSources.filter(source => {
            // Exclude self
            if (source.id === currentSourceId) return false;

            const analysis = source.analysis;
            if (!analysis || !analysis.assemblage_analysis) return false;

            // Match criteria: High Intensity AND Same Dominant Logic (fuzzy match)
            const isHigh = analysis.assemblage_analysis.blindspot_intensity === 'High';
            const isSameLogic = analysis.assemblage_analysis.dominant_logic?.toLowerCase().includes(currentLogic.toLowerCase())
                || currentLogic.toLowerCase().includes(analysis.assemblage_analysis.dominant_logic?.toLowerCase() || '');

            return isHigh && isSameLogic;
        });

        // 3. Return context
        // Count includes self (so if found 2 others, count is 3)
        return {
            recurrence_count: similarSources.length + 1,
            similar_process_ids: similarSources.map(s => s.id),
            corpus_size: allSources.length
        };
    }
};
