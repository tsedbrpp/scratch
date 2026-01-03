import { AnalysisResult } from "@/types";
import { Network } from "lucide-react";

export function CulturalHolesSection({ holes }: { holes: NonNullable<AnalysisResult['holes']> }) {
    return (
        <div className="space-y-4">
            {holes.map((hole, i) => (
                <div key={i} className="rounded-xl border border-indigo-200 bg-indigo-50/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-indigo-200 flex items-center justify-between bg-indigo-100/30">
                        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Cultural Hole: {hole.concept}</h4>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase">Between {hole.between.join(' & ')}</span>
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-xs text-slate-700">{hole.description}</p>

                        {hole.prediction_scenarios && (
                            <div className="space-y-2">
                                <h5 className="text-[10px] font-bold text-indigo-500 uppercase">Scenario Forecasts (&quot;Betting&quot;)</h5>
                                {hole.prediction_scenarios.map((pred, j) => (
                                    <div key={j} className="flex items-start gap-2 text-xs bg-white p-2 rounded border border-indigo-100">
                                        <Network className="h-3 w-3 mt-0.5 text-indigo-400 shrink-0" />
                                        <div>
                                            <p className="text-indigo-900 font-medium">{pred.scenario}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-400 uppercase">Likelihood: {pred.likelihood}%</span>
                                                <span className="text-[10px] text-slate-400 uppercase">Indicator: {pred.indicator}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
