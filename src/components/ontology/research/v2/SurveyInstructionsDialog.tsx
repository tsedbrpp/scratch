import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, BookOpen, AlertCircle, Ghost, Target } from "lucide-react";

interface SurveyInstructionsDialogProps {
    children?: React.ReactNode;
}

export function SurveyInstructionsDialog({ children }: SurveyInstructionsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="h-7 px-2 text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 font-medium">
                        <Info className="h-4 w-4 mr-1.5" />
                        Survey Instructions & Guide
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-4 border-b bg-indigo-50 shrink-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-indigo-900">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                        Evaluator Guide & Instructions
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth pb-8 overflow-x-hidden">
                    <div className="space-y-8">
                        {/* What is a Ghost Node? */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                                <Ghost className="h-5 w-5 text-purple-600" />
                                What is a "Ghost Node"?
                            </h3>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-slate-700 leading-relaxed text-sm">
                                <p>
                                    A <strong>ghost node</strong> is a stakeholder, actor, or concept that may be materially relevant to a governance system or policy, but is <em>structurally absent</em> from the formal text.
                                    They are entities that are affected by, or could affect, the outcomes of the policy, yet are omitted from formally defined roles, rights, obligations, or enforcement pathways.
                                </p>
                            </div>
                        </section>

                        {/* Survey Intent */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                                <Target className="h-5 w-5 text-blue-600" />
                                Intent of this Survey
                            </h3>
                            <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
                                <p>
                                    The purpose of this validation study is to independently assess if the AI-identified "ghost nodes" are truly absent from the provided policy excerpts, and if so, whether that absence matters.
                                </p>
                                <p>
                                    We rely on your domain expertise to evaluate whether the highlighted excerpts genuinely omit the specified actor, and whether providing them a formal role would meaningfully impact the policy's outcomes or compliance mechanisms.
                                </p>
                            </div>
                        </section>

                        {/* How to Evaluate */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                How to Evaluate Each Case
                            </h3>
                            <div className="space-y-4">
                                <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h4 className="font-semibold text-slate-900 mb-2">1. Read the Context</h4>
                                    <p className="text-sm text-slate-600">Review the title and the "Why absent?" reasoning. Then, carefully read the provided excerpts from the policy document. We have highlighted key sections that the AI analyzed.</p>
                                </div>

                                <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h4 className="font-semibold text-slate-900 mb-2">2. Check for Presence</h4>
                                    <p className="text-sm text-slate-600">Consider whether the ghost node is actually assigned a role in the text. Sometimes they are mentioned, but only descriptively. Is there a concrete governance mechanism (like a right to be heard, or an obligation to act) explicitly designated to them?</p>
                                </div>

                                <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h4 className="font-semibold text-slate-900 mb-2">3. Assess the Impact</h4>
                                    <p className="text-sm text-slate-600">If they are absent, how strong is the omission? Navigate the survey tabs to rate the strength of absence and identify the resulting perceived gaps, institutional logics, and potential governance impacts.</p>
                                </div>

                                <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h4 className="font-semibold text-slate-900 mb-2">4. Ground Your Answers</h4>
                                    <p className="text-sm text-slate-600">Whenever possible, tie your evaluations back to the specific text. The survey requires you to specify whether you are relying strictly on the evidence provided or supplementing it with your own expertise.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end shrink-0">
                    <DialogTrigger asChild>
                        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">Understood, Close</Button>
                    </DialogTrigger>
                </div>
            </DialogContent>
        </Dialog>
    );
}
