import { AnalysisResult } from "@/types";
import { UserCheck, Shield, Scale, Gavel } from "lucide-react";

interface AccountabilitySectionProps {
    accountability: NonNullable<AnalysisResult['accountability_map']>;
}

export function AccountabilitySection({ accountability }: AccountabilitySectionProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Decision Ownership & Accountability</h4>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Signatory */}
                <div className="p-3 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" /> Signatory
                    </span>
                    <p className="text-sm font-medium text-slate-800 break-words">
                        {accountability.signatory || <span className="text-slate-400 italic">Not Assigned</span>}
                    </p>
                </div>

                {/* Liability Holder */}
                <div className="p-3 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Liability Holder
                    </span>
                    <p className="text-sm font-medium text-slate-800 break-words">
                        {accountability.liability_holder || <span className="text-slate-400 italic">Unspecified</span>}
                    </p>
                </div>

                {/* Appeals Mechanism */}
                <div className="p-3 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Appeals Path
                    </span>
                    <p className="text-sm font-medium text-slate-800 break-words">
                        {accountability.appeals_mechanism || <span className="text-slate-400 italic">None Defined</span>}
                    </p>
                </div>

                {/* Human in the Loop */}
                <div className="p-3 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Gavel className="h-3 w-3" /> Final Decision
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${accountability.human_in_the_loop ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium text-slate-800">
                            {accountability.human_in_the_loop ? "Human" : "Automated"}
                        </span>
                    </div>
                </div>

            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase tracking-wider">
                DR3: Surface Delegation • Make Humans Visible
            </div>
        </div>
    );
}
