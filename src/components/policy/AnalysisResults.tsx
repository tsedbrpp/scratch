import { useState } from "react";
import { AnalysisResult } from "@/types";
import { Sparkles, Scale, Users, Hand, Eye, ShieldCheck, Landmark, Activity, AlertTriangle, LayoutDashboard, Layers, BadgeCheck, MessageSquareDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GovernanceCompass } from "./GovernanceCompass";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ValidationSection } from "./analysis/ValidationSection";
import { DimensionCard } from "./analysis/DimensionCard";
import { DynamicsCard } from "./analysis/DynamicsCard";
import { VerifiedEvidenceSection } from "./analysis/VerifiedEvidenceSection";
import { StressTestSection } from "./analysis/StressTestSection";
import { CulturalHolesSection } from "./analysis/CulturalHolesSection";
import { VerificationPathwaysTable } from "./analysis/VerificationPathwaysTable";
import { SystemCritiqueSection } from "@/components/common/SystemCritiqueSection";
import { calculateMicroFascismRisk } from "@/lib/risk-calculator";
import { MicroFascismRiskCard } from "./analysis/MicroFascismRiskCard";
import { calculateLiberatoryCapacity } from "@/lib/liberatory-calculator";
import { LiberatoryCapacityCard } from "./analysis/LiberatoryCapacityCard";
import { AccountabilitySection } from "./analysis/AccountabilitySection";
import { InterpretationLensSelector } from "./analysis/InterpretationLensSelector";
import { DEFAULT_PERSPECTIVE_A, DEFAULT_PERSPECTIVE_B } from "@/lib/perspectives";
import { BASELINE_SOURCES } from '@/lib/data/baselines';

interface AnalysisResultsProps {
    analysis: AnalysisResult;
    sourceTitle?: string;
    onUpdate?: (updates: Partial<AnalysisResult>) => void;
}

export function AnalysisResults({ analysis, sourceTitle, onUpdate }: AnalysisResultsProps) {
    // FALLBACK: Inject baseline data for demo logic if missing from props
    const baselineMatch = BASELINE_SOURCES.find(b => b.title === sourceTitle);
    const effectiveAnalysis = { ...analysis };

    if (baselineMatch) {
        if (!effectiveAnalysis.accountability_map && baselineMatch.analysis?.accountability_map) {
            effectiveAnalysis.accountability_map = baselineMatch.analysis.accountability_map;
        }
        if (!effectiveAnalysis.rebuttals && baselineMatch.analysis?.rebuttals) {
            effectiveAnalysis.rebuttals = baselineMatch.analysis.rebuttals;
        }
    }

    console.log("DEBUG: AnalysisResults Rendered", {
        hasAccountability: !!effectiveAnalysis.accountability_map,
        hasRebuttals: !!effectiveAnalysis.rebuttals,
        keys: Object.keys(effectiveAnalysis)
    });

    const [activeLens, setActiveLens] = useState<string>('default');
    const riskAnalysis = calculateMicroFascismRisk(effectiveAnalysis);
    const liberatoryCapacity = calculateLiberatoryCapacity(effectiveAnalysis);
    const [userImpression] = useState(effectiveAnalysis.user_impression || "");
    const [isCritiqueLoading, setIsCritiqueLoading] = useState(false);
    const [critiqueResult, setCritiqueResult] = useState<AnalysisResult['system_critique'] | null>(null);
    const [critiqueError, setCritiqueError] = useState<string | null>(null);

    // Interpretation Sets (DR2) State
    const [perspectiveResults, setPerspectiveResults] = useState<Record<string, string> | null>(effectiveAnalysis.perspectives || null);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleGeneratePerspectives = async () => {
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
                // Map API response to our state structure
                // API returns: { perspectiveA: "text", perspectiveB: "text" }
                const newPerspectives = {
                    [DEFAULT_PERSPECTIVE_A.id]: data.perspectives.perspectiveA,
                    [DEFAULT_PERSPECTIVE_B.id]: data.perspectives.perspectiveB
                };

                setPerspectiveResults(newPerspectives);

                // Cache results to the database (via source update)
                if (onUpdate) {
                    onUpdate({ perspectives: newPerspectives });
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
                text: effectiveAnalysis.key_insight,
                colorClass: "bg-purple-100 text-purple-600",
                bgGradient: "from-purple-50 to-indigo-50",
                borderClass: "border-purple-100"
            };
        }

        const resultText = perspectiveResults?.[activeLens];
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

    const handleRunCritique = async () => {
        setIsCritiqueLoading(true);
        setCritiqueError(null);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    analysisMode: 'critique',
                    text: sourceTitle || "Source Text", // Context
                    existingAnalysis: analysis
                })
            });
            const data = await response.json();

            if (data.success && data.analysis?.system_critique) {
                setCritiqueResult(data.analysis.system_critique);
                if (onUpdate) {
                    onUpdate({ system_critique: data.analysis.system_critique });
                }
            } else {
                setCritiqueError(data.error || "Failed to generate critique.");
            }
        } catch (err) {
            setCritiqueError("Network error.");
            console.error(err);
        } finally {
            setIsCritiqueLoading(false);
        }
    };

    return (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- TOP LEVEL CONTEXT (Always Visible) --- */}

            {/* Interpretation Lens Selector */}
            <InterpretationLensSelector
                currentLens={activeLens}
                onLensChange={setActiveLens}
                onGenerate={handleGeneratePerspectives}
                isGenerating={isSimulating}
                hasResults={!!perspectiveResults}
            />

            {/* Key Insight Hero Section (Dynamic) */}
            {currentDisplay && (
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${currentDisplay.bgGradient} border ${currentDisplay.borderClass} p-5 shadow-sm transition-all duration-500`}>
                    <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full blur-2xl opacity-50 ${currentDisplay.colorClass}`}></div>
                    <div className="relative flex items-start gap-3">
                        <div className={`p-2 bg-white rounded-lg shadow-sm shrink-0`}>
                            <Sparkles className={`h-5 w-5 ${currentDisplay.colorClass.split(' ')[1]}`} />
                        </div>
                        <div>
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${currentDisplay.colorClass.split(' ')[1]}`}>
                                {currentDisplay.title} {activeLens !== 'default' && <span className="opacity-70">(Simulated)</span>}
                            </h4>
                            <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                                &quot;{currentDisplay.text}&quot;
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Gap Alert */}
            {effectiveAnalysis.verification_gap?.high_rhetoric_low_verification && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 animate-pulse">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide mb-1">Warning: Verification Gap Detected</h4>
                        <p className="text-xs leading-relaxed">
                            {effectiveAnalysis.verification_gap?.gap_explanation}
                        </p>
                        <p className="text-[10px] mt-2 font-mono text-red-700 uppercase">
                            High Rhetoric / Low Verification • Potential Purpose Drift
                        </p>
                    </div>
                </div>
            )}

            {/* --- TABS --- */}
            <Tabs defaultValue="diagnostic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1">
                    <TabsTrigger value="diagnostic" className="text-xs uppercase font-bold text-slate-500 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                        <LayoutDashboard className="h-3 w-3 mr-2" /> Diagnostic
                    </TabsTrigger>
                    <TabsTrigger value="dialectics" className="text-xs uppercase font-bold text-slate-500 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                        <Scale className="h-3 w-3 mr-2" /> Dialectics
                    </TabsTrigger>
                    <TabsTrigger value="deep-analysis" className="text-xs uppercase font-bold text-slate-500 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                        <Layers className="h-3 w-3 mr-2" /> Deep Analysis
                    </TabsTrigger>
                    <TabsTrigger value="critique" className="text-xs uppercase font-bold text-slate-500 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                        <MessageSquareDashed className="h-3 w-3 mr-2" /> Reflexivity
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="text-xs uppercase font-bold text-slate-500 data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                        <BadgeCheck className="h-3 w-3 mr-2" /> Audit
                    </TabsTrigger>
                </TabsList>

                {/* 1. DIAGNOSTIC TAB */}
                <TabsContent value="diagnostic" className="space-y-6 mt-4 animate-in fade-in-50 duration-300">

                    {/* User's Impression & Governance Compass */}
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        {userImpression && (
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 h-full">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase">Your Initial Anchor</h5>
                                    {effectiveAnalysis.anchor_bias_choice && (
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${effectiveAnalysis.anchor_bias_choice === 'extractive_asymmetrical' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {effectiveAnalysis.anchor_bias_choice.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-800 italic">&quot;{userImpression}&quot;</p>
                            </div>
                        )}

                        {/* Governance Compass */}
                        {effectiveAnalysis.governance_scores && (
                            <div className="h-full">
                                <GovernanceCompass
                                    rhetoricScore={effectiveAnalysis.governance_scores.rights_focus}
                                    realityScore={effectiveAnalysis.governance_scores.procedurality}
                                    driftExplanation={effectiveAnalysis.verification_gap?.gap_explanation}
                                    scoreExplanations={effectiveAnalysis.governance_score_explanations}
                                />
                            </div>
                        )}
                    </div>

                    {/* DR3: Decision Ownership / Accountability Map */}
                    {effectiveAnalysis.accountability_map && (
                        <AccountabilitySection accountability={effectiveAnalysis.accountability_map} />
                    )}

                </TabsContent>

                {/* DB. DIALECTICS TAB (New) */}
                <TabsContent value="dialectics" className="space-y-6 mt-4 animate-in fade-in-50 duration-300">

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center mb-6">
                        <p className="text-xs text-slate-400 uppercase tracking-widest">
                            Dialectical Reading: Hardening vs. Opening
                        </p>
                    </div>

                    {/* Dialectical Risk/Capacity Cards */}
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <MicroFascismRiskCard risk={riskAnalysis} analysis={effectiveAnalysis} sourceTitle={sourceTitle} onUpdate={onUpdate} />
                        <LiberatoryCapacityCard capacity={liberatoryCapacity} analysis={effectiveAnalysis} sourceTitle={sourceTitle} />
                    </div>

                </TabsContent>

                {/* 2. DEEP ANALYSIS TAB */}
                <TabsContent value="deep-analysis" className="space-y-6 mt-4 animate-in fade-in-50 duration-300">

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
                        {analysis.coloniality_of_power && (
                            <DimensionCard
                                title="Coloniality of Power"
                                icon={<span className="text-red-600 font-bold text-xs border border-red-600 rounded px-0.5">CP</span>}
                                content={analysis.coloniality_of_power}
                                color="red"
                            />
                        )}
                    </div>

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

                    {/* Legitimacy */}
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

                    {/* Cultural Holes */}
                    {analysis.holes && analysis.holes.length > 0 && (
                        <CulturalHolesSection holes={analysis.holes} />
                    )}

                    {/* Stress Test */}
                    {analysis.stress_test_report && (
                        <StressTestSection report={analysis.stress_test_report} />
                    )}

                </TabsContent>

                {/* 3. CRITIQUE TAB (Reflexivity) */}
                <TabsContent value="critique" className="space-y-6 mt-4 animate-in fade-in-50 duration-300">
                    {/* Devil's Advocate / Critique Section */}
                    {(analysis.system_critique || critiqueResult) && (
                        <SystemCritiqueSection critique={critiqueResult || analysis.system_critique!} />
                    )}

                    {/* Critique Trigger Button (Always show for re-run/audit capability) */}
                    <div className={`p-6 rounded-xl border border-dashed ${analysis.system_critique || critiqueResult ? 'border-slate-200 bg-slate-50/30' : 'border-slate-300 bg-slate-50/50'} flex flex-col items-center justify-center text-center space-y-3`}>
                        {(!analysis.system_critique && !critiqueResult) && (
                            <>
                                <div className="p-3 bg-slate-100 rounded-full">
                                    <ShieldCheck className="h-6 w-6 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700">Audit this Analysis</h4>
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                        Run the "Devil's Advocate" protocol to identify blind spots and over-interpretations.
                                    </p>
                                </div>
                            </>
                        )}

                        <Button
                            onClick={handleRunCritique}
                            disabled={isCritiqueLoading}
                            variant="outline"
                            className="gap-2"
                        >
                            {isCritiqueLoading ? (
                                <>
                                    <Activity className="h-4 w-4 animate-spin" /> Running Audit...
                                </>
                            ) : (
                                <>{(analysis.system_critique || critiqueResult) ? 'Re-Run System Reflexivity' : 'Run System Reflexivity'}</>
                            )}
                        </Button>
                        {critiqueError && (
                            <p className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                Error: {critiqueError}
                            </p>
                        )}
                    </div>
                </TabsContent>

                {/* 4. AUDIT TAB */}
                <TabsContent value="audit" className="space-y-6 mt-4 animate-in fade-in-50 duration-300">
                    {analysis.verified_quotes && analysis.verified_quotes.length > 0 && (
                        <VerifiedEvidenceSection quotes={analysis.verified_quotes} />
                    )}
                    {analysis.verification_pathways && (
                        <VerificationPathwaysTable pathways={analysis.verification_pathways} />
                    )}

                    <ValidationSection
                        userImpression={userImpression}
                        existingValidation={analysis.validation_status}
                        sourceTitle={sourceTitle}
                        analysis={analysis}
                        onValidate={(status) => onUpdate && onUpdate({ validation_status: status })}
                    />

                    {/* Rhetoric Compliance Disclaimer */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>
                            <strong>Methodological Note:</strong> This tool analyzes the <em>textual construction</em> of legitimacy and ethics (&quot;Rhetoric Compliance&quot;), not the material operations or actual impact of the organization.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
