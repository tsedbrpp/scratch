"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, Network, Loader2 } from "lucide-react";
import { CulturalHoleCard } from "@/components/CulturalHoleCard";
import { CulturalHoleNetwork } from "@/components/CulturalHoleNetwork";
import { CulturalAnalysisResult } from "@/types/cultural";

export default function CulturalAnalysisPage() {
    const { sources, isLoading } = useSources();
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [culturalAnalysis, setCulturalAnalysis] = useState<CulturalAnalysisResult | null>(null);
    const [selectedLensId, setSelectedLensId] = useState<string>("default");

    const theoreticalLenses = [
        { id: "default", name: "Standard Cultural Analysis", description: "General analysis of cultural framing and epistemic authority." },
        { id: "institutional_logics", name: "Institutional Logics", description: "Focus on conflicting institutional orders (e.g., market vs. state)." },
        { id: "critical_data_studies", name: "Critical Data Studies", description: "Focus on power dynamics, surveillance, and data justice." },
        { id: "actor_network_theory", name: "Actor-Network Theory", description: "Focus on the agency of non-human actors and translation processes." }
    ];

    // Filter sources that have text available for analysis
    const analyzedSources = sources.filter(s => s.analysis || s.extractedText);

    const toggleSource = (sourceId: string) => {
        setSelectedSources((prev) =>
            prev.includes(sourceId)
                ? prev.filter((id) => id !== sourceId)
                : [...prev, sourceId]
        );
    };

    const handleAnalyze = async () => {
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
                lensId: selectedLensId
            };

            console.log('Sending request to /api/cultural-analysis...');

            const response = await fetch('/api/cultural-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                    await fetch('/api/logs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: "Cultural Analysis",
                            details: {
                                lens: selectedLensId,
                                sourceCount: sourcesToAnalyze.length,
                                clustersFound: data.analysis.clusters.length,
                                holesFound: data.analysis.holes.length
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
        } catch (error: any) {
            console.error("Cultural analysis error:", error);
            alert(`Failed to perform cultural analysis: ${error.message || error}`);
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

    const exportToCSV = () => {
        if (!culturalAnalysis) return;

        // 1. Clusters CSV
        const clustersHeader = "Type,Name,Themes,Sources\n";
        const clustersRows = culturalAnalysis.clusters.map(c =>
            `Cluster,"${c.name}","${c.themes.join(', ')}","${c.sources.join(', ')}"`
        ).join("\n");

        // 2. Holes CSV
        const holesHeader = "\nType,Gap Between,Distance,Bridging Concepts,Opportunity,Policy Implication\n";
        const holesRows = culturalAnalysis.holes.map(h =>
            `Hole,"${h.clusterA} - ${h.clusterB}",${h.distance},"${h.bridgingConcepts.join(', ')}","${h.opportunity}","${h.policyImplication}"`
        ).join("\n");

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Analysis Summary\n" + `"${culturalAnalysis.summary.replace(/"/g, '""')}"\n\n`
            + clustersHeader + clustersRows
            + holesHeader + holesRows;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `cultural_analysis_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Hermeneutic Interpretation
                </h2>
                <p className="text-slate-500">
                    Identify gaps between discourse clusters to discover innovation opportunities and policy interventions.
                </p>
            </div>

            {/* Introduction Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        <CardTitle>What are Cultural Holes?</CardTitle>
                    </div>
                    <CardDescription>
                        Understanding gaps in entrepreneurial ecosystems
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                    <p>
                        <strong>Cultural holes</strong> are gaps between clusters of understandings, practices, or discourse within an ecosystem. These gaps represent opportunities for new ideas, practices, or values to emerge.
                    </p>
                    <p>
                        By analyzing discourse from multiple policy documents, this tool:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Extracts key themes from each document</li>
                        <li>Clusters similar themes into "discourse communities"</li>
                        <li>Identifies gaps between distant clusters</li>
                        <li>Suggests bridging concepts for policy intervention</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Theoretical Lens Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Theoretical Lens</CardTitle>
                    <CardDescription>
                        Select a theoretical framework to guide the hermeneutic interpretation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {theoreticalLenses.map((lens) => (
                            <div
                                key={lens.id}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedLensId === lens.id
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-slate-200 hover:border-slate-300"
                                    }`}
                                onClick={() => setSelectedLensId(lens.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">
                                            {lens.name}
                                        </h4>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {lens.description}
                                        </p>
                                    </div>
                                    {selectedLensId === lens.id && (
                                        <Badge className="bg-indigo-500 text-white">
                                            Active
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

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
                                                <h4 className="font-semibold text-slate-900">
                                                    {source.title}
                                                </h4>
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
                                <div className="text-sm text-slate-600">
                                    {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''} selected
                                </div>
                                <Button
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                    onClick={handleAnalyze}
                                    disabled={selectedSources.length < 2 || isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Lightbulb className="mr-2 h-4 w-4" />
                                            Detect Cultural Holes
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
                                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                                        Export CSV
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

                    {/* Network Visualization */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Network className="h-5 w-5 text-blue-600" />
                                <CardTitle>Discourse Cluster Network</CardTitle>
                            </div>
                            <CardDescription>
                                Visual representation of theme clusters and cultural holes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CulturalHoleNetwork
                                clusters={culturalAnalysis.clusters}
                                holes={culturalAnalysis.holes}
                            />
                        </CardContent>
                    </Card>

                    {/* Cluster Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Discourse Clusters</CardTitle>
                            <CardDescription>
                                {culturalAnalysis.clusters.length} clusters identified from {selectedSources.length} sources
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {culturalAnalysis.clusters.map((cluster) => (
                                    <div
                                        key={cluster.id}
                                        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <h4 className="font-semibold text-blue-900 mb-2">
                                            {cluster.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {cluster.themes.map((theme, i) => (
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
                                                                "{quote}"
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

                    {/* Cultural Holes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-6 w-6 text-amber-600" />
                            <h3 className="text-2xl font-bold text-slate-900">
                                Cultural Holes Detected
                            </h3>
                            <Badge className="bg-amber-100 text-amber-800">
                                {culturalAnalysis.holes.length} gap{culturalAnalysis.holes.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>

                        {culturalAnalysis.holes.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-slate-500">
                                    <p>No significant cultural holes detected.</p>
                                    <p className="text-sm mt-2">
                                        The selected sources have highly similar discourse patterns.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {culturalAnalysis.holes.map((hole) => (
                                    <CulturalHoleCard
                                        key={hole.id}
                                        hole={hole}
                                        clusters={culturalAnalysis.clusters}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
}
