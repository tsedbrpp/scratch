"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { inferActorType } from '@/lib/ecosystem-utils';
import * as d3 from 'd3';

// Dynamic import for ForceGraph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">Loading Visualization...</div>
});

interface AssemblageNetwork {
    nodes: (string | { id: string; type: string; ontologicalStatus?: string })[];
    edges: { from: string; to: string; type: string; nature?: string; transformationType?: string }[];
}

interface RhizomeNetworkProps {
    network: AssemblageNetwork;
}

export interface RhizomeNode {
    id: string;
    group: string;
    ontologicalStatus?: string;
    val: number;
    degree: number;
    x?: number;
    y?: number;
}

export interface RhizomeLink {
    source: string | RhizomeNode;
    target: string | RhizomeNode;
    name: string;
    nature: string;
    transformationType?: string;
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // ANT Mode Toggle
    const [antMode, setAntMode] = useState(false);

    // Transform data for ForceGraph
    const graphData = useMemo(() => {
        if (!network || !network.nodes || network.nodes.length === 0) return { nodes: [], links: [] };

        let nodes: RhizomeNode[] = network.nodes.map((n) => {
            const id = typeof n === 'string' ? n : n.id;
            const type = typeof n === 'string' ? inferActorType(n) : (n.type || inferActorType(n.id));
            const status = typeof n !== 'string' ? n.ontologicalStatus : undefined;

            return {
                id,
                group: type,
                ontologicalStatus: status, // [NEW] Pass through
                val: type === 'Controversy' ? 5 : 3, // Larger for Controversy
                degree: 0 // Will calculate below
            };
        });

        // Create a map of existing nodes for quick lookup
        const nodeMap = new Map(nodes.map((n) => [n.id, n]));

        // Ensure all edge targets exist
        network.edges.forEach(e => {
            [e.from, e.to].forEach(nodeId => {
                if (!nodeMap.has(nodeId)) {
                    // Create implicit node if missing
                    const newNode: RhizomeNode = {
                        id: nodeId,
                        group: inferActorType(nodeId),
                        ontologicalStatus: undefined, // Fixes type mismatch with mapped nodes
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
            nodes = nodes.filter((n) => getRhizomeColor(n.group) === filterColor);
        }

        // Re-build map for filtered nodes to ensure we don't have dangling links
        const filteredNodeMap = new Set(nodes.map((n) => n.id));

        // Use Set for unique links (sometimes LLM duplicates)
        const uniqueLinks = new Set();
        const links = network.edges.filter(e => {
            // Must connect two visible nodes
            if (!filteredNodeMap.has(e.from) || !filteredNodeMap.has(e.to)) return false;

            const key = `${e.from}-${e.to}`;
            if (uniqueLinks.has(key)) return false;
            uniqueLinks.add(key);
            return true;
        }).map((e) => ({
            source: e.from,
            target: e.to,
            name: e.type,
            nature: e.nature || 'intermediary', // [NEW] ANT Prop
            transformationType: e.transformationType
        }));

        // Calculate Degree for Radial Layout
        // Need to calculate degree based on visible links
        const finalNodeMap = new Map(nodes.map((n) => [n.id, n]));
        links.forEach(link => {
            if (finalNodeMap.has(link.source as string)) finalNodeMap.get(link.source as string)!.degree++;
            if (finalNodeMap.has(link.target as string)) finalNodeMap.get(link.target as string)!.degree++;
        });

        return { nodes, links };
    }, [network, filterColor, antMode]); // Added antMode to force re-evaluation of data/props

    // Apply Radial Forces
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            const fg = graphRef.current;

            // Standard Forces
            fg.d3Force('charge').strength(-150); // Moderate repulsion
            fg.d3Force('link').distance(70); // Tighter links

            // Radial Force: Pull high-degree nodes to center (0), others to radius (150)
            const maxDegree = Math.max(...graphData.nodes.map((n) => n.degree)) || 1;

            fg.d3Force('radial', d3.forceRadial((node: unknown) => {
                const rNode = node as RhizomeNode;
                // If it's a hub (high degree), pull to center. Else push out.
                // Simple strict threshold: Top 20% degree = center?
                // Or continuous: radius = (1 - degree/maxDegree) * 200
                const relativeDegree = rNode.degree / maxDegree;
                if (relativeDegree === 1) return 0; // Center the absolute Hub
                return (1 - relativeDegree) * 200; // Hubs closer, leaves further
            }, 0, 0).strength(0.8));

            // Poke the simulation to restart with new forces
            fg.d3ReheatSimulation();
        }
    }, [graphData]); // Re-run when data changes

    // Reheat on ANT Mode toggle to ensure visual transition
    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.d3ReheatSimulation();
        }
    }, [antMode]);

    const handleNodeClick = (node: unknown) => {
        const rNode = node as RhizomeNode;
        setHighlightNodes(new Set([rNode.id]));
        // Find neighbors
        const neighbors = new Set<string>();
        const links = new Set<string>();
        graphData.links.forEach((link: RhizomeLink) => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;

            if (sourceId === rNode.id || targetId === rNode.id) {
                neighbors.add(sourceId);
                neighbors.add(targetId);
                links.add(sourceId + "-" + targetId); // Or reference usage
            }
        });
        setHighlightNodes(new Set([rNode.id, ...Array.from(neighbors)]));
        setHighlightLinks(links);

        // Center view on node
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (graphRef.current as any)?.centerAt(rNode.x, rNode.y, 1000);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (graphRef.current as any)?.zoom(4, 1000); // Slight zoom in
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
                <div className="flex gap-2 items-center">
                    {/* ANT Lens Toggle */}
                    <div className="flex items-center gap-2 mr-2 bg-white px-2 py-1 rounded border border-indigo-100">
                        <span className={`text-[10px] font-bold ${antMode ? 'text-indigo-600' : 'text-slate-400'}`}>ANT LENS</span>
                        <div
                            className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${antMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            onClick={() => setAntMode(!antMode)}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${antMode ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>

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
                                {/* ANT Legend Addition */}
                                {antMode && (
                                    <>
                                        <div className="border-t border-slate-100 my-1 pt-1"></div>
                                        <div className="flex items-center gap-2 p-1">
                                            <span className="w-8 border-b-2 border-dashed border-red-400"></span>
                                            <span className="text-slate-600">Mediator (Active)</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-1">
                                            <span className="w-8 border-b border-slate-400"></span>
                                            <span className="text-slate-600">Intermediary</span>
                                        </div>
                                    </>
                                )}
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
                            onNodeHover={(node: unknown) => setHoverNode(node ? (node as RhizomeNode).id : null)}

                            // Physics (Rhizomatic -> Radial)
                            d3VelocityDecay={0.3} // Low friction to allow radial sorting
                            d3AlphaDecay={0.02}
                            warmupTicks={100} // Pre-calculate positions
                            cooldownTicks={0} // Let it settle manualy via d3Reheat

                            // Rendering
                            nodeLabel="id"
                            nodeColor={(node: unknown) => {
                                const rNode = node as RhizomeNode;
                                if (highlightNodes.size > 0 && !highlightNodes.has(rNode.id)) return '#e2e8f0'; // Gray out non-highlighted

                                // ANT Controversy Highlight
                                if (antMode && rNode.group === 'Controversy') return '#f97316'; // Orange

                                // Use customized palette if matched, else fallback to standard color
                                return getRhizomeColor(rNode.group);
                            }}
                            nodeRelSize={4} // Radius ~= 7px

                            // Link Styling
                            linkColor={(link: unknown) => {
                                const rLink = link as RhizomeLink;
                                const sourceId = typeof rLink.source === 'string' ? rLink.source : rLink.source.id;
                                const targetId = typeof rLink.target === 'string' ? rLink.target : rLink.target.id;

                                if (highlightNodes.size > 0) {
                                    // Check if connected to highlighted node
                                    const isConnected = highlightNodes.has(sourceId) && highlightNodes.has(targetId);
                                    return isConnected ? '#475569' : '#f1f5f9';
                                }

                                // ANT Mode Styling
                                if (antMode) {
                                    return rLink.nature === 'mediator' ? '#f87171' : '#cbd5e1'; // Red vs Slate-300
                                }

                                return "#94a3b8"; // Slate-400
                            }}
                            linkWidth={(link: unknown) => {
                                const rLink = link as RhizomeLink;
                                const sourceId = typeof rLink.source === 'string' ? rLink.source : rLink.source.id;
                                const targetId = typeof rLink.target === 'string' ? rLink.target : rLink.target.id;

                                if (highlightLinks.has(sourceId + "-" + targetId)) return 3;
                                if (antMode && rLink.nature === 'mediator') return 3;
                                return 1.5;
                            }}
                            linkDirectionalParticles={antMode ? 4 : 2}
                            linkDirectionalParticleSpeed={(link: unknown) => {
                                const rLink = link as RhizomeLink;
                                if (antMode && rLink.nature === 'mediator') return 0.01; // Faster for active work
                                return 0.005;
                            }}
                            linkDirectionalParticleWidth={(link: unknown) => {
                                const rLink = link as RhizomeLink;
                                if (antMode && rLink.nature === 'mediator') return 3;
                                return 2;
                            }}
                            linkDirectionalArrowLength={3.5}
                            linkDirectionalArrowRelPos={1}
                            linkLineDash={(link: unknown) => {
                                const rLink = link as RhizomeLink;
                                if (antMode && rLink.nature === 'mediator') return [4, 2]; // Dashed for Mediators
                                return null;
                            }}

                            // Label Rendering
                            nodeCanvasObjectMode={() => 'after'}
                            nodeCanvasObject={(node: unknown, ctx,) => {
                                const rNode = node as RhizomeNode;
                                const isHighlighted = highlightNodes.has(rNode.id);
                                const isHovered = hoverNode === rNode.id;
                                const isActive = highlightNodes.size === 0 || isHighlighted;

                                // Pulse for Controversy in ANT Mode
                                if (antMode && rNode.group === 'Controversy') {
                                    // Draw pulsing ring
                                    const time = Date.now();
                                    const pulse = (Math.sin(time / 200) + 1) / 2; // 0 to 1
                                    ctx.beginPath();
                                    ctx.arc(rNode.x || 0, rNode.y || 0, 8 + pulse * 4, 0, 2 * Math.PI);
                                    ctx.fillStyle = `rgba(249, 115, 22, ${0.3 - pulse * 0.1})`;
                                    ctx.fill();

                                    // Accessibility Border
                                    ctx.beginPath();
                                    ctx.arc(rNode.x || 0, rNode.y || 0, 6, 0, 2 * Math.PI);
                                    ctx.strokeStyle = '#c2410c'; // Dark Orange
                                    ctx.lineWidth = 2;
                                    ctx.stroke();
                                }

                                if (!isActive) return;

                                const label = rNode.id;
                                const fontSize = isHighlighted ? 4 : 3.5;
                                ctx.font = `${isHighlighted ? 'bold' : ''} ${fontSize}px Sans-Serif`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'top';

                                // Text Shadow/Outline for readability
                                ctx.lineWidth = 3; // Thicker outline
                                ctx.strokeStyle = '#f8fafc'; // Bg color
                                // Radius approx 7px (sqrt(3)*4)
                                ctx.strokeText(label, rNode.x || 0, (rNode.y || 0) + (rNode.group === 'Controversy' ? 10 : 8));

                                ctx.fillStyle = isHighlighted || isHovered ? '#0f172a' : '#475569';
                                ctx.fillText(label, rNode.x || 0, (rNode.y || 0) + (rNode.group === 'Controversy' ? 10 : 8));
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
