"use client";
// Force rebuild trigger

import { useState, useEffect, useMemo } from "react";
import { useSources } from "@/hooks/useSources";
import { useServerStorage } from "@/hooks/useServerStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Globe2, Scale, Users, Building, Loader2, Sparkles, AlertTriangle, RefreshCw, Wand2, PlayCircle } from "lucide-react";
import { LegitimacyAnalysisView } from "@/components/policy/LegitimacyAnalysisView";
import { synthesizeComparison, analyzeDocument } from "@/services/analysis";
import { PositionalityDialog } from "@/components/reflexivity/PositionalityDialog";

import { Source, ComparativeSynthesis, PositionalityData } from "@/types";

export default function ComparisonPage() {
    const { sources, isLoading, updateSource } = useSources();

    // Filter for policy documents (non-traces)
    const policyDocs = useMemo(() => sources.filter(s => s.type !== "Trace"), [sources]);

    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"cultural" | "logics" | "legitimacy" | "synthesis">("cultural");
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [synthesisResult, setSynthesisResult] = useServerStorage<ComparativeSynthesis | null>("comparison_synthesis_result", null);
    const [synthesisError, setSynthesisError] = useState<string | null>(null);
    // const [regeneratingIds, setRegeneratingIds] = useState<Record<string, boolean>>({});

    // Deep Analysis State
    const [isPositionalityOpen, setIsPositionalityOpen] = useState(false);
    const [analyzingSourceId, setAnalyzingSourceId] = useState<string | null>(null);
    const [isDeepAnalyzing, setIsDeepAnalyzing] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isLoading) return;

        // Auto-select first two docs
        if (policyDocs.length >= 2 && selectedDocs.length === 0) {
            setSelectedDocs([policyDocs[0].id, policyDocs[1].id]);
        }
    }, [isLoading, selectedDocs.length, policyDocs]);

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

        // Confirmation: Check if persistence data exists
        if (synthesisResult) {
            if (!confirm("Existing synthesis found. Do you want to re-run it? This will overwrite the current findings.")) {
                // If they cancel, we just switch to the tab to show existing results
                setActiveTab("synthesis");
                return;
            }
        }

        setSynthesisError(null);
        setIsSynthesizing(true);
        setActiveTab("synthesis");

        try {
            // Prepare documents for synthesis
            const result = await synthesizeComparison(selectedSources);
            setSynthesisResult(result as unknown as ComparativeSynthesis);
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

        } catch (error) {
            console.error("Deep analysis failed:", error);
            alert("Failed to complete deep analysis. Check console for details.");
        } finally {
            setIsDeepAnalyzing(prev => ({ ...prev, [sourceId]: false }));
        }
    };

    // Helper to render the "Run Deep Analysis" button if data is missing
    const renderAnalysisButtonOrContent = (source: Source, type: 'cultural' | 'logics' | 'legitimacy', content: React.ReactNode) => {
        const hasData = type === 'cultural' ? !!source.cultural_framing :
            type === 'logics' ? !!source.institutional_logics :
                !!source.legitimacy_analysis;

        if (hasData) return content;

        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center h-full min-h-[200px]">
                <Sparkles className="h-8 w-8 text-indigo-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Missing {type === 'cultural' ? 'Cultural' : type === 'logics' ? 'Logics' : 'Legitimacy'} Data</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                    Run a deep analysis to generate {type} insights for this document.
                </p>
                <Button
                    onClick={() => initiateDeepAnalysis(source.id)}
                    disabled={isDeepAnalyzing[source.id]}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
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
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Comparative Analysis</h2>
                <p className="text-slate-500">Compare cultural framing, institutional logics, and legitimacy across jurisdictions.</p>
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
                        <Button
                            variant={activeTab === "synthesis" ? "default" : "outline"}
                            onClick={handleSynthesize}
                            className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                        >
                            {isSynthesizing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Synthesize
                        </Button>
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
                                    {!synthesisResult && !isSynthesizing && (
                                        <div className="text-center py-12 text-slate-500">
                                            <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                            <p>Click &quot;Synthesize&quot; to generate a comparative analysis.</p>
                                        </div>
                                    )}

                                    {isSynthesizing && (
                                        <div className="text-center py-12 text-slate-500">
                                            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-500" />
                                            <p>Synthesizing analysis across {selectedSources.length} documents...</p>
                                            <p className="text-xs text-slate-400 mt-2">This may take a minute.</p>
                                        </div>
                                    )}

                                    {synthesisResult && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            {/* Executive Summary */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-3">Executive Summary</h3>
                                                <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-lg border border-slate-100">
                                                    <p className="whitespace-pre-wrap">{synthesisResult.executive_summary}</p>
                                                </div>
                                            </div>

                                            {/* Deep Dive Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <Globe2 className="h-4 w-4 text-blue-600" />
                                                            Cultural Divergence
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-slate-600">{synthesisResult.cultural_divergence}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <Building className="h-4 w-4 text-purple-600" />
                                                            Institutional Conflict
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-slate-600">{synthesisResult.institutional_conflict}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <Scale className="h-4 w-4 text-emerald-600" />
                                                            Legitimacy Tensions
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-slate-600">{synthesisResult.legitimacy_tensions}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Synthesis Matrix */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Comparative Matrix</h3>
                                                <div className="border rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                                                            <tr>
                                                                <th className="px-6 py-3 w-1/4">Dimension</th>
                                                                <th className="px-6 py-3">Comparative Analysis</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {synthesisResult.synthesis_matrix?.map((row: { dimension: string; comparison: string }, idx: number) => (
                                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                                    <td className="px-6 py-4 font-medium text-slate-900 bg-slate-50/30">
                                                                        {row.dimension}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-slate-600">
                                                                        {row.comparison}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}

            {selectedSources.length < 2 && (
                <Card className="bg-slate-50 border-dashed">
                    <CardContent className="pt-6 text-center text-slate-500">
                        <Globe2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p>Select at least 2 documents above to begin comparing</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
