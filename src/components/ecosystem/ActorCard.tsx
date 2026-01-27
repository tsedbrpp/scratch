import React from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { ProvisionalBadge } from '@/components/ui/provisional-badge';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Layers, FileText } from 'lucide-react';

interface ActorCardProps {
    actor: EcosystemActor;
    isSelected: boolean;
    isGroupSelected: boolean;
    onSelect: () => void;
    onToggleGroupSelection: () => void;
    configurations?: EcosystemConfiguration[];
}

export function ActorCard({
    actor,
    isSelected,
    isGroupSelected,
    onSelect,
    onToggleGroupSelection,
    configurations = []
}: ActorCardProps) {
    return (
        <div
            className={`p-3 rounded-md border cursor-pointer transition-colors relative flex gap-3 ${isSelected ? 'bg-indigo-50 border-indigo-200' :
                isGroupSelected ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300/20' :
                    actor.source === 'absence_fill' ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50' : 'bg-white hover:bg-slate-50'}`}
            onClick={onSelect}
        >
            <div className="flex flex-col items-center pt-0.5" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={isGroupSelected}
                    onCheckedChange={onToggleGroupSelection}
                    className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
            </div>

            <div className="flex-1 min-w-0">
                {actor.source === 'absence_fill' && (
                    <div className="absolute -top-1.5 -right-1.5">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-medium text-sm ${actor.source === 'absence_fill' ? 'text-amber-900 group-hover:text-amber-700' : ''}`}>
                            {actor.name}
                        </span>
                        {(!actor.source || actor.source === 'default') && (
                            <ProvisionalBadge
                                className="h-4 px-1 text-[9px] border-indigo-200 bg-indigo-50 text-indigo-600"
                                fragility={{ value: 0.4, interpretation: "provisional", factors: { input_completeness: 0.5, model_uncertainty: 0.3, theoretical_tension: 0.4, empirical_grounding: 0.8 } }}
                            />
                        )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                        {actor.source === 'absence_fill' && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-5 border-amber-300 text-amber-600 bg-amber-100">
                                Recovered
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                            {actor.type}
                        </Badge>
                        {actor.role_type && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-slate-100 text-slate-600 border border-slate-200">
                                {actor.role_type}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Assemblage Membership Badge */}
                {/* Assemblage Membership List */}
                {configurations.some(c => c.memberIds.includes(actor.id)) && (
                    <div className="mb-3 bg-amber-50/50 rounded-md p-2 border border-amber-100">
                        <p className="text-[10px] font-semibold text-amber-800 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                            <Layers className="h-3 w-3" /> Assemblage Memberships
                        </p>
                        <ul className="space-y-1">
                            {configurations.filter(c => c.memberIds.includes(actor.id)).map(c => (
                                <li key={c.id} className="text-xs flex items-center justify-between group/item">
                                    <span className="font-medium text-slate-700">{c.name}</span>
                                    <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 bg-white border-slate-200 text-slate-400">
                                        {c.properties.stability}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{actor.description}</p>

                {/* Trace Evidence Display */}
                {actor.quotes && actor.quotes.length > 0 && (
                    <div className="mt-2 mb-2 bg-slate-50 p-2 rounded border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider">
                            <FileText className="h-3 w-3" /> Empirical Traces
                        </p>
                        <ul className="space-y-1">
                            {actor.quotes.map((quote, idx) => (
                                <li key={idx} className="text-[10px] text-slate-600 italic border-l-2 border-indigo-200 pl-2">
                                    &quot;{quote}&quot;
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {actor.url && (
                    <a
                        href={actor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Visit Website
                    </a>
                )}
            </div>
        </div>
    );
}
