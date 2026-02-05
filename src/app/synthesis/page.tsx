"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { useServerStorage } from "@/hooks/useServerStorage";
import { Source, EcosystemImpact } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitMerge, GitPullRequest, AlertCircle, FileDown, CheckCircle2, Sparkles, Brain, Network, Loader2, RefreshCw, Radio } from "lucide-react";
import { generateSynthesisPDF } from "@/utils/generateSynthesisPDF";
import { AssemblageSankey } from "@/components/AssemblageSankey";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Info } from "lucide-react";
import { RelationalAxisMap } from "@/components/comparison/RelationalAxisMap";
import { ComparisonNetworkGraph } from "@/components/comparison/ComparisonNetworkGraph";
import { ResonanceNetworkGraph } from "@/components/comparison/ResonanceNetworkGraph";
import { AssemblageExport } from "@/types/bridge"; // [NEW] Import Data Contract
import { useRouter } from "next/navigation"; // [NEW] For Deep Linking

import { SynthesisComparisonResult as ComparisonResult } from "@/types/synthesis";
import { useDemoMode } from "@/hooks/useDemoMode";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";

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

const EXCLUDED_KEYS = new Set([
    'verified_quotes',
    'system_critique',
    'assemblage_network',
    'resonances',
    'topology_analysis',
    'key_insight',
    'node_generation_step' // Internal AI brainstorming step, not for display
]);

// Type guard to check if a value is a valid synthesis section
const isSynthesisSection = (value: unknown): value is ComparisonResult["risk"] => {
    return value !== null &&
        typeof value === 'object' &&
        'convergence' in value &&
        'divergence' in value &&
        'coloniality' in value &&
        'resistance' in value;
};

export default function SynthesisPage() {
    const { sources, isLoading } = useSources();
    const { isReadOnly } = useDemoMode();
    const { hasCredits } = useCredits(); // [NEW] Credit Check
    const [showTopUp, setShowTopUp] = useState(false); // [NEW] Top Up Dialog State
    const [isExporting, setIsExporting] = useState(false);

    // Comparison State
    const [sourceA, setSourceA] = useState<Source | null>(null);
    const [sourceB, setSourceB] = useState<Source | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonResult, setComparisonResult] = useServerStorage<ComparisonResult | null>("synthesis_comparison_result", null);

    // [NEW] Local Session Cache to restore results without re-fetching
    const [runCache, setRunCache] = useState<Record<string, ComparisonResult>>({});

    // Filter sources that have text available for analysis AND are Policy Documents (not Traces/Web)
    const analyzedSources = sources.filter(s =>
        (s.analysis || s.extractedText) &&
        (s.type === 'PDF' || s.type === 'Text')
    );

    // [NEW] Helper to update selection and check cache
    const updateSelection = async (newA: Source | null, newB: Source | null) => {
        setSourceA(newA);
        setSourceB(newB);

        if (newA && newB) {
            const cacheKey = `${newA.id}:${newB.id}`;
            const reverseKey = `${newB.id}:${newA.id}`;

            // Check client-side session cache first
            if (runCache[cacheKey]) {
                setComparisonResult(runCache[cacheKey]);
                return;
            } else if (runCache[reverseKey]) {
                setComparisonResult(runCache[reverseKey]);
                return;
            }

            // If not in session cache, check Redis cache via API
            try {
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (isReadOnly && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                    headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
                }

                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        analysisMode: 'comparison',
                        sourceA: {
                            title: newA.title,
                            text: newA.extractedText?.substring(0, 15000) || ''
                        },
                        sourceB: {
                            title: newB.title,
                            text: newB.extractedText?.substring(0, 15000) || ''
                        },
                        checkCacheOnly: true // [NEW] Flag to only check cache, not run analysis
                    })
                });

                const data = await response.json();
                if (data.success && data.analysis && data.fromCache) {
                    setComparisonResult(data.analysis);
                    // Also update session cache
                    setRunCache(prev => ({
                        ...prev,
                        [cacheKey]: data.analysis
                    }));
                } else {
                    setComparisonResult(null);
                }
            } catch (error) {
                console.error('Error checking cache:', error);
                setComparisonResult(null);
            }
        } else {
            setComparisonResult(null);
        }
    };

    const handleExport = () => {
        if (isReadOnly) {
            alert("Export disabled in Demo Mode");
            return;
        }

        // [NEW] Credit Check
        if (!hasCredits && !process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE) {
            setShowTopUp(true);
            return;
        }

        if (!comparisonResult) {
            alert("Please run a comparison first to generate a report.");
            return;
        }

        setIsExporting(true);
        try {
            generateSynthesisPDF(
                comparisonResult,
                sourceA?.title || "Source A",
                sourceB?.title || "Source B"
            );
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setTimeout(() => setIsExporting(false), 1000);
        }
    };

    const handleCompare = async (forceRefresh = false) => {
        if (!sourceA || !sourceB) return;

        // [NEW] Credit Check
        if (!hasCredits && !process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE && !isReadOnly) {
            setShowTopUp(true);
            return;
        }

        // [NEW] Soft Preflight: Check for AssemblageExport in SessionStorage
        const exportA = sessionStorage.getItem(`assemblage_export_${sourceA.id}`);
        const exportB = sessionStorage.getItem(`assemblage_export_${sourceB.id}`);

        let assemblageA: AssemblageExport | null = null;
        let assemblageB: AssemblageExport | null = null;

        try {
            if (exportA) assemblageA = JSON.parse(exportA);
            if (exportB) assemblageB = JSON.parse(exportB);
        } catch (e) {
            console.error("Failed to parse exports", e);
        }

        // Warning if missing (Rhizomatic Flexibility - warn but don't block, fallback to raw text)
        if (!assemblageA || !assemblageB) {
            console.warn("Missing Assemblage Exports. Comparison will rely on raw text regeneration, which lacks provenance.");
            // Optional: You could show a UI toast here
        }

        setIsComparing(true);
        // setComparisonResult(null); // Keep previous result while loading so button stays visible

        // Check for missing text
        if (!sourceA.extractedText || sourceA.extractedText.length < 50 || !sourceB.extractedText || sourceB.extractedText.length < 50) {
            alert("One or both selected documents appear to have no extracted text. Please check the Data Source Manager.");
            setIsComparing(false);
            return;
        }

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            // Find associated traces for Source A
            const tracesA = sources.filter(s => s.type === 'Trace' && s.policyId === sourceA.id);
            // Find associated traces for Source B
            const tracesB = sources.filter(s => s.type === 'Trace' && s.policyId === sourceB.id);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5m Client Timeout (Max safe limit)

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    analysisMode: 'comparison',
                    sourceA: {
                        title: sourceA.title,
                        text: sourceA.extractedText?.substring(0, 15000) || '', // [MAX] Increased to 15k context
                        // [NEW] Inject Assemblage Narrative if available (Provenance)
                        assemblageNarrative: assemblageA?.impactNarrative?.summary?.substring(0, 2000), // Increased narrative
                        assemblageActors: assemblageA?.nodes?.slice(0, 10).map(n => ({ name: n.name, type: n.type, description: n.description })) || [], // Top 10
                        traces: tracesA.slice(0, 3).map(t => ({ // Top 3 traces
                            title: t.title,
                            description: t.description,
                            extractedText: t.extractedText?.substring(0, 1000)
                        }))
                    },
                    sourceB: {
                        title: sourceB.title,
                        text: sourceB.extractedText?.substring(0, 15000) || '', // [MAX] Increased to 15k context
                        // [NEW] Inject Assemblage Narrative if available (Provenance)
                        assemblageNarrative: assemblageB?.impactNarrative?.summary?.substring(0, 2000),
                        assemblageActors: assemblageB?.nodes?.slice(0, 10).map(n => ({ name: n.name, type: n.type, description: n.description })) || [],
                        traces: tracesB.slice(0, 3).map(t => ({
                            title: t.title,
                            description: t.description,
                            extractedText: t.extractedText?.substring(0, 1000)
                        }))
                    },
                    force: forceRefresh,
                    checkCacheOnly: isReadOnly // Demo users can only load cached analyses
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();
            if (data.success && data.analysis) {
                setComparisonResult(data.analysis);
                // [NEW] Update Session Cache
                setRunCache(prev => ({
                    ...prev,
                    [`${sourceA.id}:${sourceB.id}`]: data.analysis
                }));
            } else {
                if (isReadOnly && !data.fromCache) {
                    alert("No cached analysis found for this comparison. Sign in to run new analyses.");
                } else {
                    alert("Comparison failed: " + (data.error || "Unknown error"));
                }
            }
        } catch (error: unknown) {
            console.error("Comparison error:", error);
            if (error.name === 'AbortError') {
                alert("Analysis timed out (60s limit). The documents may be too large or the AI service is busy. Please try again.");
            } else {
                alert("Failed to generate comparison. " + (error.message || ""));
            }
        } finally {
            setIsComparing(false);
        }
    };

    // [REMOVED] handleEcosystemMap logic - Moved to EcosystemPage (Separation of Concerns)

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
                    disabled={isExporting || isReadOnly}
                    title={isReadOnly ? "Export disabled in Demo Mode" : ""}
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
                        This synthesis compares governance frameworks to identify patterns of convergence, divergence, and coloniality. By applying the Decolonial Situatedness Framework, we analyze how different jurisdictions approach risk, governance, rights, and territorial scope.
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
                                        updateSelection(source || null, sourceB);
                                    }}
                                >
                                    <option value="">Select first document...</option>
                                    {analyzedSources.map(s => (
                                        <option key={s.id} value={s.id} disabled={s.id === sourceB?.id}>
                                            {s.title} {s.id === sourceB?.id ? "(Selected as Source B)" : ""}
                                        </option>
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
                                        updateSelection(sourceA, source || null);
                                    }}
                                >
                                    <option value="">Select second document...</option>
                                    {analyzedSources.map(s => (
                                        <option key={s.id} value={s.id} disabled={s.id === sourceA?.id}>
                                            {s.title} {s.id === sourceA?.id ? "(Selected as Source A)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-2 w-full">
                                <Button
                                    onClick={() => handleCompare(false)}
                                    disabled={!sourceA || !sourceB || isComparing}
                                    className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={isReadOnly ? "Load cached analysis (demo mode)" : (!sourceA || !sourceB) ? "Please select two documents to compare" : "Run comparison"}
                                >
                                    {isComparing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            {isReadOnly ? "Load Cached Analysis" : "Compare Frameworks"}
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
                                    disabled={isComparing || isReadOnly}
                                    variant="outline"
                                    title={isReadOnly ? "Sign in to regenerate" : "Force Regenerate (Bypass Cache)"}
                                    className="shrink-0"
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isComparing ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </Button>

                            )}
                        </div>

                        {/* [NEW] Preflight Warning / Deep Link */}
                        {sourceA && !sessionStorage.getItem(`assemblage_export_${sourceA.id}`) && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded text-xs flex items-center justify-between">
                                <span>⚠️ Missing Assemblage Analysis for Source A ({sourceA.title}). Comparison will lack provenance.</span>
                                {!isReadOnly ? (
                                    <a
                                        href={`/ecosystem?returnTo=synthesis&mode=auto-generate&sourceId=${sourceA.id}`} // Deep Link
                                        className="font-bold underline hover:text-amber-900"
                                    >
                                        Analyze in Ecosystem
                                    </a>
                                ) : (
                                    <span className="font-bold text-slate-400 cursor-not-allowed" title="Analysis disabled in Demo Mode">Analyze in Ecosystem</span>
                                )}
                            </div>
                        )}
                        {sourceB && !sessionStorage.getItem(`assemblage_export_${sourceB.id}`) && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded text-xs flex items-center justify-between">
                                <span>⚠️ Missing Assemblage Analysis for Source B ({sourceB.title}). Comparison will lack provenance.</span>
                                {!isReadOnly ? (
                                    <a
                                        href={`/ecosystem?returnTo=synthesis&mode=auto-generate&sourceId=${sourceB.id}`} // Deep Link
                                        className="font-bold underline hover:text-amber-900"
                                    >
                                        Analyze in Ecosystem
                                    </a>
                                ) : (
                                    <span className="font-bold text-slate-400 cursor-not-allowed" title="Analysis disabled in Demo Mode">Analyze in Ecosystem</span>
                                )}
                            </div>
                        )}

                        {comparisonResult && (
                            <div className="mt-8 space-y-6 pt-4 border-t">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[800px] lg:min-h-[600px]">
                                    {/* PRIMARY: FORCE GRAPH */}
                                    {comparisonResult.assemblage_network && comparisonResult.assemblage_network.nodes.length > 0 ? (
                                        <div className="col-span-1 lg:col-span-1 h-full min-h-[400px]">
                                            <ComparisonNetworkGraph
                                                networkData={comparisonResult.assemblage_network}
                                                comparisonId={`${sourceA?.id}-${sourceB?.id}`}
                                            />
                                        </div>
                                    ) : (
                                        <div className="col-span-1 lg:col-span-1 h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50">
                                            <p className="text-sm text-slate-500">No assemblage network data generated.</p>
                                        </div>
                                    )}

                                    {/* SECONDARY: RELATIONAL TOPOLOGY */}
                                    <div className="col-span-1 lg:col-span-1 h-full min-h-[400px]">
                                        <RelationalAxisMap
                                            key={`${sourceA?.id}-${sourceB?.id}-topology`}
                                            topology={comparisonResult.topology_analysis}
                                            sourceAName={sourceA?.title || "Source A"}
                                            sourceBName={sourceB?.title || "Source B"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )
            }

            {/* Synthesis Matrix */}
            <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Synthesis Framework</h3>

                {comparisonResult ? (
                    // Show AI-generated comparison results
                    <div className="grid gap-4">
                        {Object.entries(comparisonResult)
                            .filter(([key]) => !EXCLUDED_KEYS.has(key))
                            .filter(([_, value]) => isSynthesisSection(value))
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

            {/* Transversal Flows Section - ADDED for Assemblage Alignment */}
            {/* Transversal Resonances Section */}
            {
                comparisonResult?.resonances && (comparisonResult.resonances.narrative?.length > 10 || (comparisonResult.resonances.shared_strategies && comparisonResult.resonances.shared_strategies.length > 0)) && (
                    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Network className="h-5 w-5 text-indigo-600" />
                                <CardTitle>Transversal Resonances (Rhizomatic Connections)</CardTitle>
                            </div>
                            <CardDescription>
                                Strategies and concepts identified consistently resonating between the contexts (Trans-local resistance).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {comparisonResult.resonances.narrative && (
                                <p className="text-sm text-slate-800 leading-relaxed italic">
                                    "{comparisonResult.resonances.narrative}"
                                </p>
                            )}
                            {comparisonResult.resonances.resonance_graph && (
                                <div className="mt-4 border rounded-lg overflow-hidden bg-white/50 h-[400px]">
                                    <ResonanceNetworkGraph
                                        key={`${sourceA?.id}-${sourceB?.id}-resonance`}
                                        data={comparisonResult.resonances.resonance_graph}
                                        height={400}
                                        sourceAName={sourceA?.title || "Source A"}
                                        sourceBName={sourceB?.title || "Source B"}
                                        comparisonId={`${sourceA?.id}-${sourceB?.id}`}
                                    />
                                </div>
                            )}
                            {comparisonResult.resonances.shared_strategies && comparisonResult.resonances.shared_strategies.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {comparisonResult.resonances.shared_strategies.map((strat: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                            <GitMerge className="h-3 w-3 mr-1" />
                                            {strat}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            }

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

            {/* Credit Top Up Dialog */}
            <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => setShowTopUp(false)} />

        </div >
    );
}

