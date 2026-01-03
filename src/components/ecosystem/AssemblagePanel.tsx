"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BrainCircuit, Loader2, Plus, Ghost, Layers, Globe, ShieldCheck, Maximize2, Minimize2 } from 'lucide-react';
import { EcosystemActor, AssemblageAnalysis } from '@/types/ecosystem';

interface AssemblagePanelProps {
    actors: EcosystemActor[];
    analyzedText?: string;
    onSimulate?: (query: string, source?: "default" | "simulation" | "absence_fill") => Promise<void>;
    topic?: string;
    savedAnalysis?: AssemblageAnalysis | null;
    onSaveAnalysis?: (analysis: AssemblageAnalysis) => void;
    // Expansion Props
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

export function AssemblagePanel({ actors, analyzedText = "", onSimulate, topic, savedAnalysis, onSaveAnalysis, isExpanded = false, onToggleExpand }: AssemblagePanelProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [simulatingIndex, setSimulatingIndex] = useState<number | null>(null);

    const handleDeepScan = async () => {
        setIsAnalyzing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/ecosystem/absence', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ actors, text: analyzedText })
            });
            const data = await response.json();
            if (data.success && onSaveAnalysis) {
                onSaveAnalysis(data.analysis);
            }
        } catch (error) {
            console.error("Assemblage Analysis failed", error);
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
                        Assemblage Analysis
                    </div>
                    {onToggleExpand && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={onToggleExpand} title={isExpanded ? "Collapse" : "Expand"}>
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    )}
                </CardTitle>
                <CardDescription>
                    Tracing components, mobilities, and silences in the policy assemblage.
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
                                <BrainCircuit className="h-3 w-3" />
                                Re-Analyze Assemblage
                            </>
                        ) : (
                            <>
                                <Layers className="h-3 w-3" />
                                Reveal Assemblage
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto flex-1 p-4">
                {savedAnalysis ? (
                    <Tabs defaultValue="critique" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-slate-200/50 mb-4">
                            <TabsTrigger value="critique" className="text-[10px] py-1.5 px-0 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Ghost className="h-3 w-3 mb-0.5 mx-auto" />
                                Critique
                            </TabsTrigger>
                            <TabsTrigger value="composition" className="text-[10px] py-1.5 px-0 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Layers className="h-3 w-3 mb-0.5 mx-auto" />
                                Parts
                            </TabsTrigger>
                            <TabsTrigger value="mobilities" className="text-[10px] py-1.5 px-0 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Globe className="h-3 w-3 mb-0.5 mx-auto" />
                                Flows
                            </TabsTrigger>
                            <TabsTrigger value="stabilization" className="text-[10px] py-1.5 px-0 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <ShieldCheck className="h-3 w-3 mb-0.5 mx-auto" />
                                Stable
                            </TabsTrigger>
                        </TabsList>

                        {/* CRITIQUE TAB (Existing Absence Data) */}
                        <TabsContent value="critique" className="space-y-4">
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-xs italic">
                                &quot;{savedAnalysis.narrative}&quot;
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
                                            {onSimulate && (
                                                <Button
                                                    variant="ghost" size="icon" className="h-6 w-6 text-indigo-600 hover:bg-indigo-50"
                                                    disabled={simulatingIndex === i}
                                                    onClick={async () => {
                                                        setSimulatingIndex(i);
                                                        try {
                                                            const context = topic ? `within "${topic}"` : "in this ecosystem";
                                                            await onSimulate(`Generate actors for "${mv.name}" (${mv.category}) ${context}. Reason: ${mv.reason}`, "absence_fill");
                                                        } finally {
                                                            setSimulatingIndex(null);
                                                        }
                                                    }}
                                                >
                                                    {simulatingIndex === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                </Button>
                                            )}
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

                        {/* COMPOSITION TAB (New Socio-Technical Components) */}
                        <TabsContent value="composition" className="space-y-4">
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

                        {/* MOBILITIES TAB (New Policy Flows) */}
                        <TabsContent value="mobilities" className="space-y-4">
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

                        {/* STABILIZATION TAB (New Stabilization Mechanisms) */}
                        <TabsContent value="stabilization" className="space-y-4">
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
        </Card>
    );
}
