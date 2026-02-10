import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyNode as D3SankeyNode, SankeyLink as D3SankeyLink } from 'd3-sankey';
import { AlertTriangle, Target, Zap } from 'lucide-react';
import { SimulationNode } from '@/hooks/useForceGraph';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeterritorializationData } from '@/types/ecosystem-simulation';
import { useSimulationCache } from '@/hooks/useSimulationCache';
import { useDemoMode } from '@/hooks/useDemoMode';

interface Props {
    isExpanded: boolean;
    nodes: SimulationNode[];
}

// Custom types to satisfy D3 generics
interface DSankeyNodeExtra {
    name: string;
}

interface DSankeyLinkExtra {
    id?: string;
}

type DSankeyNode = D3SankeyNode<DSankeyNodeExtra, DSankeyLinkExtra>;
type DSankeyLink = D3SankeyLink<DSankeyNodeExtra, DSankeyLinkExtra>;

interface TooltipData {
    title: string;
    actors: SimulationNode[];
    x: number;
    y: number;
}

const TacticalArsenal = ({ tactics }: { tactics?: { capture: string[], escape: string[] } }) => {
    if (!tactics) return <div className="p-8 text-center text-slate-400 italic">No tactical data available. Regenerate analysis.</div>;

    return (
        <div className="grid grid-cols-2 gap-4 h-full p-1">
            <div className="bg-red-50/50 rounded-lg border border-red-100 p-4 flex flex-col gap-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-red-800 uppercase tracking-wider">
                    <Target size={14} /> Tools of Capture
                </h4>
                <ScrollArea className="flex-1">
                    <ul className="space-y-2">
                        {tactics.capture?.map((t, i) => (
                            <li key={i} className="text-xs text-slate-700 bg-white p-2 rounded shadow-sm border border-red-100 flex gap-2 items-start">
                                <span className="text-red-400 mt-0.5">•</span>
                                {t}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </div>
            <div className="bg-emerald-50/50 rounded-lg border border-emerald-100 p-4 flex flex-col gap-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 uppercase tracking-wider">
                    <Zap size={14} /> Weapons of Escape
                </h4>
                <ScrollArea className="flex-1">
                    <ul className="space-y-2">
                        {tactics.escape?.map((t, i) => (
                            <li key={i} className="text-xs text-slate-700 bg-white p-2 rounded shadow-sm border border-emerald-100 flex gap-2 items-start">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                {t}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </div>
        </div>
    );
};

const ResistanceMatrix = ({ matrix }: { matrix?: Array<{ name: string, x: number, y: number, type: string }> }) => {
    if (!matrix) return <div className="p-8 text-center text-slate-400 italic">No matrix data available. Regenerate analysis.</div>;

    return (
        <div className="w-full h-full relative bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4 min-h-0 overflow-hidden">
            <div className="text-center">
                <h4 className="text-sm font-bold text-slate-700">Strategic Positioning</h4>
                <p className="text-xs text-slate-500 mt-1">Actors plotted by co-optation risk vs. transformative potential</p>
            </div>

            <div className="flex-1 relative min-h-0 px-6 py-6">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-semibold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateX(50%)' }}>
                    Potential for Change →
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-semibold">
                    Likelihood of Co-optation →
                </div>

                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
                    <div className="relative border-r border-b border-slate-300 bg-emerald-50/30 p-2">
                        <div className="absolute top-2 left-2 text-[10px] font-bold text-emerald-700 uppercase opacity-40">Revolution</div>
                    </div>
                    <div className="relative border-b border-slate-300 bg-yellow-50/30 p-2">
                        <div className="absolute top-2 right-2 text-[10px] font-bold text-yellow-700 uppercase opacity-40">Reform</div>
                    </div>
                    <div className="relative border-r border-slate-300 bg-slate-50/30 p-2">
                        <div className="absolute bottom-2 left-2 text-[10px] font-bold text-slate-500 uppercase opacity-40">Noise</div>
                    </div>
                    <div className="relative bg-red-50/30 p-2">
                        <div className="absolute bottom-2 right-2 text-[10px] font-bold text-red-700 uppercase opacity-40">Trap</div>
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none">
                    {matrix.map((pt, i) => (
                        <div
                            key={i}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
                            style={{ left: `${pt.x * 100}%`, top: `${(1 - pt.y) * 100}%` }}
                        >
                            <div className={`w-3.5 h-3.5 rounded-full border-2 shadow-md transition-all hover:scale-150 hover:z-50 ${pt.type === 'resistance' ? 'bg-emerald-500 border-emerald-700' : 'bg-red-500 border-red-700'}`}></div>
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-xl max-w-xs">
                                <div className="font-semibold">{pt.name}</div>
                                <div className="text-[9px] text-slate-300 mt-0.5">
                                    Co-opt: {(pt.x * 100).toFixed(0)}% | Change: {(pt.y * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs border-t border-slate-200 pt-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-700"></div>
                    <span className="text-slate-600">Resistance</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700"></div>
                    <span className="text-slate-600">Capture</span>
                </div>
            </div>
        </div>
    );
};

export function DeterritorializationView({ isExpanded, nodes: inputNodes }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (node !== null) {
            setContainerEl(node);
        }
    }, []);

    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const {
        data: simulationData,
        isLoading,
        error,
        isCached,
        isMapChanged,
        fetchSimulation
    } = useSimulationCache<DeterritorializationData>({
        endpoint: '/api/simulation/deterritorialization',
        inputNodes,
        isExpanded
    });

    const { isReadOnly } = useDemoMode();

    const contestingActors = useMemo(() => inputNodes.filter(n => {
        const t = n.type.toLowerCase();
        return t.includes('society') || t.includes('ngo') || t.includes('academic') || t.includes('protest') || t.includes('community');
    }), [inputNodes]);

    const capturedActors = useMemo(() => inputNodes.filter(n => {
        const t = n.type.toLowerCase();
        return t.includes('state') || t.includes('policy') || t.includes('gov') || t.includes('municipal');
    }), [inputNodes]);

    const escapingActors = useMemo(() => inputNodes.filter(n => {
        const t = n.type.toLowerCase();
        return t.includes('trust') || t.includes('coop') || t.includes('indigenous');
    }), [inputNodes]);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerEl) return;
        const resizeObserver = new ResizeObserver(entries => {
            if (!entries || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });
        resizeObserver.observe(containerEl);
        return () => resizeObserver.disconnect();
    }, [containerEl]);

    useEffect(() => {
        if (!containerEl || !svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

        const { width, height } = dimensions;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .html("");

        const rawData = simulationData || {
            nodes: [
                { name: "Global Capital Flows" },
                { name: "Local Policy Capture" },
                { name: "Public Contestation" },
                { name: "Standardized CBA" },
                { name: "Community Land Trust" },
                { name: "Extractive Development" }
            ],
            links: [
                { source: 0, target: 1, value: 10 },
                { source: 1, target: 2, value: 5 },
                { source: 2, target: 3, value: 3 },
                { source: 2, target: 4, value: 2 },
                { source: 3, target: 5, value: 3 },
                { source: 1, target: 5, value: 5 }
            ]
        };

        const data = JSON.parse(JSON.stringify(rawData));

        const sankeyGenerator = sankey<DSankeyNode, DSankeyLink>()
            .nodeWidth(15)
            .nodePadding(20)
            .extent([[50, 50], [width - 50, height - 50]]);

        const { nodes, links } = sankeyGenerator(data);

        const linkGenerator = sankeyLinkHorizontal<DSankeyNode, DSankeyLink>();

        svg.append("g")
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("d", linkGenerator)
            .attr("stroke-width", (d) => Math.max(1, d.width || 0))
            .attr("fill", "none")
            .attr("stroke", (d) => {
                const target = d.target as DSankeyNode;
                if (target.index === 4) return "#10b981";
                if (target.index === 3) return "#f59e0b";
                return "#94a3b8";
            })
            .attr("opacity", 0.4);

        svg.append("g")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", (d) => d.x0 || 0)
            .attr("y", (d) => d.y0 || 0)
            .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
            .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0))
            .attr("fill", (d) => {
                if (d.index === 4) return "#10b981";
                if (d.index === 3) return "#f59e0b";
                if (d.index === 0) return "#64748b";
                if (d.index === 5) return "#dc2626";
                return "#94a3b8";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("class", "cursor-pointer transition-opacity hover:opacity-80")
            .on("mouseenter", (event: React.MouseEvent, d: DSankeyNode) => {
                let relevantActors: SimulationNode[] = [];
                if (d.index === 1) relevantActors = capturedActors;
                else if (d.index === 2) relevantActors = contestingActors;
                else if (d.index === 4) relevantActors = escapingActors;

                setTooltip({
                    title: d.name,
                    actors: relevantActors,
                    x: (d.x1 || 0) + 10,
                    y: d.y0 || 0
                });
            })
            .on("mouseleave", () => setTooltip(null));

        svg.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", (d) => ((d.x0 || 0) < width / 2 ? (d.x1 || 0) + 6 : (d.x0 || 0) - 6))
            .attr("y", (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", (d) => (d.x0 || 0) < width / 2 ? "start" : "end")
            .text((d) => d.name.length > 25 ? d.name.substring(0, 25) + "..." : d.name)
            .attr("class", "text-[10px] font-bold fill-slate-600 uppercase tracking-wide pointer-events-none");

        interface Particle {
            id: number;
            link: DSankeyLink;
            progress: number;
            type: 'escape' | 'reabsorption' | 'default';
        }

        const particles: Particle[] = [];
        let particleId = 0;

        const timer = d3.interval(() => {
            links.forEach((link) => {
                const emitProb = 0.15;
                const maxParticles = 30;

                if (Math.random() < emitProb && particles.length < maxParticles) {
                    let type: 'escape' | 'reabsorption' | 'default' = 'default';
                    const target = link.target as DSankeyNode;
                    if (target.index === 4) type = 'escape';
                    else if (target.index === 3) type = 'reabsorption';

                    particles.push({
                        id: particleId++,
                        link,
                        progress: 0,
                        type
                    });
                }
            });

            const activeParticles = particles.filter(p => p.progress < 1);
            particles.length = 0;
            particles.push(...activeParticles);
            activeParticles.forEach(p => p.progress += 0.01);

            const pSelection = svg.selectAll<SVGCircleElement, Particle>("circle.particle")
                .data(activeParticles, (d) => (d as Particle).id.toString());

            pSelection.enter()
                .append("circle")
                .attr("class", "particle")
                .attr("r", 3)
                .merge(pSelection)
                .attr("cx", (d) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const path = linkGenerator(d.link as any) as string | null;
                    if (!path) return 0;
                    const points = path.split(/[MC,]/).filter((s: string) => s.trim());
                    if (points.length < 2) return 0;
                    const x0 = parseFloat(points[0]);
                    const x1 = parseFloat(points[points.length - 2]);
                    return x0 + (x1 - x0) * d.progress;
                })
                .attr("cy", (d) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const path = linkGenerator(d.link as any) as string | null;
                    if (!path) return 0;
                    const points = path.split(/[MC,]/).filter((s: string) => s.trim());
                    if (points.length < 2) return 0;
                    const y0 = parseFloat(points[1]);
                    const y1 = parseFloat(points[points.length - 1]);
                    return y0 + (y1 - y0) * d.progress;
                })
                .attr("fill", d => d.type === 'escape' ? "#10b981" : d.type === 'reabsorption' ? "#f59e0b" : "#94a3b8")
                .attr("opacity", 0.8);

            pSelection.exit().remove();
        }, 50);

        return () => timer.stop();
    }, [dimensions, simulationData, contestingActors, capturedActors, escapingActors, containerEl]);

    return (
        <div className="flex flex-col h-full w-full gap-4 relative min-h-0">
            <Tabs defaultValue="flows" className="flex flex-col h-full w-full">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between mr-4">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                Contained Flows (Deterritorialization)
                            </h3>
                            <TabsList className="h-7">
                                <TabsTrigger value="flows" className="text-xs h-6 px-2">Structural Flows</TabsTrigger>
                                <TabsTrigger value="tactics" className="text-xs h-6 px-2">Tactical Arsenal</TabsTrigger>
                                <TabsTrigger value="matrix" className="text-xs h-6 px-2">Resistance Matrix</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="text-xs text-slate-500 max-w-lg min-h-[40px] flex items-center mt-2">
                            {isLoading ? (
                                <span className="flex items-center gap-2 text-indigo-500 animate-pulse">
                                    <span className="animate-spin w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full"></span>
                                    Analyzing Ecosystem Dynamics...
                                </span>
                            ) : error ? (
                                <span className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                    <AlertTriangle size={12} />
                                    {error}
                                </span>
                            ) : simulationData?.explanation ? (
                                <div className="flex items-center gap-2">
                                    <span className="italic text-slate-600 leading-tight">{simulationData.explanation}</span>
                                    {isCached && simulationData?.timestamp && (
                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                            Cached {new Date(simulationData.timestamp).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                "Visualizing how the assemblage sustains itself by managing and internalizing external shocks."
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isMapChanged && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[10px] font-bold animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                MAP CHANGED
                            </div>
                        )}
                        <button
                            onClick={() => fetchSimulation(!!simulationData)}
                            disabled={isLoading || isReadOnly}
                            title={isReadOnly ? "Analysis disabled in Demo Mode" : ""}
                            className={`text-xs px-3 py-1 rounded border transition-colors flex items-center gap-1.5 font-medium ${!simulationData
                                ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"
                                : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                </div>

                <div className="flex-1 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 relative min-h-0">
                    <TabsContent value="flows" className="h-full w-full m-0 p-0 relative">
                        <div ref={containerRef} className="w-full h-full min-h-0">
                            <svg ref={svgRef} className="w-full h-full min-h-0 block" />
                            {tooltip && containerEl && (
                                <div
                                    className="absolute bg-white shadow-xl border border-slate-200 rounded-lg p-3 z-20 w-64 pointer-events-none"
                                    style={{
                                        left: Math.min(tooltip.x, (containerEl.clientWidth || 500) - 270),
                                        top: Math.max(10, Math.min(tooltip.y, (containerEl.clientHeight || 500) - 200))
                                    }}
                                >
                                    <h4 className="font-bold text-slate-800 text-sm mb-2">{tooltip.title}</h4>
                                    <div className="text-xs text-slate-500 mb-2">
                                        {tooltip.actors.length > 0 ? (
                                            <span>{tooltip.actors.length} Active Participants</span>
                                        ) : (
                                            <span className="italic">No specific actors identified in this role.</span>
                                        )}
                                    </div>
                                    {tooltip.actors.length > 0 && (
                                        <div className="space-y-1 max-h-48 overflow-y-auto relative pointer-events-auto">
                                            {tooltip.actors.map(a => (
                                                <div key={a.id} className="flex items-center gap-2 text-xs p-1 rounded bg-slate-50 border border-slate-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                    <span className="truncate flex-1 font-medium text-slate-700">{a.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="tactics" className="h-full w-full m-0 p-4 overflow-hidden">
                        <TacticalArsenal tactics={simulationData?.tactics} />
                    </TabsContent>

                    <TabsContent value="matrix" className="h-full w-full m-0 p-4">
                        <ResistanceMatrix matrix={simulationData?.matrix} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
