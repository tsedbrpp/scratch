"use client";

import { useState } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lightbulb, Sparkles, Loader2, BookOpen, HelpCircle, FileText } from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";
import { CulturalAnalysisResult } from "@/types/cultural";
import { MultiLensAnalysis } from "@/components/reflexivity/MultiLensAnalysis";
import { exportSummaryToCSV, exportDetailedMatrixToCSV } from "@/lib/export-utils";

export default function CulturalAnalysisPage() {
    const { sources, isLoading, refresh } = useSources();
    const { isReadOnly } = useDemoMode();
    const [selectedSources, setSelectedSources] = useServerStorage<string[]>("cultural_selected_sources", []);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [culturalAnalysis, setCulturalAnalysis] = useServerStorage<CulturalAnalysisResult | null>("cultural_analysis_result_v5", null);
    const [selectedLensId] = useServerStorage<string>("cultural_lens_id", "default");
    const [forceRefresh, setForceRefresh] = useState(false);

    // Helper function to determine actual document type from both type field and title

    // Helper function to determine actual document type from both type field and title
    const getDocumentType = (source: typeof sources[0]): "Policy" | "Web" | "Trace" => {
        // Check title prefix first (more reliable for user-added sources)
        if (source.title.startsWith('[Web]')) return "Web";
        if (source.title.startsWith('[Trace]')) return "Trace";

        // Fall back to type field
        if (source.type === 'Web') return "Web";
        if (source.type === 'Trace') return "Trace";

        // Default to Policy for PDF, Text, Word types
        return "Policy";
    };

    // Filter sources that have text available for analysis, checking for Policy Documents specifically or excluding Traces/Web.
    // User request: "filter out trace and web and just list the policy documents"
    const analyzedSources = sources.filter(s => {
        if (!(s.analysis || s.extractedText)) return false;

        const docType = getDocumentType(s);
        return docType === "Policy"; // Only show Policy documents
    });

    const toggleSource = (sourceId: string) => {
        setSelectedSources((prev) =>
            prev.includes(sourceId)
                ? prev.filter((id) => id !== sourceId)
                : [...prev, sourceId]
        );
    };

    const handleAnalyze = async () => {
        if (isReadOnly) {
            alert("Analysis disabled in Demo Mode");
            return;
        }

        if (selectedSources.length < 2) {
            alert("Please select at least 2 sources for cultural analysis.");
            return;
        }

        setIsAnalyzing(true);
        console.log('Starting cultural analysis...');

        try {
            const sourcesToAnalyze = analyzedSources.filter((s) =>
                selectedSources.includes(s.id)
            );

            console.log('Sources to analyze:', sourcesToAnalyze.map(s => ({ id: s.id, title: s.title, hasText: !!s.extractedText })));

            const requestBody = {
                sources: sourcesToAnalyze.map((s) => ({
                    id: s.id,
                    title: s.title,
                    text: s.extractedText?.substring(0, 4000) || '',
                })),
                lensId: selectedLensId,
                forceRefresh: forceRefresh
            };

            console.log('Sending request to /api/cultural-analysis...');

            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }
            console.log('Request headers:', headers);
            console.log('Demo mode:', process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE);
            console.log('Demo User ID:', process.env.NEXT_PUBLIC_DEMO_USER_ID);

            const response = await fetch('/api/cultural-analysis', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success && data.analysis) {
                console.log('Analysis successful, setting results');
                setCulturalAnalysis(data.analysis);

                // Log the methodological action
                try {
                    const logHeaders: HeadersInit = { 'Content-Type': 'application/json' };
                    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                        logHeaders['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
                    }

                    await fetch('/api/logs', {
                        method: 'POST',
                        headers: logHeaders,
                        body: JSON.stringify({
                            action: "Cultural Analysis",
                            details: {
                                lens: selectedLensId,
                                sourceCount: sourcesToAnalyze.length,
                                clustersFound: data.analysis.clusters.length
                            }
                        })
                    });
                } catch (logError) {
                    console.error("Failed to log action:", logError);
                }
            } else {
                console.error('Analysis failed:', data.error);
                alert("Cultural analysis failed: " + (data.error || "Unknown error"));
            }
        } catch (error: unknown) {
            console.error("Cultural analysis error:", error);
            alert(`Failed to perform cultural analysis: ${(error as Error).message || String(error)}`);
        } finally {
            console.log('Analysis complete, resetting button');
            setIsAnalyzing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const handleExportSummary = () => {
        if (!culturalAnalysis) return;
        exportSummaryToCSV(culturalAnalysis);
    };

    const handleExportDetailed = () => {
        if (!culturalAnalysis) return;
        exportDetailedMatrixToCSV(culturalAnalysis);
    };



    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Cultural Framing of Discursive Fields
                </h2>
                <p className="text-slate-500">
                    Identify gaps between discourse clusters within the algorithmic assemblage to discover innovation opportunities and legitimacy dynamics.
                </p>
            </div>

            <MultiLensAnalysis sources={sources} onRefresh={refresh} />



            {/* Source Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Sources for Analysis</CardTitle>
                    <CardDescription>
                        Choose at least 2 analyzed documents to detect cultural holes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {analyzedSources.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No analyzed sources available.</p>
                            <p className="text-sm mt-2">
                                Please upload and analyze documents on the Data page first.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-3">
                                {analyzedSources.map((source) => (
                                    <div
                                        key={source.id}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedSources.includes(source.id)
                                            ? "border-amber-500 bg-amber-50"
                                            : "border-slate-200 hover:border-slate-300"
                                            }`}
                                        onClick={() => toggleSource(source.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-900">
                                                        {source.title}
                                                    </h4>
                                                    <Badge
                                                        className={
                                                            getDocumentType(source) === "Policy"
                                                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                                                : getDocumentType(source) === "Web"
                                                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                                    : "bg-green-100 text-green-700 border-green-200"
                                                        }
                                                        variant="outline"
                                                    >
                                                        {getDocumentType(source)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {source.description}
                                                </p>
                                            </div>
                                            {selectedSources.includes(source.id) && (
                                                <Badge className="bg-amber-500 text-white">
                                                    Selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-slate-600 flex items-center gap-4">
                                    <span>{selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''} selected</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={forceRefresh}
                                            onChange={(e) => setForceRefresh(e.target.checked)}
                                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="text-sm text-slate-600">Force Refresh (Ignore Cache)</span>
                                    </label>
                                </div>
                                <Button
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                    onClick={handleAnalyze}
                                    disabled={selectedSources.length < 2 || isAnalyzing || isReadOnly} // [NEW]
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Lightbulb className="mr-2 h-4 w-4" />
                                            Detect Discourse Clusters
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            {culturalAnalysis && (
                <div className="space-y-6">
                    {/* Analysis Summary */}
                    {culturalAnalysis.summary && (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-amber-600" />
                                        <CardTitle className="text-lg">Analysis Summary</CardTitle>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleExportSummary}>
                                        Export Summary
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleExportDetailed} className="gap-2">
                                        <FileText className="h-4 w-4" />
                                        Export Detailed Matrix
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {culturalAnalysis.summary}
                                </p>
                            </CardContent>
                        </Card>
                    )}


                    {/* Methodology Explanation */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-base">Methodology: Discourse Field Analysis</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-slate-700">
                            <div>
                                <p className="font-semibold text-blue-900 mb-1">What are Discourse Clusters?</p>
                                <p>Groups of related themes that use similar language and concepts. Each cluster represents a coherent &quot;discourse community&quot; or &quot;regime of truth&quot;.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900 mb-1">Epistemic Framing</p>
                                <p>By analyzing how these clusters form, we can identify which knowledge systems are dominant (e.g., Technical Safety) and which are marginalized or fragmented.</p>
                            </div>
                        </CardContent>
                    </Card>



                    {/* Cluster Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Discourse Clusters</CardTitle>
                            <CardDescription>
                                {culturalAnalysis.clusters.length} clusters identified from {selectedSources.length} sources (sorted by size)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {[...culturalAnalysis.clusters]
                                    .sort((a, b) => b.size - a.size)
                                    .map((cluster) => (
                                        <div
                                            key={cluster.id}
                                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                        >
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-2 mb-2 cursor-help group w-fit">
                                                            <h4 className="font-semibold text-blue-900 underline decoration-dotted decoration-blue-300">
                                                                {cluster.name}
                                                            </h4>
                                                            <HelpCircle className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    {cluster.description && (
                                                        <TooltipContent className="max-w-xs bg-white shadow-xl border-blue-100 p-3">
                                                            <p className="font-semibold text-xs text-blue-900 mb-1">Cluster Definition</p>
                                                            <p className="text-xs text-slate-600 leading-snug">{cluster.description}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {cluster.themes.filter(theme => theme !== cluster.name).map((theme, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                        className="text-xs bg-white"
                                                    >
                                                        {theme}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-600">
                                                {cluster.size} theme{cluster.size !== 1 ? 's' : ''} from {cluster.sources.length} source{cluster.sources.length !== 1 ? 's' : ''}
                                            </p>

                                            {
                                                cluster.quotes && cluster.quotes.length > 0 && (
                                                    <details className="mt-3 pt-2 border-t border-blue-200">
                                                        <summary className="text-xs font-medium text-blue-700 cursor-pointer hover:text-blue-900 select-none flex items-center gap-1">
                                                            Show Evidence ({cluster.quotes.length})
                                                        </summary>
                                                        <ul className="mt-2 space-y-2">
                                                            {cluster.quotes.slice(0, 3).map((quote, i) => (
                                                                <li key={i} className="text-xs text-slate-600 italic border-l-2 border-blue-300 pl-2">
                                                                    &quot;{quote.text}&quot;
                                                                    <span className="block text-[10px] text-slate-400 not-italic mt-1">— {quote.source}</span>
                                                                </li>
                                                            ))}
                                                            {cluster.quotes.length > 3 && (
                                                                <li className="text-xs text-blue-500 pl-2">
                                                                    + {cluster.quotes.length - 3} more citations...
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </details>
                                                )
                                            }
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>


                </div>
            )
            }
        </div >
    );
}
