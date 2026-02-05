import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { SimulationNode } from '@/hooks/useForceGraph';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { Play, Pause, RotateCcw, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
    isExpanded: boolean;
    nodes: SimulationNode[];
}

interface ProcessedItem {
    id: string;
    originalName: string;
    translationCode: string;
    type: "social" | "economic" | "technical" | "resistance";
    timestamp: number;
}

export function CodingView({ isExpanded, nodes }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [processedLog, setProcessedLog] = useState<ProcessedItem[]>([]);
    const processedIdsRef = useRef<Set<string>>(new Set());


    // Pause Control
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(false);

    // Theory Dialog
    const [showTheory, setShowTheory] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Handle container resizing
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Sync Ref for D3 Timer
    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current || dimensions.width === 0) return;
        const { width, height } = dimensions;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .html("");

        // --- Visual Setup ---
        const filterX = width / 2;

        // Background Zones
        svg.append("rect").attr("x", 0).attr("width", filterX).attr("y", 0).attr("height", height).attr("fill", "#f8fafc");
        svg.append("rect").attr("x", filterX).attr("width", width / 2).attr("y", 0).attr("height", height).attr("fill", "#ecfdf5");

        // The Filter Barrier
        svg.append("line")
            .attr("x1", filterX)
            .attr("y1", 20)
            .attr("x2", filterX)
            .attr("y2", height - 20)
            .attr("stroke", "#334155")
            .attr("stroke-width", 4)
            .attr("stroke-dasharray", "8 4");

        svg.append("text").attr("x", width * 0.25).attr("y", 30).attr("text-anchor", "middle").attr("class", "text-xs font-bold text-slate-400 uppercase").text("Raw Social Reality");
        svg.append("text").attr("x", width * 0.75).attr("y", 30).attr("text-anchor", "middle").attr("class", "text-xs font-bold text-emerald-600 uppercase").text("coded metrics");

        interface Particle {
            id: string;
            name: string;
            x: number;
            y: number;
            vx: number; // Add velocity X
            vy: number; // Add velocity Y
            type: "social" | "economic" | "technical"; // Add technical
            baseR: number;
            nodeType: string;
            isResisting?: boolean; // Track resistance state
        }

        // --- Particles (Mapped from Nodes) ---
        const validNodes = nodes.filter(n => !n.isHidden);

        const getCategory = (type: string) => {
            const t = type.toLowerCase();
            if (
                t.includes('market') || t.includes('capital') || t.includes('infra') ||
                t.includes('economic') || t.includes('finance') || t.includes('industry') ||
                t.includes('commercial') || t.includes('investment') || t.includes('bank') ||
                t.includes('business') || t.includes('utility') || t.includes('governance')
            ) return 'economic';

            if (
                t.includes('tech') || t.includes('artifact') || t.includes('resource') ||
                t.includes('data') || t.includes('algorithm') || t.includes('software') ||
                t.includes('hardware') || t.includes('machine') || t.includes('digital') ||
                t.includes('automated') || t.includes('tool') || t.includes('platform')
            ) return 'technical';

            return 'social';
        };

        const particles: Particle[] = validNodes.map((n, i) => ({
            id: n.id,
            name: n.name,
            x: -20 - (Math.random() * width),
            y: 50 + Math.random() * (height - 100),
            type: getCategory(n.type) as "social" | "economic" | "technical",
            baseR: n.radius ? n.radius / 3 : 5,
            vx: 1 + Math.random() * 1.5, // Init velocity X
            vy: (Math.random() - 0.5) * 0.5, // Slight random jitter Y
            nodeType: n.type
        }));

        // Fallback
        if (particles.length === 0) {
            for (let i = 0; i < 30; i++) {
                particles.push({
                    id: `Actor-${i}`,
                    name: `Actor ${i}`,
                    x: -Math.random() * width,
                    y: 50 + Math.random() * (height - 100),
                    type: Math.random() > 0.6 ? 'social' : Math.random() > 0.3 ? 'technical' : 'economic',
                    baseR: 5 + Math.random() * 5,
                    vx: 1 + Math.random() * 2,
                    vy: 0,
                    nodeType: 'Generated'
                });
            }
        }

        const timer = d3.timer(() => {
            if (isPausedRef.current) return;

            // Update
            let newItems: ProcessedItem[] = [];

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Resistance Logic (The Fragility of the Network)
                if (p.x > filterX - 5 && p.x < filterX + 5 && !p.isResisting && !processedIdsRef.current.has(p.id)) {
                    // Small chance to resist translation (bounce off)
                    // Social actors resist more (15%), Technical (5%), Economic (1%)
                    const resistanceChance = p.type === 'social' ? 0.15 : p.type === 'technical' ? 0.05 : 0.01;

                    if (Math.random() < resistanceChance) {
                        p.isResisting = true;
                        p.vx = -Math.abs(p.vx * 3);
                        p.vy = (Math.random() - 0.5) * 4;

                        // Log Resistance (Instability Node)
                        if (!processedIdsRef.current.has(p.id)) {
                            processedIdsRef.current.add(p.id);
                            newItems.push({
                                id: p.id,
                                originalName: p.name,
                                translationCode: `LINE_OF_FLIGHT_${Math.floor(Math.random() * 100)}`,
                                type: 'resistance' as any, // Cast to any to bypass strict type for now or add to interface
                                timestamp: Date.now()
                            });
                        }
                    }
                }

                // Detection Logic (Successful Translation)
                if (p.x > filterX && !processedIdsRef.current.has(p.id) && !p.isResisting) {
                    processedIdsRef.current.add(p.id);

                    // Add to log
                    newItems.push({
                        id: p.id,
                        originalName: p.name,
                        translationCode: p.type === 'social' ? `ERR_REDUCT_${Math.floor(Math.random() * 1000)}` :
                            p.type === 'technical' ? `ARTIFACT_${Math.floor(Math.random() * 1000)}` :
                                `METRIC_${Math.floor(Math.random() * 1000)}`,
                        type: p.type === 'technical' ? 'economic' : p.type, // Group technical with economic for simplicity in log color, or keep separate?
                        timestamp: Date.now()
                    });
                }

                // Loop around or reset resistant particles
                if (p.x > width + 50 || p.x < -100 || p.y < -50 || p.y > height + 50) {
                    p.x = -50;
                    p.y = 50 + Math.random() * (height - 100);
                    p.vx = 1 + Math.random() * 1.5; // Reset speed
                    p.vy = 0;
                    p.isResisting = false;
                    processedIdsRef.current.delete(p.id);
                }
            });

            if (newItems.length > 0) {
                setProcessedLog(prev => [...newItems, ...prev].slice(0, 50));
            }

            // Draw
            const selection = svg.selectAll<SVGGElement, Particle>(".particle")
                .data(particles, (d: Particle) => d.id);

            const enter = selection.enter().append("g").attr("class", "particle");

            enter.filter((d: Particle) => d.type === 'social').append("circle").attr("r", (d: Particle) => d.baseR);
            enter.filter((d: Particle) => d.type === 'economic').append("rect")
                .attr("width", (d: Particle) => d.baseR * 2)
                .attr("height", (d: Particle) => d.baseR * 2)
                .attr("x", (d: Particle) => -d.baseR)
                .attr("y", (d: Particle) => -d.baseR);
            // Non-Human / Technical Actors (Triangles)
            enter.filter((d: Particle) => d.type === 'technical').append("path")
                .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
                .attr("fill", "#eab308"); // Yellow-500

            // Update Transforms & Styles
            selection.attr("transform", d => {
                let scale = 1;
                let rotate = 0;
                let tx = d.x;
                let ty = d.y;

                if (d.isResisting) {
                    scale = 1.2; // Slight swell
                    tx += (Math.random() - 0.5) * 2; // Jitter X
                    ty += (Math.random() - 0.5) * 2; // Jitter Y
                } else if (d.x > filterX) {
                    if (d.type === 'social') scale = 0.4; // Slightly larger reduction for visibility
                    else scale = 0.9; // Less reduction for economic/technical
                }

                return `translate(${tx},${ty}) scale(${scale})`;
            });

            selection.select("circle")
                .attr("fill", (d: Particle) => d.isResisting ? "#fb923c" : d.x > filterX ? "#cbd5e1" : "#f43f5e") // Orange if resisting
                .attr("opacity", (d: Particle) => d.x > filterX ? 0.4 : 0.8);

            selection.select("rect")
                .attr("rx", (d: any) => d.x > filterX ? 2 : 0)
                .attr("fill", (d: Particle) => d.isResisting ? "#fb923c" : d.x > filterX ? "#10b981" : "#3b82f6");

            selection.select("path")
                .attr("fill", (d: Particle) => d.isResisting ? "#fb923c" : d.x > filterX ? "#a3e635" : "#eab308") // Yellow -> Lime
                .attr("opacity", (d: Particle) => d.x > filterX ? 0.6 : 1);

            selection.exit().remove();
        });

        return () => timer.stop();

    }, [isExpanded, nodes, dimensions]);

    return (
        <div className="flex h-full w-full gap-4">
            {/* Main Viz */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            Translation Filter (Coding)
                            <HelpTooltip>
                                Social Actors (Red Circles) are complex, messy, and human. The System (The Coding Filter) cannot understand them.
                                So it flags them as an ERROR (ERR_REDUCT) because it has to "reduce" them to make them fit.
                            </HelpTooltip>
                        </h3>
                        <p className="text-xs text-slate-500 max-w-lg">
                            Visualizing the epistemic violence of translation: to make something legible to the system, you must often mutilate it.
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => setShowTheory(true)} title="Explain Theory">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setIsPaused(!isPaused)} title={isPaused ? "Resume" : "Pause"}>
                            {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
                        </Button>
                    </div>
                </div>

                {/* Theory Dialog */}
                <Dialog open={showTheory} onOpenChange={setShowTheory}>
                    <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-indigo-600" />
                                Assemblage Theory: The Coding Filter
                            </DialogTitle>
                            <DialogDescription>
                                Understanding the "epistemic violence" of translation in Actor-Network Theory.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4">
                            <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-rose-600 flex items-center gap-2">
                                        1. Translation as "Betrayal"
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        In ANT, to "translate" an actor is to displace them and make them speak the language of the network.
                                        There is a famous saying: <em>"Traduttore, traditore"</em> (Translator, traitor).
                                        <br /><br />
                                        <strong>The Viz:</strong> You see complex "Social Actors" (Red) hitting the barrier.
                                        <br />
                                        <strong>The Theory:</strong> The system cannot handle their full, messy complexity. To bring them into the network, it must <strong>betray</strong> their nature—stripping away nuance and turning them into a simple data point (or "Error") just to process them.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        2. Obligatory Passage Points (The Filter)
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        The central barrier represents an mechanism that forces all actors to pass through a specific channel to be recognized.
                                        <br /><br />
                                        <strong>The Viz:</strong> The vertical line that all particles must hit.
                                        <br />
                                        <strong>The Theory:</strong> If an actor (like a "Civil Society Group") wants to be relevant, they <em>must</em> pass through this filter. They cannot just "be themselves"; they must become "System-Compatible."
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-emerald-600 flex items-center gap-2">
                                        3. Codification & Legibility
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Assemblages work by making things "legible" (readable) to the center of power. Different actors have different levels of friction:
                                        <br /><br />
                                        <strong>Economic Actors (Blue Squares):</strong> Represent abstract market flows. They readily pass through to become <strong>Green Metrics</strong> because they are already "legible" to the system—their value is easily counted.
                                        <br /><br />
                                        <strong>Technical Actors (Yellow Triangles):</strong> Represent non-human tools, data, and infrastructure. They are translated into <strong>Lime Artifacts</strong>—the "black boxes" that the network relies on to function.
                                        <br /><br />
                                        <strong>Social Actors (Red Circles):</strong> These face the most friction. Because they are messy and human, they are often reduced to <strong>Grey Errors</strong> (ERR_REDUCT) to make them processable.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                                        4. Symmetry & Fragility
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        <strong>Generalized Symmetry:</strong> It's not just humans who get translated. Non-human actors (like soil samples or instruments) also have to be standardized to fit the network.
                                        <br /><br />
                                        <strong>Resistance:</strong> Translation is never guaranteed. Sometimes actors "bounce off," resist enrollment, or form counter-networks. The filter implies control, but the network is always precarious.
                                    </p>
                                </div>
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
                <div ref={containerRef} className="flex-1 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 relative min-h-[500px]">
                    <svg ref={svgRef} className="w-full h-full block" />
                </div>
            </div>

            {/* Live Log Sidebar */}
            <div className="w-96 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col transition-all duration-500 ease-in-out">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Encoding Log
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono bg-white p-1.5 rounded border border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>ERR_REDUCT = Social</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></span>
                            <span>METRIC = Economic</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-lime-500"></div>
                            <span>ARTIFACT = Technical</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="italic">FLIGHT = Resistance</span>
                        </div>
                    </div>
                </div>
                <div className="px-3 py-2 bg-rose-50 border-b border-rose-100 text-[10px] text-rose-700 leading-relaxed">
                    <strong>Why "Error"?</strong> The system struggles to quantify complex social actors, so it flags them as <span className="font-mono bg-white px-1 border border-rose-200 rounded text-rose-600">ERR_REDUCT</span> (Reduction Error) and assigns a random ID.
                </div>
                <ScrollArea className="flex-1 p-0">
                    <div className="flex flex-col">
                        {processedLog.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-xs italic">
                                Waiting for inputs...
                            </div>
                        )}
                        {processedLog.map((item, i) => (
                            <div key={`${item.id}-${item.timestamp}`} className={`px-4 py-3 border-b border-slate-50 text-xs hover:bg-slate-50 transition-colors grid grid-cols-[1fr_auto] items-center gap-2 group ${item.type === 'resistance' ? 'bg-amber-50/50' : ''
                                }`}>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <span className={`font-medium truncate ${item.type === 'social' ? 'text-rose-600' :
                                        item.type === 'resistance' ? 'text-amber-700 italic' :
                                            'text-blue-600'
                                        }`}>
                                        {item.originalName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                        <span className="opacity-50">ORIGIN:</span> {item.type.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="outline" className={`text-[10px] whitespace-nowrap px-1.5 py-0 ${item.type === 'social' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                        item.type === 'resistance' ? 'bg-amber-100 text-amber-700 border-amber-300 font-bold animate-pulse' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>
                                        {item.translationCode}
                                    </Badge>
                                    {item.type === 'social' && (
                                        <span className="text-[9px] text-rose-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ERASED
                                        </span>
                                    )}
                                    {item.type === 'resistance' && (
                                        <span className="text-[9px] text-amber-500 font-bold opacity-100 whitespace-nowrap">
                                            FLIGHT
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-[10px] text-center text-slate-400">
                    Only showing last 50 events
                </div>
            </div>
        </div>
    );
}
