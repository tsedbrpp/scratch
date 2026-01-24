import { useEffect, useRef, useState } from 'react';
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
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
    source: string | SimulationNode;
    target: string | SimulationNode;
    type: string;
}

export function useForceGraph(
    actors: EcosystemActor[],
    width: number,
    height: number,
    configurations: { id: string; memberIds: string[] }[] = [],
    links: { source: string; target: string; type: string }[] = [],
    enableClustering: boolean = false,
    isPaused: boolean = false,
    configOffsets: Record<string, { x: number; y: number }> = {},
    enableMetricAlignment: boolean = false // [NEW] Align to Territory/Deterritory axes
) {
    const [nodes, setNodes] = useState<SimulationNode[]>([]);
    const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);
    const configOffsetsRef = useRef(configOffsets);

    // Keep Ref in Sync & Wake up simulation on drag
    useEffect(() => {
        configOffsetsRef.current = configOffsets;
        if (simulationRef.current) {
            simulationRef.current.alphaTarget(0.3).restart();
        }
    }, [configOffsets]);

    // Initialize Nodes
    useEffect(() => {
        setNodes(prevNodes => {
            // Create a map of current actor IDs for quick lookup
            const currentActorIds = new Set(actors.map(a => a.id));

            // Only preserve previous nodes that still exist in the new actors array
            const validPrevNodes = prevNodes.filter(n => currentActorIds.has(n.id));

            const newNodes: SimulationNode[] = actors.map(actor => {
                const existing = validPrevNodes.find(n => n.id === actor.id);
                return {
                    id: actor.id,
                    type: actor.type,
                    radius: actor.influence === 'High' ? 45 : actor.influence === 'Medium' ? 30 : 20,
                    x: existing ? existing.x : width / 2 + (Math.random() - 0.5) * 50,
                    y: existing ? existing.y : height / 2 + (Math.random() - 0.5) * 50,
                    vx: existing ? existing.vx : 0,
                    vy: existing ? existing.vy : 0,
                    // Store metrics for force alignment
                    metrics: actor.metrics
                };
            });
            return newNodes;
        });
    }, [actors, width, height]);

    // Run Simulation
    useEffect(() => {
        if (!nodes.length || isPaused) {
            simulationRef.current?.stop();
            return;
        }

        if (simulationRef.current) simulationRef.current.stop();

        // 1. Initialize Simulation (Base Forces)
        const simulation = d3.forceSimulation(nodes)
            .force("collide", d3.forceCollide().radius((d: d3.SimulationNodeDatum) => (d as SimulationNode).radius + 15).iterations(2)); // Increased padding

        // 2. Configure Layout Specific Forces
        if (enableMetricAlignment) {
            // [NEW] Metric Alignment Force (The "Compass" Logic)
            const getMetricValue = (val: string | number | undefined) => {
                if (typeof val === 'number') return val;
                if (val === 'Weak' || val === 'Low') return 2;
                if (val === 'Moderate' || val === 'Medium') return 5;
                if (val === 'Strong' || val === 'High') return 8;
                return 5;
            };

            // Map 0-10 metric scale to Screen Coordinates (with padding)
            // X-Axis: Territorialization (0 -> 10) maps to (Left -> Right)
            // Y-Axis: Deterritorialization (0 -> 10) maps to (Bottom -> Top) - NOTE: SVG Y is inverted (0 is top), so we flip it.
            // Wait, usually Deterritorialization implies "flight" or "up". Let's map 10 to TOP (low Y) and 0 to BOTTOM (high Y).
            const padding = 100;
            const safeWidth = width - (padding * 2);
            const safeHeight = height - (padding * 2);

            simulation
                .force("x", d3.forceX((d: SimulationNode & { metrics?: any }) => {
                    const val = getMetricValue(d.metrics?.territorialization || d.metrics?.territoriality);
                    return padding + (val / 10) * safeWidth;
                }).strength(0.4)) // Strong pull
                .force("y", d3.forceY((d: SimulationNode & { metrics?: any }) => {
                    const val = getMetricValue(d.metrics?.deterritorialization || d.metrics?.counter_conduct);
                    // Invert Y: High value (10) -> Low Y (Top)
                    return (height - padding) - (val / 10) * safeHeight;
                }).strength(0.4))
                .force("charge", d3.forceManyBody().strength(-100)); // Gentle repulsion to prevent overlapping
        } else if (enableClustering) {
            // Nested Assemblage Layout (Radial Rings)
            const getRadialRadius = (type: string) => {
                const t = type.toLowerCase();
                const minDim = Math.min(width, height);
                // Center (0) reserved for Policy Object if it exists
                if (t === 'legalobject' || t === 'regulation' || t === 'law') return 0; // Ring 0 (Center)
                if (t === 'policymaker' || t === 'government' || t === 'regulator') return minDim * 0.15; // Ring 1
                if (t === 'civilsociety' || t === 'academic' || t === 'ngo') return minDim * 0.25; // Ring 2
                if (t === 'startup' || t === 'private' || t === 'market' || t === 'corporation') return minDim * 0.35; // Ring 3
                return minDim * 0.45; // Ring 4 (Outer: Infra, Algo, etc)
            };

            simulation
                .force("radial", d3.forceRadial((d: d3.SimulationNodeDatum) => getRadialRadius((d as SimulationNode).type), width / 2, height / 2).strength(0.8))
                .force("charge", d3.forceManyBody().strength(-300)) // Weaker repulsion for rings
                .force("center", null)
                .force("x", null)
                .force("y", null);
        } else {
            // Standard Force Layout
            simulation
                .force("radial", null)
                .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
                .force("x", d3.forceX(width / 2).strength(0.05))
                .force("y", d3.forceY(height / 2).strength(0.05))
                .force("charge", d3.forceManyBody().strength(-800)); // Strong repulsion for spread
        }

        // 3. Configure Links
        if (links.length > 0) {
            const nodeIds = new Set(nodes.map(n => n.id));
            const validLinks = links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
                .map(l => ({ ...l }));

            if (validLinks.length > 0) {
                // Tighter links in radial mode to keep rings coherent
                // Looser links in Metric mode to allow metrics to dictate position mostly
                const distance = enableMetricAlignment ? 0 : (enableClustering ? 100 : 150);
                const strength = enableMetricAlignment ? 0 : 1; // Disable link pull in metric mode so X/Y dominates? Or weak pull?
                // Actually, let's keep weak links in metric mode to show connections without distorting position too much
                simulation.force("link", d3.forceLink(validLinks)
                    .id((d: d3.SimulationNodeDatum) => (d as SimulationNode).id)
                    .distance(enableClustering ? 100 : 150)
                    .strength(enableMetricAlignment ? 0.05 : 0.7) // Very weak links in metric mode
                );
            }
        }

        // 4. Custom Grouping (Configuration) Force - Radially Separates Macro Groups
        const groupForce = (alpha: number) => {
            if (enableMetricAlignment) return; // Disable artificial group separation in metric mode

            configurations.forEach((config, i) => {
                const members = nodes.filter(n => config.memberIds.includes(n.id));
                if (members.length < 1) return;

                // Calculate a target "home" for this configuration based on index
                const totalConfigs = configurations.length;

                let targetX = width / 2;
                let targetY = height / 2;

                // Calculate Default Home
                if (totalConfigs > 1) {
                    const radius = Math.min(width, height) * 0.35; // Use 35% of view dimension
                    const angle = (i / totalConfigs) * 2 * Math.PI - (Math.PI / 2); // Start at top
                    targetX = (width / 2) + Math.cos(angle) * radius;
                    targetY = (height / 2) + Math.sin(angle) * radius;
                }

                // Apply Manual Offsets via Ref (Hot update)
                const currentOffsets = configOffsetsRef.current;
                if (currentOffsets[config.id]) {
                    targetX += currentOffsets[config.id].x;
                    targetY += currentOffsets[config.id].y;
                }

                members.forEach(d => {
                    d.vx! += (targetX - d.x!) * alpha * 0.15;
                    d.vy! += (targetY - d.y!) * alpha * 0.15;
                });
            });
        };

        simulation.alphaDecay(0.02);

        simulation.on("tick", () => {
            groupForce(simulation.alpha());
            setNodes([...nodes]);
        });

        simulationRef.current = simulation;

        return () => {
            simulation.stop();
        };
    }, [nodes, links, width, height, configurations, enableClustering, isPaused, enableMetricAlignment]);

    // Custom interface to compatible with both D3 internal events and manual React triggers
    interface GraphDragEvent {
        active?: boolean | number;
        x: number;
        y: number;
        subject?: unknown;
    }

    const drag = (node: SimulationNode) => {
        const dragStarted = (event: GraphDragEvent) => {
            if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
            node.fx = node.x;
            node.fy = node.y;
        };

        const dragged = (event: GraphDragEvent) => {
            node.fx = event.x;
            node.fy = event.y;
        };

        const dragEnded = (event: GraphDragEvent) => {
            if (!event.active) simulationRef.current?.alphaTarget(0);
            node.fx = null;
            node.fy = null;
        };

        return { dragStarted, dragged, dragEnded };
    };

    return { nodes, simulation: simulationRef.current, drag };
}
