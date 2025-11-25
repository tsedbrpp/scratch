"use client";

import { useMemo, useRef } from "react";
import { ResponsiveContainer, Sankey, Tooltip, Layer, Rectangle } from "recharts";
import { EcosystemImpact } from "@/types";

interface AssemblageSankeyProps {
    data: EcosystemImpact[];
    height?: number;
}

export function AssemblageSankey({ data, height = 500 }: AssemblageSankeyProps) {
    const chartData = useMemo(() => {
        const nodes: { name: string }[] = [];
        const links: { source: number; target: number; value: number; type?: string }[] = [];

        const nodeMap = new Map<string, number>();

        const getNodeIndex = (name: string) => {
            if (!nodeMap.has(name)) {
                nodeMap.set(name, nodes.length);
                nodes.push({ name });
            }
            return nodeMap.get(name)!;
        };

        data.forEach(item => {
            const actorIdx = getNodeIndex(item.actor);
            const mechanismIdx = getNodeIndex(item.mechanism);
            const impactIdx = getNodeIndex(item.impact);

            // Link: Actor -> Mechanism
            links.push({
                source: actorIdx,
                target: mechanismIdx,
                value: 1,
                type: item.type
            });

            // Link: Mechanism -> Impact
            links.push({
                source: mechanismIdx,
                target: impactIdx,
                value: 1,
                type: item.type
            });
        });

        // Aggregate identical links
        const uniqueLinksMap = new Map<string, { source: number; target: number; value: number; type: string }>();
        links.forEach(link => {
            const key = `${link.source}-${link.target}`;
            if (uniqueLinksMap.has(key)) {
                uniqueLinksMap.get(key)!.value += 1;
            } else {
                // @ts-ignore
                uniqueLinksMap.set(key, { ...link });
            }
        });

        return {
            nodes,
            links: Array.from(uniqueLinksMap.values())
        };
    }, [data]);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        if (!containerRef.current) return;

        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) {
            console.error("SVG element not found");
            return;
        }

        // Get SVG data
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Create image and draw to canvas
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Use the actual SVG dimensions or the container dimensions
            const width = svgElement.clientWidth || 800;
            const height = svgElement.clientHeight || 500;

            // Scale up for better resolution
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);

            // Trigger download
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'assemblage-sankey.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No data available for visualization
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height }} className="relative" ref={containerRef}>
            <div className="absolute top-0 right-0 z-10">
                <button
                    onClick={handleDownload}
                    className="bg-white/80 hover:bg-white border border-slate-200 text-slate-600 text-xs font-medium px-2 py-1 rounded shadow-sm backdrop-blur-sm transition-colors"
                    title="Download as PNG"
                >
                    Download PNG
                </button>
            </div>

            {/* Column Headers */}
            <div className="flex justify-between px-4 mb-2 text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">
                <div className="w-1/3 text-left">Actors</div>
                <div className="w-1/3 text-center">Mechanisms</div>
                <div className="w-1/3 text-right pr-40">Impacts</div>
            </div>

            <ResponsiveContainer>
                <Sankey
                    data={chartData}
                    node={(props: any) => {
                        const { x, y, width, height, index, payload, containerWidth } = props;
                        const isOut = x + width + 6 > (containerWidth || 500) / 2;

                        // Determine color based on node type or connection
                        const fill = "#3b82f6";

                        // Truncate text if it's too long
                        const truncateText = (text: string, maxLength: number) => {
                            if (text.length <= maxLength) return text;
                            return text.slice(0, maxLength) + '...';
                        };

                        return (
                            <Layer key={`CustomNode${index}`}>
                                <Rectangle x={x} y={y} width={width} height={height} fill={fill} fillOpacity="1" />
                                <text
                                    textAnchor={isOut ? 'end' : 'start'}
                                    x={isOut ? x - 6 : x + width + 6}
                                    y={y + height / 2}
                                    fontSize="11"
                                    stroke="none"
                                    fill="#1e293b"
                                    dy="0.355em"
                                    fontWeight="500"
                                >
                                    {truncateText(payload.name, 35)}
                                </text>
                                <title>{payload.name}</title>
                            </Layer>
                        );
                    }}
                    link={(props: any) => {
                        const { sourceX, sourceY, targetX, targetY, linkWidth, payload } = props;
                        // Color links based on the "type" of the impact
                        const isConstraint = payload.type === "Constraint";
                        const color = isConstraint ? "#fca5a5" : "#86efac"; // Red-300 for constraint, Green-300 for affordance
                        const opacity = 0.6;

                        return (
                            <path
                                d={`
                                     M${sourceX},${sourceY + linkWidth / 2}
                                     C${sourceX + 100},${sourceY + linkWidth / 2}
                                     ${targetX - 100},${targetY + linkWidth / 2}
                                     ${targetX},${targetY + linkWidth / 2}
                                     L${targetX},${targetY - linkWidth / 2}
                                     C${targetX - 100},${targetY - linkWidth / 2}
                                     ${sourceX + 100},${sourceY - linkWidth / 2}
                                     ${sourceX},${sourceY - linkWidth / 2}
                                     Z
                                 `}
                                fill={color}
                                fillOpacity={opacity}
                                stroke={isConstraint ? "#ef4444" : "#22c55e"}
                                strokeWidth={1}
                                strokeOpacity={0.2}
                            />
                        );
                    }}
                    nodePadding={50}
                    margin={{
                        left: 20,
                        right: 160,
                        top: 20,
                        bottom: 20,
                    }}
                >
                    <Tooltip />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
}
