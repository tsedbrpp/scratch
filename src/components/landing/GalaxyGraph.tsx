"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// ═══════════════════════════════════════════════════════════════
// NODE DATA
// ═══════════════════════════════════════════════════════════════
const NODES = [
    { id: "data-sources", name: "Data & Sources", nodeType: "artifact", scaleDefault: "micro", scaleConfidence: 0.88, isOPP: false, isBoundaryObject: false, ttl_days: 60, freshness: 0.91, icon: "📄", antRole: "Inscription Device", desc: "Uploads PDFs, scrapes web traces, organizes primary sources. The raw material layer from which all subsequent translations emerge.", theory: "In ANT, this is the primary inscription device — the material substrate from which all translations emerge. Documents are not passive containers but active actants shaping what can be said.", hotspot: { entanglement: 0.55, grounding: 0.90, disagreement: 0.10, decay: 0.09 } },
    { id: "assemblage-compass", name: "Assemblage Compass", nodeType: "tool", scaleDefault: "meso", scaleConfidence: 0.95, isOPP: true, isBoundaryObject: false, ttl_days: 90, freshness: 0.97, icon: "🧭", antRole: "Obligatory Passage Point", desc: "The central mapping engine. Visualizes nested Actor → Collective → Regime assemblages with the full ANT translation chain.", theory: "The Compass is the platform's OPP — the node through which all analytical work must pass. It translates heterogeneous actors into a visible, navigable topology.", hotspot: { entanglement: 0.92, grounding: 0.85, disagreement: 0.15, decay: 0.03 } },
    { id: "trace-provenance", name: "Trace Provenance", nodeType: "tool", scaleDefault: "meso", scaleConfidence: 0.82, isOPP: false, isBoundaryObject: false, ttl_days: 90, freshness: 0.88, icon: "🔗", antRole: "Translation Chain", desc: "Tracks the genealogy of actors through the five-moment translation chain: Problematization → Interessement → Enrollment → Mobilization → Black Boxing.", theory: "Provenance tracing is the methodological heart of ANT — following actors as they are enrolled, translated, and stabilized. This feature makes the translation process itself visible as an analytical object.", hotspot: { entanglement: 0.60, grounding: 0.80, disagreement: 0.12, decay: 0.12 } },
    { id: "dynamics-mobilities", name: "Dynamics & Mobilities", nodeType: "tool", scaleDefault: "macro", scaleConfidence: 0.79, isOPP: false, isBoundaryObject: false, ttl_days: 90, freshness: 0.85, icon: "🌊", antRole: "Mobilization Tracker", desc: "Tracks movement, flow, and change of actors across time and space. Maps how assemblages shift, expand, contract, and migrate.", theory: "Mobilities analysis draws on ANT's concept of mobilization and Assemblage Theory's attention to lines of flight — vectors along which an assemblage escapes its current territorialization.", hotspot: { entanglement: 0.65, grounding: 0.70, disagreement: 0.20, decay: 0.15 } },
    { id: "cultural-framing", name: "Cultural Framing", nodeType: "tool", scaleDefault: "meso", scaleConfidence: 0.86, isOPP: false, isBoundaryObject: false, ttl_days: 90, freshness: 0.90, icon: "🎭", antRole: "Discourse Inscription", desc: "Diffractive Spectral Radar. Maps discourse clusters, legitimacy orders, and justification regimes across multiple theoretical lenses simultaneously.", theory: "Cultural Framing operationalizes Boltanski & Thévenot's orders of worth alongside Foucauldian discourse analysis. It maps the expressive axis — how the assemblage communicates and legitimates itself.", hotspot: { entanglement: 0.72, grounding: 0.75, disagreement: 0.30, decay: 0.10 } },
    { id: "institutional-logics", name: "Institutional Logics", nodeType: "tool", scaleDefault: "meso", scaleConfidence: 0.83, isOPP: false, isBoundaryObject: false, ttl_days: 90, freshness: 0.87, icon: "⚖️", antRole: "Interessement Analysis", desc: "Maps governance mechanics, power structures, and institutional norms. Identifies how institutions lock actors into defined roles through interessement.", theory: "Institutional logics analysis maps the territorial axis of assemblages — the degree to which norms, rules, and power structures stabilize actor roles.", hotspot: { entanglement: 0.70, grounding: 0.72, disagreement: 0.25, decay: 0.13 } },
    { id: "temporal-dynamics", name: "Temporal Dynamics", nodeType: "tool", scaleDefault: "macro", scaleConfidence: 0.80, isOPP: false, isBoundaryObject: false, ttl_days: 90, freshness: 0.82, icon: "⏱", antRole: "Ephemerality Tracker", desc: "Tracks how assemblages shift over time. Embodies the platform's core commitment to ephemerality — assemblages are never fully stable.", theory: "Temporal analysis operationalizes the 'Ephemeral' in InstantTEA. Drawing on Assemblage Theory's emphasis on temporality, it maps the deterritorialization axis — where and when assemblages become unstable.", hotspot: { entanglement: 0.58, grounding: 0.65, disagreement: 0.18, decay: 0.18 } },
    { id: "cross-case-synthesis", name: "Cross-Case Synthesis", nodeType: "tool", scaleDefault: "macro", scaleConfidence: 0.85, isOPP: false, isBoundaryObject: true, ttl_days: 90, freshness: 0.92, icon: "🔀", antRole: "Comparative Translation", desc: "Comparative analysis of multiple policy documents using the Decolonial Situatedness Framework. Identifies convergence, divergence, and colonial patterns.", theory: "Cross-case synthesis performs a second-order translation — comparing how different assemblages translate similar problems. The Decolonial Situatedness Framework asks whose translations dominate and whose are silenced.", hotspot: { entanglement: 0.78, grounding: 0.80, disagreement: 0.40, decay: 0.08 } },
    { id: "micro-resistance", name: "Micro-Resistance", nodeType: "practice", scaleDefault: "micro", scaleConfidence: 0.90, isOPP: false, isBoundaryObject: false, ttl_days: 60, freshness: 0.78, icon: "✊", antRole: "Anti-Enrollment / Friction", desc: "Empirical traces of resistance, counter-mapping, and friction. Analyzes how actors resist enrollment, subvert inscriptions, and create lines of flight.", theory: "Resistance analysis is the platform's most explicitly political feature. In ANT, resistance is the failure of interessement. In Deleuzian terms, resistance maps lines of flight: vectors of becoming that escape the assemblage's current territorialization.", hotspot: { entanglement: 0.68, grounding: 0.60, disagreement: 0.55, decay: 0.22 } },
    { id: "concept-network", name: "Concept Network", nodeType: "artifact", scaleDefault: "meso", scaleConfidence: 0.87, isOPP: false, isBoundaryObject: true, ttl_days: 90, freshness: 0.93, icon: "🕸", antRole: "Black Box / Ontology", desc: "Ontological map of concepts organized as Core / Mechanism / Actor / Value / Ghost nodes. Visualizes the conceptual infrastructure of the assemblage.", theory: "The Concept Network is the platform's black box — a stabilized representation of the assemblage's ontological commitments. Ghost nodes (absent actors) make visible what the assemblage excludes.", hotspot: { entanglement: 0.75, grounding: 0.88, disagreement: 0.20, decay: 0.07 } },
    { id: "glossary-theory", name: "Glossary & Theory", nodeType: "concept", scaleDefault: "micro", scaleConfidence: 0.75, isOPP: false, isBoundaryObject: false, ttl_days: 120, freshness: 0.95, icon: "📚", antRole: "Inscription Device", desc: "Theoretical grounding, definitions, and epistemological anchors. Provides the conceptual vocabulary that makes the platform's analyses legible.", theory: "The Glossary is a meta-inscription device — it stabilizes the theoretical language through which all other features are interpreted. Without shared definitions, the assemblage cannot hold together.", hotspot: { entanglement: 0.50, grounding: 0.95, disagreement: 0.08, decay: 0.05 } },
    { id: "reflexivity", name: "Reflexivity", nodeType: "practice", scaleDefault: "micro", scaleConfidence: 0.88, isOPP: false, isBoundaryObject: false, ttl_days: 60, freshness: 0.80, icon: "🪞", antRole: "Reflexive Actant", desc: "Critical reflection on epistemic location and positionality. Documents the researcher's situatedness and the conditions of knowledge production.", theory: "Reflexivity is the platform's most philosophically distinctive feature. It treats the researcher as an actant — an agent whose position shapes what is visible. This is the Deleuzian 'fold': the assemblage turning back on itself.", hotspot: { entanglement: 0.55, grounding: 0.70, disagreement: 0.35, decay: 0.20 } },
    { id: "meta-governance", name: "Meta-Governance", nodeType: "tool", scaleDefault: "macro", scaleConfidence: 0.91, isOPP: false, isBoundaryObject: true, ttl_days: 90, freshness: 0.89, icon: "📊", antRole: "Macro-Translation", desc: "Governance Orchestration dashboard. Risk landscape analysis, recurring assemblage patterns, and active proposals. The systemic view of the entire corpus.", theory: "Meta-Governance performs the final mobilization — aggregating all analytical outputs into a systemic view. It maps the governance regime as a whole, revealing recurring patterns and structural tendencies.", hotspot: { entanglement: 0.80, grounding: 0.82, disagreement: 0.28, decay: 0.11 } },
    { id: "dashboard", name: "Dashboard", nodeType: "tool", scaleDefault: "overview", scaleConfidence: 0.99, isOPP: true, isBoundaryObject: false, ttl_days: 90, freshness: 0.98, icon: "🏠", antRole: "Enrollment Gateway", desc: "The entry point and navigation hub. Provides project overview and routes users into the analytical workflow.", theory: "The Dashboard is the platform's second OPP — the enrollment gateway through which all users must pass. It performs the first moment of ANT translation: problematization.", hotspot: { entanglement: 0.85, grounding: 0.78, disagreement: 0.05, decay: 0.02 } },
    { id: "lens-config", name: "Lens Configuration", nodeType: "concept", scaleDefault: "micro", scaleConfidence: 0.78, isOPP: false, isBoundaryObject: false, ttl_days: 90, freshness: 0.86, icon: "🔬", antRole: "Problematization Device", desc: "Configures the theoretical lenses (Legitimacy, Justification, Resistance, etc.) that filter and frame all subsequent analyses.", theory: "Lens Configuration is the platform's problematization device — it defines the analytical problem by selecting which theoretical frameworks will be applied. The choice of lenses is itself a political act.", hotspot: { entanglement: 0.62, grounding: 0.72, disagreement: 0.22, decay: 0.14 } }
];

// ═══════════════════════════════════════════════════════════════
// EDGE DATA
// ═══════════════════════════════════════════════════════════════
const EDGES = [
    // depends_on
    { source: "data-sources", target: "assemblage-compass", type: "depends_on", label: "feeds raw material", directed: true },
    { source: "assemblage-compass", target: "trace-provenance", type: "depends_on", label: "requires provenance", directed: true },
    { source: "glossary-theory", target: "lens-config", type: "depends_on", label: "grounds lens choice", directed: true },
    { source: "lens-config", target: "assemblage-compass", type: "depends_on", label: "configures compass", directed: true },
    { source: "concept-network", target: "meta-governance", type: "depends_on", label: "ontology feeds governance", directed: true },
    // operationalizes
    { source: "glossary-theory", target: "assemblage-compass", type: "operationalizes", label: "theory → mapping", directed: true },
    { source: "lens-config", target: "cultural-framing", type: "operationalizes", label: "lens → cultural analysis", directed: true },
    { source: "lens-config", target: "institutional-logics", type: "operationalizes", label: "lens → institutional analysis", directed: true },
    { source: "glossary-theory", target: "concept-network", type: "operationalizes", label: "theory → ontology", directed: true },
    // grounds_in
    { source: "assemblage-compass", target: "data-sources", type: "grounds_in", label: "grounded in sources", directed: true },
    { source: "cultural-framing", target: "data-sources", type: "grounds_in", label: "grounded in sources", directed: true },
    { source: "institutional-logics", target: "data-sources", type: "grounds_in", label: "grounded in sources", directed: true },
    { source: "trace-provenance", target: "data-sources", type: "grounds_in", label: "traces back to sources", directed: true },
    // produces
    { source: "assemblage-compass", target: "concept-network", type: "produces", label: "produces ontology", directed: true },
    { source: "cultural-framing", target: "cross-case-synthesis", type: "produces", label: "produces comparison", directed: true },
    { source: "institutional-logics", target: "cross-case-synthesis", type: "produces", label: "produces comparison", directed: true },
    { source: "temporal-dynamics", target: "cross-case-synthesis", type: "produces", label: "produces comparison", directed: true },
    { source: "cross-case-synthesis", target: "meta-governance", type: "produces", label: "produces governance view", directed: true },
    { source: "meta-governance", target: "dashboard", type: "produces", label: "surfaces insights", directed: true },
    { source: "trace-provenance", target: "dynamics-mobilities", type: "produces", label: "reveals movement", directed: true },
    // contests
    { source: "micro-resistance", target: "institutional-logics", type: "contests", label: "challenges institutions", directed: false },
    { source: "micro-resistance", target: "dynamics-mobilities", type: "contests", label: "counter-flows", directed: false },
    { source: "reflexivity", target: "cultural-framing", type: "contests", label: "questions frames", directed: false },
    { source: "reflexivity", target: "assemblage-compass", type: "contests", label: "questions the mapping", directed: false },
    { source: "reflexivity", target: "meta-governance", type: "contests", label: "folds back on governance", directed: false },
    // translates
    { source: "dashboard", target: "data-sources", type: "translates", label: "enrolls user → data", directed: true },
    { source: "dashboard", target: "assemblage-compass", type: "translates", label: "enrolls user → mapping", directed: true },
    { source: "assemblage-compass", target: "micro-resistance", type: "translates", label: "translates friction", directed: true },
    { source: "reflexivity", target: "glossary-theory", type: "translates", label: "translates theory", directed: false },
    { source: "micro-resistance", target: "cross-case-synthesis", type: "translates", label: "translates resistance patterns", directed: true }
];

// ═══════════════════════════════════════════════════════════════
// VISUAL CONFIG
// ═══════════════════════════════════════════════════════════════
const SCALE_COLORS: Record<string, string> = { micro: "#e05060", meso: "#3a8fd4", macro: "#2ec4a0", overview: "#a070e0" };
const EDGE_COLORS: Record<string, string> = { depends_on: "#f5a623", operationalizes: "#4ecdc4", grounds_in: "#a8e063", produces: "#a070e0", contests: "#e05060", translates: "#60aaff" };
const EDGE_DASHED: Record<string, boolean> = { contests: true };
const NODE_TYPE_COLORS: Record<string, string> = { tool: "#3a8fd4", concept: "#a070e0", actor: "#f5a623", artifact: "#a8e063", practice: "#4ecdc4", value: "#f06292", event: "#ff5252" };

// Degree centrality for dynamic sizing
const degreeMap: Record<string, number> = {};
NODES.forEach(n => { degreeMap[n.id] = 0; });
EDGES.forEach(e => {
    degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
    degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
});
const minDeg = Math.min(...Object.values(degreeMap));
const maxDeg = Math.max(...Object.values(degreeMap));
const getNodeRadius = (id: string) => 20 + ((degreeMap[id] - minDeg) / (maxDeg - minDeg)) * 14;

// Inject global styles specific to the Rhizome D3 Renderer
const RHIZOME_STYLES = `
  /* Edges */
  .link { stroke-opacity: 0.5; transition: stroke-opacity 0.25s; }
  .link.fading { stroke-opacity: 0.15; stroke-dasharray: 3,5; }
  .link-label { font-size: 8.5px; fill: #5a7a9a; pointer-events: none; opacity: 0; transition: opacity 0.2s; }

  /* Nodes */
  .node-group { cursor: pointer; }
  .node-ring-outer { fill: none; stroke-width: 1.2; opacity: 0.35; }
  .node-shape { stroke-width: 2; transition: filter 0.2s; }
  .node-icon { font-size: 13px; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
  .node-label-name  { font-size: 10.5px; font-weight: 600; text-anchor: middle; fill: #e8f4ff; pointer-events: none; }
  .node-label-level { font-size: 7.5px; font-weight: 700; text-anchor: middle; letter-spacing: 1px; text-transform: uppercase; pointer-events: none; }
  
  /* Decay & Effects */
  .node-group.decaying { opacity: 0.45; }
  .node-group.decaying .node-shape { stroke-dasharray: 4,3; }
  
  @keyframes opp-pulse-anim {
    0%   { r: 28px; opacity: 0.55; }
    100% { r: 42px; opacity: 0; }
  }
  .opp-pulse { fill: none; stroke: #f5a623; stroke-width: 1.5; animation: opp-pulse-anim 2.2s ease-out infinite; }
  .boundary-glow { filter: drop-shadow(0 0 6px rgba(168,224,99,0.7)); }
  .node-group.dimmed { opacity: 0.15; }
  .link.dimmed { opacity: 0.04; }
  .node-shape-base { opacity: 0.11; }
`;


export function GalaxyGraph({ highResistanceCount = 0 }: { highResistanceCount?: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [gravityStrength, setGravityStrength] = useState(0.5);
    const [activeTab, setActiveTab] = useState('detail');
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // D3 Instance Ref for cross-effect updates
    const d3StateRef = useRef<{ svg?: any, zoom?: any, nodeSel?: any, linkSel?: any, simNodes?: any, simEdges?: any, simulation?: any }>({});

    // Filter State
    const [activeFilters, setActiveFilters] = useState({
        levels: new Set(['all', 'micro', 'meso', 'macro', 'overview']),
        edges: new Set(['depends_on', 'operationalizes', 'grounds_in', 'produces', 'contests', 'translates'])
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [activeLens, setActiveLens] = useState<string | null>(null);
    const [showLabels, setShowLabels] = useState(true);
    const [displayMode, setDisplayMode] = useState<"rhizome" | "workflow" | "symmetry">("rhizome");
    const [driftResult, setDriftResult] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string | null }>({ x: 0, y: 0, content: null });

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleFullScreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, []);

    const toggleLevelFilter = (level: string) => {
        setActiveFilters(prev => {
            const newLevels = new Set(prev.levels);
            if (level === 'all') {
                if (newLevels.has('all')) {
                    newLevels.clear();
                } else {
                    ['all', 'micro', 'meso', 'macro', 'overview'].forEach(l => newLevels.add(l));
                }
            } else {
                newLevels.delete('all'); // Always clear 'all' if toggling individual
                if (newLevels.has(level)) newLevels.delete(level);
                else newLevels.add(level);
                // Re-check 'all' condition
                if (['micro', 'meso', 'macro', 'overview'].every(l => newLevels.has(l))) {
                    newLevels.add('all');
                }
            }
            return { ...prev, levels: newLevels };
        });
    };

    const toggleEdgeFilter = (edge: string) => {
        setActiveFilters(prev => {
            const newEdges = new Set(prev.edges);
            if (newEdges.has(edge)) newEdges.delete(edge);
            else newEdges.add(edge);
            return { ...prev, edges: newEdges };
        });
    };

    // Initialize D3
    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;

        // Inject styles
        if (!document.getElementById('rhizome-styles')) {
            const styleLabel = document.createElement('style');
            styleLabel.id = 'rhizome-styles';
            styleLabel.innerHTML = RHIZOME_STYLES;
            document.head.appendChild(styleLabel);
        }

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous D3 render on unmount/remount

        svg.attr("viewBox", `0 0 ${width} ${height}`);

        const zoomG = svg.append("g").attr("class", "zoom-group");
        const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.25, 3.5]).on("zoom", (e) => zoomG.attr("transform", e.transform));
        svg.call(zoom as any);

        // Arrowheads
        const defs = svg.append("defs");
        Object.entries(EDGE_COLORS).forEach(([type, color]) => {
            defs.append("marker").attr("id", `arrow-${type}`)
                .attr("viewBox", "0 -5 10 10").attr("refX", 26).attr("refY", 0)
                .attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto")
                .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", color).attr("opacity", 0.65);
        });

        // Background Band Labels
        const BAND_DATA = [
            { label: "MICRO", y: height * 0.82, color: "#e05060" },
            { label: "MESO", y: height * 0.50, color: "#3a8fd4" },
            { label: "MACRO", y: height * 0.18, color: "#2ec4a0" }
        ];
        const bandG = zoomG.append("g");
        BAND_DATA.forEach(b => {
            bandG.append("text")
                .attr("class", "text-[55px] font-black opacity-[0.035] uppercase tracking-[4px] pointer-events-none select-none")
                .attr("x", width / 2).attr("y", b.y)
                .attr("text-anchor", "middle").attr("fill", b.color).text(b.label);
        });

        const LEVEL_Y: Record<string, number> = { overview: height * 0.48, micro: height * 0.80, meso: height * 0.52, macro: height * 0.20 };

        const simNodes = NODES.map(n => ({ ...n, r: getNodeRadius(n.id) }));
        const simEdges = EDGES.map(e => ({ ...e }));

        const simulation = d3.forceSimulation(simNodes as any)
            .force("link", d3.forceLink(simEdges).id((d: any) => d.id).distance((d: any) => {
                const dist: Record<string, number> = { depends_on: 170, operationalizes: 155, grounds_in: 145, produces: 185, contests: 130, translates: 175 };
                return dist[d.type] || 165;
            }).strength(0.28))
            .force("charge", d3.forceManyBody().strength(-580))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide((d: any) => d.r + 28))
            .force("gravity-y", d3.forceY((d: any) => LEVEL_Y[d.scaleDefault] || height / 2).strength(gravityStrength * 0.25))
            .force("x", d3.forceX(width / 2).strength(0.03))
            .alphaDecay(0.02)
            .on("tick", ticked);

        // Edges
        const linkG = zoomG.append("g").attr("class", "links");
        const linkSel = linkG.selectAll("g.link-group").data(simEdges).join("g").attr("class", "link-group");

        const linkLines = linkSel.append("line")
            .attr("class", (d: any) => `link link-${d.type}`)
            .attr("stroke", (d: any) => EDGE_COLORS[d.type])
            .attr("stroke-width", (d: any) => d.type === "depends_on" ? 2.4 : 1.8)
            .attr("stroke-dasharray", (d: any) => EDGE_DASHED[d.type] ? "5,4" : null)
            .attr("marker-end", (d: any) => d.directed ? `url(#arrow-${d.type})` : null);

        const linkLabels = linkSel.append("text").attr("class", "link-label").text((d: any) => d.label);

        // Nodes
        const nodeG = zoomG.append("g").attr("class", "nodes");
        const nodeSel = nodeG.selectAll("g.node-group").data(simNodes).join("g")
            .attr("class", (d: any) => `node-group ${d.freshness < 0.82 ? " decaying" : ""}`)
            .call(d3.drag<any, any>()
                .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
                .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
                .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
            )
            .on("click", (event, d) => {
                event.stopPropagation();
                setSelectedNode(d);
                setActiveTab('detail');

                // Highlight neighborhood
                const connected = new Set([d.id]);
                simEdges.forEach((e: any) => {
                    if (e.source.id === d.id) connected.add(e.target.id);
                    if (e.target.id === d.id) connected.add(e.source.id);
                });
                nodeSel.classed("dimmed", (n: any) => !connected.has(n.id));
                linkSel.classed("dimmed", (e: any) => e.source.id !== d.id && e.target.id !== d.id);
            })
            .on("mouseover", (event, d) => {
                const decayWarn = d.freshness < 0.82 ? `<div class="text-[#e05060] text-[9px] mt-1">⚠ Low freshness: ${Math.round(d.freshness * 100)}%</div>` : "";
                const content = `
                    <div class="text-[11px] font-bold text-[#e8f4ff] mb-0.5">${d.icon} ${d.name}</div>
                    <div class="text-[8.5px] text-[#5a7a9a] uppercase tracking-wider mb-1">${d.antRole} · ${d.nodeType} · ${d.scaleDefault}</div>
                    <div class="text-[10px] text-[#c8d8f0] leading-normal">${d.desc}</div>
                    ${decayWarn}
                `;
                setTooltip({ x: event.clientX + 15, y: event.clientY - 10, content });
            })
            .on("mousemove", (event) => {
                setTooltip(prev => ({ ...prev, x: event.clientX + 15, y: event.clientY - 10 }));
            })
            .on("mouseout", () => {
                setTooltip(prev => ({ ...prev, content: null }));
            });

        // OPP pulse
        nodeSel.filter((d: any) => d.isOPP).append("circle").attr("class", "opp-pulse").attr("r", (d: any) => d.r + 6);
        // Outer ring
        nodeSel.append("circle").attr("class", "node-ring-outer").attr("r", (d: any) => d.r + 5).attr("stroke", (d: any) => SCALE_COLORS[d.scaleDefault]).attr("fill", "none");
        // Base circle
        nodeSel.append("circle").attr("class", "node-shape").attr("r", (d: any) => d.r).attr("fill", (d: any) => `${SCALE_COLORS[d.scaleDefault]}`).attr("fill-opacity", 0.11).attr("stroke", (d: any) => SCALE_COLORS[d.scaleDefault]).attr("stroke-width", (d: any) => d.isOPP ? 3 : 2);

        // Scale Confidence Dot
        nodeSel.append("circle")
            .attr("cx", (d: any) => d.r * 0.7).attr("cy", (d: any) => -d.r * 0.7)
            .attr("r", 3.2)
            .attr("fill", (d: any) => d.scaleConfidence > 0.85 ? "#2ec4a0" : d.scaleConfidence > 0.70 ? "#f5a623" : "#e05060")
            .attr("opacity", 0.82)
            .attr("stroke", "#0a1628").attr("stroke-width", 1);

        // Node Types (shapes)
        nodeSel.each(function (d: any) {
            const g = d3.select(this);
            const s = d.r * 0.42;
            const tc = NODE_TYPE_COLORS[d.nodeType] || "#ffffff";
            if (d.nodeType === "tool") {
                const pts = d3.range(6).map(i => {
                    const a = (Math.PI / 3) * i - Math.PI / 6;
                    return [s * Math.cos(a), s * Math.sin(a)].join(",");
                }).join(" ");
                g.append("polygon").attr("points", pts).attr("fill", "none").attr("stroke", tc).attr("stroke-width", 1).attr("opacity", 0.5);
            } else if (d.nodeType === "concept") {
                g.append("polygon").attr("points", `0,${-s} ${s},0 0,${s} ${-s},0`).attr("fill", "none").attr("stroke", tc).attr("stroke-width", 1).attr("opacity", 0.5);
            } else if (d.nodeType === "artifact") {
                const h = s * 0.85;
                g.append("rect").attr("x", -h).attr("y", -h).attr("width", h * 2).attr("height", h * 2).attr("rx", 2).attr("fill", "none").attr("stroke", tc).attr("stroke-width", 1).attr("opacity", 0.5);
            } else if (d.nodeType === "practice") {
                g.append("polygon").attr("points", `0,${-s} ${s * 0.87},${s * 0.5} ${-s * 0.87},${s * 0.5}`).attr("fill", "none").attr("stroke", tc).attr("stroke-width", 1).attr("opacity", 0.5);
            }
            if (d.isBoundaryObject) g.select(".node-shape").attr("class", "node-shape boundary-glow");
        });

        // Icon
        nodeSel.append("text").attr("class", "node-icon").attr("y", -3).text((d: any) => d.icon);
        // Name label
        nodeSel.append("text").attr("class", "node-label-name").attr("y", (d: any) => d.r + 14).text((d: any) => d.name);
        // Level label
        nodeSel.append("text").attr("class", "node-label-level").attr("y", (d: any) => d.r + 24).attr("fill", (d: any) => SCALE_COLORS[d.scaleDefault]).text((d: any) => d.scaleDefault.toUpperCase());

        // Role label (label-extra)
        nodeSel.append("text")
            .attr("class", "node-label-role label-extra")
            .attr("y", (d: any) => d.r + 34)
            .attr("fill", "#5a7a9a")
            .attr("text-anchor", "middle")
            .attr("font-size", "7px")
            .style("opacity", showLabels ? 0.7 : 0)
            .text((d: any) => d.antRole);

        // --- BACKGROUND BAND LABELS (Side Labels) ---
        const bandData = [
            { id: 'macro', label: 'MACRO', yp: 0.2 },
            { id: 'meso', label: 'MESO', yp: 0.5 },
            { id: 'micro', label: 'MICRO', yp: 0.8 }
        ];

        const bandLabels = svg.selectAll(".band-label")
            .data(bandData)
            .enter()
            .append("text")
            .attr("class", "band-label")
            .attr("x", 10)
            .attr("fill", "#e8f4ff")
            .style("font-size", "55px")
            .style("font-weight", "900")
            .style("opacity", 0.035)
            .style("pointer-events", "all")
            .style("cursor", "pointer")
            .style("user-select", "none")
            .text((d: any) => d.label)
            .on("mouseover", function () { d3.select(this).transition().duration(200).style("opacity", 0.3).style("fill", "#3a8fd4"); })
            .on("mouseout", function () { d3.select(this).transition().duration(200).style("opacity", 0.035).style("fill", "#e8f4ff"); })
            .on("click", (event: any, d: any) => {
                event.stopPropagation();
                const scaleKey = d.id.charAt(0).toUpperCase() + d.id.slice(1);
                setActiveFilters(prev => {
                    const next = new Set(prev.levels);
                    if (next.has(scaleKey)) next.delete(scaleKey);
                    else next.add(scaleKey);
                    return { ...prev, levels: next };
                });
            });

        function ticked() {
            linkLines.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
            linkLabels.attr("x", (d: any) => (d.source.x + d.target.x) / 2).attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 4);
            nodeSel.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

            // Update bands position based on height
            const height = svg.node()?.getBoundingClientRect().height || 800;
            bandLabels.attr("y", (d: any) => height * d.yp);
        }

        // Store references for React state updates
        d3StateRef.current = { svg, zoom, nodeSel, linkSel, simNodes, simEdges, simulation };

        // Background click clears
        svg.on("click", () => {
            setSelectedNode(null);
            nodeSel.classed("dimmed", false);
            linkSel.classed("dimmed", false);
        });

        // Effect cleanup
        return () => {
            simulation.stop();
        };
    }, []); // Run ONCE on mount

    // Apply Display Classes and Filters Reactively
    useEffect(() => {
        const { nodeSel, linkSel, simEdges, simNodes } = d3StateRef.current;
        if (!nodeSel || !linkSel) return;

        // Reset dimming generically first
        nodeSel.classed("dimmed", false);
        linkSel.classed("dimmed", false);

        // 1. Search Query
        const q = searchQuery.toLowerCase().trim();
        let searchMatches = new Set<string>();
        if (q) {
            searchMatches = new Set(simNodes.filter((n: any) =>
                n.name.toLowerCase().includes(q) || n.antRole.toLowerCase().includes(q) ||
                n.nodeType.toLowerCase().includes(q) || n.scaleDefault.toLowerCase().includes(q)
            ).map((n: any) => n.id));
        }

        // 2. Lenses
        const LENS_RULES: Record<string, { edges: Set<string>, nodes: Set<string> | null }> = {
            evidence: { edges: new Set(["grounds_in"]), nodes: null },
            resistance: { edges: new Set(["contests"]), nodes: new Set(["micro-resistance", "reflexivity"]) },
            cultural: { edges: new Set(["operationalizes", "translates"]), nodes: new Set(["cultural-framing", "lens-config"]) },
            infra: { edges: new Set(["depends_on"]), nodes: null }
        };

        const rule = activeLens ? LENS_RULES[activeLens] : null;

        // 3. Apply Filters and visibility
        nodeSel.attr("display", (d: any) => activeFilters.levels.has(d.scaleDefault) ? null : "none");
        linkSel.attr("display", (d: any) => {
            const sv = activeFilters.levels.has(d.source.scaleDefault);
            const tv = activeFilters.levels.has(d.target.scaleDefault);
            const ev = activeFilters.edges.has(d.type);
            return (sv && tv && ev) ? null : "none";
        });

        // 4. Determine dimming based on Search, Lens, Workflow Mode, or Selected Neighborhood
        if (q) {
            nodeSel.classed("dimmed", (d: any) => !searchMatches.has(d.id));
            linkSel.classed("dimmed", (e: any) => !searchMatches.has(e.source.id) && !searchMatches.has(e.target.id));
        } else if (activeLens && rule) {
            linkSel.classed("dimmed", (e: any) => !rule.edges.has(e.type));
            if (rule.nodes) {
                nodeSel.classed("dimmed", (d: any) => !rule.nodes!.has(d.id) && !simEdges.some((e: any) => rule.edges.has(e.type) && (e.source.id === d.id || e.target.id === d.id)));
            } else {
                nodeSel.classed("dimmed", (d: any) => !simEdges.some((e: any) => rule.edges.has(e.type) && (e.source.id === d.id || e.target.id === d.id)));
            }
        } else if (displayMode === "workflow") {
            const workflowPath = new Set(["dashboard", "data-sources", "assemblage-compass", "cultural-framing", "institutional-logics", "cross-case-synthesis", "meta-governance"]);
            nodeSel.classed("dimmed", (d: any) => !workflowPath.has(d.id));
            linkSel.classed("dimmed", (e: any) => !workflowPath.has(e.source.id) || !workflowPath.has(e.target.id));
        } else if (selectedNode) {
            // Selected neighborhood logic done dynamically on click in the original implementation, but we can maintain it here if state driven
            const connected = new Set([selectedNode.id]);
            simEdges.forEach((e: any) => {
                if (e.source.id === selectedNode.id) connected.add(e.target.id);
                if (e.target.id === selectedNode.id) connected.add(e.source.id);
            });
            nodeSel.classed("dimmed", (n: any) => !connected.has(n.id));
            linkSel.classed("dimmed", (e: any) => e.source.id !== selectedNode.id && e.target.id !== selectedNode.id);
        }

        // Apply display mode specific styles (Symmetry)
        if (displayMode === "symmetry") {
            nodeSel.select(".node-shape").attr("r", 24);
            nodeSel.select(".node-ring-outer").attr("r", 29);
        } else {
            nodeSel.select(".node-shape").attr("r", (d: any) => d.r);
            nodeSel.select(".node-ring-outer").attr("r", (d: any) => d.r + 5);
        }

    }, [activeFilters, searchQuery, activeLens, displayMode, selectedNode]);

    // Labels effect
    useEffect(() => {
        const { svg } = d3StateRef.current;
        if (!svg) return;
        svg.selectAll(".label-extra").attr("opacity", showLabels ? 0.65 : 0);
    }, [showLabels]);

    // Secondary effect when gravity slider moves
    useEffect(() => {
        const { simulation } = d3StateRef.current;
        if (!simulation) return;

        const LEVEL_Y: Record<string, number> = { overview: 800 * 0.48, micro: 800 * 0.80, meso: 800 * 0.52, macro: 800 * 0.20 };
        simulation.force("gravity-y", d3.forceY((d: any) => LEVEL_Y[d.scaleDefault] || 400).strength(gravityStrength * 0.25));
        simulation.alpha(0.25).restart();
    }, [gravityStrength]);

    // --- LABEL EXTRA TOGGLE ---
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll(".label-extra").transition().duration(250).style("opacity", showLabels ? 0.7 : 0);
    }, [showLabels]);

    const handleReset = () => {
        const { svg, zoom } = d3StateRef.current;
        if (!svg || !zoom) return;
        svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity);
        setSelectedNode(null);
        setSearchQuery("");
        setActiveLens(null);
        setDisplayMode("rhizome");
    };

    const jumpToNode = (node: any, reason?: string) => {
        setSelectedNode(node);
        setActiveTab('detail');
        if (reason) setDriftResult(`Drifted to: ${node.name} — ${reason}`);
        const { svg, zoom } = d3StateRef.current;
        if (!svg || !zoom) return;
        const width = svg.node().clientWidth || 800;
        const height = svg.node().clientHeight || 800;
        const transform = d3.zoomIdentity.translate(width / 2 - node.x, height / 2 - node.y).scale(1.2);
        svg.transition().duration(800).call(zoom.transform, transform);
    };

    const handleDrift = (action: string) => {
        const { simNodes, simEdges } = d3StateRef.current;
        if (!simNodes) return;

        if (action === 'contested') {
            const n = simNodes.reduce((a: any, b: any) => b.hotspot.disagreement > a.hotspot.disagreement ? b : a);
            jumpToNode(n, `Highest disagreement index: ${Math.round(n.hotspot.disagreement * 100)}%`);
        } else if (action === 'ungrounded') {
            const n = simNodes.reduce((a: any, b: any) => b.hotspot.grounding < a.hotspot.grounding ? b : a);
            jumpToNode(n, `Lowest grounding coverage: ${Math.round(n.hotspot.grounding * 100)}%`);
        } else if (action === 'translate') {
            const base = selectedNode || simNodes[0];
            const translEdges = simEdges.filter((e: any) => e.type === "translates" && (e.source.id === base.id || e.target.id === base.id));
            if (translEdges.length) {
                const e = translEdges[Math.floor(Math.random() * translEdges.length)];
                const next = e.source.id === base.id ? e.target : e.source;
                jumpToNode(next, `Following translation from ${base.name}`);
            } else {
                setDriftResult("No translation edges from selected node. Select a node first.");
            }
        } else if (action === 'broker') {
            const brokerScore = (n: any) => {
                const edges = simEdges.filter((e: any) => e.source.id === n.id || e.target.id === n.id);
                const scales = new Set(edges.map((e: any) => e.source.id === n.id ? e.target.scaleDefault : e.source.scaleDefault));
                return scales.size;
            };
            const n = simNodes.reduce((a: any, b: any) => brokerScore(b) > brokerScore(a) ? b : a);
            jumpToNode(n, `Cross-scale broker: connects ${brokerScore(n)} levels`);
        } else if (action === 'random') {
            const n = simNodes[Math.floor(Math.random() * simNodes.length)];
            jumpToNode(n, "Rhizomatic jump — no predetermined destination");
        }
    };


    return (
        <div className="w-full h-[600px] lg:h-[800px] flex flex-col overflow-hidden bg-[#060d1a] text-[#c8d8f0] font-sans">
            {/* ── HEADER ── */}
            <header className="flex items-center justify-between p-3 bg-[#0a1628] border-b border-[#1a3050] flex-shrink-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-gradient-to-br from-blue-500 to-emerald-500 shadow-[0_0_15px_rgba(58,143,212,0.3)]">🍵</div>
                    <div>
                        <div className="text-sm font-bold text-[#e8f4ff] font-['Space_Grotesk',sans-serif]">instant<strong className="text-[#3a8fd4]">TEA</strong></div>
                        <div className="text-[9px] text-[#5a7a9a] tracking-[1.2px] uppercase">Rhizomatic Navigation</div>
                    </div>
                </div>

                <div className="text-center flex-1 hidden md:block">
                    <div className="text-xs font-semibold text-[#e8f4ff] whitespace-nowrap overflow-hidden text-ellipsis shadow-sm">Explore the Assemblage Through Entangled Concepts</div>
                    <div className="text-[9px] text-[#5a7a9a] tracking-[0.8px] uppercase">ANT · Assemblage Theory · Snapshot Ecology</div>
                </div>

                <div className="flex gap-2 items-center flex-shrink-0">
                    <div className="relative flex items-center mr-2">
                        <span className="absolute left-2 text-[#5a7a9a] text-[12px]">⌕</span>
                        <input
                            type="text"
                            placeholder="Search…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#060d1a] border border-[#1a3050] text-[#c8d8f0] text-[10px] rounded pl-6 pr-2 py-1 w-32 focus:outline-none focus:border-[#3a8fd4] transition-colors"
                            suppressHydrationWarning={true}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[9px] text-[#5a7a9a]">Gravity</span>
                        <input
                            type="range"
                            min="0" max="100"
                            value={gravityStrength * 100}
                            onChange={(e) => setGravityStrength(parseInt(e.target.value) / 100)}
                            className="w-20"
                        />
                    </div>

                    <button
                        onClick={() => {
                            const modes: ("rhizome" | "workflow" | "symmetry")[] = ["rhizome", "workflow", "symmetry"];
                            setDisplayMode(modes[(modes.indexOf(displayMode) + 1) % 3]);
                        }}
                        className={`border px-3 py-1 text-[10px] rounded transition-colors ${displayMode === 'rhizome' ? 'bg-[rgba(58,143,212,0.2)] border-[#3a8fd4] text-[#3a8fd4]' :
                            displayMode === 'workflow' ? 'bg-[rgba(46,196,160,0.2)] border-[#2ec4a0] text-[#2ec4a0]' :
                                'bg-[rgba(245,166,35,0.2)] border-[#f5a623] text-[#f5a623]'
                            }`}
                        suppressHydrationWarning={true}
                    >
                        {displayMode === 'rhizome' ? '⬡ Rhizome' : displayMode === 'workflow' ? '→ Workflow' : '◎ Symmetry'}
                    </button>
                    <button
                        onClick={() => setShowLabels(!showLabels)}
                        className={`border px-3 py-1 text-[10px] rounded hover:bg-[#1a3050] hover:text-[#e8f4ff] transition-colors ${showLabels ? 'bg-[#1a3a5a] border-[#3a8fd4] text-[#3a8fd4]' : 'bg-[#0e1e35] border-[#1a3050] text-[#c8d8f0]'
                            }`}
                        suppressHydrationWarning={true}
                    >Labels</button>
                    <button onClick={handleReset} suppressHydrationWarning={true} className="bg-[#0e1e35] border border-[#1a3050] text-[#c8d8f0] px-3 py-1 text-[10px] rounded hover:bg-[#e05060] hover:text-[#fff] transition-colors">Reset</button>
                    <button
                        onClick={toggleFullScreen}
                        className="bg-[#0e1e35] border border-[#1a3050] text-[#c8d8f0] px-2 py-1 text-[10px] rounded hover:bg-[#3a8fd4] hover:text-white transition-colors"
                        title="Toggle Fullscreen"
                        suppressHydrationWarning={true}
                    >
                        {isFullscreen ? "⬍ Exit Fullscreen" : "⬎ Fullscreen"}
                    </button>
                </div>
            </header>

            {/* ── TOOLTIP ── */}
            {tooltip.content && (
                <div
                    className="fixed z-[1000] pointer-events-none bg-[#0a1628] border border-[#1a3050] rounded-lg p-3 shadow-2xl max-w-[320px] animate-in fade-in zoom-in-95 duration-150"
                    style={{ left: tooltip.x, top: tooltip.y }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}

            {/* ── SNAPSHOT BAR ── */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-1.5 bg-[#0a1628] border-b border-[#1a3050] text-[10px]">
                <span className="text-[#5a7a9a] tracking-[0.8px] uppercase font-bold text-[9px]">Snapshot</span>
                <span className="text-[#a070e0] font-semibold">InstantTEA Platform · Feature Assemblage</span>
                <div className="w-px h-3 bg-[#1a3050]"></div>
                <span className="text-[#5a7a9a]">v1.2 · 2026-02-21</span>
                <div className="w-px h-3 bg-[#1a3050]"></div>
                <span className="text-[#a8e063] font-semibold">TTL: 90 days · Freshness: 94%</span>
                <div className="w-px h-3 bg-[#1a3050]"></div>
                <span className="text-[#5a7a9a]">sensitivity: <strong className="text-[#a8e063] font-normal">public</strong></span>
                <div className="w-px h-3 bg-[#1a3050]"></div>
                <span className="text-[#5a7a9a]">trainable: <strong className="text-[#e05060] font-normal">never</strong></span>
                <div className="w-px h-3 bg-[#1a3050]"></div>
                <span className="text-[#5a7a9a]">exportable: <strong className="text-[#a8e063] font-normal">true</strong></span>
                <div className="flex-1"></div>
                <button className="bg-[#1a3050] hover:bg-[#2a4570] text-[9px] px-2 py-0.5 rounded text-[#e8f4ff] font-bold border border-[#3a8fd4]/30 transition-all">⑂ Fork Snapshot</button>
            </div>

            {/* ── FILTER BAR ── */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-1.5 bg-[#060d1a] border-b border-[#1a3050] text-[9.5px]">
                <span className="text-[#5a7a9a] tracking-[0.8px] uppercase font-bold mr-1">Scale:</span>
                {['all', 'micro', 'meso', 'macro', 'overview'].map(level => {
                    const colors: Record<string, string> = { all: '#5a7a9a', micro: '#e05060', meso: '#3a8fd4', macro: '#2ec4a0', overview: '#a070e0' };
                    const isActive = activeFilters.levels.has(level);
                    return (
                        <button key={level} onClick={() => toggleLevelFilter(level)}
                            className={`px-3 py-[2px] rounded-full border transition-colors font-semibold capitalize
                            ${isActive ? 'bg-opacity-20' : 'bg-transparent border-[#1a3050] text-[#5a7a9a] hover:border-gray-500'}`}
                            style={isActive ? { borderColor: colors[level], color: colors[level], backgroundColor: `${colors[level]}22` } : {}}
                        >{level}</button>
                    )
                })}
                <div className="w-px h-3 bg-[#1a3050] mx-1"></div>
                <span className="text-[#5a7a9a] tracking-[0.8px] uppercase font-bold mr-1">Relation:</span>
                {['depends_on', 'operationalizes', 'grounds_in', 'produces', 'contests', 'translates'].map(edge => {
                    const isActive = activeFilters.edges.has(edge);
                    const color = EDGE_COLORS[edge] || '#5a7a9a';
                    return (
                        <button key={edge} onClick={() => toggleEdgeFilter(edge)}
                            className={`px-3 py-[2px] rounded-full border transition-colors font-semibold
                            ${isActive ? 'bg-opacity-20' : 'bg-transparent border-[#1a3050] text-[#5a7a9a] hover:border-gray-500'}`}
                            style={isActive ? { borderColor: color, color: color, backgroundColor: `${color}22` } : {}}
                        >{edge}</button>
                    )
                })}
            </div>

            {/* ── MAIN AREA ── */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* ── CANVAS ── */}
                <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#060d1a]">
                    <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="w-[300px] flex flex-col bg-[#0e1e35] border-l border-[#1a3050] flex-shrink-0 absolute md:relative right-0 h-full z-10 transition-transform">
                    {/* Tabs */}
                    <div className="flex border-b border-[#1a3050]">
                        {['detail', 'lenses', 'drift', 'legend'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-[0.8px] border-b-2 transition-colors
                                    ${activeTab === tab ? 'text-[#3a8fd4] border-[#3a8fd4] bg-[rgba(58,143,212,0.05)]' : 'text-[#5a7a9a] border-transparent'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'detail' && (
                            selectedNode ? (
                                <div className="animate-in fade-in duration-200">
                                    <h3 className="text-[15px] font-bold text-[#e8f4ff] mb-1">{selectedNode.icon} {selectedNode.name}</h3>
                                    <div className="flex gap-1 mb-4 flex-wrap">
                                        <span className="px-2 py-[2px] rounded-full text-[8.5px] font-bold uppercase tracking-[0.7px] border bg-[rgba(255,255,255,0.06)] border-[#1a3050] text-[#c8d8f0]">{selectedNode.nodeType}</span>
                                        <span className="px-2 py-[2px] rounded-full text-[8.5px] font-bold uppercase tracking-[0.7px] border bg-[rgba(58,143,212,0.18)] border-[rgba(58,143,212,0.3)] text-[#3a8fd4]">{selectedNode.scaleDefault}</span>
                                        {selectedNode.isOPP && <span className="px-2 py-[2px] rounded-full text-[8.5px] font-bold uppercase tracking-[0.7px] border bg-[rgba(245,166,35,0.18)] border-[rgba(245,166,35,0.3)] text-[#f5a623]">OPP</span>}
                                    </div>

                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-1.5 pb-1 border-b border-[#1a3050]">Snapshot Metadata</div>
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        <span className={`px-2 py-[2px] rounded text-[9px] font-semibold ${selectedNode.freshness > 0.85 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>Freshness: {Math.round(selectedNode.freshness * 100)}%</span>
                                        <span className="px-2 py-[2px] rounded text-[9px] font-semibold bg-blue-500/10 text-blue-400">TTL: {selectedNode.ttl_days}d</span>
                                        <span className={`px-2 py-[2px] rounded text-[9px] font-semibold ${selectedNode.scaleConfidence > 0.85 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>Confidence: {Math.round(selectedNode.scaleConfidence * 100)}%</span>
                                    </div>

                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-1.5 pb-1 border-b border-[#1a3050]">Feature Description</div>
                                    <div className="text-[10.5px] text-[#5a7a9a] leading-relaxed mb-4">{selectedNode.desc}</div>

                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-1.5 pb-1 border-b border-[#1a3050]">Theoretical Grounding</div>
                                    <div className="text-[10.5px] leading-relaxed text-[#c8d8f0] p-2 bg-[rgba(255,255,255,0.03)] rounded border-l-2 border-[#3a8fd4] mb-4">
                                        {selectedNode.theory}
                                    </div>

                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-1.5 pb-1 border-b border-[#1a3050]">Hotspot Metrics</div>
                                    <div className="space-y-1 mb-4">
                                        {[
                                            { label: 'Entanglement diversity', val: selectedNode.hotspot.entanglement },
                                            { label: 'Grounding coverage', val: selectedNode.hotspot.grounding },
                                            { label: 'Consensus (low disagreement)', val: 1 - selectedNode.hotspot.disagreement },
                                            { label: 'Freshness / decay salience', val: 1 - selectedNode.hotspot.decay }
                                        ].map(m => (
                                            <div key={m.label} className="grid grid-cols-[1fr_80px_40px] gap-2 items-center py-1 border-b border-[rgba(255,255,255,0.04)]">
                                                <span className="text-[10px]">{m.label}</span>
                                                <div className="h-1 bg-[#1a3050] rounded-full overflow-hidden">
                                                    <div className="h-full" style={{ width: `${m.val * 100}%`, backgroundColor: m.val > 0.6 ? '#2ec4a0' : m.val > 0.35 ? '#3a8fd4' : '#e05060' }}></div>
                                                </div>
                                                <span className="text-[9px] text-right text-[#5a7a9a]">{Math.round(m.val * 100)}%</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-1.5 pb-1 border-b border-[#1a3050]">Entangled Connections</div>
                                    <div className="space-y-1.5">
                                        {d3StateRef.current.simEdges?.filter((e: any) => e.source.id === selectedNode.id || e.target.id === selectedNode.id).map((e: any, idx: number) => {
                                            const otherNode = e.source.id === selectedNode.id ? e.target : e.source;
                                            const dir = e.source.id === selectedNode.id ? 'Out' : 'In';
                                            if (!otherNode) return null;
                                            return (
                                                <div
                                                    key={`${e.source.id}-${e.target.id}-${idx}`}
                                                    onClick={() => jumpToNode(otherNode, `Following connection to ${otherNode.name}`)}
                                                    className="flex items-center gap-2 p-1.5 rounded bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(58,143,212,0.1)] border border-transparent hover:border-[#3a8fd4]/30 cursor-pointer transition-all"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EDGE_COLORS[e.type] }}></div>
                                                    <div className="flex-1">
                                                        <div className="text-[10px] font-bold text-[#e8f4ff]">{otherNode.icon} {otherNode.name}</div>
                                                        <div className="text-[8.5px] text-[#5a7a9a]">{e.type} · {e.label} · <span className="text-[#3a8fd4]">{dir}</span></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-[#5a7a9a] text-[11px] leading-relaxed">
                                    <div className="text-3xl mb-3 opacity-30">⬡</div>
                                    <strong>Click any node</strong> to explore its assemblage role, theoretical grounding, snapshot metadata, hotspot metrics, and entangled connections.
                                </div>
                            )
                        )}

                        {activeTab === 'lenses' && (
                            <div className="animate-in fade-in duration-200">
                                <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-2 pb-1 border-b border-[#1a3050]">4 Lens Cards · Phase 1</div>
                                <div
                                    onClick={() => setActiveLens(activeLens === 'evidence' ? null : 'evidence')}
                                    className={`p-2 mb-2 bg-[rgba(255,255,255,0.03)] border rounded-md cursor-pointer transition-all ${activeLens === 'evidence' ? 'border-[#3a8fd4] bg-[rgba(58,143,212,0.15)] shadow-[0_0_15px_rgba(58,143,212,0.25)]' : 'border-[#1a3050] hover:border-[#3a8fd4] hover:bg-[rgba(58,143,212,0.06)]'}`}>
                                    <div className="text-[11px] font-bold text-[#e8f4ff] mb-1"><span className="text-[14px] mr-1">🔍</span>Evidence / Provenance</div>
                                    <div className="text-[9.5px] text-[#5a7a9a] leading-relaxed">Highlights <strong>grounds_in</strong> edges. Surfaces ungrounded claims. Scores grounding coverage.</div>
                                </div>
                                <div
                                    onClick={() => setActiveLens(activeLens === 'resistance' ? null : 'resistance')}
                                    className={`p-2 mb-2 bg-[rgba(255,255,255,0.03)] border rounded-md cursor-pointer transition-all ${activeLens === 'resistance' ? 'border-[#3a8fd4] bg-[rgba(58,143,212,0.15)] shadow-[0_0_15px_rgba(58,143,212,0.25)]' : 'border-[#1a3050] hover:border-[#3a8fd4] hover:bg-[rgba(58,143,212,0.06)]'}`}>
                                    <div className="text-[11px] font-bold text-[#e8f4ff] mb-1"><span className="text-[14px] mr-1">✊</span>Resistance</div>
                                    <div className="text-[9.5px] text-[#5a7a9a] leading-relaxed">Highlights <strong>contests</strong> edges and Micro-Resistance node. Reveals frictions and counter-conduct.</div>
                                </div>
                                <div
                                    onClick={() => setActiveLens(activeLens === 'cultural' ? null : 'cultural')}
                                    className={`p-2 mb-2 bg-[rgba(255,255,255,0.03)] border rounded-md cursor-pointer transition-all ${activeLens === 'cultural' ? 'border-[#3a8fd4] bg-[rgba(58,143,212,0.15)] shadow-[0_0_15px_rgba(58,143,212,0.25)]' : 'border-[#1a3050] hover:border-[#3a8fd4] hover:bg-[rgba(58,143,212,0.06)]'}`}>
                                    <div className="text-[11px] font-bold text-[#e8f4ff] mb-1"><span className="text-[14px] mr-1">🎭</span>Cultural Framing</div>
                                    <div className="text-[9.5px] text-[#5a7a9a] leading-relaxed">Highlights Cultural Framing node and <strong>operationalizes / translates</strong> edges. Surfaces categories.</div>
                                </div>
                                <div
                                    onClick={() => setActiveLens(activeLens === 'infra' ? null : 'infra')}
                                    className={`p-2 mb-2 bg-[rgba(255,255,255,0.03)] border rounded-md cursor-pointer transition-all ${activeLens === 'infra' ? 'border-[#3a8fd4] bg-[rgba(58,143,212,0.15)] shadow-[0_0_15px_rgba(58,143,212,0.25)]' : 'border-[#1a3050] hover:border-[#3a8fd4] hover:bg-[rgba(58,143,212,0.06)]'}`}>
                                    <div className="text-[11px] font-bold text-[#e8f4ff] mb-1"><span className="text-[14px] mr-1">🏗</span>Infrastructure</div>
                                    <div className="text-[9.5px] text-[#5a7a9a] leading-relaxed">Highlights <strong>depends_on</strong> edges and Tool-type nodes. Reveals LLM dependencies.</div>
                                </div>
                                <div className="mt-3 text-[9.5px] text-[#5a7a9a] leading-relaxed">A Lens is a <em>filter + scoring rule</em>, not a new taxonomy. Click a card to activate.</div>
                            </div>
                        )}

                        {activeTab === 'drift' && (
                            <div className="animate-in fade-in duration-200 text-[10px] text-[#5a7a9a]">
                                <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-2 pb-1 border-b border-[#1a3050]">Drift Mode · Guided Random Walk</div>
                                <p className="mb-4">Drift preserves rhizomatic play while staying purposeful. Each prompt navigates to the next relevant node.</p>
                                <button onClick={() => handleDrift('contested')} className="w-full text-left p-2 mb-2 bg-[rgba(255,255,255,0.04)] border border-[#1a3050] rounded-md hover:border-[#3a8fd4] hover:text-[#e8f4ff] hover:bg-[rgba(58,143,212,0.1)] transition-all flex items-center gap-2">
                                    <span>⚡</span> Show most contested node
                                </button>
                                <button onClick={() => handleDrift('ungrounded')} className="w-full text-left p-2 mb-2 bg-[rgba(255,255,255,0.04)] border border-[#1a3050] rounded-md hover:border-[#3a8fd4] hover:text-[#e8f4ff] hover:bg-[rgba(58,143,212,0.1)] transition-all flex items-center gap-2">
                                    <span>🔍</span> Jump to an ungrounded claim
                                </button>
                                <button onClick={() => handleDrift('translate')} className="w-full text-left p-2 mb-2 bg-[rgba(255,255,255,0.04)] border border-[#1a3050] rounded-md hover:border-[#3a8fd4] hover:text-[#e8f4ff] hover:bg-[rgba(58,143,212,0.1)] transition-all flex items-center gap-2">
                                    <span>🔗</span> Follow translations
                                </button>
                                <button onClick={() => handleDrift('broker')} className="w-full text-left p-2 mb-2 bg-[rgba(255,255,255,0.04)] border border-[#1a3050] rounded-md hover:border-[#3a8fd4] hover:text-[#e8f4ff] hover:bg-[rgba(58,143,212,0.1)] transition-all flex items-center gap-2">
                                    <span>🌉</span> Find cross-scale broker node
                                </button>
                                <button onClick={() => handleDrift('random')} className="w-full text-left p-2 mb-2 bg-[rgba(255,255,255,0.04)] border border-[#1a3050] rounded-md hover:border-[#3a8fd4] hover:text-[#e8f4ff] hover:bg-[rgba(58,143,212,0.1)] transition-all flex items-center gap-2">
                                    <span>🎲</span> Random rhizomatic jump
                                </button>

                                {driftResult && (
                                    <div className="mt-3 p-2 bg-[rgba(255,255,255,0.03)] border border-[#1a3050] rounded-md text-[9.5px] leading-relaxed animate-in slide-in-from-top-1">
                                        {driftResult}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'legend' && (
                            <div className="animate-in fade-in duration-200">
                                {/* Scale Level */}
                                <div className="mb-4">
                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-2">Scale Level (dynamic)</div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#e05060] bg-[rgba(224,80,96,0.12)] shrink-0"></div>
                                        <div><div>Micro · Individual</div><div className="text-[9px] text-[#5a7a9a]">Ground-level actors, data, resistance</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#3a8fd4] bg-[rgba(58,143,212,0.12)] shrink-0"></div>
                                        <div><div>Meso · Institutional</div><div className="text-[9px] text-[#5a7a9a]">Mapping engines, framing, concepts</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#2ec4a0] bg-[rgba(46,196,160,0.12)] shrink-0"></div>
                                        <div><div>Macro · System</div><div className="text-[9px] text-[#5a7a9a]">Dynamics, synthesis, governance</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#a070e0] bg-[rgba(160,112,224,0.12)] shrink-0"></div>
                                        <div><div>Overview</div><div className="text-[9px] text-[#5a7a9a]">Entry points, configuration</div></div>
                                    </div>
                                </div>

                                {/* Node Type */}
                                <div className="mb-4">
                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-2">Node Type (shape)</div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 text-[11px]">⬡</div>
                                        <div><div>Tool / Module</div><div className="text-[9px] text-[#5a7a9a]">Platform feature or software component</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 text-[11px]">◆</div>
                                        <div><div>Concept / Value</div><div className="text-[9px] text-[#5a7a9a]">Theoretical or normative construct</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 text-[11px]">●</div>
                                        <div><div>Actor / Practice</div><div className="text-[9px] text-[#5a7a9a]">Human or non-human actant</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 text-[11px]">▣</div>
                                        <div><div>Artifact / Export</div><div className="text-[9px] text-[#5a7a9a]">Boundary object, output, evidence</div></div>
                                    </div>
                                </div>

                                {/* Canonical Edges */}
                                <div className="mb-4">
                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-2">6 Canonical Edge Types</div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[26px] h-[2px] rounded-[1px] bg-[#f5a623] shrink-0"></div>
                                        <div><div>depends_on</div><div className="text-[9px] text-[#5a7a9a]">Tool/Module ↔ Artifact/Tool</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[26px] h-[2px] rounded-[1px] bg-[#4ecdc4] shrink-0"></div>
                                        <div><div>operationalizes</div><div className="text-[9px] text-[#5a7a9a]">Concept/Value → Tool/Practice</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[26px] h-[2px] rounded-[1px] bg-[#a8e063] shrink-0"></div>
                                        <div><div>grounds_in</div><div className="text-[9px] text-[#5a7a9a]">Claim → Evidence artifact</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[26px] h-[2px] rounded-[1px] bg-[#a070e0] shrink-0"></div>
                                        <div><div>produces</div><div className="text-[9px] text-[#5a7a9a]">Tool/Practice → Artifact/Snapshot</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[26px] h-[2px] rounded-[1px] border-t-2 border-dashed border-[#e05060] shrink-0"></div>
                                        <div><div>contests</div><div className="text-[9px] text-[#5a7a9a]">Actor/Value ↔ Node/Edge (friction)</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[26px] h-[2px] rounded-[1px] bg-[#60aaff] shrink-0"></div>
                                        <div><div>translates</div><div className="text-[9px] text-[#5a7a9a]">ANT enrolment catch-all</div></div>
                                    </div>
                                </div>

                                {/* Special Markers */}
                                <div className="mb-4">
                                    <div className="text-[8.5px] font-bold tracking-[1.3px] uppercase text-[#5a7a9a] mb-2">Special Markers</div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-[#f5a623] shadow-[0_0_7px_#f5a623] shrink-0"></div>
                                        <div><div>Obligatory Passage Point</div><div className="text-[9px] text-[#5a7a9a]">Pulsing ring — actors pass through</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-dashed border-[#a8e063] opacity-50 shrink-0"></div>
                                        <div><div>Decaying / Low freshness</div><div className="text-[9px] text-[#5a7a9a]">Dashed border — TTL expiry</div></div>
                                    </div>
                                    <div className="flex items-center gap-2 py-1 text-[10.5px] text-[#c8d8f0]">
                                        <div className="w-[18px] h-[18px] rounded-[3px] border-2 border-[#a8e063] shadow-[0_0_6px_rgba(168,224,99,0.6)] shrink-0"></div>
                                        <div><div>Boundary Object</div><div className="text-[9px] text-[#5a7a9a]">Green glow — bridges communities</div></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BOTTOM BAR ── */}
            <div className="h-8 bg-[#0a1628] border-t border-[#1a3050] flex items-center justify-between px-4 text-[9px] text-[#5a7a9a] flex-shrink-0">
                <div className="flex gap-4">
                    <div className="flex gap-1.5 items-center"><span className="bg-[#1a3050] text-[#c8d8f0] px-1 rounded-[2px] text-[8px] font-bold">DRAG</span> Pan</div>
                    <div className="flex gap-1.5 items-center"><span className="bg-[#1a3050] text-[#c8d8f0] px-1 rounded-[2px] text-[8px] font-bold">SCROLL</span> Zoom</div>
                    <div className="flex gap-1.5 items-center"><span className="bg-[#1a3050] text-[#c8d8f0] px-1 rounded-[2px] text-[8px] font-bold">CLICK</span> Explore</div>
                    <div className="flex gap-1.5 items-center"><span className="bg-[#1a3050] text-[#c8d8f0] px-1 rounded-[2px] text-[8px] font-bold">HOVER</span> Reveal</div>
                </div>
                <div className="font-mono tracking-wider opacity-60">
                    {NODES.length} nodes · {EDGES.length} edges · 6 types · 4 lenses
                </div>
            </div>
        </div>
    );
}
