import React from 'react';
import { GhostNodeSurveyResponse, EvaluationConfig } from '@/lib/study-config';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface GhostNodeEvaluationFormProps {
    config?: EvaluationConfig;
    initialData?: GhostNodeSurveyResponse;
    onChange: (data: Partial<GhostNodeSurveyResponse>) => void;
}

export function GhostNodeEvaluationForm({ config, initialData, onChange }: GhostNodeEvaluationFormProps) {
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

    const handleAnswer = (field: keyof GhostNodeSurveyResponse, value: unknown) => {
        onChange({ [field]: value });
    };

    const handleDisambiguation = (id: string, value: string) => {
        const currentAns = initialData?.disambiguationAnswers || {};
        onChange({ disambiguationAnswers: { ...currentAns, [id]: value } });
    };

    const handleMechanismToggle = (mech: string) => {
        const currentMech = initialData?.feasibleMechanisms || [];
        if (currentMech.includes(mech)) {
            onChange({ feasibleMechanisms: currentMech.filter(m => m !== mech) });
        } else {
            onChange({ feasibleMechanisms: [...currentMech, mech] });
        }
    };

    const currentFeasibility = initialData?.feasibility || 0;
    const showMechanisms = currentFeasibility >= (safeConfig.feasibility?.mechanismGateThreshold || 40);

    return (
        <div className="space-y-8">
            {/* Step 1: Presence Gate */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">{safeConfig.presenceGateQuestion}</h3>
                    <RadioGroup
                        value={initialData?.absenceGate}
                        onValueChange={(val) => handleAnswer('absenceGate', val)}
                        className="flex gap-6"
                    >
                        {safeConfig.presenceGateOptions?.map(opt => (
                            <div key={opt} className="flex items-center space-x-2">
                                <RadioGroupItem value={opt} id={`gate-${opt}`} />
                                <Label htmlFor={`gate-${opt}`} className="capitalize">{opt}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Step 2: Disambiguation */}
            <Card className="shadow-sm">
                <CardContent className="pt-6 space-y-6">
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
                </CardContent>
            </Card>

            {/* Step 3: Strength of Absence */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-1">Strength of Absence</h3>
                    <p className="text-sm text-slate-500 mb-6">How strongly does this section omit a collective public role?</p>

                    <div className="px-2 mb-8">
                        <Slider
                            defaultValue={[initialData?.strength || 0]}
                            max={safeConfig.strengthAbsence?.max || 100}
                            min={safeConfig.strengthAbsence?.min || 0}
                            step={5}
                            onValueChange={(vals) => handleAnswer('strength', vals[0])}
                            className="bg-indigo-100"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium tracking-wide">
                            {safeConfig.strengthAbsence?.anchors.map(anchor => (
                                <span key={anchor.value} style={{ position: 'absolute', left: `${anchor.value}%`, transform: 'translateX(-50%)' }}>
                                    {anchor.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Step 4: Feasibility */}
            <Card className="shadow-sm border-purple-200">
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-1">Feasibility of Inclusion</h3>
                    <p className="text-sm text-slate-500 mb-6">How plausible would it be to incorporate a public role into this governance regime?</p>

                    <div className="px-2 mb-10">
                        <Slider
                            defaultValue={[currentFeasibility]}
                            max={safeConfig.feasibility?.max || 100}
                            min={safeConfig.feasibility?.min || 0}
                            step={10}
                            onValueChange={(vals) => handleAnswer('feasibility', vals[0])}
                            className="bg-purple-100"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium tracking-wide">
                            {safeConfig.feasibility?.anchors.map(anchor => (
                                <span key={anchor.value} style={{ position: 'absolute', left: `${anchor.value}%`, transform: 'translateX(-50%)' }}>
                                    {anchor.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {showMechanisms && (
                        <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                            <h4 className="font-medium text-sm text-slate-900 mb-3">If incorporated, how might they appear?</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {safeConfig.feasibility?.mechanismOptions.map(mech => (
                                    <div key={mech} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={`mech-${mech}`}
                                            checked={initialData?.feasibleMechanisms?.includes(mech)}
                                            onCheckedChange={() => handleMechanismToggle(mech)}
                                            className="mt-1"
                                        />
                                        <Label htmlFor={`mech-${mech}`} className="text-sm leading-tight text-slate-700 font-normal">
                                            {mech}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
