"use client";

import { useEffect, useRef, useCallback } from "react";
import { DiscourseCluster, CulturalHole } from "@/types/cultural";

interface CulturalHoleNetworkProps {
    clusters: DiscourseCluster[];
    holes: CulturalHole[];
    isLive?: boolean;
}

export function CulturalHoleNetwork({ clusters, holes, isLive = false }: CulturalHoleNetworkProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const timeRef = useRef<number>(0);

    const drawNetwork = useCallback((canvas: HTMLCanvasElement, width: number, height: number, time: number) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate positions for clusters (circular layout)
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.3;

        const positions = clusters.map((_, i) => {
            const angle = (i / clusters.length) * 2 * Math.PI - Math.PI / 2;

            // Add subtle movement if live
            const driftX = isLive ? Math.sin(time + i) * 10 : 0;
            const driftY = isLive ? Math.cos(time + i * 2) * 10 : 0;

            // Add "breathing" radius
            const breathingRadius = isLive ? radius + Math.sin(time * 0.5) * 5 : radius;

            return {
                x: centerX + breathingRadius * Math.cos(angle) + driftX,
                y: centerY + breathingRadius * Math.sin(angle) + driftY,
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
            const alpha = hole.distance;

            // Draw glow effect
            ctx.shadowBlur = isLive ? 15 + Math.sin(time * 2) * 5 : 10;
            ctx.shadowColor = `rgba(239, 68, 68, ${alpha * 0.5})`;

            ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.8})`; // Red with transparency
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 6]); // Dashed line for gaps

            // Animate dash offset
            ctx.lineDashOffset = isLive ? -time * 10 : 0;

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.lineTo(posB.x, posB.y);
            ctx.stroke();

            ctx.setLineDash([]); // Reset dash
            ctx.shadowBlur = 0; // Reset shadow
        });

        // Draw clusters as nodes
        clusters.forEach((cluster, i) => {
            const pos = positions[i];
            const nodeRadius = 25 + cluster.size * 2;

            // Draw node shadow
            ctx.shadowBlur = isLive ? 20 + Math.sin(time * 3) * 5 : 15;
            ctx.shadowColor = "rgba(59, 130, 246, 0.4)";
            ctx.shadowOffsetY = 4;

            // Draw node circle (Gradient)
            const gradient = ctx.createRadialGradient(pos.x - nodeRadius / 3, pos.y - nodeRadius / 3, nodeRadius / 10, pos.x, pos.y, nodeRadius);
            gradient.addColorStop(0, "#60a5fa"); // Light blue
            gradient.addColorStop(1, "#2563eb"); // Blue

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Reset shadow
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Draw border
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw label background (pill)
            ctx.font = "bold 13px Inter, sans-serif";
            const maxLength = 25;
            const displayName = cluster.name.length > maxLength
                ? cluster.name.substring(0, maxLength) + "..."
                : cluster.name;

            const textMetrics = ctx.measureText(displayName);
            const textWidth = textMetrics.width;
            const textHeight = 16;
            const padding = 8;

            const labelY = pos.y + nodeRadius + 15;

            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.roundRect(pos.x - textWidth / 2 - padding, labelY, textWidth + padding * 2, textHeight + padding, 6);
            ctx.fill();
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw label text
            ctx.fillStyle = "#1e293b";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(displayName, pos.x, labelY + padding / 2);

            // Draw theme count inside node
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Inter, sans-serif";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.shadowBlur = 2;
            ctx.fillText(cluster.size.toString(), pos.x, pos.y);
            ctx.shadowBlur = 0;
        });
    }, [clusters, holes, isLive]);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas || clusters.length === 0) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            canvas.width = width;
            canvas.height = height;
            // Initial draw
            drawNetwork(canvas, width, height, 0);
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [clusters, holes, drawNetwork]);

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isLive) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            // Reset to static state
            if (canvas) drawNetwork(canvas, canvas.width, canvas.height, 0);
            return;
        }

        const animate = () => {
            timeRef.current += 0.01;
            drawNetwork(canvas, canvas.width, canvas.height, timeRef.current);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isLive, drawNetwork]);

    if (clusters.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500">No cultural analysis data available</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
            <canvas
                ref={canvasRef}
                className="w-full h-full rounded-lg bg-slate-50/50"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-slate-600 bg-white/80 p-2 rounded-lg backdrop-blur-sm border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></div>
                    <span>Cluster</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 border-t-2 border-dashed border-red-500"></div>
                    <span>Cultural Hole</span>
                </div>
                {isLive && (
                    <div className="flex items-center gap-2 text-indigo-600 font-medium animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>Live Assemblage</span>
                    </div>
                )}
            </div>
        </div>
    );
}
