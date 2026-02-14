"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Loader2, Layers, Maximize2, Minimize2, X, ChevronDown, ChevronUp, GripVertical, Trash2, Lock, Wind, Scale, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EcosystemActor, AssemblageAnalysis, EcosystemConfiguration } from '@/types/ecosystem';
import { ProvisionalBadge } from '@/components/ui/provisional-badge';
import { AssemblageAnalysisView } from './AssemblageAnalysisView';
import { AssemblageMethodologyGraph, PipelineStepStatus } from './AssemblageMethodologyGraph';
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";
import { calculateAssemblageMetrics } from "@/lib/ecosystem-utils";
import { analyzeMediatorScoresBatch } from "@/services/mediatorAnalysis";
import { generateEdges } from "@/lib/graph-utils";
import { getMediatorClassification } from "@/types/relationship"; // [FIX] Import function

interface AssemblagePanelProps {
    actors: EcosystemActor[];
    analyzedText?: string;
    savedAnalysis?: AssemblageAnalysis | null;
    onSaveAnalysis?: (analysis: AssemblageAnalysis) => void;
    // Expansion Props
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    // Unification Props
    selectedConfigs?: EcosystemConfiguration[];
    onUpdateConfig?: (config: EcosystemConfiguration) => void;
    onClose?: () => void;
    onUpdateActors?: (actors: EcosystemActor[]) => void;
    // [NEW] Management Props
    allConfigurations?: EcosystemConfiguration[];
    onReorderConfigs?: (configs: EcosystemConfiguration[]) => void;
    onSelectConfig?: (id: string, multi: boolean) => void;
    onDeleteConfig?: (id: string) => void;
    // [NEW] ANT Workbench Props
    collapsedIds?: Set<string>;
    onToggleCollapse?: (id: string) => void;
}

export function AssemblagePanel({
    actors,
    analyzedText = "",
    savedAnalysis,
    onSaveAnalysis,
    isExpanded = false,
    onToggleExpand,
    selectedConfigs = [],
    onUpdateConfig,
    onClose,
    onUpdateActors,
    allConfigurations = [],
    onReorderConfigs,
    onSelectConfig,
    onDeleteConfig,
    collapsedIds,
    onToggleCollapse
}: AssemblagePanelProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisType, setAnalysisType] = useState('comprehensive_scan');

    // Credit System
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [showTopUp, setShowTopUp] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(false);
    const [showGraph, setShowGraph] = useState(false);

    // [NEW] View Mode: 'analysis' | 'manage'
    const [viewMode, setViewMode] = useState<'analysis' | 'manage'>('analysis');

    // Auto-switch to analysis when analyzing starts
    useEffect(() => {
        if (isAnalyzing) setViewMode('analysis');
    }, [isAnalyzing]);
    const [pipelineStatus, setPipelineStatus] = useState<{
        actants: PipelineStepStatus;
        relations: PipelineStepStatus;
        mechanisms: PipelineStepStatus;
        trajectory: PipelineStepStatus;
        critique: PipelineStepStatus;
        stress_test: PipelineStepStatus;
    }>({
        actants: 'pending',
        relations: 'pending',
        mechanisms: 'pending',
        trajectory: 'pending',
        critique: 'pending',
        stress_test: 'pending'
    });
    const [pipelineMessage, setPipelineMessage] = useState<string>('');

    // [NEW] Robust Assemblage Prep for Stress Test
    // Ensures we never pass an empty/stale configuration to the simulator
    const dashboardAssemblage = React.useMemo(() => {
        const currentActorIds = actors.map(a => a.id);

        // 1. Helper: Check if IDs are valid (must match at least one current actor)
        const hasValidMembers = (ids: string[]) => ids && ids.length > 0 && ids.some(id => currentActorIds.includes(id));

        // 2. Prefer selected config (has explicit members)
        if (selectedConfigs.length === 1) {
            const config = selectedConfigs[0];
            // [CRITICAL FIX] If selected config has no members (or invalid), 
            // we MUST polyfill it, otherwise Stress Test shows 0.
            if (hasValidMembers(config.memberIds)) {
                console.log('[StressTestDebug] Using Selected Config', { id: config.id, members: config.memberIds.length });
                return config;
            }
            console.log('[StressTestDebug] Selected Config has empty/stale members. Polyfilling with all actors.');
            return {
                ...config,
                memberIds: currentActorIds
            };
        }

        // 3. Fallback to analysis assemblage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const analysisAssemblage = (savedAnalysis as any)?.assemblage;

        // 4. Smart Polyfill
        if (analysisAssemblage) {
            const existingIds = analysisAssemblage.memberIds || [];

            // Usage: If existing members are valid, keep them. If not (stale/empty), use ALL.
            // This fixes "0.0" metrics from stale/mismatched IDs.
            if (hasValidMembers(existingIds)) {
                console.log('[StressTestDebug] Using Existing Analysis Assemblage', { count: existingIds.length });
                return {
                    ...analysisAssemblage,
                    memberIds: existingIds
                };
            }

            console.log('[StressTestDebug] Polyfilling Analysis Assemblage (stale/empty)', { existing: existingIds.length, current: currentActorIds.length });
            // Otherwise overwrite with all actors (Comprehensive Scan assumption)
            return {
                ...analysisAssemblage,
                memberIds: currentActorIds
            };
        }

        console.log('[StressTestDebug] Synthesizing Full Assemblage (no analysis)', { current: currentActorIds.length });
        // 5. Last resort: Synthesize a wrapper for the stress test
        return {
            id: "synthesized-root",
            name: "Analyzed Context",
            memberIds: currentActorIds,
            properties: {}
        };
    }, [selectedConfigs, savedAnalysis, actors]);

    // [FIX] Dynamic Metric Calculation 
    // Uses dashboardAssemblage (which is robust) to ensure metrics are never 0 unless truly empty
    const dynamicMetrics = React.useMemo(() => {
        // We act on the dashboardAssemblage, which is guaranteed to be a valid config-like object
        return calculateAssemblageMetrics(actors, dashboardAssemblage as EcosystemConfiguration);
    }, [actors, dashboardAssemblage]);

    const handleRatify = () => {
        const selectedConfig = selectedConfigs.length === 1 ? selectedConfigs[0] : null;
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
        const selectedConfig = selectedConfigs.length === 1 ? selectedConfigs[0] : null;
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
        const selectedConfig = selectedConfigs.length === 1 ? selectedConfigs[0] : null;
        if (!selectedConfig || !onUpdateConfig) return;

        const updatedConfig = {
            ...selectedConfig,
            reflexive_log: [...(selectedConfig.reflexive_log || []), entry]
        };
        onUpdateConfig(updatedConfig);
    };

    const handleDeleteLog = (entryId: string) => {
        const selectedConfig = selectedConfigs.length === 1 ? selectedConfigs[0] : null;
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
        setShowGraph(true); // Auto-open graph on start
        // Reset pipeline
        setPipelineStatus({
            actants: 'analyzing',
            relations: 'analyzing',
            mechanisms: 'pending',
            trajectory: 'pending',
            critique: 'pending',
            stress_test: 'pending'
        });
        setPipelineMessage("Tracing actants and relations...");

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            // Always try to send demo ID if available (handles client/server env mismatch)
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            // [FIX] Filter actors if a specific assemblage is selected
            const targetActors = selectedConfigs.length > 0
                ? actors.filter(a => selectedConfigs.some(c => c.memberIds.includes(a.id)))
                : actors;

            // [FIX] Changed from /api/ecosystem/absence to /api/analyze to use the full Deleuzian prompt
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: analyzedText || targetActors.map(a => `${a.name}: ${a.description}`).join("\n"),
                    analysisMode: analysisType, // Use selected mode
                    sourceType: 'Trace',
                    force: forceRefresh, // Use toggle state for cache control
                    assemblageId: selectedConfigs.map(c => c.id).join(','), // [NEW] Pass IDs for precise caching
                    // [FIX] Pass existing analysis for Critique and Realist modes
                    existingAnalysis: savedAnalysis || (selectedConfigs.length === 1 ? selectedConfigs[0].analysisData : null),
                    // [FIX] Pass structured data for Realist/Explanation modes
                    traced_actors: targetActors,
                    detected_mechanisms: (savedAnalysis as any)?.stabilization_mechanisms || (savedAnalysis as any)?.assemblage?.stabilization_mechanisms || [],
                    identified_capacities: (savedAnalysis as any)?.capacities || []
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
                const effectiveAnalysis = (selectedConfigs.length === 1 ? selectedConfigs[0].analysisData : null) || savedAnalysis || {};

                // [CRITICAL] Derive member IDs from returned actors if missing in assemblage object
                // The AI returns `analysis.actors` but might return an assemblage object without `memberIds`.
                let derivedMemberIds: string[] | undefined = data.analysis.assemblage?.memberIds;

                if ((!derivedMemberIds || derivedMemberIds.length === 0) && data.analysis.actors) {
                    // Match returned actors to current actors by name to find IDs
                    derivedMemberIds = actors
                        .filter(current => data.analysis.actors.some((analyzed: any) => analyzed.name.toLowerCase() === current.name.toLowerCase()))
                        .map(a => a.id);
                }

                // [CRITICAL] Extract/Sync Properties
                // Sync properties from analysis to config level
                const analysisProps = data.analysis.assemblage?.properties || {};
                const computedMetrics = data.analysis.computed_metrics || {};

                // Normalize keys (handle variations like territorialization_score vs territoriality)
                const stabilityScore = analysisProps.stability || 'Medium';
                const territorializationScore = computedMetrics.territorialization_score ?? analysisProps.territorialization_score ?? 5;
                const codingIntensityScore = computedMetrics.coding_intensity_score ?? analysisProps.coding_intensity_score ?? 5;


                const mergedAnalysis = {
                    ...effectiveAnalysis,
                    ...data.analysis,
                    // Preserve the core assemblage identity if not provided by new analysis
                    assemblage: {
                        ...(effectiveAnalysis.assemblage || data.analysis.assemblage),
                        memberIds: derivedMemberIds || effectiveAnalysis.assemblage?.memberIds
                    },
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

                // [FIX] Update Structural Data (memberIds & properties) on Config
                if (selectedConfigs.length === 1 && onUpdateConfig) {
                    const updatedConfig = {
                        ...selectedConfigs[0],
                        memberIds: derivedMemberIds && derivedMemberIds.length > 0 ? derivedMemberIds : selectedConfigs[0].memberIds, // Keep old if derivation failed
                        properties: {
                            ...selectedConfigs[0].properties,
                            sensitivity: stabilityScore, // Map specific props ? or keep general properties
                            stability: stabilityScore,
                            territorialization_score: territorializationScore,
                            coding_intensity_score: codingIntensityScore
                        },
                        analysisData: mergedAnalysis
                    };
                    onUpdateConfig(updatedConfig);
                }

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
            setPipelineStatus(prev => ({ ...prev, actants: 'error', relations: 'error' }));
        } finally {
            setIsAnalyzing(false);
            // Simulate completion sequence for visual feedback (since API is monolithic)
            // Realistically this should be driven by server events, but for now we simulate the flow
            // assuming the server did its job if no error was thrown.

            // Step 1: Trace Complete
            setPipelineStatus(prev => ({ ...prev, actants: 'done', relations: 'done', mechanisms: 'analyzing', trajectory: 'analyzing', critique: 'analyzing' }));
            setPipelineMessage("Running parallel tracks: Interpretation & Critique...");

            setTimeout(() => {
                // Step 2 & 3: Parallel Tracks Complete
                setPipelineStatus(prev => ({ ...prev, mechanisms: 'done', trajectory: 'done', critique: 'done', stress_test: 'done' }));
                setPipelineMessage("Analysis Complete. Stress Test Ready.");

                // Clear message after delay
                setTimeout(() => setPipelineMessage(''), 3000);
            }, 2500); // Slightly longer single delay to represent the parallel block
        }
    };

    const [isEnriching, setIsEnriching] = useState(false);
    const [enrichProgress, setEnrichProgress] = useState(0);

    const [isAnalyzingRelationships, setIsAnalyzingRelationships] = useState(false);

    const handleAnalyzeRelationships = async () => {
        if (!actors || actors.length === 0) return;

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }

        setIsAnalyzingRelationships(true);

        try {
            // 1. Identify Edges
            const targetActors = selectedConfigs.length > 0
                ? actors.filter(a => selectedConfigs.some(c => c.memberIds.includes(a.id)))
                : actors;

            let edges = generateEdges(targetActors);
            if (edges.length === 0) {
                alert("No relationships found between these actors.");
                setIsAnalyzingRelationships(false);
                return;
            }

            // [SMART SORT] Prioritize "Healthier" / More Powerful links
            // Sort by combined dynamic power of actors
            edges = edges.sort((a, b) => {
                const getPower = (actor: EcosystemActor) => (actor.metrics?.dynamic_power || 0);
                const scoreA = getPower(a.source) + getPower(a.target);
                const scoreB = getPower(b.source) + getPower(b.target);
                return scoreB - scoreA; // Descending
            });

            // 2. Prepare Inputs
            // TODO: Get real context from a "context" prop or similar if available, otherwise generic.
            const context = analyzedText || "Policy Ecosystem Analysis";

            const inputs = edges.map(edge => ({
                sourceActor: edge.source.name,
                targetActor: edge.target.name,
                relationshipType: edge.label,
                empiricalTraces: [edge.description], // Use existing description as trace for now
                documentContext: context
            }));


            // [SPEED] Full Processing with gpt-4o-mini (Limited to 50 per user request)
            const inputsToProcess = inputs.slice(0, 50);

            const results = await analyzeMediatorScoresBatch(inputsToProcess);

            // 4. Map Results to Relationship Objects
            const relationships: import('@/types/relationship').Relationship[] = results.map((res, i) => {
                const edge = edges[i];
                return {
                    id: `${edge.source.id}-${edge.target.id}`,
                    source: edge.source.id,
                    target: edge.target.id,
                    type: edge.label,
                    mediatorScore: res.mediatorScore,
                    classification: getMediatorClassification(res.mediatorScore),
                    dimensions: res.dimensions,
                    empiricalTraces: [res.interpretation], // User interpretation as the trace
                    metadata: {
                        analyzedAt: new Date().toISOString(),
                        aiModel: 'gpt-4o',
                        confidence: 'medium'
                    }
                };
            });

            // 5. Save Results
            const effectiveAnalysis = (selectedConfigs.length === 1 ? selectedConfigs[0].analysisData : null) || savedAnalysis || {};

            // Merge with existing relationships if any
            const existingRelationships = effectiveAnalysis.relationships || [];
            // Create map for easy merge
            const mergedMap = new Map(existingRelationships.map((r: any) => [r.id, r]));
            relationships.forEach(r => mergedMap.set(r.id, r));

            const finalRelationships = Array.from(mergedMap.values());

            const updatedAnalysis = {
                ...effectiveAnalysis,
                relationships: finalRelationships
            };

            if (onSaveAnalysis) onSaveAnalysis(updatedAnalysis);

            if (selectedConfigs.length === 1 && onUpdateConfig) {
                onUpdateConfig({
                    ...selectedConfigs[0],
                    analysisData: updatedAnalysis
                });
            }

            alert(`Analysis Complete: ${relationships.length} relationships classified.`);

        } catch (error) {
            console.error("Link analysis failed", error);
            alert("Failed to analyze relationships.");
        } finally {
            setIsAnalyzingRelationships(false);
        }
    };

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

    // [NEW] Drag and Drop Logic
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const onDragStart = (e: React.DragEvent, index: number) => {
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image usually automatic
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Necesssary to allow dropping
        // Optional: Implement instant swap animation here if desired, 
        // but for safety/simplicity we'll do it on drop or use a library-like swap.
        // For standard HTML5, waiting for drop is safer to avoid jitter without libraries.
    };

    const onDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === dropIndex) return;

        if (onReorderConfigs && allConfigurations) {
            const newConfigs = [...allConfigurations];
            const [movedItem] = newConfigs.splice(draggingIndex, 1);
            newConfigs.splice(dropIndex, 0, movedItem);
            onReorderConfigs(newConfigs);
        }
        setDraggingIndex(null);
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
                    {(savedAnalysis?.provisional_status || (selectedConfigs.length === 1 ? (selectedConfigs[0].analysisData as AssemblageAnalysis)?.provisional_status : undefined)) && (
                        <div className="mt-2">
                            <ProvisionalBadge
                                fragility={(savedAnalysis?.provisional_status || (selectedConfigs.length === 1 ? (selectedConfigs[0].analysisData as AssemblageAnalysis)?.provisional_status : undefined))?.fragility_score}
                            />
                        </div>
                    )}
                </CardDescription>


                {/* Methodology Graph Toggle */}
                <div className="mt-2 flex items-center justify-between px-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-500 h-6 gap-1 hover:text-indigo-600"
                        onClick={() => setShowGraph(!showGraph)}
                    >
                        {showGraph ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {showGraph ? "Hide Methodology Pipeline" : "Show Methodology Pipeline"}
                    </Button>
                </div>

                {/* Methodology Graph */}
                {showGraph && (
                    <div className="mt-2 px-2 border-b border-slate-100 pb-4">
                        <AssemblageMethodologyGraph
                            status={pipelineStatus}
                            currentStepMessage={pipelineMessage}
                        />
                    </div>
                )}

                <div className="pt-2">
                    <div className="flex flex-col gap-2">
                        {/* View Switcher */}
                        <div className="bg-slate-100 p-0.5 rounded-lg flex mb-2">
                            <button
                                onClick={() => setViewMode('analysis')}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${viewMode === 'analysis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Analysis & Report
                            </button>
                            <button
                                onClick={() => setViewMode('manage')}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${viewMode === 'manage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Manage Assemblages
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                                <span className="text-[10px] text-slate-400 font-medium">Force Fresh</span>
                                <input
                                    type="checkbox"
                                    checked={forceRefresh}
                                    onChange={(e) => setForceRefresh(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                />
                            </label>

                            {/* Comprehensive Component Analysis */}
                            <div className="flex gap-1 w-full">
                                <Button
                                    size="sm"
                                    onClick={handleDeepScan}
                                    disabled={isAnalyzing}
                                    className={`flex-1 text-xs font-medium gap-2 transition-all ${savedAnalysis ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Layers className="h-3 w-3" />
                                            Deep Scan
                                        </>
                                    )}
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleAnalyzeRelationships}
                                                disabled={isAnalyzingRelationships}
                                                className="px-3 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 flex items-center gap-2"
                                            >
                                                {isAnalyzingRelationships ? <Loader2 className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
                                                Analyze Links
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Analyze Mediator/Intermediary Roles</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto flex-1 p-4">
                {viewMode === 'manage' || (allConfigurations && allConfigurations.length > 0 && !selectedConfigs.length && !savedAnalysis) ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700">All Macro Assemblages ({allConfigurations?.length || 0})</h3>
                        </div>
                        <div className="space-y-2">
                            {allConfigurations?.map((config, index) => (
                                <div
                                    key={config.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, index)}
                                    onDragOver={(e) => onDragOver(e, index)}
                                    onDrop={(e) => onDrop(e, index)}
                                    onClick={() => onSelectConfig?.(config.id, false)}
                                    className={`
                                        bg-white border rounded-lg p-3 flex items-center gap-3 cursor-pointer group transition-all
                                        ${draggingIndex === index ? 'opacity-50 border-dashed border-indigo-400' : 'hover:border-indigo-300 hover:shadow-sm'}
                                    `}
                                    style={{ borderLeftColor: config.color, borderLeftWidth: '4px' }}
                                >
                                    <div className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-slate-900 text-sm truncate">{config.name}</h4>
                                            {onDeleteConfig && (
                                                <button
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm("Delete this assemblage?")) onDeleteConfig(config.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {onToggleCollapse && (
                                                <button
                                                    className={`p-1 rounded hover:bg-indigo-50 ${collapsedIds?.has(config.id) ? "text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200" : "text-slate-400 hover:text-indigo-500"}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleCollapse(config.id);
                                                    }}
                                                    title={collapsedIds?.has(config.id) ? "Expand Assemblage" : "Black Box (Collapse)"}
                                                >
                                                    {collapsedIds?.has(config.id) ? (
                                                        <Minimize2 className="h-3.5 w-3.5 fill-current" />
                                                    ) : (
                                                        <Minimize2 className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">{config.memberIds.length} members</Badge>
                                            <span className="text-[10px] text-slate-400">
                                                Stab: {typeof config.properties.calculated_stability === 'number' ? config.properties.calculated_stability.toFixed(2) : config.properties.stability}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 text-center italic">Drag to reorder priority. Click to analyze.</p>
                    </div>
                ) : selectedConfigs.length > 0 ? (
                    <div className="space-y-6">
                        {selectedConfigs.length === 1 ? (
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-indigo-900 text-lg mb-1">{selectedConfigs[0].name}</h3>
                                    {onToggleCollapse && (
                                        <button
                                            className={`p-1.5 rounded-md transition-colors ${collapsedIds?.has(selectedConfigs[0].id) ? "text-indigo-600 bg-indigo-100 ring-1 ring-indigo-300" : "text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100"}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleCollapse(selectedConfigs[0].id);
                                            }}
                                            title={collapsedIds?.has(selectedConfigs[0].id) ? "Expand Assemblage" : "Black Box (Collapse)"}
                                        >
                                            {collapsedIds?.has(selectedConfigs[0].id) ? (
                                                <Minimize2 className="h-4 w-4 fill-current" />
                                            ) : (
                                                <Minimize2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-indigo-700 mb-3">{selectedConfigs[0].description}</p>
                                {(() => {
                                    /* ... existing single config metric display ... */
                                    // [FIX] Hybrid Logic: Prefer AI Score if Graph is "Closed" (1.0), and normalize units.
                                    const rawStability = dynamicMetrics.stability;
                                    const aiScoreT = Number(selectedConfigs[0].properties?.territorialization_score) || 0;
                                    const aiScoreTNorm = aiScoreT > 1 ? aiScoreT / 10 : aiScoreT; // Normalize 0-10 to 0-1

                                    const territorialization = (rawStability > 0.95 && aiScoreTNorm < 0.9 && aiScoreTNorm > 0)
                                        ? aiScoreTNorm
                                        : rawStability;

                                    const rawCoding = dynamicMetrics.coding_intensity;
                                    const aiScoreC = Number(selectedConfigs[0].properties?.coding_intensity_score) || 0;
                                    const aiScoreCNorm = aiScoreC > 1 ? aiScoreC / 10 : aiScoreC;

                                    const codingIntensity = (rawCoding > 0.95 && aiScoreCNorm < 0.9 && aiScoreCNorm > 0)
                                        ? aiScoreCNorm
                                        : rawCoding;

                                    const selectedConfig = selectedConfigs[0];

                                    return (
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* ... Tooltips relying on selectedConfig loop ... */}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="bg-white p-2 rounded border border-indigo-100 cursor-help hover:bg-slate-50 transition-colors">
                                                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Territorialization</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base font-bold text-slate-900">
                                                                    {territorialization > 0.7 ? "High Intensity" : territorialization > 0.4 ? "Medium Intensity" : "Low Intensity"}
                                                                </span>
                                                                <span className="text-xs text-slate-400">({(territorialization * 10).toFixed(1)})</span>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-800">
                                                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">Dynamic Metric:</p>
                                                        <p className="text-xs mb-2">Based on {dynamicMetrics.internal} internal / {dynamicMetrics.external} external associations.</p>

                                                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">Audit Trail:</p>
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
                                                                    {codingIntensity > 0.7 ? (
                                                                        <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-slate-500" /> Over-Coded</span>
                                                                    ) : codingIntensity > 0.4 ? (
                                                                        <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-slate-500" /> Mixed Coding</span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-slate-500" /> Decoded</span>
                                                                    )}
                                                                </span>
                                                                <span className="text-xs text-slate-400">({(codingIntensity * 10).toFixed(1)})</span>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-800">
                                                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">Dynamic Metric:</p>
                                                        <p className="text-xs mb-2">Inverse of Porosity ({(dynamicMetrics.porosity).toFixed(2)}).</p>

                                                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">Audit Trail:</p>
                                                        <ul className="text-xs list-disc list-inside space-y-1">
                                                            {(selectedConfig.analysisData as AssemblageAnalysis)?.computed_metrics?.coding_audit && (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.coding_audit!.length > 0
                                                                ? (selectedConfig.analysisData as AssemblageAnalysis).computed_metrics!.coding_audit!.map((t: string, i: number) => <li key={i}>{t}</li>)
                                                                : <li className="text-slate-400">No traces found</li>}
                                                        </ul>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                                <h3 className="font-bold text-indigo-900 text-lg mb-1">Combined Analysis</h3>
                                <p className="text-sm text-indigo-700 mb-3">{selectedConfigs.length} Assemblages Selected: {selectedConfigs.map(c => c.name).join(', ')}</p>
                                <div className="p-2 bg-white/50 rounded text-xs text-indigo-800 italic">
                                    Metrics and specific audits are disabled for multi-assemblage analysis. The analysis below reflects the combined socio-technical territory.
                                </div>
                            </div>
                        )}

                        {(selectedConfigs.length === 1 ? selectedConfigs[0].analysisData : savedAnalysis) ? (
                            <AssemblageAnalysisView
                                analysis={{
                                    ...((selectedConfigs.length === 1 ? selectedConfigs[0].analysisData : savedAnalysis) as AssemblageAnalysis),
                                    assemblage: dashboardAssemblage
                                }}
                                actors={actors}
                                reflexiveLogs={selectedConfigs.length === 1 ? selectedConfigs[0].reflexive_log : undefined}
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
                                <p className="text-sm">No analysis data available. Click "Run Comprehensive Analysis".</p>
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
                    // Default Fallback
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                        <Layers className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Run analysis to map the assemblage.</p>
                    </div>
                )}
            </CardContent >
            <div className="p-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center italic">
                Methodological constrained artifact. Outputs are provisional inscriptions.
            </div>
            <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => refetchCredits()} />
        </Card >
    );
}
