"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActorColor, inferActorType } from '@/lib/ecosystem-utils';
import * as d3 from 'd3';

// Dynamic import for ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">Loading Visualization...</div>
});

interface AssemblageNetwork {
    nodes: (string | { id: string; type: string })[];
    edges: { from: string; to: string; type: string }[];
}

interface RhizomeNetworkProps {
    network: AssemblageNetwork;
}

// Helper functions imported from @/lib/ecosystem-utils

// Extended Palette from User Model
const RHIZOME_COLORS = {
    Policy: "#ef4444", // Red (Federal Lands)
    Law: "#ef4444",
    Institution: "#3b82f6", // Blue (Public Citizen / Center)
    Organization: "#3b82f6",
    Toolkit: "#f97316", // Orange (North Star)
    Recommendations: "#84cc16", // Lime (Good Jobs)
    Person: "#eab308", // Yellow (Deanna Noel)
    Concept: "#a855f7", // Purple (Env. Justice)
    Technology: "#6b7280", // Grey (LLMs)
    Algorithm: "#6b7280",
    Event: "#a52a2a", // Brown (EO)
    Document: "#ec4899", // Pink (NERC)
    Report: "#ec4899",
    Default: "#6366f1" // Indigo
};

const getRhizomeColor = (type: string) => {
    // Normalize type
    const t = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    // Keyword matching for robustness
    if (t.includes('Policy') || t.includes('Act') || t.includes('Bill')) return RHIZOME_COLORS.Policy;
    if (t.includes('Law') || t.includes('Regulation')) return RHIZOME_COLORS.Law;
    if (t.includes('Toolkit') || t.includes('Tool')) return RHIZOME_COLORS.Toolkit;
    if (t.includes('Recommendation') || t.includes('Guide')) return RHIZOME_COLORS.Recommendations;
    if (t.includes('Person') || t.includes('Author')) return RHIZOME_COLORS.Person;
    if (t.includes('Concept') || t.includes('Idea')) return RHIZOME_COLORS.Concept;
    if (t.includes('Tech') || t.includes('Model') || t.includes('Algorithm')) return RHIZOME_COLORS.Technology;
    if (t.includes('Event') || t.includes('Summit') || t.includes('Order')) return RHIZOME_COLORS.Event;
    if (t.includes('Report') || t.includes('Paper') || t.includes('Doc')) return RHIZOME_COLORS.Document;
    if (t.includes('Institution') || t.includes('Org') || t.includes('Center') || t.includes('Agency')) return RHIZOME_COLORS.Institution;

    return RHIZOME_COLORS.Default;
};

// Legend Items Grouped
const LEGEND_ITEMS = [
    { label: 'Policy / Law', color: RHIZOME_COLORS.Policy },
    { label: 'Institution / Org', color: RHIZOME_COLORS.Institution },
    { label: 'Toolkit / Guide', color: RHIZOME_COLORS.Toolkit },
    { label: 'Recommendations', color: RHIZOME_COLORS.Recommendations },
    { label: 'Person', color: RHIZOME_COLORS.Person },
    { label: 'Concept', color: RHIZOME_COLORS.Concept },
    { label: 'Tech / Algo', color: RHIZOME_COLORS.Technology },
    { label: 'Event', color: RHIZOME_COLORS.Event },
    { label: 'Document', color: RHIZOME_COLORS.Document },
];

export function RhizomeNetwork({ network }: RhizomeNetworkProps) {
    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
    const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
    const [hoverNode, setHoverNode] = useState<string | null>(null);

    // Legend Drag State
    const [legendPos, setLegendPos] = useState({ x: 20, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStartPos = useRef({ x: 0, y: 0 }); // To distinguish click vs drag

    // Filter State
    const [filterColor, setFilterColor] = useState<string | null>(null);

    // Handle Legend Dragging
    const handleLegendMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - legendPos.x,
            y: e.clientY - legendPos.y
        };
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation(); // Prevent graph interaction
    };

    const handleLegendItemClick = (color: string) => {
        // Toggle filter
        if (filterColor === color) {
            setFilterColor(null);
        } else {
            setFilterColor(color);
        }
        // Reset highlights when filtering
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setLegendPos({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Ensure we have valid dimensions for the canvas
    useEffect(() => {
        if (containerRef.current) {
            const updateDims = () => {
                const { offsetWidth, offsetHeight } = containerRef.current!;
                setDimensions({ width: offsetWidth, height: offsetHeight || 400 });
            };

            updateDims();
            window.addEventListener('resize', updateDims);
            return () => window.removeEventListener('resize', updateDims);
        }
    }, []);

    // Transform data for ForceGraph
    const graphData = useMemo(() => {
        if (!network || !network.nodes || network.nodes.length === 0) return { nodes: [], links: [] };

        // Handle both string[] (Old) and object[] (New)
        // Check first element type
        const isObjectNodes = typeof network.nodes[0] === 'object';

        let nodes = network.nodes.map((n: any) => {
            const id = typeof n === 'string' ? n : n.id;
            const type = typeof n === 'string' ? inferActorType(n) : (n.type || inferActorType(n.id));

            return {
                id,
                group: type,
                val: 3, // Small fixed radius
                degree: 0 // Will calculate below
            };
        });

        // Create a map of existing nodes for quick lookup
        const nodeMap = new Map(nodes.map((n: any) => [n.id, n]));

        // Ensure all edge targets exist
        network.edges.forEach(e => {
            [e.from, e.to].forEach(nodeId => {
                if (!nodeMap.has(nodeId)) {
                    // Create implicit node if missing
                    const newNode = {
                        id: nodeId,
                        group: inferActorType(nodeId),
                        val: 2, // Slightly smaller for implicit nodes
                        degree: 0
                    };
                    nodes.push(newNode);
                    nodeMap.set(nodeId, newNode);
                }
            });
        });

        // Filter Nodes if active
        if (filterColor) {
            nodes = nodes.filter((n: any) => getRhizomeColor(n.group) === filterColor);
        }

        // Re-build map for filtered nodes to ensure we don't have dangling links
        const filteredNodeMap = new Set(nodes.map((n: any) => n.id));

        // Use Set for unique links (sometimes LLM duplicates)
        const uniqueLinks = new Set();
        const links = network.edges.filter(e => {
            // Must connect two visible nodes
            if (!filteredNodeMap.has(e.from) || !filteredNodeMap.has(e.to)) return false;

            const key = `${e.from}-${e.to}`;
            if (uniqueLinks.has(key)) return false;
            uniqueLinks.add(key);
            return true;
        }).map(e => ({
            source: e.from,
            target: e.to,
            name: e.type
        }));

        // Calculate Degree for Radial Layout
        // Need to calculate degree based on visible links
        const finalNodeMap = new Map(nodes.map((n: any) => [n.id, n]));
        links.forEach(link => {
            if (finalNodeMap.has(link.source)) finalNodeMap.get(link.source)!.degree++;
            if (finalNodeMap.has(link.target)) finalNodeMap.get(link.target)!.degree++;
        });

        return { nodes, links };
    }, [network, filterColor]);

    // Apply Radial Forces
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            const fg = graphRef.current;

            // Standard Forces
            fg.d3Force('charge').strength(-150); // Moderate repulsion
            fg.d3Force('link').distance(70); // Tighter links

            // Radial Force: Pull high-degree nodes to center (0), others to radius (150)
            const maxDegree = Math.max(...graphData.nodes.map((n: any) => n.degree)) || 1;

            fg.d3Force('radial', d3.forceRadial((node: any) => {
                // If it's a hub (high degree), pull to center. Else push out.
                // Simple strict threshold: Top 20% degree = center?
                // Or continuous: radius = (1 - degree/maxDegree) * 200
                const relativeDegree = node.degree / maxDegree;
                if (relativeDegree === 1) return 0; // Center the absolute Hub
                return (1 - relativeDegree) * 200; // Hubs closer, leaves further
            }, 0, 0).strength(0.8));

            // Poke the simulation to restart with new forces
            fg.d3ReheatSimulation();
        }
    }, [graphData]); // Re-run when data changes

    const handleNodeClick = (node: any) => {
        setHighlightNodes(new Set([node.id]));
        // Find neighbors
        const neighbors = new Set<string>();
        const links = new Set<string>();
        graphData.links.forEach((link: any) => {
            if (link.source.id === node.id || link.target.id === node.id) {
                neighbors.add(link.source.id);
                neighbors.add(link.target.id);
                links.add(link.source.id + "-" + link.target.id); // Or reference usage
            }
        });
        setHighlightNodes(new Set([node.id, ...Array.from(neighbors)]));
        setHighlightLinks(links);

        // Center view on node
        graphRef.current?.centerAt(node.x, node.y, 1000);
        graphRef.current?.zoom(4, 1000); // Slight zoom in
    };

    const resetView = () => {
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        setFilterColor(null); // Clear filter too
        graphRef.current?.zoomToFit(1000, 50);
    };

    const handleBackgroundClick = () => {
        // If clicking background but NOT dragging legend, reset.
        // The dragging event propagation already stops this, so this is safe.
        resetView();
    };

    // Empty State
    if (!network || !network.nodes || network.nodes.length === 0) {
        return (
            <Card className="border-2 border-dashed border-slate-300 shadow-sm min-h-[400px] h-full bg-slate-50 flex flex-col">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                            <Network className="h-5 w-5 text-slate-500" />
                            Assemblage Rhizome (No Data)
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center flex-1 text-slate-500">
                    <Network className="h-16 w-16 mb-4 text-slate-300" />
                    <p className="font-medium text-lg">Analysis Unavailable</p>
                    <p className="text-sm max-w-[250px] text-center mt-2 text-slate-400">
                        The AI did not generate a valid network structure for this comparison.
                        Try re-running the synthesis.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-indigo-100 shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-indigo-50/50 pb-3 flex flex-row items-center justify-between flex-shrink-0">
                <div className="space-y-1.5">
                    <CardTitle className="text-base font-semibold text-indigo-900 flex items-center gap-2">
                        <Network className="h-5 w-5 text-indigo-600" />
                        Assemblage Rhizome (Radial)
                    </CardTitle>
                    <CardDescription>
                        Traced ancestry and inter-referential citations. Interact to explore.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-700" onClick={resetView} title="Reset View">
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 bg-slate-50 relative flex-1 min-h-[400px]" ref={containerRef}>
                {dimensions.width > 0 && (
                    <>
                        {/* Moveable Legend */}
                        <div
                            className="absolute z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200 text-xs cursor-move select-none"
                            style={{
                                left: legendPos.x,
                                top: legendPos.y,
                                width: '160px'
                            }}
                            onMouseDown={handleLegendMouseDown}
                        >
                            <h4 className="font-semibold text-slate-700 mb-2 border-b border-slate-100 pb-1 flex justify-between items-center">
                                Legend
                                {filterColor && (
                                    <span className="text-[10px] text-indigo-600 font-normal cursor-pointer hover:underline" onClick={() => setFilterColor(null)}>Clear Filter</span>
                                )}
                            </h4>
                            <div className="space-y-1.5">
                                {LEGEND_ITEMS.map((item, idx) => {
                                    const isActive = filterColor === item.color;
                                    const isDimmed = filterColor && !isActive;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-colors ${isActive ? 'bg-slate-100 ring-1 ring-slate-200' : 'hover:bg-slate-50'} ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
                                            onClick={(e) => {
                                                // Prevent click if it was a drag
                                                const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
                                                if (dist < 5) handleLegendItemClick(item.color);
                                            }}
                                        >
                                            <span
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-slate-600 leading-tight">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <ForceGraph2D
                            ref={graphRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            graphData={graphData}

                            // Interaction
                            onNodeClick={handleNodeClick}
                            onBackgroundClick={handleBackgroundClick}
                            onNodeHover={(node: any) => setHoverNode(node ? node.id : null)}

                            // Physics (Rhizomatic -> Radial)
                            d3VelocityDecay={0.3} // Low friction to allow radial sorting
                            d3AlphaDecay={0.02}
                            warmupTicks={100} // Pre-calculate positions
                            cooldownTicks={0} // Let it settle manualy via d3Reheat

                            // Rendering
                            nodeLabel="id"
                            nodeColor={(node: any) => {
                                if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) return '#e2e8f0'; // Gray out non-highlighted
                                // Use customized palette if matched, else fallback to standard color
                                return getRhizomeColor(node.group);
                            }}
                            nodeRelSize={4} // Radius ~= 7px

                            // Link Styling
                            linkColor={(link: any) => {
                                if (highlightNodes.size > 0) {
                                    // Check if connected to highlighted node
                                    const isConnected = highlightNodes.has((link.source as any).id) && highlightNodes.has((link.target as any).id);
                                    return isConnected ? '#475569' : '#f1f5f9';
                                }
                                return "#94a3b8"; // Slate-400
                            }}
                            linkWidth={(link: any) => highlightLinks.has(link.source.id + "-" + link.target.id) ? 2 : 1}
                            linkDirectionalParticles={2}
                            linkDirectionalParticleSpeed={0.005}
                            linkDirectionalParticleWidth={2}
                            linkDirectionalArrowLength={3.5}
                            linkDirectionalArrowRelPos={1}

                            // Label Rendering
                            nodeCanvasObjectMode={() => 'after'}
                            nodeCanvasObject={(node: any, ctx, globalScale) => {
                                const isHighlighted = highlightNodes.has(node.id);
                                const isHovered = hoverNode === node.id;
                                const isActive = highlightNodes.size === 0 || isHighlighted;

                                if (!isActive) return;

                                const label = node.id;
                                const fontSize = isHighlighted ? 4 : 3.5;
                                ctx.font = `${isHighlighted ? 'bold' : ''} ${fontSize}px Sans-Serif`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'top';

                                // Text Shadow/Outline for readability
                                ctx.lineWidth = 3; // Thicker outline
                                ctx.strokeStyle = '#f8fafc'; // Bg color
                                // Radius approx 7px (sqrt(3)*4)
                                ctx.strokeText(label, node.x, node.y + 8);

                                ctx.fillStyle = isHighlighted || isHovered ? '#0f172a' : '#475569';
                                ctx.fillText(label, node.x, node.y + 8);
                            }}

                            // Canvas Configuration
                            backgroundColor="#f8fafc"
                            onEngineStop={() => graphRef.current?.zoomToFit(1000, 50)}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
