'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, Maximize2, Minimize2, Sparkles, Loader2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SynthesisComparisonResult } from '@/types/synthesis';
import { useDemoMode } from '@/hooks/useDemoMode';

interface ResonanceNetworkGraphProps {
    data: NonNullable<SynthesisComparisonResult['resonances']>['resonance_graph'];
    width?: number;
    height?: number;
}

// D3 Node Type
interface ResonanceNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: 'shared' | 'eu_specific' | 'brazil_specific' | 'asymmetry';
    flight_intensity?: number;
}

// D3 Link Type
interface ResonanceLink extends d3.SimulationLinkDatum<ResonanceNode> {
    type: 'resonance' | 'divergence' | 'colonial_influence' | 'flight';
    weight?: number;
}

export function ResonanceNetworkGraph({ data, width = 800, height = 500 }: ResonanceNetworkGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width, height });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ type: 'node' | 'link', data: ResonanceNode | ResonanceLink } | null>(null);
    const { isReadOnly } = useDemoMode();

    // AI Interpretation State
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [interpretationResult, setInterpretationResult] = useState<{ title: string, analysis: string } | null>(null);
    const [showInterpretationDialog, setShowInterpretationDialog] = useState(false);

    // Filter valid nodes/edges
    const validData = React.useMemo(() => {
        if (!data || !data.nodes || !data.edges) return { nodes: [], edges: [] };

        const nodes = data.nodes.map(n => ({ ...n })) as ResonanceNode[]; // Clone and cast
        const nodeIds = new Set(nodes.map(n => n.id));
        const edges = data.edges
            .filter(e => nodeIds.has(e.from) && nodeIds.has(e.to))
            .map(e => ({ ...e, source: e.from, target: e.to })) as ResonanceLink[]; // D3 requires source/target

        return { nodes, edges };
    }, [data]);

    // Handle AI Interpretation
    const handleInterpret = async () => {
        if (isInterpreting) return;
        setIsInterpreting(true);
        setInterpretationResult(null);

        try {
            const response = await fetch('/api/interpret-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nodes: validData.nodes,
                    edges: validData.edges,
                    context: "Rhizomatic Resonances: Analyze this network of policy concepts, specifically looking for 'lines of flight' (pink edges) where local actors repurpose global norms. Identify 'colonial influence' (amber edges) and 'divergences' (red dashed). Explain how 'shared' concepts (green nodes) bridge these worlds."
                })
            });

            if (!response.ok) throw new Error("Analysis failed");

            const result = await response.json();
            setInterpretationResult(result);
            setShowInterpretationDialog(true);
        } catch (error) {
            console.error(error);
            alert("Failed to interpret graph. Please try again.");
        } finally {
            setIsInterpreting(false);
        }
    };

    // Resize Observer
    useEffect(() => {
        if (!wrapperRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                setDimensions({
                    width: entries[0].contentRect.width,
                    height: entries[0].contentRect.height
                });
            }
        });
        resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // D3 Simulation
    useEffect(() => {
        if (!svgRef.current || !gRef.current || validData.nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);
        g.selectAll("*").remove(); // Clear previous

        const width = dimensions.width;
        const height = dimensions.height;

        // Custom Forces
        // 1. Colonial Gravity: "eu_specific" nodes pull harder (higher mass/gravity)
        // 2. Flight Repulsion: "flight" nodes might repel "eu_specific" nodes more
        const simulation = d3.forceSimulation<ResonanceNode>(validData.nodes)
            .force("link", d3.forceLink<ResonanceNode, ResonanceLink>(validData.edges)
                .id(d => d.id)
                .distance(d => d.type === 'flight' ? 150 : d.type === 'colonial_influence' ? 80 : 100)
            )
            .force("charge", d3.forceManyBody().strength(d => (d as ResonanceNode).type === 'asymmetry' ? -500 : -200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(40));

        // Render Links
        const link = g.append("g")
            .selectAll("line")
            .data(validData.edges)
            .enter().append("line")
            .attr("stroke-width", d => (d.weight || 1) * 2)
            .attr("stroke", d => {
                if (d.type === 'flight') return "#ec4899"; // Pink for lines of flight
                if (d.type === 'colonial_influence') return "#f59e0b"; // Amber for colonial
                if (d.type === 'divergence') return "#ef4444"; // Red for mismatch
                return "#22c55e"; // Green for shared/resonance
            })
            .attr("stroke-dasharray", d => d.type === 'divergence' ? "4 4" : "none")
            .attr("opacity", 0.7);

        // Arrows for directed edges (colonial, flight)
        svg.append("defs").selectAll("marker")
            .data(["flight", "colonial_influence"])
            .enter().append("marker")
            .attr("id", d => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", d => d === 'flight' ? "#ec4899" : "#f59e0b");

        link.attr("marker-end", d => {
            if (d.type === 'flight') return "url(#arrow-flight)";
            if (d.type === 'colonial_influence') return "url(#arrow-colonial_influence)";
            return null;
        });

        // Render Nodes
        const node = g.append("g")
            .selectAll("g")
            .data(validData.nodes)
            .enter().append("g")
            .attr("cursor", "pointer")
            .call(d3.drag<SVGGElement, ResonanceNode>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            )
            .on("click", (e, d) => setSelectedItem({ type: 'node', data: d }));

        // Node Circles
        node.append("circle")
            .attr("r", d => d.type === 'asymmetry' ? 12 : 8)
            .attr("fill", d => {
                if (d.type === 'shared') return "#10b981"; // Green
                if (d.type === 'eu_specific') return "#3b82f6"; // Blue
                if (d.type === 'brazil_specific') return "#facc15"; // Yellow
                return "#64748b"; // Slate
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        // Flight Halo for 'flight' nodes
        node.filter(d => Boolean(d.flight_intensity))
            .append("circle")
            .attr("r", 15)
            .attr("fill", "none")
            .attr("stroke", "#ec4899")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2 2")
            .attr("class", "animate-pulse");

        // Labels
        node.append("text")
            .text(d => d.label)
            .attr("x", 12)
            .attr("y", 4)
            .attr("font-size", "10px")
            .attr("fill", "currentColor")
            .attr("class", "text-slate-700 dark:text-slate-300 pointer-events-none");

        // Simulation Tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as unknown as ResonanceNode).x!)
                .attr("y1", d => (d.source as unknown as ResonanceNode).y!)
                .attr("x2", d => (d.target as unknown as ResonanceNode).x!)
                .attr("y2", d => (d.target as unknown as ResonanceNode).y!);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Zoom Behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform.toString());
            });

        svg.call(zoom);

    }, [validData, dimensions]);

    return (
        <Card className={`transition-all duration-300 relative border-indigo-200 ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none bg-white dark:bg-slate-950' : 'h-full bg-gradient-to-r from-indigo-50/50 to-purple-50/50'}`}>
            <CardHeader className="absolute top-0 left-0 right-0 z-10 flex flex-row items-center justify-between p-4 bg-transparent pointer-events-none">
                <div className="flex flex-col pointer-events-auto">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Network className="w-5 h-5 text-indigo-600" />
                        Rhizomatic Resonances
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-4 h-4 text-slate-400 hover:text-indigo-600 transition-colors cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs bg-slate-900 border-slate-800 text-white p-3">
                                    <p className="font-semibold mb-1">Flight Halos (Pink Rings)</p>
                                    <p className="text-xs leading-relaxed">
                                        Indicate high <span className="text-pink-400 font-medium">Flight Intensity</span>: where local actors are actively repurposing or "escaping" the original concept's definition.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Force-directed view of transversal strategies and colonial lines of flight.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-1 pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-lg p-1 border shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 text-xs font-medium ${isInterpreting ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"}`}
                        onClick={handleInterpret}
                        disabled={isInterpreting || isReadOnly}
                        title={isReadOnly ? "Sign in to use AI features" : "AI Interpret Graph"}
                    >
                        {isInterpreting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-1 ml-0.5 text-indigo-500" />
                        )}
                        {isInterpreting ? "Analyzing..." : "AI Explain"}
                    </Button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </CardHeader>

            <div className="w-full h-full" ref={wrapperRef}>
                <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing">
                    <g ref={gRef} />
                </svg>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg border shadow-sm text-[10px] space-y-1.5 min-w-[120px] pointer-events-none z-10">
                <div className="font-semibold text-slate-500 mb-1 uppercase tracking-wider">Topology</div>
                <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-blue-500" /> EU Mechanism</div>
                <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-yellow-400" /> Brazil/Local</div>
                <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-green-500" /> Shared Concept</div>
                <div className="space-y-1 pt-1 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-700"><span className="w-4 border-t-2 border-pink-500 border-dashed" /> Line of Flight</div>
                    <div className="flex items-center gap-2 text-slate-700"><span className="w-4 border-t-2 border-amber-500" /> Colonial Influence</div>
                    <div className="flex items-center gap-2 text-slate-700 mt-1"><div className="w-3 h-3 rounded-full border border-pink-500 border-dashed" /> High Flight Intensity</div>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedItem && selectedItem.type === 'node' ? (selectedItem.data as ResonanceNode).label : selectedItem ? (selectedItem.data as ResonanceLink).type.replace('_', ' ') : ''}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Details for selection
                        </DialogDescription>
                    </DialogHeader>

                    <div className="text-base text-slate-700 py-4">
                        {selectedItem && selectedItem.type === 'node' ? (
                            <div className="space-y-2 mt-2">
                                <p><strong>Type:</strong> {(selectedItem.data as ResonanceNode).type.replace('_', ' ')}</p>
                                {(selectedItem.data as ResonanceNode).flight_intensity && (
                                    <p><strong>Flight Intensity:</strong> {(selectedItem.data as ResonanceNode).flight_intensity}</p>
                                )}
                                <p className="text-sm italic text-slate-500">
                                    "Nodes in this rhizome represent strategic leverage points or shared concepts. 'Lines of flight' indicate where local actors repurpose global norms for resistance."
                                </p>
                            </div>
                        ) : selectedItem ? (
                            <div className="space-y-2 mt-2">
                                <p><strong>Connection Type:</strong> {(selectedItem.data as ResonanceLink).type}</p>
                                <p><strong>Strength:</strong> {(selectedItem.data as ResonanceLink).weight || 1.0}</p>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedItem(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Interpretation Dialog */}
            <Dialog open={showInterpretationDialog} onOpenChange={setShowInterpretationDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-700">
                            <Sparkles className="w-5 h-5" />
                            {interpretationResult?.title || "Rhizomatic Analysis"}
                        </DialogTitle>
                        <DialogDescription>
                            AI-generated interpretation of the current resonance network.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-slate-700 text-sm leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto">
                        {interpretationResult?.analysis.split('\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowInterpretationDialog(false)}>Close Analysis</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
