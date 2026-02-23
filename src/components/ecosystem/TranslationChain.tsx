import React from 'react';
import { Card } from '@/components/ui/card';
import { EcosystemActor, TranslationStage } from '@/types/ecosystem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types for Translation Stages (extended)
const STAGES_TEMPLATE: (TranslationStage & { match_types: EcosystemActor['type'][], tooltip: string })[] = [
    {
        id: "problem",
        label: "Problem Articulation",
        ant_label: "Problematization", // [NEW]
        description: "Social demand / Rights risks",
        actors: ["Civil Society", "NGOs"],
        match_types: ["Civil Society", "Academic"],
        ontology: "social",
        tooltip: "Problematization: An actor defines a problem and establishes themselves as an 'Obligatory Passage Point' that others must negotiate with."
    },
    {
        id: "regulation",
        label: "Regulatory Translation",
        ant_label: "Interessement", // [NEW]
        description: "High-Risk Categories",
        actors: ["Policymakers", "EU Parliament"],
        match_types: ["Policymaker", "LegalObject"],
        ontology: "regulatory",
        tooltip: "Interessement: Actors try to lock others into place by imposing devices (laws, categories) that block alternative alliances."
    },
    {
        id: "inscription",
        label: "Technical Inscription",
        ant_label: "Enrollment", // [NEW]
        description: "Standards & Risk Systems",
        actors: ["Standards Bodies", "Technologists"],
        match_types: ["Algorithm", "Dataset", "Infrastructure"],
        ontology: "technical",
        tooltip: "Enrollment: The successful outcome of interessement. Roles are defined, accepted, and inscribed into technical systems (code, standards)."
    },
    {
        id: "delegation",
        label: "Operational Delegation",
        ant_label: "Mobilization", // [NEW]
        description: "Compliance Artifacts",
        actors: ["Auditors", "Cloud Providers"],
        match_types: ["AlgorithmicAgent", "Infrastructure"],
        ontology: "technical",
        tooltip: "Mobilization: The network is stable. Spokespersons (or devices) can now speak for the silent masses (users, data subjects) without contradiction."
    },
    {
        id: "market",
        label: "Market Outcome",
        ant_label: "Black Boxing", // [NEW]
        description: "Barriers & Liability",
        actors: ["Startups", "Users"],
        match_types: ["PrivateTech", "PrivateTech"], // private tech is market
        ontology: "market",
        tooltip: "Black Boxing: The complex network of alliances becomes invisible. It serves as a single, stable input/output object in the economy."
    }
];

interface TranslationChainProps {
    actors?: EcosystemActor[];
    onHoverStage?: (stageId: string | null) => void;
}

export const TranslationChain = React.memo(function TranslationChain({ actors = [], onHoverStage }: TranslationChainProps) {

    // Draggable Logic
    // ... (unchanged) ...
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const isDragging = React.useRef(false);
    const dragStart = React.useRef({ x: 0, y: 0 });
    const startPos = React.useRef({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setPosition({
                x: startPos.current.x + dx,
                y: startPos.current.y + dy
            });
        };
        const handleMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { ...position };
    };

    // Calculate Presence Live
    const hydratedStages = React.useMemo(() => {
        const { isActorRelevantToStage } = require('@/lib/ecosystem-utils');
        return STAGES_TEMPLATE.map(stage => {
            // Only count actors that are NOT hidden
            const count = actors.filter(a => !a.isHidden && isActorRelevantToStage(a, stage.id)).length;
            return {
                ...stage,
                active_actor_count: count,
                fidelity_score: undefined,
                betrayal_type: undefined
            };
        });
    }, [actors]);

    return (
        <TooltipProvider>
            <Card
                className="absolute bottom-4 left-4 w-[320px] bg-white/95 backdrop-blur-sm shadow-xl border-slate-200 z-20 overflow-hidden"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
                    cursor: 'default'
                }}
            >
                <div
                    className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center cursor-move select-none"
                    onMouseDown={handleMouseDown}
                >
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Translation Chain</span>
                    <span className="text-[9px] text-slate-400">Trace Coverage</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                    {hydratedStages.map((stage, i) => {
                        const count = stage.active_actor_count || 0;
                        const isActive = count > 0;

                        return (
                            <Tooltip key={stage.id} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div
                                        className="relative group cursor-pointer"
                                        onMouseEnter={() => onHoverStage?.(stage.id)}
                                        onMouseLeave={() => onHoverStage?.(null)}
                                    >
                                        {/* Connecting Line */}
                                        {i < hydratedStages.length - 1 && (
                                            <div
                                                className={`absolute left-[11px] top-6 bottom-[-8px] w-[2px] z-0 transition-colors ${isActive ? 'bg-slate-300' : 'bg-slate-100'}`}
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
                                                ${!isActive ? 'opacity-50 grayscale' : ''}
                                            `}>
                                                <span className="font-mono text-[9px] font-bold">{i + 1}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col">
                                                        <span className={`font-semibold leading-tight group-hover:text-indigo-700 ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{stage.label}</span>
                                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-80">{stage.ant_label}</span>
                                                    </div>
                                                    <div className="flex gap-1">
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
                                </TooltipTrigger>
                                <TooltipContent
                                    side="left"
                                    sideOffset={10}
                                    className="max-w-[260px] bg-slate-900 border-slate-800 text-slate-100 shadow-xl animate-in fade-in slide-in-from-right-8 duration-300"
                                >
                                    <p className="font-semibold mb-1 text-indigo-300">{stage.label}</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{stage.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </Card>
        </TooltipProvider>
    );
});
