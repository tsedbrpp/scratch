
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, TrendingDown, RefreshCcw, BrainCircuit, Loader2 } from 'lucide-react';
import { EcosystemActor } from '@/types/ecosystem';
import { ScenarioId, applyScenario } from '@/lib/scenario-engine';
import { generateEdges } from '@/lib/graph-utils';

interface ScenarioPanelProps {
    actors: EcosystemActor[];
    activeScenario: ScenarioId;
    setActiveScenario: (id: ScenarioId) => void;
}

interface AiTrajectoryResult {
    narrative: string;
    deltas: {
        source_id: string;
        target_id: string;
        multiplier: number;
        reasoning: string;
    }[];
    winners?: string[];
    losers?: string[];
}

export function ScenarioPanel({ actors, activeScenario, setActiveScenario }: ScenarioPanelProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResults, setAiResults] = useState<Record<string, AiTrajectoryResult>>({});

    // 1. Rule-Based Calculation (Fast, Default)
    const { deltas: ruleDeltas, narrative: ruleNarrative } = useMemo(() => {
        const edges = generateEdges(actors);
        return applyScenario(actors, edges, activeScenario);
    }, [actors, activeScenario]);

    // 2. Select Data Source (AI > Rules)
    const currentAiResult = aiResults[activeScenario];
    const displayNarrative = currentAiResult ? currentAiResult.narrative : ruleNarrative;

    // Merge or Replace Deltas
    const displayDeltas = useMemo(() => {
        if (currentAiResult) {
            return currentAiResult.deltas
                .sort((a, b) => Math.abs(b.multiplier - 1) - Math.abs(a.multiplier - 1))
                .map(d => ({
                    id: `${d.source_id}-${d.target_id}`,
                    delta: d.multiplier - 1,
                    narrative: d.reasoning
                }));
        }
        return ruleDeltas;
    }, [currentAiResult, ruleDeltas]);

    const handleAiAnalysis = async () => {
        if (activeScenario === "None") return;
        setIsAnalyzing(true);
        try {
            const scenarioDescriptions = {
                "WeakEnforcement": "Formal regulatory power dissolves. Corporate self-regulation and harm externalization intensify.",
                "PrivateStandards": "Compliance shifts from law to private certification. Standards bodies gain centrality.",
                "ExpandedInclusion": "Marginalized actors gain power. Accountability loops strengthen; extraction is contested."
            };

            const response = await fetch('/api/ecosystem/trajectory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actors,
                    scenario: {
                        name: activeScenario,
                        description: scenarioDescriptions[activeScenario as keyof typeof scenarioDescriptions] || activeScenario
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                setAiResults(prev => ({
                    ...prev,
                    [activeScenario]: data.analysis
                }));
            } else {
                alert("AI Simulation failed: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to run AI simulation.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const scenarios: { id: ScenarioId; label: string; icon: any }[] = [
        { id: "None", label: "Baseline", icon: RefreshCcw },
        { id: "WeakEnforcement", label: "Weak Enforcement", icon: TrendingDown },
        { id: "PrivateStandards", label: "Private Standards", icon: Sparkles },
        { id: "ExpandedInclusion", label: "Expanded Inclusion", icon: TrendingUp },
    ];

    // Helper to robustly find actor names given an ID (which might be a name or an ID)
    const resolveActorName = (identifier: string, fallback: string) => {
        if (!identifier) return fallback;
        const exactMatch = actors.find(a => a.id === identifier);
        if (exactMatch) return exactMatch.name;

        const lowerId = identifier.toLowerCase();
        const looseMatch = actors.find(a => a.id.toLowerCase() === lowerId || a.name.toLowerCase() === lowerId);
        if (looseMatch) return looseMatch.name;

        // Partial ID match (if AI truncated the ID or provided a short hash)
        // Check if the actor ID starts with the identifier, or contains it (if significant length)
        const partialMatch = actors.find(a =>
            (identifier.length > 3 && a.id.toLowerCase().includes(lowerId)) ||
            (a.id.length > 3 && lowerId.includes(a.id.toLowerCase()))
        );
        if (partialMatch) return partialMatch.name;

        // If the AI returned the Name directly instead of ID, return that
        return identifier;
    };

    return (
        <Card className="h-full border-l-4 border-l-indigo-400 bg-slate-50/50 flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-900">
                    <Sparkles className="h-5 w-5" />
                    Trajectory Explorer
                </CardTitle>
                <CardDescription>
                    Simulate how specific governance conditions reconfigure the assemblage.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 overflow-y-auto">

                {/* Scenario Toggles */}
                <div className="grid grid-cols-1 gap-2">
                    {scenarios.map(s => {
                        const Icon = s.icon;
                        return (
                            <Button
                                key={s.id}
                                variant={activeScenario === s.id ? "default" : "outline"}
                                className={`justify-start gap-2 h-auto py-2 ${activeScenario === s.id ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-indigo-50 text-slate-600"}`}
                                onClick={() => setActiveScenario(s.id)}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">{s.label}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>

                {/* Narrative & Deltas */}
                {activeScenario !== "None" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* AI Trigger */}
                        {!currentAiResult && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200"
                                onClick={handleAiAnalysis}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <BrainCircuit className="h-3 w-3 mr-2" />}
                                {isAnalyzing ? "Simulating..." : "Enhance with Generative AI"}
                            </Button>
                        )}

                        <div className={`p-3 rounded-md border text-xs leading-relaxed italic ${currentAiResult ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-indigo-50 border-indigo-100 text-indigo-800"}`}>
                            {currentAiResult && <div className="flex items-center gap-1 mb-1 not-italic font-bold text-purple-600"><BrainCircuit className="h-3 w-3" /> AI Analysis</div>}
                            "{displayNarrative}"
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Top Reconfigurations</h4>
                            {displayDeltas.length > 0 ? (
                                <div className="space-y-2">
                                    {displayDeltas.slice(0, 5).map((d, i) => (
                                        <div key={i} className="flex flex-col bg-white p-2 rounded border shadow-sm text-xs gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-slate-700 truncate max-w-[200px]">
                                                    {/* If AI, we use ID but might want names. For rule-based, narrative is simpler. 
                                                        Wait, AI result has Source/Target IDs. Rule result has narrative text.
                                                        Let's split the difference visually.
                                                    */}
                                                    {d.id.includes('-') && currentAiResult
                                                        ? `${resolveActorName(d.id.split('-')[0], "Src")} → ${resolveActorName(d.id.split('-')[1], "Tgt")}`
                                                        : (d.narrative.includes(" ") ? "Reconfiguration" : d.narrative) // Fallback if narrative is long
                                                    }
                                                </span>
                                                <div className={`flex items-center gap-1 font-bold ${d.delta > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                    {d.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                    {Math.abs(d.delta * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            {/* Show reasoning */}
                                            <div className="text-slate-500 text-[10px] leading-tight opacity-90">
                                                {d.narrative}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">No significant shifts detected.</p>
                            )}
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
