import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentScreenProps {
    onConsent: () => void;
    onDecline: () => void;
}

export function ConsentScreen({ onConsent, onDecline }: ConsentScreenProps) {
    const [agreed, setAgreed] = React.useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-xl bg-white">
                <CardHeader className="border-b bg-slate-50/50 pb-6">
                    <CardTitle className="text-2xl font-bold text-slate-900">Informed Consent Form</CardTitle>
                    <p className="text-sm text-slate-500">InstantTea Logic Validation Study • Principal Investigator: Tod Sedbrook</p>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4 border p-4 rounded-md">
                        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                            <h3 className="font-semibold text-foreground">1. Introduction</h3>
                            <p>
                                You are invited to participate in a research study evaluating whether the InstantTea platform correctly flags potential &quot;Ghost Nodes&quot; (stakeholders or actors that may be materially relevant to governance but absent from a policy text&apos;s formal roles, rights, obligations, or enforcement pathways). This study asks you to review and rate specific cases drawn from AI governance policy documents.
                            </p>

                            <h3 className="font-semibold text-foreground">2. Purpose</h3>
                            <p>
                                The purpose of this study is to assess whether automated analysis correctly identifies potential constitutive absences in legal and policy texts. Your judgments will provide an expert benchmark for validating our computational models and refining the detection criteria.
                            </p>

                            <h3 className="font-semibold text-foreground">3. Procedures</h3>
                            <p>
                                If you agree to participate, you will be asked to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Complete a brief profile regarding your expertise (e.g., domain focus and familiarity with relevant jurisdictions).</li>
                                <li>Evaluate 10 cases of potential &quot;Ghost Nodes&quot; presented in the InstantTea interface.</li>
                                <li>For each case, provide ratings on (a) strength of absence and (b) relevant governance mechanisms/institutional logics, with short comments.</li>
                            </ul>
                            <p>Estimated time for completion: 30–60 minutes. You may stop participation at any time.</p>

                            <h3 className="font-semibold text-foreground">4. Risks and Benefits</h3>
                            <p>
                                Risks are minimal and are primarily related to confidentiality of responses and normal computer use. Some participants may experience minor discomfort when evaluating sensitive policy implications. There is no direct benefit to you; the benefit is contributing to the development of tools for more transparent and accountable policy analysis.
                            </p>

                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md my-4">
                                <h3 className="font-bold text-amber-900 flex items-center mb-1">
                                    <span className="mr-2">💰</span> 5. Honorarium
                                </h3>
                                <p className="text-amber-800">
                                    You will receive an honorarium of <strong>$100.00 USD</strong> for completing this study. Payment is typically processed within 48 hours of submission.
                                    <br />
                                    To arrange payment, please contact <strong>Tod.Sedbrook@bears.unco.edu</strong>. Please do not email bank account details. If needed, we will provide a secure method for payment information. (Common options include PayPal or other mutually acceptable arrangements.)
                                </p>
                            </div>

                            <h3 className="font-semibold text-foreground">6. Confidentiality</h3>
                            <p>
                                Your responses are collected without your name or email. You will be assigned a random Evaluator Code. Responses stored on the server are associated only with this Evaluator Code and are not linked to your identity.
                                <br />
                                Please avoid including personally identifying information in any free-text comments.
                                <br />
                                You will have the option to download a copy of your responses during and/or at the end of the study (depending on the interface).
                            </p>

                            <h3 className="font-semibold text-foreground">7. Data Handling and Withdrawal</h3>
                            <p>
                                To prevent data loss and allow resumption, your in-progress responses may be saved to the server under your Evaluator Code during the session.
                                <br />
                                You may withdraw at any time before final submission. If you withdraw before submission, you will be given an option to delete the server-stored responses associated with your Evaluator Code.
                                <br />
                                After submission, your responses will be used in analysis in de-identified form and may be included in aggregated results. If you wish to request deletion after submission, contact the Principal Investigator and provide your Evaluator Code. (Deletion is feasible only to the extent responses remain retrievable under the Evaluator Code and have not been irreversibly aggregated.)
                            </p>

                            <h3 className="font-semibold text-foreground">8. Voluntary Participation and Questions</h3>
                            <p>
                                Your participation is voluntary. You may discontinue the study at any time.
                                <br />
                                If you have questions about the research or encounter technical issues, please contact the Principal Investigator:
                                <br />
                                <strong>Tod Sedbrook, PhD</strong>
                                <br />
                                Email: <strong>Tod.Sedbrook@bears.unco.edu</strong>
                            </p>
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col gap-4 pt-6 border-t bg-muted/20">
                    <div className="flex items-center space-x-2 pt-4 pb-4">
                        <Checkbox id="consent-agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
                        <Label htmlFor="consent-agree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I have read the above information and agree to participate in this study.
                        </Label>
                    </div>
                    <div className="flex justify-between w-full pb-4 pr-4">
                        <Button variant="ghost" onClick={onDecline} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                            Decline & Exit
                        </Button>
                        <Button
                            onClick={onConsent}
                            disabled={!agreed}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px] shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            I Consent to Participate
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
