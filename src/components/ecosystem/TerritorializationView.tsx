import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import { Slider } from "@/components/ui/slider";
import { HelpTooltip } from "@/components/help/HelpTooltip";

import { SimulationNode } from '@/hooks/useForceGraph';
import { TerritorializationActor, TerritorializationData } from '@/types/ecosystem-simulation';
import { useSimulationCache } from '@/hooks/useSimulationCache';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    type: string;
    visualType: "Core" | "Network";
    value: number;
    color: string;
    originalRadius: number;
}

export function TerritorializationView({ isExpanded, nodes: inputNodes }: { isExpanded: boolean; nodes: SimulationNode[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [gravity, setGravity] = useState(0.2);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

    const {
        data: simulationData,
        isLoading,
        error,
        isCached,
        isMapChanged,
        fetchSimulation
    } = useSimulationCache<TerritorializationData>({
        endpoint: '/api/simulation/territorialization',
        inputNodes,
        isExpanded
    });

    const [viewMode, setViewMode] = useState<'force' | 'rings'>('force');
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

        const { width, height } = dimensions;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .html("");

        const validNodes = inputNodes.filter(n => !n.isHidden);

        const getActorClassification = (actorId: string) => {
            if (!simulationData?.actors) return null;
            return simulationData.actors.find((a: TerritorializationActor) => a.id === actorId);
        };

        const getVisualType = (classification: string | null): "Core" | "Network" => {
            if (!classification) return Math.random() < 0.4 ? "Core" : "Network";

            if (classification === 'highly_stabilized' || classification === 'stabilized') {
                return "Core";
            } else {
                return "Network";
            }
        };

        const simulationNodes: Node[] = validNodes.length > 0 ? validNodes.map(n => {
            const aiData = getActorClassification(n.id);
            const classification = aiData?.classification || null;

            return {
                id: n.id,
                name: n.name,
                type: n.type,
                visualType: getVisualType(classification),
                value: n.radius,
                color: "#94a3b8",
                originalRadius: n.radius,
                x: width / 2 + (Math.random() - 0.5) * 100,
                y: height / 2 + (Math.random() - 0.5) * 100
            };
        }) : Array.from({ length: 60 }, (_, i) => ({
            id: `dummy-${i}`,
            name: `Actor ${i}`,
            type: "Dummy",
            visualType: Math.random() < 0.4 ? "Core" : "Network",
            value: 10 + Math.random() * 20,
            color: "#94a3b8",
            originalRadius: 15
        })) as unknown as Node[];

        let simulation: d3.Simulation<Node, undefined>;

        const dragBehavior = d3.drag<SVGGElement, Node>()
            .on("start", (event: d3.D3DragEvent<SVGGElement, Node, Node>) => {
                if (!event.active && viewMode === 'force') simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
                d3.select(event.sourceEvent.target).attr("stroke", "#fff").attr("stroke-width", 3);
            })
            .on("drag", (event: d3.D3DragEvent<SVGGElement, Node, Node>) => {
                event.subject.fx = event.x;
                event.subject.fy = event.y;

                if (viewMode === 'rings') {
                    d3.select((event.sourceEvent.target as Element).parentNode as SVGGElement)
                        .attr("transform", `translate(${event.x},${event.y})`);
                }
            })
            .on("end", (event: d3.D3DragEvent<SVGGElement, Node, Node>) => {
                if (!event.active && viewMode === 'force') simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;

                if (viewMode === 'force') {
                    const node = event.subject;
                    const isCaptured = (node.x || 0) < width * 0.5;

                    if (isCaptured) {
                        node.visualType = "Core";
                    } else {
                        node.visualType = "Network";
                    }

                    simulation.alpha(0.5).restart();
                }
                d3.select(event.sourceEvent.target).attr("stroke", "#fff").attr("stroke-width", 1.5);
            });

        const nodeGroup = svg.append("g")
            .selectAll<SVGGElement, Node>("g")
            .data(simulationNodes)
            .join("g")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .call(dragBehavior as any) // Still needed due to D3's complex generics on selections
            .on("mouseover", (event: React.MouseEvent, d: Node) => {
                setHoveredNode(d);
                d3.select(event.currentTarget as SVGGElement).select("circle")
                    .attr("stroke", "#6366f1")
                    .attr("stroke-width", 3)
                    .attr("filter", "drop-shadow(0 0 6px rgb(99 102 241 / 0.5))");
            })
            .on("mouseout", (event: React.MouseEvent) => {
                setHoveredNode(null);
                d3.select(event.currentTarget as SVGGElement).select("circle")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5)
                    .attr("filter", "none");
            });

        const circles = nodeGroup.append("circle")
            .attr("r", (d: Node) => d.value)
            .attr("fill", (d: Node) => d.visualType === "Core" ? "#4f46e5" : "#94a3b8")
            .attr("opacity", 0.9)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("class", "transition-colors duration-500 cursor-grab active:cursor-grabbing shadow-sm");

        if (viewMode === 'force') {
            svg.append("circle")
                .attr("cx", width * 0.33)
                .attr("cy", height / 2)
                .attr("r", Math.min(width, height) * 0.3)
                .attr("fill", "#6366f1")
                .attr("opacity", 0.05)
                .attr("class", "stabilization-field");

            svg.append("text")
                .attr("x", width * 0.33)
                .attr("y", height / 2 - Math.min(width, height) * 0.3 - 10)
                .attr("text-anchor", "middle")
                .attr("class", "text-[10px] font-bold text-indigo-500 uppercase tracking-widest")
                .text("Stabilization Field (Core)");

            svg.append("text")
                .attr("x", width * 0.66)
                .attr("y", height / 2 - Math.min(width, height) * 0.3 - 10)
                .attr("text-anchor", "middle")
                .attr("class", "text-[10px] font-bold text-slate-400 uppercase tracking-widest")
                .text("Loose Network (Periphery)");

            simulation = d3.forceSimulation<Node>(simulationNodes)
                .force("charge", d3.forceManyBody().strength(-15))
                .force("collide", d3.forceCollide<Node>().radius(d => d.value + 4).iterations(2))
                .force("x", d3.forceX<Node>((d) => {
                    return d.visualType === "Core" ? width * 0.33 : width * 0.66;
                }).strength((d) => {
                    const aiData = getActorClassification(d.id);
                    const forceStrength = aiData?.forceStrength;

                    if (forceStrength !== undefined) {
                        return d.visualType === "Core" ? forceStrength * gravity : 0.05;
                    }
                    return d.visualType === "Core" ? gravity : 0.05;
                }))
                .force("y", d3.forceY<Node>(height / 2).strength(0.1));

            simulation.on("tick", () => {
                circles.attr("fill", (d: Node) => {
                    const isCaptured = (d.x || 0) < width * 0.5;
                    return isCaptured ? "#4338ca" : "#cbd5e1";
                });

                nodeGroup.attr("transform", (d: Node) => `translate(${d.x},${d.y})`);
            });
        } else {
            const centerX = width / 2;
            const centerY = height / 2;
            const maxRadius = Math.min(width, height) * 0.45;
            const ringRadii = [
                maxRadius * 0.2,
                maxRadius * 0.4,
                maxRadius * 0.6,
                maxRadius * 0.8,
                maxRadius
            ];
            const ringLabels = [
                { label: "Highly Stabilized", color: "text-indigo-900", hex: "#312e81" },
                { label: "Stabilized", color: "text-indigo-700", hex: "#4338ca" },
                { label: "Marginal", color: "text-indigo-500", hex: "#6366f1" },
                { label: "Peripheral", color: "text-slate-400", hex: "#94a3b8" },
                { label: "Resistant", color: "text-amber-500", hex: "#f59e0b" }
            ];

            ringRadii.forEach((r, i) => {
                svg.append("circle")
                    .attr("cx", centerX)
                    .attr("cy", centerY)
                    .attr("r", r)
                    .attr("fill", ringLabels[i].hex)
                    .attr("opacity", 0.03)
                    .attr("stroke", "#e2e8f0")
                    .attr("stroke-width", 1)
                    .attr("stroke-dasharray", i === ringRadii.length - 1 ? "none" : "4,4");

                svg.append("text")
                    .attr("x", centerX)
                    .attr("y", centerY - r - 6)
                    .attr("text-anchor", "middle")
                    .attr("class", `text-[9px] font-bold uppercase tracking-wider ${ringLabels[i].color} opacity-90`)
                    .text(ringLabels[i].label);
            });

            simulationNodes.forEach(node => {
                const aiData = getActorClassification(node.id);
                let ringIndex = 2;

                if (aiData?.classification) {
                    const c = aiData.classification;
                    if (c === 'highly_stabilized') ringIndex = 0;
                    else if (c === 'stabilized') ringIndex = 1;
                    else if (c === 'marginal') ringIndex = 2;
                    else if (c === 'peripheral') ringIndex = 3;
                    else if (c === 'resistant') ringIndex = 4;
                } else {
                    ringIndex = node.visualType === "Core" ? 1 : 3;
                }

                const r = ringRadii[ringIndex];
                const angle = Math.random() * 2 * Math.PI;
                node.x = centerX + r * Math.cos(angle);
                node.y = centerY + r * Math.sin(angle);
            });

            simulation = d3.forceSimulation<Node>(simulationNodes)
                .force("collide", d3.forceCollide<Node>().radius(d => d.value + 6))
                .force("r", d3.forceRadial<Node>(d => {
                    const aiData = getActorClassification(d.id);
                    let ringIndex = 2;
                    if (aiData?.classification) {
                        const classification = aiData.classification;
                        if (classification === 'highly_stabilized') ringIndex = 0;
                        else if (classification === 'stabilized') ringIndex = 1;
                        else if (classification === 'marginal') ringIndex = 2;
                        else if (classification === 'peripheral') ringIndex = 3;
                        else if (classification === 'resistant') ringIndex = 4;
                    } else {
                        ringIndex = d.visualType === "Core" ? 1 : 3;
                    }
                    return ringRadii[ringIndex];
                }, centerX, centerY).strength(0.8))
                .alpha(1)
                .stop();

            for (let i = 0; i < 120; ++i) simulation.tick();

            nodeGroup.attr("transform", (d: Node) => `translate(${d.x},${d.y})`);

            circles.attr("fill", (d: Node) => {
                const aiData = getActorClassification(d.id);
                const classification = aiData?.classification;
                if (classification === 'highly_stabilized') return "#312e81";
                if (classification === 'stabilized') return "#4338ca";
                if (classification === 'marginal') return "#6366f1";
                if (classification === 'peripheral') return "#94a3b8";
                if (classification === 'resistant') return "#f59e0b";

                return d.visualType === "Core" ? "#4338ca" : "#94a3b8";
            });
        }

        return () => {
            if (simulation) simulation.stop();
        };
    }, [gravity, isExpanded, inputNodes, simulationData, viewMode, dimensions]);

    return (
        <div className="flex flex-col h-full w-full gap-4 min-h-0">
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 shrink-0 max-h-[40%]">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            Stabilization Mechanics
                            <HelpTooltip>
                                Drag nodes into the &quot;Stabilization Field&quot; to see how they get captured by the gravity of the central assemblage.
                                Increase &apos;Gravity&apos; to see how funding mandates lock actors in place.
                            </HelpTooltip>
                        </h3>
                        <div className="text-xs text-slate-500 max-w-2xl">
                            {isLoading ? (
                                <span className="flex items-center gap-2 text-indigo-600">
                                    <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
                                    Analyzing territorialization dynamics...
                                </span>
                            ) : error ? (
                                <span className="text-amber-600">{error}</span>
                            ) : simulationData?.explanation ? (
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <p className="text-sm leading-relaxed text-slate-700">{simulationData.explanation}</p>
                                        {isCached && simulationData?.timestamp && (
                                            <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 mt-1">
                                                {new Date(simulationData.timestamp).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                    {simulationData.mechanisms && simulationData.mechanisms.length > 0 && (
                                        <div className="flex flex-col gap-1.5 mt-2">
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Mechanisms of Capture:</span>
                                            <ul className="space-y-1">
                                                {simulationData.mechanisms.map((m: string, i: number) => (
                                                    <li key={i} className="text-xs text-indigo-800 bg-indigo-50/80 px-2 py-1.5 rounded border border-indigo-100 flex gap-2 items-start">
                                                        <span className="text-indigo-400 mt-0.5">•</span>
                                                        {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                "Visualizing how distinct actors are pulled into a dense, rigid configuration (Territorialization)."
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-6 self-end md:self-auto">
                        <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
                            <button
                                onClick={() => setViewMode('force')}
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${viewMode === 'force'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Force Graph
                            </button>
                            <button
                                onClick={() => setViewMode('rings')}
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${viewMode === 'rings'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Concentric Rings
                            </button>
                        </div>

                        <div className="flex items-center gap-1">
                            {isMapChanged && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[10px] font-bold animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    MAP CHANGED
                                </div>
                            )}
                            <button
                                onClick={() => fetchSimulation(!!simulationData)}
                                disabled={isLoading}
                                className={`text-xs px-3 py-1 rounded border transition-colors flex items-center gap-1.5 font-medium ${!simulationData
                                    ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"
                                    : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                                    } disabled:opacity-50`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
                                        {simulationData ? "Regenerating..." : "Analyzing..."}
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[10px]">{simulationData ? "✨" : "🔍"}</span>
                                        {simulationData ? "Regenerate Analysis" : "Run Analysis"}
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="space-y-2 w-48 hidden sm:block">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-600">Gravitational Pull</span>
                                <span className="text-slate-400">{(gravity * 100).toFixed(0)}%</span>
                            </div>
                            <Slider
                                value={[gravity]}
                                min={0.01}
                                max={0.5}
                                step={0.01}
                                onValueChange={([val]: number[]) => setGravity(val)}
                                className="[&>.bg-primary]:bg-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                {viewMode === 'rings' && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-500 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Apparatus of Capture</span>
                            <span className="text-[10px] text-slate-400">Inner Core = Maximum Territorialization</span>
                        </div>
                        <div className="flex items-center gap-6">
                            {[
                                { label: "Highly Stabilized", color: "bg-[#312e81]", desc: "Locked-in Core" },
                                { label: "Stabilized", color: "bg-[#4338ca]", desc: "Formal Hierarchy" },
                                { label: "Marginal", color: "bg-[#6366f1]", desc: "Hybrid Border" },
                                { label: "Peripheral", color: "bg-[#94a3b8]", desc: "Informal Network" },
                                { label: "Resistant", color: "bg-[#f59e0b]", desc: "Lines of Flight" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}></div>
                                    <div className="text-[10px] flex flex-col">
                                        <span className="font-bold text-slate-700 leading-none">{item.label}</span>
                                        <span className="text-[9px] text-slate-400">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div ref={containerRef} className="flex-1 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative shadow-inner">
                <svg ref={svgRef} className="w-full h-full block" />
                {!isLoading && dimensions.height > 0 && dimensions.width > 0 && isMapChanged && (
                    <div className="absolute top-4 right-4 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-bold animate-pulse shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Map Changed
                    </div>
                )}

                {hoveredNode && (
                    <div
                        className="absolute bg-white/95 backdrop-blur shadow-lg border border-slate-200 p-3 rounded-lg pointer-events-none z-10 w-48"
                        style={{
                            left: hoveredNode.x ? hoveredNode.x + 20 : 0,
                            top: hoveredNode.y ? hoveredNode.y - 20 : 0
                        }}>
                        <div className="font-bold text-slate-800 text-sm truncate">{hoveredNode.name}</div>
                        <div className="text-xs text-slate-500 flex justify-between mt-1">
                            <span>Role:</span>
                            <span className="font-medium text-slate-700">{hoveredNode.type}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex justify-between mt-1">
                            <span>Status:</span>
                            <span className="font-medium text-indigo-600 capitalize">
                                {(() => {
                                    const aiData = simulationData?.actors?.find((a: TerritorializationActor) => a.id === hoveredNode.id);
                                    if (aiData?.classification) return aiData.classification.replace('_', ' ');
                                    return hoveredNode.visualType === "Core" ? "Stabilized Core" : "Network Periphery";
                                })()}
                            </span>
                        </div>
                        {simulationData?.actors && (() => {
                            const aiData = simulationData.actors.find((a: TerritorializationActor) => a.id === hoveredNode.id);
                            if (aiData?.reason) {
                                return (
                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <div className="text-[10px] font-semibold text-slate-600 mb-1">AI Analysis:</div>
                                        <div className="text-[10px] text-slate-600 leading-relaxed">{aiData.reason}</div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
