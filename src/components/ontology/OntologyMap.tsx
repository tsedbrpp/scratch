import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { OntologyNode, OntologyLink } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize, Minimize, Network } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface OntologyMapProps {
    nodes: OntologyNode[];
    links: OntologyLink[];
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
    selectedNodeId: string | null;
    onSelectNode: (nodeId: string | null) => void;
    // onNodeDrag prop is removed as drag is handled internally by D3
    onNodeDrag?: (nodeId: string, x: number, y: number) => void;
}

// Extend types for D3
interface D3Node extends OntologyNode, d3.SimulationNodeDatum {
    radius?: number;
}
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
    relation: string;
}

export function OntologyMap({
    nodes: rawNodes,
    links: rawLinks,
    selectedCategory,
    onSelectCategory,
    selectedNodeId,
    onSelectNode
}: OntologyMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<SVGGElement>(null);

    // Deep clone data to avoid mutating props (D3 mutates objects)
    const { d3Nodes, d3Links } = useMemo(() => {
        const nodes = rawNodes.map(n => ({ ...n })) as D3Node[];

        // Create a set of valid node IDs for O(1) lookup
        const nodeIds = new Set(nodes.map(n => n.id));

        // Filter out links where source or target doesn't exist to prevent D3 crashes
        const links = rawLinks
            .filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
            .map(l => ({ ...l })) as unknown as D3Link[];

        return { d3Nodes: nodes, d3Links: links };
    }, [rawNodes, rawLinks]);

    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        // Calculate potential connections early (needed for custom force)
        const potentialLinks: Array<{source: D3Node, target: D3Node, relationshipType: string, evidence: string}> = [];
        d3Nodes.forEach(node => {
            if (node.isGhost && node.potentialConnections) {
                node.potentialConnections.forEach(conn => {
                    const targetNode = d3Nodes.find(n => 
                        n.label.toLowerCase().includes(conn.targetActor.toLowerCase()) ||
                        conn.targetActor.toLowerCase().includes(n.label.toLowerCase())
                    );
                    if (targetNode) {
                        potentialLinks.push({
                            source: node,
                            target: targetNode,
                            relationshipType: conn.relationshipType,
                            evidence: conn.evidence
                        });
                    }
                });
            }
        });

        // Custom force to attract ghost nodes toward their potential connections
        const ghostAttractionForce = (alpha: number) => {
            potentialLinks.forEach(link => {
                const source = link.source;
                const target = link.target;
                if (!source.x || !source.y || !target.x || !target.y) return;
                
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) return;
                
                // Weak attractive force (strength 0.05) to gently pull ghost nodes closer
                const strength = 0.05 * alpha;
                const force = strength / distance;
                
                source.vx! += dx * force;
                source.vy! += dy * force;
            });
        };

        // Force Simulation
        const simulation = d3.forceSimulation<D3Node>(d3Nodes)
            .force("link", d3.forceLink<D3Node, D3Link>(d3Links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(50).iterations(2))
            .force("ghostAttraction", ghostAttractionForce);

        // SVG Elements Selection
        const svg = d3.select(svgRef.current);
        const container = d3.select(containerRef.current);

        // Clear previous renders (if managing DOM manually, but here we use React for nodes, 
        // actually let's use D3 for rendering to ensure performance with the simulation tick)
        // Wait, mixing React render and D3 update is tricky. 
        // Let's use D3 to control the position attributes of the React-rendered elements?
        // OR let D3 render everything. D3 rendering is smoother for force graphs.
        // I will switch to D3 rendering entirely for the content inside containerRef.
        container.selectAll("*").remove();

        // Arrow Marker
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25) // Offset to not overlap node
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#94a3b8");

        // Links
        const link = container.append("g")
            .selectAll("g")
            .data(d3Links)
            .join("g");

        const linkPath = link.append("path")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-width", 2)
            .attr("fill", "none")
        //.attr("marker-end", "url(#arrowhead)"); // Optional arrow

        const linkText = link.append("text")
            .text(d => d.relation)
            .attr("font-size", "10px")
            .attr("fill", "#64748b")
            .attr("text-anchor", "middle")
            .attr("dy", -5)
            .style("pointer-events", "none")
            .style("text-shadow", "0 0 4px white");

        // Potential Connections (dotted lines from ghost nodes) - already calculated above
        const potentialLink = container.append("g")
            .selectAll("g")
            .data(potentialLinks)
            .join("g");

        const potentialLinkPath = potentialLink.append("path")
            .attr("stroke", "#94a3b8")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4,4")
            .attr("fill", "none")
            .attr("opacity", 0.35)
            .style("pointer-events", "all")
            .style("cursor", "help");

        const potentialLinkText = potentialLink.append("text")
            .text(d => d.relationshipType)
            .attr("font-size", "9px")
            .attr("fill", "#64748b")
            .attr("text-anchor", "middle")
            .attr("dy", -5)
            .attr("opacity", 0.6)
            .style("pointer-events", "none")
            .style("font-style", "italic")
            .style("text-shadow", "0 0 4px white");

        // Tooltip for potential connections
        potentialLinkPath.append("title")
            .text(d => `${d.relationshipType}\n\nEvidence: ${d.evidence}`);

        // Nodes
        const node = container.append("g")
            .selectAll<SVGGElement, D3Node>("g")
            .data(d3Nodes)
            .join("g")
            .attr("cursor", "pointer")
            .call(d3.drag<SVGGElement, D3Node>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );

        node.append("circle")
            .attr("r", d => d.id === selectedNodeId ? 45 : 35)
            .attr("fill", d => d.color || getColorForCategory(d.category))
            .attr("stroke", d => {
                if (d.isGhost) return "#9333ea"; // Purple for ghost nodes
                return d.id === selectedNodeId ? "#4f46e5" : "#fff";
            })
            .attr("stroke-width", d => d.id === selectedNodeId ? 3 : 2)
            .attr("stroke-dasharray", d => d.isGhost ? "5,5" : "0")
            .attr("opacity", d => d.isGhost ? 0.3 : 1)
            .attr("class", "transition-all duration-300 shadow-sm");

        // Node Label (ForeignObject for wrapping text)
        node.append("foreignObject")
            .attr("x", -35)
            .attr("y", -35)
            .attr("width", 70)
            .attr("height", 70)
            .append("xhtml:div")
            .style("height", "100%")
            .style("width", "100%")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("text-align", "center")
            .style("pointer-events", "none")
            .html(d => `<span class="text-xs font-medium text-slate-800 line-clamp-3 leading-tight px-1">${d.label}</span>`);

        // Click handler
        node.on("click", (event, d) => {
            onSelectNode(d.id);
        });

        // Ticker
        simulation.on("tick", () => {
            linkPath.attr("d", d => {
                const source = d.source as D3Node;
                const target = d.target as D3Node;
                return `M${source.x},${source.y} L${target.x},${target.y}`;
            });

            linkText
                .attr("x", d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
                .attr("y", d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

            // Update potential connection positions
            potentialLinkPath.attr("d", d => {
                return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
            });

            potentialLinkText
                .attr("x", d => (d.source.x! + d.target.x!) / 2)
                .attr("y", d => (d.source.y! + d.target.y!) / 2);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Zoom Behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Drag functions
        function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [d3Nodes, d3Links, selectedNodeId, onSelectNode, isFullScreen]); // Re-run when full screen toggles

    // Helper to render the content (avoids code duplication between card and full screen)
    const renderMapContent = (containerClass: string, isFull: boolean) => (
        <div className={`flex flex-col bg-white ${containerClass}`}>
            <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Concept Map
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        title={isFull ? "Exit Full Screen" : "Full Screen"}
                        onClick={() => setIsFullScreen(!isFull)}
                    >
                        {isFull ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                    {!isFull && selectedCategory && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectCategory(null)}
                            className="h-6 px-2 text-xs text-slate-500 hover:text-slate-900"
                        >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Restore All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <div className="flex-1 bg-slate-50 relative overflow-hidden">
                <svg
                    ref={svgRef}
                    className="w-full h-full cursor-move"
                >
                    <g ref={containerRef} />
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm space-y-2 pointer-events-auto">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Legend</div>
                    {['Core', 'Mechanism', 'Actor', 'Value'].map(cat => (
                        <div
                            key={cat}
                            className={`flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded ${selectedCategory === cat ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
                            onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getColorForCategory(cat) }}
                            />
                            <span className="text-xs text-slate-600">{cat}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (isFullScreen) {
        return (
            <div className="fixed inset-0 z-50 bg-white">
                {renderMapContent("h-screen w-screen", true)}
            </div>
        );
    }

    return (
        <Card className="h-[600px] flex flex-col overflow-hidden border-slate-200 shadow-sm relative">
            <div className="flex flex-col h-full">
                {/* We unmount/remount SVG on toggle, which restarts simulation. This is acceptable or even desired for resizing.
                    Wait, renderMapContent uses refs. If we call it here, refs need to be attached. 
                    Since we return one OR the other, refs connect to the active one. */
                    renderMapContent("h-full", false)
                }
            </div>
        </Card>
    );
}
