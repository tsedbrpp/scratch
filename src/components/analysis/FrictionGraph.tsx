"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, Focus } from "lucide-react";

interface FrictionGraphProps {
    data: any;
}

const CANVAS_W = 1200;
const CANVAS_H = 800;

export function FrictionGraph({ data }: FrictionGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const svgSelection = d3.select(svgRef.current);
        svgSelection.selectAll("*").remove();

        // 1. Prepare Nodes and Links
        const nodesMap = new Map<string, any>();
        const links: any[] = [];

        const addNode = (id: string, group: string, radius: number, label: string, dataObj?: any) => {
            if (!nodesMap.has(id)) {
                nodesMap.set(id, { id, group, radius, label, ...dataObj });
            }
        };

        const addLink = (source: string, target: string, type: 'consensus' | 'friction', weight: number) => {
            links.push({ source, target, type, weight });
        };

        // Track lenses as central hubs
        const allLenses = new Set<string>();

        data.consensus_zones?.forEach((z: any) => {
            const nodeId = `consensus_${z.topic}`;
            addNode(nodeId, "consensus", 10 + (z.strength || 5) * 1.5, z.topic, z);

            z.evidence_from_lenses?.forEach((lens: string) => {
                const lensId = `lens_${lens}`;
                allLenses.add(lens);
                addLink(lensId, nodeId, 'consensus', z.strength || 5);
            });
        });

        data.active_frictions?.forEach((f: any) => {
            const nodeId = `friction_${f.topic}`;
            addNode(nodeId, "friction", 10 + (f.intensity || 5) * 1.5, f.topic, f);

            f.detected_in_lenses?.forEach((lens: string) => {
                const lensId = `lens_${lens}`;
                allLenses.add(lens);
                addLink(lensId, nodeId, 'friction', f.intensity || 5);
            });
        });

        // Add the lens nodes themselves
        allLenses.forEach(lens => {
            addNode(`lens_${lens}`, "lens", 14, lens);
        });

        const nodes = Array.from(nodesMap.values());

        if (nodes.length === 0) {
            svgSelection
                .attr("viewBox", `0 0 ${CANVAS_W} ${CANVAS_H}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("width", "100%")
                .style("height", "100%")
                .append("text")
                .attr("x", CANVAS_W / 2)
                .attr("y", CANVAS_H / 2)
                .attr("text-anchor", "middle")
                .attr("fill", "#64748b")
                .attr("font-size", "14px")
                .text("No consensus or friction zones extracted. Map is empty.");
            return;
        }

        // 2. Setup D3 Structure
        const svg = svgSelection
            .attr("viewBox", `0 0 ${CANVAS_W} ${CANVAS_H}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "100%");

        const container = svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (e) => container.attr("transform", e.transform));

        svg.call(zoom as any);
        zoomRef.current = zoom as d3.ZoomBehavior<Element, unknown>;

        // 3. Force Simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance((d: any) => d.type === 'lens' ? 100 : 150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(CANVAS_W / 2, CANVAS_H / 2))
            .force("collide", d3.forceCollide().radius((d: any) => d.radius + 10).iterations(3));

        // 4. Draw Links
        const link = container.append("g")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", d => d.type === 'consensus' ? "#10b981" : "#f43f5e") // Emerald vs Rose
            .attr("stroke-width", d => Math.max(1, d.weight / 2))
            .attr("stroke-dasharray", d => d.type === 'friction' ? "4,4" : "none");

        // 5. Draw Nodes
        const nodeGroup = container.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(d3.drag<any, any>()
                .on("start", (e, d) => {
                    if (!e.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (e, d) => {
                    d.fx = e.x;
                    d.fy = e.y;
                })
                .on("end", (e, d) => {
                    if (!e.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );

        // Node Circles
        nodeGroup.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => {
                if (d.group === 'lens') return "#6366f1"; // Indigo
                if (d.group === 'consensus') return "#10b981"; // Emerald
                return "#f43f5e"; // Rose
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function (e, d) {
                d3.select(this).attr("stroke", "#000").attr("stroke-width", 3);

                if (tooltipRef.current) {
                    const t = d3.select(tooltipRef.current);
                    t.style("opacity", 1)
                        .html(
                            '<div class="font-bold text-sm mb-1">' + d.label + '</div>' +
                            (d.group !== 'lens' ? '<div class="text-xs text-slate-600 mb-1">' + (d.description || '') + '</div>' : '') +
                            '<div class="text-[10px] uppercase font-bold text-slate-400">' + d.group + '</div>'
                        )
                        .style("left", (e.pageX + 10) + "px")
                        .style("top", (e.pageY + 10) + "px");
                }
            })
            .on("mousemove", (e) => {
                if (tooltipRef.current) {
                    d3.select(tooltipRef.current)
                        .style("left", (e.pageX + 10) + "px")
                        .style("top", (e.pageY + 10) + "px");
                }
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
                if (tooltipRef.current) d3.select(tooltipRef.current).style("opacity", 0);
            });

        // Node Labels
        nodeGroup.append("text")
            .attr("dy", d => d.radius + 12)
            .attr("text-anchor", "middle")
            .text(d => d.label)
            .attr("font-size", d => d.group === 'lens' ? "12px" : "10px")
            .attr("font-weight", d => d.group === 'lens' ? "bold" : "normal")
            .attr("fill", "#334155")
            .style("pointer-events", "none")
            // simple text wrap for friction/consensus
            .each(function (d) {
                if (d.group !== 'lens' && d.label.length > 20) {
                    d3.select(this).text(d.label.substring(0, 20) + "...");
                }
            });

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Initial Zoom fit
        setTimeout(() => {
            const transform = d3.zoomIdentity.translate(CANVAS_W / 2, CANVAS_H / 2).scale(0.8).translate(-CANVAS_W / 2, -CANVAS_H / 2);
            svgSelection.transition().duration(750).call(zoom.transform as any, transform);
        }, 100);

        return () => {
            simulation.stop();
        };
    }, [data]);

    const handleZoom = useCallback((dir: "in" | "out") => {
        if (!svgRef.current || !zoomRef.current) return;
        const factor = dir === "in" ? 1.2 : 0.8;
        zoomRef.current.scaleBy(d3.select(svgRef.current).transition().duration(250) as any, factor);
    }, []);

    const handleReset = useCallback(() => {
        if (!svgRef.current || !zoomRef.current) return;
        const transform = d3.zoomIdentity.translate(CANVAS_W / 2, CANVAS_H / 2).scale(0.8).translate(-CANVAS_W / 2, -CANVAS_H / 2);
        zoomRef.current.transform(d3.select(svgRef.current).transition().duration(750) as any, transform);
    }, []);

    return (
        <div className="relative w-full h-full bg-slate-50/50">
            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="pointer-events-none fixed opacity-0 p-3 bg-white border border-slate-200 rounded-xl shadow-xl max-w-[280px] z-[9999] transition-opacity duration-150"
            />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-slate-200 p-1 z-10">
                <button
                    onClick={handleReset}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Reset Graph"
                ><Focus className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-slate-200 mx-1 self-center"></div>
                <button
                    onClick={() => handleZoom("out")}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Zoom Out"
                ><ZoomOut className="w-4 h-4" /></button>
                <button
                    onClick={() => handleZoom("in")}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Zoom In"
                ><ZoomIn className="w-4 h-4" /></button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-4 z-10 w-[260px]">
                <h4 className="font-semibold text-slate-800 text-sm mb-3">Map Legend</h4>

                <div className="space-y-3 text-xs text-slate-600">
                    <div>
                        <div className="font-medium text-slate-700 mb-1.5">Nodes</div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span>Consensus Zones</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                            <span>Active Frictions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                            <span>Analytical Lenses</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                        <div className="font-medium text-slate-700 mb-1.5">Connections</div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-0.5 bg-emerald-500"></div>
                            <span>Stabilizing Agreement</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-0 border-b-2 border-dashed border-rose-500"></div>
                            <span>Ideological Clash</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-px bg-slate-300"></div>
                            <span>Lens Association</span>
                        </div>
                    </div>
                </div>
            </div>

            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        </div>
    );
}
