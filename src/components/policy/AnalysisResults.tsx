import { AnalysisResult } from "@/types";
import { Sparkles, Scale, Users, Hand, Eye, ShieldCheck, Network, Landmark, Activity } from "lucide-react";

interface AnalysisResultsProps {
    analysis: AnalysisResult;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
    return (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Key Insight Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-5 shadow-sm">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-100 blur-2xl opacity-50"></div>
                <div className="relative flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-2">Key Insight</h4>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                            "{analysis.key_insight}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Core Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DimensionCard
                    title="Governance & Power"
                    icon={<Landmark className="h-4 w-4 text-blue-600" />}
                    content={analysis.governance_power_accountability || 'No analysis available.'}
                    color="blue"
                />
                <DimensionCard
                    title="Plurality & Inclusion"
                    icon={<Users className="h-4 w-4 text-pink-600" />}
                    content={analysis.plurality_inclusion_embodiment || 'No analysis available.'}
                    color="pink"
                />
                <DimensionCard
                    title="Agency & Co-Design"
                    icon={<Hand className="h-4 w-4 text-emerald-600" />}
                    content={analysis.agency_codesign_self_determination || 'No analysis available.'}
                    color="emerald"
                />
                <DimensionCard
                    title="Reflexivity"
                    icon={<Eye className="h-4 w-4 text-amber-600" />}
                    content={analysis.reflexivity_situated_praxis || 'No analysis available.'}
                    color="amber"
                />
            </div>

            {/* Legitimacy Dynamics Section */}
            {analysis.legitimacy_claims && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
                    <div className="bg-amber-100/50 px-4 py-3 border-b border-amber-200 flex items-center gap-2">
                        <Scale className="h-4 w-4 text-amber-700" />
                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Legitimacy Dynamics</h4>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                                <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Source</span>
                                <p className="text-xs text-slate-700 font-medium">{analysis.legitimacy_claims.source || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm col-span-2">
                                <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Mechanisms</span>
                                <p className="text-xs text-slate-700">{analysis.legitimacy_claims.mechanisms || 'N/A'}</p>
                            </div>
                        </div>
                        {analysis.legitimacy_claims.tensions && (
                            <div className="bg-white/50 p-3 rounded-lg border border-amber-100/50">
                                <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Tensions & Contradictions</span>
                                <p className="text-xs text-slate-600 italic">{analysis.legitimacy_claims.tensions}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Assemblage Dynamics Section */}
            {analysis.assemblage_dynamics && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/50 overflow-hidden">
                    <div className="bg-teal-100/50 px-4 py-3 border-b border-teal-200 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-teal-700" />
                        <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">Assemblage Dynamics</h4>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DynamicsCard
                            label="Territorialization"
                            subLabel="(Stabilization)"
                            content={analysis.assemblage_dynamics.territorialization}
                            color="teal"
                        />
                        <DynamicsCard
                            label="Deterritorialization"
                            subLabel="(Lines of Flight)"
                            content={analysis.assemblage_dynamics.deterritorialization}
                            color="cyan"
                        />
                        <div className="md:col-span-2">
                            <DynamicsCard
                                label="Coding"
                                subLabel="(Translation)"
                                content={analysis.assemblage_dynamics.coding}
                                color="emerald"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DimensionCard({ title, icon, content, color }: { title: string, icon: React.ReactNode, content: string, color: string }) {
    return (
        <div className={`group p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-${color}-200 transition-all duration-200`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-md bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
                    {icon}
                </div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                {content}
            </p>
        </div>
    );
}

function DynamicsCard({ label, subLabel, content, color }: { label: string, subLabel: string, content: string, color: string }) {
    return (
        <div className={`flex flex-col p-4 rounded-lg bg-white/80 border border-${color}-100 shadow-sm hover:shadow-md transition-all h-full`}>
            <div className={`text-xs font-bold text-${color}-700 uppercase mb-0.5`}>
                {label}
            </div>
            <div className={`text-[10px] font-medium text-${color}-600/80 uppercase mb-3 tracking-wide`}>
                {subLabel}
            </div>
            <div className="text-sm text-slate-700 leading-relaxed flex-grow">
                {content}
            </div>
        </div>
    );
}
