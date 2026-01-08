import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDown, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

interface ActorChange {
    name: string;
    change: string;
    impact: "High" | "Medium" | "Low";
    previousState?: string;
    newState?: string;
}

interface TimelineStep {
    step: number;
    time: string;
    description: string;
    changes: ActorChange[];
}

interface ComplianceTimelineProps {
    timeline: TimelineStep[];
}

export function ComplianceTimeline({ timeline }: ComplianceTimelineProps) {
    if (!timeline || timeline.length === 0) return null;

    return (
        <Card className="h-full overflow-y-auto">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Phase Transition Simulation
                </CardTitle>
                <CardDescription>
                    Projected cascade of effects on the ecosystem.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                    {timeline.map((step, index) => (
                        <div key={index} className="relative pl-6">
                            {/* Dot */}
                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-indigo-600" />

                            {/* Content */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                        Step {step.step} • {step.time}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 font-medium">
                                    {step.description}
                                </p>

                                {/* Changes */}
                                {step.changes && step.changes.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {step.changes.map((change, i) => (
                                            <div key={i} className="bg-slate-50 p-2 rounded text-xs border border-slate-100 flex items-start gap-2">
                                                <ImpactIcon impact={change.impact} />
                                                <div>
                                                    <span className="font-semibold text-slate-800">{change.name}</span>
                                                    <div className="text-slate-600 mt-0.5">{change.change}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* End Marker */}
                    <div className="relative pl-6">
                        <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-slate-300" />
                        <span className="text-xs text-slate-400 italic">Singularity Stabilized</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ImpactIcon({ impact }: { impact: string }) {
    if (impact === "High") return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    if (impact === "Low") return <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />;
    return <ArrowDown className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />;
}
