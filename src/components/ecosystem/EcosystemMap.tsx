import React, { useRef, useState, useMemo } from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, MousePointer2, BoxSelect, Layers, Landmark, Users, Rocket, GraduationCap, Server, Database, Cpu, FileCode, Eye, EyeOff, Filter, X } from 'lucide-react';
import { ScenarioId, applyScenario } from '@/lib/scenario-engine';
import { generateEdges } from '@/lib/graph-utils';

interface EcosystemMapProps {
    actors: EcosystemActor[];
    configurations: EcosystemConfiguration[];
    positions: Record<string, { x: number, y: number }>;
    interactionMode: "drag" | "select";
    setInteractionMode: (mode: "drag" | "select") => void;
    selectedForGrouping: string[];
    onToggleSelection: (actorId: string) => void;
    onCreateConfiguration: () => void;
    onActorDrag: (actorId: string, x: number, y: number) => void;
    onConfigDrag: (configId: string, dx: number, dy: number) => void;
    activeLayers?: Record<string, boolean>;
    toggleLayer?: (layer: string) => void;
    activeLens?: "None" | "Market" | "Critical" | "Infrastructure" | "Decolonial";
    activeScenario?: ScenarioId;
    colorMode?: "type" | "epistemic";
}

export function EcosystemMap({
    actors,
    configurations,
    positions,
    interactionMode,
    setInteractionMode,
    selectedForGrouping,
    onToggleSelection,
    onCreateConfiguration,
    onActorDrag,
    onConfigDrag,
    activeLayers = {},
    toggleLayer = () => { },
    activeLens = "None",
    activeScenario = "None",
    colorMode = "type"
}: EcosystemMapProps) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [draggingConfigId, setDraggingConfigId] = useState<string | null>(null);
    const dragStartRef = useRef<{ mouse: { x: number, y: number } } | null>(null);
    const isDraggingRef = useRef(false);

    // Hermeneutic Instrument State
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Compute edge multipliers for scenarios
    const { edgeMultipliers } = useMemo(() => {
        const edges = generateEdges(actors);
        return applyScenario(actors, edges, activeScenario);
    }, [actors, activeScenario]);

    const getNeighbors = (actorId: string) => {
        const neighbors = new Set<string>();
        actors.forEach((source, i) => {
            actors.slice(i + 1).forEach(target => {
                // Check if connected (reusing connection logic would be better but for now let's just check if they *would* be connected or just assume all are potential?)
                // We need the actual edges.
                // Let's use the same logic as the render loop.
                // Actually, traversing the `actors` array is inefficient.
                // But for < 50 actors it's fine.
                const shouldConnect = (
                    (source.type === "Policymaker" && target.type === "Civil Society") ||
                    (source.type === "Startup" && target.type === "Academic") ||
                    (source.type === "Policymaker" && target.type === "Startup") ||
                    (source.type === "Civil Society" && target.type === "Academic") ||
                    (source.type === "Infrastructure" && target.type === "Startup") ||
                    (source.type === "Infrastructure" && target.type === "Policymaker") ||
                    (source.type === "Infrastructure" && target.type === "Academic") ||
                    (source.type === "Startup" && target.type === "Algorithm") ||
                    (source.type === "Academic" && target.type === "Algorithm") ||
                    (source.type === "Algorithm" && target.type === "Dataset") ||
                    (source.type === "Policymaker" && target.type === "Algorithm") ||
                    (source.type === "Infrastructure" && target.type === "Algorithm") ||
                    (source.type === "Infrastructure" && target.type === "Dataset")
                );

                if (shouldConnect) {
                    if (source.id === actorId) neighbors.add(target.id);
                    if (target.id === actorId) neighbors.add(source.id);
                }
            });
        });
        return neighbors;
    };

    const handleMouseDown = (e: React.MouseEvent, actorId: string) => {
        e.stopPropagation();
        e.preventDefault();
        isDraggingRef.current = false;

        if (interactionMode === "drag") {
            setDraggingId(actorId);
        } else if (interactionMode === "select") {
            onToggleSelection(actorId);
        }
    };

    const handleConfigMouseDown = (e: React.MouseEvent, configId: string) => {
        if (interactionMode !== "drag") return;
        e.stopPropagation();
        e.preventDefault();

        const svg = (e.target as Element).closest('svg');
        if (!svg) return;

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        dragStartRef.current = { mouse: { x: svgP.x, y: svgP.y } };
        setDraggingConfigId(configId);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interactionMode !== "drag") return;
        if (!draggingId && !draggingConfigId) return;

        isDraggingRef.current = true;

        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        if (draggingId) {
            onActorDrag(draggingId, svgP.x, svgP.y);
        } else if (draggingConfigId && dragStartRef.current) {
            const dx = svgP.x - dragStartRef.current.mouse.x;
            const dy = svgP.y - dragStartRef.current.mouse.y;

            // Update start ref for next delta
            dragStartRef.current = { mouse: { x: svgP.x, y: svgP.y } };

            onConfigDrag(draggingConfigId, dx, dy);
        }
    };

    const handleActorClick = (e: React.MouseEvent, actorId: string) => {
        e.stopPropagation();
        if (interactionMode === "drag" && !isDraggingRef.current) {
            if (focusedNodeId === actorId) {
                setFocusedNodeId(null);
            } else {
                setFocusedNodeId(actorId);
            }
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        setDraggingConfigId(null);
        dragStartRef.current = null;
    };

    // Convex Hull Algorithm
    const getConvexHull = (points: { x: number, y: number }[]) => {
        if (points.length < 3) return points;
        points.sort((a, b) => a.x - b.x || a.y - b.y);

        const cross = (o: { x: number, y: number }, a: { x: number, y: number }, b: { x: number, y: number }) => {
            return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        };

        const lower = [];
        for (let i = 0; i < points.length; i++) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
                lower.pop();
            }
            lower.push(points[i]);
        }

        const upper = [];
        for (let i = points.length - 1; i >= 0; i--) {
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
                upper.pop();
            }
            upper.push(points[i]);
        }

        upper.pop();
        lower.pop();
        return lower.concat(upper);
    };

    const renderConfigurationShapes = () => {
        return configurations.map(config => {
            const memberPoints = config.memberIds
                .map(id => positions[id])
                .filter(p => p !== undefined);

            if (memberPoints.length < 2) return null;

            let pathData = "";
            let centroid = { x: 0, y: 0 };

            if (memberPoints.length === 2) {
                pathData = `M ${memberPoints[0].x} ${memberPoints[0].y} L ${memberPoints[1].x} ${memberPoints[1].y}`;
                centroid = {
                    x: (memberPoints[0].x + memberPoints[1].x) / 2,
                    y: (memberPoints[0].y + memberPoints[1].y) / 2
                };
            } else {
                const hull = getConvexHull(memberPoints);
                pathData = `M ${hull.map(p => `${p.x},${p.y}`).join(" L ")} Z`;
                centroid = hull.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                centroid.x /= hull.length;
                centroid.y /= hull.length;
            }

            return (
                <g
                    key={config.id}
                    onMouseDown={(e) => handleConfigMouseDown(e, config.id)}
                    className={interactionMode === "drag" ? "cursor-grab active:cursor-grabbing" : ""}
                    style={{ pointerEvents: 'all' }}
                >
                    <path
                        d={pathData}
                        fill={memberPoints.length > 2 ? config.color : "none"}
                        stroke={config.color}
                        strokeWidth={memberPoints.length > 2 ? "40" : "60"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.4"
                        className="transition-all duration-300"
                    />
                    <text
                        x={centroid.x}
                        y={centroid.y}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize="12"
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                    >
                        {config.name}
                    </text>
                </g>
            );
        });
    };

    const getActorIcon = (type: string) => {
        switch (type) {
            case "Policymaker": return Landmark;
            case "Civil Society": return Users;
            case "Startup": return Rocket;
            case "Academic": return GraduationCap;
            case "Infrastructure": return Server;
            case "Algorithm": return Cpu;
            case "Dataset": return Database;
            default: return FileCode;
        }
    };

    const getActorColorByType = (type: string) => {
        switch (type) {
            case "Policymaker": return { fill: "#e0f2fe", stroke: "#0284c7" }; // Sky
            case "Civil Society": return { fill: "#fef9c3", stroke: "#ca8a04" }; // Yellow
            case "Startup": return { fill: "#f3e8ff", stroke: "#9333ea" }; // Purple
            case "Academic": return { fill: "#dbeafe", stroke: "#2563eb" }; // Blue
            case "Infrastructure": return { fill: "#f1f5f9", stroke: "#475569" }; // Slate
            case "Algorithm": return { fill: "#fee2e2", stroke: "#dc2626" }; // Red
            case "Dataset": return { fill: "#dcfce7", stroke: "#16a34a" }; // Green
            default: return { fill: "#ffffff", stroke: "#94a3b8" };
        }
    };

    const getLinkDetails = (sourceType: string, targetType: string) => {
        if (sourceType === "Policymaker" && targetType === "Startup") return { label: "Regulates", description: "Imposes legal boundaries and compliance costs." };
        if (sourceType === "Policymaker" && targetType === "Civil Society") return { label: "Excludes", description: "Often marginalizes from decision-making loops." };
        if (sourceType === "Information" && targetType === "Policymaker") return { label: "Informs", description: "Provides epistemic basis for policy." };

        if (sourceType === "Startup" && targetType === "Academic") return { label: "Enables", description: "Provides tools or data for research." };
        if (sourceType === "Infrastructure" && targetType === "Startup") return { label: "Enables", description: "Provides computational substrate for operations." };
        if (sourceType === "Startup" && targetType === "Algorithm") return { label: "Delegates", description: "Offloads decision-making authority to code." };

        if (sourceType === "Algorithm" && targetType === "Dataset") return { label: "Extracts", description: "Mines patterns from raw data, often without consent." };
        if (sourceType === "Infrastructure" && targetType === "Dataset") return { label: "Extracts", description: "Accumulates data capital from interactions." };

        if (sourceType === "Academic" && targetType === "Algorithm") return { label: "Audits", description: "Critically examines algorithmic outputs." };

        return { label: "Relates To", description: "Generic connection." };
    };

    // Lens Filtering Logic
    const isActorRelevant = (actorSpec: EcosystemActor) => {
        if (activeLens === "None") return true;
        if (activeLens === "Market") return ["Policymaker", "Startup"].includes(actorSpec.type);
        if (activeLens === "Critical") return ["Civil Society", "Academic"].includes(actorSpec.type);
        if (activeLens === "Infrastructure") return ["Infrastructure", "Algorithm", "Dataset"].includes(actorSpec.type);
        return true;
    };

    // Memoize neighbors of the focused node
    const activeNeighbors = useMemo(() => {
        if (!focusedNodeId) return new Set<string>();
        return getNeighbors(focusedNodeId);
    }, [focusedNodeId, actors]); // actors dependency needed as getNeighbors depends on it (implicitly via closure, but safe here)

    return (
        <Card className="min-h-[400px] flex flex-col">
            <CardHeader className="z-10 relative pb-2">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-indigo-600" />
                            <CardTitle>Social Network Graph</CardTitle>
                        </div>

                        {/* Interaction Controls */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <Button
                                    variant={interactionMode === "drag" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => setInteractionMode("drag")}
                                >
                                    <MousePointer2 className="h-3 w-3 mr-1" />
                                    Drag
                                </Button>
                                <Button
                                    variant={interactionMode === "select" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => setInteractionMode("select")}
                                >
                                    <BoxSelect className="h-3 w-3 mr-1" />
                                    Select
                                </Button>
                            </div>
                            {interactionMode === "select" && selectedForGrouping.length > 0 && (
                                <Button
                                    size="sm"
                                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                    onClick={onCreateConfiguration}
                                >
                                    <Layers className="h-3 w-3 mr-1" />
                                    Group ({selectedForGrouping.length})
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Hermeneutic Controls (Filters & Focus) */}
                    <div className="flex items-center justify-between border-t pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <Filter className="h-3 w-3" />
                                Concept Filters:
                            </span>
                            <div className="flex gap-1">
                                {["Market", "State", "Civil", "Infra"].map(filter => (
                                    <Button
                                        key={filter}
                                        variant={activeFilter === filter ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                                        className={`h-6 text-[10px] px-2 ${activeFilter === filter ? "bg-slate-700 text-white" : "text-slate-600"}`}
                                    >
                                        {filter}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {focusedNodeId && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setFocusedNodeId(null)}
                                className="h-6 text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-200"
                            >
                                <EyeOff className="h-3 w-3 mr-1" />
                                Clear Focus
                            </Button>
                        )}
                    </div>
                </div>
                <CardDescription className="mt-2">
                    {focusedNodeId ? (
                        <span className="text-amber-700 font-medium">Focus Mode Active: Viewing local assemblage. Click "Clear Focus" to reset.</span>
                    ) : (
                        "Click nodes to Focus. Use filters to highlight specific logics."
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 bg-slate-50/50 p-6 border-t relative">
                <svg
                    width="100%"
                    height="400"
                    className={`border rounded-lg bg-white transition-colors duration-300 ${interactionMode === "drag" ? "cursor-move border-slate-200" : "cursor-pointer border-indigo-400 ring-2 ring-indigo-100"}`}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <defs>
                        <marker id="actor-arrow" markerWidth="8" markerHeight="8" refX="20" refY="4" orient="auto">
                            <polygon points="0 0, 8 4, 0 8" fill="#94a3b8" />
                        </marker>
                        <filter id="actor-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="resistance-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feFlood floodColor="#ef4444" floodOpacity="0.6" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="shadow" />
                            <feComposite in="SourceGraphic" in2="shadow" operator="over" />
                        </filter>
                    </defs>

                    {/* Render Configuration Super-Nodes (Background) */}
                    {renderConfigurationShapes()}

                    {/* Generate connections based on actor types */}
                    {/* Connections */}
                    {actors.map((source, i) =>
                        actors.slice(i + 1).map((target, j) => {
                            const shouldConnect = (
                                (source.type === "Policymaker" && target.type === "Civil Society") ||
                                (source.type === "Startup" && target.type === "Academic") ||
                                (source.type === "Policymaker" && target.type === "Startup") ||
                                (source.type === "Civil Society" && target.type === "Academic") ||
                                (source.type === "Infrastructure" && target.type === "Startup") ||
                                (source.type === "Infrastructure" && target.type === "Policymaker") ||
                                (source.type === "Infrastructure" && target.type === "Academic") ||
                                // Algorithm connections
                                (source.type === "Startup" && target.type === "Algorithm") ||
                                (source.type === "Academic" && target.type === "Algorithm") ||
                                (source.type === "Algorithm" && target.type === "Dataset") ||
                                (source.type === "Policymaker" && target.type === "Algorithm") ||
                                (source.type === "Infrastructure" && target.type === "Algorithm") ||
                                (source.type === "Infrastructure" && target.type === "Dataset")
                            );

                            if (!shouldConnect) return null;

                            const pos1 = positions[source.id];
                            const pos2 = positions[target.id];

                            if (!pos1 || !pos2) return null;

                            const { label, description } = getLinkDetails(source.type, target.type);
                            const midX = (pos1.x + pos2.x) / 2;
                            const midY = (pos1.y + pos2.y) / 2;

                            // Resistance Layer Logic
                            const isResistanceLayer = activeLayers['resistance'];
                            const sourceRes = source.metrics?.resistance || 0;
                            const targetRes = target.metrics?.resistance || 0;

                            // Solidarity: Two resistant actors connecting (Alliance)
                            const isSolidarity = isResistanceLayer && sourceRes > 6 && targetRes > 6;

                            // Friction: Resistant actor connecting to status quo (Conflict)
                            const isFriction = isResistanceLayer && (
                                (sourceRes > 6 && targetRes < 4) ||
                                (sourceRes < 4 && targetRes > 6)
                            );

                            const lineColor = isSolidarity ? "#9333ea" : (isFriction ? "#ef4444" : "#cbd5e1");
                            const lineWidth = (isSolidarity || isFriction) ? "2" : "1";
                            const lineDash = isFriction ? "2,2" : "4"; // Solidarity is solid
                            const lineClass = isFriction ? "animate-pulse" : "";

                            const isSourceRel = isActorRelevant(source);
                            const isTargetRel = isActorRelevant(target);

                            // -------------------------
                            // VISIBILITY LOGIC (Focus & Filter)
                            // -------------------------
                            let opacity = 1;

                            // 1. Focus Mode
                            if (focusedNodeId) {
                                const isSourceFocused = source.id === focusedNodeId || activeNeighbors.has(source.id);
                                const isTargetFocused = target.id === focusedNodeId || activeNeighbors.has(target.id);

                                // Show edge only if BOTH are part of the focus group
                                if (!isSourceFocused || !isTargetFocused) {
                                    opacity = 0.05;
                                }
                            }

                            // 2. Filter Mode
                            if (activeFilter && opacity > 0.05) {
                                // Simple mapping for demo
                                const isSourceMatch =
                                    (activeFilter === "Market" && ["Startup", "Policymaker"].includes(source.type)) ||
                                    (activeFilter === "State" && ["Policymaker", "Infrastructure"].includes(source.type)) ||
                                    (activeFilter === "Civil" && ["Civil Society", "Academic"].includes(source.type)) ||
                                    (activeFilter === "Infra" && ["Infrastructure", "Algorithm", "Dataset"].includes(source.type));

                                const isTargetMatch =
                                    (activeFilter === "Market" && ["Startup", "Policymaker"].includes(target.type)) ||
                                    (activeFilter === "State" && ["Policymaker", "Infrastructure"].includes(target.type)) ||
                                    (activeFilter === "Civil" && ["Civil Society", "Academic"].includes(target.type)) ||
                                    (activeFilter === "Infra" && ["Infrastructure", "Algorithm", "Dataset"].includes(target.type));

                                if (!isSourceMatch && !isTargetMatch) {
                                    opacity = 0.1;
                                }
                            }

                            // 3. Lens Mode
                            if (activeLens && activeLens !== "None" && opacity > 0.05) {
                                if (!isSourceRel || !isTargetRel) {
                                    opacity = 0.05;
                                }
                            }

                            return (
                                <g key={`${source.id}-${target.id}`} className="group hover:opacity-100 transition-opacity cursor-help" style={{ opacity }}>
                                    <title>{label}: {description}</title>
                                    <line
                                        x1={pos1.x}
                                        y1={pos1.y}
                                        x2={pos2.x}
                                        y2={pos2.y}
                                        stroke={lineColor}
                                        strokeWidth={lineWidth}
                                        strokeDasharray={lineDash}
                                        className={lineClass}
                                    />
                                    <rect
                                        x={midX - (label.length * 3)}
                                        y={midY - 8}
                                        width={label.length * 6}
                                        height="16"
                                        fill="white"
                                        opacity="0.9"
                                        rx="4"
                                        className="stroke-slate-200"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={midX}
                                        y={midY + 3}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill="#475569"
                                        className="select-none pointer-events-none font-bold uppercase tracking-wider"
                                    >
                                        {label}
                                    </text>
                                </g>
                            );
                        })
                    )}

                    {/* Render Actors */}
                    {actors.map(actor => {
                        const pos = positions[actor.id];
                        if (!pos) return null;

                        const isSelected = selectedForGrouping.includes(actor.id);
                        const Icon = getActorIcon(actor.type);

                        // COLOR LOGIC
                        let actorFill = "white";
                        let actorStroke = "#94a3b8";

                        if (isSelected) {
                            actorFill = "#4f46e5";
                            actorStroke = "#4f46e5";
                        } else if (colorMode === "epistemic") {
                            // Epistemic / Decolonial Coloring
                            if (actor.region === "Global North") {
                                actorFill = "#dbeafe"; // Blue 100
                                actorStroke = "#2563eb"; // Blue 600
                            } else if (actor.region === "Global South") {
                                actorFill = "#d1fae5"; // Emerald 100
                                actorStroke = "#059669"; // Emerald 600
                            } else if (actor.region === "International") {
                                actorFill = "#f3e8ff"; // Purple 100
                                actorStroke = "#9333ea"; // Purple 600
                            } else {
                                actorFill = "#f1f5f9"; // Slate 100
                                actorStroke = "#94a3b8";
                            }
                        } else {
                            // Type Coloring (Default)
                            const colors = getActorColorByType(actor.type);
                            actorFill = colors.fill;
                            actorStroke = colors.stroke;
                        }

                        // -------------------------
                        // VISIBILITY LOGIC (Focus & Filter)
                        // -------------------------
                        let opacity = 1;

                        // 1. Focus Mode
                        if (focusedNodeId) {
                            if (actor.id !== focusedNodeId && !activeNeighbors.has(actor.id)) {
                                opacity = 0.1;
                            }
                        }

                        // 2. Filter Mode
                        if (activeFilter && opacity > 0.1) {
                            const isMatch =
                                (activeFilter === "Market" && ["Startup", "Policymaker"].includes(actor.type)) ||
                                (activeFilter === "State" && ["Policymaker", "Infrastructure"].includes(actor.type)) ||
                                (activeFilter === "Civil" && ["Civil Society", "Academic"].includes(actor.type)) ||
                                (activeFilter === "Infra" && ["Infrastructure", "Algorithm", "Dataset"].includes(actor.type));

                            if (!isMatch) opacity = 0.2;
                        }

                        // 3. Lens Mode
                        if (activeLens && activeLens !== "None" && opacity > 0.1) {
                            if (!isActorRelevant(actor)) {
                                opacity = 0.1;
                            }
                        }


                        // Resistance Layer Visuals
                        const resistanceScore = actor.metrics?.resistance || 0;
                        const isResistanceActive = activeLayers['resistance'];
                        const showResistance = isResistanceActive && resistanceScore > 5;

                        return (
                            <g
                                key={actor.id}
                                transform={`translate(${pos.x},${pos.y})`}
                                onMouseDown={(e) => handleMouseDown(e, actor.id)}
                                onClick={(e) => handleActorClick(e, actor.id)}
                                className="cursor-pointer transition-all duration-200"
                                style={{
                                    filter: isSelected ? "url(#actor-glow)" : (showResistance ? "url(#resistance-glow)" : "none"),
                                    opacity
                                }}
                            >
                                {/* Resistance Indicator Ring */}
                                {showResistance && (
                                    <circle
                                        r={30 + (resistanceScore * 2)}
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="1"
                                        opacity="0.5"
                                        strokeDasharray="4 4"
                                        className="animate-spin-slow"
                                    />
                                )}

                                <circle
                                    r={isSelected || focusedNodeId === actor.id ? 28 : 24}
                                    fill={showResistance ? "#fee2e2" : actorFill}
                                    stroke={showResistance ? "#ef4444" : actorStroke}
                                    strokeWidth={showResistance || focusedNodeId === actor.id ? "3" : "2"}
                                    className="transition-all duration-300 shadow-sm"
                                />
                                <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                                    <div className={`flex items-center justify-center w-full h-full ${isSelected ? "text-white" : (showResistance ? "text-red-700" : (actorFill === 'white' || actorFill === '#ffffff' ? "text-slate-600" : "text-slate-800"))}`}>
                                        <Icon size={16} />
                                    </div>
                                </foreignObject>
                                <foreignObject x="-40" y="28" width="80" height="40">
                                    <div className="text-center text-[10px] font-medium text-slate-700 leading-tight line-clamp-2 bg-white/80 px-1 rounded">
                                        {actor.name}
                                    </div>
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>

                {activeLayers['resistance'] && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg text-xs space-y-2 z-10 w-52 pointer-events-none select-none">
                        <div className="font-semibold text-slate-900 border-b pb-1 mb-1 flex items-center justify-between">
                            <span>Entangled Analysis</span>
                            <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">Active</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 w-3 h-3 shrink-0 rounded-full border border-red-500 bg-red-100 ring-2 ring-red-200/50 animate-pulse"></div>
                                <div>
                                    <span className="block font-medium text-slate-900">Line of Flight</span>
                                    <span className="text-[10px] text-slate-500 leading-tight block">High resistance (&gt;5). Disrupts established norms.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1.5 w-4 h-0 shrink-0 border-t-2 border-dashed border-red-500"></div>
                                <div>
                                    <span className="block font-medium text-slate-900">Friction</span>
                                    <span className="text-[10px] text-slate-500 leading-tight block">Tension between resistant & status quo actors.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-2 w-4 h-0.5 shrink-0 bg-purple-600"></div>
                                <div>
                                    <span className="block font-medium text-slate-900">Solidarity</span>
                                    <span className="text-[10px] text-slate-500 leading-tight block">Alliance between high resistance actors.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(colorMode === "type" || !colorMode) && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg text-xs space-y-1 z-10 w-36 pointer-events-none select-none">
                        <div className="font-semibold text-slate-900 border-b pb-1 mb-1">Actor Legend</div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-100 border border-sky-600"></span> Policymaker
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-100 border border-yellow-600"></span> Civil Society
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-100 border border-purple-600"></span> Startup
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-100 border border-blue-600"></span> Academic
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-100 border border-slate-600"></span> Infrastructure
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-100 border border-red-600"></span> Algorithm
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-100 border border-green-600"></span> Dataset
                        </div>
                    </div>
                )}

                {colorMode === "epistemic" && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg text-xs space-y-2 z-10 w-44 pointer-events-none select-none">
                        <div className="font-semibold text-slate-900 border-b pb-1 mb-1">Epistemic Map</div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-600"></span> Global North
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-600"></span> Global South
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-100 border border-purple-600"></span> International
                        </div>
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
