"use client"

import { ResistanceArtifact, ReconfigurationAnalysis } from "@/types/resistance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Network } from "lucide-react";

interface ReconfigurationTrackerProps {
    artifact: ResistanceArtifact;
    targetPolicyTitle?: string;
}

export function ReconfigurationTracker({ artifact, targetPolicyTitle }: ReconfigurationTrackerProps) {
    const reconfig = artifact.reconfiguration_potential;

    if (!reconfig) {
        return null;
    }

    return (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="bg-purple-100/50">
                <div className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-purple-600" />
                    <CardTitle>Assemblage Reconfiguration Dynamics</CardTitle>
                </div>
                {targetPolicyTitle && (
                    <p className="text-sm text-slate-600 mt-2">
                        Target: <span className="font-semibold">{targetPolicyTitle}</span>
                    </p>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                {/* Three-Stage Flow */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {/* Before State */}
                    <div className="space-y-2">
                        <Badge className="bg-slate-200 text-slate-800">Before</Badge>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[120px]">
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                Original Configuration
                            </p>
                            <p className="text-sm text-slate-700">
                                {getBeforeState(reconfig)}
                            </p>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center">
                        <ArrowRight className="h-8 w-8 text-purple-400" />
                    </div>

                    {/* After State */}
                    <div className="space-y-2">
                        <Badge className="bg-purple-200 text-purple-800">After</Badge>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 min-h-[120px]">
                            <p className="text-xs font-semibold text-purple-600 uppercase mb-2">
                                Proposed Reconfiguration
                            </p>
                            <p className="text-sm text-slate-700">
                                {reconfig.recodes}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Intervention */}
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-xs font-semibold text-yellow-800 uppercase mb-2">
                        Resistance Intervention
                    </p>
                    <p className="text-sm text-slate-700">
                        <strong>{artifact.title}</strong> deterritorializes: {reconfig.deterritorializes}
                    </p>
                </div>

                {/* Dynamics Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {/* New Connections */}
                    {reconfig.new_connections && reconfig.new_connections.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <span className="text-blue-500">⚡</span>
                                New Connections Enabled
                            </h4>
                            <ul className="space-y-2">
                                {reconfig.new_connections.map((conn, idx) => (
                                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">→</span>
                                        <span>{conn}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Lines of Flight */}
                    {reconfig.lines_of_flight && reconfig.lines_of_flight.length > 0 && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                                <span className="text-green-500">↗</span>
                                Lines of Flight (Escape Routes)
                            </h4>
                            <ul className="space-y-2">
                                {reconfig.lines_of_flight.map((line, idx) => (
                                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                        <span className="text-green-500 mt-0.5">↗</span>
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Theoretical Insight */}
                <div className="p-5 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
                    <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                        💡 Theoretical Contribution
                    </h4>
                    <p className="text-sm text-slate-800 leading-relaxed">
                        {reconfig.theoretical_contribution}
                    </p>
                </div>

                {/* Empirical Grounding */}
                {reconfig.empirical_evidence && (
                    <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200">
                        <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">
                            Empirical Evidence
                        </h4>
                        <blockquote className="text-xs text-slate-700 italic border-l-2 border-slate-300 pl-3">
                            "{reconfig.empirical_evidence}"
                        </blockquote>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper to infer "before state" from deterritorialization
function getBeforeState(reconfig: ReconfigurationAnalysis): string {
    // Extract what was being deterritorialized as the "before" state
    return reconfig.deterritorializes;
}
