import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { STUDY_CASES } from '@/lib/study-config';

interface CalibrationModalProps {
    onComplete: (rating: string) => void;
    onReset?: () => void;
}

export function CalibrationModal({ onComplete, onReset }: CalibrationModalProps) {
    // Use the calibration case from config
    const calibrationCase = STUDY_CASES.find(c => c.isCalibration);

    // Local state for the "Answer"
    const [rating, setRating] = useState<string | null>(null);

    if (!calibrationCase) return null;

    const handleComplete = () => {
        if (rating) {
            onComplete(rating);
        }
    };

    return (
        <Dialog open={true}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Calibration Case: {calibrationCase.title}</DialogTitle>
                    <DialogDescription>
                        Before beginning the main study, please evaluate this calibration case to familiarize yourself with the rating scale.
                        <br />
                        <strong>Task:</strong> Read the evidence and determine if the actor is a &quot;Ghost Node&quot; (Constitutive Absence).
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden py-4">
                    {/* Left: Evidence Panes */}
                    <div className="space-y-4 overflow-y-auto pr-2">
                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Pane 1: Document Evidence</h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {calibrationCase.pane1.evidencePoints.map((pt, i) => (
                                        <li key={i}>{pt}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Pane 2: Interpretive Claim</h4>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="font-semibold block">Hypothesis:</span>
                                        {calibrationCase.pane2.hypothesis}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Reasoning:</span>
                                        {calibrationCase.pane2.reasoning}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Interaction */}
                    <div className="space-y-6 overflow-y-auto pl-2 border-l">
                        <div className="space-y-4 bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                            <h4 className="font-semibold text-blue-900 border-b border-blue-200 pb-2">Reference Scale</h4>
                            <div className="space-y-4 text-sm relative">
                                {/* Visual Gradient Bar */}
                                <div className="h-4 w-full rounded-full bg-gradient-to-r from-slate-300 via-blue-300 to-indigo-600 relative my-6 shadow-inner">
                                    <div className="absolute -bottom-6 left-0 text-xs text-slate-500 font-medium">0 (Exclusion)</div>
                                    <div className="absolute -bottom-6 right-0 text-xs text-indigo-700 font-medium">100 (Ghost Node)</div>
                                    {/* Markers */}
                                    <div className="absolute top-0 bottom-0 left-[40%] border-r-2 border-white/50 border-dashed"></div>
                                    <div className="absolute top-0 bottom-0 left-[80%] border-r-2 border-white/50 border-dashed"></div>
                                </div>

                                <div className="grid gap-3 pt-2">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-3 h-3 rounded-full bg-slate-400 mt-1 shrink-0"></div>
                                        <div>
                                            <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">0 - 40: Scope Exclusion</span>
                                            <p className="text-slate-600">Actor is legitimately outside the policy boundary (e.g., unrelated stakeholder).</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1 shrink-0"></div>
                                        <div>
                                            <span className="font-bold text-indigo-700 block text-xs uppercase tracking-wider">80 - 100: Constitutive Absence</span>
                                            <p className="text-indigo-800">Actor is critical for the policy's function but systematically silenced/excluded.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base">Based on the evidence, how would you rate this absence?</Label>
                            <RadioGroup onValueChange={setRating} className="space-y-2">
                                <div className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50 transition cursor-pointer">
                                    <RadioGroupItem value="low" id="r-low" />
                                    <Label htmlFor="r-low" className="cursor-pointer font-normal">Low (0-40) - Likely Scope Exclusion</Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50 transition cursor-pointer">
                                    <RadioGroupItem value="med" id="r-med" />
                                    <Label htmlFor="r-med" className="cursor-pointer font-normal">Medium (41-79) - Contested / Ambiguous</Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50 transition cursor-pointer">
                                    <RadioGroupItem value="high" id="r-high" />
                                    <Label htmlFor="r-high" className="cursor-pointer font-normal">High (80-100) - Constitutive Ghost Node</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Attention Check / Validation could be added here */}
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between flex-col-reverse sm:flex-row gap-2">
                    <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onReset}>
                        Reset Progress
                    </Button>
                    <Button onClick={handleComplete} disabled={!rating} size="lg" className="w-full sm:w-auto">
                        Start Main Study
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
