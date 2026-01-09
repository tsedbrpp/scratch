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


                    </div>
                </div>
            ))}
        </div>
    );
}
