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
import { createLinkGeometry, updateLinkPosition, createNodeObject, GraphNode, GraphLink, NodeUserData, animateLinkParticles } from './GraphVisuals';
import { RelationshipDetail } from './RelationshipDetail';
import { Relationship } from '@/types/relationship';

// Dynamically import ForceGraph3D because it uses window/WEBGL which is client-side only
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-slate-400">Loading 3D Engine...</div>
});


interface EcosystemMap3DProps {
    actors: EcosystemActor[];
    links?: GraphLink[]; // [NEW] Typed Links
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
    showUnverifiedLinks?: boolean;
    linkClassFilter?: 'all' | 'mediator' | 'intermediary';
}




export const EcosystemMap3D = ({
    actors,
    links: externalLinks,
    configurations,
    selectedForGrouping,
    onToggleSelection,
    onToggleCollapse,
    width,
    height,
    isStratumMode,
    reduceMotion = false,
    tracedId,
    isPresentationMode = false,
    selectedActorId,
    showUnverifiedLinks = false,
    linkClassFilter = 'all'
}: EcosystemMap3DProps) => {
    const fgRef = useRef<any>(null);
    const lastClickRef = useRef<{ id: string, time: number } | null>(null);
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
    const [selectedLink, setSelectedLink] = useState<Relationship | null>(null);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [isOverlayPinned, setIsOverlayPinned] = useState(false);
    const [performanceMode, setPerformanceMode] = useState(false);
    const frameTimes = useRef<number[]>([]);
    const lastFrameTime = useRef<number>(Date.now());

    // 1. Unified Links Memo
    const links = useMemo(() => {
        // [FIX] Always enrich, even if links are passed from parent
        const baseEdges = externalLinks || generateEdges(actors);

        // [NEW] Enrich with Analysis Data from Configurations
        const analysisMap = new Map<string, any>();

        configurations.forEach(config => {
            if (config.analysisData && config.analysisData.relationships) {
                config.analysisData.relationships.forEach((rel: any) => {
                    // Store strict and reverse keys to ensure matching
                    analysisMap.set(`${rel.source}-${rel.target}`, rel);
                    analysisMap.set(`${rel.target}-${rel.source}`, rel);
                });
            }
        });

        // [FILTER] If analysis exists, ONLY show analyzed links (Mediators/Intermediaries)
        // If no analysis (size 0), show all theoretical links (Logic)
        const hasAnalysis = analysisMap.size > 0;

        const output = baseEdges
            .map(edge => {
                const sId = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
                const tId = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
                const analysis = analysisMap.get(`${sId}-${tId}`);

                if (analysis) {
                    return { ...edge, analysis };
                }
                return edge;
            })
            .filter(edge => {
                const edgeAnalysis = (edge as any).analysis;
                const isAnalyzed = !!edgeAnalysis;

                // 1. Explicit Classification Filter (High Priority)
                if (linkClassFilter !== 'all') {
                    if (!isAnalyzed) return false; // Hide unanalyzed when filtering specific types
                    const score = edgeAnalysis.mediatorScore;
                    if (linkClassFilter === 'mediator') return score >= 0.5;
                    if (linkClassFilter === 'intermediary') return score < 0.5;
                }

                // 2. Default View ("All Types")
                // If no analysis exists contextually (neither global nor local), show logical links.
                if (!hasAnalysis && !isAnalyzed) return true;

                // 3. Unverified Visibility (in presence of analysis)
                if (!isAnalyzed) {
                    return showUnverifiedLinks;
                }

                return true;
            });


        return output;
    }, [actors, externalLinks, configurations, showUnverifiedLinks, linkClassFilter]);

    // 2. Neighbors Memo
    // 2. Neighbors Memo
    const nodeNeighbors = useMemo(() => {
        if (!selectedNode) return [];
        return graphData.links
            .filter(link => {
                const l = link as GraphLink;
                const sId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
                const tId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target as string;
                return sId === selectedNode.id || tId === selectedNode.id;
            })
            .map(link => {
                const l = link as GraphLink;
                const sId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source as string;
                const isSource = sId === selectedNode.id;
                const other = isSource ? l.target : l.source;
                const otherNode = typeof other === 'object' ? other as GraphNode : graphData.nodes.find(n => n.id === other);
                return {
                    name: otherNode ? otherNode.name : 'Unknown',
                    type: otherNode ? otherNode.type : 'Unknown',
                    relation: l.type
                };
            })
            .slice(0, 5);
    }, [selectedNode, graphData]);

    // 3. Sync Selections
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

    // 4. Data Mapping Effect
    useEffect(() => {

        const getZLevel = (type: string) => {
            const t = type.toLowerCase();
            if (t.includes('legal') || t.includes('law')) return 150;
            if (t.includes('policy') || t.includes('government')) return 80;
            if (t.includes('civil') || t.includes('academic')) return 20;
            if (t.includes('startup') || t.includes('private')) return -40;
            if (t.includes('algorithm') || t.includes('agent')) return -80;
            return 0;
        };

        const nodes: GraphNode[] = actors.map(actor => {
            const viz = computeNodeViz(actor);
            const baseNode: GraphNode = {
                id: actor.id,
                name: actor.name,
                type: actor.type,
                val: selectedForGrouping.includes(actor.id) ? 20 : 10,
                color: viz.color,
                isConfiguration: false,
                actor: actor,
                viz: viz
            };

            if (isStratumMode) {
                // Remove 'as any' since interface now supports fz/z
                baseNode.fz = getZLevel(actor.type);
                baseNode.z = getZLevel(actor.type);
            }

            return baseNode;
        });

        const gLinks: GraphLink[] = links.map(link => {
            const l = link as GraphLink; // Safe cast as we normalize it below
            const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;

            const viz = l.viz || computeLinkViz({
                source: sourceId,
                target: targetId,
                type: l.type || "Association",
                weight: 1.0,
                flow_type: 'logic', // Default
                confidence: 1.0
            });

            return {
                source: sourceId,
                target: targetId,
                type: l.type,
                viz,
                analysis: l.analysis
            };
        });

        setGraphData({ nodes, links: gLinks });
    }, [actors, links, selectedForGrouping, isStratumMode]);

    // 5. Node Object Factory
    // Delegated to GraphVisuals for cleaner code
    const nodeObjectCallback = (node: any): THREE.Object3D => {
        return createNodeObject(node as GraphNode);
    };

    // 6. Animation Hook
    useEffect(() => {
        let animationFrameId: number;
        let bloomPass: any = null;

        if (isPresentationMode && !performanceMode && fgRef.current) {
            const fg = fgRef.current;
            const scene = fg.scene();
            scene.fog = new THREE.FogExp2(0x0F172A, 0.002);

            if (fg.postProcessingComposer) {
                const composer = fg.postProcessingComposer();
                // @ts-ignore
                bloomPass = new UnrealBloomPass(undefined, 1.2, 0.5, 0.5);
                composer.addPass(bloomPass);
            }
        }

        const animate = () => {
            const now = Date.now();
            const delta = now - lastFrameTime.current;
            lastFrameTime.current = now;

            if (delta > 0) {
                const fps = 1000 / delta;
                frameTimes.current.push(fps);
                if (frameTimes.current.length > 60) frameTimes.current.shift();
                if (frameTimes.current.length === 60 && animationFrameId % 60 === 0) {
                    const avgFps = frameTimes.current.reduce((a, b) => a + b) / 60;
                    if (avgFps < 30 && !performanceMode) setPerformanceMode(true);
                    else if (avgFps > 55 && performanceMode) setPerformanceMode(false);
                }
            }

            if (fgRef.current) {
                const fg = fgRef.current;
                const scene = fg.scene ? fg.scene() : null;
                if (scene && !reduceMotion && !performanceMode) {
                    // [NEW] Animate Particles
                    animateLinkParticles(scene, now);

                    scene.traverse((object: THREE.Object3D) => {
                        const userData = object.userData as NodeUserData;
                        if (userData && userData.isJitterTarget) {
                            const magnitude = (userData.jitterMagnitude || 0) * 0.5;
                            const heat = userData.heat || 0;
                            const freq = 0.002 + (heat * 0.01);
                            const scaledMagnitude = magnitude + (heat * 0.1);
                            const phase = object.id * 0.1;

                            object.position.x = Math.sin(now * freq + phase) * scaledMagnitude;
                            object.position.y = Math.cos(now * freq + phase) * scaledMagnitude;
                            object.position.z = Math.sin(now * freq * 0.8 + phase) * scaledMagnitude;

                            if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
                                const mat = object.material;
                                if (heat > 0.4) {
                                    const pulse = (Math.sin(now * freq + phase) + 1) * 0.5;
                                    mat.emissiveIntensity = heat * pulse * 2;
                                    mat.emissive = new THREE.Color(heat > 0.8 ? 0xff3300 : 0xff9900);
                                }
                            }
                        }
                    });
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (bloomPass && fgRef.current) {
                const fg = fgRef.current;
                if (fg.postProcessingComposer) fg.postProcessingComposer().removePass(bloomPass);
            }
        };
    }, [reduceMotion, performanceMode, isPresentationMode]);

    // 7. Focus Effect
    useEffect(() => {
        if (!tracedId || !fgRef.current) return;
        const node = graphData.nodes.find(n => n.id === tracedId);
        if (node && typeof node.x === 'number' && typeof node.y === 'number' && typeof node.z === 'number') {
            const distance = 80;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            fgRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                { x: node.x, y: node.y, z: node.z },
                2000
            );
        }
    }, [tracedId, graphData.nodes]);

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
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
                backgroundColor="#0F172A"
                linkThreeObject={(link) => createLinkGeometry(link as any)}
                linkPositionUpdate={(obj, { start, end }, link) => {
                    // [FIX] Valid coordinates check
                    if (start && end && typeof start.x === 'number' && typeof end.x === 'number') {
                        // [FIX] Pass to updater
                        updateLinkPosition(obj, start, end, link as unknown as GraphLink);

                        // [FIX] Create Link Geometry builds geometry in WORLD coordinates (start/end).
                        // If we let ForceGraph apply default transforms (translate/rotate/scale), 
                        // it will apply them to the Group, causing double-transformation 
                        // (e.g. Group moved to midpoint + Geometry drawn from 0 to world coord).
                        // Returning true tells ForceGraph we handled positioning, keeping the Group at identity.
                        return true;
                    }
                    return false;
                }}
                linkWidth={0}
                linkDirectionalParticles={0}
                linkCurvature={isPresentationMode ? 0.25 : 0}
                nodeThreeObject={nodeObjectCallback}
                onNodeClick={(node) => {
                    const n = node as GraphNode;
                    const now = Date.now();
                    const isDouble = lastClickRef.current && lastClickRef.current.id === n.id && (now - lastClickRef.current.time < 300);
                    lastClickRef.current = { id: n.id, time: now };

                    if (isDouble && onToggleCollapse) {
                        if (n.actor && n.actor.isBlackBox) {
                            onToggleCollapse(n.id.replace('blackbox-', ''));
                            return;
                        }
                        if (n.isConfiguration) {
                            onToggleCollapse(n.id.replace('config-', ''));
                            return;
                        }
                    }

                    if (n.isConfiguration) return;

                    const distance = 60;
                    const distRatio = 1 + distance / Math.hypot(n.x!, n.y!, n.z!);
                    fgRef.current?.cameraPosition(
                        { x: n.x! * distRatio, y: n.y! * distRatio, z: n.z! * distRatio },
                        n,
                        2000
                    );

                    setSelectedNode(n);
                    setSelectedLink(null);
                    if (!isOverlayPinned) setIsOverlayPinned(true);
                    onToggleSelection(n.id);
                }}
                onLinkClick={(link) => {
                    const l = link as GraphLink;
                    if (l.analysis) {
                        setSelectedLink(l.analysis);
                        setSelectedNode(null);
                    }
                }}
                onBackgroundClick={() => {
                    if (!isOverlayPinned) {
                        setSelectedNode(null);
                        setSelectedLink(null);
                    }
                }}
            />

            {selectedNode && selectedNode.actor && selectedNode.viz && (
                <OverlayDetails
                    node={selectedNode.actor}
                    viz={selectedNode.viz}
                    onClose={() => {
                        setIsOverlayPinned(false);
                        setSelectedNode(null);
                        if (selectedActorId === selectedNode.id) onToggleSelection(selectedNode.id);
                    }}
                    onPin={() => setIsOverlayPinned(!isOverlayPinned)}
                    isPinned={isOverlayPinned}
                    neighbors={nodeNeighbors}
                />
            )}

            {selectedLink && (
                <RelationshipDetail
                    relationship={selectedLink}
                    onClose={() => setSelectedLink(null)}
                />
            )}

            {!selectedNode && !selectedLink && (
                <div className="absolute bottom-4 left-4 text-xs text-slate-500 pointer-events-none">
                    Click a node or link to inspect Assemblage Metrics.
                </div>
            )}
        </div>
    );
};
