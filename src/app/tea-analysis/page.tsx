"use client";

import React, { useState } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { TEAAnalysis } from "@/types";
import { TEADiagram } from "@/components/policy/TEADiagram";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Network, FileText, ArrowLeftRight, BookOpen, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { useTeam } from "@/hooks/useTeam";
import { useSources } from "@/hooks/useSources";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";

export default function TEAAnalysisPage() {
    const [teaAnalysis, setTeaAnalysis] = useServerStorage<TEAAnalysis | null>("tea_analysis_result", null);
    const [theoreticalSynthesis, setTheoreticalSynthesis] = useServerStorage<string | null>("theoretical_synthesis", null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Dependencies for synthesis
    const { hasCredits } = useCredits();
    const { currentUserRole } = useTeam();
    const { sources } = useSources();
    const [showTopUp, setShowTopUp] = useState(false);

    // Pull full context for the analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [synthesisComparison] = useServerStorage<any>("synthesis_comparison_result", null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [resistanceSynthesis] = useServerStorage<any>("resistance_synthesis_result", null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ecosystemConfigs] = useServerStorage<any>("ecosystem_configurations", []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [culturalAnalysis] = useServerStorage<any>("cultural_analysis_result_v5", null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ontologyComparison] = useServerStorage<any>("ontology_comparison_result", null);

    const hasData = !!teaAnalysis || !!theoreticalSynthesis;

    const handleGenerateTheory = async () => {
        if (!hasCredits) {
            alert("⚠️ You have no credits remaining.\n\nTheoretical synthesis requires credits for AI analysis. Please add credits to continue.");
            setShowTopUp(true);
            return;
        }
        if (currentUserRole === 'VOTER') {
            alert('Voter role is read-only for analysis. You cannot generate theory.');
            return;
        }

        setIsGenerating(true);
        try {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            // Rebuild exact context map expected by AI for TEA compilation
            const contextForAI = {
                empirical_sources: sources.filter((s: any) => s.type !== 'Trace').map((s: any) => ({
                    title: s.title || s.name || 'Document',
                    text: s.data?.text || ''
                })),
                synthesis: synthesisComparison ? {
                    synthesis_summary: synthesisComparison.synthesis_summary,
                    key_divergences: synthesisComparison.key_divergences?.map((d: any) => ({
                        theme: d.theme,
                        description: d.description
                    })),
                    stabilization_mechanisms: synthesisComparison.stabilization_mechanisms
                } : null,
                resistance: resistanceSynthesis ? {
                    executive_summary: resistanceSynthesis.executive_summary,
                    dominant_strategies: resistanceSynthesis.dominant_strategies?.map((s: any) => ({
                        strategy: s.strategy,
                        description: s.description,
                        frequency: s.frequency
                    })),
                    lines_of_flight: resistanceSynthesis.lines_of_flight
                } : null,
                ecosystem_configs: ecosystemConfigs?.map((c: any) => ({
                    name: c.name,
                    description: c.description,
                    dynamics: c.dynamics
                })),
                cultural: culturalAnalysis ? {
                    executive_summary: culturalAnalysis.executive_summary,
                    dominant_logic: culturalAnalysis.dominant_logic,
                    state_market_society: culturalAnalysis.state_market_society
                } : null,
                ontology: ontologyComparison ? {
                    distances: ontologyComparison.distances,
                    implications: ontologyComparison.implications
                } : null
            };
            /* eslint-enable @typescript-eslint/no-explicit-any */

            const context = JSON.stringify(contextForAI);

            // 1. Run Theoretical Synthesis FIRST
            const theoryResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisMode: 'theoretical_synthesis', reportContext: context })
            });

            if (!theoryResponse.ok) {
                const errText = await theoryResponse.text();
                console.error("Theory Response Error:", errText);
                throw new Error(`Theory API failed: ${errText}`);
            }

            const theoryData = await theoryResponse.json();
            const completedSynthesis = theoryData.analysis?.theoretical_synthesis || null;
            setTheoreticalSynthesis(completedSynthesis);

            // 2. Inject completed synthesis into TEA Map Context
            const enrichedContext = JSON.stringify({
                ...contextForAI,
                ant_assemblage_synthesis_report: completedSynthesis
            });

            // 3. Run TEA Map Generation SECOND
            const teaResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisMode: 'tea_analysis', reportContext: enrichedContext })
            });

            if (!teaResponse.ok) {
                const errText = await teaResponse.text();
                console.error("TEA Response Error:", errText);
                throw new Error(`TEA API failed: ${errText}`);
            }

            const teaData = await teaResponse.json();
            setTeaAnalysis(teaData.tea_analysis || null);

        } catch (err) {
            console.error(err);
            alert("Failed to generate TEA Map.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in duration-500">
            <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Network className="h-8 w-8 text-indigo-600" />
                        Translation-Embedding Account (TEA)
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg max-w-3xl">
                        Explore how portable governance vocabularies travel across jurisdictions, acquire different local meanings, and become institutionally durable through embedding in compliance infrastructures.
                    </p>
                </div>
                {hasData ? (
                    <Button
                        onClick={handleGenerateTheory}
                        disabled={isGenerating}
                        variant="outline"
                        className="font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    >
                        {isGenerating ? "Generating..." : "Re-generate Analysis"}
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerateTheory}
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                        {isGenerating ? "Generating..." : "Generate TEA Analysis"}
                    </Button>
                )}
            </div>

            <div>
                {/* Analytics (TEA Map and Synthesis) */}
                <div className="w-full">
                    {hasData ? (
                        <div className="space-y-8">
                            {/* TEA Diagram Map */}
                            {teaAnalysis && (
                                <section className="animate-in slide-in-from-bottom flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                            <Layers className="h-5 w-5 text-emerald-600" />
                                            Active TEA Map
                                        </h3>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Extracted from Synthesis</Badge>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <TEADiagram data={teaAnalysis} />
                                    </div>
                                </section>
                            )}

                            {/* ANT & Theoretical Synthesis Text */}
                            {theoreticalSynthesis && (
                                <section className="animate-in slide-in-from-bottom flex flex-col gap-3 mt-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            ANT & Assemblage Translation Report
                                        </h3>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">LLM Synthesis</Badge>
                                    </div>
                                    <Card className="shadow-sm border-slate-200 bg-white">
                                        <CardContent className="pt-6 prose prose-slate max-w-none text-sm dark:prose-invert">
                                            {theoreticalSynthesis.split('\n').map((line, i) => {
                                                if (!line.trim()) return <br key={i} />;
                                                if (line.startsWith('**') || line.startsWith('ANT Reading:') || line.startsWith('Assemblage Reading:') || line.startsWith('Result') || line.startsWith('Theoretical Implications:')) {
                                                    return <h4 key={i} className="mt-6 mb-3 text-slate-800 font-bold border-b pb-2">{line.replace(/\*\*/g, '')}</h4>;
                                                }
                                                return <p key={i} className="mb-3 text-slate-600 leading-relaxed">{line}</p>;
                                            })}
                                        </CardContent>
                                    </Card>
                                </section>
                            )}
                        </div>
                    ) : (
                        <Card className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-slate-50 border-dashed shadow-none">
                            <CardContent className="pt-6 flex flex-col items-center">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                    <Network className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">No TEA Analysis Found</h3>
                                <p className="text-slate-500 max-w-md mb-6">
                                    You haven&apos;t generated a theoretical translation recently. Head over to the Data Manager to run an ANT & Assemblage synthesis on your selected documents.
                                </p>
                                <Button
                                    onClick={handleGenerateTheory}
                                    disabled={isGenerating}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isGenerating ? "Running Analysis..." : "Generate New Map"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
