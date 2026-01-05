"use client"

import { ResistanceArtifact } from "@/types/resistance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Calendar, User } from "lucide-react";
import { DiscourseAnalyzer } from "./DiscourseAnalyzer";
import { ReconfigurationTracker } from "./ReconfigurationTracker";
import { Badge } from "@/components/ui/badge";

interface ResistanceArtifactViewProps {
    artifact: ResistanceArtifact;
    onBack: () => void;
    onUpdate?: (updatedArtifact: ResistanceArtifact) => void;
}

export function ResistanceArtifactView({ artifact, onBack, onUpdate }: ResistanceArtifactViewProps) {
    const handleAnalysisComplete = (analysis: any) => {
        const updatedArtifact = {
            ...artifact,
            frames: analysis.frames,
            rhetorical_strategies: analysis.strategies,
            reconfiguration_potential: analysis.reconfiguration
        };
        onUpdate?.(updatedArtifact);
    };
    return (
        <div className="space-y-6">
            <Button variant="ghost" className="mb-2" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Repository
            </Button>

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{artifact.title}</h2>
                        <div className="flex items-center gap-4 text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {artifact.source}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(artifact.date).toLocaleDateString()}
                            </span>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                {artifact.type.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Target Context */}
                {(artifact.target_policy || artifact.target_components.length > 0) && (
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-slate-700 mb-2">Assemblage Context:</p>
                        <div className="flex flex-wrap gap-2">
                            {artifact.target_policy && (
                                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-white">
                                    Target: {artifact.target_policy}
                                </Badge>
                            )}
                            {artifact.target_components.map((comp, idx) => (
                                <Badge key={idx} variant="outline" className="border-slate-200 text-slate-600 bg-white">
                                    {comp}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Tabs/Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Text & Context */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-400" />
                                Artifact Text
                            </h3>
                            <div className="prose prose-sm max-w-none max-h-[600px] overflow-y-auto bg-slate-50 p-4 rounded-md border border-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                {artifact.text}
                            </div>
                        </CardContent>
                    </Card>

                    {artifact.notes && (
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-lg mb-4">Field Notes</h3>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {artifact.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Analysis */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Reconfiguration Tracker (Top Priority) */}
                    <section>
                        <ReconfigurationTracker
                            artifact={artifact}
                            targetPolicyTitle={artifact.target_policy} // Pass title if we have it, ID for now
                        />
                    </section>

                    {/* Discourse Analysis Tools */}
                    <section>
                        <DiscourseAnalyzer
                            artifact={artifact}
                            onAnalysisComplete={handleAnalysisComplete}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
