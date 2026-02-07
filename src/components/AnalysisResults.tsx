"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, Target, Lightbulb } from "lucide-react";
import { TransparencyPanel } from "./analysis/TransparencyPanel";
import { TransparencyService } from "@/services/transparency-service";
import { AIAuditPanel } from "./analysis/AIAuditPanel";
import { AnalysisResult as SharedAnalysisResult } from "@/types";

// Extend the shared type with DSF-specific fields used in this component
interface AnalysisResult extends SharedAnalysisResult {
    situated_teleology?: string;
    normative_attractors?: string;
    blind_spots?: string;
}

interface AnalysisResultsProps {
    analysis: AnalysisResult;
    sourceTitle: string;
}

export function AnalysisResults({ analysis, sourceTitle }: AnalysisResultsProps) {
    return (
        <Card className="mt-4 border-purple-200 bg-purple-50/30">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">DSF Lens Analysis</CardTitle>
                </div>
                <CardDescription>Decolonial Situatedness Framework interpretation of {sourceTitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {analysis.key_insight && (
                    <div className="p-4 bg-purple-100 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-2">
                            <Lightbulb className="h-5 w-5 text-purple-700 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-purple-900 text-sm mb-1">Key Insight</p>
                                <p className="text-sm text-purple-800">{analysis.key_insight}</p>
                            </div>
                        </div>
                    </div>
                )}

                {analysis.situated_teleology && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Situated Teleology
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed pl-6">
                            {analysis.situated_teleology}
                        </p>
                    </div>
                )}

                {analysis.normative_attractors && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4 text-green-600" />
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Normative Attractors
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed pl-6">
                            {analysis.normative_attractors}
                        </p>
                    </div>
                )}

                {analysis.blind_spots && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Colonial/Crip Blind Spots
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed pl-6">
                            {analysis.blind_spots}
                        </p>
                    </div>
                )}

                {analysis.raw_response && !analysis.key_insight && (
                    <div className="space-y-2">
                        <Badge variant="outline">Full Analysis</Badge>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {analysis.raw_response}
                        </p>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-purple-200">
                    <TransparencyPanel
                        metadata={TransparencyService.getEpistemicAsymmetryTransparency()}
                    />
                </div>

                <AIAuditPanel
                    analysis={analysis}
                    onFlagResult={(reason) => console.log('Flagged:', reason)}
                    onForkPrompt={async (newContent) => console.log('Forking:', newContent)}
                />
            </CardContent>
        </Card>
    );
}
