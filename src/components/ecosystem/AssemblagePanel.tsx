"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Plus, Ghost, Layers, Globe, ShieldCheck, Maximize2, Minimize2, BoxSelect, X, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EcosystemActor, AssemblageAnalysis, EcosystemConfiguration } from '@/types/ecosystem';
import { ProvisionalBadge, FragilityIndicator } from '@/components/ui/provisional-badge';

import { ReflexiveLog } from './ReflexiveLog';

interface AssemblagePanelProps {
    actors: EcosystemActor[];
    analyzedText?: string;
    savedAnalysis?: AssemblageAnalysis | null;
    onSaveAnalysis?: (analysis: AssemblageAnalysis) => void;
    // Expansion Props
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    // Unification Props
    selectedConfig?: EcosystemConfiguration | null;
    onUpdateConfig?: (config: EcosystemConfiguration) => void;
    onClose?: () => void;
}

export function AssemblagePanel({ actors, analyzedText = "", savedAnalysis, onSaveAnalysis, isExpanded = false, onToggleExpand, selectedConfig, onUpdateConfig, onClose }: AssemblagePanelProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAddLog = (entry: import('@/types/ecosystem').ReflexiveLogEntry) => {
        if (!selectedConfig || !onUpdateConfig) return;

        const updatedConfig = {
            ...selectedConfig,
            reflexive_log: [...(selectedConfig.reflexive_log || []), entry]
        };
        onUpdateConfig(updatedConfig);
    };

    const handleDeleteLog = (entryId: string) => {
        if (!selectedConfig || !onUpdateConfig) return;

        const updatedConfig = {
            ...selectedConfig,
            reflexive_log: (selectedConfig.reflexive_log || []).filter(l => l.id !== entryId)
        };
        onUpdateConfig(updatedConfig);
    };

    const handleDeepScan = async () => {
        if (actors.length === 0 && !analyzedText) {
            alert("Please add actors or text source before analyzing.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            // Always try to send demo ID if available (handles client/server env mismatch)
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/ecosystem/absence', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ actors, text: analyzedText })
            });

            if (!response.ok) {
                console.error("Assemblage Analysis failed:", response.status, response.statusText);
                alert(`Analysis failed: Server returned ${response.status}`);
                return;
            }

            const data = await response.json();
            if (data.success && onSaveAnalysis) {
                if (data.success && onSaveAnalysis) {
                    // [FIX] Safe Merge: Explicitly preserve traces and metrics from existing analysis
                    // The 'absence' analysis (deep scan) does typically NOT return traces/metrics,
                    // so specific keys must be protected from being overwritten by undefined/null.
                    const effectiveAnalysis = selectedConfig?.analysisData || savedAnalysis || {};

                    const mergedAnalysis = {
                        ...effectiveAnalysis,
                        ...data.analysis,
                        // Force preserve critical metric data if it exists in the old state
                        traces: effectiveAnalysis.traces || data.analysis.traces,
                        computed_metrics: effectiveAnalysis.computed_metrics || data.analysis.computed_metrics,
                        // Preserve the core assemblage identity if not provided by new analysis
                        assemblage: effectiveAnalysis.assemblage || data.analysis.assemblage
                    };

                    onSaveAnalysis(mergedAnalysis);
                }
            }
        } catch (error) {
            console.error("Assemblage Analysis failed", error);
            alert("Failed to analyze assemblage. Please check your connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <Card className="h-full border-l-4 border-l-slate-400 bg-slate-50/50 flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600" />
                        Interpretive Workspace
                    </div>
                    <div className="flex items-center gap-1">
                        {onToggleExpand && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={onToggleExpand} title={isExpanded ? "Collapse" : "Expand"}>
                                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                        )}
                        {onClose && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200" onClick={onClose} title="Close Panel">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardTitle>
                <CardDescription>
                    Tracing components, mobilities, and silences in the policy assemblage.
                    {/* Provisional Badge in Header if available */}
                    {(savedAnalysis?.provisional_status || (selectedConfig?.analysisData as AssemblageAnalysis)?.provisional_status) && (
                        <div className="mt-2">
                            <ProvisionalBadge
                                fragility={(savedAnalysis?.provisional_status || (selectedConfig?.analysisData as AssemblageAnalysis)?.provisional_status)?.fragility_score}
                            />
                        </div>
                    )}
                </CardDescription>

                <div className="pt-2">
                    <Button
                        size="sm"
                        onClick={handleDeepScan}
                        disabled={isAnalyzing}
                        className={`w-full text-xs font-medium gap-2 transition-all ${savedAnalysis ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Analyzing Assemblage...
                            </>
                        ) : savedAnalysis ? (
                            <>
                                <Search className="h-3 w-3" />
                                Re-Trace Inscriptions
                            </>
                        ) : (
                            <>
                                <Layers className="h-3 w-3" />
                                Trace Inscriptions
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto flex-1 p-4">
                {selectedConfig ? (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                            <h3 className="font-bold text-indigo-900 text-lg mb-1">{selectedConfig.name}</h3>
                            <p className="text-sm text-indigo-700 mb-3">{selectedConfig.description}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="bg-white p-2 rounded border border-indigo-100 cursor-help hover:bg-slate-50 transition-colors">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Territorialization</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-slate-900">
                                                        {(Number(selectedConfig.properties.territorialization_score) || 0) > 7 ? "High Intensity" : (Number(selectedConfig.properties.territorialization_score) || 0) > 4 ? "Medium Intensity" : "Low Intensity"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-800">
                                            <p className="font-bold border-b border-slate-700 pb-1 mb-1">Computed from Traces:</p>
                                            <ul className="text-xs list-disc list-inside space-y-1">
                                                {(selectedConfig.analysisData as AssemblageAnalysis)?.computed_metrics?.territorialization_audit && (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.territorialization_audit!.length > 0
                                                    ? (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.territorialization_audit!.map((t: string, i: number) => <li key={i}>{t}</li>)
                                                    : <li className="text-slate-400">No traces found</li>}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="bg-white p-2 rounded border border-indigo-100 cursor-help hover:bg-slate-50 transition-colors">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Coding Intensity</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-slate-900">
                                                        {(Number(selectedConfig.properties.coding_intensity_score) || 0) > 7 ? "Over-Coded" : (Number(selectedConfig.properties.coding_intensity_score) || 0) > 4 ? "Mixed Coding" : "Decoded"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-800">
                                            <p className="font-bold border-b border-slate-700 pb-1 mb-1">Computed from Traces:</p>
                                            <ul className="text-xs list-disc list-inside space-y-1">
                                                {(selectedConfig.analysisData as AssemblageAnalysis)?.computed_metrics?.coding_audit && (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.coding_audit!.length > 0
                                                    ? (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.coding_audit!.map((t: string, i: number) => <li key={i}>{t}</li>)
                                                    : <li className="text-slate-400">No traces found</li>}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {selectedConfig.analysisData ? (
                            <Tabs defaultValue="critique" className="w-full">
                                <TabsList className="grid w-full grid-cols-5 bg-slate-100/50 p-1 mb-4 h-auto">
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
                                    <TabsTrigger value="journal" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                                        Journal
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="journal" className="space-y-4 h-[400px]">
                                    <ReflexiveLog
                                        logs={selectedConfig.reflexive_log || []}
                                        onAddLog={handleAddLog}
                                        onDeleteLog={handleDeleteLog}
                                    />
                                </TabsContent>

                                <TabsContent value="critique" className="space-y-4">
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-xs italic">
                                        &quot;{(selectedConfig.analysisData as AssemblageAnalysis).narrative}&quot;
                                        {(selectedConfig.analysisData as AssemblageAnalysis).provisional_status && (
                                            <div className="mt-2 pt-2 border-t border-amber-200">
                                                <FragilityIndicator score={(selectedConfig.analysisData as AssemblageAnalysis).provisional_status!.fragility_score} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Excluded Voices</h4>
                                        <div className="space-y-2">
                                            {(selectedConfig.analysisData as AssemblageAnalysis).missing_voices?.map((mv, i) => (
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
                                            {(selectedConfig.analysisData as AssemblageAnalysis).structural_voids?.map((v, i) => <li key={i}>{v}</li>)}
                                        </ul>
                                    </div>
                                </TabsContent>

                                <TabsContent value="actants" className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Infrastructures</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(selectedConfig.analysisData as AssemblageAnalysis).socio_technical_components?.infra?.map((inf, i) => (
                                                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                                                    {inf}
                                                </span>
                                            )) || <p className="text-xs text-slate-400">No infrastructures detected.</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Discourses</h4>
                                        <div className="space-y-2">
                                            {(selectedConfig.analysisData as AssemblageAnalysis).socio_technical_components?.discourse?.map((d, i) => (
                                                <p key={i} className="text-xs text-slate-600 border-l-2 border-indigo-200 pl-2">
                                                    {d}
                                                </p>
                                            )) || <p className="text-xs text-slate-400">No discourses detected.</p>}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="relations" className="space-y-4">
                                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-bold text-slate-700 uppercase">Mobility Score</h4>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${(selectedConfig.analysisData as AssemblageAnalysis).relations_of_exteriority?.mobility_score === "High" ? "bg-green-100 text-green-700" :
                                                (selectedConfig.analysisData as AssemblageAnalysis).relations_of_exteriority?.mobility_score === "Low" ? "bg-red-100 text-red-700" :
                                                    "bg-amber-100 text-amber-700"
                                                }`}>
                                                {(selectedConfig.analysisData as AssemblageAnalysis).relations_of_exteriority?.mobility_score || "Unknown"}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mb-3">
                                            High exteriority means components can be easily detached and reused in other assemblages.
                                        </p>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-green-600 block border-b border-green-100 pb-1">Detachable</span>
                                                {(selectedConfig.analysisData as AssemblageAnalysis).relations_of_exteriority?.detachable?.length ? (
                                                    (selectedConfig.analysisData as AssemblageAnalysis).relations_of_exteriority?.detachable.map((item, i) => (
                                                        <p key={i} className="text-xs text-slate-600 pl-1">{item}</p>
                                                    ))
                                                ) : <p className="text-[10px] text-slate-400 italic">None identified</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-red-600 block border-b border-red-100 pb-1">Embedded (Interior)</span>
                                                {(selectedConfig.analysisData as AssemblageAnalysis).relations_of_exteriority?.embedded?.length ? (
                                                    (selectedConfig.analysisData as AssemblageAnalysis).relations_of_exteriority?.embedded.map((item, i) => (
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
                                        <ul className="list-disc list-inside text-xs text-blue-900 space-y-1">
                                            {(selectedConfig.analysisData as AssemblageAnalysis).policy_mobilities?.origin_concepts?.map((c, i) => <li key={i}>{c}</li>) || <li>None detected</li>}
                                        </ul>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                        <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Local Mutations</h4>
                                        <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
                                            {(selectedConfig.analysisData as AssemblageAnalysis).policy_mobilities?.local_mutations?.map((m, i) => <li key={i}>{m}</li>) || <li>None detected</li>}
                                        </ul>
                                    </div>
                                </TabsContent>

                                <TabsContent value="mechanisms" className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stabilization Mechanisms</h4>
                                    <p className="text-xs text-slate-500 mb-2">How this assemblage holds together against disruption:</p>
                                    <div className="space-y-2">
                                        {(selectedConfig.analysisData as AssemblageAnalysis).stabilization_mechanisms?.map((mech, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                                <ShieldCheck className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                                                <span>{mech}</span>
                                            </div>
                                        )) || <p className="text-xs text-slate-400">No mechanisms detected.</p>}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                                <p className="text-sm">No deep analysis data available for this configuration.</p>
                            </div>
                        )}
                    </div>
                ) : savedAnalysis ? (
                    <Tabs defaultValue="critique" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1 mb-4 h-auto">
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
                        </TabsList>

                        {/* CRITIQUE TAB (Existing Absence Data) */}
                        <TabsContent value="critique" className="space-y-4">
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-xs italic">
                                &quot;{savedAnalysis.narrative}&quot;
                                {savedAnalysis.provisional_status && (
                                    <div className="mt-2 pt-2 border-t border-amber-200">
                                        <FragilityIndicator score={savedAnalysis.provisional_status.fragility_score} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Excluded Voices</h4>
                                <div className="space-y-2">
                                    {savedAnalysis.missing_voices.map((mv, i) => (
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
                                    {savedAnalysis.structural_voids.map((v, i) => <li key={i}>{v}</li>)}
                                </ul>
                            </div>
                        </TabsContent>

                        {/* ACTANTS TAB (New Socio-Technical Components) */}
                        <TabsContent value="actants" className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Infrastructures</h4>
                                <div className="flex flex-wrap gap-2">
                                    {savedAnalysis.socio_technical_components?.infra.map((inf, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                                            {inf}
                                        </span>
                                    )) || <p className="text-xs text-slate-400">No infrastructures detected.</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Discourses</h4>
                                <div className="space-y-2">
                                    {savedAnalysis.socio_technical_components?.discourse.map((d, i) => (
                                        <p key={i} className="text-xs text-slate-600 border-l-2 border-indigo-200 pl-2">
                                            {d}
                                        </p>
                                    )) || <p className="text-xs text-slate-400">No discourses detected.</p>}
                                </div>
                            </div>
                        </TabsContent>

                        {/* RELATIONS TAB */}
                        <TabsContent value="relations" className="space-y-4">
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase">Mobility Score</h4>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${savedAnalysis.relations_of_exteriority?.mobility_score === "High" ? "bg-green-100 text-green-700" :
                                        savedAnalysis.relations_of_exteriority?.mobility_score === "Low" ? "bg-red-100 text-red-700" :
                                            "bg-amber-100 text-amber-700"
                                        }`}>
                                        {savedAnalysis.relations_of_exteriority?.mobility_score || "Unknown"}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mb-3">
                                    High exteriority means components can be easily detached and reused in other assemblages.
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-green-600 block border-b border-green-100 pb-1">Detachable</span>
                                        {savedAnalysis.relations_of_exteriority?.detachable?.length ? (
                                            savedAnalysis.relations_of_exteriority.detachable.map((item, i) => (
                                                <p key={i} className="text-xs text-slate-600 pl-1">{item}</p>
                                            ))
                                        ) : <p className="text-[10px] text-slate-400 italic">None identified</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-red-600 block border-b border-red-100 pb-1">Embedded (Interior)</span>
                                        {savedAnalysis.relations_of_exteriority?.embedded?.length ? (
                                            savedAnalysis.relations_of_exteriority.embedded.map((item, i) => (
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
                                <ul className="list-disc list-inside text-xs text-blue-900 space-y-1">
                                    {savedAnalysis.policy_mobilities?.origin_concepts.map((c, i) => <li key={i}>{c}</li>) || <li>None detected</li>}
                                </ul>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Local Mutations</h4>
                                <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
                                    {savedAnalysis.policy_mobilities?.local_mutations.map((m, i) => <li key={i}>{m}</li>) || <li>None detected</li>}
                                </ul>
                            </div>
                        </TabsContent>

                        {/* MECHANISMS TAB (New Stabilization Mechanisms) */}
                        <TabsContent value="mechanisms" className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stabilization Mechanisms</h4>
                            <p className="text-xs text-slate-500 mb-2">How this assemblage holds together against disruption:</p>
                            <div className="space-y-2">
                                {savedAnalysis.stabilization_mechanisms?.map((mech, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                        <ShieldCheck className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                                        <span>{mech}</span>
                                    </div>
                                )) || <p className="text-xs text-slate-400">No mechanisms detected.</p>}
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                        <Layers className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Run analysis to map the assemblage.</p>
                    </div>
                )}
            </CardContent>
            <div className="p-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center italic">
                Methodological constrained artifact. Outputs are provisional inscriptions.
            </div>
        </Card >
    );
}
