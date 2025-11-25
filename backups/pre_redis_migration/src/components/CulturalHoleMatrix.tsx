"use client";

import React from "react";
import { DiscourseCluster, CulturalHole } from "@/types/cultural";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CulturalHoleMatrixProps {
    clusters: DiscourseCluster[];
    holes: CulturalHole[];
}

export function CulturalHoleMatrix({ clusters, holes }: CulturalHoleMatrixProps) {
    if (clusters.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500">No cultural analysis data available</p>
            </div>
        );
    }

    // Helper to get hole between two clusters
    const getHole = (idA: string, idB: string) => {
        return holes.find(h =>
            (h.clusterA === idA && h.clusterB === idB) ||
            (h.clusterA === idB && h.clusterB === idA)
        );
    };

    // Helper to get color based on distance
    const getCellColor = (distance: number) => {
        if (distance < 0.2) return "bg-slate-50";
        if (distance < 0.4) return "bg-red-50";
        if (distance < 0.6) return "bg-red-100";
        if (distance < 0.8) return "bg-red-200";
        return "bg-red-300";
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[600px] p-2">
                <div className="grid" style={{
                    gridTemplateColumns: `auto repeat(${clusters.length}, minmax(60px, 1fr))`
                }}>
                    {/* Header Row */}
                    <div className="h-16"></div>
                    {clusters.map((cluster) => (
                        <div key={cluster.id} className="relative h-16 border-b border-slate-200">
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full text-center transform -rotate-45 origin-bottom text-xs font-medium text-slate-700 px-1 whitespace-nowrap">
                                {cluster.name}
                            </div>
                        </div>
                    ))}

                    {/* Matrix Rows */}
                    {clusters.map((rowCluster) => (
                        <React.Fragment key={rowCluster.id}>
                            {/* Row Header */}
                            <div className="flex items-center justify-end pr-2 py-1 border-r border-slate-200">
                                <span className="text-xs font-medium text-slate-700 text-right truncate w-24">
                                    {rowCluster.name}
                                </span>
                            </div>

                            {/* Cells */}
                            {clusters.map((colCluster) => {
                                const isDiagonal = rowCluster.id === colCluster.id;
                                const hole = getHole(rowCluster.id, colCluster.id);

                                if (isDiagonal) {
                                    return (
                                        <div key={`${rowCluster.id}-${colCluster.id}`} className="bg-slate-100 border border-white flex items-center justify-center h-12">
                                            <span className="text-xs font-bold text-slate-400">
                                                {rowCluster.size}
                                            </span>
                                        </div>
                                    );
                                }

                                if (!hole) {
                                    return (
                                        <div key={`${rowCluster.id}-${colCluster.id}`} className="bg-slate-50 border border-white h-12" />
                                    );
                                }

                                return (
                                    <TooltipProvider key={`${rowCluster.id}-${colCluster.id}`}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`${getCellColor(hole.distance)} border border-white h-12 flex items-center justify-center cursor-help transition-colors hover:opacity-80`}
                                                >
                                                    <span className="text-xs font-medium text-red-900 opacity-50">
                                                        {(hole.distance * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-md bg-white border-slate-200 shadow-lg">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="font-bold text-sm text-amber-700">💡 Cultural Gap Detected</p>
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            These discourse clusters don't "speak to each other" — they use different language and concepts.
                                                        </p>
                                                    </div>

                                                    {/* Cluster Definitions */}
                                                    <div className="text-xs space-y-2 bg-slate-50 p-2 rounded border border-slate-100">
                                                        <div>
                                                            <span className="font-semibold text-indigo-700">Cluster A:</span>{" "}
                                                            <span className="text-slate-700">
                                                                {clusters.find(c => c.id === hole.clusterA)?.name}
                                                            </span>
                                                            {clusters.find(c => c.id === hole.clusterA)?.description && (
                                                                <p className="text-slate-600 italic mt-0.5 pl-2">
                                                                    {clusters.find(c => c.id === hole.clusterA)?.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-indigo-700">Cluster B:</span>{" "}
                                                            <span className="text-slate-700">
                                                                {clusters.find(c => c.id === hole.clusterB)?.name}
                                                            </span>
                                                            {clusters.find(c => c.id === hole.clusterB)?.description && (
                                                                <p className="text-slate-600 italic mt-0.5 pl-2">
                                                                    {clusters.find(c => c.id === hole.clusterB)?.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-xs space-y-2 border-t border-slate-100 pt-2">
                                                        <p>
                                                            <span className="font-semibold text-slate-700">Gap Size:</span>{" "}
                                                            <span className="text-slate-900">{(hole.distance * 100).toFixed(0)}%</span>
                                                            <span className="text-slate-500 ml-1">
                                                                ({hole.distance > 0.7 ? "Very Large" : hole.distance > 0.4 ? "Moderate" : "Small"})
                                                            </span>
                                                        </p>

                                                        {/* Bridging Concepts with individual tooltips */}
                                                        <div>
                                                            <p className="font-semibold text-slate-700 mb-1">Bridging Ideas:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {hole.bridgingConcepts.map((bc: any, idx: number) => (
                                                                    <TooltipProvider key={idx}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 cursor-help text-xs hover:bg-blue-100 transition-colors">
                                                                                    {bc.concept}
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="max-w-xs bg-white">
                                                                                <p className="text-xs text-slate-700">{bc.explanation}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="bg-amber-50 p-2 rounded border border-amber-100 mt-2">
                                                            <p className="font-semibold text-amber-900 mb-1">🎯 Opportunity for Innovation:</p>
                                                            <p className="text-slate-700">{hole.opportunity}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-end gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-100 border border-slate-200"></div>
                        <span>Cluster Size</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            <div className="w-4 h-4 bg-slate-50"></div>
                            <div className="w-4 h-4 bg-red-50"></div>
                            <div className="w-4 h-4 bg-red-100"></div>
                            <div className="w-4 h-4 bg-red-200"></div>
                            <div className="w-4 h-4 bg-red-300"></div>
                        </div>
                        <span>Gap Distance (Low → High)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
