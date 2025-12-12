import React, { useRef, useState } from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, MousePointer2, BoxSelect, Layers, Landmark, Users, Rocket, GraduationCap, Server, Database, Cpu, FileCode } from 'lucide-react';

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
    toggleLayer = () => { }
}: EcosystemMapProps) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [draggingConfigId, setDraggingConfigId] = useState<string | null>(null);
    const dragStartRef = useRef<{ mouse: { x: number, y: number } } | null>(null);

    const handleMouseDown = (e: React.MouseEvent, actorId: string) => {
        e.stopPropagation();
        e.preventDefault();

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

    const getLinkLabel = (sourceType: string, targetType: string) => {
        if (sourceType === "Policymaker" && targetType === "Civil Society") return "Consults";
        if (sourceType === "Startup" && targetType === "Academic") return "Collaborates";
        if (sourceType === "Policymaker" && targetType === "Startup") return "Regulates";
        if (sourceType === "Civil Society" && targetType === "Academic") return "Studies";
        if (sourceType === "Infrastructure" && targetType === "Startup") return "Supports";
        if (sourceType === "Infrastructure" && targetType === "Policymaker") return "Informs";
        if (sourceType === "Infrastructure" && targetType === "Academic") return "Provides Data";

        // Algorithm connections
        if (sourceType === "Startup" && targetType === "Algorithm") return "Develops";
        if (sourceType === "Academic" && targetType === "Algorithm") return "Audits";
        if (sourceType === "Algorithm" && targetType === "Dataset") return "Trained On";
        if (sourceType === "Policymaker" && targetType === "Algorithm") return "Governs";
        if (sourceType === "Infrastructure" && targetType === "Algorithm") return "Hosts";
        if (sourceType === "Infrastructure" && targetType === "Dataset") return "Stores";

        return "Relates To";
    };

    return (
        <Card className="min-h-[400px] flex flex-col">
            <CardHeader className="z-10 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-indigo-600" />
                        <CardTitle>Social Network Graph</CardTitle>
                    </div>

                    {/* Layer Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeLayers['resistance'] ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => toggleLayer('resistance')}
                            className="h-7 text-xs gap-1 transition-all"
                        >
                            <span className={`block w-2 h-2 rounded-full mr-2 ${activeLayers['resistance'] ? 'bg-white' : 'bg-red-500'}`} />
                            Resistance Layer
                        </Button>
                    </div>

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
                <CardDescription>
                    Visualizing ties between actors. Switch to <strong>Select Mode</strong> and <strong>click nodes</strong> to group them.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 bg-slate-50/50 p-6 border-t relative">
                <svg
                    width="100%"
                    height="400"
                    className={`border rounded-lg bg-white transition-colors duration-300 ${interactionMode === "drag" ? "cursor-move border-slate-200" : "cursor-crosshair border-indigo-400 ring-2 ring-indigo-100"}`}
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

                            const label = getLinkLabel(source.type, target.type);
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

                            return (
                                <g key={`${source.id}-${target.id}`}>
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
                                        opacity="0.8"
                                        rx="4"
                                    />
                                    <text
                                        x={midX}
                                        y={midY + 3}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill="#64748b"
                                        className="select-none pointer-events-none font-medium"
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

                        // Resistance Layer Visuals
                        const resistanceScore = actor.metrics?.resistance || 0;
                        const isResistanceActive = activeLayers['resistance'];
                        const showResistance = isResistanceActive && resistanceScore > 5;

                        return (
                            <g
                                key={actor.id}
                                transform={`translate(${pos.x},${pos.y})`}
                                onMouseDown={(e) => handleMouseDown(e, actor.id)}
                                className="cursor-pointer transition-all duration-200"
                                style={{
                                    filter: isSelected ? "url(#actor-glow)" : (showResistance ? "url(#resistance-glow)" : "none")
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
                                    r={isSelected ? 28 : 24}
                                    fill={isSelected ? "#4f46e5" : (showResistance ? "#fee2e2" : "white")}
                                    stroke={isSelected ? "#4f46e5" : (showResistance ? "#ef4444" : "#94a3b8")}
                                    strokeWidth={showResistance ? "2" : "2"}
                                    className="transition-all duration-300 shadow-sm"
                                />
                                <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                                    <div className={`flex items-center justify-center w-full h-full ${isSelected ? "text-white" : (showResistance ? "text-red-700" : "text-slate-600")}`}>
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
            </CardContent>
        </Card>
    );
}
