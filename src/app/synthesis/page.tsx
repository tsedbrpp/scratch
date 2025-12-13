"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { useServerStorage } from "@/hooks/useServerStorage";
import { Source, EcosystemImpact } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitMerge, GitPullRequest, AlertCircle, FileDown, CheckCircle2, Sparkles, Brain, Network, Loader2, RefreshCw } from "lucide-react";
import { generateSynthesisPDF } from "@/utils/generateSynthesisPDF";
import { AssemblageSankey } from "@/components/AssemblageSankey";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Info } from "lucide-react";

interface ComparisonResult {
    risk: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    governance: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    rights: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    scope: { convergence: string; divergence: string; coloniality: string; resistance: string; convergence_score?: number; coloniality_score?: number };
    verified_quotes?: Array<{ text: string; source: string; relevance: string }>;
    system_critique?: {
        blind_spots: string[];
        over_interpretation: string;
        legitimacy_correction: string;
    } | string;
}

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
    const [comparisonResult, setComparisonResult] = useServerStorage<ComparisonResult | null>("synthesis_comparison_result", null);

    // Ecosystem State
    const [selectedEcosystemSourceId, setSelectedEcosystemSourceId] = useServerStorage<string | null>("synthesis_ecosystem_source_id", null);
    const ecosystemSource = sources.find(s => s.id === selectedEcosystemSourceId) || null;

    const [isMapping, setIsMapping] = useState(false);
    const [ecosystemImpacts, setEcosystemImpacts] = useServerStorage<EcosystemImpact[]>("synthesis_ecosystem_impacts", []);
    const [interconnectionFilter, setInterconnectionFilter] = useState<"All" | "Material" | "Discursive" | "Hybrid" | "Interpretive / Meaning-Making">("All");
    const [viewMode, setViewMode] = useState<"list" | "graph">("list");
    const [chartView, setChartView] = useState<"radar" | "bar">("radar");
    const [showGuide, setShowGuide] = useState(true);

    // Filter sources that have text available for analysis
    const analyzedSources = sources.filter(s => s.analysis || s.extractedText);

    const handleExport = () => {
        if (!comparisonResult) {
            alert("Please run a comparison first to generate a report.");
            return;
        }

        setIsExporting(true);
        try {
            // Transform comparisonResult into the format expected by generateSynthesisPDF
            const findings = Object.entries(comparisonResult).map(([key, value]) => {
                const typedValue = value as ComparisonResult["risk"]; // All keys have same structure
                const findingDef = SYNTHESIS_FINDINGS.find(f => f.key === key);
                return {
                    dimension: findingDef?.dimension || key,
                    convergence: typedValue.convergence,
                    divergence: typedValue.divergence,
                    coloniality: typedValue.coloniality,
                    resistance: typedValue.resistance
                };
            });

            generateSynthesisPDF(findings);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setTimeout(() => setIsExporting(false), 1000);
        }
    };

    const handleCompare = async (forceRefresh = false) => {
        if (!sourceA || !sourceB) return;

        setIsComparing(true);
        // setComparisonResult(null); // Keep previous result while loading so button stays visible

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    analysisMode: 'comparison',
                    sourceA: { title: sourceA.title, text: sourceA.extractedText?.substring(0, 50000) || '' },
                    sourceB: { title: sourceB.title, text: sourceB.extractedText?.substring(0, 50000) || '' },
                    force: forceRefresh
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

        // Check for existing results
        if (ecosystemImpacts.length > 0) {
            const confirmRun = confirm("Existing ecosystem map found. Do you want to re-run it? This will overwrite the current map.");
            if (!confirmRun) {
                return;
            }
        }

        setIsMapping(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: ecosystemSource.extractedText?.substring(0, 30000) || '',
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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cross-Case Analysis</h2>
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
                                    value={sourceA?.id || ""}
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
                                    value={sourceB?.id || ""}
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
                        </div >
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-2 w-full">
                                <Button
                                    onClick={() => handleCompare(false)}
                                    disabled={!sourceA || !sourceB || isComparing}
                                    className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={(!sourceA || !sourceB) ? "Please select two documents to compare" : "Run comparison"}
                                >
                                    {isComparing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Compare Frameworks
                                        </>
                                    )}
                                </Button>
                                {(!sourceA || !sourceB) && (
                                    <p className="text-xs text-center text-slate-500">
                                        Select two documents above to enable comparison.
                                    </p>
                                )}
                            </div>
                            {comparisonResult && (
                                <Button
                                    onClick={() => handleCompare(true)}
                                    disabled={isComparing}
                                    variant="outline"
                                    title="Force Regenerate (Bypass Cache)"
                                    className="shrink-0"
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isComparing ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </Button>
                            )}
                        </div>

                        {comparisonResult && (
                            <div className="mt-8 space-y-6 pt-4 border-t">
                                <div className="h-[450px] w-full">
                                    <h4 className="font-semibold text-slate-900 mb-2 text-center">Shape of Divergence</h4>
                                    <p className="text-xs text-center text-slate-500 mb-4">
                                        Comparing: <span className="font-medium text-slate-700">{sourceA?.title}</span> vs <span className="font-medium text-slate-700">{sourceB?.title}</span>
                                    </p>

                                    <div className="flex justify-center mb-4 space-x-2">
                                        <button
                                            onClick={() => setChartView("radar")}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartView === "radar"
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                        >
                                            Radar View
                                        </button>
                                        <button
                                            onClick={() => setChartView("bar")}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartView === "bar"
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                        >
                                            Bar View
                                        </button>
                                    </div>

                                    {showGuide && (
                                        <div className="mb-6 mx-auto max-w-2xl bg-blue-50 border border-blue-100 rounded-lg p-3 relative">
                                            <button
                                                onClick={() => setShowGuide(false)}
                                                className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
                                            >
                                                ×
                                            </button>
                                            <div className="flex gap-3">
                                                <Info className="h-5 w-5 text-blue-600 shrink-0" />
                                                <div className="text-xs text-blue-900 space-y-1">
                                                    <p className="font-semibold">How to read this chart:</p>
                                                    <p><span className="font-bold text-blue-700">Convergence (Blue):</span> How similar the frameworks are. High score = Very similar rules/definitions.</p>
                                                    <p><span className="font-bold text-red-700">Coloniality (Red):</span> Power imbalance. High score = One framework is imposing values on the other.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <ResponsiveContainer width="100%" height={300}>
                                        {chartView === "radar" ? (
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                                { subject: 'Risk', A: comparisonResult.risk.convergence_score || 0, B: comparisonResult.risk.coloniality_score || 0, fullMark: 10 },
                                                { subject: 'Governance', A: comparisonResult.governance.convergence_score || 0, B: comparisonResult.governance.coloniality_score || 0, fullMark: 10 },
                                                { subject: 'Rights', A: comparisonResult.rights.convergence_score || 0, B: comparisonResult.rights.coloniality_score || 0, fullMark: 10 },
                                                { subject: 'Scope', A: comparisonResult.scope.convergence_score || 0, B: comparisonResult.scope.coloniality_score || 0, fullMark: 10 },
                                            ]}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="subject" />
                                                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                                                <Tooltip />
                                                <Radar name="Convergence (Similarity)" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
                                                <Radar name="Coloniality (Power Imbalance)" dataKey="B" stroke="#dc2626" fill="#dc2626" fillOpacity={0.5} />
                                                <Legend />
                                            </RadarChart>
                                        ) : (
                                            <BarChart
                                                data={[
                                                    { subject: 'Risk', Convergence: comparisonResult.risk.convergence_score || 0, Coloniality: comparisonResult.risk.coloniality_score || 0 },
                                                    { subject: 'Governance', Convergence: comparisonResult.governance.convergence_score || 0, Coloniality: comparisonResult.governance.coloniality_score || 0 },
                                                    { subject: 'Rights', Convergence: comparisonResult.rights.convergence_score || 0, Coloniality: comparisonResult.rights.coloniality_score || 0 },
                                                    { subject: 'Scope', Convergence: comparisonResult.scope.convergence_score || 0, Coloniality: comparisonResult.scope.coloniality_score || 0 },
                                                ]}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="subject" />
                                                <YAxis domain={[0, 10]} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="Convergence" fill="#2563eb" name="Convergence (Similarity)" />
                                                <Bar dataKey="Coloniality" fill="#dc2626" name="Coloniality (Power Imbalance)" />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                    <p className="text-xs text-center text-slate-400 mt-4">
                                        Scale 0-10: Higher scores indicate stronger presence of the attribute.
                                    </p>
                                </div >


                            </div >
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
                        {Object.entries(comparisonResult)
                            .filter(([key]) => key !== 'verified_quotes' && key !== 'system_critique')
                            .map(([key, value]) => {
                                const typedValue = value as ComparisonResult["risk"];
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
                                                <p className="text-sm text-slate-700">{typedValue.convergence}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-xs font-bold text-blue-700 uppercase mb-1">Divergence</p>
                                                <p className="text-sm text-slate-700">{typedValue.divergence}</p>
                                            </div>
                                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-xs font-bold text-red-700 uppercase mb-1">Coloniality</p>
                                                <p className="text-sm text-slate-700">{typedValue.coloniality}</p>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <p className="text-xs font-bold text-purple-700 uppercase mb-1">Resistance</p>
                                                <p className="text-sm text-slate-700">{typedValue.resistance}</p>
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
                                <strong>Note:</strong> To see AI-generated synthesis results, use the &quot;AI-Powered Framework Comparison&quot; tool above to compare two policy documents.
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

            {/* Verified Quotes Section */}
            {
                comparisonResult?.verified_quotes && comparisonResult.verified_quotes.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                <CardTitle>Verified Canonical Evidence</CardTitle>
                            </div>
                            <CardDescription>Direct textual evidence supporting the analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {comparisonResult.verified_quotes.map((quote, idx) => (
                                <div key={idx} className="p-3 bg-white rounded border border-blue-100 shadow-sm">
                                    <p className="text-sm italic text-slate-700 mb-2">"{quote.text}"</p>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-blue-800">{quote.source}</span>
                                        <span className="text-slate-500">{quote.relevance}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )
            }

            {/* System Critique Section */}
            {
                comparisonResult?.system_critique && (
                    <Card className="border-purple-200 bg-purple-50/50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-600" />
                                <CardTitle>Systemic Critique (Devil's Advocate)</CardTitle>
                            </div>
                            <CardDescription>Synthesized critical analysis and blind-spot detection</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {typeof comparisonResult.system_critique === 'string' ? (
                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                    {comparisonResult.system_critique}
                                </p>
                            ) : (
                                <>
                                    {/* Blind Spots */}
                                    {comparisonResult.system_critique.blind_spots && comparisonResult.system_critique.blind_spots.length > 0 && (
                                        <div className="p-3 bg-red-50 rounded-md border border-red-100">
                                            <p className="text-xs font-bold text-red-800 uppercase mb-2">Potential Blind Spots</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {comparisonResult.system_critique.blind_spots.map((spot, idx) => (
                                                    <li key={idx} className="text-sm text-red-900">{spot}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Over Interpretation */}
                                    {comparisonResult.system_critique.over_interpretation && (
                                        <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
                                            <p className="text-xs font-bold text-amber-800 uppercase mb-1">Over-Interpretation Check</p>
                                            <p className="text-sm text-amber-900">{comparisonResult.system_critique.over_interpretation}</p>
                                        </div>
                                    )}

                                    {/* Legitimacy Correction */}
                                    {comparisonResult.system_critique.legitimacy_correction && (
                                        <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                                            <p className="text-xs font-bold text-blue-800 uppercase mb-1">Legitimacy Correction</p>
                                            <p className="text-sm text-blue-900">{comparisonResult.system_critique.legitimacy_correction}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                )
            }


            {/* Ecosystem Impact Mapping */}
            {
                analyzedSources.length > 0 && (
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
                                        value={selectedEcosystemSourceId || ""}
                                        onChange={(e) => {
                                            setSelectedEcosystemSourceId(e.target.value || null);
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
                                            <Button
                                                variant={interconnectionFilter === "Interpretive / Meaning-Making" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setInterconnectionFilter("Interpretive / Meaning-Making")}
                                            >
                                                Interpretive
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
                                    )
                                    }
                                </div >
                            )}
                        </CardContent >
                    </Card >
                )
            }


        </div >
    );
}
