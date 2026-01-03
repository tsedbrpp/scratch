import { AnalysisResult } from "@/types";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export function VerifiedEvidenceSection({ quotes }: { quotes: NonNullable<AnalysisResult['verified_quotes']> }) {
    const verifiedCount = quotes.filter(q => q.verified).length;
    const score = Math.round((verifiedCount / quotes.length) * 100);

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className={`h-4 w-4 ${score === 100 ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Fact-Tracer</h4>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Grounding Score:</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${score === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {score}%
                    </span>
                </div>
            </div>
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                {quotes.map((q, i) => (
                    <div key={i} className={`flex gap-3 p-3 rounded-lg border text-xs ${q.verified ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                        <div className="shrink-0 mt-0.5">
                            {q.verified ?
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> :
                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                            }
                        </div>
                        <div className="space-y-1">
                            <p className={`font-mono leading-relaxed ${q.verified ? 'text-emerald-900' : 'text-red-900'}`}>
                                &quot;{q.text}&quot;
                            </p>
                            <div className="flex items-center gap-2">
                                {!q.verified && (
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                                        Hallucination Warning: Text not found in source
                                    </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Source: {q.context}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
