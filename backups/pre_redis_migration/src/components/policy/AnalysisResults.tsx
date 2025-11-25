import { AnalysisResult } from "@/types";
import { Sparkles } from "lucide-react";

interface AnalysisResultsProps {
    analysis: AnalysisResult;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
    return (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 mt-1 shrink-0" />
                <div>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Key Insight</span>
                    <p className="text-sm text-slate-700 italic">"{analysis.key_insight}"</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase block mb-1">Governance & Power</span>
                    <p className="text-xs text-slate-700">{analysis.governance_power_accountability}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase block mb-1">Plurality & Inclusion</span>
                    <p className="text-xs text-slate-700">{analysis.plurality_inclusion_embodiment}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase block mb-1">Agency & Co-Design</span>
                    <p className="text-xs text-slate-700">{analysis.agency_codesign_self_determination}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase block mb-1">Reflexivity</span>
                    <p className="text-xs text-slate-700">{analysis.reflexivity_situated_praxis}</p>
                </div>
            </div>

            {analysis.legitimacy_claims && (
                <div className="mt-3 bg-amber-50 p-3 rounded-md border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase block mb-2">Legitimacy Dynamics</span>
                    <div className="space-y-2 text-xs">
                        {analysis.legitimacy_claims.source && (
                            <div>
                                <span className="font-semibold text-amber-700">Source: </span>
                                <span className="text-slate-700">{analysis.legitimacy_claims.source}</span>
                            </div>
                        )}
                        {analysis.legitimacy_claims.mechanisms && (
                            <div>
                                <span className="font-semibold text-amber-700">Mechanisms: </span>
                                <span className="text-slate-700">{analysis.legitimacy_claims.mechanisms}</span>
                            </div>
                        )}
                        {analysis.legitimacy_claims.tensions && (
                            <div>
                                <span className="font-semibold text-amber-700">Tensions: </span>
                                <span className="text-slate-700">{analysis.legitimacy_claims.tensions}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
