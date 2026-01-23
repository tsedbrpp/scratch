"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Layers, Maximize2, Minimize2, X, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EcosystemActor, AssemblageAnalysis, EcosystemConfiguration } from '@/types/ecosystem';
import { ProvisionalBadge } from '@/components/ui/provisional-badge';
import { AssemblageAnalysisView } from './AssemblageAnalysisView';
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";

interface AssemblagePanelProps {
    actors: EcosystemActor[];
    analyzedText?: string;
    savedAnalysis?: AssemblageAnalysis | null;
    onSaveAnalysis?: (analysis: AssemblageAnalysis) => void;
    // Expansion Props
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    // Unification Props
    selectedConfig?: EcosystemConfiguration | null;
    onUpdateConfig?: (config: EcosystemConfiguration) => void;
    onClose?: () => void;
    onUpdateActors?: (actors: EcosystemActor[]) => void;
}

export function AssemblagePanel({ actors, analyzedText = "", savedAnalysis, onSaveAnalysis, isExpanded = false, onToggleExpand, selectedConfig, onUpdateConfig, onClose, onUpdateActors }: AssemblagePanelProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Credit System
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [showTopUp, setShowTopUp] = useState(false);

    const handleRatify = () => {
        const currentData = savedAnalysis || selectedConfig?.analysisData;
        if (!currentData?.provisional_status) return;

        const currentStatus = currentData.provisional_status;
        const updatedProvisional = {
            ...currentStatus,
            source: "user_validated" as const,
            fragility_score: {
                ...currentStatus.fragility_score,
                value: 0.1, // Significant reduction in fragility
                interpretation: "stable" as const,
                factors: {
                    input_completeness: 0.1,
                    model_uncertainty: 0.1,
                    theoretical_tension: 0.1,
                    empirical_grounding: 0.1
                }
            },
            authority_conditions: [" ratified by human expert"] // Mark as ratified
        };

        const updatedAnalysis = {
            ...currentData,
            provisional_status: updatedProvisional
        };

        if (selectedConfig && onUpdateConfig) {
            const updatedConfig = {
                ...selectedConfig,
                analysisData: updatedAnalysis
            };
            onUpdateConfig(updatedConfig);
        }

        if (onSaveAnalysis) onSaveAnalysis(updatedAnalysis);
    };

    const handleContest = (interpretation: string, basis: string) => {
        const currentData = savedAnalysis || selectedConfig?.analysisData;
        if (!currentData?.provisional_status) return;

        const currentStatus = currentData.provisional_status;
        const updatedProvisional = {
            ...currentStatus,
            alternative_interpretations: [
                ...(currentStatus.alternative_interpretations || []),
                {
                    interpretation,
                    theoretical_basis: basis,
                    plausibility: 0.5
                }
            ],
            last_contested_at: new Date().toISOString()
        };

        const updatedAnalysis = {
            ...currentData,
            provisional_status: updatedProvisional
        };

        if (selectedConfig && onUpdateConfig) {
            const updatedConfig = {
                ...selectedConfig,
                analysisData: updatedAnalysis
            };
            onUpdateConfig(updatedConfig);
        }

        if (onSaveAnalysis) onSaveAnalysis(updatedAnalysis);
    };

    const handleAddLog = (entry: import('@/types/ecosystem').ReflexiveLogEntry) => {
        if (!selectedConfig || !onUpdateConfig) return;

        const updatedConfig = {
            ...selectedConfig,
            reflexive_log: [...(selectedConfig.reflexive_log || []), entry]
        };
        onUpdateConfig(updatedConfig);
    };

    const handleDeleteLog = (entryId: string) => {
        if (!selectedConfig || !onUpdateConfig) return;

        const updatedConfig = {
            ...selectedConfig,
            reflexive_log: (selectedConfig.reflexive_log || []).filter(l => l.id !== entryId)
        };
        onUpdateConfig(updatedConfig);
    };

    const handleDeepScan = async () => {
        if (actors.length === 0 && !analyzedText) {
            alert("Please add actors or text source before analyzing.");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }

        setIsAnalyzing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            // Always try to send demo ID if available (handles client/server env mismatch)
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            // [FIX] Changed from /api/ecosystem/absence to /api/analyze to use the full Deleuzian prompt
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: analyzedText || actors.map(a => `${a.name}: ${a.description}`).join("\n"),
                    analysisMode: 'assemblage_extraction_v3', // Prompt V3 maps scores
                    sourceType: 'Trace',
                    force: true // Force fresh analysis to bypass cache
                })
            });

            if (!response.ok) {
                console.error("Assemblage Analysis failed:", response.status, response.statusText);
                alert(`Analysis failed: Server returned ${response.status}`);
                return;
            }

            const data = await response.json();

            // 1. Update Analysis Data
            if (data.analysis && onSaveAnalysis) {
                const effectiveAnalysis = selectedConfig?.analysisData || savedAnalysis || {};
                const mergedAnalysis = {
                    ...effectiveAnalysis,
                    ...data.analysis,
                    // Preserve the core assemblage identity if not provided by new analysis
                    assemblage: effectiveAnalysis.assemblage || data.analysis.assemblage,
                    // [FIX] Force Reset Provisional Status on new analysis
                    provisional_status: {
                        source: "ai_generated",
                        fragility_score: {
                            value: 0.55,
                            interpretation: "provisional",
                            factors: {
                                input_completeness: 0.6,
                                model_uncertainty: 0.5,
                                theoretical_tension: 0.4,
                                empirical_grounding: 0.3
                            }
                        },
                        authority_conditions: ["pending ratification"]
                    }
                };
                onSaveAnalysis(mergedAnalysis);
                refetchCredits();
            }

            // 2. [NEW] Update Actor Metrics (Territorialization/Deterritorialization)
            if (data.analysis?.actors && Array.isArray(data.analysis.actors) && onUpdateActors) {
                console.log("Trace Complete: Updating Actor Metrics", data.analysis.actors);

                const updatedActors = actors.map(existingActor => {
                    // Fuzzy match by name
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const match = data.analysis.actors.find((a: any) => a.name.toLowerCase() === existingActor.name.toLowerCase());

                    if (match && match.metrics) {
                        return {
                            ...existingActor,
                            metrics: {
                                ...existingActor.metrics,
                                territorialization: match.metrics.territorialization ?? match.metrics.territoriality ?? match.metrics.territorial ?? match.metrics.influence ?? 5,
                                deterritorialization: match.metrics.deterritorialization ?? match.metrics.resistance ?? match.metrics.escape ?? Math.max(match.metrics.counter_conduct || 0, match.metrics.discursive_opposition || 0) ?? 5,
                                coding: match.metrics.coding ?? 5,
                                rationale: match.metrics.rationale
                            }
                        };
                    }
                    return existingActor;
                });

                onUpdateActors(updatedActors);
            }

        } catch (error) {
            console.error("Assemblage Analysis failed", error);
            alert("Failed to analyze assemblage. Please check your connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const [isEnriching, setIsEnriching] = useState(false);
    const [enrichProgress, setEnrichProgress] = useState(0);

    const handleEnrichLinks = async () => {
        if (!actors || actors.length === 0) return;
        if (!onUpdateActors) return;

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }

        setIsEnriching(true);
        setEnrichProgress(0);

        const actorsToEnrich = actors.filter(a => !a.url);
        const total = actorsToEnrich.length;
        let processed = 0;
        const updatedActors = [...actors];

        // Process in batches of 3 to avoid rate limits
        const BATCH_SIZE = 3;

        try {
            for (let i = 0; i < total; i += BATCH_SIZE) {
                const batch = actorsToEnrich.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async (actor) => {
                    try {
                        const response = await fetch('/api/enrich-actor', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                actorName: actor.name,
                                context: actor.type === 'Policymaker' ? 'government ministry' : 'official website'
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.url) {
                                const index = updatedActors.findIndex(a => a.id === actor.id);
                                if (index !== -1) {
                                    updatedActors[index] = { ...updatedActors[index], url: data.url };
                                }
                                refetchCredits();
                            }
                        }
                    } catch (err) {
                        console.warn(`Failed to enrich ${actor.name}`, err);
                    }
                }));

                processed += batch.length;
                setEnrichProgress(Math.round((processed / total) * 100));

                // Update text as we go (optional, or update at end)
                onUpdateActors([...updatedActors]);
            }
        } catch (error) {
            console.error("Enrichment failed", error);
            alert("Failed to complete link enrichment.");
        } finally {
            setIsEnriching(false);
            setEnrichProgress(0);
        }
    };

    return (
        <Card className="h-full border-l-4 border-l-slate-400 bg-slate-50/50 flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600" />
                        Interpretive Workspace
                    </div>
                    <div className="flex items-center gap-1">
                        {onToggleExpand && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={onToggleExpand} title={isExpanded ? "Collapse" : "Expand"}>
                                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                        )}
                        {onClose && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200" onClick={onClose} title="Close Panel">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardTitle>
                <CardDescription>
                    Tracing components, mobilities, and silences in the policy assemblage.
                    {/* Provisional Badge in Header if available */}
                    {(savedAnalysis?.provisional_status || (selectedConfig?.analysisData as AssemblageAnalysis)?.provisional_status) && (
                        <div className="mt-2">
                            <ProvisionalBadge
                                fragility={(savedAnalysis?.provisional_status || (selectedConfig?.analysisData as AssemblageAnalysis)?.provisional_status)?.fragility_score}
                            />
                        </div>
                    )}
                </CardDescription>

                <div className="pt-2">
                    <Button
                        size="sm"
                        onClick={handleDeepScan}
                        disabled={isAnalyzing}
                        className={`w-full text-xs font-medium gap-2 transition-all ${savedAnalysis ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Analyzing Assemblage...
                            </>
                        ) : savedAnalysis ? (
                            <>
                                <Search className="h-3 w-3" />
                                Re-Trace Inscriptions
                            </>
                        ) : (
                            <>
                                <Layers className="h-3 w-3" />
                                Trace Inscriptions
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto flex-1 p-4">
                {selectedConfig ? (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                            <h3 className="font-bold text-indigo-900 text-lg mb-1">{selectedConfig.name}</h3>
                            <p className="text-sm text-indigo-700 mb-3">{selectedConfig.description}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="bg-white p-2 rounded border border-indigo-100 cursor-help hover:bg-slate-50 transition-colors">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Territorialization</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-slate-900">
                                                        {(Number(selectedConfig.properties.territorialization_score) || 0) > 7 ? "High Intensity" : (Number(selectedConfig.properties.territorialization_score) || 0) > 4 ? "Medium Intensity" : "Low Intensity"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-800">
                                            <p className="font-bold border-b border-slate-700 pb-1 mb-1">Computed from Traces:</p>
                                            <ul className="text-xs list-disc list-inside space-y-1">
                                                {(selectedConfig.analysisData as AssemblageAnalysis)?.computed_metrics?.territorialization_audit && (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.territorialization_audit!.length > 0
                                                    ? (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.territorialization_audit!.map((t: string, i: number) => <li key={i}>{t}</li>)
                                                    : <li className="text-slate-400">No traces found</li>}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="bg-white p-2 rounded border border-indigo-100 cursor-help hover:bg-slate-50 transition-colors">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Coding Intensity</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-slate-900">
                                                        {(Number(selectedConfig.properties.coding_intensity_score) || 0) > 7 ? "Over-Coded" : (Number(selectedConfig.properties.coding_intensity_score) || 0) > 4 ? "Mixed Coding" : "Decoded"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-800">
                                            <p className="font-bold border-b border-slate-700 pb-1 mb-1">Computed from Traces:</p>
                                            <ul className="text-xs list-disc list-inside space-y-1">
                                                {(selectedConfig.analysisData as AssemblageAnalysis)?.computed_metrics?.coding_audit && (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.coding_audit!.length > 0
                                                    ? (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.coding_audit!.map((t: string, i: number) => <li key={i}>{t}</li>)
                                                    : <li className="text-slate-400">No traces found</li>}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {selectedConfig.analysisData ? (
                            <AssemblageAnalysisView
                                analysis={selectedConfig.analysisData as AssemblageAnalysis}
                                actors={actors}
                                reflexiveLogs={selectedConfig.reflexive_log}
                                onAddLog={handleAddLog}
                                onDeleteLog={handleDeleteLog}
                                onRatify={handleRatify}
                                onContest={handleContest}
                                onEnrichLinks={handleEnrichLinks}
                                isEnriching={isEnriching}
                                enrichProgress={enrichProgress}
                            />
                        ) : (
                            <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                                <p className="text-sm">No deep analysis data available for this configuration.</p>
                            </div>
                        )}
                    </div>
                ) : savedAnalysis ? (
                    <AssemblageAnalysisView
                        analysis={savedAnalysis}
                        actors={actors}
                        onEnrichLinks={handleEnrichLinks}
                        isEnriching={isEnriching}
                        enrichProgress={enrichProgress}
                        onRatify={handleRatify}
                        onContest={handleContest}
                    // Logs only exist in Config mode so far, but we could add them to global analysis too if needed.
                    // Currently ReflexiveLog is only connected to `selectedConfig` in logic above.
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                        <Layers className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Run analysis to map the assemblage.</p>
                    </div>
                )}
            </CardContent>
            <div className="p-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center italic">
                Methodological constrained artifact. Outputs are provisional inscriptions.
            </div>
            <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => refetchCredits()} />
        </Card >
    );
}
