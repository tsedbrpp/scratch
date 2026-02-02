import React from "react";
import { AnalysisResult } from "@/types";
import { Scale } from "lucide-react";

interface LegitimacyClaimsViewProps {
    analysis: AnalysisResult;
}

export function LegitimacyClaimsView({ analysis }: LegitimacyClaimsViewProps) {
    if (!analysis.legitimacy_claims) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Scale className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Legitimacy Claims Analysis</h2>
                        <p className="text-xs text-slate-500">Justifications, sources of authority, and moral orders.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Source */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Source of Legitimacy</span>
                        <p className="text-sm font-medium text-slate-900">{analysis.legitimacy_claims.source || 'N/A'}</p>
                    </div>

                    {/* Mechanisms */}
                    <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Legitimation Mechanisms</span>
                        <p className="text-sm text-slate-700 leading-relaxed">{analysis.legitimacy_claims.mechanisms || 'N/A'}</p>
                    </div>

                    {/* Tensions */}
                    {analysis.legitimacy_claims.tensions && (
                        <div className="col-span-full bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-2">Tensions & Contradictions</span>
                            <p className="text-sm text-slate-700 italic">{analysis.legitimacy_claims.tensions}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
