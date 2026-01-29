import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import { EcosystemActor, EcosystemConfiguration, AssemblageAnalysis, AiAbsenceAnalysis, AssemblageExplanation } from '@/types/ecosystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Network, MousePointer2, Layers, EyeOff, ChevronDown, ZoomIn, Maximize, Minimize, MessageSquare, X, Trash2 } from 'lucide-react';
import { useForceGraph, SimulationNode } from '@/hooks/useForceGraph';
import { generateEdges, getHullPath } from '@/lib/graph-utils';
import { TranslationChain } from './TranslationChain';
import dynamic from 'next/dynamic';
import { StratumLegend, ViewTypeLegend } from './EcosystemLegends';
import { SWISS_COLORS, getActorColor, getActorShape, mergeGhostNodes, GhostActor, calculateConfigMetrics } from '@/lib/ecosystem-utils';

const EcosystemMap3D = dynamic(() => import('./EcosystemMap3D').then(mod => mod.EcosystemMap3D), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400">Loading 3D Engine...</div>
});

import { AnalysisMode, ModeSelector } from '@/components/ui/mode-selector';
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { getGlossaryDefinition } from "@/lib/glossary-definitions";
import { AssemblageSuggester } from './AssemblageSuggester';

interface EcosystemMapProps {
    actors: EcosystemActor[];
    configurations: EcosystemConfiguration[];
    positions?: Record<string, { x: number, y: number }>;
    interactionMode: "drag" | "select";
    setInteractionMode: (mode: "drag" | "select") => void;
    selectedForGrouping: string[];
    onToggleSelection: (actorId: string) => void;
    onCreateConfiguration: () => void;
    onActorDrag: (actorId: string, x: number, y: number) => void;
    onConfigDrag: (configId: string, dx: number, dy: number) => void;
    activeLayers?: Record<string, boolean>;
    toggleLayer?: (layer: string) => void;
    colorMode?: "type" | "epistemic";
    onConfigClick?: (configId: string, multi?: boolean) => void;
    selectedConfigIds?: string[];
    onDeleteConfiguration?: (configId: string) => void;
    onAddConfiguration?: (config: EcosystemConfiguration) => void; // [NEW] Support adding configs from child components
    absenceAnalysis?: AssemblageAnalysis | AiAbsenceAnalysis | null;
    analysisMode?: AnalysisMode;
    setAnalysisMode?: (mode: AnalysisMode) => void;
    configLayout?: Record<string, { x: number; y: number }>;
    onConfigSelect?: (configId: string, multi?: boolean) => void;
    onClearConfig?: () => void; // [NEW] Support clearing selection
    extraToolbarContent?: React.ReactNode;
    isReadOnly?: boolean; // [NEW]
}

// --- Swiss Design System Constants ---
// Moved to @/lib/ecosystem-utils

const HULL_STYLES = {
    opacity: 0.15,
    strokeDash: "6 4",
    strokeWidth: 2
};

// ... unchanged styles ...

export function EcosystemMap({
    actors,
    configurations,
    interactionMode,
    setInteractionMode,
    selectedForGrouping,
    onToggleSelection,
    onCreateConfiguration,
    onConfigClick,
    onConfigDrag,
    selectedConfigIds, // [FIX] Array
    onDeleteConfiguration,
    absenceAnalysis,
    analysisMode = "hybrid_reflexive",
    setAnalysisMode,
    configLayout = {},
    onConfigSelect,
    // onClearConfig, // Unused but kept for interface compatibility if needed
    extraToolbarContent,
    isReadOnly = false,
    onAddConfiguration // [NEW] Destructure new prop
}: EcosystemMapProps) {
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [selectedLink, setSelectedLink] = useState<{ source: string | object, target: string | object, type: string } | null>(null);
    // ... existing state ...

    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [draggingConfigId, setDraggingConfigId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null); // Ref for zoom behavior
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
    const [layoutMode, setLayoutMode] = useState<'compass' | 'nested'>('nested'); // [FIX] Default to Nested Mode

    // Derived states for backward compatibility with hook props
    const isNestedMode = layoutMode === 'nested';
    const isMetricMode = layoutMode === 'compass';


    const [isLegendOpen, setIsLegendOpen] = useState(false);
    // const [isNestedMode, setIsNestedMode] = useState(false); // REPLACED
    const [isStratumMode, setIsStratumMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [is3DMode, setIs3DMode] = useState(false);

    const [highlightedStage, setHighlightedStage] = useState<string | null>(null);

    // Edge filtering state
    const [showSolidEdges, setShowSolidEdges] = useState(true);
    const [showGhostEdges, setShowGhostEdges] = useState(true);

    // Zoom/Pan State
    const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
    const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
    const [activeBoundaryFilter, setActiveBoundaryFilter] = useState<'solid' | 'porous' | null>(null); // [NEW] Boundary Filter

    // Merged Actors with Ghosts
    const mergedActors = useMemo(() => {
        return mergeGhostNodes(actors, absenceAnalysis || null);
    }, [actors, absenceAnalysis]);

    // Filter actors based on ghost toggle
    const filteredActors = useMemo(() => {
        if (showGhostEdges) {
            return mergedActors;
        }
        // Filter out ghost nodes when toggle is off
        return mergedActors.filter(actor => {
            const isGhost = 'isGhost' in actor && (actor as GhostActor).isGhost;
            return !isGhost;
        });
    }, [mergedActors, showGhostEdges]);

    // Assemblage Explanation State
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState<AssemblageExplanation | null>(null);

    // Credit System
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [showTopUp, setShowTopUp] = useState(false);

    // [NEW] Local confirmation state for deletion to avoid window.confirm issues
    const [configToDelete, setConfigToDelete] = useState<string | null>(null);


    const links = useMemo(() => {
        const generated = generateEdges(filteredActors);
        return generated.map(e => ({
            source: e.source.id,
            target: e.target.id,
            type: e.label
        }));
    }, [filteredActors]);

    // Standard Config Passthrough with Logic (Moved Up)
    const hydratedConfigs = useMemo(() => {
        return configurations.map(config => {
            return calculateConfigMetrics(config, links);
        });
    }, [configurations, links]);

    // Simplified Actor Hydration (No Simulation)
    const hydratedActors = useMemo(() => {
        let result = filteredActors;

        // 1. Type Filter
        if (activeTypeFilter) {
            const uniqueKey = activeTypeFilter.toLowerCase().replace(/\s/g, '');
            result = result.filter(a => {
                const actorType = a.type.toLowerCase().replace(/\s/g, '');
                return actorType.includes(uniqueKey);
            });
        }

        // 2. Boundary Strength Filter
        if (activeBoundaryFilter) {
            result = result.filter(a => {
                const config = hydratedConfigs.find(c => c.memberIds.includes(a.id));
                if (!config) return false; // Filter out ungrouped

                const porosity = config.properties.porosity_index || 0;



                // > 0.5 is porous
                return activeBoundaryFilter === 'porous' ? porosity > 0.5 : porosity <= 0.5;
            });
        }

        return result;
    }, [filteredActors, activeTypeFilter, activeBoundaryFilter, hydratedConfigs]);


    // [NEW] Assemblage Creation Handler from Suggester
    const handleCreateAssemblage = (name: string, memberIds: string[]) => {
        const newConfig: EcosystemConfiguration = {
            id: crypto.randomUUID(),
            name,
            description: "Algorithmic Suggestion",
            memberIds,
            properties: {
                stability: "Medium",
                generativity: "Medium",
                territorialization_score: 5,
                coding_intensity_score: 5
            },
            color: `hsl(${Math.random() * 360}, 70%, 80%)`
        };

        if (onAddConfiguration) {
            onAddConfiguration(newConfig);
        } else {
            // Fallback or just log if parent doesn't support direct add
            console.warn("onAddConfiguration not provided. Config created but not persisted:", newConfig);
            // innovative: maybe call onCreateConfiguration() to open the dialog?
            onCreateConfiguration();
        }
    };


    const handleExplainMap = React.useCallback(async () => {
        if (!analysisMode) return;
        if (isReadOnly) {
            alert("Trace analysis is disabled in Demo Mode.");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }
        setIsExplaining(true);
        // Clear previous explanation to indicate change
        setExplanation(null);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    analysisMode: 'assemblage_explanation', // Legacy required field
                    mode: analysisMode, // NEW: Theoretical mode for backward compatible routing
                    configurations: configurations, // Pass metrics implicitly via configs
                    actors: filteredActors, // Pass actors for tracing
                    links: links, // Pass links for tracing
                    interactionState: { // NEW: Pass visual context
                        isNested: isNestedMode,
                        is3D: is3DMode
                    },
                    text: 'Assess Hull Metrics' // Dummy text
                })
            });
            const data = await response.json();
            if (data.analysis) {
                setExplanation(data.analysis);
                refetchCredits();
                setIsLegendOpen(false); // Close legend to show explanation
            }
        } catch (error) {
            console.error("Explanation failed:", error);
        } finally {
            setIsExplaining(false);
        }
    }, [analysisMode, configurations, filteredActors, links, isNestedMode, is3DMode, isReadOnly, creditsLoading, hasCredits, refetchCredits]);



    const isActorRelevant = (actor: EcosystemActor, stageId: string | null) => {
        if (!stageId) return true;
        const t = actor.type.toLowerCase();

        switch (stageId) {
            case 'problem':
                return ['civilsociety', 'ngo', 'academic', 'activist', 'public'].some(k => t.includes(k));
            case 'regulation':
                return ['policymaker', 'government', 'legislator', 'regulator', 'court', 'legalobject', 'law'].some(k => t.includes(k));
            case 'inscription':
                return ['standard', 'algorithm', 'technologist', 'expert', 'scientist'].some(k => t.includes(k));
            case 'delegation':
                return ['auditor', 'cloud', 'infrastructure', 'compliance', 'legal'].some(k => t.includes(k));
            case 'market':
                return ['startup', 'private', 'corporation', 'sme', 'user'].some(k => t.includes(k));
            default:
                return true;
        }
    };

    // Force Physics
    // isMetricMode is derived from layoutMode above

    const memoizedConfigurations = useMemo(() => {
        return configurations.map(c => ({ id: c.id, memberIds: c.memberIds }));
    }, [configurations]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nodes, simulation, drag } = useForceGraph(
        hydratedActors, // Use hydrated actors with dynamic power
        dimensions.width,
        dimensions.height,
        memoizedConfigurations, // [FIX] Use memoized array to prevent infinite loop
        links,
        isNestedMode,
        is3DMode,
        configLayout, // Renamed internally in hook, but prop name can stay configLayout or be renamed. Let's send the prop as 'configOffsets' arg.
        isMetricMode // [NEW] Pass metric mode
    );

    // Zoom Behavior Setup
    useEffect(() => {
        if (!svgRef.current) return;

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .filter((event) => {
                // Prevent zoom/pan if clicking on a draggable config or if button is not left click
                if (event.target instanceof Element) {
                    if (event.target.closest('.draggable-config')) return false;
                    if (event.target.closest('.legend-container')) return false; // [FIX] Exclude Legend
                }
                return !event.button;
            })
            .on("zoom", (event) => {
                setTransform(event.transform);
            });


        zoomBehaviorRef.current = zoom; // Store in ref
        const svgSelection = d3.select(svgRef.current);
        svgSelection.call(zoom);

        return () => {
            svgSelection.on(".zoom", null);
        };
    }, [is3DMode]);

    // Full Screen Escape Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullScreen) {
                setIsFullScreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullScreen]);


    // Resize Observer
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);



    const getNodePos = (id: string) => {
        const node = nodes.find(n => n.id === id);
        return node ? { x: node.x || 0, y: node.y || 0 } : { x: 0, y: 0 };
    };


    const handleMouseDown = (e: React.MouseEvent, node: SimulationNode) => {
        e.stopPropagation(); // Prevent Zoom/Pan start
        if (interactionMode === "drag") {
            setDraggingNodeId(node.id);
            drag(node).dragStarted({ active: true, x: node.x ?? 0, y: node.y ?? 0 });
        }
        // In select mode, we just consume the event so zoom doesn't start
    };

    const handleConfigMouseDown = (e: React.MouseEvent, configId: string) => {
        e.stopPropagation();
        if (interactionMode === "drag") {
            setDraggingConfigId(configId);
            // We don't use d3 drag behavior for configs, we just track delta in mouseMove
        } else if (onConfigClick) {
            const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
            onConfigClick(configId, isMulti);
        }
    };

    const handleNodeClick = (e: React.MouseEvent, actor: EcosystemActor) => {
        // console.log('[EcosystemMap] Node Clicked:', actor.id, actor.name);
        e.stopPropagation();
        if (interactionMode === "select") {
            onToggleSelection(actor.id);
        } else {
            setFocusedNodeId(focusedNodeId === actor.id ? null : actor.id);
        }
    };

    const getTransformedPoint = (clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        return {
            x: (svgP.x - transform.x) / transform.k,
            y: (svgP.y - transform.y) / transform.k
        };
    };

    const handleSvgMouseMove = (e: React.MouseEvent) => {
        if (interactionMode !== "drag") return;

        const worldP = getTransformedPoint(e.clientX, e.clientY);

        if (draggingNodeId) {
            e.preventDefault();
            e.stopPropagation();
            const node = nodes.find(n => n.id === draggingNodeId);
            if (node) drag(node).dragged({ x: worldP.x, y: worldP.y });
        } else if (draggingConfigId && onConfigDrag) {
            e.preventDefault();
            e.stopPropagation();
            // Simple delta calculation requires previous mouse position, 
            // but since we don't store it, we can use movementX/Y and scale by transform.k
            // However, movementX/Y is screen pixels.
            const dx = e.movementX / transform.k;
            const dy = e.movementY / transform.k;
            onConfigDrag(draggingConfigId, dx, dy);
        }
    };

    const handleMouseUp = () => {
        if (draggingNodeId) {
            const node = nodes.find(n => n.id === draggingNodeId);
            if (node) drag(node).dragEnded({ active: false, x: 0, y: 0 });
            setDraggingNodeId(null);
        }
        if (draggingConfigId) {
            setDraggingConfigId(null);
        }
    };

    // Zoom Controls
    const resetZoom = () => {
        if (!svgRef.current || !zoomBehaviorRef.current) return;
        // Use the stored behavior to trigger the reset
        d3.select(svgRef.current)
            .transition()
            .duration(750)
            .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };





    const [hoveredNode, setHoveredNode] = useState<EcosystemActor | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const [hoveredLink, setHoveredLink] = useState<{ source: string | object, target: string | object, type: string } | null>(null);

    // Node Event Handlers
    const handleNodeHover = (e: React.MouseEvent, actor: EcosystemActor) => {
        // [CHANGED] Use absolute client coordinates for fixed tooltip positioning
        setTooltipPos({
            x: e.clientX,
            y: e.clientY
        });
        setHoveredNode(actor);
        setHoveredLink(null);
    };

    const handleLinkHover = (e: React.MouseEvent, link: { source: string; target: string; type: string }) => {
        // Calculate Link Midpoint for Centered Tooltip
        const s = getNodePos(typeof link.source === 'object' ? (link.source as any).id : link.source);
        const t = getNodePos(typeof link.target === 'object' ? (link.target as any).id : link.target);

        if (containerRef.current && s.x !== 0 && t.x !== 0) {
            const rect = containerRef.current.getBoundingClientRect();
            const midX = (s.x + t.x) / 2;
            const midY = (s.y + t.y) / 2;

            // Transform world coordinates to screen coordinates
            const screenX = rect.left + transform.x + (midX * transform.k);
            const screenY = rect.top + transform.y + (midY * transform.k);

            setTooltipPos({
                x: screenX,
                y: screenY
            });
        } else {
            // Fallback to mouse if calculation fails
            setTooltipPos({
                x: e.clientX,
                y: e.clientY
            });
        }

        setHoveredLink(link);
        setHoveredNode(null);
    };

    const visibleConfigs = useMemo(() => {
        return hydratedConfigs.filter((config: EcosystemConfiguration) =>
            !selectedConfigIds || selectedConfigIds.length === 0 || selectedConfigIds.includes(config.id)
        );
    }, [hydratedConfigs, selectedConfigIds]);

    return (
        <div className="relative w-full h-full">
            <Card
                className={`flex flex-col shadow-none border border-slate-200 bg-white transition-all duration-300 relative ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'h-[800px]'}`}
                ref={containerRef}
            >
                <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => refetchCredits()} />

                {/* ... (Header remains) */}
                <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row flex-wrap items-center justify-between gap-y-4 bg-white z-10 relative">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">Assemblage Compass</CardTitle>
                            <HelpTooltip
                                title="Assemblage Compass"
                                description={getGlossaryDefinition('assemblage-compass')}
                                glossaryTerm="assemblage-compass"
                                videoUrl="/videos/assemblage-demo.mp4"
                            />
                        </div>
                        <CardDescription className="text-xs text-slate-500 font-normal">
                            {is3DMode ? "3D WebGL Visualization" : (isNestedMode ? "Nested Assemblage (Actor → Collective → Regime)" : "Relational view of heterogeneous associations")}
                        </CardDescription>
                    </div>

                    {/* Modern Toolbar */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-md border border-slate-200 overflow-x-auto max-w-full pb-1">
                        {extraToolbarContent}
                        {extraToolbarContent && <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />}

                        <Button
                            variant="ghost" size="sm"
                            onClick={() => {
                                const newMode = !is3DMode;
                                setIs3DMode(newMode);
                                if (newMode) setIsStratumMode(true);
                            }}
                            className={`h-7 px-2.5 text-xs font-medium shrink-0 ${is3DMode ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            <Network className="h-3 w-3 mr-1" /> {is3DMode ? "3D View" : "2D View"}
                        </Button>

                        {!is3DMode && (
                            <>
                                <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                                <Button
                                    variant="ghost" size="sm"
                                    className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isMetricMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                                    onClick={() => setLayoutMode(isMetricMode ? 'nested' : 'compass')}
                                >
                                    <Layers className="h-3 w-3 mr-1" /> {isMetricMode ? "Switch to Nested" : "Assemblage Compass"}
                                </Button>
                                <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                                <Button
                                    variant="ghost" size="sm"
                                    className={`h-7 px-2.5 text-xs font-medium shrink-0 ${interactionMode === "drag" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                                    onClick={() => setInteractionMode("drag")}
                                >
                                    <MousePointer2 className="h-3 w-3 mr-1" /> Move Actor
                                </Button>
                                <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />

                                {!isReadOnly && (
                                    <AssemblageSuggester
                                        actors={actors}
                                        edges={links}
                                        configurations={configurations}
                                        onCreateAssemblage={handleCreateAssemblage}
                                    />
                                )}
                                <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-7 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 shrink-0"
                                    onClick={resetZoom}
                                >
                                    <ZoomIn className="h-3 w-3 mr-1" /> Reset View
                                </Button>
                            </>
                        )}

                        {is3DMode && (
                            <>
                                <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => setIsStratumMode(!isStratumMode)}
                                    className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isStratumMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                                    title="Visualize Law as a Stratum over the Meshwork"
                                >
                                    <Layers className="h-3 w-3 mr-1" /> {isStratumMode ? "Stratum Active" : "Legal Stratum"}
                                </Button>
                            </>
                        )}

                        <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />

                        {/* Integrated Mode Selector */}
                        {analysisMode && setAnalysisMode && (
                            <>
                                <div className="flex items-center scale-90 origin-center -mx-1 shrink-0">
                                    <ModeSelector
                                        value={analysisMode}
                                        onChange={setAnalysisMode}
                                        className="h-7 border-none shadow-none text-xs"
                                    />
                                </div>
                                <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                            </>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isExplaining || explanation ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-900"}`}
                            onClick={handleExplainMap}
                            disabled={isReadOnly}
                            title={isReadOnly ? "Trace analysis disabled in Demo Mode" : "Generate AI Analysis of current view"}
                        >
                            <MessageSquare className="h-3 w-3 mr-1.5" />
                            {isExplaining ? "Tracing..." : "Open Trace"}
                        </Button>

                        <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />

                        <Button
                            variant="ghost" size="sm"
                            className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isFullScreen ? "bg-red-50 text-red-600" : "text-slate-500 hover:text-slate-900"}`}
                            onClick={toggleFullScreen}
                        >
                            {isFullScreen ? (
                                <><Minimize className="h-3 w-3 mr-1" /> Exit Full Screen</>
                            ) : (
                                <><Maximize className="h-3 w-3 mr-1" /> Full Screen</>
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 relative overflow-hidden bg-[#FAFAFA]">
                    {/* ... (Existing Map Content) ... */}
                    {is3DMode ? (
                        <EcosystemMap3D
                            actors={filteredActors}
                            configurations={configurations}
                            selectedForGrouping={selectedForGrouping}
                            onToggleSelection={onToggleSelection}
                            focusedNodeId={focusedNodeId}
                            width={dimensions.width}
                            height={dimensions.height}
                            isStratumMode={isStratumMode}
                        />
                    ) : (
                        <>
                            {/* ... (SVG Content) ... */}
                            <svg
                                ref={svgRef}
                                width="100%" height="100%"
                                className={interactionMode === 'drag' ? 'cursor-move' : 'cursor-default'}
                                onMouseMove={handleSvgMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {/* ... (Defs, G, Hulls, Links, Nodes) ... */}
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5"
                                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                                    </marker>
                                </defs>

                                <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
                                    {isNestedMode && (
                                        <g className="opacity-0 animate-in fade-in duration-1000 pointer-events-none">
                                            <circle cx={dimensions.width / 2} cy={dimensions.height / 2} r={Math.min(dimensions.width, dimensions.height) * 0.45} fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
                                            <text x={dimensions.width / 2} y={dimensions.height / 2 - Math.min(dimensions.width, dimensions.height) * 0.45 - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-[0.2em]">Governance Regime Boundary</text>
                                            <circle cx={dimensions.width / 2} cy={dimensions.height / 2} r={10} fill="#6366F1" opacity="0.1" />
                                            <text x={dimensions.width / 2} y={dimensions.height / 2} dy={3} textAnchor="middle" className="text-[6px] font-bold fill-indigo-400 uppercase">Policy</text>
                                        </g>
                                    )}

                                    {visibleConfigs
                                        .map((config: EcosystemConfiguration) => {
                                            const memberPoints = config.memberIds.map((id: string) => getNodePos(id)).filter((p: { x: number; y: number }) => p.x !== 0 && p.y !== 0);
                                            if (memberPoints.length < 2) return null;
                                            const centroid = memberPoints.reduce((acc: { x: number; y: number }, p: { x: number; y: number }) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                                            centroid.x /= memberPoints.length;
                                            centroid.y /= memberPoints.length;
                                            const porosity = config.properties.porosity_index || 0;
                                            // BINARY VISUALIZATION: Match Filter Threshold (0.5)
                                            const strokeDash = porosity > 0.5 ? "6 4" : "none";
                                            const stability = config.properties.calculated_stability || 0.1;
                                            const isConfigSelected = selectedConfigIds?.includes(config.id);
                                            // [CHANGE] Opacity logic: If filtered, keep full opacity to stand out. If not filtered, use stability-based.
                                            const fillOpacity = isConfigSelected ? 0.3 : Math.max(0.05, Math.min(0.3, stability * 0.4));
                                            return (
                                                <g key={config.id} className={`draggable-config transition-all duration-500 ease-out ${interactionMode === 'drag' ? 'cursor-move' : 'cursor-pointer'}`} opacity={highlightedStage ? 0.1 : 1} onMouseDown={(e) => handleConfigMouseDown(e, config.id)}>
                                                    <title>{`${config.name}\nPorosity: ${porosity.toFixed(2)} (Ext: ${config.properties.external_links}/Tot: ${config.properties.total_links})\nStability: ${stability.toFixed(2)}`}</title>
                                                    <path
                                                        d={memberPoints.length === 2 ? `M ${memberPoints[0].x} ${memberPoints[0].y} L ${memberPoints[1].x} ${memberPoints[1].y}` : getHullPath(memberPoints)}
                                                        fill={config.color} fillOpacity={fillOpacity} stroke={config.color} strokeWidth={isConfigSelected ? 3 : HULL_STYLES.strokeWidth} strokeDasharray={strokeDash} strokeLinejoin="round" strokeLinecap="round"
                                                        className={isConfigSelected ? "drop-shadow-md" : ""}
                                                    />
                                                    <rect x={centroid.x - (config.name.length * 3 + 8)} y={centroid.y - 32} width={config.name.length * 6 + 16} height={18} rx={9} fill={config.color} fillOpacity={0.9} stroke="white" strokeWidth={1.5} className="drop-shadow-sm" />
                                                    <text x={centroid.x} y={centroid.y - 20} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold fill-white uppercase tracking-wider" style={{ pointerEvents: 'none' }}>{config.name}</text>
                                                </g>
                                            );
                                        })}

                                    {links.map((link, i) => {
                                        const s = getNodePos(link.source as string);
                                        const t = getNodePos(link.target as string);
                                        if (s.x === 0 || t.x === 0) return null;

                                        // Check if source or target is a ghost node
                                        const sourceActor = hydratedActors.find((a: EcosystemActor) => a.id === link.source);
                                        const targetActor = hydratedActors.find((a: EcosystemActor) => a.id === link.target);

                                        // A link is a ghost link if either endpoint is a ghost node
                                        const sourceIsGhost = sourceActor && 'isGhost' in sourceActor && (sourceActor as GhostActor).isGhost;
                                        const targetIsGhost = targetActor && 'isGhost' in targetActor && (targetActor as GhostActor).isGhost;
                                        const isGhostLink = sourceIsGhost || targetIsGhost;

                                        // Filter based on edge type toggles
                                        if (isGhostLink && !showGhostEdges) return null;
                                        if (!isGhostLink && !showSolidEdges) return null;

                                        const isFocused = focusedNodeId && (link.source === focusedNodeId || link.target === focusedNodeId);
                                        const isHovered = hoveredLink && hoveredLink.source === link.source && hoveredLink.target === link.target;

                                        let strokeWidth = 1;
                                        if (link.type === "Regulates" || link.type === "Governs") strokeWidth = 2.5;
                                        if (link.type === "Excludes") strokeWidth = 1.5;
                                        if (isFocused || isHovered) strokeWidth += 1.5;

                                        // HEB Logic: Calculate Path
                                        let d = "";
                                        if (isNestedMode) {
                                            // Curved, bundled path through center
                                            const lineGen = d3.line<{ x: number, y: number }>()
                                                .curve(d3.curveBundle.beta(0.85))
                                                .x(p => p.x)
                                                .y(p => p.y);

                                            d = lineGen([
                                                { x: s.x, y: s.y },
                                                { x: dimensions.width / 2, y: dimensions.height / 2 }, // Control point at center
                                                { x: t.x, y: t.y }
                                            ]) || "";
                                        } else {
                                            // Straight line
                                            d = `M ${s.x} ${s.y} L ${t.x} ${t.y}`;
                                        }

                                        return (
                                            <g key={i}
                                                onMouseEnter={(e) => handleLinkHover(e, link)}
                                                onMouseLeave={() => setHoveredLink(null)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('[EcosystemMap] Link Clicked:', link);
                                                    setSelectedLink(link);
                                                }}
                                                className="cursor-pointer" // Ensure cursor is pointer
                                            >
                                                {/* Hit Area (Invisible but thicker) */}
                                                <path
                                                    d={d}
                                                    stroke="transparent"
                                                    strokeWidth={10}
                                                    fill="none"
                                                    className="cursor-pointer"
                                                />
                                                {/* Visible Line */}
                                                <path
                                                    d={d}
                                                    stroke={isFocused || isHovered ? "#475569" : "#CBD5E1"}
                                                    strokeWidth={strokeWidth}
                                                    strokeOpacity={highlightedStage ? 0.1 : (isFocused || isHovered ? 1 : 0.5)}
                                                    strokeDasharray={link.type === "Excludes" || link.type === "Extracts" ? "4 4" : "none"}
                                                    // Arrows only on straight lines (hard to unify on curves nicely without specific markers)
                                                    markerEnd={!isNestedMode && !highlightedStage ? "url(#arrow)" : ""}
                                                    fill="none"
                                                    className="transition-all duration-300 pointer-events-none"
                                                />
                                            </g>
                                        );
                                    })}

                                    {nodes.map((node: SimulationNode) => {
                                        const actor = hydratedActors.find((a: EcosystemActor) => a.id === node.id);
                                        if (!actor) return null;

                                        // Check if this is a ghost node
                                        const isGhost = !!(actor && 'isGhost' in actor && (actor as GhostActor).isGhost);

                                        // [NEW] Multi-Assemblage Membership Calculation
                                        const memberOfConfigs = configurations.filter(c => c.memberIds.includes(actor.id));
                                        const isMultiAssemblage = memberOfConfigs.length > 1;

                                        const color = getActorColor(actor.type);
                                        const isSelected = selectedForGrouping.includes(actor.id);
                                        const isFocused = focusedNodeId === actor.id;
                                        const isRelevant = isActorRelevant(actor, highlightedStage);

                                        // [CHANGE] Filtering Logic: If Assemblage Selected, dim others
                                        // Ensure selectedConfigIds is treated as an array (default to empty)
                                        const safeSelectedConfigIds = selectedConfigIds || [];
                                        const isInSelectedAssemblage = safeSelectedConfigIds.length === 0 || memberOfConfigs.some(c => safeSelectedConfigIds.includes(c.id));

                                        let opacity = highlightedStage ? (isRelevant ? 1 : 0.1) : 1;
                                        // removed dimming of non-members
                                        // if (!isInSelectedAssemblage) opacity = 0.1;

                                        if (isGhost) opacity *= 0.85;
                                        const scale = highlightedStage && isRelevant ? 1.2 : 1;
                                        const power = actor.metrics?.dynamic_power || 0;
                                        const baseR = 5 + (power * 1.5);
                                        const r = isFocused || isSelected ? baseR + 2 : baseR;
                                        const strokeDash = isGhost ? "4 2" : "none";

                                        return (
                                            <g key={node.id} transform={`translate(${node.x},${node.y}) scale(${scale})`} onMouseDown={(e) => handleMouseDown(e, node)} onMouseEnter={(e) => handleNodeHover(e, actor)} onMouseLeave={() => setHoveredNode(null)} onClick={(e) => handleNodeClick(e, actor)} className="group cursor-pointer" style={{ transition: 'transform 0.2s ease-out, opacity 0.2s ease-out', opacity }}>
                                                {/* Multi-Assemblage Halo */}
                                                {isMultiAssemblage && (
                                                    <circle r={r + 8} fill="none" stroke="#F59E0B" strokeWidth={1} strokeDasharray="2 2" opacity={0.6} className="animate-spin-slow origin-center">
                                                        <title>Bridge Actor: {memberOfConfigs.map(c => c.name).join(', ')}</title>
                                                    </circle>
                                                )}

                                                {isSelected && (getActorShape(actor.type) === 'square' ? <rect x={-r - 4} y={-r - 4} width={(r + 4) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> : getActorShape(actor.type) === 'triangle' ? <polygon points={`0,${-r - 6} ${r + 6},${r + 4} ${-r - 6},${r + 4}`} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> : getActorShape(actor.type) === 'rect' ? <rect x={-(r + 6)} y={-(r + 4)} width={(r + 6) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> : <circle r={r + 4} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />)}
                                                {getActorShape(actor.type) === 'square' ? <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} /> : getActorShape(actor.type) === 'triangle' ? <polygon points={`0,${-r - 2} ${r + 2},${r + 2} ${-r - 2},${r + 2}`} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} /> : getActorShape(actor.type) === 'rect' ? <rect x={-(r + 2)} y={-r} width={(r + 2) * 2} height={r * 2} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} /> : <circle r={r} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} />}
                                                <foreignObject x="8" y="-10" width="150" height="24" className="overflow-visible pointer-events-none">
                                                    <div className={`flex items-center px-1.5 py-0.5 rounded-sm bg-slate-100/90 border border-slate-200 backdrop-blur-[1px] transform transition-opacity duration-200 ${(focusedNodeId && !isFocused) || (highlightedStage && !isRelevant) ? "opacity-20" : "opacity-100"}`}>
                                                        <span className={`text-[10px] whitespace-nowrap font-medium leading-none ${isGhost ? "text-slate-600 font-semibold" : "text-slate-700"}`}>
                                                            {actor.name}
                                                            {isMultiAssemblage && <span className="text-[8px] ml-1 bg-amber-100 text-amber-700 px-1 rounded-full border border-amber-200" title={`Bridge: ${memberOfConfigs.length} Assemblages`}>×{memberOfConfigs.length}</span>}
                                                            {isGhost && <span className="text-[9px] text-red-500 font-normal ml-0.5">(Absent)</span>}
                                                        </span>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        );
                                    })}
                                </g>
                            </svg>

                            {/* EXPLANATION OVERLAY */}
                            {explanation && (
                                <div className="absolute top-16 right-4 left-4 sm:left-auto sm:w-96 bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 rounded-lg overflow-hidden animate-in slide-in-from-top-5 duration-300 z-50">
                                    <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-indigo-500" />
                                            {analysisMode === 'ant_trace' ? 'ANT Trace Analysis' :
                                                analysisMode === 'hybrid_reflexive' ? 'Hybrid Reflexive Analysis' :
                                                    'Assemblage Analysis'}
                                        </h3>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => setExplanation(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{explanation.narrative}</p>

                                        <div className="space-y-3">
                                            {(explanation.hulls || []).map((hull, i: number) => (
                                                <div key={i} className="bg-slate-50 rounded-md p-3 border border-slate-100">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium text-xs text-slate-900">{hull.id.replace('config-', '')}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${hull.classification === 'Fortress' ? 'bg-red-100 text-red-700' :
                                                            hull.classification === 'Sieve' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>{hull.classification}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">{hull.interpretation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* [REMOVED] Selected Configuration Context Menu (Reliable Delete) */}

                            {/* Floating Legend Card (Existing) */}
                            {isLegendOpen && (
                                <div className="legend-container absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm p-3 w-48 text-xs z-[100] max-h-[600px] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                                        <span className="font-semibold text-slate-800">Actant Types</span>
                                        <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400" onClick={() => setIsLegendOpen(false)}>
                                            <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {Object.entries(SWISS_COLORS).filter(([k]) => k !== 'default').map(([key, color]) => {
                                            const isActive = activeTypeFilter === key;
                                            const isDimmed = activeTypeFilter && !isActive;

                                            return (
                                                <div
                                                    key={key}
                                                    className={`
                                                        flex items-center gap-2 cursor-pointer p-1 rounded transition-all duration-200
                                                        ${isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'}
                                                        ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'}
                                                    `}
                                                    onClick={() => setActiveTypeFilter(isActive ? null : key)}
                                                >
                                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: color }} />
                                                    <span className={`capitalize ${isActive ? 'text-indigo-700 font-medium' : 'text-slate-600'}`}>
                                                        {key.replace("civilsociety", "Civil Society")}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>


                                    {/* Macro Assemblages Legend */}

                                    {/* Macro Assemblages Legend */}
                                    {configurations.length > 0 && (
                                        <>
                                            <div className="mt-3 pt-2 border-t border-slate-100">
                                                <p className="font-semibold text-slate-800 mb-2">Macro Assemblages</p>
                                                <div className="space-y-1.5">
                                                    {configurations.map(config => (
                                                        <div key={config.id} className="flex items-center gap-2 group justify-between p-1 rounded hover:bg-slate-50">
                                                            {/* Label Area - Handles Selection */}
                                                            <div
                                                                onClick={(e) => {
                                                                    const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
                                                                    if (onConfigClick) onConfigClick(config.id, isMulti);
                                                                    else if (onConfigSelect) onConfigSelect(config.id, isMulti);
                                                                }}
                                                                className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer"
                                                            >
                                                                <div
                                                                    className="w-3 h-3 rounded-sm shadow-sm ring-1 ring-black/5 opacity-80 shrink-0"
                                                                    style={{ backgroundColor: config.color }}
                                                                />
                                                                <span className="text-slate-600 truncate text-[10px] group-hover:text-slate-900 transition-colors">{config.name}</span>
                                                            </div>

                                                            {/* Delete Button - Independent Click Handler */}
                                                            {onDeleteConfiguration && (
                                                                configToDelete === config.id ? (
                                                                    <div className="flex items-center gap-0.5 animate-in slide-in-from-right-2 duration-200">
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="h-6 px-1.5 text-[9px] bg-red-600 hover:bg-red-700 text-white font-bold"
                                                                            onClick={(e) => {
                                                                                console.log('[EcosystemMap] SURE? Clicked (Legend) for ID:', config.id);
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                if (onDeleteConfiguration) {
                                                                                    onDeleteConfiguration(config.id);
                                                                                } else {
                                                                                    console.warn('[EcosystemMap] onDeleteConfiguration prop is missing in legend!');
                                                                                }
                                                                                setConfigToDelete(null);
                                                                            }}
                                                                            onMouseDown={(e) => e.stopPropagation()}
                                                                        >
                                                                            SURE?
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-slate-400 hover:bg-slate-100"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setConfigToDelete(null);
                                                                            }}
                                                                            onMouseDown={(e) => e.stopPropagation()}
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1 shrink-0 z-10"
                                                                        onClick={(e) => {
                                                                            console.log('[EcosystemMap] Delete Icon Clicked (Legend) for ID:', config.id);
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setConfigToDelete(config.id);
                                                                        }}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                        title="Delete Configuration"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Boundary Strength Legend */}
                                            <div className="mt-3 pt-2 border-t border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-semibold text-slate-800">Boundary Strength</p>
                                                    {activeBoundaryFilter && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4 text-slate-400 hover:text-red-500"
                                                            onClick={() => setActiveBoundaryFilter(null)}
                                                            title="Clear Filter"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="space-y-2 text-[10px] text-slate-500">
                                                    <div
                                                        className={`flex items-center gap-2 cursor-pointer p-1 rounded transition-all ${activeBoundaryFilter === 'solid' ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'} ${activeBoundaryFilter && activeBoundaryFilter !== 'solid' ? 'opacity-40' : ''}`}
                                                        onClick={() => setActiveBoundaryFilter(activeBoundaryFilter === 'solid' ? null : 'solid')}
                                                    >
                                                        <div className="w-6 h-3 border-2 border-slate-400 bg-slate-200/50 rounded-sm"></div>
                                                        <span className={activeBoundaryFilter === 'solid' ? 'font-medium text-indigo-700' : ''}>Solid: Stable (Internal Focus)</span>
                                                    </div>
                                                    <div
                                                        className={`flex items-center gap-2 cursor-pointer p-1 rounded transition-all ${activeBoundaryFilter === 'porous' ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'} ${activeBoundaryFilter && activeBoundaryFilter !== 'porous' ? 'opacity-40' : ''}`}
                                                        onClick={() => setActiveBoundaryFilter(activeBoundaryFilter === 'porous' ? null : 'porous')}
                                                    >
                                                        <div className="w-6 h-3 border-2 border-slate-400 border-dashed bg-slate-100/20 rounded-sm"></div>
                                                        <span className={activeBoundaryFilter === 'porous' ? 'font-medium text-indigo-700' : ''}>Dashed: Porous (Open)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px]">
                                        <p className="font-semibold text-slate-800 mb-2">Edge Filters</p>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={showSolidEdges}
                                                    onChange={(e) => setShowSolidEdges(e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                />
                                                <span className="text-slate-700 flex items-center gap-1">
                                                    <span className="font-bold">─</span> Connectivity (Solid)
                                                </span>
                                            </label>
                                            <label
                                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                                                title="Ghost nodes represent structurally absent actors identified by analysis. Run Comprehensive Analysis to detect missing voices."
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={showGhostEdges}
                                                    onChange={(e) => setShowGhostEdges(e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                />
                                                <span className="text-slate-700 flex items-center gap-1">
                                                    <span className="font-bold">- -</span> Absent/Virtual (Ghost)
                                                </span>
                                            </label>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-100 text-slate-500">
                                            <p><span className="font-bold">●</span> Node Size: Translation Strength</p>
                                        </div>
                                    </div>

                                    {/* Hull Style Legend */}
                                    <div className="mt-3 pt-2 border-t border-slate-100">
                                        <p className="font-semibold text-slate-800 mb-2">Boundary Strength</p>
                                        <div className="space-y-2 text-[10px] text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-3 border-2 border-slate-300 bg-slate-100/50 rounded-sm"></div>
                                                <span>Solid: Stable/Closed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-3 border-2 border-slate-300 border-dashed bg-slate-100/20 rounded-sm"></div>
                                                <span>Dashed: Porous/Open</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
                                                <span>Darker: High Density</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CENTERED LINK DETAIL DIALOG */}
                            <Dialog open={!!selectedLink} onOpenChange={(open) => !open && setSelectedLink(null)}>
                                <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <span className="text-indigo-600">Association Details</span>
                                        </DialogTitle>
                                        <DialogDescription>
                                            Mapping the mediation between distinct actors.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {selectedLink && (
                                        <div className="space-y-4 py-2 text-sm">
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100">
                                                <div className="font-medium text-slate-700">
                                                    {(() => {
                                                        const s = selectedLink.source;
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const sName = typeof s === 'object' ? (s as any).name : mergedActors.find(a => a.id === s)?.name || s;
                                                        return sName;
                                                    })()}
                                                </div>
                                                <div className="px-2 text-slate-400">→</div>
                                                <div className="font-medium text-slate-700">
                                                    {(() => {
                                                        const t = selectedLink.target;
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const tName = typeof t === 'object' ? (t as any).name : mergedActors.find(a => a.id === t)?.name || t;
                                                        return tName;
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Relationship Type</div>
                                                <div className="p-2 border border-indigo-100 bg-indigo-50/50 rounded-md text-indigo-700 font-medium">
                                                    {selectedLink.type}
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-400 italic pt-2 border-t">
                                                In ANT, every association is a performance. This link represents a translation of force/influence between the two actants.
                                            </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>

                            {/* ... (Close Legend Button) ... */}
                            {!isLegendOpen && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-4 right-4 h-8 bg-white shadow-sm text-xs"
                                    onClick={() => setIsLegendOpen(true)}
                                >
                                    Show Filter
                                </Button>
                            )}

                            {focusedNodeId && (
                                <div className="absolute bottom-4 left-4">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="text-xs shadow-sm bg-white hover:bg-slate-50 border border-slate-200"
                                        onClick={() => setFocusedNodeId(null)}
                                    >
                                        <EyeOff className="h-3 w-3 mr-1.5 text-slate-500" /> Reset Focus
                                    </Button>
                                </div>
                            )}

                            {hoveredLink && (
                                <div
                                    className="absolute z-50 pointer-events-none"
                                    style={{
                                        left: tooltipPos.x + 10,
                                        top: tooltipPos.y + 10,
                                    }}
                                >
                                    <div className="bg-slate-900/90 backdrop-blur-md text-slate-50 text-xs px-3 py-2 rounded-md shadow-lg border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="font-semibold">{hoveredLink.type}</div>
                                        <div className="text-slate-400 text-[10px] mt-0.5">
                                            {(() => {
                                                const s = hoveredLink.source;
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                const sName = typeof s === 'object' ? (s as any).name : mergedActors.find(a => a.id === s)?.name || s;

                                                const t = hoveredLink.target;
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                const tName = typeof t === 'object' ? (t as any).name : mergedActors.find(a => a.id === t)?.name || t;

                                                return (
                                                    <>
                                                        {sName} <span className="mx-1">→</span> {tName}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hoveredNode && (
                                <div
                                    className="fixed z-50 pointer-events-none"
                                    style={{
                                        // Viewport-aware positioning
                                        left: tooltipPos.x > (window.innerWidth - 280) ? 'auto' : tooltipPos.x + 10,
                                        right: tooltipPos.x > (window.innerWidth - 280) ? (window.innerWidth - tooltipPos.x + 10) : 'auto',

                                        top: tooltipPos.y > (window.innerHeight - 300) ? 'auto' : tooltipPos.y + 10,
                                        bottom: tooltipPos.y > (window.innerHeight - 300) ? (window.innerHeight - tooltipPos.y + 10) : 'auto',
                                    }}
                                >
                                    <div className="bg-slate-900/90 backdrop-blur-md text-slate-50 text-xs px-3 py-2 rounded-md shadow-lg border border-slate-700 max-w-[250px] animate-in fade-in zoom-in-95 duration-200 block">
                                        <div className="font-semibold mb-0.5 flex items-center gap-2">
                                            {(hoveredNode as GhostActor).isGhost && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                            )}
                                            {hoveredNode.name}
                                        </div>
                                        <div className="text-slate-400 text-[10px] mb-1">{hoveredNode.type}</div>
                                        {hoveredNode.description && (
                                            <div className="text-slate-300 border-t border-slate-700/50 pt-1 mt-1 leading-relaxed">
                                                {(hoveredNode as GhostActor).isGhost ? `MISSING: ${hoveredNode.description}` : hoveredNode.description}
                                            </div>
                                        )}
                                        {(() => {
                                            const memberConfigs = hydratedConfigs.filter(c => c.memberIds.includes(hoveredNode.id));
                                            if (memberConfigs.length > 0) {
                                                return (
                                                    <div className="mt-2 pt-2 border-t border-indigo-500/30 space-y-2">
                                                        {memberConfigs.map(config => {
                                                            const porosity = config.properties.porosity_index || 0;
                                                            const stability = config.properties.calculated_stability || 0;
                                                            return (
                                                                <div key={config.id} className="pb-1 border-b border-indigo-500/10 last:border-0 last:pb-0">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: config.color }}></div>
                                                                        <span className="text-indigo-300 font-medium leading-tight">{config.name}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                                                        <div>
                                                                            <span className="text-slate-500 mr-1">Porosity:</span>
                                                                            <span className={porosity > 0.5 ? "text-indigo-300" : "text-slate-300"}>{porosity.toFixed(2)}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500 mr-1">Stability:</span>
                                                                            <span className="text-slate-300">{stability.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            )}

                            {isNestedMode && (
                                <div className="animate-in slide-in-from-bottom-5 duration-700">
                                    <TranslationChain
                                        actors={actors}
                                        onHoverStage={setHighlightedStage}
                                    />
                                </div>
                            )}

                        </>
                    )}

                    {is3DMode && isStratumMode && <StratumLegend />}
                    {is3DMode && !isStratumMode && <ViewTypeLegend />}
                </CardContent>
            </Card >
        </div >
    );
}
