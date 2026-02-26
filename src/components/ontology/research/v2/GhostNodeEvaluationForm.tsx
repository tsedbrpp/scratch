import React, { useState } from 'react';
import { GhostNodeSurveyResponse, EvaluationConfig, PerceivedGapSchema, EnforcementEscalationSchema, AnalyticalChallengeSchema, MechanismStepSchema, ImpactCategorySchema } from '@/lib/study-config';
import { setImmutablePath } from '@/lib/survey/path-update';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Crosshair, Target, EyeOff, CheckSquare, AlertCircle, Circle, CircleDashed, CheckCircle2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEvaluationContext } from './EvaluationContext';

interface GhostNodeEvaluationFormProps {
    config?: EvaluationConfig;
    initialData?: GhostNodeSurveyResponse;
    surveyTitle?: string;
    onChange: (data: Partial<GhostNodeSurveyResponse>) => void;
}

export function GhostNodeEvaluationForm({ config, initialData, surveyTitle, onChange }: GhostNodeEvaluationFormProps) {
    const title = surveyTitle || "EU AI Act";

    // Default values if no config provided yet
    const safeConfig = config || {
        presenceGateQuestion: "Does the text assign any governance role to Citizens/Public?",
        presenceGateOptions: ["yes", "no", "unsure"],
        disambiguationPrompts: [
            { id: "d1", question: "Consumers vs Public?", options: ["Yes", "No", "Unsure"] }
        ],
        strengthAbsence: { min: 0, max: 100, anchors: [{ value: 0, label: "Not absent" }, { value: 100, label: "Very strong" }] },
        feasibility: { min: 0, max: 100, anchors: [{ value: 0, label: "Not feasible" }, { value: 100, label: "Highly feasible" }], mechanismGateThreshold: 40, mechanismOptions: ["Public Hearings", "Citizen Suit"] }
    };

    let contextVals;
    try {
        contextVals = useEvaluationContext();
    } catch (e) {
        contextVals = null;
    }

    const activeFieldId = contextVals?.activeFieldId || 'presenceGate';
    const setActiveFieldId = contextVals?.setActiveFieldId || (() => { });
    const resolvedTargets = contextVals?.resolvedTargets || [];
    const jumpToTarget = contextVals?.jumpToTarget || (() => { });
    const focusMode = contextVals?.focusMode || null;
    const setFocusMode = contextVals?.setFocusMode || (() => { });
    const isLoadingTargets = contextVals?.isLoadingTargets || false;

    const [expandedMech, setExpandedMech] = useState<string | null>(null);
    const [expandedImpact, setExpandedImpact] = useState<string | null>(null);

    React.useEffect(() => {
        if (!contextVals?.activeFieldId) {
            setActiveFieldId('presenceGate');
        }
    }, [contextVals, setActiveFieldId]);

    const handleAnswer = (field: keyof GhostNodeSurveyResponse, value: unknown) => {
        onChange({ [field]: value });

        // Auto-advance logic for simple radio buttons
        if (field === 'absenceGate' && value !== 'unsure') {
            if (safeConfig.disambiguationPrompts && safeConfig.disambiguationPrompts.length > 0) {
                // If yes/no and there's disambiguation, go there and maybe trigger focus mode
                setActiveFieldId('disambiguation');
                // Optional: trigger focus mode for V3 Quote Extraction on "Yes"
                if (value === 'yes') {
                    setFocusMode({ fieldId: 'v3_exclusionBounding', required: true, requiresBoundedDefinition: true });
                }
            } else {
                setActiveFieldId('strength');
            }
        }
    };

    const handleDisambiguation = (id: string, value: string) => {
        const currentAns = initialData?.disambiguationAnswers || {};
        onChange({ disambiguationAnswers: { ...currentAns, [id]: value } });
    };

    const handlePathAnswer = (path: string, value: any) => {
        const updated = setImmutablePath(initialData || {} as any, path, value);
        // Force version V3 flag on deep update to ensure schema validation aligns
        updated.surveyVersion = 'v3';
        onChange(updated as Partial<GhostNodeSurveyResponse>);
    };

    const v3Data = (initialData || {}) as any; // Cast temporarily to allow flex reading

    const steps = (() => {
        const out = [
            {
                id: 'presenceGate', label: 'Presence',
                completed: (v3Data.absenceGate ? 1 : 0) + (v3Data.absenceGate === 'yes' && v3Data.selectedQuoteId ? 1 : 0),
                total: v3Data.absenceGate === 'yes' ? 2 : 1
            },
            ...(safeConfig.disambiguationPrompts && safeConfig.disambiguationPrompts.length > 0 ? [{
                id: 'disambiguation', label: 'Details',
                completed: Object.keys(v3Data.disambiguationAnswers || {}).length,
                total: safeConfig.disambiguationPrompts.length
            }] : []),
            {
                id: 'strength', label: 'Strength',
                completed: v3Data.strength !== undefined ? 1 : 0,
                total: 1
            },
            {
                id: 'groundingGate', label: 'Grounding',
                completed: v3Data.groundingGate ? 1 : 0,
                total: 1
            },
            {
                id: 'section3', label: `1. ${title}`,
                completed: v3Data.euAiActOmissionAgreement ? 1 : 0,
                total: 1
            },
            {
                id: 'section4', label: '2. Responses',
                completed: v3Data.counterfactualFeasibility ? 1 : 0,
                total: 1
            },
            {
                id: 'section5', label: '3. Impacts',
                completed: v3Data.scenarioConfidence ? 1 : 0,
                total: 1
            },
            {
                id: 'section6', label: '4. Synthesis',
                completed: (v3Data.innovativeIdeas ? 1 : 0) + (v3Data.crossDisciplinaryInsights ? 1 : 0),
                total: 2
            }
        ];
        return out;
    })();

    const currentStepIndex = steps.findIndex(s => s.id === activeFieldId);
    if (currentStepIndex === -1 && steps.length > 0) setActiveFieldId(steps[0].id);

    const goToNext = () => {
        if (currentStepIndex < steps.length - 1) setActiveFieldId(steps[currentStepIndex + 1].id);
    };

    const goToPrev = () => {
        if (currentStepIndex > 0) setActiveFieldId(steps[currentStepIndex - 1].id);
    };

    const JumpControls = () => {
        if (isLoadingTargets) return <span className="text-xs text-purple-600 animate-pulse ml-2 font-medium">Resolving evidence...</span>;
        if (!resolvedTargets.length) return null;

        return (
            <div className="flex items-center gap-2 ml-auto">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 px-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => jumpToTarget('first')}
                >
                    <Target className="h-3 w-3" /> Jump to Evidence
                </Button>
                {resolvedTargets.length > 1 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] gap-1 px-2 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => jumpToTarget('next')}
                    >
                        Next Source ({resolvedTargets.length})
                    </Button>
                )}
            </div>
        );
    };

    const FocusModeBanner = () => {
        if (!focusMode?.required) return null;
        return (
            <div className="sticky top-4 z-20 mb-6 bg-white/95 backdrop-blur shadow-md border-2 border-fuchsia-400 rounded-lg p-4 text-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="font-semibold text-fuchsia-800 block mb-1">Focus Mode Active</span>
                        <p className="text-fuchsia-700/80 text-xs">Please select a specific excerpt from the highlighted evidence that bounds or defines this exclusion.</p>

                        {initialData?.selectedQuoteId && (
                            <div className="mt-2 flex items-center gap-2 bg-white/60 p-1.5 rounded-sm border border-fuchsia-100">
                                <span className="text-xs font-medium text-fuchsia-900 border border-fuchsia-200 bg-white px-1.5 rounded shadow-sm">ID: {initialData.selectedQuoteId.split('-').pop()}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 text-[10px] px-2 text-slate-500 hover:text-red-600 ml-auto"
                                    onClick={() => {
                                        onChange({ selectedQuoteId: undefined });
                                        // Wait a tick for context to re-render
                                        setTimeout(() => jumpToTarget('first'), 50);
                                    }}
                                >
                                    <EyeOff className="h-3 w-3 mr-1" /> Clear Selection
                                </Button>
                            </div>
                        )}

                        {focusMode.requiresBoundedDefinition && initialData?.selectedQuoteId && (
                            <div className="mt-3 animate-in fade-in zoom-in-95">
                                <Label className="text-xs font-semibold text-fuchsia-900 mb-1 block">Specify the definition boundary:</Label>
                                <input
                                    type="text"
                                    placeholder="e.g. 'Only applies to registered entities'"
                                    className="w-full text-sm p-1.5 rounded border border-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 bg-white"
                                    value={initialData?.disambiguationAnswers?.['bounds'] || ''}
                                    onChange={(e) => handleDisambiguation('bounds', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Minimal top progress indicator */}
            <div className="flex items-center gap-1.5 px-1 w-full bg-slate-50 p-2 rounded-md mb-2">
                {steps.map((step, idx) => {
                    const isComplete = step.completed === step.total;
                    const isPartial = step.completed > 0 && step.completed < step.total;
                    const isEmpty = step.completed === 0;

                    return (
                        <React.Fragment key={step.id}>
                            <div
                                className={`flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase cursor-pointer px-2 py-1.5 rounded transition-colors ${step.id === activeFieldId
                                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                                    : isComplete
                                        ? 'text-slate-600 hover:text-slate-800'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                onClick={() => setActiveFieldId(step.id)}
                            >
                                {isComplete ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                ) : isPartial ? (
                                    <CircleDashed className="h-3.5 w-3.5 text-amber-500" />
                                ) : (
                                    <Circle className="h-3.5 w-3.5 text-slate-300" />
                                )}
                                <div className="flex flex-col items-start leading-none gap-0.5">
                                    <span>{step.label}</span>
                                    {isPartial && <span className="text-[8px] opacity-70 normal-case">{step.completed}/{step.total} fields</span>}
                                </div>
                            </div>
                            {idx < steps.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step 1: Presence Gate */}
            {activeFieldId === 'presenceGate' && (
                <Card className="animate-in fade-in slide-in-from-right-4 duration-300 p-5 shadow-sm border-indigo-100 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-semibold text-slate-900">{safeConfig.presenceGateQuestion}</h3>
                        <JumpControls />
                    </div>
                    <RadioGroup
                        value={initialData?.absenceGate}
                        onValueChange={(val) => handleAnswer('absenceGate', val)}
                        className="flex gap-6"
                    >
                        {safeConfig.presenceGateOptions?.map(opt => {
                            const displayOpt = opt.replace(/clearly\s*/gi, '');
                            return (
                                <div key={opt} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt} id={`gate-${opt}`} />
                                    <Label htmlFor={`gate-${opt}`} className="capitalize">{displayOpt}</Label>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </Card>
            )
            }

            {/* Step 2: Disambiguation */}
            {
                activeFieldId === 'disambiguation' && (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 p-5 shadow-sm border-indigo-100 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">Disambiguation</h3>
                            <JumpControls />
                        </div>
                        {safeConfig.disambiguationPrompts?.map(prompt => (
                            <div key={prompt.id}>
                                <h3 className="font-semibold text-slate-900 mb-3 text-sm">{prompt.question}</h3>
                                <RadioGroup
                                    value={initialData?.disambiguationAnswers?.[prompt.id]}
                                    onValueChange={(val) => handleDisambiguation(prompt.id, val)}
                                    className="flex flex-wrap gap-4"
                                >
                                    {prompt.options.map(opt => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt.toLowerCase()} id={`dis-${prompt.id}-${opt}`} />
                                            <Label htmlFor={`dis-${prompt.id}-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}
                        <FocusModeBanner />
                    </Card>
                )
            }

            {/* Step 3: Strength of Absence */}
            {
                activeFieldId === 'strength' && (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300 p-5 shadow-sm border-indigo-100 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-semibold text-slate-900">Strength of Absence</h3>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs font-medium bg-slate-800 text-slate-50 border-slate-700">
                                        <p>How strongly does this section omit a collective public role?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="px-2 mb-8 mt-2">
                            <Slider
                                value={v3Data.strength !== undefined && v3Data.strength !== null ? [v3Data.strength] : [50]}
                                max={safeConfig.strengthAbsence?.max || 100}
                                min={safeConfig.strengthAbsence?.min || 0}
                                step={5}
                                onValueChange={(vals) => handleAnswer('strength', vals[0])}
                                className={`bg-indigo-100 transition-opacity ${v3Data.strength === undefined || v3Data.strength === null ? 'opacity-60 saturate-50' : 'opacity-100'}`}
                            />
                            <div className="relative w-full h-4 mt-4 text-[10px] text-slate-400 font-medium tracking-wide">
                                {safeConfig.strengthAbsence?.anchors.map(anchor => (
                                    <span key={anchor.value} style={{ position: 'absolute', left: `${anchor.value}%`, transform: 'translateX(-50%)' }}>
                                        {anchor.label}
                                    </span>
                                ))}
                            </div>
                            {(v3Data.strength === undefined || v3Data.strength === null) && (
                                <p className="text-[10px] text-amber-600 font-medium mt-4 text-center animate-pulse">
                                    Please move the slider to indicate your assessment.
                                </p>
                            )}
                        </div>
                    </Card>
                )
            }

            {/* Step 4: Grounding Gate (V3) */}
            {
                activeFieldId === 'groundingGate' && (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300 p-5 shadow-sm border-indigo-100 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-semibold text-slate-900">Methodological Grounding</h3>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs font-medium bg-slate-800 text-slate-50 border-slate-700">
                                        <p>Are your answers in the following sections grounded in the provided excerpts and case context?</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <RadioGroup
                            value={v3Data.groundingGate || ''}
                            onValueChange={(val) => handlePathAnswer('groundingGate', val)}
                            className="flex flex-col gap-3"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="grounding-yes" />
                                <Label htmlFor="grounding-yes" className="font-medium text-slate-700">Yes, strictly based on evidence.</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="partially" id="grounding-partially" />
                                <Label htmlFor="grounding-partially" className="font-medium text-slate-700">Partially (Supplemented by domain expertise).</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="grounding-no" />
                                <Label htmlFor="grounding-no" className="font-medium text-red-600">No, expressing general opinions.</Label>
                            </div>
                        </RadioGroup>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <Label className="text-sm font-semibold text-slate-900 block mb-2">Evidence Anchor (Optional)</Label>
                            <p className="text-[11px] text-slate-500 mb-2 italic">Which excerpt or claim are you primarily reacting to in the upcoming sections?</p>
                            <input
                                type="text"
                                placeholder="Quote ID or brief reference"
                                className="w-full text-sm p-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                value={v3Data.evidenceAnchor || ''}
                                onChange={(e) => handlePathAnswer('evidenceAnchor', e.target.value)}
                            />
                        </div>
                    </Card>
                )
            }

            {/* Step 5: Section 3 - EU AI Act (Dynamic) */}
            {
                activeFieldId === 'section3' && (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8 p-5 shadow-sm border-indigo-100 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="font-semibold text-slate-900">1. {title} Omission Agreement</h3>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs font-medium bg-slate-800 text-slate-50 border-slate-700">
                                            <p>Given the excerpts, to what extent do the document's omissions indicate structural exclusion of these groups in AI governance?</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex w-full bg-slate-100 p-1.5 rounded-lg border border-slate-200 shadow-inner">
                                    {[1, 2, 3, 4, 5].map((num) => {
                                        const isSelected = v3Data.euAiActOmissionAgreement === num.toString();
                                        return (
                                            <button
                                                key={num}
                                                onClick={() => handlePathAnswer('euAiActOmissionAgreement', num.toString())}
                                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${isSelected
                                                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between w-full px-2 text-[10px] text-slate-400 font-medium">
                                    <span>Strongly Disagree</span>
                                    <span>Neutral</span>
                                    <span>Strongly Agree</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Label className="font-semibold text-slate-900 block mb-1">Perceived Gaps</Label>
                            <p className="text-[11px] text-slate-500 mb-3 italic">Select the most prominent governance gaps resulting from this omission.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {Object.keys(PerceivedGapSchema.enum).map(gap => (
                                    <div key={gap} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={`gap-${gap}`}
                                            checked={(v3Data.perceivedGaps || []).includes(gap)}
                                            onCheckedChange={(checked) => {
                                                const current = v3Data.perceivedGaps || [];
                                                if (checked) handlePathAnswer('perceivedGaps', [...current, gap]);
                                                else handlePathAnswer('perceivedGaps', current.filter((g: string) => g !== gap));
                                            }}
                                            className="mt-1"
                                        />
                                        <Label htmlFor={`gap-${gap}`} className="text-sm leading-tight text-slate-700 font-normal">
                                            {gap.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Other gap..."
                                className="w-full text-sm p-2 rounded border border-slate-300 focus:outline-none"
                                value={v3Data.perceivedGapsOtherText || ''}
                                onChange={(e) => handlePathAnswer('perceivedGapsOtherText', e.target.value)}
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Label className="font-semibold text-slate-900 block mb-2">Broader Implications (Optional)</Label>
                            <textarea
                                className="w-full text-sm p-2 rounded-md border border-slate-300 min-h-[80px]"
                                placeholder="How might this exclusion reinforce global dominance narratives or supply chain inequity?"
                                value={v3Data.broaderImplications || ''}
                                onChange={(e) => handlePathAnswer('broaderImplications', e.target.value)}
                            />
                        </div>
                    </Card>
                )
            }

            {/* Step 6: Section 4 - Responses */}
            {
                activeFieldId === 'section4' && (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8 p-5 shadow-sm border-indigo-100 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="font-semibold text-slate-900">2. Counterfactual Feasibility</h3>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs font-medium bg-slate-800 text-slate-50 border-slate-700">
                                            <p>Assuming a public role was mandated, how feasible is it to implement in practice?</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex w-full bg-slate-100 p-1.5 rounded-lg border border-slate-200 shadow-inner">
                                    {[1, 2, 3, 4, 5].map((num) => {
                                        const isSelected = v3Data.counterfactualFeasibility === num.toString();
                                        return (
                                            <button
                                                key={num}
                                                onClick={() => handlePathAnswer('counterfactualFeasibility', num.toString())}
                                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${isSelected
                                                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between w-full px-2 text-[10px] text-slate-400 font-medium">
                                    <span>Very Low</span>
                                    <span>Very High</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Label className="font-semibold text-slate-900 block mb-1">Enforcement Mechanisms</Label>
                            <p className="text-[11px] text-slate-500 mb-3 italic">To prevent industry actors from sidestepping these rules (regulatory capture), which enforcement mechanisms would be most critical?</p>
                            <div className="grid grid-cols-1 gap-3 mb-4">
                                {Object.keys(EnforcementEscalationSchema.enum).map(esc => (
                                    <div key={esc} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={`esc-${esc}`}
                                            checked={(v3Data.enforcementEscalation || []).includes(esc)}
                                            onCheckedChange={(c) => {
                                                const cur = v3Data.enforcementEscalation || [];
                                                handlePathAnswer('enforcementEscalation', c ? [...cur, esc] : cur.filter((x: string) => x !== esc));
                                            }}
                                            className="mt-1"
                                        />
                                        <Label htmlFor={`esc-${esc}`} className="text-sm leading-tight text-slate-700 font-normal">
                                            {esc === 'disclosure_orders' ? 'Mandatory Disclosure (Transparency orders)' :
                                                esc === 'audits' ? 'Independent Audits (Third-party verification)' :
                                                    esc === 'fines' ? 'Financial Penalties (Fines for non-compliance)' :
                                                        esc === 'suspensions_withdrawals' ? 'Product Suspensions (Market withdrawal or deployment bans)' :
                                                            esc.replace(/_/g, ' ')}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )
            }

            {/* Step 7: Section 5 - Impacts */}
            {
                activeFieldId === 'section5' && (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8 p-5 shadow-sm border-indigo-100 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Label className="font-semibold text-slate-900 text-lg">Scenario Plausibility (1-5)</Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs font-medium bg-slate-800 text-slate-50 border-slate-700">
                                            <p>How realistic does this hypothetical chain of events seem, given the current real-world context? This explicitly centers on whether the generated counterfactual sequence actually makes sense and could realistically happen.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex w-full bg-slate-100 p-1.5 rounded-lg border border-slate-200 shadow-inner">
                                    {[1, 2, 3, 4, 5].map((num) => {
                                        const isSelected = v3Data.scenarioConfidence === num.toString();
                                        return (
                                            <button
                                                key={num}
                                                onClick={() => handlePathAnswer('scenarioConfidence', num.toString())}
                                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${isSelected
                                                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>
                )
            }

            {/* Step 8: Section 6 - Synthesis */}
            {
                activeFieldId === 'section6' && (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 p-5 shadow-sm border-indigo-100 mb-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                            <h3 className="font-semibold text-slate-900 text-lg">4. Synthesis & Insights</h3>
                            <JumpControls />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Label className="text-sm font-semibold text-slate-800">Innovative Ideas</Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs font-medium bg-slate-800 text-slate-50 border-slate-700">
                                            <p>Are there radical alternative governance mechanisms not covered above that could better empower {title}?</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2 italic">Example concerns: radical transparency boards, algorithmic restitution, community veto power...</p>
                            <textarea
                                className="w-full text-sm p-3 rounded-md border border-slate-300 min-h-[80px] shadow-sm focus:ring-2 focus:ring-indigo-500/50"
                                value={v3Data.innovativeIdeas || ''}
                                onChange={(e) => handlePathAnswer('innovativeIdeas', e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Label className="text-sm font-semibold text-slate-800">Cross-Disciplinary Insights</Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs font-medium bg-slate-800 text-slate-50 border-slate-700">
                                            <p>How could frameworks from ecology, sociology, or economics inform the inclusion of {title}?</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2 italic">Example concerns: systemic risk cascades, localized knowledge extraction, regulatory capture models...</p>
                            <textarea
                                className="w-full text-sm p-3 rounded-md border border-slate-300 min-h-[80px] shadow-sm focus:ring-2 focus:ring-indigo-500/50"
                                value={v3Data.crossDisciplinaryInsights || ''}
                                onChange={(e) => handlePathAnswer('crossDisciplinaryInsights', e.target.value)}
                            />
                        </div>

                        {(() => {
                            const missingSteps = steps.filter(s => s.completed < s.total);

                            if (missingSteps.length > 0) {
                                return (
                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm mt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                            <span className="text-sm font-bold text-amber-900">Incomplete Evaluation Sections</span>
                                        </div>
                                        <p className="text-xs text-amber-800 mb-2">Please complete the following sections before you can finish this case:</p>
                                        <ul className="list-disc list-inside text-xs text-amber-700 space-y-1 ml-1">
                                            {missingSteps.map(s => (
                                                <li key={s.id}>
                                                    <span className="font-semibold">{s.label}</span>
                                                    <span className="ml-1 opacity-80 pb-0.5 border-b border-amber-200 border-dashed">
                                                        ({s.completed}/{s.total} complete)
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            }

                            return (
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckSquare className="h-5 w-5 text-emerald-600" />
                                        <span className="text-sm font-bold text-emerald-900">Survey Complete!</span>
                                    </div>
                                    <p className="text-xs text-emerald-800">You have successfully completed all required evaluation sections. Please review your answers or click &quot;Finish & Next Case&quot;.</p>
                                </div>
                            );
                        })()}
                    </Card>
                )
            }

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrev}
                    disabled={currentStepIndex === 0}
                    className="text-slate-500"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                {currentStepIndex < steps.length - 1 ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNext}
                        disabled={activeFieldId === 'strength' && (v3Data.strength === undefined || v3Data.strength === null)}
                        className="text-slate-700"
                    >
                        Next Question <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                ) : (
                    <div /> // Empty div to maintain flex-between spacing
                )}
            </div>
        </div >
    );
}
