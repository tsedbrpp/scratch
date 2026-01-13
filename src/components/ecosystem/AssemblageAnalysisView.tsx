
"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShieldCheck, Info, Globe, Loader2 } from 'lucide-react';
import { AssemblageAnalysis, EcosystemActor, ReflexiveLogEntry } from '@/types/ecosystem';
import { FragilityIndicator } from '@/components/ui/provisional-badge';
import { RatificationControls } from './RatificationControls';
import { ReflexiveLog } from './ReflexiveLog';
import { Button } from '@/components/ui/button';

interface AssemblageAnalysisViewProps {
    analysis: AssemblageAnalysis;
    actors?: EcosystemActor[];
    reflexiveLogs?: ReflexiveLogEntry[];
    onAddLog?: (entry: ReflexiveLogEntry) => void;
    onDeleteLog?: (entryId: string) => void;
    onRatify?: () => void;
    onContest?: (interpretation: string, basis: string) => void;
    onEnrichLinks?: () => void;
    isEnriching?: boolean;
    enrichProgress?: number;
}

export function AssemblageAnalysisView({
    analysis,
    actors = [],
    reflexiveLogs,
    onAddLog,
    onDeleteLog,
    onRatify,
    onContest,
    onEnrichLinks,
    isEnriching = false,
    enrichProgress = 0
}: AssemblageAnalysisViewProps) {
    return (
        <Tabs defaultValue="critique" className="w-full">
            <TabsList className={`grid w-full ${reflexiveLogs ? 'grid-cols-5' : 'grid-cols-4'} bg-slate-100/50 p-1 mb-4 h-auto`}>
                <TabsTrigger value="critique" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Critique
                </TabsTrigger>
                <TabsTrigger value="actants" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Actants
                </TabsTrigger>
                <TabsTrigger value="mechanisms" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Mechanisms
                </TabsTrigger>
                <TabsTrigger value="relations" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Relations
                </TabsTrigger>
                {reflexiveLogs && (
                    <TabsTrigger value="journal" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                        Journal
                    </TabsTrigger>
                )}
            </TabsList>

            {reflexiveLogs && onAddLog && onDeleteLog && (
                <TabsContent value="journal" className="space-y-4 h-[400px]">
                    <ReflexiveLog
                        logs={reflexiveLogs}
                        onAddLog={onAddLog}
                        onDeleteLog={onDeleteLog}
                    />
                </TabsContent>
            )}

            <TabsContent value="critique" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">Understanding the Critique</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            This panel uses <span className="font-semibold text-indigo-600">Assemblage Theory</span> to deconstruct the policy document.
                            It highlights the <span className="italic">Provisional Status</span> (yellow = Simulated, green = Ratified) and identifies <span className="font-semibold text-red-600">Structural Voids</span>—actors or issues the policy explicitly excludes.
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-xs italic">
                    &quot;{analysis.narrative}&quot;
                    {analysis.provisional_status && (
                        <div className="mt-2 pt-2 border-t border-amber-200">
                            <FragilityIndicator score={analysis.provisional_status.fragility_score} />
                        </div>
                    )}
                </div>

                {/* Ratification Controls */}
                {analysis.provisional_status && onRatify && onContest && (
                    <div className="mt-4">
                        <RatificationControls
                            inscription={analysis.provisional_status}
                            onRatify={onRatify}
                            onContest={onContest}
                        />
                    </div>
                )}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Excluded Voices</h4>
                    <div className="space-y-2">
                        {analysis.missing_voices?.map((mv, i) => (
                            <div key={i} className="bg-white p-2 rounded border border-slate-200 shadow-sm flex justify-between gap-2">
                                <div>
                                    <span className="font-semibold text-xs text-slate-900 block">{mv.name}</span>
                                    <p className="text-[10px] text-slate-500">{mv.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Structural Voids</h4>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {analysis.structural_voids?.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                </div>
            </TabsContent>

            <TabsContent value="actants" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-slate-700">Understanding Actants</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            In ANT, agency is distributed. This tab traces both <span className="font-semibold text-indigo-600">Human Actors</span> and <span className="font-semibold text-indigo-600">Non-Human Actants</span> (infrastructures, protocols, discourses) that enforce the system&apos;s logic.
                        </p>
                    </div>
                </div>

                {/* Link Enrichment Controls */}
                <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Missing Data: {actors.filter(a => !a.url).length} actors without links</span>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-2"
                        onClick={onEnrichLinks}
                        disabled={!onEnrichLinks || isEnriching || actors.filter(a => !a.url).length === 0}
                    >
                        {isEnriching ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {enrichProgress}% Finding...
                            </>
                        ) : (
                            <>
                                <Globe className="h-3 w-3 text-indigo-500" />
                                Find Missing Links
                            </>
                        )}
                    </Button>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Infrastructures</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.socio_technical_components?.infra?.map((inf, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                                {inf}
                            </span>
                        )) || <p className="text-xs text-slate-400">No infrastructures detected.</p>}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Discourses</h4>
                    <div className="space-y-2">
                        {analysis.socio_technical_components?.discourse?.map((d, i) => (
                            <p key={i} className="text-xs text-slate-600 border-l-2 border-indigo-200 pl-2">
                                {d}
                            </p>
                        )) || <p className="text-xs text-slate-400">No discourses detected.</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="relations" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">Relations of Exteriority</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            How portable is this system? <span className="font-semibold text-green-600">Detachable</span> components (e.g., standard servers) can move easily. <span className="font-semibold text-red-600">Embedded</span> components (e.g., specific cultural narratives) are stuck in place.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase">Mobility Score</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${analysis.relations_of_exteriority?.mobility_score === "High" ? "bg-green-100 text-green-700" :
                            analysis.relations_of_exteriority?.mobility_score === "Low" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                            }`}>
                            {analysis.relations_of_exteriority?.mobility_score || "Unknown"}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3">
                        High exteriority means components can be easily detached and reused in other assemblages.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-green-600 block border-b border-green-100 pb-1">Detachable</span>
                            {analysis.relations_of_exteriority?.detachable?.length ? (
                                analysis.relations_of_exteriority?.detachable.map((item, i) => (
                                    <p key={i} className="text-xs text-slate-600 pl-1">{item}</p>
                                ))
                            ) : <p className="text-[10px] text-slate-400 italic">None identified</p>}
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-red-600 block border-b border-red-100 pb-1">Embedded (Interior)</span>
                            {analysis.relations_of_exteriority?.embedded?.length ? (
                                analysis.relations_of_exteriority?.embedded.map((item, i) => (
                                    <p key={i} className="text-xs text-slate-600 pl-1">{item}</p>
                                ))
                            ) : <p className="text-[10px] text-slate-400 italic">None identified</p>}
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Origin Concepts
                    </h4>
                    <p className="text-[10px] text-blue-700 italic mb-2">Global norms or models imported into this assemblage (e.g., &quot;Risk-Based Approach&quot;).</p>
                    <ul className="list-disc list-inside text-xs text-blue-900 space-y-1">
                        {analysis.policy_mobilities?.origin_concepts?.map((c, i) => <li key={i}>{c}</li>) || <li>None detected</li>}
                    </ul>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Local Mutations</h4>
                    <p className="text-[10px] text-emerald-700 italic mb-2">How global concepts are adapted or twisted to fit local power structures.</p>
                    <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
                        {analysis.policy_mobilities?.local_mutations?.map((m, i) => <li key={i}>{m}</li>) || <li>None detected</li>}
                    </ul>
                </div>
            </TabsContent>

            <TabsContent value="mechanisms" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">Stabilization Mechanisms</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Assemblages naturally fall apart (entropy). These are the active <span className="font-semibold text-indigo-600">Mechanisms</span> (audits, fines, templates, rituals) that hold the network together and prevent &quot;lines of flight&quot;.
                        </p>
                    </div>
                </div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stabilization Mechanisms</h4>
                <p className="text-xs text-slate-500 mb-2">How this assemblage holds together against disruption:</p>
                <div className="space-y-2">
                    {analysis.stabilization_mechanisms?.map((mech, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <ShieldCheck className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                            <span>{mech}</span>
                        </div>
                    )) || <p className="text-xs text-slate-400">No mechanisms detected.</p>}
                </div>
            </TabsContent>
        </Tabs>
    );
}
