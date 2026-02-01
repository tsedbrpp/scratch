import React, { useState } from 'react';
import { EcosystemActor } from '@/types/ecosystem';
import { NodeViz } from '@/lib/viz-contract';
import { X, Pin, FileText, Activity, History, Share2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getBiasIntensity } from '@/lib/ecosystem-utils';

interface OverlayDetailsProps {
    node: EcosystemActor;
    viz: NodeViz;
    onClose: () => void;
    onPin: () => void;
    isPinned: boolean;
    neighbors?: { name: string; type: string; relation: string }[]; // Simplified neighbor data
}

type Tab = 'summary' | 'evidence' | 'history' | 'network';

export function OverlayDetails({ node, viz, onClose, onPin, isPinned, neighbors = [] }: OverlayDetailsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('summary');

    // Metrics for display
    const metrics = [
        { label: 'Stability (Territorialization)', value: viz.territorialization, color: 'bg-emerald-500' },
        { label: 'Mutation (Deterritorialization)', value: viz.deterritorialization, color: 'bg-amber-500' },
        { label: 'Rigidity (Coding)', value: viz.coding, color: 'bg-blue-500' },
    ];

    return (
        <div className="absolute top-8 right-8 w-80 bg-white/98 backdrop-blur-xl shadow-2xl border border-slate-200 rounded-2xl overflow-hidden flex flex-col max-h-[720px] animate-in slide-in-from-right-10 duration-500 z-[200]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-bold text-slate-900 leading-tight">{node.name}</h2>
                        {viz.isProvisional && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 border-dashed border-slate-400 text-slate-500">
                                Provisional
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-600 font-normal">
                            {node.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] h-5 border-slate-200 text-slate-500 font-normal">
                            {viz.roleType}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={onPin} className={`p-1.5 rounded-md transition-colors ${isPinned ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                        <Pin className="h-4 w-4" />
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={Activity} label="Summary" />
                <TabButton active={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')} icon={FileText} label="Evidence" />
                <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="History" />
                <TabButton active={activeTab === 'network'} onClick={() => setActiveTab('network')} icon={Share2} label="Network" />
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto min-h-[200px] flex-1">
                {activeTab === 'summary' && (
                    <div className="space-y-4">
                        {/* Bias Warning */}
                        {viz.ethicalRisk > 0.6 && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                                <h4 className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                                    <Activity className="h-3 w-3" /> High Bias Risk Detected
                                </h4>
                                <p className="text-[10px] text-red-600 leading-snug">
                                    High structural resistance combined with low legitimacy. Monitor for exclusionary effects.
                                </p>
                            </div>
                        )}

                        {/* Metric Bars */}
                        <div className="space-y-3">
                            {metrics.map((m) => (
                                <div key={m.label}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{m.label}</span>
                                        <span className="text-[10px] font-bold text-slate-700">{Math.round(m.value * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${m.color}`} style={{ width: `${m.value * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Source Links */}
                        {node.url && (
                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <a href={node.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-indigo-600 hover:underline gap-1">
                                    Visit Official Source <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'evidence' && (
                    <div className="space-y-3">
                        {node.quotes && node.quotes.length > 0 ? (
                            node.quotes.map((quote, i) => (
                                <blockquote key={i} className="text-xs italic text-slate-600 border-l-2 border-indigo-200 pl-3 py-1">
                                    &quot;{quote}&quot;
                                </blockquote>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-xs">
                                No direct quotes captured. Evidence inferred from network structure.
                            </div>
                        )}

                        {node.trace_metadata && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Provenance</h4>
                                <div className="text-xs text-slate-600 space-y-2">
                                    {node.trace_metadata.evidence && (
                                        <div className="bg-amber-50/50 p-2 rounded border border-amber-100/50 mb-2">
                                            <p className="text-[10px] text-amber-800 font-semibold uppercase mb-1">Analytical Evidence</p>
                                            <p>{node.trace_metadata.evidence}</p>
                                        </div>
                                    )}
                                    <p>Method: <span className="font-medium capitalize">{node.trace_metadata.source.replace('_', ' ')}</span></p>
                                    <p>Reliability: <span className="font-medium">{Math.round(node.trace_metadata.confidence * 100)}%</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {node.reflexive_log && node.reflexive_log.length > 0 ? (
                            <div className="relative border-l border-slate-200 ml-2 space-y-6">
                                {node.reflexive_log.map((log) => (
                                    <div key={log.id} className="relative pl-4">
                                        <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
                                        <div className="text-[10px] text-slate-400 mb-0.5">
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs font-medium text-slate-800">
                                            {log.action_type.replace(/_/g, " ")}
                                        </div>
                                        <div className="text-[11px] text-slate-600 mt-1 italic">
                                            "{log.rationale}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-xs">
                                No reflexive modifications recorded for this actor.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'network' && (
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Connected Actors</h4>
                        {neighbors.length > 0 ? (
                            <ul className="space-y-1">
                                {neighbors.map((n, i) => (
                                    <li key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-100">
                                        <span className="font-medium text-slate-700">{n.name}</span>
                                        <span className="text-[10px] text-slate-400">{n.relation}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-500">No active connections in current view.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-center text-slate-400">
                {isPinned ? "Pinned: Click unpin to close" : "Click Pin icon to keep open"}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-medium transition-colors border-b-2 ${active
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
        >
            <Icon className="h-3 w-3" />
            {label}
        </button>
    );
}
