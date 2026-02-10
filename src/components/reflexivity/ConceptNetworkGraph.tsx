import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from 'usehooks-ts';

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: "Actor" | "Concept" | "Value" | "Institution" | "Risk" | "Technology";
    importance: number;
    radius?: number;
    color?: string;
    isHub?: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    relation: string;
    label?: string;
}

interface ConceptNetworkGraphProps {
    data: {
        nodes: {
            id: string;
            label: string;
            type: "Actor" | "Concept" | "Value" | "Institution" | "Risk" | "Technology";
            importance: number;
        }[];
        edges: {
            source: string;
            target: string;
            relation: string;
            label?: string;
        }[];
    };
    height?: number;
}

export const ConceptNetworkGraph: React.FC<ConceptNetworkGraphProps> = ({ data, height = 500 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { width = 600 } = useResizeObserver({
        ref: wrapperRef as React.RefObject<HTMLElement>,
        box: 'border-box',
    });

    // Tooltip state
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string; visible: boolean }>({
        x: 0,
        y: 0,
        content: '',
        visible: false
    });

    // Filter state
    const [selectedType, setSelectedType] = useState<string | null>(null);

    useEffect(() => {
        if (!data || !svgRef.current || width === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const { nodes: rawNodes, edges: rawEdges } = data;

        // Process data for D3 (mutable copies)
        const nodes: GraphNode[] = rawNodes.map(n => ({ ...n }));

        // Create a set of valid node IDs for validation
        const allNodeIds = new Set(nodes.map(n => n.id));

        // Filter out edges that reference non-existent nodes
        const validLinks: GraphLink[] = rawEdges.filter((e): e is typeof e => {
            const sourceId: string = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
            const targetId: string = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id;
            return allNodeIds.has(sourceId) && allNodeIds.has(targetId);
        }).map(e => ({ ...e }));

        // Filter nodes and links based on selected type
        const visibleNodes = selectedType
            ? nodes.filter(n => n.type === selectedType)
            : nodes;

        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        const visibleLinks = selectedType
            ? validLinks.filter(l => {
                const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
                const targetId = typeof l.target === 'string' ? l.target : l.target.id;
                return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
            })
            : validLinks;

        const getNodeColor = (type: string) => {
            const colors: { [key: string]: string } = {
                'Institution': '#4f46e5', // Indigo
                'Actor': '#0ea5e9',       // Sky
                'Value': '#10b981',       // Emerald
                'Risk': '#ef4444',        // Red
                'Technology': '#f59e0b',  // Amber
                'Concept': '#8b5cf6'      // Violet
            };
            return colors[type] || '#94a3b8';
        };

        const getNodeRadius = (importance: number, isHub: boolean = false) => {
            const baseSize = isHub ? 20 : 8 + (importance * 4);
            return baseSize;
        };

        // Identify hub node (most connected)
        const connectionCounts = new Map<string, number>();
        visibleLinks.forEach(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1);
            connectionCounts.set(targetId, (connectionCounts.get(targetId) || 0) + 1);
        });

        let hubNode: GraphNode | null = null;
        let maxConnections = 0;
        for (const node of visibleNodes) {
            const connections = connectionCounts.get(node.id) || 0;
            if (connections > maxConnections) {
                maxConnections = connections;
                hubNode = node;
            }
        }

        if (hubNode) {
            hubNode.isHub = true;
        }

        // Radial Layout: Position hub at center, others in circle
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;

        // Position hub node
        if (hubNode) {
            hubNode.fx = centerX;
            hubNode.fy = centerY;
        }

        // Position satellite nodes in a circle
        const satelliteNodes = visibleNodes.filter(n => !n.isHub);
        const angleStep = (2 * Math.PI) / satelliteNodes.length;

        satelliteNodes.forEach((node, i) => {
            const angle = i * angleStep;
            node.fx = centerX + Math.cos(angle) * radius;
            node.fy = centerY + Math.sin(angle) * radius;
        });

        // Initialize Simulation (minimal forces for fixed layout)
        const simulation = d3.forceSimulation(visibleNodes)
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            .force("link", d3.forceLink(visibleLinks).id((d: any) => (d as GraphNode).id).distance(radius).strength(0.1))
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            .force("collide", d3.forceCollide().radius((d: any) => getNodeRadius((d as GraphNode).importance, (d as GraphNode).isHub) + 10).iterations(1))
            .alphaDecay(0.1); // Faster settling

        // Create Container Group for Zoom/Pan
        const g = svg.append("g");

        // Zoom Behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setTooltip(prev => ({ ...prev, visible: false }));
            });

        svg.call(zoom);

        // Arrow Marker
        svg.append("defs").selectAll("marker")
            .data(["end"])
            .enter().append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#cbd5e1");

        // Links
        const link = g.append("g")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(visibleLinks)
            .join("line")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)")
            .attr("class", "hover:stroke-indigo-400 cursor-pointer transition-colors")
            .on("mouseenter", (event, d) => {
                d3.select(event.currentTarget).attr("stroke", "#6366f1").attr("stroke-opacity", 1);
                setTooltip({
                    x: event.clientX,
                    y: event.clientY,
                    content: `${(d.source as GraphNode).label} → [${d.relation}] → ${(d.target as GraphNode).label}`,
                    visible: true
                });
            })
            .on("mousemove", (event) => {
                setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
            })
            .on("mouseleave", (event) => {
                d3.select(event.currentTarget).attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.6);
                setTooltip(prev => ({ ...prev, visible: false }));
            });

        // Node Group
        const node = g.append("g")
            .selectAll("g")
            .data(visibleNodes)
            .join("g")
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            .call(d3.drag<any, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Node Circles
        node.append("circle")
            .attr("r", d => getNodeRadius(d.importance, d.isHub))
            .attr("fill", d => getNodeColor(d.type))
            .attr("stroke", "#fff")
            .attr("stroke-width", d => d.isHub ? 3 : 2)
            .attr("class", "shadow-sm cursor-pointer hover:stroke-indigo-300 transition-all");

        // Node Labels
        node.append("text")
            .text(d => d.label)
            .attr("dy", d => getNodeRadius(d.importance, d.isHub) + 14)
            .attr("text-anchor", "middle")
            .attr("font-size", d => d.isHub ? 14 : Math.max(10, 8 + d.importance))
            .attr("font-weight", d => d.isHub ? "700" : (d.importance > 5 ? "600" : "400"))
            .attr("fill", "#334155")
            .style("pointer-events", "none")
            .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)")
            .attr("class", "select-none");

        // Simulation Tick
        simulation.on("tick", () => {
            link
                .attr("x1", (d: GraphLink) => (d.source as GraphNode).x!)
                .attr("y1", (d: GraphLink) => (d.source as GraphNode).y!)
                .attr("x2", (d: GraphLink) => (d.target as GraphNode).x!)
                .attr("y2", (d: GraphLink) => (d.target as GraphNode).y!);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Drag Functions
        function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0);
            // Keep nodes fixed in radial layout
            // d.fx = null;
            // d.fy = null;
        }

        return () => {
            simulation.stop();
        };

    }, [data, width, height, selectedType]);

    const nodeTypes = [
        { type: 'Institution', color: '#4f46e5' },
        { type: 'Actor', color: '#0ea5e9' },
        { type: 'Value', color: '#10b981' },
        { type: 'Risk', color: '#ef4444' },
        { type: 'Technology', color: '#f59e0b' },
        { type: 'Concept', color: '#8b5cf6' }
    ];

    // Count nodes by type
    const typeCounts = nodeTypes.map(({ type }) => ({
        type,
        count: data.nodes.filter(n => n.type === type).length
    }));

    return (
        <div ref={wrapperRef} className="relative w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50/10">
            {/* Interactive Legend Overlay */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-3 rounded-lg text-xs text-slate-600 border border-slate-100 shadow-sm z-10">
                <div className="font-semibold text-slate-800 mb-2">Concept Map Legend</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {nodeTypes.map(({ type, color }) => {
                        const count = typeCounts.find(t => t.type === type)?.count || 0;
                        if (count === 0) return null;

                        const isSelected = selectedType === type;
                        const isFiltered = selectedType !== null && !isSelected;

                        return (
                            <button
                                key={type}
                                onClick={() => setSelectedType(isSelected ? null : type)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer hover:bg-slate-100 ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-300' : ''
                                    } ${isFiltered ? 'opacity-40' : ''}`}
                                title={`Click to ${isSelected ? 'show all' : 'filter by'} ${type}`}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                ></span>
                                <span className="text-left flex-1">{type}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({count})</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                    {selectedType ? `Showing: ${selectedType} only` : 'Hub & Spoke Layout • Click to filter'}
                </div>
            </div>

            {/* Custom Tooltip */}
            {tooltip.visible && (
                <div
                    className="fixed z-50 px-3 py-2 bg-slate-800 text-white text-xs rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px]"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.content}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
            )}

            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="cursor-move active:cursor-grabbing w-full block"
                viewBox={`0 0 ${width} ${height}`}
            />
        </div>
    );
};
