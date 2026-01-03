"use client";

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AssemblageNetwork {
    nodes: string[];
    edges: { from: string; to: string; type: string }[];
}

interface RhizomeNetworkProps {
    network: AssemblageNetwork;
}

export function RhizomeNetwork({ network }: RhizomeNetworkProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                primaryColor: '#e0e7ff',
                primaryTextColor: '#1e1b4b',
                primaryBorderColor: '#6366f1',
                lineColor: '#64748b',
                secondaryColor: '#f0fdf4',
                tertiaryColor: '#fef2f2',
            },
            flowchart: {
                curve: 'basis'
            }
        });
    }, []);

    useEffect(() => {
        if (!network || !chartRef.current) return;

        const renderChart = async () => {
            try {
                // Construct Mermaid definition
                let def = 'graph TD\n';

                // Add styling
                def += 'classDef policy fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b;\n';
                def += 'classDef ancestor fill:#f0fdf4,stroke:#22c55e,stroke-width:1px,color:#15803d;\n';
                def += 'classDef other fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#475569;\n';

                // Add edges
                network.edges.forEach((edge, i) => {
                    const safeFrom = edge.from.replace(/[^a-zA-Z0-9]/g, '_');
                    const safeTo = edge.to.replace(/[^a-zA-Z0-9]/g, '_');
                    // Add labels
                    def += `${safeFrom}["${edge.from}"] -->|"${edge.type}"| ${safeTo}["${edge.to}"]\n`;
                });

                // Apply classes via heuristic (Basic: ancestors likely roots without incoming)
                // For now, apply policy class to all
                network.nodes.forEach(node => {
                    const safeId = node.replace(/[^a-zA-Z0-9]/g, '_');
                    if (node.includes("OECD") || node.includes("GDPR") || node.includes("UNESCO")) {
                        def += `class ${safeId} ancestor;\n`;
                    } else {
                        def += `class ${safeId} policy;\n`;
                    }
                });

                chartRef.current!.innerHTML = '';
                const { svg } = await mermaid.render(`rhizome-${Date.now()}`, def);
                chartRef.current!.innerHTML = svg;

            } catch (error) {
                console.error("Mermaid render failed:", error);
                if (chartRef.current) {
                    chartRef.current.innerHTML = '<p class="text-sm text-red-500">Failed to render network graph.</p>';
                }
            }
        };

        renderChart();
    }, [network]);

    const handleDownload = () => {
        if (!chartRef.current) return;
        const svgElement = chartRef.current.querySelector('svg');
        if (!svgElement) return;

        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        // Prepare Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Get dimensions from SVG or fallback
        const svgWidth = svgElement.viewBox.baseVal.width || 800;
        const svgHeight = svgElement.viewBox.baseVal.height || 600;

        // Scale up for better resolution
        const scale = 2;
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;

        img.onload = () => {
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height); // White background
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Trigger Download
                const link = document.createElement('a');
                link.download = `assemblage-rhizome-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    };

    if (!network || network.nodes.length === 0) return null;

    return (
        <Card className="border-indigo-100 shadow-sm overflow-hidden h-full">
            <CardHeader className="bg-indigo-50/50 pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="text-base font-semibold text-indigo-900 flex items-center gap-2">
                        <Network className="h-5 w-5 text-indigo-600" />
                        Assemblage Rhizome
                    </CardTitle>
                    <CardDescription>
                        Tracing shared ancestry and inter-referential citations.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 h-8">
                    <Download className="h-3.5 w-3.5 text-indigo-600" />
                    Export Map
                </Button>
            </CardHeader>
            <CardContent className="p-4 bg-white flex items-center justify-center min-h-[400px] overflow-auto">
                <div ref={chartRef} className="w-full flex justify-center" />
            </CardContent>
        </Card>
    );
}
