import React from "react";
import { Eye } from "lucide-react";
import { AnalysisResult } from "@/types";

interface SystemCritiqueSectionProps {
    critique: NonNullable<AnalysisResult['system_critique']>;
}

export function SystemCritiqueSection({ critique }: SystemCritiqueSectionProps) {
    return (
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 overflow-hidden">
            <div className="bg-purple-100/50 px-4 py-3 border-b border-purple-200 flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-700" />
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">System Reflexivity (Devil&apos;s Advocate)</h4>
            </div>
            <div className="p-4 space-y-4">
                {critique.blind_spots && critique.blind_spots.length > 0 && (
                    <div>
                        <h5 className="text-[10px] font-bold text-purple-600 uppercase mb-1">Potential Blind Spots</h5>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                            {critique.blind_spots.map((spot, i) => (
                                <li key={i}>{spot}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {critique.over_interpretation && (
                    <div>
                        <h5 className="text-[10px] font-bold text-purple-600 uppercase mb-1">Risk of Over-Interpretation</h5>
                        <p className="text-xs text-slate-700 leading-relaxed italic">
                            &quot;{critique.over_interpretation}&quot;
                        </p>
                    </div>
                )}
                {critique.legitimacy_correction && (
                    <div className="bg-white p-3 rounded-lg border border-purple-100">
                        <h5 className="text-[10px] font-bold text-purple-600 uppercase mb-1">Legitimacy Narrative Challenge</h5>
                        <p className="text-xs text-slate-700">
                            {critique.legitimacy_correction}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
