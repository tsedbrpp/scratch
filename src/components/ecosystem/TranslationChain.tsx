import React from 'react';
import { Card } from '@/components/ui/card';
import { EcosystemActor, TranslationStage } from '@/types/ecosystem';
import { SimulationService } from '@/lib/simulation-service';

// Types for Translation Stages (extended)
/* ... import from types now ... */

const STAGES_TEMPLATE: TranslationStage[] = [
    {
        id: "problem",
        label: "Problem Articulation",
        description: "Social demand / Rights risks",
        actors: ["Civil Society", "NGOs"],
        ontology: "social"
    },
    {
        id: "regulation",
        label: "Regulatory Translation",
        description: "High-Risk Categories",
        actors: ["Policymakers", "EU Parliament"],
        ontology: "regulatory"
    },
    {
        id: "inscription",
        label: "Technical Inscription",
        description: "Standards & Risk Systems",
        actors: ["Standards Bodies", "Technologists"],
        ontology: "technical"
    },
    {
        id: "delegation",
        label: "Operational Delegation",
        description: "Compliance Artifacts",
        actors: ["Auditors", "Cloud Providers"],
        ontology: "technical"
    },
    {
        id: "market",
        label: "Market Outcome",
        description: "Barriers & Liability",
        actors: ["Startups", "Users"],
        ontology: "market"
    }
];

interface TranslationChainProps {
    actors?: EcosystemActor[];
    onHoverStage?: (stageId: string | null) => void;
}

export function TranslationChain({ actors = [], onHoverStage }: TranslationChainProps) {

    // Calculate Fidelity Live
    const hydratedStages = React.useMemo(() => {
        return SimulationService.calculateChainFidelity(STAGES_TEMPLATE, actors);
    }, [actors]);

    const getLineColor = (fidelity: number | undefined) => {
        if (fidelity === undefined) return "bg-slate-200";
        if (fidelity < 0.5) return "bg-red-400"; // High Loss
        if (fidelity < 0.8) return "bg-orange-300"; // Medium Loss
        return "bg-emerald-300"; // High Fidelity
    };

    return (
        <Card className="absolute bottom-4 right-4 w-[320px] bg-white/95 backdrop-blur-sm shadow-xl border-slate-200 z-20 overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Translation Chain</span>
                <span className="text-[9px] text-slate-400">Process & Fidelity</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
                {hydratedStages.map((stage, i) => {
                    const count = stage.active_actor_count || 0;
                    // Fidelity is the score of THIS stage relative to PREVIOUS
                    // So line LEADING TO this stage should reflect this stage's score? 
                    // Actually line connects i and i+1. So line from i to i+1 should reflect i+1's fidelity score.
                    const nextStage = hydratedStages[i + 1];
                    const lineColor = nextStage ? getLineColor(nextStage.fidelity_score) : "bg-slate-200";

                    return (
                        <div
                            key={stage.id}
                            className="relative group cursor-pointer"
                            onMouseEnter={() => onHoverStage?.(stage.id)}
                            onMouseLeave={() => onHoverStage?.(null)}
                        >
                            {/* Connecting Line */}
                            {i < hydratedStages.length - 1 && (
                                <div
                                    className={`absolute left-[11px] top-6 bottom-[-8px] w-[2px] z-0 transition-colors ${lineColor}`}
                                    title={nextStage?.betrayal_type !== "None" ? `Loss Detected: ${nextStage?.betrayal_type}` : "Stable Translation"}
                                ></div>
                            )}

                            <div className="flex items-start gap-2 relative z-10 text-xs transition-transform group-hover:translate-x-1">
                                {/* Icon/Dot */}
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all
                                    ${stage.ontology === 'social' ? 'bg-amber-50 border-amber-200 text-amber-600' : ''}
                                    ${stage.ontology === 'regulatory' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}
                                    ${stage.ontology === 'technical' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : ''}
                                    ${stage.ontology === 'market' ? 'bg-purple-50 border-purple-200 text-purple-600' : ''}
                                `}>
                                    <span className="font-mono text-[9px] font-bold">{i + 1}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-slate-800 leading-tight group-hover:text-indigo-700">{stage.label}</span>
                                        <div className="flex gap-1">
                                            {stage.betrayal_type && stage.betrayal_type !== "None" && (
                                                <span className="text-[8px] px-1 py-0.5 rounded bg-red-100 text-red-600 font-bold uppercase tracking-wider">
                                                    {stage.betrayal_type}
                                                </span>
                                            )}
                                            {count > 0 && (
                                                <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 rounded-full font-mono border border-slate-200">
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{stage.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
