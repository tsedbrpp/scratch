import React, { useState } from "react";
import { Sparkles, Eye } from "lucide-react";
import dynamic from 'next/dynamic';
import { AnalysisResult } from "@/types";
import { AccountabilitySection } from "@/components/policy/analysis/AccountabilitySection";
import { EcosystemActor } from "@/types/ecosystem";
import { PromptDialog } from "@/components/transparency/PromptDialog";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { Button } from "@/components/ui/button";
import { InterpretationLensSelector } from "@/components/policy/analysis/InterpretationLensSelector";
import { DEFAULT_PERSPECTIVE_A, DEFAULT_PERSPECTIVE_B } from "@/lib/perspectives";
import { useCredits } from "@/hooks/useCredits";
import { useDemoMode } from "@/hooks/useDemoMode";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";

// Lazy load heavy compass
const GovernanceCompass = dynamic(() => import('@/components/policy/GovernanceCompass').then(mod => mod.GovernanceCompass), {
    loading: () => <div className="h-64 w-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Compass...</div>,
    ssr: false
});

interface OverviewDashboardProps {
    analysis: AnalysisResult;
    sourceTitle?: string;
    sourceId?: string;
    userImpression?: string;
    onViewActor?: (name: string) => void;
    onAddActor?: (entity: EcosystemActor) => Promise<void>;
    onMaterialize?: (entity: { name: string; detail: string; context: "accountability" | "legitimacy" | "trace" }) => void;
    onUpdate?: (updates: Partial<AnalysisResult>) => Promise<void>;
}

export function OverviewDashboard({
    analysis,
    sourceTitle,
    sourceId,
    userImpression,
    onViewActor,
    onAddActor,
    onMaterialize,
    onUpdate
}: OverviewDashboardProps) {

    // [STATE] UI Controls
    const [showTransparency, setShowTransparency] = useState(false);
    const [activeLens, setActiveLens] = useState<string>('default');

    // [STATE] Simulation (Perspectives)
    const [perspectiveResults, setPerspectiveResults] = useState<Record<string, string> | null>(analysis.perspectives || null);
    const [isSimulating, setIsSimulating] = useState(false);

    // [STATE] Credits
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const { isReadOnly } = useDemoMode();
    const [showTopUp, setShowTopUp] = useState(false);

    const hasGovernanceScores = !!(
        analysis.governance_scores &&
        typeof analysis.governance_scores.rights_focus === 'number' &&
        typeof analysis.governance_scores.procedurality === 'number'
    );

    const hasUserImpression = !!(userImpression && userImpression.trim().length > 0);
    const accountabilityData = analysis.accountability_map || {
        signatory: "",
        liability_holder: "",
        appeals_mechanism: "",
        human_in_the_loop: undefined
    };

    // --- HANDLERS ---

    const handleGeneratePerspectives = async () => {
        if (isReadOnly) {
            alert('Simulation is disabled in Demo Mode.');
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }
        setIsSimulating(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/simulate-perspectives', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    topic: sourceTitle,
                    perspectiveAId: DEFAULT_PERSPECTIVE_A.id,
                    perspectiveBId: DEFAULT_PERSPECTIVE_B.id
                })
            });

            const data = await response.json();
            if (data.success && data.perspectives) {
                const newPerspectives = {
                    [DEFAULT_PERSPECTIVE_A.id]: data.perspectives.perspectiveA,
                    [DEFAULT_PERSPECTIVE_B.id]: data.perspectives.perspectiveB
                };

                setPerspectiveResults(newPerspectives);
                refetchCredits();

                // Save to DB
                if (onUpdate) {
                    await onUpdate({ perspectives: newPerspectives });
                }
            }
        } catch (error) {
            console.error("Simulation failed:", error);
            alert("Failed to generate perspective simulation.");
        } finally {
            setIsSimulating(false);
        }
    };

    // Determine current display content based on lens
    const getCurrentContent = () => {
        if (activeLens === 'default') {
            return {
                title: "Key Insight",
                text: analysis.key_insight || "No key insight available.",
                colorClass: "bg-purple-100 text-purple-600",
                bgGradient: "from-purple-50 to-indigo-50",
                borderClass: "border-purple-100"
            };
        }

        // Use local state if recently generated, otherwise fall back to analysis props
        const results = perspectiveResults || analysis.perspectives;
        const resultText = results?.[activeLens];

        if (!resultText) return null;

        const isLensA = activeLens === DEFAULT_PERSPECTIVE_A.id;

        return {
            title: isLensA ? DEFAULT_PERSPECTIVE_A.name : DEFAULT_PERSPECTIVE_B.name,
            text: resultText,
            colorClass: isLensA ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700",
            bgGradient: isLensA ? "from-indigo-50 to-blue-50" : "from-rose-50 to-orange-50",
            borderClass: isLensA ? "border-indigo-100" : "border-rose-100"
        };
    };

    const currentDisplay = getCurrentContent();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => refetchCredits()} />

            {/* [TRANSPARENCY] Transparency Dialog */}
            <PromptDialog
                open={showTransparency}
                onOpenChange={setShowTransparency}
                metadata={analysis.metadata}
                provenance={analysis.provenance_chain}
            />

            {/* 1. Header Area: Transparency & Lens Selector */}
            <div className="space-y-4">

                {/* Transparency Banner */}
                {analysis.metadata && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-indigo-900 mb-1">AI Transparency</h4>
                            <p className="text-xs text-indigo-700">View the exact prompt and reasoning used for this analysis</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {analysis.confidence && (
                                <ConfidenceBadge confidence={analysis.confidence} />
                            )}
                            <Button
                                onClick={() => setShowTransparency(true)}
                                variant="outline"
                                size="sm"
                                className="bg-white hover:bg-indigo-50 border-indigo-300"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Show Prompt
                            </Button>
                        </div>
                    </div>
                )}

                {/* Interpretation Lens Selector */}
                <InterpretationLensSelector
                    currentLens={activeLens}
                    onLensChange={setActiveLens}
                    onGenerate={handleGeneratePerspectives}
                    isGenerating={isSimulating}
                    hasResults={!!(perspectiveResults || analysis.perspectives)}
                />

                {/* Hero Card: Key Insight (Dynamic based on Lens) */}
                {currentDisplay && (
                    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${currentDisplay.bgGradient} border ${currentDisplay.borderClass} p-6 shadow-sm transition-all duration-500`}>
                        <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full blur-3xl opacity-50 ${currentDisplay.colorClass}`}></div>

                        <div className="relative flex items-start gap-4">
                            <div className={`p-3 bg-white rounded-xl shadow-sm shrink-0`}>
                                <Sparkles className={`h-6 w-6 ${currentDisplay.colorClass.split(' ')[1]}`} />
                            </div>
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${currentDisplay.colorClass.split(' ')[1]}`}>
                                    {currentDisplay.title} {activeLens !== 'default' && <span className="opacity-70">(Simulated)</span>}
                                </h4>
                                <p className="text-lg font-medium text-slate-900 leading-relaxed italic">
                                    &quot;{currentDisplay.text}&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Secondary Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Context Card */}
                {hasUserImpression && (
                    <div className="md:col-span-3 p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Initial Anchor</h5>
                        <p className="text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3">
                            &quot;{userImpression}&quot;
                        </p>
                        {analysis.anchor_bias_choice && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${analysis.anchor_bias_choice === 'extractive_asymmetrical' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {analysis.anchor_bias_choice.replace('_', ' ')}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 3. Visual Diagnostics & Accountability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                {/* Governance Compass */}
                {hasGovernanceScores && analysis.governance_scores && (
                    <div className="bg-white rounded-xl border border-slate-200 p-1 shadow-sm h-full min-h-[400px]">
                        <GovernanceCompass
                            rhetoricScore={analysis.governance_scores.rights_focus}
                            realityScore={analysis.governance_scores.procedurality}
                            driftExplanation={analysis.verification_gap?.gap_explanation}
                            scoreExplanations={analysis.governance_score_explanations}
                        />
                    </div>
                )}

                {/* Accountability Map */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-800" />
                        Decision Ownership
                    </h3>
                    <AccountabilitySection
                        accountability={accountabilityData}
                        onMaterialize={(entity) => onMaterialize && onMaterialize({
                            name: entity.name,
                            detail: entity.detail,
                            context: "accountability"
                        })}
                        existingActors={[]} // TODO: Pass real actors
                        onViewActor={onViewActor}
                    />
                </div>
            </div>

        </div>
    );
}
