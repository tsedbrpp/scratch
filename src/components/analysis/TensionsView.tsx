import React from "react";
import { AnalysisResult } from "@/types";
import { calculateMicroFascismRisk } from "@/lib/risk-calculator";
import { calculateLiberatoryCapacity } from "@/lib/liberatory-calculator";
import { MicroFascismRiskCard } from "@/components/policy/analysis/MicroFascismRiskCard";
import { LiberatoryCapacityCard } from "@/components/policy/analysis/LiberatoryCapacityCard";

interface TensionsViewProps {
    analysis: AnalysisResult;
    sourceTitle?: string;
    onUpdate?: (updates: Partial<AnalysisResult>) => Promise<void>;
}

export function TensionsView({ analysis, sourceTitle, onUpdate }: TensionsViewProps) {
    // Calculators
    const riskAnalysis = calculateMicroFascismRisk(analysis);
    const liberatoryCapacity = calculateLiberatoryCapacity(analysis);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center mb-6">
                <p className="text-xs text-slate-400 uppercase tracking-widest">
                    Dialectical Reading: Hardening vs. Opening
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                <MicroFascismRiskCard
                    risk={riskAnalysis}
                    analysis={analysis}
                    sourceTitle={sourceTitle}
                    onUpdate={onUpdate}
                />
                <LiberatoryCapacityCard
                    capacity={liberatoryCapacity}
                    analysis={analysis}
                    sourceTitle={sourceTitle}
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
}
