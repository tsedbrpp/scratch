import React, { useRef, useState } from 'react';
import { OntologyNode, OntologyLink } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface OntologyMapProps {
    nodes: OntologyNode[];
    links: OntologyLink[];
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
    selectedNodeId: string | null;
    onSelectNode: (nodeId: string | null) => void;
    onNodeDrag: (nodeId: string, x: number, y: number) => void;
}

export function OntologyMap({
    nodes,
    links,
    selectedCategory,
    onSelectCategory,
    selectedNodeId,
    onSelectNode,
    onNodeDrag
}: OntologyMapProps) {
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setDraggingNodeId(nodeId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingNodeId || !svgRef.current) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const y = e.clientY - svgRect.top;

        onNodeDrag(draggingNodeId, x, y);
    };

    const handleMouseUp = () => {
        setDraggingNodeId(null);
    };

    return (
        <Card className="h-[600px] flex flex-col overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Concept Map
                </CardTitle>
                <div className="flex items-center gap-2">
                    {selectedCategory && (
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
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Links */}
                    {links.map((link, i) => {
                        const source = nodes.find(n => n.id === link.source);
                        const target = nodes.find(n => n.id === link.target);
                        if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return null;

                        const midX = (source.x + target.x) / 2;
                        const midY = (source.y + target.y) / 2;

                        return (
                            <g key={i}>
                                <line
                                    x1={source.x}
                                    y1={source.y}
                                    x2={target.x}
                                    y2={target.y}
                                    stroke="#cbd5e1"
                                    strokeWidth="2"
                                />
                                <text
                                    x={midX}
                                    y={midY}
                                    textAnchor="middle"
                                    dy={-4}
                                    className="text-[10px] fill-slate-500 font-medium pointer-events-none select-none"
                                    style={{ textShadow: "0 0 4px white, 0 0 4px white" }}
                                >
                                    {link.relation}
                                </text>
                            </g>
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => (
                        <g
                            key={node.id}
                            transform={`translate(${node.x},${node.y})`}
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onClick={() => onSelectNode(node.id)}
                            className="cursor-pointer transition-opacity duration-200"
                            style={{
                                opacity: hoveredNodeId && hoveredNodeId !== node.id ? 0.4 : 1
                            }}
                        >
                            <circle
                                r={selectedNodeId === node.id ? 45 : 40}
                                fill={node.color || getColorForCategory(node.category)}
                                className="transition-all duration-300 shadow-sm"
                                stroke={selectedNodeId === node.id ? "#4f46e5" : "white"}
                                strokeWidth={selectedNodeId === node.id ? 3 : 2}
                            />
                            <foreignObject x="-35" y="-35" width="70" height="70">
                                <div className="h-full w-full flex items-center justify-center text-center">
                                    <span className="text-xs font-medium text-slate-800 line-clamp-3 leading-tight px-1">
                                        {node.label}
                                    </span>
                                </div>
                            </foreignObject>
                        </g>
                    ))}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
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
        </Card>
    );
}
