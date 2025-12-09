"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CulturalHole, BridgingConcept } from "@/types/cultural";
import { Lightbulb, ArrowRight, FileText } from "lucide-react";

interface CulturalHoleCardProps {
    hole: CulturalHole;
    clusters: Array<{ id: string; name: string; themes: string[]; description?: string }>;
}

export function CulturalHoleCard({ hole, clusters }: CulturalHoleCardProps) {
    const clusterA = clusters.find((c) => c.name === hole.clusterA);
    const clusterB = clusters.find((c) => c.name === hole.clusterB);

    if (!clusterA || !clusterB) return null;

    // Color code by distance (gap size)
    const gapColor =
        hole.distance > 0.7
            ? "bg-red-50 border-red-200"
            : hole.distance > 0.5
                ? "bg-orange-50 border-orange-200"
                : "bg-yellow-50 border-yellow-200";

    const badgeColor =
        hole.distance > 0.7
            ? "bg-red-100 text-red-700"
            : hole.distance > 0.5
                ? "bg-orange-100 text-orange-700"
                : "bg-yellow-100 text-yellow-700";

    return (
        <Card className={`${gapColor} border-2`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900">
                        Cultural Hole Detected
                    </CardTitle>
                    <Badge className={badgeColor}>
                        Gap: {(hole.distance * 100).toFixed(0)}%
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Cluster Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div className="bg-white p-3 rounded-md border border-slate-200">
                        <span className="text-xs font-bold text-slate-600 uppercase block mb-1">
                            Cluster A
                        </span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-sm font-semibold text-slate-900 mb-2 cursor-help underline decoration-dotted">
                                        {clusterA.name}
                                    </p>
                                </TooltipTrigger>
                                {clusterA.description && (
                                    <TooltipContent className="max-w-xs bg-white">
                                        <p className="text-xs text-slate-700">{clusterA.description}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <div className="flex flex-wrap gap-1">
                            {clusterA.themes.filter(theme => theme !== clusterA.name).slice(0, 3).map((theme, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                    {theme}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowRight className="h-6 w-6 text-slate-400" />
                    </div>

                    <div className="bg-white p-3 rounded-md border border-slate-200">
                        <span className="text-xs font-bold text-slate-600 uppercase block mb-1">
                            Cluster B
                        </span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-sm font-semibold text-slate-900 mb-2 cursor-help underline decoration-dotted">
                                        {clusterB.name}
                                    </p>
                                </TooltipTrigger>
                                {clusterB.description && (
                                    <TooltipContent className="max-w-xs bg-white">
                                        <p className="text-xs text-slate-700">{clusterB.description}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <div className="flex flex-wrap gap-1">
                            {clusterB.themes.filter(theme => theme !== clusterB.name).slice(0, 3).map((theme, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                    {theme}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bridging Concepts */}
                {hole.bridgingConcepts.length > 0 && (
                    <div className="bg-white p-3 rounded-md border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 uppercase">
                                Bridging Concepts
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {hole.bridgingConcepts.map((bc: BridgingConcept, i: number) => (
                                <TooltipProvider key={i}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                className="bg-amber-100 text-amber-800 border-amber-300 cursor-help"
                                            >
                                                {bc.concept}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs bg-white">
                                            <p className="text-xs text-slate-700">{bc.explanation}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>
                )}

                {/* Opportunity */}
                {hole.opportunity && (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <span className="text-xs font-bold text-blue-700 uppercase block mb-1">
                            Innovation Opportunity
                        </span>
                        <p className="text-sm text-slate-700">{hole.opportunity}</p>
                    </div>
                )}

                {/* Policy Implication */}
                {hole.policyImplication && (
                    <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-bold text-purple-700 uppercase">
                                Policy Implication
                            </span>
                        </div>
                        <p className="text-sm text-slate-700">{hole.policyImplication}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
