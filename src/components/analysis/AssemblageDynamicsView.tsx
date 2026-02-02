import React from "react";
import { AnalysisResult } from "@/types";
import { Activity } from "lucide-react";
import { DynamicsCard } from "@/components/policy/analysis/DynamicsCard";

interface AssemblageDynamicsViewProps {
    analysis: AnalysisResult;
}

export function AssemblageDynamicsView({ analysis }: AssemblageDynamicsViewProps) {
    if (!analysis.assemblage_dynamics) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <Activity className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Assemblage Dynamics</h2>
                        <p className="text-xs text-slate-500">Analysis of territorialization, deterritorialization, and coding.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DynamicsCard
                        label="Territorialization"
                        subLabel="(Stabilization)"
                        content={analysis.assemblage_dynamics.territorialization}
                        color="teal"
                    />
                    <DynamicsCard
                        label="Deterritorialization"
                        subLabel="(Lines of Flight)"
                        content={analysis.assemblage_dynamics.deterritorialization}
                        color="cyan"
                    />
                    <div className="md:col-span-2">
                        <DynamicsCard
                            label="Coding"
                            subLabel="(Translation)"
                            content={analysis.assemblage_dynamics.coding}
                            color="emerald"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
