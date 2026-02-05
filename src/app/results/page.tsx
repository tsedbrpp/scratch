"use client";

import React, { useState } from 'react';
import { useServerStorage } from "@/hooks/useServerStorage";
// import { CulturalHolesAnalysisResult } from "@/types/ecosystem";
// import { CulturalHolesAnalysis } from "@/components/ecosystem/CulturalHolesAnalysis";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { AVAILABLE_PERSPECTIVES, DEFAULT_PERSPECTIVE_A, DEFAULT_PERSPECTIVE_B } from "@/lib/perspectives";

export default function ResultsPage() {
    // const [analysisResult, setAnalysisResult] = useState<CulturalHolesAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    // State for the "Manuscript" text - editable by the user
    const [paragraph1, setParagraph1] = useState("");
    const [paragraph2, setParagraph2] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [perspA, setPerspA] = useState(DEFAULT_PERSPECTIVE_A.id);
    const [perspB, setPerspB] = useState(DEFAULT_PERSPECTIVE_B.id);

    const handleSimulate = async () => {
        setIsSimulating(true);
        setError(null);
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            if (demoUserId) {
                headers['x-demo-user-id'] = demoUserId;
            }

            const response = await fetch('/api/simulate-perspectives', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    topic: "AI Safety Regulation",
                    perspectiveAId: perspA,
                    perspectiveBId: perspB
                })
            });
            const data = await response.json();
            if (data.success && data.perspectives) {
                setParagraph1(data.perspectives.perspectiveA);
                setParagraph2(data.perspectives.perspectiveB);
            } else {
                throw new Error(data.error || "Simulation failed");
            }
        } catch (error: unknown) {
            console.error("Simulation failed:", error);
            setError(error.message || "Failed to generate perspectives");
        } finally {
            setIsSimulating(false);
        }
    };

    const handleAnalyze = async (forceRefresh = false) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            if (!paragraph1.trim() || !paragraph2.trim()) {
                throw new Error("Both perspectives must have text content.");
            }

            // we treat the two paragraphs as distinct "sources" to find the hole between them
            const sources = [
                {
                    id: "para-1-side-a",
                    title: "Perspective A",
                    text: paragraph1
                },
                {
                    id: "para-2-side-b",
                    title: "Perspective B",
                    text: paragraph2
                }
            ];

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            if (demoUserId) {
                headers['x-demo-user-id'] = demoUserId;
            }

            const response = await fetch('/api/cultural-analysis', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    sources,
                    lensId: 'dsf_lens',
                    forceRefresh
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.analysis) {
                // setAnalysisResult(data.analysis);
                setHasRun(true);
            } else {
                throw new Error(data.error || "Analysis returned no data");
            }
        } catch (error: unknown) {
            console.error("Analysis failed:", error);
            setError(error.message || "An unexpected error occurred during analysis");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 font-serif">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 font-sans text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}
            <header className="mb-12 border-b pb-6">
                <div className="text-sm font-sans font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Journal of Sociomaterial Governance • Vol. 12 • 2025
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4 font-sans">
                    Entangled Agencies: A Comparative Assemblage Analysis
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-600 font-sans">
                    <span>A. Nonymous</span>
                    <span>•</span>
                    <span>Methods: Algorithmic Ethnography</span>
                </div>
            </header>

            <article className="prose prose-lg prose-slate max-w-none">
                <h2 className="font-sans m-0 mb-4">3. Results: Analysis of Discursive Fractures</h2>
                <div className="flex flex-col gap-4 mb-8 bg-slate-50 p-4 rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700">Simulation Configuration</h3>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className="text-xs"
                        >
                            {isSimulating ? "Generating..." : "Auto-Generate Perspectives"}
                            <Sparkles className="ml-1 h-3 w-3" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Perspective A</label>
                            <select
                                value={perspA}
                                onChange={(e) => setPerspA(e.target.value)}
                                className="w-full text-sm p-2 rounded border border-slate-300 bg-white"
                            >
                                {AVAILABLE_PERSPECTIVES.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {AVAILABLE_PERSPECTIVES.find(p => p.id === perspA)?.description}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Perspective B</label>
                            <select
                                value={perspB}
                                onChange={(e) => setPerspB(e.target.value)}
                                className="w-full text-sm p-2 rounded border border-slate-300 bg-white"
                            >
                                {AVAILABLE_PERSPECTIVES.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {AVAILABLE_PERSPECTIVES.find(p => p.id === perspB)?.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -left-4 top-2 bottom-2 w-1 bg-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <textarea
                        value={paragraph1}
                        onChange={(e) => setParagraph1(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-lg leading-relaxed text-slate-800 resize-none outline-none focus:ring-0 font-serif"
                        rows={6}
                        placeholder="[Perspective A text will appear here...]"
                    />
                </div>

                <div className="relative group mt-6">
                    <div className="absolute -left-4 top-2 bottom-2 w-1 bg-amber-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <textarea
                        value={paragraph2}
                        onChange={(e) => setParagraph2(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-lg leading-relaxed text-slate-800 resize-none outline-none focus:ring-0 font-serif"
                        rows={6}
                        placeholder="[Perspective B text will appear here...]"
                    />
                </div>

                {/* THE ENTANGLED TOOL */}
                <div className="my-12 -mx-6 p-6 bg-slate-50 border-y border-slate-200 shadow-inner font-sans not-prose">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                                Interactive Instrument: Cultural Hole Detector
                            </h3>
                            <p className="text-sm text-slate-600 max-w-xl">
                                To operationalize the sociomaterial method, we embed the analytic instrument directly into the text.
                                Click below to perform a live structural hole analysis on the entered paragraphs.
                            </p>
                        </div>
                        {!hasRun && (
                            <Button
                                onClick={() => handleAnalyze(false)}
                                size="lg"
                                disabled={isAnalyzing || !paragraph1 || !paragraph2}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? "Analyzing Text..." : "Run Detector"}
                                {!isAnalyzing && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        )}
                        {hasRun && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleAnalyze(false)}
                                    variant="outline"
                                    size="sm"
                                    disabled={isAnalyzing}
                                >
                                    Rerun
                                </Button>
                                <Button
                                    onClick={() => handleAnalyze(true)}
                                    variant="destructive"
                                    size="sm"
                                    disabled={isAnalyzing}
                                    title="Force fresh analysis (ignores cache)"
                                >
                                    <RotateCcw className="mr-2 h-3 w-3" />
                                    Force Refresh
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Rendering the Analysis Component Inline */}
                    {/* {(hasRun || isAnalyzing) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <CulturalHolesAnalysis
                                culturalHoles={analysisResult}
                                isAnalyzingHoles={isAnalyzing}
                                onAnalyze={handleAnalyze}
                            />
                            <div className="mt-4 text-xs text-center text-slate-400 font-mono">
                                Fig 3.1: Live generation of structural holes between the provided textual artifacts.
                            </div>
                        </div>
                    )} */}
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg">
                        <p className="text-sm">Cultural Holes Analysis component temporarily disabled.</p>
                    </div>
                </div>
            </article>
        </div>
    );
}
