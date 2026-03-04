"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { AbstractMachineAnalysis } from "@/types";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Focus } from "lucide-react";

export type ViewMode = "machine" | "strata" | "state";

export interface AbstractMachineCompareD3Props {
    leftMachine: AbstractMachineAnalysis | null;
    rightMachine: AbstractMachineAnalysis | null;
    leftTitle?: string;
    rightTitle?: string;
    viewMode: ViewMode;
}

const CANVAS_W = 2000;
const CANVAS_H = 1200;

export function AbstractMachineCompareD3({
    leftMachine,
    rightMachine,
    leftTitle = "Left Document",
    rightTitle = "Right Document",
    viewMode
}: AbstractMachineCompareD3Props) {
    const leftSvgRef = useRef<SVGSVGElement>(null);
    const rightSvgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const [maximizedPane, setMaximizedPane] = useState<"left" | "right" | null>(null);

    // Store references to the d3 zoom instances so buttons can trigger them outside the React useEffect
    const zoomRefs = useRef<{ left: d3.ZoomBehavior<Element, unknown> | null, right: d3.ZoomBehavior<Element, unknown> | null }>({ left: null, right: null });

    useEffect(() => {
        let simLeft: d3.Simulation<d3.SimulationNodeDatum, undefined> | null = null;
        let simRight: d3.Simulation<d3.SimulationNodeDatum, undefined> | null = null;

        const leftNode = leftSvgRef.current;
        const rightNode = rightSvgRef.current;

        if (leftMachine && leftNode) {
            const { sim, zoom } = renderToSvg(leftNode, leftMachine, "left", viewMode, CANVAS_W, CANVAS_H, tooltipRef.current);
            simLeft = sim;
            zoomRefs.current.left = zoom;
        } else if (leftNode) {
            d3.select(leftNode).selectAll("*").remove();
            zoomRefs.current.left = null;
        }

        if (rightMachine && rightNode) {
            const { sim, zoom } = renderToSvg(rightNode, rightMachine, "right", viewMode, CANVAS_W, CANVAS_H, tooltipRef.current);
            simRight = sim;
            zoomRefs.current.right = zoom;
        } else if (rightNode) {
            d3.select(rightNode).selectAll("*").remove();
            zoomRefs.current.right = null;
        }

        return () => {
            if (simLeft) simLeft.stop();
            if (simRight) simRight.stop();
            // Clear SVGs on unmount/re-render to prevent duplicate layers
            if (leftNode) d3.select(leftNode).selectAll("*").remove();
            if (rightNode) d3.select(rightNode).selectAll("*").remove();
        };
    }, [leftMachine, rightMachine, viewMode, maximizedPane]);

    const handleZoom = useCallback((pane: "left" | "right", dir: "in" | "out") => {
        const svg = pane === "left" ? leftSvgRef.current : rightSvgRef.current;
        const zoomFn = pane === "left" ? zoomRefs.current.left : zoomRefs.current.right;
        if (!svg || !zoomFn) return;

        const svgSelection = d3.select(svg);
        const factor = dir === "in" ? 1.2 : 0.8;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        zoomFn.scaleBy(svgSelection.transition().duration(250) as any, factor);
    }, []);

    const handleReset = useCallback((pane: "left" | "right") => {
        const svg = pane === "left" ? leftSvgRef.current : rightSvgRef.current;
        const zoomFn = pane === "left" ? zoomRefs.current.left : zoomRefs.current.right;
        if (!svg || !zoomFn) return;

        const svgSelection = d3.select(svg);
        const transform = d3.zoomIdentity.translate(50, 50).scale(0.8);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        zoomFn.transform(svgSelection.transition().duration(500) as any, transform);
    }, []);

    return (
        <div className="flex flex-col h-full w-full relative bg-slate-50 dark:bg-slate-950">
            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="pointer-events-none fixed opacity-0 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-[420px] text-xs leading-relaxed z-[9999] transition-opacity duration-150"
            />

            {/* Split Pane Layout */}
            <div className={`grid ${maximizedPane ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-px bg-slate-200 dark:bg-slate-800 flex-1 min-h-0 overflow-hidden`}>
                {/* Left Pane */}
                {maximizedPane !== "right" && (
                    <section className="flex flex-col bg-white dark:bg-slate-950 h-full min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between p-2 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{leftTitle}</span>
                                <span className="text-xs text-slate-500 shrink-0 hidden sm:block">
                                    {leftMachine ? `Ops: ${leftMachine.diagram.operators.length} | Cons: ${leftMachine.diagram.constraints.length}` : 'No machine selected'}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleReset("left")}
                                    disabled={!leftMachine}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0 disabled:opacity-30 mr-1"
                                    title="Reset Graph"
                                >
                                    <Focus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleZoom("left", "out")}
                                    disabled={!leftMachine}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0 disabled:opacity-30"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleZoom("left", "in")}
                                    disabled={!leftMachine}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0 disabled:opacity-30"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                <button
                                    onClick={() => setMaximizedPane(maximizedPane === "left" ? null : "left")}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0"
                                    title={maximizedPane === "left" ? "Restore split view" : "Maximize left panel"}
                                >
                                    {maximizedPane === "left" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="relative flex-1 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden cursor-grab active:cursor-grabbing">
                            {!leftMachine && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic pointer-events-none">Select a document</div>
                            )}
                            <svg ref={leftSvgRef} className="block w-full h-full" />
                        </div>
                    </section>
                )}

                {/* Right Pane */}
                {maximizedPane !== "left" && (
                    <section className="flex flex-col bg-white dark:bg-slate-950 h-full min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between p-2 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{rightTitle}</span>
                                <span className="text-xs text-slate-500 shrink-0 hidden sm:block">
                                    {rightMachine ? `Ops: ${rightMachine.diagram.operators.length} | Cons: ${rightMachine.diagram.constraints.length}` : 'No machine selected'}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleReset("right")}
                                    disabled={!rightMachine}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0 disabled:opacity-30 mr-1"
                                    title="Reset Graph"
                                >
                                    <Focus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleZoom("right", "out")}
                                    disabled={!rightMachine}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0 disabled:opacity-30"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleZoom("right", "in")}
                                    disabled={!rightMachine}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0 disabled:opacity-30"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                <button
                                    onClick={() => setMaximizedPane(maximizedPane === "right" ? null : "right")}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0"
                                    title={maximizedPane === "right" ? "Restore split view" : "Maximize right panel"}
                                >
                                    {maximizedPane === "right" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="relative flex-1 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden cursor-grab active:cursor-grabbing">
                            {!rightMachine && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic pointer-events-none">Select a document</div>
                            )}
                            <svg ref={rightSvgRef} className="block w-full h-full" />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

/** ---------------------------
 *  D3 Graph Builders & Renderers
 *  (Ported from the HTML prototype)
 *  -------------------------- */

const ARCH_ORDER = ["STRATIFY", "BAN", "CAPTURE", "GATE", "GOVERN", "HUMANIZE", "EQUALIZE", "REMEDY", "ENFORCE", "UPDATE"];
const ARCH_X = Object.fromEntries(ARCH_ORDER.map((a, i) => [a, (i + 1) / (ARCH_ORDER.length + 1)]));

function archetypeForOperator(opName: string) {
    const n = (opName || "").toLowerCase();
    if (n.includes("classify")) return "STRATIFY";
    if (n.includes("ban") || n.includes("prohibit")) return "BAN";
    if (n.includes("inventory") || n.includes("register")) return "CAPTURE";
    if (n.includes("evaluation") || n.includes("gate")) return "GATE";
    if (n.includes("lifecycle") || n.includes("govern")) return "GOVERN";
    if (n.includes("human") || n.includes("supervision") || n.includes("explanation") || n.includes("contest")) return "HUMANIZE";
    if (n.includes("discrimination") || n.includes("bias") || n.includes("fairness")) return "EQUALIZE";
    if (n.includes("liability") || n.includes("compensation")) return "REMEDY";
    if (n.includes("sanction") || n.includes("supervise") || n.includes("enforce")) return "ENFORCE";
    if (n.includes("reclass") || n.includes("update")) return "UPDATE";
    return "GOVERN";
}

// Ensure defaults for backwards compatibility if schema evolved
function normalizeMachine(model: AbstractMachineAnalysis) {
    return {
        ...model,
        diagram: {
            ...model.diagram,
            operators: model.diagram?.operators || [],
            constraints: model.diagram?.constraints || [],
            transformations: model.diagram?.transformations || []
        },
        double_articulation: {
            ...model.double_articulation,
            content_strata: model.double_articulation?.content_strata || [],
            expression_strata: model.double_articulation?.expression_strata || [],
            resonances: model.double_articulation?.resonances || [],
            clashes: model.double_articulation?.clashes || []
        }
    };
}

function buildMachineGraph(modelRaw: AbstractMachineAnalysis, regimeKey: string) {
    const model = normalizeMachine(modelRaw);
    const ops = model.diagram.operators;
    const cons = model.diagram.constraints;
    const nodes: any[] = [];
    const links: any[] = [];
    const byId = new Map();

    const add = (id: string, kind: string, label: string, meta = {}) => {
        if (byId.has(id)) return byId.get(id);
        const n = { id, kind, label, ...meta };
        byId.set(id, n);
        nodes.push(n);
        return n;
    };

    const archCounts = new Map();
    for (const op of ops) {
        const arch = archetypeForOperator(op.name);
        archCounts.set(arch, (archCounts.get(arch) || 0) + 1);
    }
    const archIndex = new Map();

    for (const op of ops) {
        const arch = archetypeForOperator(op.name);
        const idx = archIndex.get(arch) || 0;
        archIndex.set(arch, idx + 1);
        const total = archCounts.get(arch) || 1;
        const baseX = ARCH_X[arch] ?? 0.5;
        const xOffset = total === 1 ? 0 : ((idx / (total - 1)) - 0.5) * 0.15;

        add(`${regimeKey}:${op.id}`, "operator", op.name, {
            archetype: arch,
            xTargetFrac: Math.max(0.05, Math.min(0.95, baseX + xOffset)),
            definition: op.definition,
            confidence: op.confidence,
            quotes: op.supporting_quotes || [],
        });
    }

    const tokens = new Set<string>();
    for (const op of ops) {
        (op.inputs || []).forEach(t => tokens.add(t));
        (op.outputs || []).forEach(t => tokens.add(t));
    }
    const tokenArr = Array.from(tokens);
    for (let i = 0; i < tokenArr.length; i++) {
        const t = tokenArr[i];
        add(`${regimeKey}:tok:${t}`, "token", t, {
            xTargetFrac: tokenArr.length === 1 ? 0.5 : (i + 1) / (tokenArr.length + 1)
        });
    }

    for (const op of ops) {
        const opId = `${regimeKey}:${op.id}`;
        for (const t of (op.inputs || [])) {
            links.push({ source: `${regimeKey}:tok:${t}`, target: opId, kind: "input", label: t });
        }
        for (const t of (op.outputs || [])) {
            links.push({ source: opId, target: `${regimeKey}:tok:${t}`, kind: "output", label: t });
        }
    }

    for (let i = 0; i < cons.length; i++) {
        const c = cons[i];
        const cId = `${regimeKey}:${c.id}`;
        add(cId, "constraint", c.rule, {
            xTargetFrac: cons.length === 1 ? 0.5 : (i + 1) / (cons.length + 1),
            confidence: c.confidence,
        });
        for (const op of ops) {
            links.push({ source: cId, target: `${regimeKey}:${op.id}`, kind: "constraint", label: c.rule });
        }
    }
    return { nodes, links };
}

function buildStrataGraph(modelRaw: AbstractMachineAnalysis, regimeKey: string) {
    const model = normalizeMachine(modelRaw);
    const da = model.double_articulation;
    const nodes: any[] = [];
    const links: any[] = [];
    const byId = new Map();

    const add = (id: string, kind: string, label: string, meta = {}) => {
        if (byId.has(id)) return byId.get(id);
        const n = { id, kind, label, ...meta };
        byId.set(id, n); nodes.push(n); return n;
    };

    for (let i = 0; i < da.content_strata.length; i++) {
        add(`${regimeKey}:${da.content_strata[i].id}`, "content", da.content_strata[i].id, { desc: da.content_strata[i].description, xTargetFrac: 0.25, yOrder: i });
    }
    for (let i = 0; i < da.expression_strata.length; i++) {
        add(`${regimeKey}:${da.expression_strata[i].id}`, "expression", da.expression_strata[i].id, { desc: da.expression_strata[i].description, xTargetFrac: 0.75, yOrder: i });
    }

    for (const r of da.resonances) {
        links.push({ source: `${regimeKey}:${r.content_id}`, target: `${regimeKey}:${r.expression_id}`, kind: "resonance", label: r.description });
    }
    for (const c of da.clashes) {
        links.push({ source: `${regimeKey}:${c.content_id}`, target: `${regimeKey}:${c.expression_id}`, kind: "clash", label: c.description });
    }
    return { nodes, links };
}

function buildStateGraph(modelRaw: AbstractMachineAnalysis, regimeKey: string) {
    const model = normalizeMachine(modelRaw);
    const T = model.diagram.transformations;
    const nodes: any[] = [];
    const links: any[] = [];
    const byId = new Map();

    const add = (id: string, kind: string, label: string, meta = {}) => {
        if (byId.has(id)) return byId.get(id);
        const n = { id, kind, label, ...meta };
        byId.set(id, n); nodes.push(n); return n;
    };

    const states = new Set<string>();
    for (const tr of T) { states.add(tr.from); states.add(tr.to); }
    const stateList = Array.from(states);

    const toSet = new Set(T.map(x => x.to));
    const roots = stateList.filter(s => !toSet.has(s));
    const depth = new Map();
    const q = [];
    for (const r of (roots.length ? roots : [stateList[0]])) {
        if (r) { depth.set(r, 0); q.push(r); }
    }
    const adj = new Map();
    for (const tr of T) {
        if (!adj.has(tr.from)) adj.set(tr.from, []);
        adj.get(tr.from).push(tr.to);
    }
    while (q.length) {
        const u = q.shift();
        const du = depth.get(u) ?? 0;
        for (const v of (adj.get(u) || [])) {
            if (!depth.has(v)) {
                depth.set(v, du + 1);
                q.push(v);
            }
        }
    }

    const depthCounts = new Map();
    for (const s of stateList) {
        const d = depth.get(s) ?? 0;
        depthCounts.set(d, (depthCounts.get(d) || 0) + 1);
    }
    const depthIndex = new Map();

    for (let i = 0; i < stateList.length; i++) {
        const s = stateList[i];
        const d = depth.get(s) ?? 0;
        const total = depthCounts.get(d) || 1;
        const idx = depthIndex.get(d) || 0;
        depthIndex.set(d, idx + 1);

        const xTargetFrac = total === 1 ? 0.5 : (idx + 1) / (total + 1);
        add(`${regimeKey}:state:${s}`, "state", s, { depth: d, xTargetFrac });
    }

    for (const tr of T) {
        links.push({ source: `${regimeKey}:state:${tr.from}`, target: `${regimeKey}:state:${tr.to}`, kind: "transition", label: tr.trigger });
    }
    return { nodes, links };
}

function renderToSvg(
    svgEl: SVGSVGElement,
    model: AbstractMachineAnalysis,
    regimeKey: string,
    viewKind: ViewMode,
    W: number,
    H: number,
    tooltipEl: HTMLDivElement | null
) {
    const svg = d3.select(svgEl);
    // 1. Explicit clean setup
    svg.selectAll("*").remove();
    // 2. Set responsive viewBox instead of hardcoded
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    let G;
    if (viewKind === "machine") G = buildMachineGraph(model, regimeKey);
    else if (viewKind === "strata") G = buildStrataGraph(model, regimeKey);
    else G = buildStateGraph(model, regimeKey);

    const { nodes, links } = G;

    // Defs for arrows
    const isDarkMode = document.documentElement.classList.contains('dark');
    const labelColor = isDarkMode ? '#cbd5e1' : '#475569';
    const strokeColor = isDarkMode ? '#475569' : '#94a3b8';
    const fgColor = isDarkMode ? '#f8fafc' : '#0f172a';
    const bgColor = isDarkMode ? '#0f172a' : '#ffffff';

    const defs = svg.append("defs");
    const zoomGroup = svg.append("g").attr("class", "d3-zoom-group");

    // Initialize Zoom Behavior
    const zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (e) => {
            zoomGroup.attr("transform", e.transform);
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg.call(zoomBehavior as any);

    // Fit to available space by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg.call((zoomBehavior as any).transform, d3.zoomIdentity.translate(50, 50).scale(0.8));

    // Aesthetic Drop Shadow
    const filter = defs.append("filter")
        .attr("id", `drop-shadow-${regimeKey}`)
        .attr("width", "150%")
        .attr("height", "150%");
    filter.append("feDropShadow")
        .attr("dx", "0")
        .attr("dy", "3")
        .attr("stdDeviation", "4")
        .attr("flood-opacity", isDarkMode ? "0.4" : "0.15");

    defs.selectAll("marker")
        .data(["arrow"])
        .join("marker")
        .attr("id", d => `${regimeKey}-${viewKind}-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 18)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", strokeColor);

    function laneY(d: any) {
        if (viewKind === "machine") {
            if (d.kind === "constraint") return H * 0.15;
            if (d.kind === "operator") return H * 0.50;
            return H * 0.85;
        }
        if (viewKind === "strata") {
            return 80 + (d.yOrder ?? 0) * 110;
        }
        return 90 + (d.depth ?? 0) * 130;
    }

    // Lane labels
    if (viewKind === "machine") {
        svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", H * 0.12).text("Global Constraints");
        svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", H * 0.42).text("Operators (archetype columns)");
        svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", H * 0.72).text("Tokens (inputs/outputs)");
    } else if (viewKind === "strata") {
        svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", 26).text("Content strata (left) ↔ Expression strata (right)");
    } else {
        svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", 26).text("State transformations");
    }

    const link = zoomGroup.append("g")
        .attr("stroke", strokeColor)
        .attr("stroke-opacity", 0.65)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("fill", "none")
        .attr("stroke-dasharray", d => {
            if (viewKind === "machine" && d.kind === "constraint") return "5,5";
            if (viewKind === "strata" && d.kind === "clash") return "6,4";
            return null;
        })
        .attr("marker-end", `url(#${regimeKey}-${viewKind}-arrow)`);

    const g = zoomGroup.append("g").selectAll("g")
        .data(nodes)
        .join("g")
        .attr("class", "cursor-pointer transition-opacity duration-200");

    const colorMap = {
        operator: { fill: isDarkMode ? '#1e3a8a' : '#eff6ff', stroke: isDarkMode ? '#3b82f6' : '#2563eb', text: isDarkMode ? '#eff6ff' : '#1e3a8a' },
        token: { fill: isDarkMode ? '#14532d' : '#f0fdf4', stroke: isDarkMode ? '#22c55e' : '#16a34a', text: isDarkMode ? '#f0fdf4' : '#14532d' },
        constraint: { fill: isDarkMode ? '#78350f' : '#fffbeb', stroke: isDarkMode ? '#f59e0b' : '#d97706', text: isDarkMode ? '#fffbeb' : '#78350f' },
        content: { fill: isDarkMode ? '#4c1d95' : '#f5f3ff', stroke: isDarkMode ? '#8b5cf6' : '#7c3aed', text: isDarkMode ? '#f5f3ff' : '#4c1d95' },
        expression: { fill: isDarkMode ? '#831843' : '#fdf2f8', stroke: isDarkMode ? '#ec4899' : '#db2777', text: isDarkMode ? '#fdf2f8' : '#831843' },
        state: { fill: isDarkMode ? '#0f766e' : '#f0fdfa', stroke: isDarkMode ? '#14b8a6' : '#0d9488', text: isDarkMode ? '#f0fdfa' : '#0f766e' }
    };

    g.each(function (d) {
        const sel = d3.select(this);
        const colors = (colorMap as any)[(d as any).kind] || { fill: bgColor, stroke: fgColor, text: fgColor };

        if (viewKind === "machine") {
            if (d.kind === "operator") {
                sel.append("rect").attr("rx", 6).attr("ry", 6).attr("x", -70).attr("y", -18).attr("width", 140).attr("height", 36)
                    .attr("stroke", colors.stroke).attr("stroke-width", 1.5).attr("fill", colors.fill).attr("filter", `url(#drop-shadow-${regimeKey})`);
            } else if (d.kind === "constraint") {
                const r = 22;
                const pts = d3.range(6).map(i => {
                    const MathPI = Math.PI;
                    const a = (MathPI / 3) * i - MathPI / 6;
                    return [r * Math.cos(a), r * Math.sin(a)];
                });
                sel.append("polygon").attr("points", pts.map(p => p.join(",")).join(" "))
                    .attr("stroke", colors.stroke).attr("stroke-width", 1.5).attr("fill", colors.fill).attr("filter", `url(#drop-shadow-${regimeKey})`);
            } else {
                sel.append("circle").attr("r", 14).attr("stroke", colors.stroke).attr("stroke-width", 1.5).attr("fill", colors.fill);
            }
        } else if (viewKind === "strata") {
            sel.append("rect").attr("rx", 8).attr("ry", 8).attr("x", -90).attr("y", -20).attr("width", 180).attr("height", 40)
                .attr("stroke", colors.stroke).attr("stroke-width", 1.5).attr("fill", colors.fill).attr("filter", `url(#drop-shadow-${regimeKey})`);
        } else {
            sel.append("rect").attr("rx", 10).attr("ry", 10).attr("x", -100).attr("y", -20).attr("width", 200).attr("height", 40)
                .attr("stroke", colors.stroke).attr("stroke-width", 1.5).attr("fill", colors.fill).attr("filter", `url(#drop-shadow-${regimeKey})`);
        }

        const isExternalLabel = viewKind === "machine" && (d.kind === "constraint" || d.kind === "token");

        sel.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", isExternalLabel ? "2.6em" : "0.35em")
            .attr("font-size", isExternalLabel ? 9 : 10)
            .attr("fill", isExternalLabel ? labelColor : colors.text)
            .style("pointer-events", "none")
            .style("font-weight", isExternalLabel ? "400" : "500")
            .text(() => {
                const safeD = d as any;
                if (viewKind === "machine" && safeD.kind === "operator") {
                    const s = safeD.label + "()";
                    return s.length > 22 ? s.slice(0, 22) + "…" : s;
                }
                const s = safeD.label || "";
                return s.length > 28 ? s.slice(0, 28) + "…" : s;
            });

        if (viewKind === "machine" && (d as any).kind === "operator") {
            sel.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "-1.8em")
                .attr("font-size", 9)
                .attr("fill", colors.stroke)
                .style("font-weight", "bold")
                .text((d as any).archetype || "");
        }
    });

    const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id)
            .distance(l => {
                const k = (l as any).kind;
                if (viewKind === "machine" && k === "constraint") return 140;
                if (viewKind === "strata") return 220;
                if (viewKind === "state") return 200;
                return 100;
            })
            .strength(l => {
                if (viewKind === "machine" && (l as any).kind === "constraint") return 0.05;
                return 0.3;
            })
        )
        .force("charge", d3.forceManyBody().strength(viewKind === "strata" ? -500 : -300))
        .force("collide", d3.forceCollide().radius((d: any) => {
            if (viewKind === "machine") {
                if (d.kind === "operator") return 80; // Wide rectangle
                if (d.kind === "constraint") return 45; // Accounts for external label
                return 35; // Token with external label
            }
            if (viewKind === "strata") return 110;
            return 120;
        }).iterations(3))
        .force("x", d3.forceX(d => ((d as any).xTargetFrac ?? 0.5) * W).strength(0.3))
        .force("y", d3.forceY(d => laneY(d)).strength(0.6))
        .alphaDecay(0.02); // Let it settle smoothly

    // Drag handling
    const drag = d3.drag<any, any>()
        .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });

    g.call(drag as any);

    // Tooltip handling
    const dfMap = new Map();
    links.forEach(l => {
        const sId = typeof l.source === "string" ? l.source : l.source.id;
        const tId = typeof l.target === "string" ? l.target : l.target.id;
        if (!dfMap.has(sId)) dfMap.set(sId, new Set());
        if (!dfMap.has(tId)) dfMap.set(tId, new Set());
        dfMap.get(sId).add(tId);
        dfMap.get(tId).add(sId);
    });

    g.on("mouseenter", (event, d: any) => {
        const related = dfMap.get(d.id) || new Set();
        g.style("opacity", n => n.id === d.id || related.has(n.id) ? 1 : 0.15);
        link.style("opacity", l => {
            const ls = typeof l.source === "string" ? l.source : (l.source as any).id;
            const lt = typeof l.target === "string" ? l.target : (l.target as any).id;
            return (ls === d.id || related.has(ls)) && (lt === d.id || related.has(lt)) ? 1 : 0.15;
        });

        if (tooltipEl) {
            tooltipEl.style.opacity = "1";
            let html = "";
            if (viewKind === "machine") {
                if (d.kind === "operator") {
                    html = `<div class="font-bold mb-1 dark:text-slate-100">${d.label}()</div>
                            <div class="text-slate-600 dark:text-slate-400 mb-1 leading-tight">${d.definition || ""}</div>
                            <div class="text-xs text-slate-500">Archetype: <span class="text-slate-700 dark:text-slate-300">${d.archetype || ""}</span></div>`;
                } else if (d.kind === "constraint") {
                    html = `<div class="font-bold mb-1 dark:text-slate-100">${d.label}</div><div class="text-xs text-slate-500 uppercase tracking-widest">Constraint</div>`;
                } else {
                    html = `<div class="font-bold mb-1 dark:text-slate-100">${d.label}</div><div class="text-xs text-slate-500 uppercase tracking-widest">Token</div>`;
                }
            } else if (viewKind === "strata") {
                html = `<div class="font-bold mb-1 dark:text-slate-100">${d.id.split(":").slice(-1)[0]}</div>
                        <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">${d.kind} Strata</div>
                        <div class="text-slate-600 dark:text-slate-400 leading-tight">${d.desc || ""}</div>`;
            } else {
                html = `<div class="font-bold mb-1 dark:text-slate-100">${d.label}</div>
                        <div class="text-xs text-slate-500 uppercase tracking-widest">State Node (${d.depth || 0})</div>`;
            }
            tooltipEl.innerHTML = html;
        }
    })
        .on("mousemove", (event) => {
            if (tooltipEl) {
                // Ensure tooltip stays on screen
                let left = event.clientX + 15;
                const top = event.clientY + 15;
                if (left + 300 > window.innerWidth) left = window.innerWidth - 320;
                tooltipEl.style.left = left + "px";
                tooltipEl.style.top = top + "px";
            }
        })
        .on("mouseleave", () => {
            g.style("opacity", 1);
            link.style("opacity", 1);
            if (tooltipEl) tooltipEl.style.opacity = "0";
        });

    sim.on("tick", () => {
        link.attr("d", d => {
            const ls = d.source as any, lt = d.target as any;
            const dx = lt.x - ls.x, dy = lt.y - ls.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.15;
            return `M${ls.x},${ls.y}A${dr},${dr} 0 0,1 ${lt.x},${lt.y}`;
        });
        g.attr("transform", d => `translate(${(d as any).x},${(d as any).y})`);
    });

    return { sim, zoom: zoomBehavior };
}
