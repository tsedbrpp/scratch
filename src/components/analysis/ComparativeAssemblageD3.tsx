"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { AbstractMachineAnalysis } from "@/types";
import { diffAbstractMachines } from "./abstractMachineDiff";
import { Focus, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

const CANVAS_W = 2000;
const CANVAS_H = 1200;

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

function normalizeMachine(model: AbstractMachineAnalysis | undefined) {
    if (!model) return { diagram: { operators: [], constraints: [], transformations: [] } };
    return {
        ...model,
        diagram: {
            ...model.diagram,
            operators: model.diagram?.operators || [],
            constraints: model.diagram?.constraints || [],
            transformations: model.diagram?.transformations || []
        }
    };
}

function buildMergedGraph(leftRaw: AbstractMachineAnalysis, rightRaw: AbstractMachineAnalysis) {
    const left = normalizeMachine(leftRaw);
    const right = normalizeMachine(rightRaw);

    // Use the existing fuzzy diff logic to categorize shared vs unique
    // diffAbstractMachines expects AbstractMachineStub, which matches our normalized shape
    const diffTokens = diffAbstractMachines(left as any, right as any);

    // D3 Arrays
    const nodes: any[] = [];
    const links: any[] = [];
    const byId = new Map<string, any>();

    const addNode = (id: string, kind: string, label: string, sourceMeta: { group: "shared" | "fuzzy_shared" | "left" | "right", fuzzyContext?: string }, meta = {}) => {
        const { group, fuzzyContext } = sourceMeta;
        if (byId.has(id)) {
            const n = byId.get(id);
            // If already added as left/right, and we see it in the other, upgrade it
            if (n.sourceGroup !== "shared" && n.sourceGroup !== group) {
                // If one is shared, it wins. If one is fuzzy_shared, it wins over left/right.
                if (group === "shared") {
                    n.sourceGroup = "shared";
                    delete n.fuzzyContext; // Clear fuzzy context if it becomes exact shared
                } else if (group === "fuzzy_shared" && n.sourceGroup !== "shared") {
                    n.sourceGroup = "fuzzy_shared";
                    if (fuzzyContext) n.fuzzyContext = fuzzyContext;
                }
            }
            return n;
        }
        const n = { id, kind, label, sourceGroup: group, fuzzyContext, ...meta };
        byId.set(id, n);
        nodes.push(n);
        return n;
    };

    const determineSource = (label: string, shardList: any[], defaultSrc: "left" | "right"): { group: "shared" | "fuzzy_shared" | "left" | "right", fuzzyContext?: string } => {
        if (!label) return { group: defaultSrc };
        const normalized = label.toLowerCase();

        for (const s of shardList) {
            const sNorm = s.toLowerCase();
            if (sNorm === normalized) {
                return { group: "shared" };
            }
            if (sNorm.includes("(≈")) {
                const parts = sNorm.split("(≈");
                const leftPart = parts[0].trim();
                const rightPart = parts[1].replace(")", "").trim();
                if (leftPart === normalized || rightPart === normalized || normalized.includes(leftPart) || leftPart.includes(normalized)) {
                    return { group: "fuzzy_shared", fuzzyContext: s };
                }
            } else if (normalized.includes(sNorm) || sNorm.includes(normalized)) {
                return { group: "fuzzy_shared", fuzzyContext: `Matched by '${s}'` };
            }
        }
        return { group: defaultSrc };
    };

    // 1. Operators
    const lOps = left.diagram.operators;
    const rOps = right.diagram.operators;

    const archCounts = new Map();
    [...lOps, ...rOps].forEach(op => {
        const arch = archetypeForOperator(op.name);
        archCounts.set(arch, (archCounts.get(arch) || 0) + 1);
    });

    const archIndex = new Map();

    const diffOps = diffAbstractMachines(left as any, right as any);

    const indexOp = (op: any, defaultGroup: "left" | "right") => {
        const arch = archetypeForOperator(op.name);
        const idx = archIndex.get(arch) || 0;
        archIndex.set(arch, idx + 1);
        const total = archCounts.get(arch) || 1;
        const baseX = ARCH_X[arch] ?? 0.5;
        const xOffset = total === 1 ? 0 : ((idx / (total - 1)) - 0.5) * 0.15;

        const srcMeta = determineSource(op.name, diffOps.sharedSpine, defaultGroup);
        const opId = srcMeta.group === "shared" || srcMeta.group === "fuzzy_shared" ? `op:${srcMeta.group}:${arch}-${idx}` : `op:${op.name}`;

        addNode(opId, "operator", op.name, srcMeta, {
            archetype: arch,
            xTargetFrac: Math.max(0.05, Math.min(0.95, baseX + xOffset)),
            definition: op.definition
        });

        // Connect tokens
        for (const t of (op.inputs || [])) {
            const tokId = `tok:${String(t).toLowerCase().replace(/\s+/g, '-')}`;
            addNode(tokId, "token", String(t), srcMeta, { xTargetFrac: 0.2 });
            links.push({ source: tokId, target: opId, kind: "input", sourceGroup: srcMeta.group, label: String(t) });
        }
        for (const t of (op.outputs || [])) {
            const tokId = `tok:${String(t).toLowerCase().replace(/\s+/g, '-')}`;
            addNode(tokId, "token", String(t), srcMeta, { xTargetFrac: 0.8 });
            links.push({ source: opId, target: tokId, kind: "output", sourceGroup: srcMeta.group, label: String(t) });
        }
    };

    lOps.forEach(op => indexOp(op, "left"));
    rOps.forEach(op => indexOp(op, "right"));

    // 2. Constraints
    const indexCon = (c: any, defaultGroup: "left" | "right") => {
        const ruleName = String(c.rule || c);
        const srcMeta = determineSource(ruleName, diffOps.sharedSpine, defaultGroup);
        const cId = srcMeta.group === "shared" || srcMeta.group === "fuzzy_shared" ? `cons:${srcMeta.group}:${ruleName.slice(0, 10)}` : `cons:${ruleName}`;

        addNode(cId, "constraint", ruleName, srcMeta, { xTargetFrac: 0.5 });

        const targetOps = defaultGroup === "left" ? lOps : rOps;
        for (const op of targetOps) {
            const matchingOpNode = nodes.find(n => n.kind === "operator" && (n.label === op.name || (n.sourceGroup.includes("shared") && (n.label.includes(op.name) || op.name.includes(n.label)))));
            if (matchingOpNode) {
                links.push({ source: cId, target: matchingOpNode.id, kind: "constraint", sourceGroup: srcMeta.group, label: ruleName });
            }
        }
    };

    left.diagram.constraints.forEach(c => indexCon(c, "left"));
    right.diagram.constraints.forEach(c => indexCon(c, "right"));

    return { nodes, links };
}

function renderMergedGraphSvg(
    svgEl: SVGSVGElement,
    leftMachine: AbstractMachineAnalysis,
    rightMachine: AbstractMachineAnalysis,
    W: number,
    H: number,
    tooltipEl: HTMLDivElement | null,
    filters: { shared: boolean, fuzzy_shared: boolean, left: boolean, right: boolean }
) {
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    const raw = buildMergedGraph(leftMachine, rightMachine);

    // Filter out disabled node categories BEFORE pushing to force sim
    const nodes = raw.nodes.filter(n => (filters as any)[n.sourceGroup]);
    const allowedNodeIds = new Set(nodes.map(n => n.id));

    // Filter links - ensure sourceGroup is enabled AND both endpoints still exist
    const links = raw.links.filter(l => (filters as any)[l.sourceGroup] && allowedNodeIds.has(l.source) && allowedNodeIds.has(l.target));

    const isDarkMode = document.documentElement.classList.contains('dark');
    const labelColor = isDarkMode ? '#cbd5e1' : '#475569';
    const strokeColor = isDarkMode ? '#475569' : '#94a3b8';

    const defs = svg.append("defs");
    const zoomGroup = svg.append("g").attr("class", "d3-zoom-group");

    const zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (e) => {
            zoomGroup.attr("transform", e.transform);
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg.call(zoomBehavior as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg.call((zoomBehavior as any).transform, d3.zoomIdentity.translate(50, 50).scale(0.8));

    const filter = defs.append("filter")
        .attr("id", "drop-shadow-merged")
        .attr("width", "150%")
        .attr("height", "150%");
    filter.append("feDropShadow")
        .attr("dx", "0")
        .attr("dy", "3")
        .attr("stdDeviation", "4")
        .attr("flood-opacity", isDarkMode ? "0.4" : "0.15");

    const arrowGroups = ["shared", "fuzzy_shared", "left", "right"];
    const arrowColors = {
        shared: isDarkMode ? "#0f766e" : "#0d9488", // Teal
        fuzzy_shared: isDarkMode ? "#8b5cf6" : "#7c3aed", // Violet for fuzzy matches
        left: isDarkMode ? "#1e3a8a" : "#2563eb",   // Blue
        right: isDarkMode ? "#9a3412" : "#ea580c"   // Orange
    };

    defs.selectAll("marker")
        .data(arrowGroups)
        .join("marker")
        .attr("id", d => `merged-arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 18)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("fill", (d: any) => (arrowColors as any)[d] || strokeColor);

    function laneY(d: any) {
        if (d.kind === "constraint") return H * 0.15;
        if (d.kind === "operator") return H * 0.50;
        return H * 0.85;
    }

    svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", H * 0.12).text("Global Constraints");
    svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", H * 0.42).text("Operators (Shared Spine = Teal)");
    svg.append("text").attr("class", "text-xs font-bold").attr("fill", labelColor).attr("x", 14).attr("y", H * 0.72).text("Tokens (Inputs/Outputs)");

    const link = zoomGroup.append("g")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("fill", "none")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("stroke", (d: any) => (arrowColors as any)[d.sourceGroup] || strokeColor)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.7)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("stroke-dasharray", (d: any) => d.kind === "constraint" ? "5,5" : null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr("marker-end", (d: any) => `url(#merged-arrow-${d.sourceGroup})`);

    const g = zoomGroup.append("g").selectAll("g")
        .data(nodes)
        .join("g")
        .attr("class", "cursor-pointer transition-opacity duration-200");

    const categoryColors = {
        shared: { fill: isDarkMode ? '#ccfbf1' : '#b0f6ef', stroke: isDarkMode ? '#0f766e' : '#0d9488', text: isDarkMode ? '#134e4a' : '#115e59' }, // Teal
        fuzzy_shared: { fill: isDarkMode ? '#ede9fe' : '#ddd6fe', stroke: isDarkMode ? '#8b5cf6' : '#7c3aed', text: isDarkMode ? '#4c1d95' : '#4c1d95' }, // Violet
        left: { fill: isDarkMode ? '#dbeafe' : '#bfdbfe', stroke: isDarkMode ? '#1e3a8a' : '#2563eb', text: isDarkMode ? '#1e3a8a' : '#1d4ed8' }, // Blue
        right: { fill: isDarkMode ? '#ffedd5' : '#fed7aa', stroke: isDarkMode ? '#9a3412' : '#ea580c', text: isDarkMode ? '#7c2d12' : '#9a3412' } // Orange
    };

    g.each(function (d) {
        const sel = d3.select(this);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const groupC = (categoryColors as any)[(d as any).sourceGroup] || categoryColors.shared;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((d as any).kind === "operator") {
            sel.append("rect").attr("rx", 6).attr("ry", 6).attr("x", -70).attr("y", -18).attr("width", 140).attr("height", 36)
                .attr("stroke", groupC.stroke).attr("stroke-width", 2).attr("fill", groupC.fill).attr("filter", "url(#drop-shadow-merged)");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if ((d as any).kind === "constraint") {
            const r = 22;
            const pts = d3.range(6).map(i => {
                const MathPI = Math.PI;
                const a = (MathPI / 3) * i - MathPI / 6;
                return [r * Math.cos(a), r * Math.sin(a)];
            });
            sel.append("polygon").attr("points", pts.map(p => p.join(",")).join(" "))
                .attr("stroke", groupC.stroke).attr("stroke-width", 2).attr("fill", groupC.fill).attr("filter", "url(#drop-shadow-merged)");
        } else {
            sel.append("circle").attr("r", 14).attr("stroke", groupC.stroke).attr("stroke-width", 2).attr("fill", groupC.fill).attr("stroke-dasharray", (d as any).sourceGroup === "fuzzy_shared" ? "4,2" : null);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isExternalLabel = ((d as any).kind === "constraint" || (d as any).kind === "token");

        sel.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", isExternalLabel ? "2.6em" : "0.35em")
            .attr("font-size", isExternalLabel ? 9 : 10)
            .attr("fill", isExternalLabel ? labelColor : groupC.text)
            .style("pointer-events", "none")
            .style("font-weight", isExternalLabel ? "400" : "600")
            .text(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const safeD = d as any;
                let s = "";
                if (safeD.kind === "operator") {
                    s = safeD.label + "()";
                    s = s.length > 22 ? s.slice(0, 22) + "…" : s;
                } else {
                    s = safeD.label || "";
                    s = s.length > 28 ? s.slice(0, 28) + "…" : s;
                }
                return safeD.sourceGroup === "fuzzy_shared" ? `⚠️ ${s}` : s;
            });
    });

    const sim = d3.forceSimulation(nodes)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .force("link", d3.forceLink(links).id((d: any) => d.id)
            .distance(120)
            .strength(0.3)
        )
        .force("charge", d3.forceManyBody().strength(-300))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .force("collide", d3.forceCollide().radius((d: any) => {
            if (d.kind === "operator") return 80;
            if (d.kind === "constraint") return 45;
            return 35;
        }).iterations(3))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .force("x", d3.forceX(d => ((d as any).xTargetFrac ?? 0.5) * W).strength(0.3))

        .force("y", d3.forceY(d => laneY(d)).strength(0.6))
        .alphaDecay(0.02);

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    g.call(drag as any);

    const dfMap = new Map();
    links.forEach(l => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sId = typeof l.source === "string" ? l.source : (l.source as any).id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tId = typeof l.target === "string" ? l.target : (l.target as any).id;
        if (!dfMap.has(sId)) dfMap.set(sId, new Set());
        if (!dfMap.has(tId)) dfMap.set(tId, new Set());
        dfMap.get(sId).add(tId);
        dfMap.get(tId).add(sId);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    g.on("mouseenter", (event, d: any) => {
        const related = dfMap.get(d.id) || new Set();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        g.style("opacity", (n: any) => n.id === d.id || related.has(n.id) ? 1 : 0.15);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        link.style("opacity", (l: any) => {
            const ls = typeof l.source === "string" ? l.source : l.source.id;
            const lt = typeof l.target === "string" ? l.target : l.target.id;
            return (ls === d.id || related.has(ls)) && (lt === d.id || related.has(lt)) ? 1 : 0.15;
        });
        if (tooltipEl) {
            tooltipEl.style.opacity = "1";
            const isFuzzy = d.sourceGroup === "fuzzy_shared";
            let html = `<div class="font-bold mb-1 dark:text-slate-100 ${isFuzzy ? 'text-violet-600 dark:text-violet-400 flex items-center gap-1' : ''}">${isFuzzy ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>' : ''} ${d.label}</div>`;
            if (d.kind === "operator") {
                html += `<div class="text-slate-600 dark:text-slate-400 mb-1 leading-tight">${d.definition || ""}</div>`;
            }
            if (isFuzzy && d.fuzzyContext) {
                html += `<div class="text-violet-700 bg-violet-50 dark:bg-violet-900/30 p-2 rounded text-[10px] my-2 leading-relaxed italic border border-violet-100 dark:border-violet-800">Possible match: ${d.fuzzyContext}</div>`;
            }
            let prettyGroup = d.sourceGroup;
            if (prettyGroup === "fuzzy_shared") prettyGroup = "fuzzy match";
            html += `<div class="text-xs text-slate-500 uppercase tracking-widest mt-1">${d.kind} · <span style="color: ${(categoryColors as any)[d.sourceGroup].stroke}">${prettyGroup}</span></div>`;
            tooltipEl.innerHTML = html;
        }
    })
        .on("mousemove", (event) => {
            if (tooltipEl) {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        link.attr("d", (d: any) => {
            const ls = d.source as any, lt = d.target as any;
            const dx = lt.x - ls.x, dy = lt.y - ls.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.15;
            return `M${ls.x},${ls.y}A${dr},${dr} 0 0,1 ${lt.x},${lt.y}`;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        g.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return { sim, zoom: zoomBehavior };
}

export function ComparativeAssemblageD3({ leftMachine, rightMachine }: { leftMachine: AbstractMachineAnalysis, rightMachine: AbstractMachineAnalysis }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const zoomFnRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

    const [filters, setFilters] = useState({
        shared: true,
        fuzzy_shared: true,
        left: true,
        right: true
    });

    useEffect(() => {
        const svgElement = svgRef.current;
        let sim: d3.Simulation<d3.SimulationNodeDatum, undefined> | null = null;
        if (svgElement && leftMachine && rightMachine) {
            const out = renderMergedGraphSvg(svgElement, leftMachine, rightMachine, CANVAS_W, CANVAS_H, tooltipRef.current, filters);
            sim = out.sim;
            zoomFnRef.current = out.zoom;
        }
        return () => {
            if (sim) sim.stop();
            if (svgElement) d3.select(svgElement).selectAll("*").remove();
        };
    }, [leftMachine, rightMachine, filters]);

    return (
        <div className="flex flex-col h-full w-full relative bg-slate-50 dark:bg-slate-950 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div
                ref={tooltipRef}
                className="pointer-events-none fixed opacity-0 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-[420px] text-xs leading-relaxed z-[9999] transition-opacity duration-150"
            />

            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Comparative Assemblage</div>
                <div className="flex flex-col gap-1.5 text-xs">
                    <button onClick={() => setFilters(f => ({ ...f, shared: !f.shared }))} className={`flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 -ml-1 rounded transition-opacity ${!filters.shared ? 'opacity-40 grayscale selection-none hover:bg-transparent' : ''}`}>
                        <div className="w-3 h-3 rounded-full bg-teal-100 border border-teal-600 shrink-0"></div><span className="text-slate-600 dark:text-slate-300 pointer-events-none">Shared Spine (OPPs)</span>
                    </button>
                    <button onClick={() => setFilters(f => ({ ...f, fuzzy_shared: !f.fuzzy_shared }))} className={`flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 -ml-1 rounded transition-opacity ${!filters.fuzzy_shared ? 'opacity-40 grayscale selection-none hover:bg-transparent' : ''}`}>
                        <div className="w-3 h-3 rounded-full bg-violet-100 border border-violet-600 shrink-0"></div><span className="text-slate-600 dark:text-slate-300 pointer-events-none">Possible Match</span>
                    </button>
                    <button onClick={() => setFilters(f => ({ ...f, left: !f.left }))} className={`flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 -ml-1 rounded transition-opacity ${!filters.left ? 'opacity-40 grayscale selection-none hover:bg-transparent' : ''}`}>
                        <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-600 shrink-0"></div><span className="text-slate-600 dark:text-slate-300 pointer-events-none">Left Machine Only</span>
                    </button>
                    <button onClick={() => setFilters(f => ({ ...f, right: !f.right }))} className={`flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 -ml-1 rounded transition-opacity ${!filters.right ? 'opacity-40 grayscale selection-none hover:bg-transparent' : ''}`}>
                        <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-600 shrink-0"></div><span className="text-slate-600 dark:text-slate-300 pointer-events-none">Right Machine Only</span>
                    </button>
                </div>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={() => {
                        if (svgRef.current && zoomFnRef.current) {
                            const transform = d3.zoomIdentity.translate(50, 50).scale(0.8);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            zoomFnRef.current.transform(d3.select(svgRef.current).transition().duration(500) as any, transform);
                        }
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                ><Focus className="w-4 h-4" /></button>
            </div>

            <div id="abstract-machine-d3-container" className="relative flex-1 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden cursor-grab active:cursor-grabbing">
                <svg ref={svgRef} className="block w-full h-full" />
            </div>
        </div>
    );
}
