"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitMerge, GitPullRequest, AlertCircle, FileDown, CheckCircle2, Sparkles, Brain, Network, Loader2 } from "lucide-react";
import { generateSynthesisPDF } from "@/utils/generateSynthesisPDF";
import { AssemblageSankey } from "@/components/AssemblageSankey";

interface ComparisonResult {
    risk: { convergence: string; divergence: string; coloniality: string; resistance: string };
    governance: { convergence: string; divergence: string; coloniality: string; resistance: string };
    rights: { convergence: string; divergence: string; coloniality: string; resistance: string };
    scope: { convergence: string; divergence: string; coloniality: string; resistance: string };
}

import { EcosystemImpact } from "@/types";

const SYNTHESIS_FINDINGS = [
    {
        key: "risk",
        dimension: "Risk Classification",
        convergence: "Comparison of risk definitions and tiered obligations across frameworks.",
        divergence: "Analysis of how risk categories are adapted to local social and political contexts.",
        coloniality: "Examination of whether risk models reflect Global North assumptions or local realities.",
        resistance: "Identification of mechanisms that allow for local adaptation of risk frameworks.",
        icon: AlertCircle,
    },
    {
        key: "governance",
        dimension: "Governance Structure",
        convergence: "Comparison of institutional designs (e.g., centralized vs. networked authorities).",
        divergence: "Analysis of enforcement powers and coordination mechanisms.",
        coloniality: "Assessment of whether governance models assume state capacities that may not exist.",
        resistance: "Highlighting of innovative governance structures that leverage local expertise.",
        icon: GitMerge,
    },
    {
        key: "rights",
        dimension: "Rights Framework",
        convergence: "Comparison of individual rights (e.g., explanation, redress) and collective protections.",
        divergence: "Analysis of the balance between procedural compliance and substantive rights.",
        coloniality: "Examination of whether rights frameworks obscure underlying power asymmetries.",
        resistance: "Identification of rights-based approaches that empower affected communities.",
        icon: CheckCircle2,
    },
    {
        key: "scope",
        dimension: "Territorial Scope",
        convergence: "Comparison of jurisdictional reach and extraterritorial application.",
        divergence: "Analysis of data sovereignty claims and market power dynamics.",
        coloniality: "Assessment of the 'Brussels Effect' and the imposition of external legal norms.",
        resistance: "Highlighting of assertions of epistemic and legal autonomy.",
        icon: GitPullRequest,
    },
];

export default function SynthesisPage() {
    const { sources, isLoading } = useSources();
    const [isExporting, setIsExporting] = useState(false);

    // Comparison State
    const [sourceA, setSourceA] = useState<Source | null>(null);
    const [sourceB, setSourceB] = useState<Source | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

    // Ecosystem State
    const [ecosystemSource, setEcosystemSource] = useState<Source | null>(null);
    const [isMapping, setIsMapping] = useState(false);
    const [ecosystemImpacts, setEcosystemImpacts] = useState<EcosystemImpact[]>([]);
    const [interconnectionFilter, setInterconnectionFilter] = useState<"All" | "Material" | "Discursive" | "Hybrid">("All");
    const [viewMode, setViewMode] = useState<"list" | "graph">("list");

    // Filter sources that have text available for analysis
    const analyzedSources = sources.filter(s => s.analysis || s.extractedText);

    const handleExport = () => {
        setIsExporting(true);
        try {
            generateSynthesisPDF(SYNTHESIS_FINDINGS);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setTimeout(() => setIsExporting(false), 1000);
        }
    };

    const handleCompare = async () => {
        if (!sourceA || !sourceB) return;

        setIsComparing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisMode: 'comparison',
                    sourceA: { title: sourceA.title, text: sourceA.extractedText?.substring(0, 3000) || '' },
                    sourceB: { title: sourceB.title, text: sourceB.extractedText?.substring(0, 3000) || '' }
                })
            });

            const data = await response.json();
            if (data.success && data.analysis) {
                setComparisonResult(data.analysis);
            } else {
                alert("Comparison failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Comparison error:", error);
            alert("Failed to generate comparison.");
        } finally {
            setIsComparing(false);
        }
    };

    const handleEcosystemMap = async () => {
        if (!ecosystemSource) return;

        setIsMapping(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: ecosystemSource.extractedText?.substring(0, 3000) || '',
                    sourceType: 'Policy Document',
                    analysisMode: 'ecosystem'
                })
            });

            const data = await response.json();
            if (data.success && Array.isArray(data.analysis)) {
                setEcosystemImpacts(data.analysis);
            } else {
                alert("Mapping failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Mapping error:", error);
            alert("Failed to generate ecosystem map.");
        } finally {
            setIsMapping(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cross-Case Synthesis</h2>
                    <p className="text-slate-500">Comparative analysis of AI governance frameworks using the Decolonial Situatedness Framework.</p>
                </div>
                <Button
                    onClick={handleExport}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                    disabled={isExporting}
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    {isExporting ? "Generating PDF..." : "Export Report"}
                </Button>
            </div>

            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
                <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                    <CardDescription>Key insights from the comparative analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                    <p>
                        This synthesis compares AI governance frameworks to identify patterns of convergence, divergence, and coloniality. By applying the Decolonial Situatedness Framework, we analyze how different jurisdictions approach risk, governance, rights, and territorial scope.
                    </p>
                    <p>
                        <strong>Convergence:</strong> Identification of shared regulatory mechanisms, definitions, and risk classifications across frameworks.
                    </p>
                    <p>
                        <strong>Divergence:</strong> Analysis of distinct approaches to enforcement, rights protections, and institutional design that reflect local contexts.
                    </p>
                    <p>
                        <strong>Colonial Patterns:</strong> Examination of potential legal transplants, extraterritorial effects, and the imposition of Global North epistemologies.
                    </p>
                    <p>
                        <strong>Decolonial Potential:</strong> Highlighting opportunities for epistemic autonomy, local adaptation, and resistance to hegemonic norms.
                    </p>
                </CardContent>
            </Card>

            {/* AI-Powered Comparison */}
            {analyzedSources.length >= 2 && (
                <Card className="border-purple-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            <CardTitle>AI-Powered Framework Comparison</CardTitle>
                        </div>
                        <CardDescription>
                            Compare two policy documents to identify convergence, divergence, and colonial patterns
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Source A</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm"
                                    onChange={(e) => {
                                        const source = analyzedSources.find(s => s.id === e.target.value);
                                        setSourceA(source || null);
                                    }}
                                >
                                    <option value="">Select first document...</option>
                                    {analyzedSources.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Source B</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm"
                                    onChange={(e) => {
                                        const source = analyzedSources.find(s => s.id === e.target.value);
                                        setSourceB(source || null);
                                    }}
                                >
                                    <option value="">Select second document...</option>
                                    {analyzedSources.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button
                            className="w-full bg-purple-600 text-white hover:bg-purple-700"
                            onClick={handleCompare}
                            disabled={!sourceA || !sourceB || isComparing}
                        >
                            {isComparing ? (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                    Comparing...
                                </>
                            ) : (
                                <>
                                    <GitMerge className="mr-2 h-4 w-4" />
                                    Compare Frameworks
                                </>
                            )}
                        </Button>

                        {comparisonResult && (
                            <div className="mt-4 space-y-3 pt-4 border-t">
                                <h4 className="font-semibold text-slate-900">Comparison Results</h4>
                                {Object.entries(comparisonResult).map(([key, value]) => (
                                    <div key={key} className="space-y-2">
                                        <p className="text-sm font-medium text-slate-700 capitalize">{key}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2 bg-green-50 rounded border border-green-200">
                                                <span className="font-semibold text-green-700">Convergence:</span>
                                                <p className="text-slate-600 mt-1">{value.convergence}</p>
                                            </div>
                                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                                <span className="font-semibold text-blue-700">Divergence:</span>
                                                <p className="text-slate-600 mt-1">{value.divergence}</p>
                                            </div>
                                            <div className="p-2 bg-red-50 rounded border border-red-200">
                                                <span className="font-semibold text-red-700">Coloniality:</span>
                                                <p className="text-slate-600 mt-1">{value.coloniality}</p>
                                            </div>
                                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                                <span className="font-semibold text-purple-700">Resistance:</span>
                                                <p className="text-slate-600 mt-1">{value.resistance}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Ecosystem Impact Mapping */}
            {analyzedSources.length > 0 && (
                <Card className="border-teal-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-teal-600" />
                            <CardTitle>Ecosystem Impact Mapping</CardTitle>
                        </div>
                        <CardDescription>
                            Map how policy mechanisms constrain or afford possibilities for ecosystem actors
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Select Policy Document</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm"
                                    onChange={(e) => {
                                        const source = analyzedSources.find(s => s.id === e.target.value);
                                        setEcosystemSource(source || null);
                                    }}
                                >
                                    <option value="">Select document...</option>
                                    {analyzedSources.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                className="bg-teal-600 text-white hover:bg-teal-700"
                                onClick={handleEcosystemMap}
                                disabled={!ecosystemSource || isMapping}
                            >
                                {isMapping ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                        Mapping...
                                    </>
                                ) : (
                                    <>
                                        <Network className="mr-2 h-4 w-4" />
                                        Generate Map
                                    </>
                                )}
                            </Button>
                        </div>

                        {ecosystemImpacts.length > 0 && (
                            <div className="mt-4 space-y-3 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-900">Ecosystem Impacts</h4>
                                    <div className="flex gap-2">
                                        <div className="flex bg-slate-100 rounded-lg p-1 mr-4">
                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === "list"
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-900"
                                                    }`}
                                            >
                                                List View
                                            </button>
                                            <button
                                                onClick={() => setViewMode("graph")}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === "graph"
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-900"
                                                    }`}
                                            >
                                                Graph View
                                            </button>
                                        </div>

                                        <Button
                                            variant={interconnectionFilter === "All" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setInterconnectionFilter("All")}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={interconnectionFilter === "Material" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setInterconnectionFilter("Material")}
                                        >
                                            Material
                                        </Button>
                                        <Button
                                            variant={interconnectionFilter === "Discursive" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setInterconnectionFilter("Discursive")}
                                        >
                                            Discursive
                                        </Button>
                                        <Button
                                            variant={interconnectionFilter === "Hybrid" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setInterconnectionFilter("Hybrid")}
                                        >
                                            Hybrid
                                        </Button>
                                    </div>
                                </div>

                                {viewMode === "graph" ? (
                                    <div className="border rounded-lg p-4 bg-white min-h-[500px]">
                                        <AssemblageSankey
                                            data={ecosystemImpacts.filter(impact =>
                                                interconnectionFilter === "All" ||
                                                impact.interconnection_type === interconnectionFilter
                                            )}
                                        />
                                        <p className="text-center text-xs text-slate-500 mt-4">
                                            Visualizing the flow from <strong>Actors</strong> → <strong>Mechanisms</strong> → <strong>Impacts</strong>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {ecosystemImpacts
                                            .filter(impact =>
                                                interconnectionFilter === "All" ||
                                                impact.interconnection_type === interconnectionFilter
                                            )
                                            .map((impact, i) => (
                                                <div key={i} className={`p-3 rounded-lg border ${impact.type === "Constraint"
                                                    ? "bg-red-50 border-red-200"
                                                    : "bg-green-50 border-green-200"
                                                    }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span className={`text-xs font-bold uppercase ${impact.type === "Constraint" ? "text-red-700" : "text-green-700"
                                                            }`}>
                                                            {impact.type}
                                                        </span>
                                                        {impact.interconnection_type && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {impact.interconnection_type}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 mb-1">{impact.actor}</p>
                                                    <p className="text-xs text-slate-600 mb-1">
                                                        <span className="font-medium">Mechanism:</span> {impact.mechanism}
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        <span className="font-medium">Impact:</span> {impact.impact}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Synthesis Matrix */}
            <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Synthesis Framework</h3>

                {comparisonResult ? (
                    // Show AI-generated comparison results
                    <div className="grid gap-4">
                        {Object.entries(comparisonResult).map(([key, value]) => {
                            const finding = SYNTHESIS_FINDINGS.find(f => f.key === key);
                            const Icon = finding?.icon || AlertCircle;
                            return (
                                <Card key={key}>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5 text-slate-600" />
                                            <CardTitle>{finding?.dimension || key}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-xs font-bold text-green-700 uppercase mb-1">Convergence</p>
                                            <p className="text-sm text-slate-700">{value.convergence}</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Divergence</p>
                                            <p className="text-sm text-slate-700">{value.divergence}</p>
                                        </div>
                                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                            <p className="text-xs font-bold text-red-700 uppercase mb-1">Coloniality</p>
                                            <p className="text-sm text-slate-700">{value.coloniality}</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="text-xs font-bold text-purple-700 uppercase mb-1">Resistance</p>
                                            <p className="text-sm text-slate-700">{value.resistance}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    // Show placeholder framework when no comparison is active
                    <>
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>Note:</strong> To see AI-generated synthesis results, use the "AI-Powered Framework Comparison" tool above to compare two policy documents.
                            </p>
                        </div>
                        <div className="grid gap-4">
                            {SYNTHESIS_FINDINGS.map((finding) => {
                                const Icon = finding.icon;
                                return (
                                    <Card key={finding.key} className="opacity-60">
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-slate-600" />
                                                <CardTitle>{finding.dimension}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-xs font-bold text-green-700 uppercase mb-1">Convergence</p>
                                                <p className="text-sm text-slate-700">{finding.convergence}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-xs font-bold text-blue-700 uppercase mb-1">Divergence</p>
                                                <p className="text-sm text-slate-700">{finding.divergence}</p>
                                            </div>
                                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-xs font-bold text-red-700 uppercase mb-1">Coloniality</p>
                                                <p className="text-sm text-slate-700">{finding.coloniality}</p>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <p className="text-xs font-bold text-purple-700 uppercase mb-1">Resistance</p>
                                                <p className="text-sm text-slate-700">{finding.resistance}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
