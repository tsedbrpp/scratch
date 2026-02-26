"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StudyCase } from '@/lib/study-config';
import { resolveTargets } from '@/lib/survey/targeting';

export interface FocusModeConfig {
    fieldId: string;
    required: boolean;
    // Follow up prompt for V3 bounds
    requiresBoundedDefinition?: boolean;
}

export interface EvaluationContextValue {
    // Current field pointer
    activeFieldId: string | null;
    setActiveFieldId: (id: string | null) => void;

    // Derived targets
    resolvedTargets: string[];
    isLoadingTargets: boolean;
    targetHint: string | null;
    targetError: string | null;

    // Focus Mode constraints
    focusMode: FocusModeConfig | null;
    setFocusMode: (config: FocusModeConfig | null) => void;

    // Scroller refs
    registerEvidenceRef: (evidenceId: string, element: HTMLElement | null) => void;
    jumpToTarget: (direction?: 'next' | 'first') => void;
}

const EvaluationContext = createContext<EvaluationContextValue | undefined>(undefined);

export function EvaluationProvider({
    children,
    caseData
}: {
    children: React.ReactNode;
    caseData: StudyCase | null;
}) {
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
    const [focusMode, setFocusMode] = useState<FocusModeConfig | null>(null);

    // Reset active field and focus mode when case changes
    useEffect(() => {
        setActiveFieldId(null);
        setFocusMode(null);
    }, [caseData?.id]);

    // Derived target state
    const [resolvedTargets, setResolvedTargets] = useState<string[]>([]);
    const [isLoadingTargets, setIsLoadingTargets] = useState(false);
    const [targetHint, setTargetHint] = useState<string | null>(null);
    const [targetError, setTargetError] = useState<string | null>(null);

    const evidenceRefs = useRef<Map<string, HTMLElement>>(new Map());
    const [currentTargetIndex, setCurrentTargetIndex] = useState(0);

    // Resolve targets implicitly when activeField or caseData changes
    useEffect(() => {
        let isMounted = true;
        setCurrentTargetIndex(0); // Reset cycle index on field change

        async function loadTargets() {
            if (!activeFieldId || !caseData) {
                setResolvedTargets([]);
                setTargetHint(null);
                setTargetError(null);
                return;
            }

            setIsLoadingTargets(true);
            setTargetError(null);
            try {
                const { targets, hintText, error } = await resolveTargets(activeFieldId, caseData);
                if (isMounted) {
                    setResolvedTargets(targets || []);
                    setTargetHint(hintText || null);
                    setTargetError(error || null);
                }
            } catch (err) {
                if (isMounted) {
                    setTargetError("Failed to compute evidence boundaries.");
                    setResolvedTargets([]);
                }
            } finally {
                if (isMounted) setIsLoadingTargets(false);
            }
        }

        loadTargets();

        return () => { isMounted = false; };
    }, [activeFieldId, caseData]);

    // Handle reliable scroll tracking
    const registerEvidenceRef = useCallback((evidenceId: string, element: HTMLElement | null) => {
        if (element) {
            evidenceRefs.current.set(evidenceId, element);
        } else {
            evidenceRefs.current.delete(evidenceId);
        }
    }, []);

    const jumpToTarget = useCallback((direction: 'next' | 'first' = 'first') => {
        if (!resolvedTargets.length) return;

        let indexToJump = 0;
        if (direction === 'next' && resolvedTargets.length > 1) {
            indexToJump = (currentTargetIndex + 1) % resolvedTargets.length;
            setCurrentTargetIndex(indexToJump);
        } else {
            setCurrentTargetIndex(0);
        }

        const targetId = resolvedTargets[indexToJump];
        const element = evidenceRefs.current.get(targetId);

        if (element) {
            // Scroll safely within potentially scrollable offset containers
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Apply a fleeting flash animation for accessibility/attention
            element.animate([
                { backgroundColor: 'rgba(168, 85, 247, 0.4)' }, // purple-500 fading out
                { backgroundColor: 'transparent' }
            ], { duration: 1200, easing: 'ease-out' });
        }
    }, [resolvedTargets, currentTargetIndex]);

    const value = useMemo(() => ({
        activeFieldId,
        setActiveFieldId,
        resolvedTargets,
        isLoadingTargets,
        targetHint,
        targetError,
        focusMode,
        setFocusMode,
        registerEvidenceRef,
        jumpToTarget
    }), [
        activeFieldId,
        resolvedTargets,
        isLoadingTargets,
        targetHint,
        targetError,
        focusMode,
        registerEvidenceRef,
        jumpToTarget
    ]);

    return (
        <EvaluationContext.Provider value={value}>
            {children}
        </EvaluationContext.Provider>
    );
}

export function useEvaluationContext() {
    const context = useContext(EvaluationContext);
    if (context === undefined) {
        throw new Error('useEvaluationContext must be used within an EvaluationProvider');
    }
    return context;
}
