import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ParsedRisk } from '@/lib/governance/resolution-utils';

interface RiskRationaleCardProps {
    risk: ParsedRisk;
    icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
}

export const RiskRationaleCard: React.FC<RiskRationaleCardProps> = ({
    risk,
    icon: Icon,
    color,
    bg,
    border
}) => {
    return (
        <div className={`rounded-md p-3 text-xs space-y-2 mt-2 border ${bg} ${border}`}>
            <h4 className={`font-bold flex items-center gap-2 ${color}`}>
                <Icon className="h-4 w-4" />
                Concept detected: {risk.type}
            </h4>
            <div>
                <span className="font-bold opacity-70 block text-[10px] uppercase tracking-wider mb-1">Discursive Mechanism</span>
                <p className="text-slate-700 leading-relaxed">
                    {risk.mechanism}
                </p>
            </div>
            {risk.evidence && (
                <div className="bg-white/60 p-2 rounded border border-black/5 mt-2">
                    <span className="font-bold opacity-70 block text-[10px] uppercase tracking-wider mb-1">Textual Evidence</span>
                    <p className="font-mono text-slate-600 text-[10px]">
                        "{risk.evidence}"
                    </p>
                </div>
            )}
        </div>
    );
};
