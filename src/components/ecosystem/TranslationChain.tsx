import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Types for Translation Stages
interface TranslationStage {
    id: string;
    label: string;
    description: string;
    actors: string[];
    ontology: "social" | "regulatory" | "technical" | "market";
}

const STAGES: TranslationStage[] = [
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
    actors?: any[]; // Using any[] to avoid circular dep issues, or import properly if possible. Ideally EcosystemActor[]
    onHoverStage?: (stageId: string | null) => void;
}

export function TranslationChain({ actors = [], onHoverStage }: TranslationChainProps) {

    // Helper to count actors by type mapping
    const getActorCount = (stageId: string) => {
        if (!actors.length) return 0;
        const lowerType = (t: string) => t.toLowerCase();

        switch (stageId) {
            case 'problem':
                return actors.filter(a => ['civilsociety', 'ngo', 'academic', 'activist', 'public'].some(t => lowerType(a.type).includes(t))).length;
            case 'regulation':
                return actors.filter(a => ['policymaker', 'government', 'legislator', 'regulator', 'court'].some(t => lowerType(a.type).includes(t))).length;
            case 'inscription':
                return actors.filter(a => ['standard', 'algorithm', 'technologist', 'expert', 'scientist'].some(t => lowerType(a.type).includes(t))).length;
            case 'delegation':
                return actors.filter(a => ['auditor', 'cloud', 'infrastructure', 'compliance', 'legal'].some(t => lowerType(a.type).includes(t))).length;
            case 'market':
                return actors.filter(a => ['startup', 'private', 'corporation', 'sme', 'user'].some(t => lowerType(a.type).includes(t))).length;
            default:
                return 0;
        }
    };

    return (
        <Card className="absolute bottom-4 right-4 w-[320px] bg-white/95 backdrop-blur-sm shadow-xl border-slate-200 z-20 overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Translation Chain</span>
                <span className="text-[9px] text-slate-400">Process View</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
                {STAGES.map((stage, i) => {
                    const count = getActorCount(stage.id);
                    return (
                        <div
                            key={stage.id}
                            className="relative group cursor-pointer"
                            onMouseEnter={() => onHoverStage?.(stage.id)}
                            onMouseLeave={() => onHoverStage?.(null)}
                        >
                            {/* Connecting Line */}
                            {i < STAGES.length - 1 && (
                                <div className="absolute left-[11px] top-6 bottom-[-8px] w-px bg-slate-200 z-0 group-hover:bg-indigo-300 transition-colors"></div>
                            )}

                            <div className="flex items-start gap-2 relative z-10 text-xs transition-transform group-hover:translate-x-1">
                                {/* Icon/Dot */}
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all
                                    ${stage.ontology === 'social' ? 'bg-amber-50 border-amber-200 text-amber-600 group-hover:bg-amber-100 group-hover:border-amber-300' : ''}
                                    ${stage.ontology === 'regulatory' ? 'bg-blue-50 border-blue-200 text-blue-600 group-hover:bg-blue-100 group-hover:border-blue-300' : ''}
                                    ${stage.ontology === 'technical' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:bg-emerald-100 group-hover:border-emerald-300' : ''}
                                    ${stage.ontology === 'market' ? 'bg-purple-50 border-purple-200 text-purple-600 group-hover:bg-purple-100 group-hover:border-purple-300' : ''}
                                `}>
                                    <span className="font-mono text-[9px] font-bold">{i + 1}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-slate-800 leading-tight group-hover:text-indigo-700">{stage.label}</span>
                                        {count > 0 && (
                                            <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 rounded-full font-mono border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200">
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{stage.description}</p>

                                    {/* Actor Tags (Static examples + Dynamic indicator if needed, sticking to static for description clarity but highlighting dynamic count) */}
                                    <div className="flex flex-wrap gap-1 mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                        {stage.actors.map(actor => (
                                            <span key={actor} className="inline-flex px-1 py-0.5 rounded-[2px] bg-slate-100 text-[8px] text-slate-600 border border-slate-200">
                                                {actor}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
