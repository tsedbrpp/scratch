"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { getActorColor } from '@/lib/ecosystem-utils';

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
}



// --- Types ---
interface GraphNode {
    id: string;
    name: string;
    type: string;
    val: number;
    color: string;
    isConfiguration: boolean;
    x?: number; actor?: EcosystemActor;
    y?: number;
    z?: number;
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    type: "Strong" | "Porous" | "LabelTether" | "Standard";
    color?: string;
    label?: string;
    distance?: number;
}

// --- Helper: Create Text Sprite for Labels ---
const createTextSprite = (text: string, color: string, fontSize: number = 24) => {
    if (typeof document === 'undefined') return new THREE.Mesh();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return new THREE.Mesh();

    const font = `Bold ${fontSize}px Inter, sans-serif`;
    context.font = font;

    // Measure
    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    // Resize canvas
    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    // Background Pill
    context.font = font;
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(0, 0, canvas.width, canvas.height, 10);
    context.fill();

    // Text
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

// @ts-ignore
// import { forceZ } from 'd3-force-3d'; // Removed broken import



// ... (existing imports)

export function EcosystemMap3D({ actors, configurations, selectedForGrouping, onToggleSelection, width, height, isStratumMode }: EcosystemMap3DProps) {
    const fgRef = useRef<any>(null);
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
    const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);



    useEffect(() => {
        // 1. Map real actors
        // ... (rest of existing useEffect)

        // Define vertical layers helper
        const getZLevel = (type: string) => {
            const t = type.toLowerCase();
            if (t === 'legalobject' || t === 'law' || t === 'regulation') return 150;
            if (t === 'policymaker' || t === 'government') return 80;
            if (t === 'civilsociety' || t === 'academic') return 20;
            if (t === 'startup' || t === 'private') return -40;
            if (t === 'algorithmicagent' || t === 'algorithm') return -80;
            if (t === 'infrastructure') return -120;
            return 0;
        };

        const nodes: GraphNode[] = actors.map(actor => {
            const baseNode = {
                id: actor.id,
                name: actor.name,
                type: actor.type,
                val: selectedForGrouping.includes(actor.id) ? 20 : 10,
                color: getActorColor(actor.type),
                isConfiguration: false,
                actor: actor
            };

            // Apply Stratum Logic directly during creation
            if (isStratumMode) {
                (baseNode as any).fz = getZLevel(actor.type);
                (baseNode as any).z = getZLevel(actor.type); // Set initial Z too to prevent flying
            }

            return baseNode;
        });

        // 2. Generate Links
        const links: GraphLink[] = [];

        actors.forEach((source, i) => {
            actors.forEach((target, j) => {
                if (i >= j) return;

                const sharedConfig = configurations.find(c => c.memberIds.includes(source.id) && c.memberIds.includes(target.id));

                if (sharedConfig) {
                    links.push({
                        source: source.id,
                        target: target.id,
                        type: "Strong",
                        color: sharedConfig.color,
                        label: sharedConfig.name
                    });
                } else if (source.type === target.type && Math.random() > 0.9) {
                    links.push({
                        source: source.id,
                        target: target.id,
                        type: "Porous",
                        color: "#CBD5E1"
                    });
                }
            });
        });

        // 3. Add "Configuration Label" Nodes
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
                        color: "transparent",
                        distance: 50
                    });
                }
            });
        });

        setGraphData({ nodes, links });
    }, [actors, configurations, selectedForGrouping, isStratumMode]);

    // Focus link camera behavior
    const focusLink = (link: GraphLink) => {
        const source = link.source as GraphNode;
        const target = link.target as GraphNode;
        if (!source.x || !target.x) return;

        const mx = (source.x! + target.x!) / 2;
        const my = (source.y! + target.y!) / 2;
        const mz = (source.z! + target.z!) / 2;

        const dist = 50;
        fgRef.current?.cameraPosition(
            { x: mx + dist, y: my + dist, z: mz + dist },
            { x: mx, y: my, z: mz },
            1000
        );
    };

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <ForceGraph3D
                ref={fgRef}
                width={width}
                height={height}
                graphData={graphData}
                nodeLabel="name"
                nodeColor="color"
                nodeResolution={16}
                nodeOpacity={0.9}
                backgroundColor="#FAFAFA"

                // Link Styling
                linkWidth={(link: any) => {
                    const l = link as GraphLink;
                    if (l.type === "LabelTether") return 0; // Invisible
                    if (l === selectedLink) return 3; // Highlight selected
                    if (l.type === "Strong") return 2;
                    return 0.5; // Porous
                }}
                linkColor={(link: any) => {
                    const l = link as GraphLink;
                    if (l.type === "LabelTether") return 'rgba(0,0,0,0)';
                    if (l === selectedLink) return '#F43F5E'; // Red highlight
                    return l.color || "#CBD5E1";
                }}
                linkOpacity={0.6}
                linkDirectionalParticles={(link: any) => {
                    const l = link as GraphLink;
                    return l === selectedLink ? 4 : (l.type === "Porous" ? 2 : 0);
                }}
                linkDirectionalParticleWidth={selectedLink ? 3 : 2}
                linkDirectionalParticleSpeed={0.005}

                // 3D Objects
                nodeThreeObjectExtend={true} // Allow default sphere + custom object? No, we replace or extend.
                // We'll replace default rendering for Configuration nodes, and specific behavior for others if needed.
                // Actually nodeThreeObject replaces the node. If extend is true, it adds TO the node.
                // Let's set extend=false mostly, or handle complex logic.
                // Simplest: Replace everything so we have full control.
                nodeThreeObject={(node: any) => {
                    const n = node as GraphNode; // Cast for now as library types can be loose
                    if (n.isConfiguration) {
                        return createTextSprite(n.name, n.color);
                    }

                    // Standard Actor Node
                    const group = new THREE.Group();
                    let geometry;
                    const normalizedType = n.type.toLowerCase().trim();

                    if (normalizedType === 'algorithmicagent' || normalizedType === 'algorithm') {
                        // Tetrahedron for AI/Algorithms (Platonic solid, mathematical)
                        geometry = new THREE.TetrahedronGeometry(n.val / 2);
                    } else if (normalizedType === 'legalobject' || normalizedType === 'law' || normalizedType === 'regulation') {
                        // Box for Legal Objects (Structure, firmness)
                        geometry = new THREE.BoxGeometry(n.val / 1.5, n.val / 1.5, n.val / 1.5);
                    } else if (normalizedType === 'infrastructure') {
                        // Octahedron for Infrastructure (Networked stability)
                        geometry = new THREE.OctahedronGeometry(n.val / 2);
                    } else {
                        // Default Sphere for human/institutional actors
                        geometry = new THREE.SphereGeometry(n.val / 2, 16, 16);
                    }

                    const material = new THREE.MeshLambertMaterial({
                        color: n.color,
                        transparent: true,
                        opacity: 0.9
                    });
                    const mesh = new THREE.Mesh(geometry, material);
                    group.add(mesh);



                    return group;
                }}
                onNodeClick={(node: any) => {
                    const n = node as GraphNode;
                    if (n.isConfiguration) return; // Ignore clicks on labels

                    // Zoom to node
                    const distance = 40;
                    const distRatio = 1 + distance / Math.hypot(n.x!, n.y!, n.z!);

                    fgRef.current?.cameraPosition(
                        { x: n.x! * distRatio, y: n.y! * distRatio, z: n.z! * distRatio }, // new position
                        n, // lookAt ({ x, y, z })
                        3000  // ms transition duration
                    );
                    onToggleSelection(n.id);
                    setSelectedLink(null); // Clear link selection
                }}
                onLinkClick={(link: any) => {
                    const l = link as GraphLink;
                    if (l.type === "LabelTether") return;
                    setSelectedLink(l);
                    focusLink(l);
                }}
                onBackgroundClick={() => setSelectedLink(null)}
                cooldownTicks={100}
            />

            {/* Link Details Card Overlay */}
            {selectedLink && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-lg p-4 w-72 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Connection Details</h4>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                ${selectedLink.type === "Strong" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                                {selectedLink.type === "Strong" ? "Strong Assemblage" : "Porous / Weak"}
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedLink(null)}
                            className="text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex flex-col items-center flex-1">
                                <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: getActorColor((selectedLink.source as GraphNode).type) }} />
                                <span className="text-slate-800 font-medium text-center leading-tight">{(selectedLink.source as GraphNode).name}</span>
                            </div>

                            <div className="px-2 text-slate-300">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>

                            <div className="flex flex-col items-center flex-1">
                                <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: getActorColor((selectedLink.target as GraphNode).type) }} />
                                <span className="text-slate-800 font-medium text-center leading-tight">{(selectedLink.target as GraphNode).name}</span>
                            </div>
                        </div>

                        {selectedLink.label && (
                            <div className="bg-slate-50 rounded p-2 text-xs border border-slate-100">
                                <span className="font-semibold text-slate-500">Context: </span>
                                <span className="text-slate-700" style={{ color: selectedLink.color !== "#CBD5E1" ? selectedLink.color : undefined }}>
                                    {selectedLink.label}
                                </span>
                            </div>
                        )}

                        <div className="text-[10px] text-slate-400 italic text-center border-t border-slate-100 pt-2">
                            {selectedLink.type === "Strong"
                                ? "High translation intensity & resource exchange."
                                : "Loose coupling or information flow only."}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


