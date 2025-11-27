"use client";

import { useState, useEffect } from "react";
import { useSources } from "@/hooks/useSources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Globe2, Scale, Users, Building, Loader2 } from "lucide-react";
import { Source, AnalysisResult } from "@/types";

type CulturalFraming = NonNullable<AnalysisResult>;

export default function ComparisonPage() {
    const { sources, isLoading } = useSources();
    const [policyDocs, setPolicyDocs] = useState<Source[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"cultural" | "logics">("cultural");

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
                <p className="text-slate-500">Compare cultural framing and institutional logics across jurisdictions.</p>
            </div>

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
                    </div>

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
                                                        <Card key={`${source.id}-${idx}`} className="bg-slate-50">
                                                            <CardContent className="pt-6">
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
                                                            <Card key={`${source.id}-${idx}`}>
                                                                <CardContent className="pt-4">
                                                                    <div className="text-xs font-semibold text-slate-500 mb-2">
                                                                        {source.title}
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
                                                                    <Card key={`${source.id}-${idx}`} className={logicColors[logic as keyof typeof logicColors]}>
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
                                                        <Card key={`${source.id}-${idx}`} className="bg-slate-50">
                                                            <CardContent className="pt-6">
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
                                                        <Card key={`${source.id}-${idx}`}>
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
