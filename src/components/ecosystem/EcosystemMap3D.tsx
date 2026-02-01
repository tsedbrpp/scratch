"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
// @ts-ignore
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { computeNodeViz, computeLinkViz, NodeViz, LinkViz } from '@/lib/viz-contract';
import { OverlayDetails } from './OverlayDetails';
import { generateEdges } from '@/lib/graph-utils';

// Dynamically import ForceGraph3D because it uses window/WEBGL which is client-side only
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-slate-400">Loading 3D Engine...</div>
});

interface EcosystemMap3DProps {
    actors: EcosystemActor[];
    configurations: EcosystemConfiguration[];
    selectedForGrouping: string[];
    onToggleSelection: (actorId: string) => void;
    focusedNodeId: string | null;
    width: number;
    height: number;
    isStratumMode: boolean;
    reduceMotion?: boolean;
    onToggleCollapse?: (id: string) => void;
    tracedId?: string | null;
    isPresentationMode?: boolean; // [NEW] Presentation Mode Toggle
    selectedActorId?: string | null; // [NEW] Synced Selection
}

// --- Types ---
interface GraphNode {
    id: string;
    name: string;
    type: string;
    val: number;
    color: string;
    isConfiguration: boolean;
    x?: number;
    y?: number;
    z?: number;
    actor?: EcosystemActor;
    viz?: NodeViz; // [NEW] Visual Contract Data
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    type: string;
    viz?: LinkViz; // [NEW] Visual Contract Data
}

// --- Helper: Create Text Sprite for Labels ---
const createTextSprite = (text: string, color: string, fontSize: number = 24) => {
    if (typeof document === 'undefined') return new THREE.Mesh();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return new THREE.Mesh();

    const font = `Bold ${fontSize}px Inter, sans-serif`;
    context.font = font;
    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    context.font = font;
    context.font = font;
    context.globalAlpha = 0.65; // [FIX] Semi-transparent background to reduce bloom glare
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(0, 0, canvas.width, canvas.height, 10);
    context.fill();
    context.globalAlpha = 1.0; // Reset alpha for text

    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(textWidth / 4, (fontSize + 10) / 4, 1);
    return sprite;
};

interface NodeUserData {
    isJitterTarget?: boolean;
    jitterMagnitude?: number;
    heat?: number;
    baseColor?: string;
}

export function EcosystemMap3D({
    actors,
    configurations,
    selectedForGrouping,
    onToggleSelection,
    width,
    height,
    isStratumMode,
    reduceMotion = false,
    onToggleCollapse,
    tracedId,
    isPresentationMode = false,
    selectedActorId
}: EcosystemMap3DProps) {
    const fgRef = useRef<any>(null);
    const lastClickRef = useRef<{ id: string, time: number } | null>(null); // [NEW] Double Click Tracking
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
    // const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null); // [REMOVED] Favor Node Overlay

    // [NEW] Overlay State
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [isOverlayPinned, setIsOverlayPinned] = useState(false);

    // [NEW] Derived Neighbors for Overlay
    const nodeNeighbors = useMemo(() => {
        if (!selectedNode) return [];
        return graphData.links
            .filter(l => (typeof l.source === 'object' ? l.source.id : l.source) === selectedNode.id || (typeof l.target === 'object' ? l.target.id : l.target) === selectedNode.id)
            .map(l => {
                const isSource = (typeof l.source === 'object' ? l.source.id : l.source) === selectedNode.id;
                const other = isSource ? l.target : l.source;
                const otherNode = typeof other === 'object' ? other : graphData.nodes.find(n => n.id === other);
                return {
                    name: otherNode ? (otherNode as GraphNode).name : 'Unknown',
                    type: otherNode ? (otherNode as GraphNode).type : 'Unknown',
                    relation: l.type // Or flow type description
                };
            })
            .slice(0, 5); // Top 5
    }, [selectedNode, graphData]);

    // [NEW] Sync internal selection with prop
    useEffect(() => {
        if (selectedActorId) {
            const node = graphData.nodes.find(n => n.id === selectedActorId);
            if (node) {
                setSelectedNode(node);
                setIsOverlayPinned(true);
            }
        } else {
            if (!isOverlayPinned) setSelectedNode(null);
        }
    }, [selectedActorId, graphData.nodes]);

    useEffect(() => {
        // Defines vertical levels
        const getZLevel = (type: string) => {
            const t = type.toLowerCase();
            if (t.includes('legal') || t.includes('law')) return 150;
            if (t.includes('policy') || t.includes('government')) return 80;
            if (t.includes('civil') || t.includes('academic')) return 20;
            if (t.includes('startup') || t.includes('private')) return -40;
            if (t.includes('algorithm') || t.includes('agent')) return -80;
            return 0; // Infrastructure/Default
        };

        // 1. Map Actors -> GraphNodes with Viz Contract
        const nodes: GraphNode[] = actors.map(actor => {
            const viz = computeNodeViz(actor);
            const baseNode: GraphNode = {
                id: actor.id,
                name: actor.name,
                type: actor.type,
                val: selectedForGrouping.includes(actor.id) ? 20 : 10,
                color: viz.color, // Use base color from contract
                isConfiguration: false,
                actor: actor,
                viz: viz // Attach full viz payload
            };

            if (isStratumMode) {
                (baseNode as any).fz = getZLevel(actor.type);
                (baseNode as any).z = getZLevel(actor.type);
            }

            return baseNode;
        });

        // 2. Generate Links with Viz Contract
        const links: GraphLink[] = [];
        const addedLinks = new Set<string>();

        console.log("Generating 3D Links. Stats:", {
            actorCount: actors.length,
            configCount: configurations.length,
            hasAnalysisData: configurations.some(c => c.analysisData?.edges)
        });

        // A. Explicit Edges from ANT Analysis
        configurations.forEach(config => {
            if (config.analysisData && config.analysisData.edges) {
                console.log(`Config ${config.name} has ${config.analysisData.edges.length} explicit edges.`);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                config.analysisData.edges.forEach((edge: any) => {
                    // RESOLUTION STRATEGY: Try ID first, then Name fallback
                    let sourceId = edge.source;
                    let targetId = edge.target;

                    const sourceActor = actors.find(a => a.id === sourceId) || actors.find(a => a.name === sourceId);
                    const targetActor = actors.find(a => a.id === targetId) || actors.find(a => a.name === targetId);

                    if (!sourceActor || !targetActor) {
                        console.warn(`Link dropped: Could not resolve actor ${edge.source} or ${edge.target}`);
                        return;
                    }

                    // Use resolved IDs
                    sourceId = sourceActor.id;
                    targetId = targetActor.id;

                    const linkId = `${sourceId}-${targetId}`;
                    if (addedLinks.has(linkId)) return;

                    const rawLink = {
                        source: sourceId,
                        target: targetId,
                        type: edge.type || "Association",
                        weight: 1.0,
                        flow_type: (edge.type && ['regulates', 'funds', 'restricts', 'enforces'].some((t: string) => edge.type.toLowerCase().includes(t)) ? 'power' : 'logic') as 'power' | 'logic',
                        confidence: 1.0
                    };
                    const viz = computeLinkViz(rawLink);

                    links.push({
                        source: sourceId,
                        target: targetId,
                        type: edge.type,
                        viz
                    });
                    addedLinks.add(linkId);
                });
            }
        });

        // B. Heuristic Connectivity (Type-Based Defaults - "2D Logic")
        const heuristicEdges = generateEdges(actors);
        console.log(`Generated ${heuristicEdges.length} heuristic edges.`);

        heuristicEdges.forEach(e => {
            const linkId = `${e.source.id}-${e.target.id}`;
            const reverseId = `${e.target.id}-${e.source.id}`;

            // Skip if already linked Explicitly
            if (addedLinks.has(linkId) || addedLinks.has(reverseId)) return;

            const viz = {
                flowType: e.flow_type || 'logic',
                flowColor: e.flow_type === 'power' ? "#EF4444" : "#F59E0B",
                strength: 0.5,
                confidence: 0.6,
                roleType: 'Mixed' as const
            };

            links.push({
                source: e.source.id,
                target: e.target.id,
                type: e.label || "Related",
                viz: viz as LinkViz
            });
            addedLinks.add(linkId);
        });

        // C. Implicit Connectivity (Shared Configuration) - Lowest Priority
        actors.forEach((source, i) => {
            actors.forEach((target, j) => {
                if (i >= j) return;

                // Skip if already linked
                if (addedLinks.has(`${source.id}-${target.id}`) || addedLinks.has(`${target.id}-${source.id}`)) return;

                const sharedConfig = configurations.find(c => c.memberIds.includes(source.id) && c.memberIds.includes(target.id));

                if (sharedConfig) {
                    const viz = {
                        flowType: 'logic' as const,
                        flowColor: sharedConfig.color,
                        strength: 0.2,
                        opacity: 0.2,
                        confidence: 0.3,
                        roleType: 'Mixed' as const
                    };

                    links.push({
                        source: source.id,
                        target: target.id,
                        type: sharedConfig.name,
                        viz
                    });
                }
            });
        });

        console.log(`Generated ${links.length} total links (Explicit + Heuristic + Implicit).`);

        // 3. Config Labels
        // [REMOVED] Macro Assemblage Labels (User Request: Obscures network)
        /*
        configurations.forEach(config => {
            const labelNodeId = `config-${config.id}`;
            nodes.push({
                id: labelNodeId,
                name: config.name,
                type: 'Configuration',
                val: 5,
                color: config.color,
                isConfiguration: true
            });
            config.memberIds.forEach(memberId => {
                if (actors.find(a => a.id === memberId)) {
                    links.push({
                        source: labelNodeId,
                        target: memberId,
                        type: "LabelTether",
                        viz: { flowType: 'logic', flowColor: 'transparent', strength: 0, confidence: 0 } // Invisible tether
                    });
                }
            });
        });
        */

        setGraphData({ nodes, links });
    }, [actors, configurations, selectedForGrouping, isStratumMode]);


    // [NEW] Node Object Factory (PBR + Geometry)
    // [NEW] Node Object Factory (PBR + Geometry + Animation Tags)
    const nodeObjectCallback = (node: any): THREE.Object3D => {
        const n = node as GraphNode;
        if (n.isConfiguration) return createTextSprite(n.name, n.color);

        const group = new THREE.Group();
        // If NO viz data (e.g. initial load), fallback to simple sphere
        if (!n.viz) return new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({ color: '#ccc' }));

        const viz = n.viz;

        // 1. Geometry Variant based on Role Type
        let geometry: THREE.BufferGeometry;
        // Material = Box (Anchor), Expressive = Icosahedron (Speech bubble-ish), Mixed = Sphere
        if (viz.roleType === 'Material') {
            geometry = new THREE.BoxGeometry(n.val, n.val, n.val);
        } else if (viz.roleType === 'Expressive') {
            geometry = new THREE.IcosahedronGeometry(n.val / 1.5, 0);
        } else {
            geometry = new THREE.SphereGeometry(n.val / 2, 16, 16);
        }

        // 2. Material Strategy
        // Roughness = inverse of Territorialization (Stability).
        const roughness = 1 - (viz.territorialization * 0.8);

        // Emissive = Ethical Risk Potential (formerly Bias).
        // We only emit if risk is significant to avoid noise.
        const materialParams: THREE.MeshStandardMaterialParameters = {
            color: n.color,
            roughness: roughness,
            metalness: 0.2,
            emissive: viz.ethicalRisk > 0.4 ? 0xff0000 : 0x000000,
            emissiveIntensity: viz.ethicalRisk > 0.4 ? (viz.ethicalRisk * 5) : 0, // [ENHANCED] Higher intensity for bloom
            transparent: true,
            opacity: Math.max(0.3, viz.confidence), // Floor opacity at 0.3 for visibility
            wireframe: viz.isGhost // Ghosts are pure wireframe
        };

        // [NEW] Missing Data -> Striped Texture
        if (viz.hasMissingMetrics) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff'; // Fill with white (base tint)
                ctx.fillRect(0, 0, 64, 64);

                ctx.fillStyle = '#000000'; // Stripe color
                ctx.globalAlpha = 0.3;
                for (let i = -64; i < 128; i += 16) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i + 64, 64);
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }
            }
            const texture = new THREE.CanvasTexture(canvas);
            materialParams.map = texture;
            materialParams.bumpMap = texture;
            materialParams.bumpScale = 0.5;
            // Ensure color doesn't blend too dark
            materialParams.color = new THREE.Color(n.color).offsetHSL(0, 0, 0.1);
        }

        const material = new THREE.MeshStandardMaterial(materialParams);

        // 3. Child Mesh for Jitter (Animation Target)
        // We attach user data here so the render loop can find it.
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = {
            isJitterTarget: true,
            jitterMagnitude: viz.deterritorialization,
            heat: viz.heat,
            baseColor: n.color
        };
        group.add(mesh);

        // 4. Provisionality Wireframe Overlay
        // If provisional but NOT ghost (ghosts are already wireframe), add a cage.
        if (viz.isProvisional && !viz.isGhost) {
            const wiregeo = new THREE.WireframeGeometry(geometry);
            const wiremat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
            const wireframe = new THREE.LineSegments(wiregeo, wiremat);
            group.add(wireframe); // Add to group, not mesh, so it doesn't jitter independently? Or should it? 
            // Better to add to 'mesh' if we want it to jitter WITH the node.
            // But 'mesh' is a Mesh, not a Group. 
            // Actually, if we add to 'group', it won't jitter if we only animate 'mesh.position'.
            // Correct approach: Animate the GROUP position? No, that breaks physics.
            // We should animate 'mesh' position relative to group.
            // So if we want wireframe to move too, it must be child of 'mesh' OR we animate 'group' children?
            // Let's make wireframe a child of 'mesh' if possible? No, mesh children are hard.
            // Simple fix: Add wireframe to 'group', but animate 'group.children.forEach' in the loop.
        }

        // User asked for "Geometry Variants" (Box/Sphere), which we did above.
        // Let's stick to the Geometry change as the primary indicator for now.

        return group;
    };

    // [NEW] Performance & LOD System
    const [performanceMode, setPerformanceMode] = useState(false);
    // [REMOVED] presentationMode local state - now a prop
    const frameTimes = useRef<number[]>([]);
    const lastFrameTime = useRef<number>(Date.now());

    // [NEW] Animation Loop Injection via Ref (Bypasses React Prop limitation)
    useEffect(() => {
        let animationFrameId: number;
        let bloomPass: any = null;

        // Initialize Bloom & Fog if in Presentation Mode and not Low Power
        if (isPresentationMode && !performanceMode && fgRef.current) {
            const fg = fgRef.current as any;
            const scene = fg.scene();

            // 1. Fog
            scene.fog = new THREE.FogExp2(0x0F172A, 0.002);

            // 2. Bloom
            if (fg.postProcessingComposer) {
                const composer = fg.postProcessingComposer();
                // @ts-ignore
                bloomPass = new UnrealBloomPass(undefined, 2.0, 0.5, 0.5); // [ENHANCED] Higher strength, lower threshold
                bloomPass.threshold = 0.5; // Capture more emissive range
                bloomPass.strength = 1.2;   // More intense glow
                bloomPass.radius = 1.0;     // Wider diffusion
                composer.addPass(bloomPass);
            }
        }

        const animate = () => {
            const now = Date.now();
            const delta = now - lastFrameTime.current;
            lastFrameTime.current = now;

            // 1. FPS Calculation (Rolling Average over 60 frames)
            if (delta > 0) {
                const fps = 1000 / delta;
                frameTimes.current.push(fps);
                if (frameTimes.current.length > 60) frameTimes.current.shift();

                // Check every 60 frames (approx 1 sec)
                if (frameTimes.current.length === 60 && animationFrameId % 60 === 0) {
                    const avgFps = frameTimes.current.reduce((a, b) => a + b) / 60;
                    if (avgFps < 30 && !performanceMode) {
                        setPerformanceMode(true); // Downgrade
                        console.warn("Performance Mode Enabled: FPS < 30");
                    } else if (avgFps > 55 && performanceMode) {
                        setPerformanceMode(false); // Upgrade (hysteresis)
                        console.log("Performance Mode Disabled: FPS > 55");
                    }
                }
            }

            // 2. Accessibility & Performance Gate
            if (fgRef.current) {
                const fg = fgRef.current as any;
                const scene = fg.scene ? fg.scene() : null;

                if (scene) {
                    // Fog Logic (Presentation Mode only)
                    if (isPresentationMode && !performanceMode) {
                        if (!scene.fog) scene.fog = new THREE.FogExp2(0x0F172A, 0.002);
                    } else {
                        if (scene.fog) scene.fog = null;
                    }

                    // Harmonic Oscillation
                    if (!reduceMotion && !performanceMode) {
                        scene.traverse((object: THREE.Object3D) => {
                            const userData = object.userData as NodeUserData;
                            if (userData && userData.isJitterTarget) {
                                const magnitude = (userData.jitterMagnitude || 0) * 0.5;
                                if (magnitude > 0.05 || (userData.heat || 0) > 0.1) {
                                    // Deterministic Harmonic Oscillation (Breathing)
                                    const phase = object.id * 0.1;
                                    const heat = userData.heat || 0;

                                    // Frequency maps to Heat: 0.002 (Cold) -> 0.012 (Molten)
                                    const freq = 0.002 + (heat * 0.01);

                                    // Magnitude also scales slightly with heat
                                    const scaledMagnitude = magnitude + (heat * 0.1);

                                    object.position.x = Math.sin(now * freq + phase) * scaledMagnitude;
                                    object.position.y = Math.cos(now * freq + phase) * scaledMagnitude;
                                    object.position.z = Math.sin(now * freq * 0.8 + phase) * scaledMagnitude;

                                    // NEW: Color Temperature Shift & Pulsing Emission
                                    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
                                        const mat = object.material;

                                        // 1. Emissive Pulse (Sync with movement)
                                        if (heat > 0.4) {
                                            const pulse = (Math.sin(now * freq + phase) + 1) * 0.5;
                                            mat.emissiveIntensity = heat * pulse * 2;
                                            mat.emissive = new THREE.Color(heat > 0.8 ? 0xff3300 : 0xff9900);
                                        }

                                        // 2. Color Shift (Slow drift towards red at high heat)
                                        if (heat > 0.6 && !performanceMode) {
                                            const drift = Math.min(1, (heat - 0.6) * 2.5);
                                            const baseColor = new THREE.Color(userData.baseColor || "#ffffff");
                                            const hotColor = new THREE.Color(0xff4400); // Lava/Controversy Red
                                            mat.color.lerpColors(baseColor, hotColor, drift);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        // Start Loop
        animate();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            // Cleanup Bloom
            if (bloomPass && fgRef.current) {
                const fg = fgRef.current as any;
                if (fg.postProcessingComposer) {
                    const composer = fg.postProcessingComposer();
                    composer.removePass(bloomPass);
                }
            }
        };
    }, [reduceMotion, performanceMode, isPresentationMode]);

    // [NEW] Oligopticon Mode: Auto-Focus on Traced Actor
    useEffect(() => {
        if (!tracedId || !fgRef.current) return;

        // Find node in current graph data
        const node = graphData.nodes.find(n => n.id === tracedId);

        if (node && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
            console.log(`[Oligopticon] Focusing on actor ${tracedId}`);
            const distance = 80;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

            fgRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // New Position
                { x: node.x, y: node.y, z: node.z }, // LookAt
                2000 // Transition ms
            );
        }
    }, [tracedId, graphData.nodes]);


    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {/* Performance Indicator */}
            <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-50 pointer-events-none">
                {performanceMode && (
                    <div className="px-2 py-1 bg-yellow-900/80 text-yellow-200 text-xs rounded border border-yellow-700">
                        ⚡ Low Power Mode
                    </div>
                )}
            </div>

            <ForceGraph3D
                ref={fgRef}
                width={width}
                height={height}
                graphData={graphData}
                nodeLabel="name"
                nodeColor="color"
                backgroundColor="#0F172A" // Dark mode for Emissive contrast

                // [NEW] Link Visuals
                linkWidth={link => (link as GraphLink).viz?.strength ? (link as GraphLink).viz!.strength * 2 : 1}
                linkColor={(link: any) => {
                    const l = link as GraphLink;
                    const c = l.viz?.flowColor || "#FFFFFF";
                    const op = l.viz?.confidence !== undefined ? l.viz.confidence : 0.6;
                    // Convert Hex to RGBA for Opacity
                    if (c.startsWith('#') && c.length === 7) {
                        const r = parseInt(c.slice(1, 3), 16);
                        const g = parseInt(c.slice(3, 5), 16);
                        const b = parseInt(c.slice(5, 7), 16);
                        return `rgba(${r},${g},${b},${op})`;
                    }
                    return c;
                }}
                // Presentation Mode: Curved Links. Research Mode: Straight Links.
                linkCurvature={isPresentationMode ? 0.25 : 0}

                linkDirectionalParticles={link => (reduceMotion || performanceMode) ? 0 : ((link as GraphLink).viz?.flowType === 'power' ? 4 : 2)}
                linkDirectionalParticleSpeed={link => (reduceMotion || performanceMode) ? 0 : ((link as GraphLink).viz?.flowType === 'power' ? 0.01 : 0.005)}
                linkDirectionalParticleWidth={2}

                nodeThreeObject={nodeObjectCallback}

                onNodeClick={(node) => {
                    const n = node as GraphNode;

                    // [NEW] Double Click Detection
                    const now = Date.now();
                    const isDouble = lastClickRef.current && lastClickRef.current.id === n.id && (now - lastClickRef.current.time < 300);
                    lastClickRef.current = { id: n.id, time: now };

                    if (isDouble && onToggleCollapse) {
                        // Case A: Expand a Black Box
                        if (n.actor && n.actor.isBlackBox) {
                            const configId = n.id.replace('blackbox-', '');
                            onToggleCollapse(configId);
                            return;
                        }
                        // Case B: Collapse an Assemblage (via Config Label)
                        if (n.isConfiguration) {
                            const configId = n.id.replace('config-', '');
                            onToggleCollapse(configId);
                            return;
                        }
                    }

                    if (n.isConfiguration) return;

                    // Camera Focus
                    const distance = 60;
                    const distRatio = 1 + distance / Math.hypot(n.x!, n.y!, n.z!);
                    fgRef.current?.cameraPosition(
                        { x: n.x! * distRatio, y: n.y! * distRatio, z: n.z! * distRatio },
                        n,
                        2000
                    );

                    setSelectedNode(n);
                    if (!isOverlayPinned) setIsOverlayPinned(true); // Auto-open/pin on click
                    onToggleSelection(n.id);
                }}
                onBackgroundClick={() => {
                    if (!isOverlayPinned) setSelectedNode(null);
                }}
            />

            {/* [NEW] Interaction Overlay */}
            {selectedNode && selectedNode.actor && selectedNode.viz && (
                <OverlayDetails
                    node={selectedNode.actor}
                    viz={selectedNode.viz}
                    onClose={() => {
                        setIsOverlayPinned(false);
                        setSelectedNode(null);
                        // [NEW] Clear selection in parent if it matched
                        if (selectedActorId === selectedNode.id) {
                            onToggleSelection(selectedNode.id); // Toggles off
                        }
                    }}
                    onPin={() => setIsOverlayPinned(!isOverlayPinned)}
                    isPinned={isOverlayPinned}
                    neighbors={nodeNeighbors}
                />
            )}

            {/* Legend / Controls could go here */}
            {!selectedNode && (
                <div className="absolute bottom-4 left-4 text-xs text-slate-500 pointer-events-none">
                    Click a node to inspect Assemblage Metrics.
                </div>
            )}
        </div>
    );
}
