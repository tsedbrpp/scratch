'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, RefreshCcw, MousePointerClick, Settings2, Info, Maximize2, Minimize2, ZoomIn, ZoomOut, Move, Sparkles, Loader2, Download } from 'lucide-react';
import { SynthesisComparisonResult } from '@/types/synthesis';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useServerStorage } from '@/hooks/useServerStorage';
import { DraggableCard } from "@/components/ui/draggable-card";
import { cn } from "@/lib/utils";

interface ComparisonNetworkGraphProps {
    networkData: SynthesisComparisonResult['assemblage_network'];
    width?: number;
    height?: number;
    comparisonId?: string;
}

// Types for D3
interface Node extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: 'policy' | 'concept' | 'mechanism' | 'right' | 'risk' | 'analyst';
    inferred_centrality?: string;
    // D3 Props (Explicitly typed to avoid TS errors)
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: string | Node;
    target: string | Node;
    type: 'reinforcing' | 'tension' | 'extraction' | 'resistance' | 'translation';
    description?: string;
    weight?: number;
}

export function ComparisonNetworkGraph({ networkData, width = 800, height = 500, comparisonId }: ComparisonNetworkGraphProps) {
    console.log("DEBUG: ComparisonNetworkGraph received data:", {
        nodeCount: networkData?.nodes?.length,
        edgeCount: networkData?.edges?.length,
        nodes: networkData?.nodes
    });

    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null); // Container for zoomable content
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width, height });

    // View State
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);


    // Simulation Settings State
    const [activeCenterId, setActiveCenterId] = useState<string | null>(null);
    const [showAnalystNode, setShowAnalystNode] = useState(true);
    const [showControversy, setShowControversy] = useState(true);
    const [gravityStrength, setGravityStrength] = useState(150); // Reduced from 300 for tighter clustering
    const [tensionDistance, setTensionDistance] = useState(100);

    // Interaction State
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [hoveredLink, setHoveredLink] = useState<Link | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [selectedItem, setSelectedItem] = useState<{ type: 'node' | 'link', data: Node | Link } | null>(null);

    // AI Interpretation State - Persisted
    const [interpretation, setInterpretation] = useServerStorage<{ title: string; analysis: string } | null>(
        `assemblage-interpretation-${comparisonId}`,
        null
    );
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [showInterpretationDialog, setShowInterpretationDialog] = useState(false);

    const handleInterpret = async () => {
        if (!networkData) return;
        setIsInterpreting(true);
        try {
            const res = await fetch('/api/interpret-graph', {
                method: 'POST',
                body: JSON.stringify({ nodes: networkData.nodes, edges: networkData.edges }),
            });
            const data = await res.json();
            setInterpretation(data);
            setShowInterpretationDialog(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsInterpreting(false);
        }
    };

    const handleExport = () => {
        if (!svgRef.current) return;

        // 1. Serialize SVG
        const serializer = new XMLSerializer();
        const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;

        // Inline some styles for valid rendering
        svgClone.setAttribute("background-color", "#ffffff");
        const svgString = serializer.serializeToString(svgClone);

        // 2. Create Image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            // 3. Draw to Canvas
            const canvas = document.createElement("canvas");
            // Increase resolution for better quality
            const scale = 2;
            canvas.width = dimensions.width * scale;
            canvas.height = dimensions.height * scale;
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            // Fill Background (White)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Image
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);

            // 4. Add Watermark
            ctx.font = "bold 24px sans-serif";
            ctx.fillStyle = "rgba(100, 116, 139, 0.5)"; // Slate-500 @ 50%
            ctx.textAlign = "right";
            ctx.fillText("Generated by Instant TEA", dimensions.width - 20, dimensions.height - 40);

            ctx.font = "16px sans-serif";
            ctx.fillStyle = "rgba(100, 116, 139, 0.4)";
            ctx.fillText("instanttea.com", dimensions.width - 20, dimensions.height - 20);

            // 5. Download
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `assemblage-snapshot-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            URL.revokeObjectURL(url);
        };
        img.src = url;
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

    // Zoom Logic
    useEffect(() => {
        if (!svgRef.current) return;

        const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
            if (gRef.current) {
                d3.select(gRef.current).attr("transform", event.transform.toString());
                setZoomTransform(event.transform);
            }
        };

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", zoomed);

        d3.select(svgRef.current).call(zoom);
    }, [dimensions]);

    // Zoom Controls
    const handleZoomIn = () => {
        if (!svgRef.current) return;
        d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.2);
    };

    const handleZoomOut = () => {
        if (!svgRef.current) return;
        d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.8);
    };

    const handleResetZoom = () => {
        if (!svgRef.current) return;
        d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
    };


    // Process Data (Add Analyst Node)
    const { nodes, links } = useMemo(() => {
        if (!networkData) return { nodes: [], links: [] };

        // Clone and transform for D3
        const rawNodes = networkData.nodes.map(n => ({ ...n })) as Node[];
        const nodeIds = new Set(rawNodes.map(n => n.id));

        // Map edges to D3 Link format and validate targets
        const rawLinks = networkData.edges
            .map(e => ({
                ...e,
                source: e.from,
                target: e.to
            }))
            .filter(l => nodeIds.has(l.source) && nodeIds.has(l.target)) as unknown as Link[];

        // Add Analyst Node (The "Visible Translator")
        if (showAnalystNode) {
            const analystNode: Node = {
                id: "analyst_ai",
                label: "AI Analyst",
                type: 'analyst',
                fx: dimensions.width / 2, // Pin to actual visual center
                fy: dimensions.height / 2
            };

            // Only add if not exists
            if (!rawNodes.find(n => n.id === analystNode.id)) {
                rawNodes.push(analystNode);

                // Connect Analyst to Policies AND Key Concepts (Translation edges)
                // We connect to all 'policy' nodes, and if few exist, also 'concept' nodes
                const targetNodes = rawNodes.filter(n => n.type === 'policy' || (n.type === 'concept' && n.label.length < 20)); // Heuristic to pick main concepts

                // Fallback: If still no targets, pick distinct clusters (not implemented) -> just pick random 3
                const finalTargets = targetNodes.length > 0 ? targetNodes : rawNodes.slice(0, 3);

                finalTargets.forEach(target => {
                    rawLinks.push({
                        source: "analyst_ai",
                        target: target.id,
                        type: 'translation',
                        description: "Algorithmic Translation / Inferred Connection",
                        weight: 0.5
                    } as unknown as Link);
                });
            }
        }

        return { nodes: rawNodes, links: rawLinks };
    }, [networkData, showAnalystNode]);

    // D3 Logic
    useEffect(() => {
        if (!gRef.current || nodes.length === 0) return;

        const g = d3.select(gRef.current);
        g.selectAll("*").remove(); // Clear previous

        const colorScale: Record<string, string> = {
            policy: "#3b82f6", // Blue
            concept: "#a855f7", // Purple
            mechanism: "#10b981", // Green
            right: "#f59e0b", // Amber
            risk: "#ef4444", // Red
            analyst: "#64748b" // Slate
        };

        // Simulation Setup
        const simulation = d3.forceSimulation<Node>(nodes)
            .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(d => d.type === 'tension' ? tensionDistance : 60))
            .force("charge", d3.forceManyBody().strength(-gravityStrength)) // Dynamic Repulsion
            .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
            .force("radial", d3.forceRadial(200, dimensions.width / 2, dimensions.height / 2).strength(0.05)) // Gentle pull to center for disconnected clusters
            .force("collision", d3.forceCollide().radius(35));

        // Arrowhead Markers
        const defs = g.append("defs");
        ['reinforcing', 'tension', 'extraction', 'resistance', 'translation'].forEach(type => {
            defs.append("marker")
                .attr("id", `arrow-${type}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 28) // Offset for node radius
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("fill", type === 'tension' ? '#ef4444' : (type === 'resistance' ? '#a855f7' : '#94a3b8'));
        });

        // Draw Links
        const link = g.append("g")
            .selectAll<SVGLineElement, Link>("line")
            .data(links)
            .join("line")
            .attr("stroke", d => {
                if (d.type === 'tension') return '#ef4444'; // Red
                if (d.type === 'resistance') return '#a855f7'; // Purple
                if (d.type === 'extraction') return '#f97316'; // Orange
                if (d.type === 'translation') return '#e2e8f0'; // Light Grey
                return '#94a3b8'; // Default Slate
            })
            .attr("stroke-width", d => (d.weight || 0.5) * 3)
            .attr("stroke-dasharray", d => d.type === 'tension' || d.type === 'translation' ? "4 4" : "0")
            .attr("marker-end", d => `url(#arrow-${d.type})`)
            .attr("class", d => d.type === 'tension' && showControversy ? "animate-pulse cursor-pointer" : "cursor-pointer")
            .attr("opacity", d => d.type === 'tension' && !showControversy ? 0.2 : 1)
            .on("mouseover", (event, d) => {
                setHoveredLink(d);
                setTooltipPos({ x: event.pageX, y: event.pageY });
            })
            .on("mouseout", () => setHoveredLink(null))
            .on("click", (event, d) => {
                event.stopPropagation();
                setSelectedItem({ type: 'link', data: d });
            });

        // Draw Nodes
        const node = g.append("g")
            .selectAll<SVGGElement, Node>("g")
            .data(nodes)
            .join("g")
            .call(d3.drag<SVGGElement, Node>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Node Circles
        node.append("circle")
            .attr("r", d => d.type === 'policy' ? 14 : (d.type === 'analyst' ? 16 : 9))
            .attr("fill", d => colorScale[d.type] || "#94a3b8")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("filter", d => d.id === activeCenterId ? "drop-shadow(0 0 10px rgba(59, 130, 246, 0.7))" : "")
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                event.stopPropagation();
                setSelectedItem({ type: 'node', data: d });
            })
            .on("mouseover", (event, d) => {
                setHoveredNode(d);
                setTooltipPos({ x: event.pageX, y: event.pageY });
            })
            .on("mouseout", () => setHoveredNode(null));

        // Labels
        node.append("text")
            .text(d => d.label)
            .attr("x", 18)
            .attr("y", 5)
            .attr("font-size", "10px")
            .attr("font-weight", d => d.type === 'policy' ? "bold" : "normal")
            .attr("fill", "currentColor")
            .style("pointer-events", "none")
            .attr("class", "dark:text-white fill-slate-700 dark:fill-slate-200");

        // Analyst Icon Styling
        node.filter(d => d.type === 'analyst')
            .select("circle")
            .attr("fill", "#1e293b")
            .attr("stroke", "#a855f7")
            .attr("stroke-width", 3);

        // Simulation Tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as Node).x!)
                .attr("y1", d => (d.source as Node).y!)
                .attr("x2", d => (d.target as Node).x!)
                .attr("y2", d => (d.target as Node).y!);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Territorialization Force Applicator (Alignment Cascade)
        // Territorialization Force Applicator (Alignment Cascade)
        if (activeCenterId) {
            // Find neighbors for cascading effect
            const neighbors = new Set<string>();

            links.forEach(l => {
                const s = l.source as Node;
                const t = l.target as Node;
                if (s.id === activeCenterId) neighbors.add(t.id);
                if (t.id === activeCenterId) neighbors.add(s.id);
            });

            // Apply specific forces based on relationships
            // 1. Pull neighbors closer
            simulation.force("territory", d3.forceRadial(80, dimensions.width / 2, dimensions.height / 2).strength(d => {
                if ((d as Node).id === activeCenterId) return 1; // Pin center
                if (neighbors.has((d as Node).id)) return 0.6; // Strong pull for neighbors
                return 0;
            }));

            // Re-heat simulation
            simulation.alpha(0.1).restart();

            // Visual Cascade: Brighten neighbors, dim others
            node.selectAll("circle").transition().duration(500)
                .attr("fill", (d: any) => {
                    const nodeType = d.type as string;
                    const baseColor = colorScale[nodeType] || "#94a3b8";

                    if (d.id === activeCenterId) return baseColor;
                    if (neighbors.has(d.id)) {
                        return d3.color(baseColor)?.brighter(0.8).toString() || baseColor;
                    }
                    // Dim non-related nodes
                    return d3.color(baseColor)?.darker(1.5).toString() || "#334155";
                })
                .attr("opacity", (d: any) => {
                    if (d.id === activeCenterId || neighbors.has(d.id)) return 1;
                    return 0.3; // Fade out non-neighbors
                });

            // Dynamic Labelling: Territory vs Independent
            node.select("text")
                .text((d: any) => {
                    if (d.id === activeCenterId) return d.label + " (Center)";
                    if (neighbors.has(d.id)) return d.label + " (Territory)";
                    return d.label + " (Independent)";
                })
                .attr("font-weight", (d: any) => neighbors.has(d.id) || d.id === activeCenterId ? "bold" : "normal")
                .attr("fill", (d: any) => neighbors.has(d.id) || d.id === activeCenterId ? "currentColor" : "#94a3b8")
                .attr("opacity", (d: any) => neighbors.has(d.id) || d.id === activeCenterId ? 1 : 0.7);


            // Highlight links connected to center
            link.transition().duration(500)
                .attr("opacity", d => {
                    if ((d.source as Node).id === activeCenterId || (d.target as Node).id === activeCenterId) return 1;
                    return 0.1;
                });
        } else {
            // Reset visuals when no center is active
            node.selectAll("circle").transition().duration(500)
                .attr("fill", (d: any) => colorScale[d.type] || "#94a3b8")
                .attr("opacity", 1);

            // Reset Labels
            node.select("text")
                .text((d: any) => d.label)
                .attr("font-weight", (d: any) => d.type === 'policy' ? "bold" : "normal")
                .attr("fill", "currentColor")
                .attr("opacity", 1);


            link.transition().duration(500).attr("opacity", d => d.type === 'tension' && !showControversy ? 0.2 : 1);
        }

        // Drag functions with proper typing
        function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

    }, [nodes, links, dimensions, activeCenterId, gravityStrength, tensionDistance, showControversy]);


    if (!nodes || nodes.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                No network data available. Run synthesis to generate.
            </div>
        );
    }

    return (
        <Card className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none bg-white dark:bg-slate-950' : 'h-full bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden'}`}>
            <CardHeader className="pb-2 border-b bg-white dark:bg-slate-950">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100 truncate shrink-0">
                            <Network className="w-5 h-5 text-indigo-600 shrink-0" />
                            <span className="truncate">Assemblage Network</span>
                        </CardTitle>
                        {activeCenterId && (
                            <Badge variant="secondary" className="animate-in fade-in zoom-in bg-indigo-100 text-indigo-800 border-indigo-200 truncate min-w-0 hidden sm:inline-flex">
                                <span className="truncate">Territorializing: {nodes.find(n => n.id === activeCenterId)?.label}</span>
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {/* Zoom Controls */}
                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-md border mr-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handleZoomOut} title="Zoom Out">
                                <ZoomOut className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handleResetZoom} title="Reset Zoom">
                                <Move className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handleZoomIn} title="Zoom In">
                                <ZoomIn className="w-3 h-3" />
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 hidden md:flex text-slate-600 bg-white border-slate-200 hover:text-indigo-600 hover:border-indigo-200"
                            onClick={handleExport}
                            title="Export as PNG"
                        >
                            <Download className="w-3 h-3" />
                            <span className="sr-only 2xl:not-sr-only 2xl:inline-block">Export</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 hidden md:flex text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                            onClick={handleInterpret}
                            disabled={isInterpreting}
                        >
                            {isInterpreting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span className="hidden 2xl:inline">AI Explain</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500">
                                    <Settings2 className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-white dark:bg-slate-950 z-[100] border-l border-slate-200 dark:border-slate-800 shadow-2xl">
                                <SheetHeader>
                                    <SheetTitle>Simulation Assumptions</SheetTitle>
                                    <SheetDescription>
                                        Configure the physics and interpretive rules of the assemblage visualization.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="py-6 space-y-6">
                                    {/* Interpretive Guardrails */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm space-y-3">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">Genesis & Mediation:</span>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                                    The <strong>AI Analyst</strong> node (center) acts as a mediator. It draws "Translation Lines" to the core concepts of each law, bridging two distinct systems (e.g., Brazil's Rights vs. India's Risk) that would otherwise be disconnected.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MousePointerClick className="w-4 h-4 text-indigo-500 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">Territorialization (Stress Test):</span>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                                    Click a node to run a "Gravity Test." This creates a magnetic pull to see which actors are firmly held in its orbit and which ones escape its influence. It visualizes the **power** of a concept to organize the network.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Controls */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">Visual Layers</h4>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show-analyst"
                                                checked={showAnalystNode}
                                                onCheckedChange={(c) => setShowAnalystNode(!!c)}
                                            />
                                            <Label htmlFor="show-analyst">Show Analyst Node</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show-controversy"
                                                checked={showControversy}
                                                onCheckedChange={(c) => setShowControversy(!!c)}
                                            />
                                            <Label htmlFor="show-controversy">Highlight Controversies</Label>
                                        </div>
                                    </div>

                                    {/* Physics Controls */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">Simulation Physics</h4>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <Label htmlFor="gravity">Gravity Strength</Label>
                                                <span className="text-slate-500">{gravityStrength}</span>
                                            </div>
                                            <input
                                                id="gravity"
                                                type="range"
                                                min="50"
                                                max="600"
                                                step="50"
                                                value={gravityStrength}
                                                onChange={(e) => setGravityStrength(Number(e.target.value))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                                            />
                                            <p className="text-[10px] text-slate-500">Controls the repulsive force between nodes.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <Label htmlFor="tension">Tension Distance</Label>
                                                <span className="text-slate-500">{tensionDistance}</span>
                                            </div>
                                            <input
                                                id="tension"
                                                type="range"
                                                min="50"
                                                max="300"
                                                step="10"
                                                value={tensionDistance}
                                                onChange={(e) => setTensionDistance(Number(e.target.value))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                                            />
                                            <p className="text-[10px] text-slate-500">Controls the length of &apos;Tension&apos; edges.</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setActiveCenterId(null)}
                                            disabled={!activeCenterId}
                                        >
                                            <RefreshCcw className="mr-2 h-3 w-3" />
                                            Reset Simulation
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
                <CardDescription className="text-xs flex items-center gap-2">
                    <MousePointerClick className="w-3 h-3" />
                    Click nodes for details and to simulate territorial alignment. Use scroll wheel to zoom.
                </CardDescription>
            </CardHeader>

            <div className={`relative w-full ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'}`} ref={wrapperRef}>
                <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full cursor-grab active:cursor-grabbing text-slate-700 dark:text-slate-200">
                    <g ref={gRef} />
                </svg>

                {/* Tooltip Overlay (Only on hover, when no dialog) */}
                {(hoveredNode || hoveredLink) && !selectedItem && (
                    <div
                        className="fixed z-50 pointer-events-none p-3 bg-slate-900/90 text-white text-xs rounded shadow-xl max-w-[250px] animate-in fade-in duration-150 backdrop-blur-md border border-slate-700/50"
                        style={{ top: tooltipPos.y + 10, left: tooltipPos.x + 10 }}
                    >
                        {hoveredNode && (
                            <>
                                <div className="font-bold text-indigo-300 mb-1">{hoveredNode.label}</div>
                                <div className="text-slate-300 capitalize">Type: {hoveredNode.type}</div>
                            </>
                        )}
                        {hoveredLink && (
                            <>
                                <div className="font-bold text-amber-300 mb-1 capitalize">{hoveredLink.type} Connection</div>
                                <div className="text-slate-300">{hoveredLink.description}</div>
                            </>
                        )}
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg border shadow-sm text-[10px] space-y-1.5 min-w-[120px] pointer-events-none">
                    <div className="font-semibold text-slate-500 mb-1 uppercase tracking-wider">Legend</div>
                    <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" /> Policy</div>
                    <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" /> Concept</div>
                    <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" /> Mechanism</div>
                    <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" /> Right</div>
                    <div className="flex items-center gap-2 text-slate-700"><div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" /> Risk</div>
                    <div className="flex items-center gap-2 text-slate-700"><span className="w-4 border-t border-dashed border-red-500" /> Tension/Controversy</div>
                    <div className="flex items-center gap-2 text-slate-700"><span className="w-4 border-t border-slate-400" /> Analytic Translation</div>
                </div>
            </div>

            {/* Interpretation Window (Draggable) */}
            {showInterpretationDialog && interpretation && (
                <DraggableCard
                    title={
                        <div className="flex items-center gap-2 text-indigo-700">
                            <Sparkles className="w-4 h-4" />
                            {interpretation.title || "Graph Analysis"}
                        </div>
                    }
                    onClose={() => setShowInterpretationDialog(false)}
                    initialX={100}
                    initialY={100}
                    className="max-w-md"
                >
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                        <p className="whitespace-pre-line">{interpretation.analysis}</p>
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs text-slate-500 border dark:border-slate-800 italic">
                            Note: This analysis is based on the node types (colors) and connection density observed in the current graph.
                        </div>
                    </div>
                </DraggableCard>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    {selectedItem && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {selectedItem.type === 'node' ? (
                                        <>
                                            <div className={`w-3 h-3 rounded-full 
                                                    ${(selectedItem.data as Node).type === 'policy' ? 'bg-blue-500' :
                                                    (selectedItem.data as Node).type === 'concept' ? 'bg-purple-500' :
                                                        (selectedItem.data as Node).type === 'mechanism' ? 'bg-green-500' :
                                                            (selectedItem.data as Node).type === 'risk' ? 'bg-red-500' : 'bg-slate-500'}
                                                `} />
                                            {(selectedItem.data as Node).label}
                                        </>
                                    ) : (
                                        <>
                                            <Network className="w-4 h-4 text-slate-500" />
                                            {(selectedItem.data as Link).type} Connection
                                        </>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    Details for {selectedItem.type === 'node' ? (selectedItem.data as Node).label : (selectedItem.data as Link).type}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="text-base text-slate-700 dark:text-slate-300 py-2">
                                {selectedItem.type === 'node' ? (
                                    <div className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500 block text-xs uppercase tracking-wider">Type</span>
                                                <span className="capitalize font-medium">{(selectedItem.data as Node).type}</span>
                                            </div>
                                            {(selectedItem.data as Node).inferred_centrality && (
                                                <div>
                                                    <span className="text-slate-500 block text-xs uppercase tracking-wider">Inferred Centrality</span>
                                                    <span className="italic font-medium">&quot;{(selectedItem.data as Node).inferred_centrality}&quot;</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Territorialization Action */}
                                        {(selectedItem.data as Node).type !== 'analyst' && (
                                            <div className="border-t pt-4 mt-4">
                                                <h4 className="font-semibold text-sm mb-2 text-indigo-900 flex items-center gap-2">
                                                    <Move className="w-4 h-4" />
                                                    Power Check (Territorialization)
                                                </h4>
                                                <p className="text-xs text-slate-600 mb-3">
                                                    Turn this node into a "Magnet" to test its influence. Nodes that move towards it are part of its territory; nodes that stay still are independent.
                                                </p>
                                                <Button
                                                    className={`w-full ${activeCenterId === (selectedItem.data as Node).id ? 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                                                    variant={activeCenterId === (selectedItem.data as Node).id ? "outline" : "default"}
                                                    onClick={() => {
                                                        const id = (selectedItem.data as Node).id;
                                                        setActiveCenterId(prev => prev === id ? null : id);
                                                        setSelectedItem(null); // Close dialog
                                                    }}
                                                >
                                                    {activeCenterId === (selectedItem.data as Node).id ? "Stop Territorializing" : "Simulate Territorialization"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-4">
                                        <p className="text-base font-medium">
                                            &quot;{(selectedItem.data as Link).description || "No description available."}&quot;
                                        </p>
                                        <div className="text-xs text-slate-500 border-t pt-2 mt-2">
                                            <span className="block mb-1">Connection Details (Raw Force Weight):</span>
                                            <code className="bg-slate-100 px-1 py-0.5 rounded">{(selectedItem.data as Link).weight || "Standard"}</code>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setSelectedItem(null)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Card >
    );
}
