import { AnalysisResult } from "@/types";
import { ShieldCheck, Eye, Gavel, FileText, Lock } from "lucide-react";

export function VerificationPathwaysTable({ pathways }: { pathways: NonNullable<AnalysisResult['verification_pathways']> }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verification Pathway Extractor</h4>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Auditability Score:</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pathways.score > 70 ? 'bg-emerald-100 text-emerald-700' : (pathways.score > 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}`}>
                        {pathways.score}/100
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {/* Visibility */}
                <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase">Visibility</span>
                    </div>
                    {pathways.visibility.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {pathways.visibility.map((item, i) => (
                                <span key={i} className="inline-flex px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                                    {item}
                                </span>
                            ))}
                        </div>
                    ) : <p className="text-[10px] text-slate-400 italic">None specified</p>}
                </div>

                {/* Enforcement */}
                <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Gavel className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase">Enforcement</span>
                    </div>
                    {pathways.enforcement.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {pathways.enforcement.map((item, i) => (
                                <span key={i} className="inline-flex px-2 py-1 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-100">
                                    {item}
                                </span>
                            ))}
                        </div>
                    ) : <p className="text-[10px] text-slate-400 italic">None specified</p>}
                </div>

                {/* Publication */}
                <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase">Publication</span>
                    </div>
                    {pathways.publication.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {pathways.publication.map((item, i) => (
                                <span key={i} className="inline-flex px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100">
                                    {item}
                                </span>
                            ))}
                        </div>
                    ) : <p className="text-[10px] text-slate-400 italic">None specified</p>}
                </div>

                {/* Exemptions */}
                <div className="p-4 space-y-2 bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase">Exemptions</span>
                    </div>
                    {pathways.exemptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {pathways.exemptions.map((item, i) => (
                                <span key={i} className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                                    {item}
                                </span>
                            ))}
                        </div>
                    ) : <p className="text-[10px] text-slate-400 italic">None specified</p>}
                </div>
            </div>
        </div>
    );
}
