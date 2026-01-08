import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import { EcosystemActor, EcosystemConfiguration, AssemblageAnalysis, AiAbsenceAnalysis } from '@/types/ecosystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, MousePointer2, BoxSelect, Layers, EyeOff, ChevronDown, ChevronUp, Loader2, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { useForceGraph } from '@/hooks/useForceGraph';
import { generateEdges } from '@/lib/graph-utils';
import { TranslationChain } from './TranslationChain';
import dynamic from 'next/dynamic';
import { StratumLegend, ViewTypeLegend } from './EcosystemLegends';
import { SWISS_COLORS, getActorColor, getActorShape, mergeGhostNodes, GhostActor } from '@/lib/ecosystem-utils';

const EcosystemMap3D = dynamic(() => import('./EcosystemMap3D').then(mod => mod.EcosystemMap3D), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400">Loading 3D Engine...</div>
});

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
    activeLens?: string;
    colorMode?: "type" | "epistemic";
    onConfigClick?: (configId: string) => void;
    absenceAnalysis?: AssemblageAnalysis | AiAbsenceAnalysis | null;
}

// --- Swiss Design System Constants ---
// Moved to @/lib/ecosystem-utils

const HULL_STYLES = {
    opacity: 0.15,
    strokeDash: "6 4",
    strokeWidth: 2
};

export function EcosystemMap({
    actors,
    configurations,
    interactionMode,
    setInteractionMode,
    selectedForGrouping,
    onToggleSelection,
    onCreateConfiguration,
    activeLens = "None",
    onConfigClick,
    absenceAnalysis
}: EcosystemMapProps) {
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
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

    // Helper to determine if an actor belongs to a hovered stage
    const isActorRelevant = (actor: EcosystemActor, stageId: string | null) => {
        // ... (Logic remains same)
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

    // ... (logic remains)
    const links = useMemo(() => {
        const generated = generateEdges(mergedActors); // Use merged actors for edges (though ghosts likely have none)
        return generated.map(e => ({
            source: e.source.id,
            target: e.target.id,
            type: e.label
        }));
    }, [mergedActors]);

    // Force Physics
    const { nodes, simulation, drag } = useForceGraph(
        mergedActors, // Use merged actors
        dimensions.width,
        dimensions.height,
        configurations.map(c => ({ id: c.id, memberIds: c.memberIds })),
        links,
        isNestedMode,
        is3DMode
    );

    // Zoom Behavior Setup
    useEffect(() => {
        if (!svgRef.current) return;

        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                setTransform(event.transform);
            });

        zoomBehaviorRef.current = zoomBehavior; // Store in ref

        const svgSelection = d3.select(svgRef.current);
        svgSelection.call(zoomBehavior);

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

    const handleMouseDown = (e: React.MouseEvent, node: any) => {
        e.stopPropagation(); // Prevent Zoom/Pan start
        if (interactionMode === "drag") {
            setDraggingNodeId(node.id);
            drag(node).dragStarted({ active: true, x: node.x, y: node.y });
        } else {
            onToggleSelection(node.id);
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
        if (!draggingNodeId || interactionMode !== "drag") return;
        e.preventDefault();
        e.stopPropagation();

        const worldP = getTransformedPoint(e.clientX, e.clientY);
        const node = nodes.find(n => n.id === draggingNodeId);

        if (node) drag(node).dragged({ x: worldP.x, y: worldP.y });
    };

    const handleMouseUp = () => {
        if (draggingNodeId) {
            const node = nodes.find(n => n.id === draggingNodeId);
            if (node) drag(node).dragEnded({ active: false });
            setDraggingNodeId(null);
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

    const [hoveredNode, setHoveredNode] = useState<EcosystemActor | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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
    };

    return (
        <div className="relative w-full h-full">
            <Card
                className={`flex flex-col shadow-none border border-slate-200 bg-white transition-all duration-300 relative ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'h-[800px]'}`}
                ref={containerRef}
            >
                {/* ... (Header remains) */}
                <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between bg-white z-10 relative">
                    <div>
                        <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">Actor Network Modeling</CardTitle>
                        <CardDescription className="text-xs text-slate-500 font-normal">
                            {is3DMode ? "3D WebGL Visualization" : (isNestedMode ? "Nested Assemblage (Actor → Collective → Regime)" : "Hierarchical view of assemblage clusters")}
                        </CardDescription>
                    </div>

                    {/* Modern Toolbar */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-md border border-slate-200">
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => {
                                const newMode = !is3DMode;
                                setIs3DMode(newMode);
                                if (newMode) setIsStratumMode(true);
                            }}
                            className={`h-7 px-2.5 text-xs font-medium ${is3DMode ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            <Network className="h-3 w-3 mr-1" /> {is3DMode ? "3D View" : "2D View"}
                        </Button>

                        {!is3DMode ? (
                            <>
                                <div className="w-px h-3 bg-slate-300 mx-0.5" />
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => setIsNestedMode(!isNestedMode)}
                                    className={`h-7 px-2.5 text-xs font-medium ${isNestedMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                                >
                                    <Layers className="h-3 w-3 mr-1" /> {isNestedMode ? "Nested Map" : "Force Layout"}
                                </Button>
                                <div className="w-px h-3 bg-slate-300 mx-0.5" />
                                <Button
                                    variant="ghost" size="sm"
                                    className={`h-7 px-2.5 text-xs font-medium ${interactionMode === "drag" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                                    onClick={() => setInteractionMode("drag")}
                                >
                                    <MousePointer2 className="h-3 w-3 mr-1" /> Move Actor
                                </Button>
                                <div className="w-px h-3 bg-slate-300 mx-0.5" />
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-7 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                                    onClick={resetZoom}
                                >
                                    <ZoomIn className="h-3 w-3 mr-1" /> Reset View
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="w-px h-3 bg-slate-300 mx-0.5" />
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => setIsStratumMode(!isStratumMode)}
                                    className={`h-7 px-2.5 text-xs font-medium ${isStratumMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                                    title="Visualize Law as a Stratum over the Meshwork"
                                >
                                    <Layers className="h-3 w-3 mr-1" /> {isStratumMode ? "Stratum Active" : "Legal Stratum"}
                                </Button>
                            </>
                        )}

                        <div className="w-px h-3 bg-slate-300 mx-0.5" />
                        <Button
                            variant="ghost" size="sm"
                            className={`h-7 px-2.5 text-xs font-medium ${isFullScreen ? "bg-red-50 text-red-600" : "text-slate-500 hover:text-slate-900"}`}
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
                            <svg
                                ref={svgRef}
                                width="100%" height="100%"
                                className="cursor-move"
                                onMouseMove={handleSvgMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5"
                                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                                    </marker>
                                </defs>

                                <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>

                                    {/* 0. REGIME LAYER (Background for Nested Mode) */}
                                    {isNestedMode && (
                                        <g className="opacity-0 animate-in fade-in duration-1000 pointer-events-none">
                                            {/* Outer Field: Policy Regime */}
                                            <circle
                                                cx={dimensions.width / 2} cy={dimensions.height / 2}
                                                r={Math.min(dimensions.width, dimensions.height) * 0.45}
                                                fill="none"
                                                stroke="#E2E8F0"
                                                strokeWidth="2"
                                                strokeDasharray="8 8"
                                            />
                                            <text
                                                x={dimensions.width / 2} y={dimensions.height / 2 - Math.min(dimensions.width, dimensions.height) * 0.45 - 10}
                                                textAnchor="middle"
                                                className="text-[10px] font-bold fill-slate-400 uppercase tracking-[0.2em]"
                                            >
                                                Governance Regime Boundary
                                            </text>

                                            {/* Policy Object Center */}
                                            <circle cx={dimensions.width / 2} cy={dimensions.height / 2} r={10} fill="#6366F1" opacity="0.1" />
                                            <text x={dimensions.width / 2} y={dimensions.height / 2} dy={3} textAnchor="middle" className="text-[6px] font-bold fill-indigo-400 uppercase">Policy</text>
                                        </g>
                                    )}

                                    {/* 1. HULLS (Background Layers) */}
                                    {configurations.map(config => {
                                        const memberPoints = config.memberIds
                                            .map(id => getNodePos(id))
                                            .filter(p => p.x !== 0 && p.y !== 0);

                                        if (memberPoints.length < 2) return null;

                                        const centroid = memberPoints.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                                        centroid.x /= memberPoints.length;
                                        centroid.y /= memberPoints.length;

                                        return (
                                            <g key={config.id} className="transition-all duration-500 ease-out" opacity={highlightedStage ? 0.1 : 1}>
                                                <path
                                                    d={memberPoints.length === 2
                                                        ? `M ${memberPoints[0].x} ${memberPoints[0].y} L ${memberPoints[1].x} ${memberPoints[1].y}`
                                                        : getHullPath(memberPoints)}
                                                    fill={config.color}
                                                    fillOpacity={HULL_STYLES.opacity}
                                                    stroke={config.color}
                                                    strokeWidth={HULL_STYLES.strokeWidth}
                                                    strokeDasharray={HULL_STYLES.strokeDash} // Porous boundaries
                                                    strokeLinejoin="round"
                                                    strokeLinecap="round"
                                                />
                                                {/* Label Background Pill */}
                                                <rect
                                                    x={centroid.x - (config.name.length * 3 + 8)}
                                                    y={centroid.y - 32}
                                                    width={config.name.length * 6 + 16}
                                                    height={18}
                                                    rx={9}
                                                    fill={config.color}
                                                    fillOpacity={0.9}
                                                    stroke="white"
                                                    strokeWidth={1.5}
                                                    className="drop-shadow-sm"
                                                />
                                                <text
                                                    x={centroid.x} y={centroid.y - 20}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-[10px] font-bold fill-white uppercase tracking-wider"
                                                    style={{ pointerEvents: 'none' }}
                                                >
                                                    {config.name}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* 2. LINKS (Translation Intensity) */}
                                    {links.map((link, i) => {
                                        const s = getNodePos(link.source as string);
                                        const t = getNodePos(link.target as string);
                                        if (s.x === 0 || t.x === 0) return null;

                                        const isFocused = focusedNodeId && (link.source === focusedNodeId || link.target === focusedNodeId);

                                        // Line thickness = Translation Intensity
                                        let strokeWidth = 1;
                                        if (link.type === "Regulates" || link.type === "Governs") strokeWidth = 2.5;
                                        if (link.type === "Excludes") strokeWidth = 1.5;

                                        if (isFocused) strokeWidth += 1;

                                        return (
                                            <line
                                                key={i}
                                                x1={s.x} y1={s.y}
                                                x2={t.x} y2={t.y}
                                                stroke={isFocused ? "#64748B" : "#CBD5E1"}
                                                strokeWidth={strokeWidth}
                                                strokeOpacity={highlightedStage ? 0.1 : (isFocused ? 0.9 : 0.5)}
                                                strokeDasharray={link.type === "Excludes" || link.type === "Extracts" ? "4 4" : "none"}
                                                markerEnd={!highlightedStage ? "url(#arrow)" : ""}
                                                className="transition-all duration-300"
                                                pointerEvents="none"
                                            />
                                        );
                                    })}

                                    {/* 3. NODES */}
                                    {nodes.map(node => {
                                        const actor = mergedActors.find(a => a.id === node.id); // Use mergedActors
                                        if (!actor) return null;

                                        const color = getActorColor(actor.type);
                                        const isSelected = selectedForGrouping.includes(actor.id);
                                        const isFocused = focusedNodeId === actor.id;
                                        const isRelevant = isActorRelevant(actor, highlightedStage);
                                        const isGhost = actor.isGhost;

                                        // Highlight Logic
                                        let opacity = highlightedStage ? (isRelevant ? 1 : 0.1) : 1;
                                        if (isGhost) opacity *= 0.6; // Reduced opacity for ghosts

                                        const scale = highlightedStage && isRelevant ? 1.2 : 1;

                                        const r = isFocused || isSelected ? 8 : 6;
                                        const strokeDash = isGhost ? "3 2" : "none"; // Dotted outline for ghosts

                                        return (
                                            <g
                                                key={node.id}
                                                transform={`translate(${node.x},${node.y}) scale(${scale})`}
                                                onMouseDown={(e) => handleMouseDown(e, node)}
                                                onMouseEnter={(e) => handleNodeHover(e, actor)}
                                                onMouseLeave={() => setHoveredNode(null)}
                                                // Stop propagation on clicks to avoid pan start
                                                onClick={(e) => { e.stopPropagation(); setFocusedNodeId(isFocused ? null : actor.id); }}
                                                className="group cursor-pointer"
                                                style={{ transition: 'transform 0.2s ease-out, opacity 0.2s ease-out', opacity }}
                                            >
                                                {/* Shape Render Logic */}
                                                {/* Selection Halo */}
                                                {isSelected && (
                                                    getActorShape(actor.type) === 'square' ? (
                                                        <rect x={-r - 4} y={-r - 4} width={(r + 4) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
                                                    ) : getActorShape(actor.type) === 'triangle' ? (
                                                        <polygon points={`0,${-r - 6} ${r + 6},${r + 4} ${-r - 6},${r + 4}`} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
                                                    ) : getActorShape(actor.type) === 'rect' ? (
                                                        <rect x={-(r + 6)} y={-(r + 4)} width={(r + 6) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
                                                    ) : (
                                                        <circle r={r + 4} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
                                                    )
                                                )}

                                                {/* Main Node Body */}
                                                {getActorShape(actor.type) === 'square' ? (
                                                    <rect
                                                        x={-r} y={-r} width={r * 2} height={r * 2}
                                                        fill={isGhost ? "white" : color} // Hollow/White fill for ghost
                                                        className="drop-shadow-sm transition-all duration-200"
                                                        stroke={color}
                                                        strokeWidth={1.5}
                                                        strokeDasharray={strokeDash}
                                                    />
                                                ) : getActorShape(actor.type) === 'triangle' ? (
                                                    <polygon
                                                        points={`0,${-r - 2} ${r + 2},${r + 2} ${-r - 2},${r + 2}`}
                                                        fill={isGhost ? "white" : color}
                                                        className="drop-shadow-sm transition-all duration-200"
                                                        stroke={color}
                                                        strokeWidth={1.5}
                                                        strokeDasharray={strokeDash}
                                                    />
                                                ) : getActorShape(actor.type) === 'rect' ? (
                                                    <rect
                                                        x={-(r + 2)} y={-r} width={(r + 2) * 2} height={r * 2}
                                                        fill={isGhost ? "white" : color}
                                                        className="drop-shadow-sm transition-all duration-200"
                                                        stroke={color}
                                                        strokeWidth={1.5}
                                                        strokeDasharray={strokeDash}
                                                    />
                                                ) : (
                                                    <circle
                                                        r={r}
                                                        fill={isGhost ? "white" : color}
                                                        className="drop-shadow-sm transition-all duration-200"
                                                        stroke={color}
                                                        strokeWidth={1.5}
                                                        strokeDasharray={strokeDash}
                                                    />
                                                )}

                                                <foreignObject x="8" y="-10" width="150" height="24" className="overflow-visible pointer-events-none">
                                                    <div className={`
                flex items-center px-1.5 py-0.5 rounded-sm bg-slate-100/90 border border-slate-200 backdrop-blur-[1px]
                transform transition-opacity duration-200
                ${(focusedNodeId && !isFocused) || (highlightedStage && !isRelevant) ? "opacity-20" : "opacity-100"}
            `}>
                                                        <span className={`text-[10px] whitespace-nowrap font-medium leading-none ${isGhost ? "text-slate-400 italic" : "text-slate-700"}`}>
                                                            {actor.name} {isGhost && "(Missing)"}
                                                        </span>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        );
                                    })}
                                </g>
                            </svg>

                            {/* HOVER TOOLTIP */}
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

                            {/* NEW INSET PROCESS VIEW */}
                            {isNestedMode && (
                                <div className="animate-in slide-in-from-bottom-5 duration-700">
                                    <TranslationChain
                                        actors={actors}
                                        onHoverStage={setHighlightedStage}
                                    />
                                </div>
                            )}

                            {/* Floating Legend Card (Existing) */}
                            {isLegendOpen && (
                                /* ... (Legend Content remains) ... */
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm p-3 w-48 text-xs z-10 max-h-[600px] overflow-y-auto">
                                    {/* ... logic ... */}
                                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                                        <span className="font-semibold text-slate-800">Actor Types</span>
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
                                    {configurations.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-slate-100">
                                            <p className="font-semibold text-slate-800 mb-2">Macro Assemblages</p>
                                            <div className="space-y-1.5">
                                                {configurations.map(config => (
                                                    <div key={config.id} className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-sm shadow-sm ring-1 ring-black/5 opacity-80"
                                                            style={{ backgroundColor: config.color }}
                                                        />
                                                        <span className="text-slate-600 truncate">{config.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nested Map Legend Addition */}
                                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                                        <p className="mb-1"><span className="font-bold">─</span> Strong Ties</p>
                                        <p><span className="font-bold">- -</span> Absent / Virtual (Ghost)</p>
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
                        </>
                    )}

                    {/* Legal Stratum Legend - Visible in Stratum Mode */}
                    {is3DMode && isStratumMode && <StratumLegend />}

                    {/* Simple View Type Legend - Visible in Standard 3D Mode */}
                    {is3DMode && !isStratumMode && <ViewTypeLegend />}
                </CardContent>
            </Card >
        </div >
    );
}
