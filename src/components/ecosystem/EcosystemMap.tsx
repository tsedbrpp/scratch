import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { EcosystemActor, EcosystemConfiguration, AssemblageAnalysis, AiAbsenceAnalysis, AssemblageExplanation } from '@/types/ecosystem';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Layers, EyeOff, ChevronDown, Maximize, Minimize, MessageSquare, X, Trash2, Activity } from 'lucide-react';
import { useForceGraph, SimulationNode } from '@/hooks/useForceGraph';
import { generateEdges, getHullPath } from '@/lib/graph-utils';
import { TranslationChain } from './TranslationChain';
import dynamic from 'next/dynamic';
import { ViewTypeLegend } from './EcosystemLegends';
import { SWISS_COLORS, getActorColor, getActorShape, mergeGhostNodes, GhostActor, calculateConfigMetrics, getBiasIntensity } from '@/lib/ecosystem-utils';
import { EcosystemToolbar } from './EcosystemToolbar';

const EcosystemMap3D = dynamic(() => import('./EcosystemMap3D').then(mod => mod.EcosystemMap3D), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400">Loading 3D Engine...</div>
});

import { AnalysisMode } from '@/components/ui/mode-selector';
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { getGlossaryDefinition } from "@/lib/glossary-definitions";
import { AssemblageDynamics } from './AssemblageDynamics';


interface EcosystemMapProps {
    actors: EcosystemActor[];
    configurations: EcosystemConfiguration[];
    positions?: Record<string, { x: number, y: number }>;
    interactionMode: "drag" | "select";
    setInteractionMode: (mode: "drag" | "select") => void;
    selectedForGrouping: string[];
    onToggleSelection: (actorId: string) => void;
    onCreateConfiguration: () => void;
    onActorDrag: (actorId: string, x: number, y: number) => void;
    onConfigDrag: (configId: string, dx: number, dy: number) => void;
    activeLayers?: Record<string, boolean>;
    toggleLayer?: (layer: string) => void;
    colorMode?: "type" | "epistemic";
    onConfigClick?: (configId: string, multi?: boolean) => void;
    selectedConfigIds?: string[];
    onDeleteConfiguration?: (configId: string) => void;
    onAddConfiguration?: (config: EcosystemConfiguration) => void; // [NEW] Support adding configs from child components
    absenceAnalysis?: AssemblageAnalysis | AiAbsenceAnalysis | null;
    analysisMode?: AnalysisMode;
    setAnalysisMode?: (mode: AnalysisMode) => void;
    configLayout?: Record<string, { x: number; y: number }>;
    onConfigSelect?: (configId: string, multi?: boolean) => void;
    onClearConfig?: () => void; // [NEW] Support clearing selection
    extraToolbarContent?: React.ReactNode;
    isReadOnly?: boolean; // [NEW]
    // [NEW] ANT Workbench Props
    collapsedIds?: Set<string>;
    tracedId?: string | null;
    onToggleCollapse?: (id: string) => void;
    onTraceActor?: (id: string | null) => void;
    selectedActorId?: string | null;
}

// --- Swiss Design System Constants ---
// Moved to @/lib/ecosystem-utils

const HULL_STYLES = {
    opacity: 0.15,
    strokeDash: "6 4",
    strokeWidth: 2
};

// ... unchanged styles ...

export function EcosystemMap({
    actors,
    configurations,
    interactionMode,
    setInteractionMode,
    selectedForGrouping,
    onToggleSelection,
    onCreateConfiguration,
    onConfigClick,
    onConfigDrag,
    selectedConfigIds, // [FIX] Array
    onDeleteConfiguration,
    absenceAnalysis,
    analysisMode = "hybrid_reflexive",
    configLayout = {},
    onConfigSelect,
    // onClearConfig, // Unused but kept for interface compatibility if needed
    extraToolbarContent,
    isReadOnly = false,
    onAddConfiguration, // [NEW] Destructure new prop
    selectedActorId,
    // [NEW] Destructure ANT props (we use internal state if not provided, or sync)
    ...props
}: EcosystemMapProps) {
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [selectedLink, setSelectedLink] = useState<{
        source: string | SimulationNode;
        target: string | SimulationNode;
        type: string;
        description?: string;
        flow_type?: 'power' | 'logic';
    } | null>(null);
    // ... existing state ...

    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [draggingConfigId, setDraggingConfigId] = useState<string | null>(null);

    const { currentWorkspaceId } = useWorkspace(); // [NEW] Injected Hook

    // [RESTORED STATE]
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
    const [layoutMode, setLayoutMode] = useState<'compass' | 'nested'>('nested');

    const isNestedMode = layoutMode === 'nested';
    const isMetricMode = layoutMode === 'compass';

    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [isStratumMode, setIsStratumMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [is3DMode, setIs3DMode] = useState(false);
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const [highlightedStage, setHighlightedStage] = useState<string | null>(null);
    const [showSolidEdges, setShowSolidEdges] = useState(true);
    const [showGhostEdges, setShowGhostEdges] = useState(true);
    const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);

    // [NEW] Safe Exploration Toggle
    const [showUnverifiedLinks, setShowUnverifiedLinks] = useState(false);
    const [linkClassFilter, setLinkClassFilter] = useState<'all' | 'mediator' | 'intermediary'>('all');

    const handleCycleClassFilter = useCallback(() => {
        setLinkClassFilter(prev => {
            if (prev === 'all') return 'mediator';
            if (prev === 'mediator') return 'intermediary';
            return 'all';
        });
    }, []);

    const mergedActors = useMemo(() => {
        return mergeGhostNodes(actors, absenceAnalysis || null);
    }, [actors, absenceAnalysis]);

    const filteredActors = useMemo(() => {
        if (showGhostEdges) {
            return mergedActors;
        }
        return mergedActors.filter(actor => {
            const isGhost = 'isGhost' in actor && (actor as unknown as GhostActor).isGhost;
            return !isGhost;
        });
    }, [mergedActors, showGhostEdges]);

    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState<AssemblageExplanation | null>(null);
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [showTopUp, setShowTopUp] = useState(false);
    const [configToDelete, setConfigToDelete] = useState<string | null>(null);
    const [showDynamics, setShowDynamics] = useState(false);
    const [collapsedAssemblages, setCollapsedAssemblages] = useState<Set<string>>(new Set());
    const [tracedActorId, setTracedActorId] = useState<string | null>(null);

    // Draggable Legend Logic
    const [legendPos, setLegendPos] = useState({ x: 24, y: 96 });
    const draggingRef = useRef<{ isDragging: boolean; startX: number; startY: number; initialX: number; initialY: number }>({
        isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0
    });

    const handleLegendMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
        draggingRef.current = {
            isDragging: true, startX: e.clientX, startY: e.clientY, initialX: legendPos.x, initialY: legendPos.y
        };
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingRef.current.isDragging) return;
            const dx = e.clientX - draggingRef.current.startX;
            const dy = e.clientY - draggingRef.current.startY;
            setLegendPos({ x: draggingRef.current.initialX + dx, y: draggingRef.current.initialY + dy });
        };
        const handleMouseUp = () => draggingRef.current.isDragging = false;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const calculateActorPower = (actor: EcosystemActor): number => {
        if (actor.metrics?.dynamic_power) return actor.metrics.dynamic_power;
        const influenceMap = { 'High': 10, 'Medium': 5, 'Low': 2 };
        const baseInfluence = influenceMap[actor.influence as keyof typeof influenceMap] || 5;
        let stabilityPower = 1;
        const t = actor.metrics?.territorialization;
        if (typeof t === 'number') stabilityPower = 0.5 + (t / 10);
        else if (typeof t === 'string') {
            const qMap = { 'Strong': 1.5, 'Moderate': 1.0, 'Weak': 0.7, 'Latent': 0.5 };
            stabilityPower = qMap[t as keyof typeof qMap] || 1.0;
        }
        return baseInfluence * stabilityPower;
    };

    useEffect(() => {
        if (props.collapsedIds) setCollapsedAssemblages(props.collapsedIds);
        if (props.tracedId !== undefined) setTracedActorId(props.tracedId);
    }, [props.collapsedIds, props.tracedId]);

    const rawMetricLinks = useMemo(() => {
        const generated = generateEdges(filteredActors);
        return generated.map(e => ({ source: e.source.id, target: e.target.id, type: e.label }));
    }, [filteredActors]);

    const hydratedConfigs = useMemo(() => {
        return configurations.map(config => calculateConfigMetrics(config, rawMetricLinks));
    }, [configurations, rawMetricLinks]);

    const hydratedActors = useMemo<EcosystemActor[]>(() => {
        let result: EcosystemActor[] = filteredActors as EcosystemActor[];
        const blackBoxNodes: EcosystemActor[] = [];
        const hiddenActorIds = new Set<string>();
        if (collapsedAssemblages.size > 0) {
            configurations.forEach(config => {
                if (collapsedAssemblages.has(config.id)) {
                    config.memberIds.forEach(id => hiddenActorIds.add(id));
                    const members = (filteredActors as EcosystemActor[]).filter(a => config.memberIds.includes(a.id));
                    const totalPower = members.reduce((sum, a) => sum + calculateActorPower(a), 0);
                    const stability = Number(config.properties?.calculated_stability) || 0.5;
                    blackBoxNodes.push({
                        id: `blackbox-${config.id}`,
                        sourceId: 'system-generated', // [FIX] Added required sourceId
                        name: config.name, type: 'Infrastructure', description: config.description,
                        influence: totalPower > 30 ? 'High' : totalPower > 15 ? 'Medium' : 'Low', role_type: 'Material',
                        metrics: { territorialization: stability * 10, coding: 10, deterritorialization: (1 - stability) * 5, dynamic_power: totalPower },
                        isBlackBox: true, memberCount: config.memberIds.length, stabilityScore: stability
                    });
                }
            });
            result = result.filter(a => !hiddenActorIds.has(a.id));
            result = [...result, ...blackBoxNodes] as EcosystemActor[];
        }
        if (tracedActorId) {
            const rawLinks = generateEdges(filteredActors);
            const neighborIds = new Set<string>();
            rawLinks.forEach(l => {
                if (l.source.id === tracedActorId) neighborIds.add(l.target.id);
                if (l.target.id === tracedActorId) neighborIds.add(l.source.id);
            });
            neighborIds.add(tracedActorId);
            result = result.map(a => {
                const isRelevant = neighborIds.has(a.id) || a.id.startsWith('blackbox-');
                if (!isRelevant) return { ...a, isHidden: true };
                return { ...a, isHidden: false };
            });
        }
        if (activeTypeFilter) {
            const uniqueKey = activeTypeFilter.toLowerCase().replace(/\s/g, '');
            result = result.filter(a => {
                const actorType = (a.id.startsWith('blackbox-') ? 'Infrastructure' : a.type).toLowerCase().replace(/\s/g, '');
                if (a.isHidden) return true;
                if (uniqueKey === 'privatetech' && actorType.includes('startup')) return true;
                return actorType.includes(uniqueKey);
            });
        }
        return result;
    }, [filteredActors, collapsedAssemblages, tracedActorId, activeTypeFilter, configurations]);

    const links = useMemo(() => {
        const rawEdges = generateEdges(filteredActors);
        const memberToBlackBoxMap = new Map<string, string>();
        configurations.forEach(config => {
            if (collapsedAssemblages.has(config.id)) config.memberIds.forEach(mId => memberToBlackBoxMap.set(mId, `blackbox-${config.id}`));
        });

        // [NEW] Get Active Analysis for Link Enrichment
        const activeAnalysis = (selectedConfigIds && selectedConfigIds.length === 1
            ? configurations.find(c => c.id === selectedConfigIds[0])?.analysisData
            : absenceAnalysis) as AssemblageAnalysis | undefined;

        const relationshipMap = new Map(activeAnalysis?.relationships?.map(r => [r.id, r]));

        let processedLinks = rawEdges.map(e => {
            let sourceId = e.source.id;
            let targetId = e.target.id;
            if (memberToBlackBoxMap.has(sourceId)) sourceId = memberToBlackBoxMap.get(sourceId)!;
            if (memberToBlackBoxMap.has(targetId)) targetId = memberToBlackBoxMap.get(targetId)!;

            // [NEW] Attach Analysis
            // ID construction must match AssemblagePanel: `${source.id}-${target.id}`
            // Note: generateEdges always puts source/target in a deterministic order? 
            // Actually generateEdges iterates array order. We should check both directions or ensure stable key.
            // For now assuming the generateEdges order is consistent enough or we check both.
            const relKey = `${e.source.id}-${e.target.id}`;
            const relKeyRev = `${e.target.id}-${e.source.id}`;
            const analysis = relationshipMap.get(relKey) || relationshipMap.get(relKeyRev);

            return {
                source: sourceId, target: targetId, type: e.label, description: e.description,
                flow_type: e.flow_type, originalSource: e.source.id, originalTarget: e.target.id,
                analysis // [NEW] Pass to 3D View
            };
        });
        const validActorIds = new Set(hydratedActors.map(a => a.id));
        processedLinks = processedLinks.filter(l => validActorIds.has(l.source) && validActorIds.has(l.target));
        processedLinks = processedLinks.filter(l => l.source !== l.target);
        return processedLinks;
    }, [filteredActors, hydratedActors, collapsedAssemblages, configurations, selectedConfigIds, absenceAnalysis]);

    const handleCreateAssemblage = React.useCallback((name: string, members: string[]) => {
        const newConfig: EcosystemConfiguration = {
            id: crypto.randomUUID(), name, description: "Algorithmic Suggestion", memberIds: members,
            properties: { stability: "Medium", generativity: "Medium", territorialization_score: 5, coding_intensity_score: 5 },
            color: `hsl(${Math.random() * 360}, 70%, 80%)`
        };
        if (onAddConfiguration) onAddConfiguration(newConfig);
        else onCreateConfiguration();
    }, [onAddConfiguration, onCreateConfiguration]);

    const handleExplainMap = React.useCallback(async () => {
        if (!analysisMode) return;
        if (isReadOnly) { alert("Trace analysis is disabled in Demo Mode."); return; }
        if (!creditsLoading && !hasCredits) { setShowTopUp(true); return; }
        setIsExplaining(true); setExplanation(null);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (currentWorkspaceId) headers['x-workspace-id'] = currentWorkspaceId;
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;

            const response = await fetch('/api/analyze', {
                method: 'POST', headers,
                body: JSON.stringify({
                    analysisMode: 'assemblage_explanation', mode: analysisMode, configurations, actors: filteredActors, links,
                    interactionState: { isNested: isNestedMode, is3D: is3DMode }, text: 'Assess Hull Metrics'
                })
            });
            const data = await response.json();
            if (data.analysis) { setExplanation(data.analysis); refetchCredits(); setIsLegendOpen(false); }
        } catch (error) { console.error("Explanation failed:", error); } finally { setIsExplaining(false); }
    }, [analysisMode, configurations, filteredActors, links, isNestedMode, is3DMode, isReadOnly, creditsLoading, hasCredits, refetchCredits]);

    const isActorRelevant = (actor: EcosystemActor, stageId: string | null) => {
        if (!stageId) return true;
        const t = actor.type.toLowerCase();
        switch (stageId) {
            case 'problem': return ['civilsociety', 'ngo', 'academic', 'activist', 'public'].some(k => t.includes(k));
            case 'regulation': return ['policymaker', 'government', 'legislator', 'regulator', 'court', 'legalobject', 'law'].some(k => t.includes(k));
            case 'inscription': return ['standard', 'algorithm', 'technologist', 'expert', 'scientist'].some(k => t.includes(k));
            case 'delegation': return ['auditor', 'cloud', 'infrastructure', 'compliance', 'legal'].some(k => t.includes(k));
            case 'market': return ['privatetech', 'startup', 'private', 'corporation', 'sme', 'user'].some(k => t.includes(k));
            default: return true;
        }
    };

    const memoizedConfigurations = useMemo(() => configurations.map(c => ({ id: c.id, memberIds: c.memberIds })), [configurations]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nodes, simulation, drag } = useForceGraph(
        hydratedActors, dimensions.width, dimensions.height, memoizedConfigurations, links,
        isNestedMode, is3DMode, configLayout, isMetricMode
    );

    // Full Screen Escape Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullScreen) setIsFullScreen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullScreen]);

    // Resize Observer
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const getNodePos = (id: string) => {
        const node = nodes.find(n => n.id === id);
        return node ? { x: node.x || 0, y: node.y || 0 } : { x: 0, y: 0 };
    };

    const handleMouseDown = (e: React.MouseEvent, node: SimulationNode) => {
        e.stopPropagation();
        if (interactionMode === "drag") {
            setDraggingNodeId(node.id);
            drag(node).dragStarted({ active: true, x: node.x ?? 0, y: node.y ?? 0 });
        }
    };

    const handleConfigMouseDown = (e: React.MouseEvent, configId: string) => {
        e.stopPropagation();
        if (interactionMode === "drag") {
            setDraggingConfigId(configId);
        } else if (onConfigClick) {
            const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
            onConfigClick(configId, isMulti);
        }
    };

    const handleNodeClick = (e: React.MouseEvent, actor: EcosystemActor) => {
        e.stopPropagation();
        if (interactionMode === "select") onToggleSelection(actor.id);
        else setFocusedNodeId(focusedNodeId === actor.id ? null : actor.id);
    };

    const gRef = useRef<SVGGElement>(null);
    const [lodZoom, setLodZoom] = useState(1); // Throttled zoom level for LOD only
    // We still store current transform in a ref for calculations, but NOT in state for rendering
    const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

    // Zoom Behavior Setup
    useEffect(() => {
        if (!svgRef.current) return;

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .filter((event) => {
                // Prevent zoom/pan if clicking on a draggable config or if button is not left click
                if (event.target instanceof Element) {
                    if (event.target.closest('.draggable-config')) return false;
                    if (event.target.closest('.legend-container')) return false; // [FIX] Exclude Legend
                }
                return !event.button;
            })
            .on("zoom", (event) => {
                // 1. Direct DOM update (Fast, no React render)
                if (gRef.current) {
                    d3.select(gRef.current).attr("transform", event.transform.toString());
                }

                // 2. Store for calculations
                transformRef.current = event.transform;

                // 3. Conditional React Update (LOD Thresholds)
                // Thresholds: 0.35 (Low), 0.6 (Labels), 0.75 (High)
                const k = event.transform.k;
                const currentLOD = lodZoom;

                // Check if we crossed a significant threshold compared to stored state
                // This prevents spamming state updates for micro-zooms
                // We define "zones": < 0.35, 0.35-0.6, 0.6-0.75, > 0.75
                const getZone = (z: number) => {
                    if (z <= 0.35) return 0;
                    if (z <= 0.6) return 1;
                    if (z <= 0.75) return 2;
                    return 3;
                };

                if (getZone(k) !== getZone(currentLOD)) {
                    setLodZoom(k);
                }
            });


        zoomBehaviorRef.current = zoom; // Store in ref
        const svgSelection = d3.select(svgRef.current);
        svgSelection.call(zoom);

        // Initialize transform
        if (gRef.current) {
            d3.select(gRef.current).attr("transform", d3.zoomIdentity.toString());
        }

        return () => {
            svgSelection.on(".zoom", null);
        };
    }, [is3DMode, lodZoom]); // depend on lodZoom so check inside effect is stale-correct? No, use functional update or ref logic.
    // Actually, dependency on lodZoom inside effect for logic check is bad if it re-binds zoom. 
    // Better: use a ref to track rendered LOD to avoid re-binding d3.

    // ... (rest of the file)

    const getTransformedPoint = (clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        const t = transformRef.current;
        return {
            x: (svgP.x - t.x) / t.k,
            y: (svgP.y - t.y) / t.k
        };
    };

    const handleSvgMouseMove = (e: React.MouseEvent) => {
        if (interactionMode !== "drag") return;

        const worldP = getTransformedPoint(e.clientX, e.clientY);
        const t = transformRef.current;

        if (draggingNodeId) {
            e.preventDefault();
            e.stopPropagation();
            const node = nodes.find(n => n.id === draggingNodeId);
            if (node) drag(node).dragged({ x: worldP.x, y: worldP.y });
        } else if (draggingConfigId && onConfigDrag) {
            e.preventDefault();
            e.stopPropagation();
            // Simple delta calculation
            const dx = e.movementX / t.k;
            const dy = e.movementY / t.k;
            onConfigDrag(draggingConfigId, dx, dy);
        }
    };

    const handleMouseUp = () => {
        if (draggingNodeId) {
            const node = nodes.find(n => n.id === draggingNodeId);
            if (node) drag(node).dragEnded({ active: false, x: 0, y: 0 });
            setDraggingNodeId(null);
        }
        if (draggingConfigId) {
            setDraggingConfigId(null);
        }
    };

    // Zoom Controls
    const resetZoom = React.useCallback(() => {
        if (!svgRef.current || !zoomBehaviorRef.current) return;
        // Use the stored behavior to trigger the reset
        d3.select(svgRef.current)
            .transition()
            .duration(750)
            .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }, []);

    const toggleFullScreen = React.useCallback(() => {
        setIsFullScreen(prev => !prev);
    }, []);

    // [NEW] Stable Handlers for Toolbar
    const toggle3DMode = React.useCallback(() => {
        setIs3DMode(prev => {
            const newVal = !prev;
            if (newVal) setIsStratumMode(true);
            return newVal;
        });
    }, []);

    const toggleStratumMode = React.useCallback(() => setIsStratumMode(prev => !prev), []);
    const toggleReduceMotion = React.useCallback(() => setReduceMotion(prev => !prev), []);
    const togglePresentationMode = React.useCallback(() => setIsPresentationMode(prev => !prev), []);
    const toggleLayoutMode = React.useCallback(() => setLayoutMode(prev => prev === 'compass' ? 'nested' : 'compass'), []);





    const [hoveredNode, setHoveredNode] = useState<EcosystemActor | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const [hoveredLink, setHoveredLink] = useState<{ source: string | object, target: string | object, type: string } | null>(null);

    // Node Event Handlers
    const handleNodeHover = (e: React.MouseEvent, actor: EcosystemActor) => {
        // [CHANGED] Use absolute client coordinates for fixed tooltip positioning
        setTooltipPos({
            x: e.clientX,
            y: e.clientY
        });
        setHoveredNode(actor);
        setHoveredLink(null);
    };

    const handleLinkHover = (e: React.MouseEvent, link: { source: string | SimulationNode; target: string | SimulationNode; type: string }) => {
        // Calculate Link Midpoint for Centered Tooltip
        const s = getNodePos(typeof link.source === 'object' ? (link.source as SimulationNode).id : link.source);
        const t = getNodePos(typeof link.target === 'object' ? (link.target as SimulationNode).id : link.target);

        if (containerRef.current && s.x !== 0 && t.x !== 0) {
            const rect = containerRef.current.getBoundingClientRect();
            const midX = (s.x + t.x) / 2;
            const midY = (s.y + t.y) / 2;
            const transform = transformRef.current; // Use ref

            // Transform world coordinates to screen coordinates
            const screenX = rect.left + transform.x + (midX * transform.k);
            const screenY = rect.top + transform.y + (midY * transform.k);

            setTooltipPos({
                x: screenX,
                y: screenY
            });
        } else {
            // Fallback to mouse if calculation fails
            setTooltipPos({
                x: e.clientX,
                y: e.clientY
            });
        }

        setHoveredLink(link);
        setHoveredNode(null);
    };

    const visibleConfigs = useMemo(() => {
        return hydratedConfigs.filter((config: EcosystemConfiguration) =>
            !selectedConfigIds || selectedConfigIds.length === 0 || selectedConfigIds.includes(config.id)
        );
    }, [hydratedConfigs, selectedConfigIds]);

    return (
        <div className="relative w-full h-full">
            <Card
                className={`flex flex-col shadow-none border border-slate-200 bg-white transition-all duration-300 relative ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'h-[800px]'}`}
            >
                <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => refetchCredits()} />

                {/* ... (Header remains) */}
                <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row flex-wrap items-center justify-between gap-y-4 bg-white z-10 relative">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">Assemblage Compass</CardTitle>
                            <HelpTooltip
                                title="Assemblage Compass"
                                description={getGlossaryDefinition('assemblage-compass')}
                                glossaryTerm="assemblage-compass"
                                videoUrl="/videos/assemblage-demo.mp4"
                            />
                        </div>
                        <CardDescription className="text-xs text-slate-500 font-normal">
                            {is3DMode ? "3D WebGL Visualization" : (isNestedMode ? "Nested Assemblage (Actor → Collective → Regime)" : "Relational view of heterogeneous associations")}
                        </CardDescription>
                    </div>

                    {/* Modern Toolbar */}
                    <EcosystemToolbar
                        extraToolbarContent={extraToolbarContent}
                        is3DMode={is3DMode}
                        setIs3DMode={toggle3DMode}
                        isStratumMode={isStratumMode}
                        setIsStratumMode={toggleStratumMode}
                        reduceMotion={reduceMotion}
                        setReduceMotion={toggleReduceMotion}
                        isMetricMode={isMetricMode}
                        setLayoutMode={toggleLayoutMode}
                        isReadOnly={isReadOnly}
                        isExplaining={isExplaining}
                        handleExplainMap={handleExplainMap}
                        explanation={explanation}
                        isFullScreen={isFullScreen}
                        toggleFullScreen={toggleFullScreen}
                        tracedActorId={tracedActorId}
                        setTracedActorId={setTracedActorId}
                        isPresentationMode={isPresentationMode}
                        setIsPresentationMode={togglePresentationMode}
                        actors={actors}
                        links={links}
                        configurations={configurations}
                        onCreateAssemblage={handleCreateAssemblage}
                        resetZoom={resetZoom}
                        showUnverifiedLinks={showUnverifiedLinks}
                        onToggleUnverified={() => setShowUnverifiedLinks(p => !p)}
                        linkClassFilter={linkClassFilter}
                        onCycleClassFilter={handleCycleClassFilter}
                    />
                </CardHeader>

                <CardContent
                    ref={containerRef}
                    className="flex-1 p-0 relative overflow-hidden bg-[#FAFAFA]"
                >
                    {/* ... (Existing Map Content) ... */}
                    {is3DMode ? (
                        <div className="relative w-full h-full">
                            <EcosystemMap3D
                                actors={hydratedActors}
                                links={links} // [NEW] Pass pre-calculated links
                                configurations={configurations}
                                selectedForGrouping={selectedForGrouping}
                                onToggleSelection={onToggleSelection}
                                focusedNodeId={focusedNodeId}
                                width={dimensions.width}
                                height={dimensions.height}
                                isStratumMode={isStratumMode}
                                reduceMotion={reduceMotion} // [NEW] Pass toggle
                                onToggleCollapse={props.onToggleCollapse}
                                tracedId={tracedActorId}
                                isPresentationMode={isPresentationMode}
                                selectedActorId={selectedActorId}
                                showUnverifiedLinks={showUnverifiedLinks}
                                linkClassFilter={linkClassFilter}
                            />
                            {/* HUD Overlays (Draggable Left) */}
                            <div
                                className="absolute z-[50] pointer-events-auto cursor-grab active:cursor-grabbing select-none"
                                style={{
                                    left: `${legendPos.x}px`,
                                    top: `${legendPos.y}px`
                                }}
                                onMouseDown={handleLegendMouseDown}
                            >
                                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                    <ViewTypeLegend />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ... (SVG Content) ... */}
                            <svg
                                ref={svgRef}
                                width="100%" height="100%"
                                className={interactionMode === 'drag' ? 'cursor-move' : 'cursor-default'}
                                onMouseMove={handleSvgMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5"
                                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                                    </marker>
                                    <marker id="arrow-power" viewBox="0 0 10 10" refX="20" refY="5"
                                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                                    </marker>
                                    <filter id="hotspot-glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="6" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                    <style>{`
                                        @keyframes box-pulse {
                                            0%, 100% { opacity: 0.2; }
                                            50% { opacity: 0.7; }
                                        }
                                        .box-pulse {
                                            animation: box-pulse 2s ease-in-out infinite;
                                        }
                                    `}</style>
                                </defs>

                                <g ref={gRef} className="origin-top-left">
                                    {isNestedMode && (
                                        <g className="opacity-0 animate-in fade-in duration-1000 pointer-events-none">
                                            <circle cx={dimensions.width / 2} cy={dimensions.height / 2} r={Math.min(dimensions.width, dimensions.height) * 0.45} fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
                                            <text x={dimensions.width / 2} y={dimensions.height / 2 - Math.min(dimensions.width, dimensions.height) * 0.45 - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-[0.2em]">Governance Regime Boundary</text>
                                            <circle cx={dimensions.width / 2} cy={dimensions.height / 2} r={10} fill="#6366F1" opacity="0.1" />
                                            <text x={dimensions.width / 2} y={dimensions.height / 2} dy={3} textAnchor="middle" className="text-[6px] font-bold fill-indigo-400 uppercase">Policy</text>
                                        </g>
                                    )}

                                    {visibleConfigs
                                        .map((config: EcosystemConfiguration) => {
                                            const memberPoints = config.memberIds.map((id: string) => getNodePos(id)).filter((p: { x: number; y: number }) => p.x !== 0 && p.y !== 0);
                                            if (memberPoints.length < 2) return null;
                                            const centroid = memberPoints.reduce((acc: { x: number; y: number }, p: { x: number; y: number }) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
                                            centroid.x /= memberPoints.length;
                                            centroid.y /= memberPoints.length;
                                            // REFACTORED: Internal Focus vs Open/External Focus
                                            // Porosity Index (0-1): 0 = Closed/Internal, 1 = Open/External
                                            const porosity = config.properties.porosity_index || 0;

                                            // Internal Focus = 1 - Porosity
                                            // High Internal Focus -> Higher Opacity (Solid)
                                            // High External Focus (Porous) -> Lower Opacity (Translucent)
                                            const internalFocus = 1 - Math.min(1, porosity);

                                            // Base Opacity Formula: Min 0.05 (Ghostly) + up to 0.35 based on Internal Focus
                                            const baseOpacity = 0.05 + (internalFocus * 0.35);

                                            const anyConfigSelected = selectedConfigIds && selectedConfigIds.length > 0;
                                            const isConfigSelected = selectedConfigIds?.includes(config.id);

                                            let fillOpacity = 0;
                                            let strokeOpacity = 1;

                                            if (anyConfigSelected) {
                                                if (isConfigSelected) {
                                                    // FOCUSED: Boost opacity slightly to ensure visibility but maintain relative density
                                                    fillOpacity = Math.min(0.8, baseOpacity + 0.2);
                                                    strokeOpacity = 1;
                                                } else {
                                                    // DIMMED (Background)
                                                    fillOpacity = 0.02; // Almost invisible fill
                                                    strokeOpacity = 0.1; // Very faint stroke
                                                }
                                            } else {
                                                // OVERVIEW (Default)
                                                fillOpacity = baseOpacity;
                                                strokeOpacity = 0.4 + (internalFocus * 0.4); // Stroke also reflects stability
                                            }
                                            return (
                                                <g key={config.id} className={`draggable-config transition-all duration-500 ease-out ${interactionMode === 'drag' ? 'cursor-move' : 'cursor-pointer'}`} opacity={highlightedStage ? 0.1 : 1} onMouseDown={(e) => handleConfigMouseDown(e, config.id)}>
                                                    <title>{`${config.name}\nInternal Focus: ${(internalFocus * 100).toFixed(0)}% (Porosity: ${porosity.toFixed(2)})`}</title>
                                                    <path
                                                        d={memberPoints.length === 2 ? `M ${memberPoints[0].x} ${memberPoints[0].y} L ${memberPoints[1].x} ${memberPoints[1].y}` : getHullPath(memberPoints)}
                                                        fill={config.color} fillOpacity={fillOpacity} stroke={config.color} strokeOpacity={strokeOpacity} strokeWidth={isConfigSelected ? 3 : HULL_STYLES.strokeWidth} strokeLinejoin="round" strokeLinecap="round"
                                                        className={isConfigSelected ? "drop-shadow-md" : ""}
                                                    />
                                                    <rect x={centroid.x - (config.name.length * 3 + 8)} y={centroid.y - 32} width={config.name.length * 6 + 16} height={18} rx={9} fill={config.color} fillOpacity={0.9} stroke="white" strokeWidth={1.5} className="drop-shadow-sm" />
                                                    <text x={centroid.x} y={centroid.y - 20} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold fill-white uppercase tracking-wider" style={{ pointerEvents: 'none' }}>{config.name}</text>
                                                </g>
                                            );
                                        })}

                                    {links.map((link, i) => {
                                        const s = getNodePos(link.source as string);
                                        const t = getNodePos(link.target as string);
                                        if (s.x === 0 || t.x === 0) return null;

                                        const sourceActor = hydratedActors.find((a: EcosystemActor) => a.id === link.source);
                                        const targetActor = hydratedActors.find((a: EcosystemActor) => a.id === link.target);

                                        const sourceIsGhost = sourceActor && 'isGhost' in sourceActor && (sourceActor as GhostActor).isGhost;
                                        const targetIsGhost = targetActor && 'isGhost' in targetActor && (targetActor as GhostActor).isGhost;
                                        const isGhostLink = sourceIsGhost || targetIsGhost;

                                        const sourceIsHidden = sourceActor && sourceActor.isHidden;
                                        const targetIsHidden = targetActor && targetActor.isHidden;
                                        const isHiddenLink = sourceIsHidden || targetIsHidden;

                                        if (isGhostLink && !showGhostEdges) return null;
                                        if (!isGhostLink && !showSolidEdges) return null;

                                        const isFocused = focusedNodeId && (link.source === focusedNodeId || link.target === focusedNodeId);
                                        const isHovered = hoveredLink && hoveredLink.source === link.source && hoveredLink.target === link.target;

                                        // [NEW] Flow Type Logic (Power vs Logic vs Ghost)
                                        const flowType = link.flow_type || 'logic';

                                        let strokeColor = flowType === 'power' ? "#EF4444" : "#F59E0B";
                                        let strokeDash = flowType === 'logic' ? "5 3" : "none";
                                        let markerEnd = flowType === 'power' ? "url(#arrow-power)" : "none";

                                        // [OVERRIDE] Ghost Links
                                        if (isGhostLink) {
                                            strokeColor = "#818CF8"; // Indigo 400 - "Spectral" Purple
                                            strokeDash = "3 4"; // Looser dot
                                            markerEnd = "none";
                                        }

                                        let strokeWidth = flowType === 'power' ? 1.5 : 1;
                                        if (isFocused || isHovered) strokeWidth += 1.5;

                                        let d = `M ${s.x} ${s.y} L ${t.x} ${t.y}`;
                                        if (isNestedMode) {
                                            const lineGen = d3.line<{ x: number, y: number }>()
                                                .curve(d3.curveBundle.beta(0.85))
                                                .x(p => p.x)
                                                .y(p => p.y);
                                            d = lineGen([
                                                { x: s.x, y: s.y },
                                                { x: dimensions.width / 2, y: dimensions.height / 2 },
                                                { x: t.x, y: t.y }
                                            ]) || "";
                                        }

                                        return (
                                            <g key={`link-${i}`}
                                                onMouseEnter={(e) => handleLinkHover(e, link)}
                                                onMouseLeave={() => setHoveredLink(null)}
                                                onClick={() => setSelectedLink(link)}
                                                className="cursor-pointer"
                                                style={{ opacity: isHiddenLink ? 0 : 1 }}
                                            >
                                                <path
                                                    d={d}
                                                    stroke="transparent"
                                                    strokeWidth={10}
                                                    fill="none"
                                                />
                                                <path
                                                    d={d}
                                                    stroke={isFocused || isHovered ? (flowType === 'power' ? "#B91C1C" : "#D97706") : strokeColor}
                                                    strokeWidth={strokeWidth}
                                                    strokeOpacity={highlightedStage ? 0.1 : (isFocused || isHovered ? 1 : 0.6)}
                                                    strokeDasharray={strokeDash}
                                                    markerEnd={!isNestedMode ? markerEnd : ""}
                                                    fill="none"
                                                    className="transition-all duration-300"
                                                />
                                            </g>
                                        );
                                    })}

                                    {nodes.map((node: SimulationNode) => {
                                        const actor = hydratedActors.find((a: EcosystemActor) => a.id === node.id);
                                        if (!actor) return null;

                                        // Check if this is a ghost node
                                        const isGhost = !!(actor && 'isGhost' in actor && (actor as GhostActor).isGhost);

                                        // [NEW] Multi-Assemblage Membership Calculation
                                        const memberOfConfigs = configurations.filter(c => c.memberIds.includes(actor.id));
                                        const isMultiAssemblage = memberOfConfigs.length > 1;

                                        const color = getActorColor(actor.type);
                                        const isSelected = selectedForGrouping.includes(actor.id);
                                        const isFocused = focusedNodeId === actor.id;
                                        const isRelevant = isActorRelevant(actor, highlightedStage);

                                        // LOD Logic - Throttled
                                        const zoomLevel = lodZoom;
                                        // Show labels if zoomed in > 0.6 OR if the node is "important" (focused/selected/hovered)
                                        const showLabel = zoomLevel > 0.6 || isSelected || isFocused || hoveredNode?.id === actor.id;
                                        // Show expensive effects only when zoomed in significantly
                                        const showEffects = zoomLevel > 0.75;
                                        // Show shapes details? Always show for now to maintain meaning, but maybe simplify stroke?

                                        // [CHANGE] Filtering Logic: If Assemblage Selected, dim others
                                        // Ensure selectedConfigIds is treated as an array (default to empty)
                                        // const safeSelectedConfigIds = selectedConfigIds || [];
                                        // const isInSelectedAssemblage = safeSelectedConfigIds.length === 0 || memberOfConfigs.some(c => safeSelectedConfigIds.includes(c.id));

                                        let opacity = highlightedStage ? (isRelevant ? 1 : 0.1) : 1;
                                        // removed dimming of non-members
                                        // if (!isInSelectedAssemblage) opacity = 0.1;

                                        if (isGhost) opacity *= 0.85;
                                        const scale = highlightedStage && isRelevant ? 1.2 : 1;
                                        const power = calculateActorPower(actor);
                                        const baseR = 5 + (power * 1.5);
                                        const r = isFocused || isSelected ? baseR + 2 : baseR;
                                        const strokeDash = isGhost ? "4 2" : "none";
                                        const isHidden = actor.isHidden;
                                        const finalOpacity = isHidden ? 0 : opacity;

                                        // Optimization: If opacity is 0 or node is off-screen (would require viewport cull logic), skip rendering?
                                        // Current SVG setup doesn't easy allow easy culling without calc.
                                        // But we can skip opacity 0.
                                        if (finalOpacity === 0) return null;

                                        return (
                                            <g key={node.id}
                                                transform={`translate(${node.x || 0},${node.y || 0}) scale(${scale})`}
                                                onMouseDown={(e) => handleMouseDown(e, node)}
                                                onMouseEnter={(e) => handleNodeHover(e, actor)}
                                                onMouseLeave={() => setHoveredNode(null)}
                                                onClick={(e) => handleNodeClick(e, actor)}
                                                className="group cursor-pointer"
                                                style={{
                                                    transition: 'transform 0.2s ease-out, opacity 1s ease-out',
                                                    opacity: finalOpacity,
                                                    pointerEvents: isHidden ? 'none' : 'auto'
                                                }}
                                            >
                                                {/* [NEW] Bias Hot Spot Glow - LOD CHECKED */}
                                                {!isHidden && showEffects && getBiasIntensity(actor) > 0.5 && (
                                                    <circle r={r + 12} fill="#EF4444" filter="url(#hotspot-glow)" className="box-pulse" />
                                                )}

                                                {isSelected && (
                                                    getActorShape(actor) === 'diamond' ? <polygon points={`0,${-r - 6} ${r + 6},0 0,${r + 6} ${-r - 6},0`} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> :
                                                        getActorShape(actor) === 'hexagon' ? <polygon points={`${r + 4},0 ${(r + 4) / 2},${(r + 4) * 0.866} ${-(r + 4) / 2},${(r + 4) * 0.866} ${-(r + 4)},0 ${-(r + 4) / 2},${-(r + 4) * 0.866} ${(r + 4) / 2},${-(r + 4) * 0.866}`} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> :
                                                            getActorShape(actor) === 'square' ? <rect x={-r - 4} y={-r - 4} width={(r + 4) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> :
                                                                getActorShape(actor) === 'triangle' ? <polygon points={`0,${-r - 6} ${r + 6},${r + 4} ${-r - 6},${r + 4}`} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> :
                                                                    getActorShape(actor) === 'rect' ? <rect x={-(r + 6)} y={-(r + 4)} width={(r + 6) * 2} height={(r + 4) * 2} fill="none" stroke={color} strokeWidth={2} opacity={0.5} /> :
                                                                        <circle r={r + 4} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
                                                )}

                                                {getActorShape(actor) === 'diamond' ?
                                                    <polygon points={`0,${-r - 4} ${r + 4},0 0,${r + 4} ${-r - 4},0`} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} />
                                                    : getActorShape(actor) === 'hexagon' ?
                                                        <polygon points={`${r + 2},0 ${(r + 2) / 2},${(r + 2) * 0.866} ${-(r + 2) / 2},${(r + 2) * 0.866} ${-(r + 2)},0 ${-(r + 2) / 2},${-(r + 2) * 0.866} ${(r + 2) / 2},${-(r + 2) * 0.866}`} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} />
                                                        : getActorShape(actor) === 'square' ?
                                                            <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} />
                                                            : getActorShape(actor) === 'triangle' ?
                                                                <polygon points={`0,${-r - 2} ${r + 2},${r + 2} ${-r - 2},${r + 2}`} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} />
                                                                : getActorShape(actor) === 'rect' ?
                                                                    <rect x={-(r + 2)} y={-r} width={(r + 2) * 2} height={r * 2} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} />
                                                                    : <circle r={r} fill={isGhost ? "#F8FAFC" : color} className="drop-shadow-sm transition-all duration-200" stroke={color} strokeWidth={isGhost ? 2 : 1.5} strokeDasharray={strokeDash} />
                                                }

                                                {/* [LOD OPTIMIZED] Labels - Only show if zoomed in or focused */}
                                                {showLabel && (
                                                    <foreignObject x="8" y="-10" width="150" height="24" className="overflow-visible pointer-events-none">
                                                        <div className={`flex items-center px-1.5 py-0.5 rounded-sm bg-slate-100/90 border border-slate-200 backdrop-blur-[1px] transform transition-opacity duration-200 ${(focusedNodeId && !isFocused) || (highlightedStage && !isRelevant) ? "opacity-20" : "opacity-100"}`}>
                                                            <span className={`text-[10px] whitespace-nowrap font-medium leading-none ${isGhost ? "text-slate-600 font-semibold" : "text-slate-700"}`}>
                                                                {actor.id.startsWith('blackbox-') ? `■ ${actor.name}` : actor.name}
                                                                {isMultiAssemblage && <span className="text-[8px] ml-1 bg-amber-100 text-amber-700 px-1 rounded-full border border-amber-200" title={`Bridge: ${memberOfConfigs.length} Assemblages`}>×{memberOfConfigs.length}</span>}
                                                                {isGhost && <span className="text-[9px] text-red-500 font-normal ml-0.5">(Absent)</span>}
                                                            </span>
                                                        </div>
                                                    </foreignObject>
                                                )}

                                                <title>
                                                    {actor.id.startsWith('blackbox-') ? (
                                                        `BLACK BOX: ${actor.name}\n` +
                                                        `--------------------------\n` +
                                                        `Contains: ${actor.memberCount || 0} members\n` +
                                                        `Stability: ${((actor.stabilityScore || 0) * 100).toFixed(0)}%\n` +
                                                        `Total Latent Power: ${(actor.metrics?.dynamic_power || 0).toFixed(1)}\n` +
                                                        `Description: ${actor.description}`
                                                    ) : (
                                                        (getBiasIntensity(actor) > 0.5 ? `[!] HOT SPOT: High Structural Friction\n\n` : '') +
                                                        actor.description
                                                    )}
                                                </title>
                                            </g>
                                        );
                                    })}
                                </g>
                            </svg>

                            {/* Floating Tooltips (Must remain inside or be fixed) */}
                            {/* ... (Tooltips remain unchanged) ... */}
                            {hoveredLink && (
                                <div
                                    className="absolute z-50 pointer-events-none"
                                    style={{
                                        left: tooltipPos.x + 10,
                                        top: tooltipPos.y + 10,
                                    }}
                                >
                                    <div className="bg-slate-900/90 backdrop-blur-md text-slate-50 text-xs px-3 py-2 rounded-md shadow-lg border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="font-semibold">{hoveredLink.type}</div>
                                        <div className="text-slate-400 text-[10px] mt-0.5">
                                            {(() => {
                                                const s = hoveredLink.source;
                                                const sName = typeof s === 'object' ? (s as SimulationNode).name : mergedActors.find(a => a.id === s)?.name || s;

                                                const t = hoveredLink.target;
                                                const tName = typeof t === 'object' ? (t as SimulationNode).name : mergedActors.find(a => a.id === t)?.name || t;

                                                return (
                                                    <>
                                                        {sName} <span className="mx-1">→</span> {tName}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hoveredNode && (
                                <div
                                    className="fixed z-50 pointer-events-none"
                                    style={{
                                        // Viewport-aware positioning
                                        left: tooltipPos.x > (window.innerWidth - 280) ? 'auto' : tooltipPos.x + 10,
                                        right: tooltipPos.x > (window.innerWidth - 280) ? (window.innerWidth - tooltipPos.x + 10) : 'auto',

                                        top: tooltipPos.y > (window.innerHeight - 300) ? 'auto' : tooltipPos.y + 10,
                                        bottom: tooltipPos.y > (window.innerHeight - 300) ? (window.innerHeight - tooltipPos.y + 10) : 'auto',
                                    }}
                                >
                                    <div className="bg-slate-900/90 backdrop-blur-md text-slate-50 text-xs px-3 py-2 rounded-md shadow-lg border border-slate-700 max-w-[250px] animate-in fade-in zoom-in-95 duration-200 block">
                                        <div className="font-semibold mb-0.5 flex items-center gap-2">
                                            {(hoveredNode as GhostActor).isGhost && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                            )}
                                            {hoveredNode.name}
                                        </div>
                                        <div className="text-slate-400 text-[10px] mb-1">{hoveredNode.type}</div>
                                        {hoveredNode.description && (
                                            <div className="text-slate-300 border-t border-slate-700/50 pt-1 mt-1 leading-relaxed">
                                                {(hoveredNode as GhostActor).isGhost ? `MISSING: ${hoveredNode.description}` : hoveredNode.description}
                                            </div>
                                        )}
                                        {(() => {
                                            const memberConfigs = hydratedConfigs.filter(c => c.memberIds.includes(hoveredNode.id));
                                            if (memberConfigs.length > 0) {
                                                return (
                                                    <div className="mt-2 pt-2 border-t border-indigo-500/30 space-y-2">
                                                        {memberConfigs.map(config => {
                                                            const porosity = config.properties.porosity_index || 0;
                                                            const stability = config.properties.calculated_stability || 0;
                                                            return (
                                                                <div key={config.id} className="pb-1 border-b border-indigo-500/10 last:border-0 last:pb-0">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: config.color }}></div>
                                                                        <span className="text-indigo-300 font-medium leading-tight">{config.name}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                                                        <div>
                                                                            <span className="text-slate-500 mr-1">Porosity:</span>
                                                                            <span className={porosity > 0.5 ? "text-indigo-300" : "text-slate-300"}>{porosity.toFixed(2)}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500 mr-1">Stability:</span>
                                                                            <span className="text-slate-300">{stability.toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            )}

                            {isNestedMode && (
                                <div className="animate-in slide-in-from-bottom-5 duration-700">
                                    <TranslationChain
                                        actors={actors}
                                        onHoverStage={setHighlightedStage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* SHARED UI OVERLAYS (Outside Card to avoid overflow-hidden clipping) */}

            {explanation && (
                <div className="absolute top-16 left-4 right-4 sm:right-auto sm:left-4 sm:w-96 bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 rounded-lg overflow-hidden animate-in slide-in-from-top-5 duration-300 z-50">
                    <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-indigo-500" />
                            {analysisMode === 'ant_trace' ? 'ANT Trace Analysis' :
                                analysisMode === 'hybrid_reflexive' ? 'Hybrid Reflexive Analysis' :
                                    'Assemblage Analysis'}
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => setExplanation(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{explanation.narrative}</p>

                        <div className="space-y-3">
                            {(explanation.hulls || []).map((hull, i: number) => (
                                <div key={i} className="bg-slate-50 rounded-md p-3 border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-xs text-slate-900">{hull.id.replace('config-', '')}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${hull.classification === 'Fortress' ? 'bg-red-100 text-red-700' :
                                            hull.classification === 'Sieve' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>{hull.classification}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{hull.interpretation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isLegendOpen && (
                <div
                    className="legend-container absolute top-64 right-6 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm p-3 w-48 text-xs z-[100] max-h-[600px] overflow-y-auto cursor-grab active:cursor-grabbing select-none"
                    style={{ transform: `translate(${legendPos.x}px, ${legendPos.y}px)` }}
                    onMouseDown={handleLegendMouseDown}
                >
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100 handle pointer-events-none">
                        <span className="font-semibold text-slate-800">Actant Types</span>
                        <div className="pointer-events-auto">
                            <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400" onClick={() => setIsLegendOpen(false)}>
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                        {Object.entries(SWISS_COLORS).filter(([k]) => k !== 'default').map(([key, color]) => {
                            const isActive = activeTypeFilter === key;
                            const isDimmed = activeTypeFilter && !isActive;

                            return (
                                <div
                                    key={key}
                                    className={`
                                        flex items-center gap-2 cursor-pointer p-1 rounded transition-all duration-200
                                        ${isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'}
                                        ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'}
                                    `}
                                    onClick={() => setActiveTypeFilter(isActive ? null : key)}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: color }} />
                                    <span className={`capitalize ${isActive ? 'text-indigo-700 font-medium' : 'text-slate-600'}`}>
                                        {key === 'civilsociety' ? 'Civil Society' :
                                            key === 'privatetech' ? 'Private Tech / Startup' :
                                                key}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {configurations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                            <p className="font-semibold text-slate-800 mb-2">Macro Assemblages</p>
                            <div className="space-y-1.5">
                                {configurations.map(config => (
                                    <div key={config.id} className="flex items-center gap-2 group justify-between p-1 rounded hover:bg-slate-50">
                                        <div className="flex items-center gap-1 flex-1 overflow-hidden">
                                            {props.onToggleCollapse && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 mr-1 shrink-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                    title={props.collapsedIds?.has(config.id) ? "Expand Assemblage" : "Collapse into Black Box"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        props.onToggleCollapse?.(config.id);
                                                    }}
                                                >
                                                    {props.collapsedIds?.has(config.id) ?
                                                        <Maximize className="h-3 w-3" /> :
                                                        <Minimize className="h-3 w-3" />
                                                    }
                                                </Button>
                                            )}
                                            <div
                                                onClick={(e) => {
                                                    const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
                                                    if (onConfigClick) onConfigClick(config.id, isMulti);
                                                    else if (onConfigSelect) onConfigSelect(config.id, isMulti);
                                                }}
                                                className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-sm shadow-sm ring-1 ring-black/5 opacity-80 shrink-0"
                                                    style={{ backgroundColor: config.color }}
                                                />
                                                <span className="text-slate-600 truncate text-[10px] group-hover:text-slate-900 transition-colors">{config.name}</span>
                                            </div>
                                        </div>

                                        {onDeleteConfiguration && (
                                            configToDelete === config.id ? (
                                                <div className="flex items-center gap-0.5 animate-in slide-in-from-right-2 duration-200">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-6 px-1.5 text-[9px] bg-red-600 hover:bg-red-700 text-white font-bold"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            onDeleteConfiguration(config.id);
                                                            setConfigToDelete(null);
                                                        }}
                                                    >
                                                        SURE?
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={() => setConfigToDelete(null)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfigToDelete(config.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px]">
                        <p className="font-semibold text-slate-800 mb-2">Edge Filters</p>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showSolidEdges}
                                    onChange={(e) => setShowSolidEdges(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                />
                                <span className="text-slate-700">Connectivity (Solid)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showGhostEdges}
                                    onChange={(e) => setShowGhostEdges(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                />
                                <span className="text-slate-700">Absent/Virtual (Ghost)</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* DYNAMICS OVERLAY */}
            {/* DYNAMICS OVERLAY */}
            {showDynamics && (
                <AssemblageDynamics
                    onClose={() => setShowDynamics(false)}
                    nodes={nodes}
                    links={links}
                />
            )}

            {/* CENTRALLY POSITIONED DIALOGS */}
            <Dialog open={!!selectedLink} onOpenChange={(open) => !open && setSelectedLink(null)}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-indigo-600">Association Details</DialogTitle>
                        <DialogDescription>Mapping the mediation between actants.</DialogDescription>
                    </DialogHeader>
                    {selectedLink && (
                        <div className="space-y-4 py-2 text-sm">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100 text-slate-700 font-medium">
                                <span>{typeof selectedLink.source === 'object' ? (selectedLink.source as SimulationNode).name : selectedLink.source}</span>
                                <span className="px-2">→</span>
                                <span>{typeof selectedLink.target === 'object' ? (selectedLink.target as SimulationNode).name : selectedLink.target}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Type</p>
                                <p className="p-2 border border-indigo-100 bg-indigo-50/50 rounded-md text-indigo-700">{selectedLink.type}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[90]">
                {!isLegendOpen && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 bg-white shadow-xl text-sm font-medium border-slate-200 hover:bg-slate-50 text-indigo-700 pointer-events-auto ring-1 ring-slate-900/5 transition-all"
                        onClick={() => setIsLegendOpen(true)}
                    >
                        <Layers className="h-4 w-4 mr-2" />
                        Legend
                    </Button>
                )}
                <Button
                    variant="default"
                    size="sm"
                    className="h-10 px-4 bg-indigo-600 shadow-xl text-sm font-medium border-indigo-500 hover:bg-indigo-700 text-white pointer-events-auto ring-1 ring-slate-900/5 transition-all"
                    onClick={() => setShowDynamics(true)}
                >
                    <Activity className="h-4 w-4 mr-2" />
                    Dynamics
                </Button>
            </div>

            {focusedNodeId && (
                <div className="absolute bottom-4 left-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs shadow-sm bg-white hover:bg-slate-50 border border-slate-200"
                        onClick={() => setFocusedNodeId(null)}
                    >
                        <EyeOff className="h-3 w-3 mr-1.5 text-slate-500" /> Reset Focus
                    </Button>
                </div>
            )}
        </div >
    );
}
