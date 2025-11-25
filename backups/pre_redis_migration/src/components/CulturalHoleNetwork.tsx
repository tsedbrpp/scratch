"use client";

import { useEffect, useRef } from "react";
import { DiscourseCluster, CulturalHole } from "@/types/cultural";

interface CulturalHoleNetworkProps {
    clusters: DiscourseCluster[];
    holes: CulturalHole[];
}

export function CulturalHoleNetwork({ clusters, holes }: CulturalHoleNetworkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || clusters.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate positions for clusters (circular layout)
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;

        const positions = clusters.map((_, i) => {
            const angle = (i / clusters.length) * 2 * Math.PI - Math.PI / 2;
            return {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            };
        });

        // Draw connections (holes) first
        holes.forEach((hole) => {
            const indexA = clusters.findIndex((c) => c.id === hole.clusterA);
            const indexB = clusters.findIndex((c) => c.id === hole.clusterB);

            if (indexA === -1 || indexB === -1) return;

            const posA = positions[indexA];
            const posB = positions[indexB];

            // Color based on gap size
            const alpha = hole.distance; // Larger distance = more opaque
            ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.5})`; // Red with transparency
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line for gaps

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.lineTo(posB.x, posB.y);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash
        });

        // Draw clusters as nodes
        clusters.forEach((cluster, i) => {
            const pos = positions[i];
            const nodeRadius = 20 + cluster.size * 3; // Size based on number of themes

            // Draw node circle
            ctx.fillStyle = "#3b82f6"; // Blue
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Draw border
            ctx.strokeStyle = "#1e40af";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            ctx.fillStyle = "#1e293b";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";

            // Truncate long names
            const maxLength = 20;
            const displayName = cluster.name.length > maxLength
                ? cluster.name.substring(0, maxLength) + "..."
                : cluster.name;

            ctx.fillText(displayName, pos.x, pos.y + nodeRadius + 5);

            // Draw theme count
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px sans-serif";
            ctx.textBaseline = "middle";
            ctx.fillText(cluster.size.toString(), pos.x, pos.y);
        });
    }, [clusters, holes]);

    if (clusters.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500">No cultural analysis data available</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border border-slate-200 rounded-lg bg-white"
            />
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-700"></div>
                    <span>Discourse Cluster</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 border-t-2 border-dashed border-red-500"></div>
                    <span>Cultural Hole (Gap)</span>
                </div>
            </div>
        </div>
    );
}
