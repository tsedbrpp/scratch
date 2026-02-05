import React from 'react';
import { Sparkles, BadgeCheck, FileWarning, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EscalationStatus } from '@/types/escalation';
import { RiskRationaleCard } from './RiskRationaleCard';
import { parseRiskRationale } from '@/lib/governance/resolution-utils';

interface AcknowledgeStepProps {
    status: EscalationStatus;
    onContinue: () => void;
}

export const AcknowledgeStep: React.FC<AcknowledgeStepProps> = ({ status, onContinue }) => {
    const risks = [
        { type: 'Hidden Normativity', icon: FileWarning, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
        { type: 'Subtle Determinism', icon: FileWarning, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
        { type: 'Scope Creep', icon: FileWarning, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
    ];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Analysis Findings
                </h3>
                <ul className="space-y-2">
                    {status.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                            {reason}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Recurrence Warning */}
            {status.configuration?.recurrence_count && status.configuration.recurrence_count > 1 && (
                <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-900 space-y-2 mt-2">
                    <h4 className="font-bold flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-rose-600" />
                        Pattern Durability Detected
                    </h4>
                    <p>
                        This dominant logic has appeared in <strong>{status.configuration.recurrence_count} documents</strong> across the corpus.
                    </p>
                    {status.configuration.recurrence_count >= 3 && (
                        <p className="font-semibold text-rose-700">
                            ⚠ Accumulation Threshold Exceeded: HARD Escalation Active.
                        </p>
                    )}
                </div>
            )}

            {status.rationale && !status.rationale.includes('| Evidence:') && (
                <div className="text-sm text-slate-500 italic">
                    "{status.rationale}"
                </div>
            )}

            {/* Dynamic Discursive Risk Explanations */}
            {risks.map(risk => {
                const data = parseRiskRationale(risk.type, status.rationale);
                if (!data) return null;
                return <RiskRationaleCard key={risk.type} risk={data} {...risk} />;
            })}

            <Button className="w-full mt-4" onClick={onContinue}>
                Acknowledge Risks <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
};
