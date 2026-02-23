import React from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { getBiasIntensity } from '@/lib/ecosystem-utils';
import { ProvisionalBadge } from '@/components/ui/provisional-badge';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Layers, FileText, AlertTriangle } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ABSENCE_DESCRIPTIONS: Record<string, string> = {
    'textual-absence': "Simply not mentioned in the text.",
    'structural-exclusion': "Lack of formal roles or institutions for the actor in this context.",
    'discursive-marginalization': "The document's logic or framing excludes the actor's primary concerns.",
    'constitutive-silence': "An absence that is fundamental to the document's logic or world-view.",
    'Textual': "Simply not mentioned in the text.",
    'Structural': "Lack of formal roles or institutions for the actor.",
    'Discursive': "The document's framing excludes the actor's concerns.",
    'Constitutive': "An absence fundamental to the document's logic."
};

const EXCLUSION_DESCRIPTIONS: Record<string, string> = {
    'silenced': "Active omission or censorship of the actor's perspective.",
    'marginalized': "Actor is mentioned but their influence or agency is minimized.",
    'structurally-excluded': "The framework inherently prevents the actor's participation.",
    'displaced': "Actor's roles have been reassigned to other entities."
};

interface ActorCardProps {
    actor: EcosystemActor;
    isSelected: boolean;
    isGroupSelected: boolean;
    onSelect: () => void;
    onToggleGroupSelection: () => void;


    configurations?: EcosystemConfiguration[];
    // [NEW] ANT Workbench Props
    isTraced?: boolean;
    onTrace?: () => void;
}

export function ActorCard({
    actor,
    isSelected,
    isGroupSelected,
    onSelect,
    onToggleGroupSelection,
    configurations = [],
    isTraced,
    onTrace
}: ActorCardProps) {
    return (
        <TooltipProvider>
            <div
                aria-label={('isGhost' in actor && (actor as any).isGhost) ? `Ghost Node: ${actor.name}` : `Actor: ${actor.name}`}
                className={`p-3 rounded-md border cursor-pointer transition-colors relative flex gap-3 
                    ${isTraced ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200 shadow-sm' :
                        isSelected ? 'bg-indigo-50 border-indigo-200' :
                            isGroupSelected ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300/20' :
                                actor.source === 'absence_fill' ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50' : 'bg-white hover:bg-slate-50'}`}
                onClick={onSelect}
            >
                {/* Checkbox Column */}
                <div className="flex flex-col items-center pt-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={isGroupSelected}
                        onCheckedChange={onToggleGroupSelection}
                        className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 h-4 w-4"
                    />
                </div>

                {/* Main Content Column */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {actor.source === 'absence_fill' && (
                        <div className="absolute -top-1.5 -right-1.5">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                        </div>
                    )}

                    {/* Header: Name + Badges */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`font-semibold text-sm ${actor.source === 'absence_fill' ? 'text-amber-900 group-hover:text-amber-700' : 'text-slate-900'}`}>
                                {actor.name}
                            </span>
                            {(!actor.source || actor.source === 'default') && !('isGhost' in actor && (actor as any).isGhost) && (
                                <ProvisionalBadge
                                    className="h-4 px-1 text-[9px] border-indigo-200 bg-indigo-50 text-indigo-600"
                                    fragility={{ value: 0.4, interpretation: "provisional", factors: { input_completeness: 0.5, model_uncertainty: 0.3, theoretical_tension: 0.4, empirical_grounding: 0.8 } }}
                                />
                            )}
                            {/* [NEW] Ghost/Absence Specific Badges */}
                            {('isGhost' in actor && (actor as any).isGhost) && (
                                <>
                                    {(actor as any).absenceType && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge className="h-4 px-1 text-[9px] bg-amber-100 text-amber-800 border-amber-200 cursor-help">
                                                    {(actor as any).absenceType.includes('constitutive') ? 'Constitutive' :
                                                        (actor as any).absenceType.includes('discursive') ? 'Discursive' :
                                                            (actor as any).absenceType.includes('structural') ? 'Structural' :
                                                                (actor as any).absenceType.includes('textual') ? 'Textual' :
                                                                    ((actor as any).absenceType.split('-')[0])}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px]">
                                                <p>{ABSENCE_DESCRIPTIONS[(actor as any).absenceType] || ABSENCE_DESCRIPTIONS[(actor as any).absenceType.split('-')[0].charAt(0).toUpperCase() + (actor as any).absenceType.split('-')[0].slice(1)] || "Mechanism of absence in the document."}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    {(actor as any).exclusionType && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge className="h-4 px-1 text-[9px] bg-slate-100 text-slate-600 border-slate-200 lowercase cursor-help">
                                                    {(actor as any).exclusionType}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px]">
                                                <p>{EXCLUSION_DESCRIPTIONS[(actor as any).exclusionType] || "Type of exclusion detected."}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Top Right Badges */}
                        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                            {actor.source === 'absence_fill' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-5 border-amber-300 text-amber-600 bg-amber-100 cursor-help">
                                            Recovered
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Actor identified as potentially missing and restored from absence analysis.</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 font-normal">
                                {actor.type}
                            </Badge>
                            {actor.role_type && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-slate-100 text-slate-600 border border-slate-200 font-normal">
                                    {actor.role_type}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {actor.description}
                    </p>

                    {/* Assemblage Memberships (Middle Section) */}
                    {configurations.some(c => c.memberIds.includes(actor.id)) && (
                        <div className="mt-1 bg-amber-50 rounded-md p-2 border border-amber-100">
                            <p className="text-[10px] font-semibold text-amber-800 mb-1 flex items-center gap-1 uppercase tracking-wider">
                                <Layers className="h-3 w-3" /> Assemblage Memberships
                            </p>
                            <ul className="space-y-1">
                                {configurations.filter(c => c.memberIds.includes(actor.id)).map(c => (
                                    <li key={c.id} className="text-xs flex items-center justify-between group/item">
                                        <span className="font-medium text-slate-700 truncate mr-2">{c.name}</span>
                                        {c.properties?.stability && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 bg-white border-slate-200 text-slate-400 shrink-0 cursor-help">
                                                        {c.properties.stability}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Assemblage Stability: {c.properties.stability}. Indicates how established this group is in the document.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Trace Evidence */}
                    {actor.quotes && actor.quotes.length > 0 && (
                        <div className="mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider">
                                <FileText className="h-3 w-3" /> Empirical Traces
                            </p>
                            <ul className="space-y-1">
                                {actor.quotes.map((quote, idx) => (
                                    <li key={idx} className="text-[10px] text-slate-600 italic border-l-2 border-indigo-200 pl-2 line-clamp-2">
                                        &quot;{quote}&quot;
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* [NEW] Bias Hot Spot Warning */}
                    {getBiasIntensity(actor) > 0.5 && (
                        <div className="mt-1 bg-red-50 p-2 rounded border border-red-100">
                            <p className="text-[10px] font-semibold text-red-700 mb-1 flex items-center gap-1 uppercase tracking-wider">
                                <AlertTriangle className="h-3 w-3" /> Structural Friction (Hot Spot)
                            </p>
                            <p className="text-[10px] text-red-600 leading-snug">
                                High structural resistance detected. This actor may be a site of algorithmic bias, extraction, or ethical friction.
                            </p>
                        </div>
                    )}

                    {/* Footer: Actions */}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100/50">
                        {/* Trace Action */}
                        <div>
                            {onTrace && (
                                <button
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors border ${isTraced
                                        ? "bg-rose-50 text-rose-600 border-rose-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50/50"
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTrace();
                                    }}
                                >
                                    <Layers className="h-3 w-3" />
                                    {isTraced ? "Stop Tracing" : "Trace Actor"}
                                </button>
                            )}
                        </div>

                        {/* Links */}
                        {actor.url && (
                            <a
                                href={actor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline ml-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Visit Website
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
