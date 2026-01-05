import { AnalysisResult } from "@/types";
import { UserCheck, Shield, Scale, Gavel } from "lucide-react";

interface AccountabilitySectionProps {
    accountability: NonNullable<AnalysisResult['accountability_map']>;
    onMaterialize?: (entity: { name: string; context: string; detail: string }) => void;
    existingActors?: string[]; // Names of actors already in the ecosystem
    onViewActor?: (name: string) => void;
}

export function AccountabilitySection({ accountability, onMaterialize, existingActors = [], onViewActor }: AccountabilitySectionProps) {
    const renderMaterializeButton = (name: string, role: string) => {
        if (!name || name === "Unspecified" || name === "None Defined" || name === "Not Assigned") return null;

        const exists = existingActors.some(existing => existing.toLowerCase() === name.toLowerCase());

        if (exists && onViewActor) {
            return (
                <button
                    onClick={() => onViewActor(name)}
                    className="ml-auto text-[10px] text-emerald-600 hover:text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View in Ecosystem Graph"
                >
                    <UserCheck className="h-3 w-3" /> View
                </button>
            );
        }

        if (!onMaterialize) return null;

        return (
            <button
                onClick={() => onMaterialize({ name, context: "accountability", detail: role })}
                className="ml-auto text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Add to Ecosystem"
            >
                + Graph
            </button>
        );
    };

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
                <div className="p-3 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1 group relative">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> Signatory
                        </span>
                        {renderMaterializeButton(accountability.signatory || "", "Signatory")}
                    </div>
                    <p className="text-sm font-medium text-slate-800 break-words">
                        {accountability.signatory || <span className="text-slate-400 italic">Not Assigned</span>}
                    </p>
                </div>

                {/* Liability Holder */}
                <div className="p-3 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1 group relative">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Liability Holder
                        </span>
                        {renderMaterializeButton(accountability.liability_holder || "", "Liability Holder")}
                    </div>
                    <p className="text-sm font-medium text-slate-800 break-words">
                        {accountability.liability_holder || <span className="text-slate-400 italic">Unspecified</span>}
                    </p>
                </div>

                {/* Appeals Mechanism */}
                <div className="p-3 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1 group relative">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            <Scale className="h-3 w-3" /> Appeals Path
                        </span>
                        {renderMaterializeButton(accountability.appeals_mechanism || "", "Appeals Mechanism")}
                    </div>
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
                        <span className={`h-2 w-2 rounded-full ${accountability.human_in_the_loop === true ? 'bg-emerald-500' : (accountability.human_in_the_loop === false ? 'bg-red-500' : 'bg-slate-300')}`} />
                        <span className="text-sm font-medium text-slate-800">
                            {accountability.human_in_the_loop === true ? "Human" : (accountability.human_in_the_loop === false ? "Automated" : "Unknown")}
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
