import { useState, useEffect, useCallback } from 'react';
import { AnalysisResult, Source } from '../types';
import { EscalationStatus, ReassemblyAction } from '../types/escalation';
import { evaluateEscalation } from '../lib/governance/escalationRules';
import { RecurrenceService } from '../services/governance/recurrence-service';

interface UseEscalationReturn {
    status: EscalationStatus | null;
    isAnalyzing: boolean;
    reEvaluate: () => Promise<void>;
    addReassemblyAction: (action: ReassemblyAction) => void;
    hasUnresolvedRisks: boolean;
    setManualStatus: (status: EscalationStatus | null) => void; // [DEV] For testing state transitions
}

export function useEscalation(analysis: AnalysisResult | undefined, allSources: Source[] = []): UseEscalationReturn {
    const [status, setStatus] = useState<EscalationStatus | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const runCheck = useCallback(async (currentAnalysis: AnalysisResult) => {
        setIsAnalyzing(true);
        try {
            // Artificial delay for "Health Check" feel (remove in production if strict)
            await new Promise(resolve => setTimeout(resolve, 600));

            // Phase 3: Calculate Recurrence Context
            // We assume the current source ID is not easily available here without passing it, 
            // but RecurrenceService handles filtering if we pass ID. 
            // For now, we'll just pass the full list and let the service handle logic.
            //Ideally analysis object might have sourceId, but type doesn't guarantee it.
            // We will pass undefined for excludeId which means self-matches count (recurrence >= 1 is always true for self)
            // Rules engine checks recurrence >= 3.

            const recurrenceData = RecurrenceService.calculateRecurrence(currentAnalysis, allSources);
            const context = {
                recurrence_count: recurrenceData.recurrence_count,
                corpusSize: recurrenceData.corpus_size
            };

            const result = await evaluateEscalation(currentAnalysis, context);
            setStatus(prev => {
                // Merge actions from previous state OR the analysis object (persistence)
                const actions = prev?.actions?.length ? prev.actions : (currentAnalysis.escalation_status?.actions || []);

                // Determine effective status based on actions
                let effectiveStatus = result.status;
                if (actions.some(a => a.type === 'MITIGATION')) {
                    effectiveStatus = 'RESOLVED';
                } else if (actions.some(a => a.type === 'DEFERRAL')) {
                    effectiveStatus = 'DEFERRED';
                }

                return {
                    ...result,
                    status: effectiveStatus,
                    actions: actions
                };
            });
        } catch (error) {
            console.error("Escalation check failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [allSources]);

    useEffect(() => {
        if (analysis) {
            runCheck(analysis);
        }
    }, [analysis, runCheck]);

    const reEvaluate = useCallback(async () => {
        if (analysis) {
            await runCheck(analysis);
        }
    }, [analysis, runCheck]);

    const addReassemblyAction = useCallback((action: ReassemblyAction) => {
        setStatus(prev => {
            if (!prev) return null;
            const newActions = [...prev.actions, action];

            // Determine if this action resolves the escalation
            let newStatus = prev.status;
            if (action.type === 'MITIGATION') {
                newStatus = 'RESOLVED';
            } else if (action.type === 'DEFERRAL') {
                newStatus = 'DEFERRED';
            }

            return {
                ...prev,
                actions: newActions,
                status: newStatus
            };
        });
    }, []);

    const hasUnresolvedRisks = status?.level !== 'NONE' && status?.status === 'DETECTED';

    return {
        status,
        isAnalyzing,
        reEvaluate,
        addReassemblyAction,
        hasUnresolvedRisks,
        setManualStatus: setStatus // Expose for dev/testing
    };
}
