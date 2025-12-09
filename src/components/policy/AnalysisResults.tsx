import { useState } from "react";
import { AnalysisResult } from "@/types";
import { Sparkles, Scale, Users, Hand, Eye, ShieldCheck, Network, Landmark, Activity, AlertTriangle, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GovernanceCompass } from "./GovernanceCompass";

interface AnalysisResultsProps {
    analysis: AnalysisResult;
    sourceTitle?: string;
    onUpdate?: (updates: Partial<AnalysisResult>) => void;
}

export function AnalysisResults({ analysis, sourceTitle, onUpdate }: AnalysisResultsProps) {
    const [userImpression, setUserImpression] = useState(analysis.user_impression || "");
    const [anchorChoice, setAnchorChoice] = useState<"extractive_asymmetrical" | "regenerative_participatory" | null>(analysis.anchor_bias_choice || null);



    return (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User's Initial Impression (Revealed) */}
            {userImpression && (
                <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-500 uppercase">Your Initial Anchor</h5>
                        {analysis.anchor_bias_choice && (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${analysis.anchor_bias_choice === 'extractive_asymmetrical' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {analysis.anchor_bias_choice.replace('_', ' ')}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-800 italic">"{userImpression}"</p>
                </div>
            )}

            {/* Verification Gap Alert */}
            {analysis.verification_gap?.high_rhetoric_low_verification && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 animate-pulse">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide mb-1">Warning: Verification Gap Detected</h4>
                        <p className="text-xs leading-relaxed">
                            {analysis.verification_gap.gap_explanation}
                        </p>
                        <p className="text-[10px] mt-2 font-mono text-red-700 uppercase">
                            High Rhetoric / Low Verification • Potential Purpose Drift
                        </p>
                    </div>
                </div>
            )}

            {/* Rhetoric Compliance Disclaimer */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                    <strong>Methodological Note:</strong> This tool analyzes the <em>textual construction</em> of legitimacy and ethics ("Rhetoric Compliance"), not the material operations or actual impact of the organization.
                </p>
            </div>

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

            {/* Governance Compass Visualization */}
            {analysis.governance_scores && (
                <GovernanceCompass
                    rhetoricScore={analysis.verification_gap?.high_rhetoric_low_verification ? 85 : analysis.governance_scores.rights_focus}
                    realityScore={analysis.verification_gap?.high_rhetoric_low_verification ? 25 : analysis.governance_scores.procedurality}
                    driftExplanation={analysis.verification_gap?.gap_explanation}
                />
            )}

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
                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Legitimacy Claims Analysis</h4>
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

            <ValidationSection
                userImpression={userImpression}
                existingValidation={analysis.validation_status}
                sourceTitle={sourceTitle}
                analysis={analysis}
                onValidate={(status) => onUpdate && onUpdate({ validation_status: status })}
            />
        </div>
    );
}

function ValidationSection({
    userImpression,
    existingValidation,
    sourceTitle,
    analysis,
    onValidate
}: {
    userImpression: string;
    existingValidation?: AnalysisResult['validation_status'];
    sourceTitle?: string;
    analysis: AnalysisResult;
    onValidate?: (status: AnalysisResult['validation_status']) => void;
}) {
    const [agreement, setAgreement] = useState<"yes" | "no" | null>(existingValidation?.agreement || null);
    const [justification, setJustification] = useState(existingValidation?.justification || "");
    const [isFinalized, setIsFinalized] = useState(!!existingValidation);

    const handleFinalize = async () => {
        if (agreement === 'no' && justification.length < 10) return;

        const status = {
            agreement: agreement!,
            justification: agreement === 'no' ? justification : "Agreed with AI",
            timestamp: new Date().toISOString()
        };

        setIsFinalized(true);
        if (onValidate) {
            onValidate(status);
        }

        // Log the validation (Rich Conflict Resolution Log)
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            // Construct Rich Log
            const logBody = {
                action: "Conflict Resolution Log",
                details: {
                    sessionId: `AUDIT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                    targetDocument: sourceTitle || "Unknown Document",
                    discrepancy: {
                        metric: "Governance Compass (Rhetoric vs Reality)",
                        systemProposition: {
                            placement: analysis.verification_gap?.high_rhetoric_low_verification ? "HIGH_RHETORIC" : "ALIGNED",
                            evidence: analysis.key_insight || "Automated analysis",
                            ontologicalSource: "Assemblage-AI Default Ontology"
                        },
                        humanAnchor: {
                            placement: "USER_DEFINED",
                            evidence: userImpression,
                            status: "ANCHOR_BIAS_MITIGATED"
                        }
                    },
                    resolution: {
                        action: agreement === 'no' ? "MANUAL_OVERRIDE" : "ACCEPTED_AI",
                        finalValue: agreement === 'no' ? "USER_OVERRIDE" : "AI_CONSENSUS"
                    },
                    justification: {
                        rationale: justification || "User agreed with AI analysis."
                    },
                    reflexivity: {
                        epistemicCaptureFlag: agreement === 'no',
                        systemNote: agreement === 'no'
                            ? "User detected discrepancy between AI interpretation and situated context."
                            : "User validated AI interpretation.",
                        feedbackLoop: agreement === 'no'
                            ? "Log tagged for ontology tuning."
                            : "Reinforcement signal recorded."
                    }
                }
            };

            await fetch('/api/logs', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(logBody)
            });
        } catch (e) {
            console.error("Failed to log validation", e);
        }
    };

    if (isFinalized) {
        return (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-center text-sm font-medium">
                Analysis Validated & Logged.
            </div>
        );
    }

    return (
        <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Human-in-the-Loop Validation</h4>

            <div className="space-y-3">
                <p className="text-sm text-slate-700">Do you agree with the AI's analysis?</p>
                <div className="flex gap-3">
                    <Button
                        variant={agreement === 'yes' ? "default" : "outline"}
                        onClick={() => setAgreement('yes')}
                        className={agreement === 'yes' ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                        Yes, it aligns
                    </Button>
                    <Button
                        variant={agreement === 'no' ? "default" : "outline"}
                        onClick={() => setAgreement('no')}
                        className={agreement === 'no' ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                        No, I disagree
                    </Button>
                </div>
            </div>

            {agreement === 'no' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-red-800">
                        You must provide a justification for overriding the system:
                    </p>
                    <Textarea
                        placeholder="Explain why the AI analysis is incorrect or incomplete..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="min-h-[80px]"
                    />
                </div>
            )}

            {agreement && (
                <Button
                    onClick={handleFinalize}
                    disabled={agreement === 'no' && justification.length < 10}
                    className="w-full"
                >
                    Finalize & Log Validation
                </Button>
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
