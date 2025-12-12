"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { Database, Users, Scan, Network, Scale, Lightbulb, BookOpen, Activity } from 'lucide-react';

// --- Types ---
interface Node {
    id: string;
    name: string;
    href: string;
    icon: React.ElementType;
    description: string;
    color: string;
    category: 'micro' | 'meso' | 'macro';
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    fixed?: boolean;
}

interface LinkData {
    source: string; // ID of source node
    target: string; // ID of target node
}

// --- Data ---
// Re-using features data but structured for graph
const INITIAL_NODES: Omit<Node, 'x' | 'y' | 'vx' | 'vy' | 'radius'>[] = [
    // Micro: Individual, Traces, Resistance -> RED Theme
    { id: 'empirical', name: 'Empirical Data', href: '/empirical', icon: Users, description: 'Web traces & social data', color: '#ef4444', category: 'micro' },
    { id: 'resistance', name: 'Resistance', href: '/resistance', icon: Users, description: 'Micro-resistance analytics', color: '#ef4444', category: 'micro' },
    { id: 'reflexivity', name: 'Reflexivity', href: '/reflexivity', icon: Scan, description: 'Critical self-reflection', color: '#ef4444', category: 'micro' },
    { id: 'cultural', name: 'Cultural', href: '/cultural', icon: Lightbulb, description: 'Epistemic authority', color: '#ef4444', category: 'micro' },

    // Meso: Institutional, Documents, Governance -> BLUE Theme
    { id: 'docs', name: 'Documents', href: '/data', icon: Database, description: 'Archive of policy texts', color: '#3b82f6', category: 'meso' },
    { id: 'governance', name: 'Governance', href: '/governance', icon: Scale, description: 'Institutional logics', color: '#3b82f6', category: 'meso' },
    { id: 'comparison', name: 'Comparison', href: '/comparison', icon: Scale, description: 'Side-by-side frameworks', color: '#3b82f6', category: 'meso' },

    // Macro: Systemic, Ecosystem, Time -> GREEN Theme
    { id: 'ecosystem', name: 'Ecosystem', href: '/ecosystem', icon: Users, description: 'Actor network mapping', color: '#10b981', category: 'macro' },
    { id: 'synthesis', name: 'Synthesis', href: '/synthesis', icon: Network, description: 'Cross-case comparison', color: '#10b981', category: 'macro' },
    { id: 'ontology', name: 'Ontology', href: '/ontology', icon: BookOpen, description: 'Concept mapping', color: '#10b981', category: 'macro' },
    { id: 'timeline', name: 'Timeline', href: '/timeline', icon: Activity, description: 'Temporal evolution', color: '#10b981', category: 'macro' },
];

// Define relationships (assemblage connections)
const LINKS: LinkData[] = [
    { source: 'docs', target: 'governance' },
    { source: 'empirical', target: 'resistance' },
    { source: 'resistance', target: 'ecosystem' },
    { source: 'reflexivity', target: 'synthesis' },
    { source: 'ecosystem', target: 'governance' },
    { source: 'synthesis', target: 'comparison' },
    { source: 'cultural', target: 'ontology' },
    { source: 'ontology', target: 'docs' },
    { source: 'timeline', target: 'comparison' },
    { source: 'docs', target: 'empirical' },
    { source: 'resistance', target: 'reflexivity' },
    { source: 'resistance', target: 'cultural' },
    { source: 'governance', target: 'cultural' },
    { source: 'ecosystem', target: 'synthesis' }
];

// Physics Constants
const REPULSION = 1500;
const SPRING_LENGTH = 120;
const SPRING_STRENGTH = 0.05;
const CENTER_GRAVITY = 0.05;
const DAMPING = 0.9;
const DT = 1;

export function GalaxyGraph({ highResistanceCount = 0 }: { highResistanceCount?: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const requestRef = useRef<number>(0);
    const isDragging = useRef<string | null>(null);
    const mousePos = useRef<{ x: number, y: number } | null>(null);

    // Initialize nodes
    useEffect(() => {
        const initialNodes = INITIAL_NODES.map(n => ({
            ...n,
            // If high resistance is detected, the Ecosystem node becomes "Hot" (Red)
            // But now all Micro nodes are red too, so we need to be careful with visual collision.
            // Let's keep the pulse effect distinct.
            color: (n.id === 'ecosystem' && highResistanceCount > 0) ? '#ef4444' : n.color,
            x: Math.random() * 800,
            y: Math.random() * 600,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 40,
            fixed: false
        }));
        setNodes(initialNodes);
    }, [highResistanceCount]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Physics Loop
    const updatePhysics = () => {
        setNodes(prevNodes => {
            const nextNodes = prevNodes.map(n => ({ ...n }));
            const width = dimensions.width;
            const height = dimensions.height;

            // Define Gravity Centers for Categories - Adjusted to safe zones
            const centers = {
                meso: { x: width * 0.5, y: height * 0.25 },   // Top Center
                micro: { x: width * 0.25, y: height * 0.6 },  // Bottom Left (Moved Up)
                macro: { x: width * 0.75, y: height * 0.6 }   // Bottom Right (Moved Up)
            };

            // 1. Repulsion
            for (let i = 0; i < nextNodes.length; i++) {
                for (let j = i + 1; j < nextNodes.length; j++) {
                    const dx = nextNodes[i].x - nextNodes[j].x;
                    const dy = nextNodes[i].y - nextNodes[j].y;
                    const distSq = dx * dx + dy * dy || 1;
                    const dist = Math.sqrt(distSq);
                    const force = REPULSION / distSq;

                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    if (!nextNodes[i].fixed) {
                        nextNodes[i].vx += fx;
                        nextNodes[i].vy += fy;
                    }
                    if (!nextNodes[j].fixed) {
                        nextNodes[j].vx -= fx;
                        nextNodes[j].vy -= fy;
                    }
                }
            }

            // 2. Spring Forces
            LINKS.forEach(link => {
                const source = nextNodes.find(n => n.id === link.source);
                const target = nextNodes.find(n => n.id === link.target);

                if (!source || !target) return;

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - SPRING_LENGTH) * SPRING_STRENGTH;

                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                if (!source.fixed) {
                    source.vx += fx;
                    source.vy += fy;
                }
                if (!target.fixed) {
                    target.vx -= fx;
                    target.vy -= fy;
                }
            });

            // 3. Category Gravity
            nextNodes.forEach(node => {
                const target = centers[node.category];

                if (!node.fixed && isDragging.current !== node.id) {
                    node.vx += (target.x - node.x) * CENTER_GRAVITY;
                    node.vy += (target.y - node.y) * CENTER_GRAVITY;
                }

                if (isDragging.current === node.id && mousePos.current) {
                    node.x = mousePos.current.x;
                    node.y = mousePos.current.y;
                    node.vx = 0;
                    node.vy = 0;
                    node.fixed = true;
                } else if (!node.fixed) {
                    node.x += node.vx * DT;
                    node.y += node.vy * DT;
                    node.vx *= DAMPING;
                    node.vy *= DAMPING;
                }
            });

            return nextNodes;
        });

        requestRef.current = requestAnimationFrame(updatePhysics);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(requestRef.current);
    }, [dimensions]);

    // Interaction Handlers (omitted for brevity)
    const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
        isDragging.current = nodeId;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mousePos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                mousePos.current = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }
        }
    };

    const handleMouseUp = () => {
        isDragging.current = null;
        mousePos.current = null;
    };

    // Calculate center positions for labels
    const width = dimensions.width;
    const height = dimensions.height;
    const centers = {
        meso: { x: width * 0.5, y: height * 0.25 },
        micro: { x: width * 0.25, y: height * 0.6 },
        macro: { x: width * 0.75, y: height * 0.6 }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-[600px] bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-950 to-slate-950 pointer-events-none"></div>

            <svg className="w-full h-full">
                <defs>
                    <radialGradient id="grad-micro" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="grad-meso" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="grad-macro" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Zone Backgrounds */}
                <circle cx={centers.micro.x} cy={centers.micro.y} r="200" fill="url(#grad-micro)" />
                <circle cx={centers.meso.x} cy={centers.meso.y} r="200" fill="url(#grad-meso)" />
                <circle cx={centers.macro.x} cy={centers.macro.y} r="200" fill="url(#grad-macro)" />

                {/* Category Labels (Background) - Adjusted Safe Positions */}
                <text x={centers.meso.x} y={centers.meso.y - 80} textAnchor="middle" fill="#60a5fa" fontSize="36" fontWeight="900" opacity="0.4" className="select-none pointer-events-none tracking-widest">MESO: INSTITUTIONAL</text>
                <text x={centers.micro.x} y={centers.micro.y + 130} textAnchor="middle" fill="#f87171" fontSize="36" fontWeight="900" opacity="0.4" className="select-none pointer-events-none tracking-widest">MICRO: INDIVIDUAL</text>
                <text x={centers.macro.x} y={centers.macro.y + 130} textAnchor="middle" fill="#34d399" fontSize="36" fontWeight="900" opacity="0.4" className="select-none pointer-events-none tracking-widest">MACRO: SYSTEMIC</text>

                {/* Region Rings (Visual Guide) */}
                <circle cx={centers.meso.x} cy={centers.meso.y} r="180" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.1" strokeDasharray="8 8" />
                <circle cx={centers.micro.x} cy={centers.micro.y} r="180" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.1" strokeDasharray="8 8" />
                <circle cx={centers.macro.x} cy={centers.macro.y} r="180" fill="none" stroke="#059669" strokeWidth="2" opacity="0.1" strokeDasharray="8 8" />

                {/* Links */}
                {LINKS.map((link, i) => {
                    const source = nodes.find(n => n.id === link.source);
                    const target = nodes.find(n => n.id === link.target);
                    if (!source || !target) return null;

                    // Highlight link if connected to 'hot' ecosystem
                    const isHotLink = (highResistanceCount > 0) && (source.id === 'ecosystem' || target.id === 'ecosystem');

                    return (
                        <line
                            key={i}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={isHotLink ? "#ef4444" : "#475569"}
                            strokeWidth={isHotLink ? "2" : "1"}
                            strokeOpacity={isHotLink ? "0.6" : "0.4"}
                            strokeDasharray={isHotLink ? "4 4" : "0"}
                            className={isHotLink ? "animate-pulse" : ""}
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                    const Icon = node.icon;
                    const isHovered = hoveredNode === node.id;

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${node.x},${node.y})`}
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{ cursor: 'grab' }}
                        >
                            {/* Pulse Effect */}
                            <circle
                                r={node.radius + 15}
                                fill={node.color}
                                opacity="0.1"
                                className={isHovered ? "animate-ping" : "hidden"}
                            />

                            {/* Node Body */}
                            <circle
                                r={node.radius}
                                fill="#0f172a"
                                stroke={node.color}
                                strokeWidth={isHovered ? 3 : 1.5}
                                className="transition-all duration-300"
                                onDoubleClick={() => window.location.href = node.href}
                            />

                            {/* Icon */}
                            <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                                <div className="w-full h-full flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-slate-200" />
                                </div>
                            </foreignObject>

                            {/* Label */}
                            <text
                                y={node.radius + 24}
                                textAnchor="middle"
                                fill="#e2e8f0"
                                fontSize="16"
                                fontWeight="700"
                                className="pointer-events-none select-none drop-shadow-md"
                            >
                                {node.name}
                            </text>

                            {/* Category Label (Tiny) */}
                            <text
                                y={node.radius + 38}
                                textAnchor="middle"
                                fill={node.color}
                                fontSize="10"
                                className="pointer-events-none select-none uppercase tracking-wider opacity-80 font-bold"
                            >
                                {node.category}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Floating Tooltip */}
            {hoveredNode && nodes.find(n => n.id === hoveredNode) && (
                <div
                    className="absolute pointer-events-none bg-slate-900/90 border border-slate-700 p-4 rounded-lg shadow-xl backdrop-blur-sm z-50 max-w-xs transition-all duration-200"
                    style={{
                        left: (nodes.find(n => n.id === hoveredNode)?.x ?? 0) + 50,
                        top: (nodes.find(n => n.id === hoveredNode)?.y ?? 0) - 50
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${nodes.find(n => n.id === hoveredNode)?.category === 'micro' ? 'border-red-500/50 text-red-400 bg-red-950/30' :
                                nodes.find(n => n.id === hoveredNode)?.category === 'meso' ? 'border-blue-500/50 text-blue-400 bg-blue-950/30' :
                                    'border-emerald-500/50 text-emerald-400 bg-emerald-950/30'
                            }`}>
                            {nodes.find(n => n.id === hoveredNode)?.category}
                        </span>
                    </div>
                    <h4 className="font-bold text-white mb-1" style={{ color: nodes.find(n => n.id === hoveredNode)?.color }}>
                        {nodes.find(n => n.id === hoveredNode)?.name}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {nodes.find(n => n.id === hoveredNode)?.description}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest border-t border-slate-800 pt-2">
                        Double-click to open
                    </div>
                </div>
            )}

            <div className="absolute top-4 left-4 text-xs text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-slate-900">
                Drag to rearrange • Hover for details • Gravity aligns to Micro/Meso/Macro levels
            </div>
        </div>
    );
}
