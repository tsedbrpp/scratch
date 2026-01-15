"use client";
// Force rebuild trigger

import { useState, useEffect, useMemo } from "react";
import { useSources } from "@/hooks/useSources";
// import { useServerStorage } from "@/hooks/useServerStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Globe2, Scale, Users, Building, Loader2, Sparkles, AlertTriangle, RefreshCw, Wand2, PlayCircle, Network } from "lucide-react";
import { LegitimacyAnalysisView } from "@/components/policy/LegitimacyAnalysisView";
import { synthesizeComparison, analyzeDocument } from "@/services/analysis";
import { PositionalityDialog } from "@/components/reflexivity/PositionalityDialog";
import { MutationTable } from "@/components/comparison/MutationTable";
import { useDemoMode } from "@/hooks/useDemoMode";
import { StabilizationCard } from "@/components/comparison/StabilizationCard";
import { RhizomeNetwork } from "@/components/comparison/RhizomeNetwork";
import { LensSelector, InterpretationLens } from "@/components/comparison/LensSelector";
import { RebuttalPopover } from "@/components/comparison/RebuttalPopover";

import { Source, ComparativeSynthesis, PositionalityData } from "@/types";

export default function ComparisonPage() {
    const { sources, isLoading, updateSource } = useSources();
    const { isReadOnly } = useDemoMode();

    // Filter for policy documents (non-traces)
    const policyDocs = useMemo(() => sources.filter(s => s.type !== "Trace"), [sources]);

    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"cultural" | "logics" | "legitimacy" | "synthesis">("cultural");
    const [activeLens, setActiveLens] = useState<InterpretationLens>("assemblage");
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [synthesisResults, setSynthesisResults, isStorageLoading] = useLocalStorage<Record<string, ComparativeSynthesis>>("comparison_synthesis_results_v3", {});
    const [synthesisError, setSynthesisError] = useState<string | null>(null);
    const [forceRefresh, setForceRefresh] = useState(false);

    // Deep Analysis State
    const [isPositionalityOpen, setIsPositionalityOpen] = useState(false);
    const [analyzingSourceId, setAnalyzingSourceId] = useState<string | null>(null);
    const [isDeepAnalyzing, setIsDeepAnalyzing] = useState<Record<string, boolean>>({});

    // Derived state for current lens
    const currentResult = synthesisResults?.[activeLens] || null;

    useEffect(() => {
        // Wait for both sources and storage to load
        if (isLoading || isStorageLoading) return;

        // Auto-select first two docs
        if (policyDocs.length >= 2 && selectedDocs.length === 0) {
            setSelectedDocs([policyDocs[0].id, policyDocs[1].id]);
        }
    }, [isLoading, isStorageLoading, selectedDocs.length, policyDocs]);

    const selectedSources = selectedDocs
        .map(id => policyDocs.find(s => s.id === id))
        .filter(Boolean) as Source[];

    const logicIcons = {
        market: Building,
        state: Scale,
        professional: Users,
        community: Users,
    };

    const logicColors = {
        market: "text-purple-600 bg-purple-100",
        state: "text-blue-600 bg-blue-100",
        professional: "text-green-600 bg-green-100",
        community: "text-orange-600 bg-orange-100",
    };

    const handleSynthesize = async () => {
        if (selectedSources.length < 2) return;

        // Validation: Check if all analyses are present
        const missingAnalysis = selectedSources.some(
            s => !s.cultural_framing || !s.institutional_logics || !s.legitimacy_analysis
        );

        if (missingAnalysis) {
            setSynthesisError("All selected documents must have Cultural Framing, Institutional Logics, and Legitimacy analysis completed before synthesis.");
            return;
        }

        // Confirmation: Check if persistence data exists for THIS lens
        // If forceRefresh is true, we skip confirmation because user explicitly asked for it via Clear Cache
        if (currentResult && !forceRefresh) {
            if (!confirm(`Existing ${activeLens} synthesis found. Do you want to re-run it? This will overwrite the current findings.`)) {
                setActiveTab("synthesis");
                return;
            }
        }

        setSynthesisError(null);
        setIsSynthesizing(true);
        setActiveTab("synthesis");

        try {
            // Prepare documents for synthesis
            // Pass forceRefresh flag
            const result = await synthesizeComparison(selectedSources, activeLens, forceRefresh);

            // Update the record
            setSynthesisResults(prev => {
                return {
                    ...prev,
                    [activeLens]: result as unknown as ComparativeSynthesis
                }
            });

            // Reset force flag
            setForceRefresh(false);

        } catch (error) {
            console.error("Synthesis failed:", error);
            setSynthesisError("Failed to generate synthesis. Please try again.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    const initiateDeepAnalysis = (sourceId: string) => {
        setAnalyzingSourceId(sourceId);
        setIsPositionalityOpen(true);
    };

    const handleRunDeepAnalysis = async (positionality: PositionalityData) => {
        if (!analyzingSourceId) return;
        const sourceId = analyzingSourceId;
        const source = sources.find(s => s.id === sourceId);

        setIsPositionalityOpen(false);
        setAnalyzingSourceId(null);

        if (!source || !source.extractedText) return;

        setIsDeepAnalyzing(prev => ({ ...prev, [sourceId]: true }));

        try {
            // Run all 3 analyses in parallel
            const modes = ['cultural_framing', 'institutional_logics', 'legitimacy'] as const;

            const promises = modes.map(mode =>
                analyzeDocument(
                    source.extractedText!.substring(0, 50000),
                    mode,
                    'Policy Document',
                    true, // Forces refresh as this is an explicit user action
                    sourceId,
                    source.title,
                    positionality
                ).then(result => ({ mode, result }))
            );

            const results = await Promise.all(promises);

            // Construct updates
            const updates: Partial<Source> = {};
            results.forEach(({ mode, result }) => {
                if (mode === 'cultural_framing') updates.cultural_framing = result;
                if (mode === 'institutional_logics') updates.institutional_logics = result;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (mode === 'legitimacy') updates.legitimacy_analysis = result as any;
            });

            await updateSource(sourceId, updates);
            // alert(`Deep analysis complete for ${source.title}!`); // Optional: maybe too noisy

        } catch (error: any) {
            console.error("Deep analysis failed:", error);
            if (error.message?.includes("Insufficient Credits")) {
                if (confirm("Insufficient Credits. Would you like to top up now?")) {
                    window.location.href = "/settings/billing";
                }
            } else {
                alert(`Failed to complete deep analysis: ${error.message || "Unknown error"}`);
            }
        } finally {
            setIsDeepAnalyzing(prev => ({ ...prev, [sourceId]: false }));
        }
    };

    // Helper to render the "Run Deep Analysis" button if data is missing
    const renderAnalysisButtonOrContent = (source: Source, type: 'cultural' | 'logics' | 'legitimacy', content: React.ReactNode) => {

        const data = (type === 'cultural' ? source.cultural_framing :
            type === 'logics' ? source.institutional_logics :
                source.legitimacy_analysis) as Record<string, any> | undefined;

        // Check if data exists AND has meaningful content (not just empty object)
        const hasData = data && Object.keys(data).length > 0;

        if (hasData) {
            return (
                <div className="relative group">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 z-10 bg-white/50 hover:bg-white backdrop-blur-sm border border-slate-200 shadow-sm gap-2"
                        title="Re-run Analysis"
                        onClick={() => initiateDeepAnalysis(source.id)}
                        disabled={isDeepAnalyzing[source.id] || isReadOnly}
                    >
                        {isDeepAnalyzing[source.id] ? (
                            <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3 w-3 text-slate-500" />
                        )}
                        <span className="text-xs text-slate-500">
                            {isDeepAnalyzing[source.id] ? "Running..." : "Re-run"}
                        </span>
                    </Button>
                    <div className="pt-8">
                        {content}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center h-full min-h-[200px]">
                <Sparkles className="h-8 w-8 text-indigo-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Missing {type === 'cultural' ? 'Cultural' : type === 'logics' ? 'Logics' : 'Legitimacy'} Data</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                    Run a deep analysis to generate {type} insights for this document.
                </p>
                <Button
                    onClick={() => initiateDeepAnalysis(source.id)}
                    disabled={isDeepAnalyzing[source.id] || isReadOnly}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    title={isReadOnly ? "Deep analysis disabled in Demo Mode" : ""}
                >
                    {isDeepAnalyzing[source.id] ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Run Deep Analysis
                        </>
                    )}
                </Button>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PositionalityDialog
                isOpen={isPositionalityOpen}
                onClose={() => setIsPositionalityOpen(false)}
                onConfirm={handleRunDeepAnalysis}
            />

            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Policy Assemblages</h2>
                <p className="text-slate-500">Relational mapping of policy mobilities, mutations, and institutional tensions.</p>
            </div>

            {/* Definitions Card */}
            <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-700">Analysis Definitions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                        <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            <Globe2 className="h-4 w-4 text-blue-600" />
                            Cultural Framing
                        </div>
                        <p className="text-slate-600">
                            How a policy problem is constructed through specific cultural lenses (e.g., market-driven vs. rights-driven).
                        </p>
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            <Scale className="h-4 w-4 text-purple-600" />
                            Institutional Logics
                        </div>
                        <p className="text-slate-600">
                            The organizing principles that shape behavior and decision-making (e.g., state, market, profession, community).
                        </p>
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            <Scale className="h-4 w-4 text-emerald-600" />
                            Legitimacy
                        </div>
                        <p className="text-slate-600">
                            The moral justifications used to defend or critique a system (based on Boltanski & Thévenot&apos;s Orders of Worth).
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Document Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5" />
                        Select Documents to Compare
                    </CardTitle>
                    <CardDescription>Choose 2-3 policy documents for side-by-side analysis</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[0, 1, 2].map((index) => (
                            <div key={index}>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Document {index + 1} {index > 0 && "(Optional)"}
                                </label>
                                <Select
                                    value={selectedDocs[index] || ""}
                                    onValueChange={(value) => {
                                        const newSelection = [...selectedDocs];
                                        newSelection[index] = value;
                                        setSelectedDocs(newSelection.filter(Boolean));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select document..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {policyDocs.map((doc) => (
                                            <SelectItem key={doc.id} value={doc.id}>
                                                {doc.title}
                                                {doc.jurisdiction && (
                                                    <Badge variant="outline" className="ml-2">
                                                        {doc.jurisdiction}
                                                    </Badge>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Analysis Type Tabs */}
            {selectedSources.length >= 2 && (
                <>
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === "cultural" ? "default" : "outline"}
                            onClick={() => setActiveTab("cultural")}
                            className="flex-1"
                        >
                            <Globe2 className="mr-2 h-4 w-4" />
                            Cultural Framing
                        </Button>
                        <Button
                            variant={activeTab === "logics" ? "default" : "outline"}
                            onClick={() => setActiveTab("logics")}
                            className="flex-1"
                        >
                            <Scale className="mr-2 h-4 w-4" />
                            Institutional Logics
                        </Button>
                        <Button
                            variant={activeTab === "legitimacy" ? "default" : "outline"}
                            onClick={() => setActiveTab("legitimacy")}
                            className="flex-1"
                        >
                            <Scale className="mr-2 h-4 w-4" />
                            Legitimacy
                        </Button>
                        <div className="flex-1 flex gap-2">
                            <Button
                                variant={activeTab === "synthesis" ? "default" : "outline"}
                                onClick={handleSynthesize}
                                disabled={isSynthesizing || isReadOnly}
                                title={isReadOnly ? "Synthesis disabled in Demo Mode" : ""}
                                className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                            >
                                {isSynthesizing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Synthesize
                            </Button>
                            {currentResult && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm(`Clear cached synthesis for ${activeLens}?`)) {
                                            setForceRefresh(true);
                                            setSynthesisResults(prev => {
                                                const next = { ...prev };
                                                delete next[activeLens];
                                                return next;
                                            });
                                        }
                                    }}
                                    disabled={isReadOnly}
                                    title={isReadOnly ? "Cache clearing disabled in Demo Mode" : "Clear Cache & Force Refresh Next Run"}
                                    className="text-slate-400 hover:text-red-600 shrink-0"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {synthesisError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {synthesisError}
                        </div>
                    )}

                    {/* Cultural Framing Comparison */}
                    {activeTab === "cultural" && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cultural Framing Comparison</CardTitle>
                                    <CardDescription>
                                        How do these jurisdictions differ in their cultural assumptions about AI governance?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {selectedSources.map((source, idx) => (
                                            <div key={idx} className="space-y-4">
                                                {renderAnalysisButtonOrContent(source, 'cultural', (
                                                    <div className="space-y-8 animate-in fade-in duration-500">
                                                        {/* Cultural Distinctiveness Scores */}
                                                        <Card className="bg-slate-50 relative border-blue-100">
                                                            <CardContent className="pt-6 text-center">
                                                                <div className="text-3xl font-bold text-slate-900">
                                                                    {((source.cultural_framing?.cultural_distinctiveness_score ?? 0) * 100).toFixed(0)}%
                                                                </div>
                                                                <div className="text-sm text-slate-600 mt-1 font-medium">
                                                                    {source.title}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-2 italic px-2">
                                                                    {source.cultural_framing?.dominant_cultural_logic}
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Dimension Comparison */}
                                                        {(["state_market_society", "technology_role", "rights_conception", "historical_context", "epistemic_authority"] as const).map((dimension) => (
                                                            <div key={dimension} className="space-y-1">
                                                                <h4 className="font-semibold text-xs uppercase text-slate-500">
                                                                    {dimension.replace(/_/g, " ")}
                                                                </h4>
                                                                <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
                                                                    {source.cultural_framing?.[dimension] || "Not analyzed"}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Institutional Logics Comparison */}
                    {activeTab === "logics" && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Institutional Logics Comparison</CardTitle>
                                    <CardDescription>
                                        Which institutional logics dominate in each jurisdiction?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {selectedSources.map((source, idx) => (
                                            <div key={idx}>
                                                {renderAnalysisButtonOrContent(source, 'logics', (
                                                    <div className="space-y-6 animate-in fade-in duration-500">
                                                        <Card className="bg-slate-50 relative border-purple-100">
                                                            <CardContent className="pt-6 text-center">
                                                                <Badge className="text-lg px-4 py-2 capitalize mb-2">
                                                                    {source.institutional_logics?.dominant_logic || "Unknown"}
                                                                </Badge>
                                                                <div className="text-sm font-medium text-slate-900">
                                                                    {source.title}
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Logic Strengths */}
                                                        <div className="space-y-3">
                                                            {(["market", "state", "professional", "community"] as const).map(logic => {
                                                                const Icon = logicIcons[logic];
                                                                const logicData = source.institutional_logics?.logics?.[logic];
                                                                return (
                                                                    <div key={logic} className={`p-3 rounded border ${logicColors[logic].replace('text-', 'border-').replace('bg-', 'bg-opacity-10 ')}`}>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2 font-semibold capitalize text-sm">
                                                                                <Icon className="h-4 w-4" />
                                                                                {logic}
                                                                            </div>
                                                                            <span className="text-sm font-bold">
                                                                                {((logicData?.strength || 0) * 100).toFixed(0)}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                                            <div
                                                                                className="bg-current h-full"
                                                                                style={{ width: `${(logicData?.strength || 0) * 100}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>

                                                        {/* Conflicts */}
                                                        <div>
                                                            <h4 className="font-semibold text-xs uppercase text-slate-500 mb-2">Key Conflicts</h4>
                                                            {source.institutional_logics?.logic_conflicts?.map((conflict, cIdx) => (
                                                                <div key={cIdx} className="text-xs p-2 bg-amber-50 rounded border border-amber-200 mb-2">
                                                                    <div className="font-bold text-amber-800 mb-1">{conflict.between}</div>
                                                                    <div className="text-slate-600 mb-1">{conflict.site_of_conflict}</div>
                                                                    <div className="text-slate-500 italic">{conflict.resolution_strategy}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Legitimacy Analysis Comparison */}
                    {activeTab === "legitimacy" && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Legitimacy & Justification Comparison</CardTitle>
                                    <CardDescription>
                                        Compare the moral arguments and orders of worth used in each jurisdiction.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {selectedSources.map((source, idx) => (
                                            <div key={idx} className="space-y-4">
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <h3 className="font-semibold text-lg">{source.title}</h3>
                                                </div>
                                                {renderAnalysisButtonOrContent(source, 'legitimacy', (
                                                    source.legitimacy_analysis ? (
                                                        <LegitimacyAnalysisView analysis={source.legitimacy_analysis} />
                                                    ) : null
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Comparative Synthesis Tab */}
                    {activeTab === "synthesis" && (
                        <div className="space-y-6">
                            <Card className="border-indigo-100 shadow-sm">
                                <CardHeader className="bg-indigo-50/50">
                                    <CardTitle className="text-indigo-900 flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-indigo-600" />
                                        Comparative Synthesis
                                    </CardTitle>
                                    <CardDescription>
                                        AI-generated synthesis of cultural, institutional, and legitimacy dynamics across jurisdictions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {!currentResult && !isSynthesizing && (
                                        <div className="text-center py-12 text-slate-500">
                                            <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                            <p className="font-medium text-slate-700">No {activeLens} analysis generated yet</p>
                                            <p className="text-sm mt-2 max-w-sm mx-auto">
                                                Each interpretation lens requires a separate AI analysis. Click "Synthesize" to generate findings specifically for the <strong>{activeLens}</strong> perspective.
                                            </p>
                                        </div>
                                    )}

                                    {isSynthesizing && (
                                        <div className="text-center py-12 text-slate-500">
                                            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-500" />
                                            <p>Synthesizing analysis across {selectedSources.length} documents...</p>
                                            <p className="text-xs text-slate-400 mt-2">This may take a minute.</p>
                                        </div>
                                    )}

                                    {currentResult && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            {/* Top Bar: Lens Selector */}
                                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                                                <div className="text-sm font-medium text-slate-600">Active Interpretation Lens:</div>
                                                <LensSelector currentLens={activeLens} onLensChange={setActiveLens} />
                                            </div>

                                            {/* Executive Summary with Assemblage Tone */}
                                            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
                                                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                                    Relational Summary
                                                </h3>
                                                <RebuttalPopover targetId="summary" initialRebuttal="" onSave={(id, txt) => console.log(id, txt)}>
                                                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed cursor-pointer hover:bg-white/50 transition-colors rounded p-2 -ml-2">
                                                        <p className="whitespace-pre-wrap">{currentResult.synthesis_summary}</p>
                                                    </div>
                                                </RebuttalPopover>
                                            </div>

                                            {/* Network & Stabilization Row */}
                                            <div className="grid lg:grid-cols-3 gap-6 min-h-[400px]">
                                                <div className="lg:col-span-2 h-full">
                                                    {currentResult.assemblage_network && (
                                                        <RhizomeNetwork network={currentResult.assemblage_network} />
                                                    )}
                                                </div>
                                                <div className="h-full">
                                                    {currentResult.stabilization_mechanisms && (
                                                        <StabilizationCard mechanisms={currentResult.stabilization_mechanisms} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mutation Table */}
                                            {currentResult.concept_mutations && (
                                                <div className="mt-8">
                                                    <MutationTable mutations={currentResult.concept_mutations} />
                                                </div>
                                            )}

                                            {/* Friction & Desire */}
                                            {currentResult.desire_and_friction && (
                                                <div className="mt-8">
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                                        Friction & Desire
                                                    </h3>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {currentResult.desire_and_friction.map((item, i) => (
                                                            <div key={i} className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 group-hover:w-2 transition-all" />
                                                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">{item.topic}</div>
                                                                <div className="font-semibold text-slate-900 mb-3 leading-snug">{item.friction_point}</div>
                                                                <div className="mt-auto pt-3 border-t border-slate-100">
                                                                    <span className="text-xs text-slate-400 uppercase font-semibold">Underlying Desire</span>
                                                                    <div className="text-sm font-medium text-indigo-700 mt-0.5">{item.underlying_desire}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Institutional Conflicts */}
                                            {currentResult.institutional_conflict && (
                                                <div className="mt-8">
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                        <Building className="h-5 w-5 text-purple-600" />
                                                        Institutional Conflicts
                                                    </h3>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {currentResult.institutional_conflict?.map((conf, i) => (
                                                            <Card key={i} className="border-purple-100 bg-purple-50/30 hover:bg-purple-50/50 transition-colors">
                                                                <CardHeader className="pb-2">
                                                                    <CardTitle className="text-base font-bold text-purple-900">{conf.conflict_type}</CardTitle>
                                                                    <CardDescription className="text-slate-700">{conf.description}</CardDescription>
                                                                </CardHeader>
                                                                <CardContent className="space-y-3 text-sm">
                                                                    {conf.evidence?.map((ev, eIdx) => (
                                                                        <div key={eIdx} className="flex gap-2 items-start">
                                                                            <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 mt-0.5 bg-white border-purple-200 text-purple-700">
                                                                                {ev.policy}
                                                                            </Badge>
                                                                            <span className="italic text-slate-600 leading-snug">&quot;{ev.text}&quot;</span>
                                                                        </div>
                                                                    ))}
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Legitimacy Tensions */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Scale className="h-5 w-5 text-emerald-600" />
                                                    Legitimacy Tensions
                                                </h3>
                                                <div className="grid gap-4">
                                                    {currentResult.legitimacy_tensions?.map((tens, i) => (
                                                        <Card key={i} className="border-emerald-100 bg-emerald-50/30">
                                                            <CardHeader className="pb-2">
                                                                <CardTitle className="text-base font-bold text-emerald-900">{tens.tension_type}</CardTitle>
                                                                <CardDescription className="text-slate-700">{tens.description}</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3 text-sm">
                                                                {tens.evidence?.map((ev, eIdx) => (
                                                                    <div key={eIdx} className="flex gap-2 items-start">
                                                                        <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 mt-0.5 bg-white border-emerald-200 text-emerald-700">
                                                                            {ev.policy}
                                                                        </Badge>
                                                                        <span className="italic text-slate-600 leading-snug">&quot;{ev.text}&quot;</span>
                                                                    </div>
                                                                ))}
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Coloniality Assessment */}
                                            {currentResult.coloniality_assessment && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                                                    <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5" />
                                                        Coloniality Assessment
                                                    </h3>
                                                    <p className="text-amber-800 leading-relaxed">
                                                        {currentResult.coloniality_assessment}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedSources.length < 2 && (
                                        <Card className="bg-slate-50 border-dashed">
                                            <CardContent className="pt-6 text-center text-slate-500">
                                                <Globe2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                                <p>Select at least 2 documents above to begin comparing</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )
            }
        </div >
    );
}
