"use client";

import { useState, useEffect } from "react";
import { useSources } from "@/hooks/useSources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Globe2, Scale, Users, Building, Loader2, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { LegitimacyAnalysisView } from "@/components/policy/LegitimacyAnalysisView";
import { synthesizeComparison } from "@/services/analysis";

import { Source, AnalysisResult, ComparativeSynthesis } from "@/types";

type CulturalFraming = NonNullable<AnalysisResult>;

export default function ComparisonPage() {
    const { sources, isLoading, updateSource } = useSources();
    const [policyDocs, setPolicyDocs] = useState<Source[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"cultural" | "logics" | "legitimacy" | "synthesis">("cultural");
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [synthesisResult, setSynthesisResult] = useState<ComparativeSynthesis | null>(null);
    const [synthesisError, setSynthesisError] = useState<string | null>(null);
    const [regeneratingIds, setRegeneratingIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isLoading) return;

        // Filter for policy documents (non-traces)
        const policies = sources.filter(s => s.type !== "Trace");
        setPolicyDocs(policies);

        // Auto-select first two docs
        if (policies.length >= 2 && selectedDocs.length === 0) {
            setSelectedDocs([policies[0].id, policies[1].id]);
        }
    }, [sources, isLoading, selectedDocs.length]);

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

        setSynthesisError(null);
        setIsSynthesizing(true);
        setActiveTab("synthesis");

        try {
            // Prepare documents for synthesis (strip unnecessary fields to save tokens if needed, but passing full object for now is fine as they contain the analysis)
            const result = await synthesizeComparison(selectedSources);
            // @ts-ignore - The API returns the synthesis in the analysis field, but typed as AnalysisResult. We cast it or handle it.
            // Actually, the API returns the JSON directly.
            setSynthesisResult(result as unknown as ComparativeSynthesis);
        } catch (error) {
            console.error("Synthesis failed:", error);
            setSynthesisError("Failed to generate synthesis. Please try again.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleRegenerateCultural = async (source: Source) => {
        setRegeneratingIds(prev => ({ ...prev, [source.id]: true }));

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: source.extractedText?.substring(0, 50000) || '',
                    sourceType: 'Policy Document',
                    analysisMode: 'cultural_framing',
                    force: true,
                    documentId: source.id,
                    title: source.title
                })
            });

            const data = await response.json();
            if (data.success && data.analysis) {
                await updateSource(source.id, { cultural_framing: data.analysis });
            } else {
                alert("Regeneration failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Regeneration error:", error);
            alert("Failed to regenerate analysis.");
        } finally {
            setRegeneratingIds(prev => ({ ...prev, [source.id]: false }));
        }
    };

    const handleRegenerateLogics = async (source: Source) => {
        setRegeneratingIds(prev => ({ ...prev, [source.id]: true }));
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: source.extractedText?.substring(0, 50000) || '',
                    sourceType: 'Policy Document',
                    analysisMode: 'institutional_logics',
                    force: true,
                    documentId: source.id,
                    title: source.title
                })
            });
            const data = await response.json();
            if (data.success && data.analysis) {
                await updateSource(source.id, { institutional_logics: data.analysis });
            } else {
                alert("Regeneration failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Regeneration error:", error);
            alert("Failed to regenerate analysis.");
        } finally {
            setRegeneratingIds(prev => ({ ...prev, [source.id]: false }));
        }
    };

    const handleRegenerateLegitimacy = async (source: Source) => {
        setRegeneratingIds(prev => ({ ...prev, [source.id]: true }));
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: source.extractedText?.substring(0, 50000) || '',
                    sourceType: 'Policy Document',
                    analysisMode: 'legitimacy',
                    force: true,
                    documentId: source.id,
                    title: source.title
                })
            });
            const data = await response.json();
            if (data.success && data.analysis) {
                await updateSource(source.id, { legitimacy_analysis: data.analysis });
            } else {
                alert("Regeneration failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Regeneration error:", error);
            alert("Failed to regenerate analysis.");
        } finally {
            setRegeneratingIds(prev => ({ ...prev, [source.id]: false }));
        }
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
                            The moral justifications used to defend or critique a system (based on Boltanski & Thévenot's Orders of Worth).
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
                        // ... existing cultural framing content
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cultural Framing Comparison</CardTitle>
                                    <CardDescription>
                                        How do these jurisdictions differ in their cultural assumptions about AI governance?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!selectedSources[0]?.cultural_framing && (
                                        <div className="text-center py-8 text-slate-500">
                                            <p className="mb-4">No cultural framing analysis yet.</p>
                                            <p className="text-sm">
                                                Run cultural framing analysis on these documents first.
                                            </p>
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block max-w-2xl mx-auto">
                                                analysisMode: 'cultural_framing'
                                            </code>
                                        </div>
                                    )}

                                    {selectedSources[0]?.cultural_framing && (
                                        <div className="space-y-8">
                                            {/* Cultural Distinctiveness Scores */}
                                            <div>
                                                <h4 className="font-semibold mb-4">Cultural Distinctiveness</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {selectedSources.map((source, idx) => (
                                                        <Card key={idx} className="bg-slate-50 relative">
                                                            <CardContent className="pt-6">
                                                                <div className="absolute top-2 right-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0"
                                                                        onClick={() => handleRegenerateCultural(source)}
                                                                        disabled={regeneratingIds[source.id]}
                                                                        title="Regenerate Analysis (Bypass Cache)"
                                                                    >
                                                                        <RefreshCw className={`h-3 w-3 ${regeneratingIds[source.id] ? 'animate-spin' : 'text-slate-400'}`} />
                                                                    </Button>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-3xl font-bold text-slate-900">
                                                                        {((source.cultural_framing?.cultural_distinctiveness_score ?? 0) * 100).toFixed(0)}%
                                                                    </div>
                                                                    <div className="text-sm text-slate-600 mt-1">
                                                                        {source.title}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 mt-2 italic">
                                                                        {source.cultural_framing?.dominant_cultural_logic}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dimension Comparison */}
                                            {["state_market_society", "technology_role", "rights_conception", "historical_context", "epistemic_authority"].map((dimension) => (
                                                <div key={dimension}>
                                                    <h4 className="font-semibold mb-3 capitalize">
                                                        {dimension.replace(/_/g, " ")}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {selectedSources.map((source, idx) => (
                                                            <Card key={idx}>
                                                                <CardContent className="pt-4">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="text-xs font-semibold text-slate-500">
                                                                            {source.title}
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0"
                                                                            onClick={() => handleRegenerateCultural(source)}
                                                                            disabled={regeneratingIds[source.id]}
                                                                            title="Regenerate Analysis (Bypass Cache)"
                                                                        >
                                                                            <RefreshCw className={`h-3 w-3 ${regeneratingIds[source.id] ? 'animate-spin' : 'text-slate-400'}`} />
                                                                        </Button>
                                                                    </div>
                                                                    <div className="text-sm text-slate-700">
                                                                        {/* @ts-ignore */}
                                                                        {source.cultural_framing?.[dimension] || "Not analyzed"}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Institutional Logics Comparison */}
                    {activeTab === "logics" && (
                        // ... existing institutional logics content
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Institutional Logics Comparison</CardTitle>
                                    <CardDescription>
                                        Which institutional logics dominate in each jurisdiction?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!selectedSources[0]?.institutional_logics && (
                                        <div className="text-center py-8 text-slate-500">
                                            <p className="mb-4">No institutional logics analysis yet.</p>
                                            <p className="text-sm">
                                                Run institutional logics analysis on these documents first.
                                            </p>
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block max-w-2xl mx-auto">
                                                analysisMode: 'institutional_logics'
                                            </code>
                                        </div>
                                    )}

                                    {selectedSources[0]?.institutional_logics && (
                                        <div className="space-y-8">
                                            {/* Logic Strength Comparison */}
                                            {["market", "state", "professional", "community"].map((logic) => {
                                                const Icon = logicIcons[logic as keyof typeof logicIcons];
                                                return (
                                                    <div key={logic}>
                                                        <h4 className="font-semibold mb-4 flex items-center gap-2 capitalize">
                                                            <Icon className="h-5 w-5" />
                                                            {logic} Logic
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {selectedSources.map((source, idx) => {
                                                                // @ts-ignore
                                                                const logicData = source.institutional_logics?.logics?.[logic];
                                                                return (
                                                                    <Card key={idx} className={logicColors[logic as keyof typeof logicColors]}>
                                                                        <CardContent className="pt-6">
                                                                            <div className="text-xs font-semibold mb-2">
                                                                                {source.title}
                                                                            </div>
                                                                            <div className="mb-3">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <span className="text-xs">Strength</span>
                                                                                    <span className="text-sm font-bold">
                                                                                        {((logicData?.strength || 0) * 100).toFixed(0)}%
                                                                                    </span>
                                                                                </div>
                                                                                <div className="w-full bg-white rounded-full h-2">
                                                                                    <div
                                                                                        className="bg-slate-800 h-2 rounded-full"
                                                                                        style={{ width: `${(logicData?.strength || 0) * 100}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-xs space-y-2">
                                                                                <div>
                                                                                    <span className="font-semibold">Material:</span>{" "}
                                                                                    {logicData?.material || "N/A"}
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-semibold">Discursive:</span>{" "}
                                                                                    {logicData?.discursive || "N/A"}
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Dominant Logic Summary */}
                                            <div>
                                                <h4 className="font-semibold mb-4">Dominant Logic</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {selectedSources.map((source, idx) => (
                                                        <Card key={idx} className="bg-slate-50 relative">
                                                            <CardContent className="pt-6">
                                                                <div className="absolute top-2 right-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0"
                                                                        onClick={() => handleRegenerateLogics(source)}
                                                                        disabled={regeneratingIds[source.id]}
                                                                        title="Regenerate Analysis (Bypass Cache)"
                                                                    >
                                                                        <RefreshCw className={`h-3 w-3 ${regeneratingIds[source.id] ? 'animate-spin' : 'text-slate-400'}`} />
                                                                    </Button>
                                                                </div>
                                                                <div className="text-center">
                                                                    <Badge className="text-lg px-4 py-2 capitalize">
                                                                        {source.institutional_logics?.dominant_logic || "Unknown"}
                                                                    </Badge>
                                                                    <div className="text-xs text-slate-600 mt-3">
                                                                        {source.title}
                                                                    </div>
                                                                    <div className="text-xs text-slate-700 mt-4 text-left">
                                                                        {source.institutional_logics?.overall_assessment || "No assessment"}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Logic Conflicts */}
                                            <div>
                                                <h4 className="font-semibold mb-4">Logic Conflicts</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {selectedSources.map((source, idx) => (
                                                        <Card key={idx}>
                                                            <CardContent className="pt-6">
                                                                <div className="text-xs font-semibold text-slate-500 mb-3">
                                                                    {source.title}
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {source.institutional_logics?.logic_conflicts?.map((conflict, idx) => (
                                                                        <div key={idx} className="text-xs space-y-1 p-2 bg-amber-50 rounded border border-amber-200">
                                                                            <div className="font-semibold text-amber-800">
                                                                                {conflict.between}
                                                                            </div>
                                                                            <div className="text-slate-700">
                                                                                <span className="font-semibold">Site:</span> {conflict.site_of_conflict}
                                                                            </div>
                                                                            <div className="text-slate-700">
                                                                                <span className="font-semibold">Resolution:</span> {conflict.resolution_strategy}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {(!source.institutional_logics?.logic_conflicts || source.institutional_logics.logic_conflicts.length === 0) && (
                                                                        <div className="text-slate-500 italic">No conflicts identified</div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                    {!selectedSources[0]?.legitimacy_analysis && (
                                        <div className="text-center py-8 text-slate-500">
                                            <p className="mb-4">No legitimacy analysis yet.</p>
                                            <p className="text-sm">
                                                Run legitimacy analysis on these documents first.
                                            </p>
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block max-w-2xl mx-auto">
                                                analysisMode: 'legitimacy'
                                            </code>
                                        </div>
                                    )}

                                    {selectedSources[0]?.legitimacy_analysis && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {selectedSources.map((source, idx) => (
                                                <div key={idx} className="space-y-4">
                                                    <div className="flex items-center justify-between border-b pb-2">
                                                        <h3 className="font-semibold text-lg">{source.title}</h3>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleRegenerateLegitimacy(source)}
                                                            disabled={regeneratingIds[source.id]}
                                                            title="Regenerate Analysis (Bypass Cache)"
                                                        >
                                                            <RefreshCw className={`h-4 w-4 ${regeneratingIds[source.id] ? 'animate-spin' : 'text-slate-400'}`} />
                                                        </Button>
                                                    </div>
                                                    {source.legitimacy_analysis && (
                                                        <LegitimacyAnalysisView analysis={source.legitimacy_analysis} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                            <p>Click "Synthesize" to generate a comparative analysis.</p>
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
                                        <div className="space-y-8">
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
                                                            {synthesisResult.synthesis_matrix?.map((row, idx) => (
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
