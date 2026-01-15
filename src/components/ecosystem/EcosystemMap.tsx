import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import { EcosystemActor, EcosystemConfiguration, AssemblageAnalysis, AiAbsenceAnalysis, AssemblageExplanation } from '@/types/ecosystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, MousePointer2, Layers, EyeOff, ChevronDown, ZoomIn, Maximize, Minimize, MessageSquare, X, Trash2 } from 'lucide-react';
import { useForceGraph, SimulationNode } from '@/hooks/useForceGraph';
import { generateEdges } from '@/lib/graph-utils';
import { TranslationChain } from './TranslationChain';
import dynamic from 'next/dynamic';
import { StratumLegend, ViewTypeLegend } from './EcosystemLegends';
import { SWISS_COLORS, getActorColor, getActorShape, mergeGhostNodes, GhostActor } from '@/lib/ecosystem-utils';

const EcosystemMap3D = dynamic(() => import('./EcosystemMap3D').then(mod => mod.EcosystemMap3D), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400">Loading 3D Engine...</div>
});

import { AnalysisMode, ModeSelector } from '@/components/ui/mode-selector';

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
    onConfigClick?: (configId: string) => void;
    selectedConfigId?: string | null;
    onDeleteConfiguration?: (configId: string) => void;
    absenceAnalysis?: AssemblageAnalysis | AiAbsenceAnalysis | null;
    analysisMode?: AnalysisMode;
    setAnalysisMode?: (mode: AnalysisMode) => void;
    configLayout?: Record<string, { x: number; y: number }>;
    onConfigSelect?: (configId: string) => void;
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
    selectedConfigId,
    onDeleteConfiguration,
    absenceAnalysis,
    analysisMode = "hybrid_reflexive",
    setAnalysisMode,
    configLayout = {},
    onConfigSelect,
    extraToolbarContent,
    isReadOnly = false
}: EcosystemMapProps) {
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    // ... existing state ...

    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [draggingConfigId, setDraggingConfigId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null); // Ref for zoom behavior
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [isNestedMode, setIsNestedMode] = useState(false);
    const [isStratumMode, setIsStratumMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [is3DMode, setIs3DMode] = useState(false);

    const [highlightedStage, setHighlightedStage] = useState<string | null>(null);

    // Zoom/Pan State
    const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

    // Merged Actors with Ghosts
    const mergedActors = useMemo(() => {
        return mergeGhostNodes(actors, absenceAnalysis || null);
    }, [actors, absenceAnalysis]);

    // Assemblage Explanation State
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState<AssemblageExplanation | null>(null);

    const links = useMemo(() => {
        const generated = generateEdges(mergedActors);
        return generated.map(e => ({
            source: e.source.id,
            target: e.target.id,
            type: e.label
        }));
    }, [mergedActors]);

    // Simplified Actor Hydration (No Simulation)
    const hydratedActors = useMemo(() => {
        return mergedActors;
    }, [mergedActors]);

    const handleExplainMap = React.useCallback(async () => {
        if (!analysisMode) return;
        if (isReadOnly) {
            alert("Trace analysis is disabled in Demo Mode.");
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
                    actors: mergedActors, // Pass actors for tracing
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
                setIsLegendOpen(false); // Close legend to show explanation
            }
        } catch (error) {
            console.error("Explanation failed:", error);
        } finally {
            setIsExplaining(false);
        }
    }, [analysisMode, configurations, mergedActors, links, isNestedMode, is3DMode]);



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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nodes, simulation, drag } = useForceGraph(
        hydratedActors, // Use hydrated actors with dynamic power
        dimensions.width,
        dimensions.height,
        configurations.map(c => ({ id: c.id, memberIds: c.memberIds })),
        links,
        isNestedMode,
        is3DMode,
        configLayout // Renamed internally in hook, but prop name can stay configLayout or be renamed. Let's send the prop as 'configOffsets' arg.
    );

    // Zoom Behavior Setup
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .filter((event) => {
                // Prevent zoom/pan if clicking on a draggable config or if button is not left click
                if (event.target instanceof Element && event.target.closest('.draggable-config')) {
                    return false;
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
            onConfigClick(configId);
        }
    };

    const handleNodeClick = (e: React.MouseEvent, actor: EcosystemActor) => {
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

    const getHullPath = (points: { x: number, y: number }[]) => {
        if (points.length < 3) return "";
        points.sort((a, b) => a.x - b.x || a.y - b.y);
        const cross = (o: { x: number, y: number }, a: { x: number, y: number }, b: { x: number, y: number }) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        const lower = [];
        for (let i = 0; i < points.length; i++) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) lower.pop();
            lower.push(points[i]);
        }
        const upper = [];
        for (let i = points.length - 1; i >= 0; i--) {
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) upper.pop();
            upper.push(points[i]);
        }
        upper.pop(); lower.pop();
        const hull = lower.concat(upper);
        return `M ${hull.map(p => `${p.x},${p.y}`).join(" L ")} Z`;
    };

    // Standard Config Passthrough
    const hydratedConfigs = useMemo(() => {
        return configurations;
    }, [configurations]);

    const [hoveredNode, setHoveredNode] = useState<EcosystemActor | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const [hoveredLink, setHoveredLink] = useState<{ source: string | object, target: string | object, type: string } | null>(null);

    // Node Event Handlers
    const handleNodeHover = (e: React.MouseEvent, actor: EcosystemActor) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
        setHoveredNode(actor);
        setHoveredLink(null);
    };

    const handleLinkHover = (e: React.MouseEvent, link: any) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltipPos({
                x: e.clientX - rect.left + 5,
                y: e.clientY - rect.top + 5
            });
        }
        setHoveredLink(link);
        setHoveredNode(null);
    };

    return (
        <div className="relative w-full h-full">
            <Card
                className={`flex flex-col shadow-none border border-slate-200 bg-white transition-all duration-300 relative ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'h-[800px]'}`}
                ref={containerRef}
            >
                {/* ... (Header remains) */}
                <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row flex-wrap items-center justify-between gap-y-4 bg-white z-10 relative">
                    <div>
                        <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">Assemblage Compass</CardTitle>
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
                                    onClick={() => setIsNestedMode(!isNestedMode)}
                                    className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isNestedMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                                >
                                    <Layers className="h-3 w-3 mr-1" /> {isNestedMode ? "Nested Map" : "Force Layout"}
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
                            actors={actors}
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
                                className="cursor-move"
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

                                    {hydratedConfigs.map((config: EcosystemConfiguration) => {
                                        const memberPoints = config.memberIds.map((id: string) => getNodePos(id)).filter((p: { x: number; y: number }) => p.x !== 0 && p.y !== 0);
                                        if (memberPoints.length < 2) return null;
                                        const centroid = memberPoints.reduce((acc: { x: number; y: number }, p: { x: number; y: number }) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                                        centroid.x /= memberPoints.length;
                                        centroid.y /= memberPoints.length;
                                        const porosity = config.properties.porosity_index || 0;
                                        const strokeDash = porosity > 0.6 ? "6 4" : (porosity > 0.3 ? "10 2" : "none");
                                        const stability = config.properties.calculated_stability || 0.1;
                                        const isConfigSelected = selectedConfigId === config.id;
                                        const fillOpacity = isConfigSelected ? 0.3 : Math.max(0.05, Math.min(0.3, stability * 0.4));
                                        return (
                                            <g key={config.id} className={`draggable-config transition-all duration-500 ease-out ${interactionMode === 'drag' ? 'cursor-move' : 'cursor-pointer'}`} opacity={highlightedStage ? 0.1 : 1} onMouseDown={(e) => handleConfigMouseDown(e, config.id)}>
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
                                        const isFocused = focusedNodeId && (link.source === focusedNodeId || link.target === focusedNodeId);
                                        const isHovered = hoveredLink && hoveredLink.source === link.source && hoveredLink.target === link.target;

                                        let strokeWidth = 1;
                                        if (link.type === "Regulates" || link.type === "Governs") strokeWidth = 2.5;
                                        if (link.type === "Excludes") strokeWidth = 1.5;
                                        if (isFocused || isHovered) strokeWidth += 1.5;

                                        return (
                                            <g key={i}
                                                onMouseEnter={(e) => handleLinkHover(e, link)}
                                                onMouseLeave={() => setHoveredLink(null)}
                                            >
                                                {/* Hit Area (Invisible but thicker) */}
                                                <line
                                                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                                                    stroke="transparent"
                                                    strokeWidth={10}
                                                    className="cursor-pointer"
                                                />
                                                {/* Visible Line */}
                                                <line
                                                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                                                    stroke={isFocused || isHovered ? "#475569" : "#CBD5E1"}
                                                    strokeWidth={strokeWidth}
                                                    strokeOpacity={highlightedStage ? 0.1 : (isFocused || isHovered ? 1 : 0.5)}
                                                    strokeDasharray={link.type === "Excludes" || link.type === "Extracts" ? "4 4" : "none"}
                                                    markerEnd={!highlightedStage ? "url(#arrow)" : ""}
                                                    className="transition-all duration-300 pointer-events-none"
                                                />
                                            </g>
                                        );
                                    })}

                                    {nodes.map((node: SimulationNode) => {
                                        const actor = hydratedActors.find((a: EcosystemActor) => a.id === node.id);
                                        if (!actor) return null;
                                        const color = getActorColor(actor.type);
                                        const isSelected = selectedForGrouping.includes(actor.id);
                                        const isFocused = focusedNodeId === actor.id;
                                        const isRelevant = isActorRelevant(actor, highlightedStage);
                                        const isGhost = 'isGhost' in actor ? (actor as EcosystemActor & { isGhost?: boolean }).isGhost : false;
                                        let opacity = highlightedStage ? (isRelevant ? 1 : 0.1) : 1;
                                        if (isGhost) opacity *= 0.6;
                                        const scale = highlightedStage && isRelevant ? 1.2 : 1;
                                        const power = actor.metrics?.dynamic_power || 0;
                                        const baseR = 5 + (power * 1.5);
                                        const r = isFocused || isSelected ? baseR + 2 : baseR;
                                        const strokeDash = isGhost ? "3 2" : "none";
                                        return (
                                            <g key={node.id} transform={`translate(${node.x},${node.y}) scale(${scale})`} onMouseDown={(e) => handleMouseDown(e, node)} onMouseEnter={(e) => handleNodeHover(e, actor)} onMouseLeave={() => setHoveredNode(null)} onClick={(e) => handleNodeClick(e, actor)} className="group cursor-pointer" style={{ transition: 'transform 0.2s ease-out, opacity 0.2s ease-out', opacity }}>
                                                {isSelected && (getActorShape(actor.type) === 'square' ? <rect x={-r - 4} y={-r - 4} width={(r + 4) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> : getActorShape(actor.type) === 'triangle' ? <polygon points={`0,${-r - 6} ${r + 6},${r + 4} ${-r - 6},${r + 4}`} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> : getActorShape(actor.type) === 'rect' ? <rect x={-(r + 6)} y={-(r + 4)} width={(r + 6) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> : <circle r={r + 4} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />)}
                                                {getActorShape(actor.type) === 'square' ? <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={isGhost ? "white" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={1.5} strokeDasharray={strokeDash} /> : getActorShape(actor.type) === 'triangle' ? <polygon points={`0,${-r - 2} ${r + 2},${r + 2} ${-r - 2},${r + 2}`} fill={isGhost ? "white" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={1.5} strokeDasharray={strokeDash} /> : getActorShape(actor.type) === 'rect' ? <rect x={-(r + 2)} y={-r} width={(r + 2) * 2} height={r * 2} fill={isGhost ? "white" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={1.5} strokeDasharray={strokeDash} /> : <circle r={r} fill={isGhost ? "white" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={1.5} strokeDasharray={strokeDash} />}
                                                <foreignObject x="8" y="-10" width="150" height="24" className="overflow-visible pointer-events-none">
                                                    <div className={`flex items-center px-1.5 py-0.5 rounded-sm bg-slate-100/90 border border-slate-200 backdrop-blur-[1px] transform transition-opacity duration-200 ${(focusedNodeId && !isFocused) || (highlightedStage && !isRelevant) ? "opacity-20" : "opacity-100"}`}>
                                                        <span className={`text-[10px] whitespace-nowrap font-medium leading-none ${isGhost ? "text-slate-400 italic" : "text-slate-700"}`}>{actor.name} {isGhost && "(Missing)"}</span>
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

                            {/* SELECTION CONTEXT MENU (New) */}
                            {selectedForGrouping.length > 0 && (
                                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md shadow-xl border border-indigo-200 rounded-lg p-2 z-40 animate-in slide-in-from-top-2 flex items-center gap-3">
                                    <div className="flex items-center gap-2 pl-2 border-r border-slate-200 pr-3">
                                        <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {selectedForGrouping.length}
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">Selected</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreateConfiguration();
                                        }}
                                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                    >
                                        <Layers className="h-3 w-3 mr-1.5" />
                                        Create Configuration
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            selectedForGrouping.forEach(id => onToggleSelection(id));
                                        }}
                                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        title="Clear Selection"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Floating Legend Card (Existing) */}
                            {isLegendOpen && (
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm p-3 w-48 text-xs z-10 max-h-[600px] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                                        <span className="font-semibold text-slate-800">Actant Types</span>
                                        <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400" onClick={() => setIsLegendOpen(false)}>
                                            <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {Object.entries(SWISS_COLORS).filter(([k]) => k !== 'default').map(([key, color]) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: color }} />
                                                <span className="capitalize text-slate-600">{key.replace("civilsociety", "Civil Society")}</span>
                                            </div>
                                        ))}
                                    </div>


                                    {/* Macro Assemblages Legend */}

                                    {/* Macro Assemblages Legend */}
                                    {configurations.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-slate-100">
                                            <p className="font-semibold text-slate-800 mb-2">Macro Assemblages</p>
                                            <div className="space-y-1.5">
                                                {configurations.map(config => (
                                                    <div key={config.id} className="flex items-center gap-2 group justify-between p-1 rounded hover:bg-slate-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); onConfigSelect ? onConfigSelect(config.id) : onConfigClick?.(config.id); }}>
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div
                                                                className="w-3 h-3 rounded-sm shadow-sm ring-1 ring-black/5 opacity-80 shrink-0"
                                                                style={{ backgroundColor: config.color }}
                                                            />
                                                            <span className="text-slate-600 truncate text-[10px] group-hover:text-slate-900 transition-colors">{config.name}</span>
                                                        </div>
                                                        {onDeleteConfiguration && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-4 w-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm(`Delete configuration "${config.name}"?`)) {
                                                                        onDeleteConfiguration(config.id);
                                                                    }
                                                                }}
                                                                title="Delete Configuration"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                                        <p className="mb-1"><span className="font-bold">─</span> Line Thickness: Connectivity</p>
                                        <p><span className="font-bold">●</span> Node Size: Translation Strength</p>
                                        <p><span className="font-bold">- -</span> Absent / Virtual (Ghost)</p>
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

                            {/* ... (Close Legend Button) ... */}
                            {!isLegendOpen && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-4 right-4 h-8 bg-white shadow-sm text-xs"
                                    onClick={() => setIsLegendOpen(true)}
                                >
                                    Show Legend
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
                                    className="absolute z-50 pointer-events-none"
                                    style={{
                                        left: tooltipPos.x + 10,
                                        top: tooltipPos.y + 10,
                                    }}
                                >
                                    <div className="bg-slate-900/90 backdrop-blur-md text-slate-50 text-xs px-3 py-2 rounded-md shadow-lg border border-slate-700 max-w-[250px] animate-in fade-in zoom-in-95 duration-200">
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
