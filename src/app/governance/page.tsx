"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Shield, Globe, AlertTriangle, Users, Sparkles, Brain, Loader2, Info } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { GovernanceCompass } from "@/components/governance/GovernanceCompass";
import { DriftVector } from "@/lib/governance";
import { BASELINE_SOURCES } from "@/lib/data/baselines";
import { Source } from "@/types";

const PILLAR_METADATA = [
    { id: "risk", title: "Risk Classification", icon: AlertTriangle },
    { id: "enforcement", title: "Enforcement Bodies", icon: Shield },
    { id: "rights", title: "Rights & Redress", icon: Users },
    { id: "scope", title: "Territorial Scope", icon: Globe }
];

const PILLAR_DEFINITIONS = {
    risk: {
        description: "How the framework categorizes AI systems based on potential harm to health, safety, or fundamental rights.",
        configurations: [
            { badge: "Prescriptive", text: "Relies on a fixed, pre-defined list of high-risk use cases (Top-down)." },
            { badge: "Principled", text: "Risk is assessed case-by-case based on abstract principles and impact (Flexible)." }
        ]
    },
    enforcement: {
        description: "The institutional architecture established to oversee compliance and sanction violations.",
        configurations: [
            { badge: "Centralized", text: "A single new authority (e.g., AI Office) holds primary power." },
            { badge: "Networked", text: "Existing sectoral regulators enforce rules, coordinated by a central body." },
            { badge: "Hybrid", text: "A mix of central oversight for general systems and sectoral enforcement for specific uses." }
        ]
    },
    rights: {
        description: "The mechanisms available for individuals to understand, challenge, or seek redress for AI decisions.",
        configurations: [
            { badge: "Procedural", text: "Focuses on transparency, documentation, and the 'right to explanation'." },
            { badge: "Rights-Based", text: "Focuses on substantive human rights, civil liability, and compensation for harm." }
        ]
    },
    scope: {
        description: "The jurisdictional reach of the regulation—who must comply and where.",
        configurations: [
            { badge: "Extraterritorial", text: "Applies to foreign actors if they place systems on the local market (e.g., 'Brussels Effect')." },
            { badge: "Territorial", text: "Applies strictly within national borders." },
            { badge: "Sovereign", text: "Emphasizes national control over data and infrastructure (Data Sovereignty)." }
        ]
    }
};

export default function GovernancePage() {
    const { sources, isLoading } = useSources();
    const { isReadOnly } = useDemoMode();

    // Combine baseline sources with user analyzed sources
    const allSources: Source[] = [
        ...BASELINE_SOURCES,
        ...sources.filter(s => s.analysis)
    ];

    const [selectedSourceA, setSelectedSourceA] = useState<string>("EU");
    const [selectedSourceB, setSelectedSourceB] = useState<string>("");
    const [selectedSourceC, setSelectedSourceC] = useState<string>("");

    // Governance Compass State
    const [selectedPolicyText, setSelectedPolicyText] = useState<string>("");
    const [selectedTechText, setSelectedTechText] = useState<string>("");
    const [driftAnalysis, setDriftAnalysis] = useState<DriftVector | null>(null);
    const [isAnalyzingDrift, setIsAnalyzingDrift] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runDriftAnalysis = async (policy: string, tech: string) => {
        setError(null);
        console.log("Running drift analysis with:", { policyLength: policy?.length, techLength: tech?.length });
        if (!policy || !tech) {
            setError("Please select both policy and technical documents with valid text content.");
            return;
        }
        if (isReadOnly) {
            setError("Drift Analysis disabled in Demo Mode");
            return;
        }

        setIsAnalyzingDrift(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/governance/compass', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ policyText: policy, techText: tech })
            });

            const data = await response.json();
            console.log("Drift analysis response:", data);

            if (data.success) {
                setDriftAnalysis(data.analysis);
            } else {
                setError(`Analysis failed: ${data.error || "Unknown error from server"}`);
            }
        } catch (err) {
            console.error("Drift analysis failed", err);
            setError("Failed to run analysis. Check console for details.");
        } finally {
            setIsAnalyzingDrift(false);
        }
    };

    // Helper to get governance scores or default values
    const getScores = (sourceId: string) => {
        if (!sourceId) return null;
        const source = allSources.find(s => s.id === sourceId);
        return source?.analysis?.governance_scores || { centralization: 0, rights_focus: 0, flexibility: 0, market_power: 0, procedurality: 0 };
    };

    const scoresA = getScores(selectedSourceA);
    const scoresB = getScores(selectedSourceB);
    const scoresC = getScores(selectedSourceC);

    const dynamicRadarData = [
        { dimension: 'Centralization', A: scoresA?.centralization, B: scoresB?.centralization, C: scoresC?.centralization },
        { dimension: 'Rights Focus', A: scoresA?.rights_focus, B: scoresB?.rights_focus, C: scoresC?.rights_focus },
        { dimension: 'Flexibility', A: scoresA?.flexibility, B: scoresB?.flexibility, C: scoresC?.flexibility },
        { dimension: 'Market Power', A: scoresA?.market_power, B: scoresB?.market_power, C: scoresC?.market_power },
        { dimension: 'Procedural', A: scoresA?.procedurality, B: scoresB?.procedurality, C: scoresC?.procedurality },
    ];

    const getLabel = (id: string) => {
        if (!id) return "";
        return allSources.find(s => s.id === id)?.title || "Unknown";
    };

    const isMissingScores = (id: string) => {
        if (!id) return false;
        const source = allSources.find(s => s.id === id);
        return !source?.analysis?.governance_scores;
    };

    const showWarning = isMissingScores(selectedSourceA) || isMissingScores(selectedSourceB) || isMissingScores(selectedSourceC);

    const getSummary = (id: string) => {
        if (!id) return null;
        const source = allSources.find(s => s.id === id);
        return {
            title: source?.title || "Unknown Policy",
            description: source?.description || source?.analysis?.key_insight || "No description available.",
            color: source?.colorClass || "slate"
        };
    };

    const activeIds = [selectedSourceA, selectedSourceB, selectedSourceC].filter(Boolean);

    // Determine grid columns based on active selections
    const gridColsClass = activeIds.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

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
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Resource Orchestration</h2>
                <p className="text-slate-500">Comparative analysis of governance mechanisms across AI frameworks.</p>
            </div>

            {/* Radar Chart Visualization */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Framework Comparison</CardTitle>
                            <CardDescription>Visual comparison of governance characteristics</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { value: selectedSourceA, setter: setSelectedSourceA, label: "Framework A" },
                                { value: selectedSourceB, setter: setSelectedSourceB, label: "Framework B" },
                                { value: selectedSourceC, setter: setSelectedSourceC, label: "Framework C (Optional)" }
                            ].map((selector, i) => (
                                <select
                                    key={i}
                                    className="p-2 border rounded-md text-sm bg-white"
                                    value={selector.value}
                                    onChange={(e) => selector.setter(e.target.value)}
                                >
                                    <option value="">Select {selector.label}...</option>
                                    {allSources.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    {showWarning && (
                        <div className="w-full mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-yellow-800">Re-analysis Required</h4>
                                <p className="text-sm text-yellow-700">
                                    One or more selected documents are missing governance scores. Please re-run the analysis for these documents to see them on the chart.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="h-[400px] w-full max-w-2xl">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dynamicRadarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="dimension" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name={getLabel(selectedSourceA)} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                {selectedSourceB && <Radar name={getLabel(selectedSourceB)} dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />}
                                {selectedSourceC && <Radar name={getLabel(selectedSourceC)} dataKey="C" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />}
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Governance Compass Section */}
            <div className="space-y-4 pt-8 border-t">
                <div className="flex items-center space-x-2">
                    <Scale className="h-6 w-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-slate-900">Governance Drift Analysis</h3>
                    <Badge className="bg-blue-100 text-blue-700">
                        New
                    </Badge>
                </div>
                <p className="text-slate-500">
                    Analyze the gap between ethical rhetoric (Policy) and technical reality (Implementation).
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Analysis Input</CardTitle>
                            <CardDescription>Select sources to compare</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Policy Rhetoric (Text A)</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm mb-2"
                                    onChange={(e) => {
                                        const source = sources.find(s => s.id === e.target.value);
                                        // Fallback to 'text' if 'extractedText' is missing
                                        const text = source?.extractedText || (source as unknown as { text?: string })?.text || "";
                                        setSelectedPolicyText(text);
                                    }}
                                >
                                    <option value="">Select Policy Document (Optional)...</option>
                                    {sources.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                                <Textarea
                                    placeholder="Or paste policy text here..."
                                    value={selectedPolicyText}
                                    onChange={(e) => setSelectedPolicyText(e.target.value)}
                                    className="h-32"
                                />
                                <p className="text-xs text-slate-400 text-right">{selectedPolicyText.length} chars</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Technical Reality (Text B)</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm mb-2"
                                    onChange={(e) => {
                                        const source = sources.find(s => s.id === e.target.value);
                                        // Fallback to 'text' if 'extractedText' is missing
                                        const text = source?.extractedText || (source as unknown as { text?: string })?.text || "";
                                        setSelectedTechText(text);
                                    }}
                                >
                                    <option value="">Select Technical Spec (Optional)...</option>
                                    {sources.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                                <Textarea
                                    placeholder="Or paste technical spec text here..."
                                    value={selectedTechText}
                                    onChange={(e) => setSelectedTechText(e.target.value)}
                                    className="h-32"
                                />
                                <p className="text-xs text-slate-400 text-right">{selectedTechText.length} chars</p>
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => runDriftAnalysis(selectedPolicyText, selectedTechText)}
                                disabled={!selectedPolicyText || !selectedTechText || isAnalyzingDrift || isReadOnly}
                                title={isReadOnly ? "Drift Analysis disabled in Demo Mode" : ""}
                            >
                                {isAnalyzingDrift ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Scale className="mr-2 h-4 w-4" />
                                        Run Drift Analysis
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                                    Error: {error}
                                </div>
                            )}

                            {isAnalyzingDrift && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <span className="ml-2 text-sm text-slate-500">Calculating drift...</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2">
                        <GovernanceCompass analysis={driftAnalysis} />
                    </div>
                </div>
            </div>

            {/* Detailed Insights Grid */}
            {(selectedSourceA || selectedSourceB) && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                        <h3 className="text-2xl font-bold text-slate-900">Grounded Governance Insights</h3>
                        <Badge className="bg-purple-100 text-purple-700">
                            Empirical
                        </Badge>
                    </div>
                    <div className={`grid gap-4 ${gridColsClass}`}>
                        {activeIds.map((sourceId, idx) => {
                            const source = allSources.find(s => s.id === sourceId);
                            const insights = source?.analysis;

                            if (!insights) return null;

                            return (
                                <Card key={`${sourceId}-${idx}`} className="border-purple-100 bg-purple-50/30">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-purple-600" />
                                            <CardTitle className="text-base">{source.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-2">
                                        {insights?.governance_power_accountability && (
                                            <div>
                                                <span className="font-semibold text-purple-900">Governance & Power: </span>
                                                <span className="text-slate-700">{insights.governance_power_accountability}</span>
                                            </div>
                                        )}
                                        {insights?.plurality_inclusion_embodiment && (
                                            <div>
                                                <span className="font-semibold text-blue-900">Plurality & Inclusion: </span>
                                                <span className="text-slate-700">{insights.plurality_inclusion_embodiment}</span>
                                            </div>
                                        )}
                                        {insights?.agency_codesign_self_determination && (
                                            <div>
                                                <span className="font-semibold text-green-900">Agency & Co-Design: </span>
                                                <span className="text-slate-700">{insights.agency_codesign_self_determination}</span>
                                            </div>
                                        )}
                                        {insights?.reflexivity_situated_praxis && (
                                            <div>
                                                <span className="font-semibold text-orange-900">Reflexivity: </span>
                                                <span className="text-slate-700">{insights.reflexivity_situated_praxis}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {/* Summary Cards */}
                <div className={`grid grid-cols-1 gap-4 mb-4 ${gridColsClass}`}>
                    {activeIds.map((id, idx) => {
                        const summary = getSummary(id);
                        if (!summary) return null;
                        const borderColor = summary.color === 'slate' ? 'border-slate-200' : `border-${summary.color}-100`;
                        const bgColor = summary.color === 'slate' ? 'bg-white' : `bg-${summary.color}-50`;
                        const iconColor = summary.color === 'slate' ? 'text-slate-600' : `text-${summary.color}-600`;
                        const textColor = summary.color === 'slate' ? 'text-slate-900' : `text-${summary.color}-900`;

                        return (
                            <div key={idx} className={`p-4 ${bgColor} rounded-lg border ${borderColor}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Globe className={`h-5 w-5 ${iconColor}`} />
                                    <h3 className={`font-bold ${textColor}`}>{summary.title}</h3>
                                </div>
                                <p className={`text-sm ${textColor} opacity-90`}>
                                    {summary.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {PILLAR_METADATA.map((pillarMeta) => {
                    return (
                        <Card key={pillarMeta.id} className="overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-white rounded-md shadow-sm border">
                                        <pillarMeta.icon className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="p-0 h-auto text-lg font-semibold text-slate-800 hover:bg-transparent flex items-center gap-2">
                                                {pillarMeta.title} <Info className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{pillarMeta.title}</DialogTitle>
                                                <DialogDescription>
                                                    {PILLAR_DEFINITIONS[pillarMeta.id as keyof typeof PILLAR_DEFINITIONS].description}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 mt-4">
                                                <h4 className="font-semibold text-sm text-slate-900">Key Configurations</h4>
                                                <div className="grid gap-3">
                                                    {PILLAR_DEFINITIONS[pillarMeta.id as keyof typeof PILLAR_DEFINITIONS].configurations.map((config, idx) => (
                                                        <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100">
                                                            <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 block mb-1">
                                                                {config.badge}
                                                            </span>
                                                            <span className="text-sm text-slate-600">
                                                                {config.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className={`grid divide-y md:divide-y-0 md:divide-x ${gridColsClass}`}>
                                    {activeIds.map((sourceId, idx) => {
                                        const source = allSources.find(s => s.id === sourceId);
                                        const pillar = source?.analysis?.structural_pillars?.[pillarMeta.id as keyof typeof source.analysis.structural_pillars];

                                        // Baseline detection for styling
                                        const isBaseline = sourceId === "EU" || sourceId === "Brazil";
                                        const badgeColorClass = isBaseline
                                            ? (sourceId === "EU" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700")
                                            : "bg-slate-100 text-slate-700";

                                        return (
                                            <div key={idx} className="p-6 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{source?.title}</span>
                                                    {pillar?.badge && (
                                                        <Badge variant="secondary" className={badgeColorClass}>
                                                            {pillar.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-medium text-slate-900">{pillar?.title || "Not analyzed"}</h4>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    {pillar?.description || "Structural analysis not available for this dimension."}
                                                </p>
                                                {pillar?.quote && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                                        <p className="text-xs text-slate-500 italic">
                                                            &quot;{pillar.quote}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

        </div>
    );
}
