import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ConsentContent } from './ConsentContent';

interface ConsentScreenProps {
    onConsent: () => void;
    onDecline: () => void;
}

export function ConsentScreen({ onConsent, onDecline }: ConsentScreenProps) {
    const [agreed, setAgreed] = React.useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 md:p-8">
            <Card className="w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[95vh] flex flex-col shadow-2xl bg-white border-none rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-slate-50/80 pb-6">
                    <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">Research Study Information and Consent Form</CardTitle>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mt-3 pt-2">
                        <span className="flex items-center gap-1.5"><strong className="text-slate-900">Study Title:</strong> Expert Evaluation of &quot;Ghost Node&quot; Detection in AI Governance Policy Texts</span>
                        <span className="flex items-center gap-1.5"><strong className="text-slate-900">Principal Investigator:</strong> Tod Sedbrook, PhD (InstantTea Research Group)</span>
                        <span className="flex items-center gap-1.5"><strong className="text-slate-900">PI Email:</strong> Tod.Sedbrook@bears.unco.edu</span>
                        <span className="flex items-center gap-1.5"><strong className="text-slate-900">Version Date:</strong> February 22, 2026</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
                    <div className="h-full px-8 py-6">
                        <ConsentContent />
                    </div>
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
