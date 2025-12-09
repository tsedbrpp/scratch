"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
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

const COMPARISONS = [
    {
        id: "risk",
        title: "Risk Classification",
        icon: AlertTriangle,
        eu: {
            title: "Pyramid of Risk",
            description: "Four levels: Unacceptable (banned), High Risk (regulated), Limited Risk (transparency), Minimal Risk (no obligations).",
            badge: "Prescriptive",
            color: "bg-blue-50 text-blue-700"
        },
        brazil: {
            title: "Risk Categories",
            description: "Excessive Risk (banned) and High Risk. Assessment criteria are similar but more flexible in initial definitions.",
            badge: "Principled",
            color: "bg-yellow-50 text-yellow-700"
        }
    },
    {
        id: "enforcement",
        title: "Enforcement Bodies",
        icon: Shield,
        eu: {
            title: "AI Office & National Authorities",
            description: "Centralized AI Office within the Commission for general purpose AI; national supervisory authorities for other systems.",
            badge: "Centralized/Hybrid",
            color: "bg-blue-50 text-blue-700"
        },
        brazil: {
            title: "Competent Authority",
            description: "Designation of a coordinating authority to articulate with existing sectoral regulators (an 'orchestrator' model).",
            badge: "Networked",
            color: "bg-yellow-50 text-yellow-700"
        }
    },
    {
        id: "rights",
        title: "Rights & Redress",
        icon: Users,
        eu: {
            title: "Fundamental Rights Impact",
            description: "Requirement for deployers of high-risk systems. Right to explanation and complaints to national authorities.",
            badge: "Procedural",
            color: "bg-blue-50 text-blue-700"
        },
        brazil: {
            title: "Rights of Affected Persons",
            description: "Explicit catalogue of rights including explanation, contestation, and non-discrimination. Stronger focus on individual redress.",
            badge: "Rights-Based",
            color: "bg-yellow-50 text-yellow-700"
        }
    },
    {
        id: "scope",
        title: "Territorial Scope",
        icon: Globe,
        eu: {
            title: "Brussels Effect",
            description: "Applies to any provider placing systems on the EU market or where output is used in the EU.",
            badge: "Extraterritorial",
            color: "bg-blue-50 text-blue-700"
        },
        brazil: {
            title: "National Sovereignty",
            description: "Applies to systems used or developed in Brazil, or processing data of individuals in Brazil.",
            badge: "Territorial",
            color: "bg-yellow-50 text-yellow-700"
        }
    }
];

const BASELINE_INSIGHTS = {
    EU: {
        governance_power_accountability: "Centralized product safety framework focused on market regulation. Power resides in the AI Office and national competent authorities.",
        plurality_inclusion_embodiment: "Limited inclusion mechanisms. Focus is on technical standards and expert bodies rather than diverse knowledge systems.",
        agency_codesign_self_determination: "Provides rights to explanation and complaints, but limited scope for co-design or refusal by affected communities.",
        reflexivity_situated_praxis: "Low reflexivity; assumes universal applicability of Western technical standards and risk definitions."
    },
    Brazil: {
        governance_power_accountability: "Networked 'orchestrator' model coordinating sectoral regulators. Strong emphasis on civil liability and redress.",
        plurality_inclusion_embodiment: "Stronger focus on non-discrimination and the rights of affected groups, reflecting Brazil's social stratification context.",
        agency_codesign_self_determination: "Explicit rights to contestation, explanation, and human review. Emphasizes the 'centrality of the human person'.",
        reflexivity_situated_praxis: "Moderate reflexivity; adapts global models to local legal tradition but still operates within a modernization paradigm."
    }
};

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
    const [selectedSourceA, setSelectedSourceA] = useState<string>("EU");
    const [selectedSourceB, setSelectedSourceB] = useState<string>("");

    // Governance Compass State
    const [selectedPolicyText, setSelectedPolicyText] = useState<string>("");
    const [selectedTechText, setSelectedTechText] = useState<string>("");
    const [driftAnalysis, setDriftAnalysis] = useState<DriftVector | null>(null);
    const [isAnalyzingDrift, setIsAnalyzingDrift] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRunTime, setLastRunTime] = useState<string | null>(null);

    const runDriftAnalysis = async (policy: string, tech: string) => {
        setError(null);
        setLastRunTime(new Date().toLocaleTimeString());
        console.log("Running drift analysis with:", { policyLength: policy?.length, techLength: tech?.length });
        if (!policy || !tech) {
            setError("Please select both policy and technical documents with valid text content.");
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

    // Filter sources that have analysis data
    const analyzedSources = sources.filter(s => s.analysis);

    // Helper to get governance scores or default values
    const getScores = (sourceId: string) => {
        if (sourceId === "EU") return { centralization: 85, rights_focus: 60, flexibility: 40, market_power: 95, procedurality: 85 };
        if (sourceId === "Brazil") return { centralization: 45, rights_focus: 90, flexibility: 80, market_power: 50, procedurality: 55 };

        const source = analyzedSources.find(s => s.id === sourceId);
        return source?.analysis?.governance_scores || { centralization: 0, rights_focus: 0, flexibility: 0, market_power: 0, procedurality: 0 };
    };

    const scoresA = getScores(selectedSourceA);
    const scoresB = getScores(selectedSourceB);

    const dynamicRadarData = [
        { dimension: 'Centralization', A: scoresA.centralization, B: scoresB.centralization },
        { dimension: 'Rights Focus', A: scoresA.rights_focus, B: scoresB.rights_focus },
        { dimension: 'Flexibility', A: scoresA.flexibility, B: scoresB.flexibility },
        { dimension: 'Market Power', A: scoresA.market_power, B: scoresB.market_power },
        { dimension: 'Procedural', A: scoresA.procedurality, B: scoresB.procedurality },
    ];

    const getLabel = (id: string) => {
        if (id === "EU") return "EU AI Act";
        if (id === "Brazil") return "Brazil PL 2338";
        return analyzedSources.find(s => s.id === id)?.title || "Unknown";
    };

    const isMissingScores = (id: string) => {
        if (id === "EU" || id === "Brazil") return false;
        const source = analyzedSources.find(s => s.id === id);
        return !source?.analysis?.governance_scores;
    };

    const showWarning = isMissingScores(selectedSourceA) || isMissingScores(selectedSourceB);

    const getSummary = (id: string) => {
        if (id === "EU") return {
            title: "EU AI Act",
            description: "A product safety framework focused on market regulation and risk mitigation.",
            color: "blue"
        };
        if (id === "Brazil") return {
            title: "Brazil PL 2338",
            description: "A rights-based framework emphasizing civil liability and redress for affected individuals.",
            color: "yellow"
        };

        const source = analyzedSources.find(s => s.id === id);
        return {
            title: source?.title || "Unknown Policy",
            description: source?.analysis?.key_insight || "No analysis available.",
            color: "slate"
        };
    };

    const summaryA = getSummary(selectedSourceA);
    const summaryB = getSummary(selectedSourceB);

    const isDefaultComparison = selectedSourceA === "EU" && selectedSourceB === "Brazil";

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
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Framework Comparison</CardTitle>
                            <CardDescription>Visual comparison of governance characteristics</CardDescription>
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="p-2 border rounded-md text-sm bg-white"
                                value={selectedSourceA}
                                onChange={(e) => setSelectedSourceA(e.target.value)}
                            >
                                <option value="EU">EU AI Act (Baseline)</option>
                                {analyzedSources.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                            <select
                                className="p-2 border rounded-md text-sm bg-white"
                                value={selectedSourceB}
                                onChange={(e) => setSelectedSourceB(e.target.value)}
                            >
                                <option value="EU">EU AI Act (Baseline)</option>
                                {analyzedSources.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
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
                                    One or more selected sources are missing governance scores. Please go to the
                                    <span className="font-bold"> Data </span> page and re-run the "DSF Analysis" for these documents to generate the necessary data.
                                </p>
                            </div>
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={dynamicRadarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar name={getLabel(selectedSourceA)} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            <Radar name={getLabel(selectedSourceB)} dataKey="B" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Dynamic Governance Insights */}
            {analyzedSources.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                        <h3 className="text-2xl font-bold text-slate-900">Grounded Governance Insights</h3>
                        <Badge className="bg-purple-100 text-purple-700">
                            Empirical
                        </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {[selectedSourceA, selectedSourceB].map((sourceId) => {
                            const isBaseline = sourceId === "EU" || sourceId === "Brazil";
                            const source = analyzedSources.find(s => s.id === sourceId);
                            const insights = isBaseline
                                ? BASELINE_INSIGHTS[sourceId as keyof typeof BASELINE_INSIGHTS]
                                : source?.analysis;

                            if (!insights && !isBaseline) return null;

                            const title = isBaseline
                                ? (sourceId === "EU" ? "EU AI Act" : "Brazil PL 2338")
                                : source?.title;

                            return (
                                <Card key={sourceId} className="border-purple-100 bg-purple-50/30">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-purple-600" />
                                            <CardTitle className="text-base">{title}</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={`p-4 bg-${summaryA.color}-50 rounded-lg border border-${summaryA.color}-100`}>
                        <div className="flex items-center space-x-2 mb-2">
                            <Globe className={`h-5 w-5 text-${summaryA.color}-600`} />
                            <h3 className={`font-bold text-${summaryA.color}-900`}>{summaryA.title}</h3>
                        </div>
                        <p className={`text-sm text-${summaryA.color}-700`}>
                            {summaryA.description}
                        </p>
                    </div>
                    <div className={`p-4 bg-${summaryB.color}-50 rounded-lg border border-${summaryB.color}-100`}>
                        <div className="flex items-center space-x-2 mb-2">
                            <Globe className={`h-5 w-5 text-${summaryB.color}-600`} />
                            <h3 className={`font-bold text-${summaryB.color}-900`}>{summaryB.title}</h3>
                        </div>
                        <p className={`text-sm text-${summaryB.color}-700`}>
                            {summaryB.description}
                        </p>
                    </div>
                </div>

                {isDefaultComparison ? (
                    COMPARISONS.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-white rounded-md shadow-sm border">
                                        <item.icon className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="p-0 h-auto text-lg font-semibold text-slate-800 hover:bg-transparent flex items-center gap-2">
                                                {item.title} <Info className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{item.title}</DialogTitle>
                                                <DialogDescription>
                                                    {PILLAR_DEFINITIONS[item.id as keyof typeof PILLAR_DEFINITIONS].description}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 mt-4">
                                                <h4 className="font-semibold text-sm text-slate-900">Key Configurations</h4>
                                                <div className="grid gap-3">
                                                    {PILLAR_DEFINITIONS[item.id as keyof typeof PILLAR_DEFINITIONS].configurations.map((config, idx) => (
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
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                                    <div className="p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">EU Approach</span>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                                {item.eu.badge}
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium text-slate-900">{item.eu.title}</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {item.eu.description}
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Brazil Approach</span>
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                                {item.brazil.badge}
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium text-slate-900">{item.brazil.title}</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {item.brazil.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    COMPARISONS.map((item) => {
                        // Helper to get pillar data handling baselines
                        const getPillarData = (sourceId: string, comparisonId: string) => {
                            if (sourceId === "EU") {
                                const comp = COMPARISONS.find(c => c.id === comparisonId);
                                return comp ? { ...comp.eu, isBaseline: true } : null;
                            }
                            if (sourceId === "Brazil") {
                                const comp = COMPARISONS.find(c => c.id === comparisonId);
                                return comp ? { ...comp.brazil, isBaseline: true } : null;
                            }
                            const source = analyzedSources.find(s => s.id === sourceId);
                            const pillar = source?.analysis?.structural_pillars?.[comparisonId as keyof typeof source.analysis.structural_pillars];
                            return pillar ? { ...pillar, isBaseline: false } : null;
                        };

                        const pillarA = getPillarData(selectedSourceA, item.id);
                        const pillarB = getPillarData(selectedSourceB, item.id);

                        if (!pillarA && !pillarB) return null;

                        return (
                            <Card key={item.id} className="overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b pb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-white rounded-md shadow-sm border">
                                            <item.icon className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" className="p-0 h-auto text-lg font-semibold text-slate-800 hover:bg-transparent flex items-center gap-2">
                                                    {item.title} <Info className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{item.title}</DialogTitle>
                                                    <DialogDescription>
                                                        {PILLAR_DEFINITIONS[item.id as keyof typeof PILLAR_DEFINITIONS].description}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 mt-4">
                                                    <h4 className="font-semibold text-sm text-slate-900">Key Configurations</h4>
                                                    <div className="grid gap-3">
                                                        {PILLAR_DEFINITIONS[item.id as keyof typeof PILLAR_DEFINITIONS].configurations.map((config, idx) => (
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
                                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{summaryA.title}</span>
                                                {pillarA?.badge && (
                                                    <Badge variant="secondary" className={`
                                                        ${pillarA.isBaseline && selectedSourceA === "EU" ? "bg-blue-100 text-blue-700" : ""}
                                                        ${pillarA.isBaseline && selectedSourceA === "Brazil" ? "bg-yellow-100 text-yellow-700" : ""}
                                                        ${!pillarA.isBaseline ? "bg-slate-100 text-slate-700" : ""}
                                                    `}>
                                                        {pillarA.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="font-medium text-slate-900">{pillarA?.title || "Not analyzed"}</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {pillarA?.description || "Structural analysis not available for this dimension."}
                                            </p>
                                            {(pillarA as any)?.quote && (
                                                <div className="mt-3 pt-3 border-t border-slate-100">
                                                    <p className="text-xs text-slate-500 italic">
                                                        "{(pillarA as any).quote}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">{summaryB.title}</span>
                                                {pillarB?.badge && (
                                                    <Badge variant="secondary" className={`
                                                        ${pillarB.isBaseline && selectedSourceB === "EU" ? "bg-blue-100 text-blue-700" : ""}
                                                        ${pillarB.isBaseline && selectedSourceB === "Brazil" ? "bg-yellow-100 text-yellow-700" : ""}
                                                        ${!pillarB.isBaseline ? "bg-slate-100 text-slate-700" : ""}
                                                    `}>
                                                        {pillarB.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="font-medium text-slate-900">{pillarB?.title || "Not analyzed"}</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {pillarB?.description || "Structural analysis not available for this dimension."}
                                            </p>
                                            {(pillarB as any)?.quote && (
                                                <div className="mt-3 pt-3 border-t border-slate-100">
                                                    <p className="text-xs text-slate-500 italic">
                                                        "{(pillarB as any).quote}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
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
                                        const text = source?.extractedText || (source as any)?.text || "";
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
                                        const text = source?.extractedText || (source as any)?.text || "";
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
                                disabled={!selectedPolicyText || !selectedTechText || isAnalyzingDrift}
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
            {/* Debug Info Panel Removed */}
        </div>
    );
}
