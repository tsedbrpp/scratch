import React, { useMemo } from 'react';
import { DiscourseCluster } from '@/types/cultural';

interface ClusterNetworkGraphProps {
    clusters: DiscourseCluster[];
    onClusterClick?: (clusterId: string) => void;
}

export function ClusterNetworkGraph({ clusters, onClusterClick }: ClusterNetworkGraphProps) {
    // Calculate cluster relationships based on shared themes
    const { nodes, edges } = useMemo(() => {
        const nodes = clusters.map((cluster, idx) => ({
            id: cluster.id,
            label: cluster.name,
            size: cluster.size,
            x: 0, // Will be calculated by layout
            y: 0,
            color: `hsl(${(idx * 360) / clusters.length}, 70%, 60%)`
        }));

        const edges: Array<{ source: string; target: string; weight: number }> = [];

        // Calculate shared themes between clusters
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const shared = clusters[i].themes.filter(theme =>
                    clusters[j].themes.includes(theme)
                ).length;

                if (shared > 0) {
                    edges.push({
                        source: clusters[i].id,
                        target: clusters[j].id,
                        weight: shared
                    });
                }
            }
        }

        return { nodes, edges };
    }, [clusters]);

    // Simple force-directed layout (very basic - for MVP)
    const layoutNodes = useMemo(() => {
        const width = 600;
        const height = 400;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        // Circular layout as fallback (simple but effective for small graphs)
        return nodes.map((node, i) => {
            const angle = (i * 2 * Math.PI) / nodes.length;
            return {
                ...node,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    }, [nodes]);

    const maxSize = Math.max(...nodes.map(n => n.size), 1);
    const maxWeight = Math.max(...edges.map(e => e.weight), 1);

    return (
        <div className="relative w-full h-[400px] bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 600 400" className="w-full h-full">
                {/* Render edges first (behind nodes) */}
                <g className="edges">
                    {edges.map((edge, i) => {
                        const source = layoutNodes.find(n => n.id === edge.source);
                        const target = layoutNodes.find(n => n.id === edge.target);
                        if (!source || !target) return null;

                        const opacity = 0.1 + (edge.weight / maxWeight) * 0.4;
                        const strokeWidth = 1 + (edge.weight / maxWeight) * 3;

                        return (
                            <line
                                key={i}
                                x1={source.x}
                                y1={source.y}
                                x2={target.x}
                                y2={target.y}
                                stroke="#94a3b8"
                                strokeWidth={strokeWidth}
                                opacity={opacity}
                                strokeDasharray={edge.weight === 1 ? "2,2" : "none"}
                            />
                        );
                    })}
                </g>

                {/* Render nodes */}
                <g className="nodes">
                    {layoutNodes.map((node) => {
                        const r = 15 + (node.size / maxSize) * 35;

                        return (
                            <g
                                key={node.id}
                                onClick={() => onClusterClick?.(node.id)}
                                className="cursor-pointer group"
                            >
                                {/* Node circle */}
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={r}
                                    fill={node.color}
                                    opacity={0.7}
                                    className="transition-all group-hover:opacity-95 group-hover:stroke-slate-900"
                                    strokeWidth={2}
                                    stroke="white"
                                />

                                {/* Size badge */}
                                <circle
                                    cx={node.x + r * 0.6}
                                    cy={node.y - r * 0.6}
                                    r={8}
                                    fill="white"
                                    stroke={node.color}
                                    strokeWidth={2}
                                    className="group-hover:stroke-slate-900"
                                />
                                <text
                                    x={node.x + r * 0.6}
                                    y={node.y - r * 0.6}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="text-[10px] font-bold fill-slate-700 pointer-events-none"
                                >
                                    {node.size}
                                </text>

                                {/* Label */}
                                <text
                                    x={node.x}
                                    y={node.y + r + 15}
                                    textAnchor="middle"
                                    className="text-xs font-semibold fill-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-md p-2 text-xs space-y-1 border border-slate-200">
                <div className="font-semibold text-slate-700 mb-1">Legend</div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-400" />
                    <span className="text-slate-600">Cluster (size = themes)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 bg-slate-400" />
                    <span className="text-slate-600">Shared themes</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 italic">Hover for name, click to view</div>
            </div>
        </div>
    );
}
