"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Badge } from "@/components/ui/badge";
import { Crosshair, FileText, Target, Zap, Maximize2, Minimize2, X, Activity, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { toast } from "sonner"; // Assuming toast is available, if not use simple alert or local state feedback

interface VectorObject {
    name: string;
    intensity: string;
    description: string;
}

interface VectorsForceGraphProps {
    vectors: (VectorObject | string)[];
    narrativeContext: string;
    executiveSummary: string;
    scoring?: {
        connectivity: string;
        intensity: string;
        decoding_impact: string;
        exteriority: string;
        trajectory: string;
    };
    monitoredVectors?: string[];
    onToggleMonitor?: (id: string) => void;
}

interface VectorPoint {
    id: string;
    x: number;
    y: number;
    baseX: number; // Home position X
    baseY: number; // Home position Y
    angle: number;
    snippet: string;
    tension: number; // Calculated from INDIVIDUAL score (0-1)
    intensityLabel: string; // Store for UI
}

export function VectorsForceGraph({ vectors, narrativeContext, executiveSummary, scoring, monitoredVectors = [], onToggleMonitor }: VectorsForceGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedVector, setSelectedVector] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Toggle Tracking
    const handleTrackStrategy = (id: string | null) => {
        if (!id || !onToggleMonitor) return;
        onToggleMonitor(id);
    };

    // Robustly handle legacy data (string[]) mixed with new data (VectorObject[])
    const normalizedVectors = useMemo(() => {
        if (!vectors) return [];
        return vectors.map((v: VectorObject | string) => {
            if (typeof v === 'string') {
                return {
                    name: v,
                    intensity: "Medium", // Default for legacy data
                    description: ""
                };
            }
            return v;
        });
    }, [vectors]);

    // Determine Tension from Score String
    const getTension = (intensityStr: string) => {
        const s = intensityStr.trim().toLowerCase();
        if (s.includes('high')) return 0.9;  // Tight, snappy
        if (s.includes('medium')) return 0.5; // Normal
        if (s.includes('low')) return 0.2; // Loose
        return 0.5; // Default
    };

    // Memoize text extraction and short label generation
    // Now simplified because we have structured data objects!
    const vectorData = useMemo(() => {
        return normalizedVectors.map((v: VectorObject) => {
            const fullText = (executiveSummary + " " + narrativeContext);

            // Use provided description if good, otherwise extraction fallback
            let snippet = v.description;
            if (!snippet || snippet.length < 10) {
                // Fallback Extraction Logic
                let index = fullText.toLowerCase().indexOf(v.name.toLowerCase());
                if (index === -1) {
                    const keywords = v.name.split(" ").filter(w => w.length > 4);
                    if (keywords.length > 0) {
                        const bestKeyword = keywords.reduce((a, b) => a.length > b.length ? a : b);
                        index = fullText.toLowerCase().indexOf(bestKeyword.toLowerCase());
                    }
                }
                if (index !== -1) {
                    const start = Math.max(0, fullText.lastIndexOf(".", index) + 1);
                    const end = Math.min(fullText.length, fullText.indexOf(".", index + v.name.length + 50) + 1);
                    snippet = fullText.substring(start, end).trim();
                } else {
                    snippet = narrativeContext || "No detailed context available.";
                }
            }

            // Create short label: First 3-4 words max
            const words = v.name.split(" ");
            let shortLabel = v.name;
            if (words.length > 4) {
                shortLabel = words.slice(0, 4).join(" ") + "...";
            }
            if (shortLabel.length > 30) {
                shortLabel = shortLabel.substring(0, 28) + "...";
            }

            return {
                id: v.name, // Use name as ID
                shortLabel,
                snippet,
                intensityLabel: v.intensity, // Correct property name
                tension: getTension(v.intensity)
            };
        });
    }, [normalizedVectors, executiveSummary, narrativeContext]);

    const getSnippet = (id: string) => vectorData.find(v => v.id === id)?.snippet || "";
    const getLabel = (id: string) => vectorData.find(v => v.id === id)?.shortLabel || id.substring(0, 15) + "...";
    const getSpecificIntensity = (id: string) => vectorData.find(v => v.id === id)?.intensityLabel || "Unknown";
    const getSpecificTension = (id: string) => vectorData.find(v => v.id === id)?.tension || 0.5;

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
            // Get dimensions from container
            const width = containerRef.current?.clientWidth || 800;
            const height = containerRef.current?.clientHeight || 600;

            const canvas = document.createElement("canvas");
            const scale = 2; // High res
            canvas.width = width * scale;
            canvas.height = height * scale;
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
            ctx.fillText("Generated by Instant TEA", width - 20, height - 40);

            ctx.font = "16px sans-serif";
            ctx.fillStyle = "rgba(100, 116, 139, 0.4)";
            ctx.fillText("instanttea.com", width - 20, height - 20);

            // 5. Download
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `vectors-snapshot-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            URL.revokeObjectURL(url);
        };
        img.src = url;
    };


    useEffect(() => {
        if (!containerRef.current) return;

        const drawGraph = () => {
            if (!containerRef.current || !svgRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - (isFullScreen ? 150 : 60);

            // Clear layout
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();

            // 1. Core "Regime" Circle
            const coreGroup = svg.append("g")
                .attr("transform", `translate(${centerX}, ${centerY})`);

            // Pulsing Effect
            coreGroup.append("circle")
                .attr("r", isFullScreen ? 40 : 25)
                .attr("fill", "#f1f5f9")
                .attr("opacity", 0.5)
                .append("animate")
                .attr("attributeName", "r")
                .attr("values", `${isFullScreen ? 40 : 25};${isFullScreen ? 50 : 35};${isFullScreen ? 40 : 25}`)
                .attr("dur", "4s")
                .attr("repeatCount", "indefinite");

            // Main Core
            coreGroup.append("circle")
                .attr("r", isFullScreen ? 30 : 20)
                .attr("fill", "#fff")
                .attr("stroke", "#94a3b8")
                .attr("stroke-width", 2)
                .attr("class", "shadow-sm");

            coreGroup.append("text")
                .text("REGIME")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .attr("font-size", isFullScreen ? "10px" : "8px")
                .attr("font-weight", "bold")
                .attr("fill", "#64748b")
                .attr("letter-spacing", "1px");

            // 2. Vectors (Radial Layout with Physics)
            const angleStep = (2 * Math.PI) / normalizedVectors.length;

            // Initial Points
            const points: VectorPoint[] = vectorData.map((v, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const baseX = Math.cos(angle) * (radius * 0.8);
                const baseY = Math.sin(angle) * (radius * 0.8);
                return {
                    id: v.id,
                    angle: angle,
                    x: baseX,
                    y: baseY,
                    baseX: baseX,
                    baseY: baseY,
                    snippet: v.snippet,
                    intensityLabel: v.intensityLabel,
                    tension: v.tension
                };
            });

            const linesGroup = svg.append("g")
                .attr("transform", `translate(${centerX}, ${centerY})`);

            // Store references to update during drag
            const allTethers: d3.Selection<SVGPathElement, unknown, null, undefined>[] = [];

            // Render Loop for Physics
            points.forEach((p, i) => {
                const labelX = Math.cos(p.angle) * (radius);
                const labelY = Math.sin(p.angle) * (radius);
                const isTracked = monitoredVectors.includes(p.id);

                // A. Connection Line (Elastic)
                // Note: Start point is dynamic (0,0 initially)
                const tether = linesGroup.append("path")
                    .attr("d", `M 0,0 L ${p.x},${p.y}`)
                    .attr("stroke", isTracked ? "#22c55e" : "#fdba74")
                    .attr("stroke-width", isTracked ? 2 : 1.5)
                    .attr("stroke-dasharray", "4,2")
                    .attr("opacity", 0.6)
                    .attr("fill", "none")
                    .attr("class", "tether-line"); // Class for easy selection

                allTethers.push(tether);

                // B. Node with Drag
                const node = linesGroup.append("circle")
                    .attr("cx", p.x)
                    .attr("cy", p.y)
                    .attr("r", isFullScreen ? 8 : 5)
                    .attr("fill", isTracked ? "#22c55e" : "#fff")
                    .attr("stroke", isTracked ? "#166534" : "#f97316")
                    .attr("stroke-width", 2)
                    .attr("cursor", "grab")
                    .attr("class", `transition-colors hover:fill-orange-50 ${selectedVector === p.id ? 'fill-orange-100 stroke-[3px]' : ''}`);

                // C. Label (Static Reference Point)
                const labelGroup = linesGroup.append("g")
                    .attr("transform", `translate(${labelX}, ${labelY})`)
                    .style("cursor", "pointer")
                    .on("click", (e) => {
                        e.stopPropagation();
                        setSelectedVector(p.id === selectedVector ? null : p.id);
                    });

                labelGroup.append("text")
                    .text(getLabel(p.id))
                    .attr("text-anchor", p.angle > -Math.PI / 2 && p.angle < Math.PI / 2 ? "start" : "end")
                    .attr("dy", "0.35em")
                    .attr("dx", p.angle > -Math.PI / 2 && p.angle < Math.PI / 2 ? 10 : -10)
                    .attr("font-size", isFullScreen ? "14px" : "10px")
                    .attr("font-weight", selectedVector === p.id ? "bold" : "500")
                    .attr("fill", selectedVector === p.id ? "#ea580c" : (isTracked ? "#15803d" : "#475569"))
                    .append("title")
                    .text(p.id);

                // DRAG BEHAVIOR (Tactile Physics + Regime Displacement)
                const drag = d3.drag<SVGCircleElement, unknown>()
                    .on("start", function () {
                        d3.select(this).attr("cursor", "grabbing").attr("r", isFullScreen ? 10 : 7);
                    })
                    .on("drag", function (event) {
                        // 1. Update dragged node position
                        d3.select(this).attr("cx", event.x).attr("cy", event.y);

                        // 2. Calculate Regime Displacement (Inverse Kinematics-ish)
                        // The harder you pull (further from base), the more the Regime moves
                        // Weighted by 'tension' (intensity)
                        const limit = radius * 0.4; // Max displacement limit
                        const pullX = (event.x - p.baseX) * p.tension * 0.4;
                        const pullY = (event.y - p.baseY) * p.tension * 0.4;

                        // Apply dampening and limit
                        const coreDx = Math.max(-limit, Math.min(limit, pullX));
                        const coreDy = Math.max(-limit, Math.min(limit, pullY));

                        // Move the Regime Core
                        coreGroup.attr("transform", `translate(${centerX + coreDx}, ${centerY + coreDy})`);

                        // 3. Update ALL tethers to point to the new core position
                        // For the dragged node, we curve it. For others, straight lines from new core to their static base.
                        linesGroup.selectAll(".tether-line").each(function (d, idx) {
                            const path = d3.select(this);
                            // Is this the dragged tether?
                            if (idx === i) {
                                path.attr("d", `M ${coreDx},${coreDy} Q ${event.x * 0.3 + coreDx},${event.y * 0.3 + coreDy} ${event.x},${event.y}`)
                                    .attr("stroke-opacity", 1)
                                    .attr("stroke-width", 2)
                                    .attr("stroke-dasharray", "none");
                            } else {
                                // Other tethers: Straight line from shifted Core to their fixed Node
                                // Access the *other* point's base coordinates
                                const otherP = points[idx];
                                path.attr("d", `M ${coreDx},${coreDy} L ${otherP.x},${otherP.y}`);
                            }
                        });
                    })
                    .on("end", function (event) {
                        d3.select(this).attr("cursor", "grab").attr("r", isFullScreen ? 8 : 5);

                        // ELASTIC SNAP BACK (Reterritorialization)
                        const startX = event.x;
                        const startY = event.y;

                        // We need to know where the Core currently is to animate it back
                        // Parse current transform (simple hack or track state? transform string parsing is reliable enough here)
                        const currentTransform = coreGroup.attr("transform");
                        const translateMatch = /translate\(([^,]+),\s*([^)]+)\)/.exec(currentTransform || "");
                        const currentCoreX = translateMatch ? parseFloat(translateMatch[1]) - centerX : 0;
                        const currentCoreY = translateMatch ? parseFloat(translateMatch[2]) - centerY : 0;

                        const duration = 1000 - (p.tension * 600);
                        const ease = d3.easeElasticOut.amplitude(1).period(0.3);

                        // Animate Node and Core together
                        const t = d3.transition().duration(duration).ease(ease);

                        // 1. Animate Node Back
                        d3.select(this).transition(t)
                            .attrTween("cx", () => (t: number) => d3.interpolateNumber(startX, p.baseX)(t).toString())
                            .attrTween("cy", () => (t: number) => d3.interpolateNumber(startY, p.baseY)(t).toString());

                        // 2. Animate Core Back to 0,0
                        coreGroup.transition(t)
                            .attrTween("transform", () => {
                                const iX = d3.interpolateNumber(currentCoreX, 0);
                                const iY = d3.interpolateNumber(currentCoreY, 0);
                                return (t: number) => `translate(${centerX + iX(t)}, ${centerY + iY(t)})`;
                            });

                        // 3. Sync Tethers (Complex Tween)
                        // Simplified: We attach a custom tween on the *dragged node* that updates everything
                        d3.select(this).transition(t).tween("updateNetwork", () => {
                            const nodeIX = d3.interpolateNumber(startX, p.baseX);
                            const nodeIY = d3.interpolateNumber(startY, p.baseY);
                            const coreIX = d3.interpolateNumber(currentCoreX, 0);
                            const coreIY = d3.interpolateNumber(currentCoreY, 0);

                            return (t: number) => {
                                const cx = coreIX(t);
                                const cy = coreIY(t);
                                const nx = nodeIX(t);
                                const ny = nodeIY(t);

                                // Update Tethers
                                linesGroup.selectAll(".tether-line").each(function (d, idx) {
                                    const pt = points[idx]; // Fixed target
                                    if (idx === i) {
                                        // Dragged line (straightening out)
                                        d3.select(this).attr("d", `M ${cx},${cy} L ${nx},${ny}`);
                                    } else {
                                        // Passive lines (moving origin)
                                        d3.select(this).attr("d", `M ${cx},${cy} L ${pt.x},${pt.y}`);
                                    }
                                });
                            };
                        })
                            .on("end", () => {
                                // Reset styles
                                linesGroup.selectAll(".tether-line").attr("stroke-dasharray", "4,2").attr("stroke-width", (d, i) => monitoredVectors.includes(points[i].id) ? 2 : 1.5).attr("opacity", 0.6);
                            });
                    });

                node.on("click", (e) => {
                    e.stopPropagation();
                    setSelectedVector(p.id === selectedVector ? null : p.id);
                });
                node.call(drag);
            });
        };

        // Use ResizeObserver for robust layout changes
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(drawGraph);
        });

        resizeObserver.observe(containerRef.current);

        // Initial draw
        drawGraph();

        return () => resizeObserver.disconnect();
    }, [isFullScreen, normalizedVectors, selectedVector, monitoredVectors, vectorData]); // Added vectorData dependency

    // Get selected vector data for sidebar
    const selectedData = selectedVector ? vectorData.find(v => v.id === selectedVector) : null;

    return (
        <div
            ref={containerRef}
            className={`
                relative bg-slate-50/50 rounded-xl border border-dashed border-slate-200 overflow-hidden transition-all duration-500 ease-in-out
                ${isFullScreen
                    ? 'fixed inset-0 z-[100] bg-white w-screen h-screen'
                    : 'w-full h-[360px]'}
            `}
        >
            {/* GRAPH AREA */}
            <div className={`w-full h-full relative`}>

                {/* Header Controls */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <Button
                        variant={isFullScreen ? "default" : "outline"}
                        size="sm"
                        className="shadow-sm border-slate-200"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                        {isFullScreen ? "Exit Fullscreen" : "Expand View"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="shadow-sm border-slate-200"
                        onClick={handleExport}
                        title="Export PNG"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Legend / Title */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur text-orange-600 border-orange-200 px-3 py-1 shadow-sm">
                            <Zap className="h-3 w-3 mr-1" /> Vectors of Deterritorialization
                        </Badge>
                    </div>
                </div>

                <svg ref={svgRef} className="w-full h-full cursor-default" onClick={() => setSelectedVector(null)}></svg>
            </div>

            {/* SIDEBAR DETAILS PANEL (Absolute positioning to prevent layout shifts) */}
            <div className={`
                absolute right-0 top-0 bottom-0 bg-white/95 backdrop-blur shadow-2xl border-l border-slate-200 z-30 
                transition-transform duration-300 ease-in-out
                ${isFullScreen ? 'w-[400px]' : 'w-[90%] max-w-[400px]'}
                ${selectedVector ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {selectedData && (
                    <div className="h-full flex flex-col">
                        {/* Panel Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center">
                                    <Crosshair className="h-3 w-3 mr-1 text-orange-500" /> Vector Analysis
                                </div>
                                <h3 className="font-bold text-slate-800 leading-tight text-lg">{selectedData.id}</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedVector(null)}>
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        {/* Panel Content (Native Scroll) */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
                            <div className="space-y-6">
                                {/* Context Card */}
                                <div className="space-y-2">
                                    <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        <FileText className="h-3 w-3 mr-2" /> Intelligence Extract
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 italic leading-relaxed relative">
                                        <div className="absolute top-2 left-2 text-slate-300 text-2xl font-serif">“</div>
                                        {selectedData.snippet}
                                        <div className="absolute bottom-2 right-2 text-slate-300 text-2xl font-serif">”</div>
                                    </div>
                                </div>

                                {/* Analysis (Dynamic Mapping) */}
                                <div className="space-y-2">
                                    <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        <Activity className="h-3 w-3 mr-2" /> Impact Assessment
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-orange-50/50 p-2 rounded border border-orange-100">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-500">Trajectory</span>
                                                <span className="font-semibold text-orange-700">{scoring?.trajectory || "Emergent"}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Intensity</span>
                                                <span className="font-semibold text-orange-700">{selectedData.intensityLabel}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>System Disruption Potential</span>
                                                <span>{Math.round(selectedData.tension * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${selectedData.tension * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
                            <Button
                                className={`w-full text-white transition-colors ${monitoredVectors.includes(selectedData.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                                onClick={() => handleTrackStrategy(selectedData.id)}
                            >
                                {monitoredVectors.includes(selectedData.id) ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Strategy Tracked
                                    </>
                                ) : (
                                    <>
                                        <Target className="h-4 w-4 mr-2" /> Track Strategy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Instructions */}
            {!selectedVector && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none w-full text-center px-4">
                    <p className="text-slate-500 text-xs bg-white/60 backdrop-blur-md py-1.5 px-4 rounded-full inline-block shadow-sm border border-slate-200 font-medium">
                        Drag and stretch vectors to assess the strength of moving the regime
                    </p>
                </div>
            )}
        </div>
    );
}
