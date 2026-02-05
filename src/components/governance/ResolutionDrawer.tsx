import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EscalationStatus, ReassemblyAction, DeferralReason } from '@/types/escalation';

// Extracted Sub-components
import { HealthyStateView } from './resolution-drawer/HealthyStateView';
import { AcknowledgeStep } from './resolution-drawer/AcknowledgeStep';
import { PathwayStep } from './resolution-drawer/PathwayStep';
import { ActionStep } from './resolution-drawer/ActionStep';

// Extracted Utilities
import { getStatusColor, getStatusText } from '@/lib/governance/resolution-utils';

interface ResolutionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    status: EscalationStatus | null;
    onReassemblyAction: (action: ReassemblyAction) => void;
}

type Step = 'ACKNOWLEDGE' | 'PATHWAY' | 'ACTION';

export function ResolutionDrawer({ isOpen, onClose, status, onReassemblyAction }: ResolutionDrawerProps) {
    const [step, setStep] = useState<Step>('ACKNOWLEDGE');
    const [pathway, setPathway] = useState<'MITIGATION' | 'JUSTIFICATION' | 'DEFERRAL'>('MITIGATION');

    // Form State
    const [rationale, setRationale] = useState('');
    const [mitigationId, setMitigationId] = useState<string>('');
    const [deferralReason, setDeferralReason] = useState<DeferralReason>('STRUCTURAL_LIMIT');

    if (!isOpen || !status) return null;

    const handleSubmit = () => {
        const timestamp = Date.now();
        let action: ReassemblyAction;

        if (pathway === 'MITIGATION') {
            action = { type: 'MITIGATION', strategyId: mitigationId || 'MITIGATION_CUSTOM', rationale, timestamp };
        } else if (pathway === 'DEFERRAL') {
            action = { type: 'DEFERRAL', reason: deferralReason, rationale, timestamp };
        } else {
            action = { type: 'MITIGATION', strategyId: 'MITIGATION_CUSTOM', rationale: `[Justification] ${rationale}`, timestamp };
        }

        onReassemblyAction(action);
        onClose();
        // Reset state
        setStep('ACKNOWLEDGE');
        setRationale('');
        setMitigationId('');
    };

    return (
        <div className={cn(
            "fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 z-50 flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${getStatusColor(status.level)} bg-opacity-10`}>
                <div className="flex items-center gap-2">
                    <ShieldAlert className={`h-5 w-5 ${getStatusText(status.level)}`} />
                    <h2 className="font-bold text-slate-800">Risk Resolution</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">

                {/* Progress Stepper */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-6">
                    <span className={cn(step === 'ACKNOWLEDGE' && "text-indigo-600")}>1. Acknowledge</span>
                    <span className="h-px w-8 bg-slate-200" />
                    <span className={cn(step === 'PATHWAY' && "text-indigo-600")}>2. Pathway</span>
                    <span className="h-px w-8 bg-slate-200" />
                    <span className={cn(step === 'ACTION' && "text-indigo-600")}>3. Action</span>
                </div>

                {/* Sub-component Views */}
                {status.level === 'NONE' ? (
                    <HealthyStateView />
                ) : (
                    <>
                        {step === 'ACKNOWLEDGE' && (
                            <AcknowledgeStep
                                status={status}
                                onContinue={() => setStep('PATHWAY')}
                            />
                        )}

                        {step === 'PATHWAY' && (
                            <PathwayStep
                                pathway={pathway}
                                setPathway={setPathway}
                                onContinue={() => setStep('ACTION')}
                                onBack={() => setStep('ACKNOWLEDGE')}
                            />
                        )}

                        {step === 'ACTION' && (
                            <ActionStep
                                pathway={pathway}
                                status={status}
                                rationale={rationale}
                                setRationale={setRationale}
                                mitigationId={mitigationId}
                                setMitigationId={setMitigationId}
                                deferralReason={deferralReason}
                                setDeferralReason={setDeferralReason}
                                onSubmit={handleSubmit}
                                onBack={() => setStep('PATHWAY')}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
