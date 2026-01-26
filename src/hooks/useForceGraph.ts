import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { EcosystemActor } from '@/types/ecosystem';

export interface SimulationNode extends d3.SimulationNodeDatum {
    id: string;
    type: string;
    radius: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    metrics?: any;
    // Radial Layout Props
    assemblageId?: string;
    startAngle?: number;
    endAngle?: number;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
    source: string | SimulationNode;
    target: string | SimulationNode;
    type: string;
}

// Helper to determine Ring Radius based on Actor Type
const getRadialRadius = (type: string, minDim: number) => {
    const t = type.toLowerCase();
    if (['legalobject', 'regulation', 'law'].some(k => t.includes(k))) return 0; // Center
    if (['policymaker', 'government'].some(k => t.includes(k))) return minDim * 0.15;
    if (['civilsociety', 'academic', 'ngo'].some(k => t.includes(k))) return minDim * 0.25;
    if (['market', 'private', 'startup'].some(k => t.includes(k))) return minDim * 0.35;
    return minDim * 0.45; // Outer
};

export function useForceGraph(
    actors: EcosystemActor[],
    width: number,
    height: number,
    configurations: { id: string; memberIds: string[] }[] = [],
    links: { source: string; target: string; type: string }[] = [],
    enableClustering: boolean = false, // Nested Mode (Static Radial)
    isPaused: boolean = false,
    configOffsets: Record<string, { x: number; y: number }> = {},
    enableMetricAlignment: boolean = false // Compass Mode (Physics)
) {
    const [nodes, setNodes] = useState<SimulationNode[]>([]);
    const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);
    const nodesRef = useRef<SimulationNode[]>([]);

    // 1. Initialize Nodes (Preserve State)
    useEffect(() => {
        const currentNodes = nodesRef.current;

        // Identify which config each actor belongs to (first match wins)
        const getAssemblageId = (actorId: string) => {
            const config = configurations.find(c => c.memberIds.includes(actorId));
            return config ? config.id : 'ungrouped';
        };

        const newNodes = actors.map(actor => {
            const existing = currentNodes.find(n => n.id === actor.id);
            const assemblageId = getAssemblageId(actor.id);

            if (existing) {
                existing.radius = actor.influence === 'High' ? 45 : actor.influence === 'Medium' ? 30 : 20;
                existing.metrics = actor.metrics;
                existing.assemblageId = assemblageId;
                return existing;
            }
            return {
                id: actor.id,
                type: actor.type,
                radius: actor.influence === 'High' ? 45 : actor.influence === 'Medium' ? 30 : 20,
                x: width / 2 + (Math.random() - 0.5) * 50,
                y: height / 2 + (Math.random() - 0.5) * 50,
                metrics: actor.metrics,
                assemblageId: assemblageId
            } as SimulationNode;
        });

        nodesRef.current = newNodes;
        setNodes(newNodes);

        if (simulationRef.current) {
            simulationRef.current.nodes(newNodes);
            simulationRef.current.alpha(0.3).restart();
        }
    }, [actors, width, height, configurations]); // Re-run when configs change


    // 2. Main Layout Engine
    useEffect(() => {
        if (!nodes.length || isPaused) return;

        // Cleanup
        if (simulationRef.current) simulationRef.current.stop();

        const simulation = d3.forceSimulation(nodes)
            .alphaDecay(0.04)
            .velocityDecay(0.4);

        const isRadialMode = enableClustering && !enableMetricAlignment;

        if (isRadialMode) {
            // === STATIC RADIAL LAYOUT (Hybrid Pinning) ===
            const minDim = Math.min(width, height);

            // Group nodes by Assemblage to handle intra-wedge distribution
            const nodesByAssemblage: Record<string, SimulationNode[]> = {};
            // Initialize keys
            configurations.forEach(c => { nodesByAssemblage[c.id] = []; });
            nodesByAssemblage['ungrouped'] = [];

            nodes.forEach(n => {
                const key = n.assemblageId && nodesByAssemblage[n.assemblageId] ? n.assemblageId : 'ungrouped';
                nodesByAssemblage[key].push(n);
            });

            const totalConfigs = configurations.length;

            // If no configs, we treat everything as a single "ungrouped" spiral
            const safeTotalConfigs = totalConfigs || 1;
            const angleStep = (2 * Math.PI) / safeTotalConfigs;

            // 1. Process Configured Assemblages
            configurations.forEach((c, i) => {
                const members = nodesByAssemblage[c.id] || [];
                if (members.length === 0) return;

                // Sort members by Type (Radius) then Name
                members.sort((a, b) => {
                    const rA = getRadialRadius(a.type, minDim);
                    const rB = getRadialRadius(b.type, minDim);
                    return (rA - rB) || a.id.localeCompare(b.id);
                });

                const startAngle = i * angleStep - (Math.PI / 2); // Wedge start (Top aligned)
                const wedgeWidth = angleStep; // Full width

                members.forEach((node) => {
                    const r = getRadialRadius(node.type, minDim);

                    // Find count of nodes at this radius within this assemblage
                    const peers = members.filter(m => getRadialRadius(m.type, minDim) === r);
                    const peerIndex = peers.indexOf(node);
                    const peerCount = peers.length;

                    // Distribute angularly within wedge
                    // Avoid edges slightly for aesthetics
                    const effectiveWidth = wedgeWidth * 0.8;
                    const padding = wedgeWidth * 0.1;

                    let localAngle = startAngle + (wedgeWidth / 2); // Default center
                    if (peerCount > 1) {
                        const step = effectiveWidth / (peerCount - 1);
                        localAngle = startAngle + padding + (step * peerIndex);
                    }

                    const targetX = (width / 2) + Math.cos(localAngle) * r;
                    const targetY = (height / 2) + Math.sin(localAngle) * r;

                    if (!isNaN(targetX) && !isNaN(targetY)) {
                        node.fx = targetX;
                        node.fy = targetY;
                        node.x = targetX;
                        node.y = targetY;
                    }
                });
            });

            // 2. Process Ungrouped (if any)
            const ungrouped = nodesByAssemblage['ungrouped'];
            if (ungrouped.length > 0) {
                // If configs exist, ungrouped start after them. If 0 configs, start at top (-PI/2)
                const angleStart = configurations.length > 0
                    ? -Math.PI / 2 + (configurations.length * angleStep)
                    : -Math.PI / 2;

                ungrouped.forEach((node, idx) => {
                    const r = getRadialRadius(node.type, minDim);
                    // Spiral them
                    const angle = angleStart + (idx * 0.2);
                    const tx = (width / 2) + Math.cos(angle) * r;
                    const ty = (height / 2) + Math.sin(angle) * r;

                    if (!isNaN(tx) && !isNaN(ty)) {
                        node.fx = tx;
                        node.fy = ty;
                        node.x = tx;
                        node.y = ty;
                    }
                });
            }

            // Disable forces
            simulation.force("charge", null)
                .force("center", null)
                .force("collision", null);

        } else {
            // === COMPASS / PHYSICS MODE ===

            // Unpin everyone
            nodes.forEach(n => {
                n.fx = null;
                n.fy = null;
            });

            // 1. Collision
            simulation.force("collide", d3.forceCollide().radius((d: any) => d.radius + 15).iterations(2));

            // 2. Metric Forces (Compass)
            if (enableMetricAlignment) {
                const padding = 80;
                const safeW = width - (padding * 2);
                const safeH = height - (padding * 2);
                const getVal = (val: any) => {
                    if (typeof val === 'number') return val;
                    if (val === 'High' || val === 'Strong') return 8;
                    if (val === 'Medium' || val === 'Moderate') return 5;
                    return 2;
                };

                simulation.force("x", d3.forceX((d: SimulationNode) => {
                    const val = getVal(d.metrics?.territorialization || d.metrics?.territoriality);
                    return padding + (val / 10) * safeW;
                }).strength(0.3));

                simulation.force("y", d3.forceY((d: SimulationNode) => {
                    const val = getVal(d.metrics?.deterritorialization || d.metrics?.counter_conduct);
                    return (height - padding) - (val / 10) * safeH;
                }).strength(0.3));

                simulation.force("charge", d3.forceManyBody().strength(-100));
            } else {
                // Fallback
                simulation.force("charge", d3.forceManyBody().strength(-300));
                simulation.force("center", d3.forceCenter(width / 2, height / 2));
            }
        }

        // Links
        if (links.length > 0) {
            const nodeIds = new Set(nodes.map(n => n.id));
            const validLinks = links.filter(l => {
                const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                return nodeIds.has(sourceId) && nodeIds.has(targetId);
            }).map(l => ({ ...l }));

            if (validLinks.length > 0) {
                simulation.force("link", d3.forceLink(validLinks)
                    .id((d: any) => d.id)
                    .strength(isRadialMode ? 0 : 0.05)
                    .distance(100)
                );
            }
        }

        simulation.on("tick", () => setNodes([...nodes]));
        simulationRef.current = simulation;

        return () => {
            simulation.stop();
        };

    }, [nodes.length, width, height, enableClustering, enableMetricAlignment, isPaused, configurations]);


    // Drag Interaction
    const drag = (node: SimulationNode) => {
        const dragStarted = (e: any) => {
            if (!e.active) simulationRef.current?.alphaTarget(0.3).restart();
            node.fx = node.x;
            node.fy = node.y;
        };
        const dragged = (e: any) => {
            node.fx = e.x;
            node.fy = e.y;
        };
        const dragEnded = (e: any) => {
            if (!e.active) simulationRef.current?.alphaTarget(0);
            if (!enableClustering) {
                node.fx = null;
                node.fy = null;
            }
        };
        return { dragStarted, dragged, dragEnded };
    }

    return { nodes, simulation: simulationRef.current, drag };
}
