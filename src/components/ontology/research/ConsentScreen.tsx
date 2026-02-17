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
                                You are invited to participate in a research study validating the detection of &quot;Ghost Nodes&quot; (missing actors) within policy ontologies.
                                This study uses the InstantTea platform to visualize policy networks.
                            </p>

                            <h3 className="font-semibold text-foreground">2. Purpose</h3>
                            <p>
                                The purpose of this study is to assess whether automated graph analysis correctly identifies constitutive absences in legal texts.
                                Your expertise will act as the ground truth for validating our computational models.
                            </p>

                            <h3 className="font-semibold text-foreground">3. Procedures</h3>
                            <p>
                                If you agree to participate, you will be asked to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Complete a brief profile regarding your expertise.</li>
                                <li>Complete a calibration exercise.</li>
                                <li>Evaluate 10 specific cases of potential &quot;Ghost Nodes&quot; as presented in the graph.</li>
                                <li>Provide ratings on the strength of absence and institutional logics.</li>
                            </ul>
                            <p>The estimated time for completion is 60-90 minutes.</p>

                            <h3 className="font-semibold text-foreground">4. Risks and Benefits</h3>
                            <p>
                                There are no known risks associated with this study beyond normal computer use.
                                The benefit is contributing to the development of tools for more transparent policy analysis.
                            </p>

                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md my-4">
                                <h3 className="font-bold text-amber-900 flex items-center mb-1">
                                    <span className="mr-2">💰</span> 5. Compensation
                                </h3>
                                <p className="text-amber-800">
                                    You will receive an honorarium of <strong>$100.00</strong> for completing this study.
                                    <br />
                                    Please email <strong>tod.sedbrook@bears.unco.edu</strong> with your preferred payment method (PayPal, Venmo, Zelle, or other arrangements) to receive payment.
                                </p>
                            </div>

                            <h3 className="font-semibold text-foreground">6. Confidentiality</h3>
                            <p>
                                Your responses will be pseudonymized using your Evaluator Code.
                                Your responses will be pseudonymized using your Evaluator Code.
                                Data is stored securely on your device and backed up to our secure server during the session to allow for resumption.
                                No personally identifiable information (PII) beyond your general expertise profile will be published.
                            </p>

                            <h3 className="font-semibold text-foreground">7. Data Handling</h3>
                            <p>
                                You have the right to withdraw your data at the end of the session before submission.
                                You have the right to withdraw your data at the end of the session before submission.
                                Your progress is automatically saved to ensure you do not lose work. Use the "End Survey" button to finalize your participation.
                            </p>

                            <h3 className="font-semibold text-foreground">8. Voluntary Participation & Questions</h3>
                            <p>
                                Your participation is voluntary. You may discontinue the study at any time.
                                If you have questions about the research or encounter technical issues, please contact the Principal Investigator, <strong>Tod Sedbrook</strong>, at <strong>Tod.Sedbrook@bears.unco.edu</strong>.
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
