"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ForceGraph3D to avoid server-side rendering issues
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
    ssr: false,
});

interface GraphNode {
    id: string;
    val: number;
    color: string;
    isCenter?: boolean;
    clusterId?: number;
}

interface GraphLink {
    source: string;
    target: string;
    distance?: number;
    color?: string;
}

export function HeroGraph() {
    const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
    const [isMounted, setIsMounted] = useState(false);
    const graphRef = useRef<any>(null);

    useEffect(() => {
        setIsMounted(true);

        // Generate "Assemblage" Clusters
        // distinct territories (clusters) that have internal density but loose external couplings
        const clusters = [
            { id: 0, color: "#10b981", name: "Policy" },     // Emerald
            { id: 1, color: "#3b82f6", name: "Resistance" }, // Blue
            { id: 2, color: "#a855f7", name: "Tech" },       // Purple
            { id: 3, color: "#f59e0b", name: "Discourse" },  // Amber
        ];

        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];
        const N_PER_CLUSTER = 15;

        clusters.forEach((cluster) => {
            // Create center of gravity for the cluster
            const centerId = `center-${cluster.id}`;
            nodes.push({
                id: centerId,
                val: 20, // Huge anchor node
                color: cluster.color,
                isCenter: true
            });

            // Create satellite nodes
            for (let i = 0; i < N_PER_CLUSTER; i++) {
                const nodeId = `${cluster.id}-${i}`;
                nodes.push({
                    id: nodeId,
                    val: Math.random() * 5 + 2, // Heterogeneous sizes
                    color: cluster.color,
                    clusterId: cluster.id
                });

                // Connect to center (Strong Gravity)
                links.push({
                    source: nodeId,
                    target: centerId,
                    distance: 20
                });

                // Random intra-cluster connections (Rhizomatic structure)
                if (Math.random() > 0.6) {
                    const targetId = `${cluster.id}-${Math.floor(Math.random() * N_PER_CLUSTER)}`;
                    if (targetId !== nodeId) {
                        links.push({
                            source: nodeId,
                            target: targetId
                        });
                    }
                }
            }
        });

        // Create "Lines of Flight" (Inter-cluster connections)
        // Connect clusters to each other sparsely to show translation
        clusters.forEach((sourceCluster) => {
            clusters.forEach((targetCluster) => {
                if (sourceCluster.id !== targetCluster.id && Math.random() > 0.7) {
                    const sourceNode = `${sourceCluster.id}-${Math.floor(Math.random() * N_PER_CLUSTER)}`;
                    const targetNode = `${targetCluster.id}-${Math.floor(Math.random() * N_PER_CLUSTER)}`;
                    links.push({
                        source: sourceNode,
                        target: targetNode,
                        color: "rgba(255,255,255,0.1)", // Fainter lines for translation
                    });
                }
            });
        });

        setData({ nodes, links });
    }, []);

    // Handle Window Resize
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setDimensions({ width: window.innerWidth, height: 800 });
            };

            handleResize();

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Animation Frame Loop
    useEffect(() => {
        let frameId: number;
        let angle = 0;

        const animate = () => {
            if (graphRef.current) {
                angle += 0.002;
                graphRef.current.cameraPosition({
                    x: 200 * Math.sin(angle),
                    z: 200 * Math.cos(angle),
                    y: 50 * Math.sin(angle * 2),
                });
            }
            frameId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, []);

    if (!isMounted) return null;

    return (
        <div className="absolute inset-0 -z-20 opacity-30 pointer-events-none">
            <ForceGraph3D
                ref={graphRef}
                graphData={data}
                backgroundColor="rgba(0,0,0,0)" // Transparent
                nodeLabel={() => ""} // No tooltips for clean bg
                nodeColor="color"
                linkColor={() => "rgba(255,255,255,0.2)"}
                showNavInfo={false}
                enableNodeDrag={false}
                width={dimensions.width}
                height={dimensions.height} // Approximate hero height
            />
        </div>
    );
}
