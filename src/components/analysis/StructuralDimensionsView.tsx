import React from "react";
import { AnalysisResult } from "@/types";
import { Landmark, Users, Hand, Eye, Fingerprint, Zap, ShieldCheck } from "lucide-react";
import { DimensionCard } from "@/components/policy/analysis/DimensionCard";
import { StructuralRadar } from "./StructuralRadar";
import { Badge } from "@/components/ui/badge";
import { AccountabilityChain, InclusionDepthMeter, AgencySpectrum, ReflexivityMeter, ColonialityVisual, ParticipationLadder, VoiceSplit, PowerBalanceScale, LegitimacySource, BlindSpotRadar, ImpactMatrixItem } from "./DimensionVisuals";

interface StructuralDimensionsViewProps {
    analysis: AnalysisResult;
}

// Heuristic for logic synthesis
const getLogicSummary = (scores: AnalysisResult["governance_scores"]) => {
    if (!scores) return { title: "Undetermined Logic", desc: "Re-run analysis to generate governance metrics.", color: "slate" };

    if (scores.centralization > 70 && scores.market_power > 60) {
        return { title: "Technocratic Consolidation", desc: "Governance is centralized within market leaders with high procedural rigidity.", color: "indigo" };
    }
    if (scores.rights_focus > 70 && scores.flexibility > 60) {
        return { title: "Adaptive Rights-Focus", desc: "Governance prioritizes individual protections with high adaptability to local context.", color: "emerald" };
    }
    if (scores.centralization > 70 && scores.rights_focus < 40) {
        return { title: "Sovereign Exclusion", desc: "High centralization with minimal focus on inclusion or individual rights.", color: "rose" };
    }
    return { title: "Hybrid Governance", desc: "A balanced distribution of power across multiple structural dimensions.", color: "amber" };
};

export function StructuralDimensionsView({ analysis }: StructuralDimensionsViewProps) {
    const scores = analysis.governance_scores;
    const logic = getLogicSummary(scores);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Top Analysis Row */}
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <StructuralRadar scores={scores} />
                </div>

                <div className="space-y-4">
                    {/* Logic Synthesis Card */}
                    <div className={`p-5 rounded-xl border bg-white shadow-sm border-${logic.color}-100`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Fingerprint className={`h-4 w-4 text-${logic.color}-600`} />
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Governing Logic</h4>
                        </div>
                        <Badge variant="outline" className={`mb-3 bg-${logic.color}-50 text-${logic.color}-700 border-${logic.color}-200`}>
                            {logic.title}
                        </Badge>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            {logic.desc}
                        </p>

                        <div className="space-y-2 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-medium">Power Symmetry</span>
                                <Badge variant="secondary" className="text-[9px] h-4 bg-slate-100">{(scores?.centralization || 50) > 60 ? 'Asymmetric' : 'Distributed'}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-medium">Closure Index</span>
                                <Badge variant="secondary" className="text-[9px] h-4 bg-slate-100">{(scores?.flexibility || 50) < 40 ? 'Closed' : 'Iterative'}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Quick Insight */}
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <h4 className="text-[10px] font-bold text-slate-700 uppercase">Structural Stress</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                            {(scores?.market_power || 0) > (scores?.rights_focus || 0) + 20
                                ? "Significant tension between market dominance and individual rights protections."
                                : "Relatively balanced alignment between enforcement and ethics."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Dimensions Grid */}
            <div className="mb-2 px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qualitative Deep-Dive</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                    <DimensionCard
                        title="Governance & Power"
                        icon={<Landmark className="h-4 w-4 text-blue-600" />}
                        content={analysis.governance_power_accountability || 'No analysis available.'}
                        color="blue"
                        glossaryTerm="governance-and-power"
                        visual={
                            <div className="space-y-4">
                                <AccountabilityChain data={analysis.accountability_map} />
                                <PowerBalanceScale centralization={scores?.centralization || 50} />
                                <LegitimacySource
                                    source={analysis.legitimacy_claims?.source}
                                    mechanisms={analysis.legitimacy_claims?.mechanisms}
                                />
                            </div>
                        }
                    />
                </div>

                <div className="space-y-4">
                    <DimensionCard
                        title="Plurality & Inclusion"
                        icon={<Users className="h-4 w-4 text-pink-600" />}
                        content={analysis.plurality_inclusion_embodiment || 'No analysis available.'}
                        color="pink"
                        glossaryTerm="plurality"
                        visual={
                            <div className="space-y-4">
                                <InclusionDepthMeter score={scores?.rights_focus || 50} />
                                <VoiceSplit included={scores?.rights_focus || 50} silenced={analysis.silenced_voices} />
                            </div>
                        }
                    />
                </div>

                <div className="space-y-4">
                    <DimensionCard
                        title="Agency & Co-Design"
                        icon={<Hand className="h-4 w-4 text-emerald-600" />}
                        content={analysis.agency_codesign_self_determination || 'No analysis available.'}
                        color="emerald"
                        glossaryTerm="agency"
                        visual={
                            <div className="space-y-4">
                                <AgencySpectrum
                                    score={scores?.flexibility || 50}
                                    humanInLoop={analysis.accountability_map?.human_in_the_loop}
                                />
                                <ParticipationLadder score={scores?.flexibility || 50} />
                            </div>
                        }
                    />
                </div>

                <div className="space-y-4">
                    <DimensionCard
                        title="Reflexivity"
                        icon={<Eye className="h-4 w-4 text-amber-600" />}
                        content={analysis.reflexivity_situated_praxis || 'No analysis available.'}
                        color="amber"
                        glossaryTerm="reflexivity"
                        videoUrl="/videos/reflexivity-demo.mp4"
                        visual={
                            <div className="space-y-4">
                                <ReflexivityMeter score={scores?.flexibility || 50} />
                                <BlindSpotRadar blindSpots={analysis.system_critique?.blind_spots} />
                            </div>
                        }
                    />
                </div>

                {analysis.coloniality_of_power && (
                    <div>
                        <DimensionCard
                            title="Coloniality of Power"
                            icon={<span className="text-red-600 font-bold text-xs border border-red-600 rounded px-0.5">CP</span>}
                            content={analysis.coloniality_of_power}
                            color="red"
                            glossaryTerm="coloniality-of-power"
                            visual={<ColonialityVisual score={scores?.coloniality || 50} />}
                        />
                    </div>
                )}
            </div>

            {/* Strategic Implications (Placeholder for further AI analysis) */}
            <div className="p-6 bg-slate-900 rounded-xl text-white">
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide">Structural Impact Matrix</h4>
                        <p className="text-[10px] text-slate-400">Assessing the long-term systemic effects of this governance model</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ImpactMatrixItem title="Accountability" detail="How easily can actors be held liable?" value={(scores?.procedurality || 50) > 60 ? 'High' : 'Low'} />
                    <ImpactMatrixItem title="Resilience" detail="Can the system withstand external shocks?" value={(scores?.flexibility || 50) > 60 ? 'High' : 'Medium'} />
                    <ImpactMatrixItem title="Equity" detail="Is the benefit distribution symmetrical?" value={(scores?.rights_focus || 50) > 60 ? 'High' : 'Low'} />
                </div>
            </div>
        </div>
    );
}

