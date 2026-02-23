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
                    <CardTitle className="text-2xl font-bold text-slate-900">Research Study Information and Consent Form</CardTitle>
                    <div className="text-sm text-slate-500 mt-2 space-y-1">
                        <p><strong>Study Title:</strong> Expert Evaluation of &quot;Ghost Node&quot; Detection in AI Governance Policy Texts</p>
                        <p><strong>Principal Investigator:</strong> Tod Sedbrook, PhD (InstantTea Research Group)</p>
                        <p><strong>PI Email:</strong> Tod.Sedbrook@bears.unco.edu</p>
                        <p><strong>Version Date:</strong> February 22, 2026</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4 border p-4 rounded-md">
                        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                            <h3 className="font-semibold text-foreground">1. Invitation and Overview</h3>
                            <p>
                                You are invited to participate in a research study evaluating whether the InstantTea platform correctly flags potential &quot;Ghost Nodes&quot;: stakeholders or actors that may be materially relevant to governance outcomes but are absent from a policy text&apos;s formal roles, rights, obligations, remedies, oversight, or enforcement pathways.
                            </p>
                            <p>
                                If you agree to participate, you will review a set of cases drawn from AI governance legal and policy documents and provide expert ratings and brief comments.
                            </p>

                            <h3 className="font-semibold text-foreground">2. Purpose of the Study</h3>
                            <p>
                                The purpose of this study is to assess whether automated analysis correctly identifies potential constitutive absences in legal and policy texts. Your judgments will be used to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>establish an expert benchmark for model validation,</li>
                                <li>measure agreement across expert reviewers, and</li>
                                <li>refine InstantTea&apos;s detection criteria and outputs.</li>
                            </ul>

                            <h3 className="font-semibold text-foreground">3. Eligibility</h3>
                            <p>
                                You may participate if you:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>are 18 years of age or older, and</li>
                                <li>have relevant expertise (e.g., AI governance, law/policy, public administration, regulatory practice, STS/critical policy analysis, domain governance in high-impact sectors, or demonstrated familiarity with one or more jurisdictions).</li>
                            </ul>
                            <p>
                                If you do not meet these criteria, please do not participate.
                            </p>

                            <h3 className="font-semibold text-foreground">4. What You Will Do (Procedures)</h3>
                            <p>
                                If you agree to participate, you will be asked to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Complete a brief expertise profile (e.g., domain focus, role, familiarity with relevant jurisdictions).</li>
                                <li>Evaluate 10 cases of potential Ghost Nodes presented in the InstantTea interface.</li>
                            </ul>
                            <p>
                                For each case, provide:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>a rating of Strength of Absence (how compelling the absence appears given the text and context),</li>
                                <li>a rating or selection(s) regarding relevant governance mechanisms / institutional logics (as defined in the interface), and</li>
                                <li>brief comments supporting your judgment (optional but encouraged).</li>
                            </ul>
                            <p>
                                Time commitment: approximately 30–60 minutes.
                            </p>
                            <p>
                                Skipping and stopping: You may skip any question or case and may stop participation at any time.
                            </p>

                            <h3 className="font-semibold text-foreground">5. Voluntary Participation</h3>
                            <p>
                                Your participation is voluntary. You may discontinue at any time without penalty or loss of benefits to which you are otherwise entitled.
                            </p>

                            <h3 className="font-semibold text-foreground">6. Risks and Discomforts</h3>
                            <p>
                                Risks are minimal. Potential risks include:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Confidentiality risk if you include identifying details in free-text comments (please avoid this).</li>
                                <li>Minor discomfort when evaluating sensitive policy implications (e.g., impacts on marginalized groups, enforcement, surveillance, border/welfare/policing contexts).</li>
                                <li>Normal risks of computer use, including fatigue.</li>
                            </ul>
                            <p>
                                You may skip any item you find uncomfortable.
                            </p>

                            <h3 className="font-semibold text-foreground">7. Benefits</h3>
                            <p>
                                There is no direct personal benefit to you. The broader benefit is contributing to the development of tools for more transparent and accountable policy analysis and for improving how AI governance texts are evaluated for omission and exclusion.
                            </p>

                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md my-4">
                                <h3 className="font-bold text-amber-900 flex items-center mb-1">
                                    <span className="mr-2">💰</span> 8. Honorarium / Compensation
                                </h3>
                                <p className="text-amber-800">
                                    If you complete the study and submit your responses, you will receive an honorarium of <strong>$100.00 USD</strong>.
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-amber-800 mt-2">
                                    <li><strong>Partial completion:</strong> Honorarium is provided only upon full completion of all cases and final submission.</li>
                                    <li><strong>Payment timing:</strong> Payment is typically processed within 2–5 business days after completion, depending on the payment method and administrative constraints.</li>
                                    <li><strong>Payment method:</strong> Common options include PayPal or other mutually acceptable arrangements.</li>
                                    <li><strong>Security note:</strong> Please do not email bank account details. If payment information is needed, a secure method will be provided.</li>
                                    <li><strong>Tax note:</strong> Depending on institutional policy and your total compensation in a calendar year, compensation may be reportable for tax purposes.</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md my-4">
                                <h3 className="font-bold text-blue-900 flex items-center mb-1">
                                    <span className="mr-2">🔒</span> 9. Confidentiality and Data Separation (Important)
                                </h3>
                                <p className="text-blue-800">
                                    Study responses are collected without your name or email in the research dataset. You will be assigned (or will create) a random Evaluator Code. Your study responses stored on the server will be associated only with this Evaluator Code.
                                </p>
                                <p className="text-blue-800 mt-2 font-semibold">
                                    Please do not include personally identifying information in free-text comments.
                                </p>
                                <h4 className="font-bold text-blue-900 mt-4 mb-2">Payment and identity separation</h4>
                                <p className="text-blue-800">
                                    If you choose to receive the honorarium, you may need to contact the PI to arrange payment. To protect confidentiality:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-blue-800 mt-2">
                                    <li>Payment information will be stored in a separate payment record that is kept apart from the research response dataset.</li>
                                    <li>The payment record is used only to issue compensation and for required administrative tracking.</li>
                                    <li>Access to the payment record is restricted to authorized personnel and is not used in analysis of your study responses.</li>
                                </ul>
                                <p className="text-blue-800 mt-4">
                                    <strong>Best practice:</strong> When contacting the PI for payment, provide only the minimum information needed and, if requested, your Evaluator Code (or a separate payment token if the system provides one).
                                </p>
                            </div>

                            <h3 className="font-semibold text-foreground">10. What Data Are Collected</h3>
                            <p>
                                The study may collect:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Your expertise profile responses (non-identifying by design)</li>
                                <li>Your ratings, selections, and comments for each case</li>
                                <li>Session integrity data needed to support saving/resuming work (e.g., Evaluator Code, timestamps)</li>
                                <li><strong>Technical metadata:</strong> The system may log limited technical metadata for security and integrity purposes (e.g., timestamps, basic event logs, IP address, browser/device information). If collected, this metadata is used for system security, abuse prevention, and troubleshooting, and is not used to evaluate your answers. Where feasible, such metadata is stored separately from response content or access is restricted.</li>
                            </ul>

                            <h3 className="font-semibold text-foreground">11. Data Storage, Retention, and Security</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Storage:</strong> Responses may be saved during the session to prevent data loss and allow resumption, using your Evaluator Code. Data are stored on secure servers with access limited to the research team and/or authorized developers supporting the study infrastructure.</li>
                                <li><strong>Security:</strong> Reasonable security measures are used (e.g., access controls; encryption in transit; and, where configured, encryption at rest).</li>
                                <li><strong>Retention:</strong> De-identified study data will be retained for 3–5 years after study completion and/or publication to support analysis, verification, and audit requirements.</li>
                            </ul>

                            <h3 className="font-semibold text-foreground">12. Withdrawal and Deletion</h3>
                            <p>
                                You may withdraw at any time.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Before final submission:</strong> If you withdraw before final submission, you will have the option (in the interface, where available) to delete the server-stored responses associated with your Evaluator Code.</li>
                                <li><strong>After final submission:</strong> After submission, responses will be used in analysis in de-identified form and may be included in aggregated results.</li>
                                <li><strong>Deletion after submission:</strong> If you request deletion after submission, contact the PI and provide your Evaluator Code. Deletion is feasible only to the extent that your responses remain retrievable under the Evaluator Code, and the relevant results have not been irreversibly aggregated and/or the linking key has not been destroyed.</li>
                            </ul>

                            <h3 className="font-semibold text-foreground">13. Consent</h3>
                            <p>
                                By proceeding to the study interface and submitting responses, you indicate that:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>you are at least 18 years old,</li>
                                <li>you have read the information above,</li>
                                <li>you understand that participation is voluntary, and</li>
                                <li>you agree to participate.</li>
                            </ul>
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
