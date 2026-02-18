"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Loader2, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StudyState } from '@/lib/study-config';
import { sendStudyResultsEmail } from '@/app/actions/research';
import { toast } from 'sonner';

interface DebriefScreenProps {
    studyState: StudyState;
    onDownload: () => void;
    onClose: () => void;
}

export function DebriefScreen({ studyState, onDownload, onClose }: DebriefScreenProps) {
    const [showReengagement, setShowReengagement] = React.useState(false);
    const [emailStatus, setEmailStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');



    const handleEmailClick = async () => {
        setEmailStatus('sending');
        try {
            // 1. Trigger Email
            const result = await sendStudyResultsEmail(studyState);

            // 2. Even if email fails, we consider it "success" for the user IF we know Redis backup is active.
            // But to be transparent, we checks result.success.
            // Actually, for better UX, if email fails, we can just say "Submitted" if we trust Redis?
            // Let's stick to reporting truth but being gentle.

            if (result.success) {
                setEmailStatus('success');
                toast.success("Results submitted successfully!");
                setTimeout(() => setShowReengagement(true), 1500); // Auto-advance
            } else {
                setEmailStatus('error');
                toast.error("Email submission failed, but your data is safely backed up.");
                // Allow advancing anyway because of Redis backup logic
                setTimeout(() => setShowReengagement(true), 2000);
            }
        } catch {
            setEmailStatus('error');
            setTimeout(() => setShowReengagement(true), 2000);
        }
    };

    if (showReengagement) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden bg-white relative animate-in zoom-in-95 duration-300">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                        <Sparkles className="mx-auto h-12 w-12 text-yellow-300 mb-2 animate-pulse" />
                        <h2 className="text-2xl font-bold text-white mb-1">Thank You! 🎉</h2>
                        <p className="text-indigo-100 text-sm">Your contribution is invaluable.</p>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-[420px]">
                            <CardContent className="space-y-6 pt-6 px-6">
                                {/* Honorarium Payment */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                        💰 Honorarium payment
                                    </h3>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        To receive your <strong>$100 honorarium</strong>, please choose a payment method and provide the minimum identifier below.
                                    </p>
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                                        <div className="grid grid-cols-[100px_1fr] items-start gap-2 text-sm">
                                            <span className="font-bold text-slate-900">PayPal:</span>
                                            <span className="text-slate-600">PayPal email</span>

                                            <span className="font-bold text-slate-900">Venmo:</span>
                                            <span className="text-slate-600">@username</span>

                                            <span className="font-bold text-slate-900">Zelle:</span>
                                            <span className="text-slate-600">email address (preferred) or phone number</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">
                                        Please do not enter bank account numbers, passwords, or security codes.
                                    </p>
                                    <p className="text-xs text-slate-500 italic">
                                        Payments are typically processed within 48 hours of submission.
                                    </p>
                                    <div className="pt-1">
                                        <p className="text-sm text-slate-700">
                                            Send payment instructions to <a href="mailto:tod.sedbrook@bears.unco.edu" className="text-indigo-700 font-bold hover:underline">tod.sedbrook@bears.unco.edu</a>.
                                        </p>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-slate-100/50">
                                        <p className="text-sm font-semibold text-slate-900 mb-1">If you prefer another payment method:</p>
                                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                            Please email <a href="mailto:tod.sedbrook@bears.unco.edu" className="text-indigo-700 font-medium hover:underline">tod.sedbrook@bears.unco.edu</a> with:
                                        </p>
                                        <ul className="list-disc ml-4 text-xs text-slate-600 space-y-1 mb-2">
                                            <li>Your preferred method (e.g., ACH via university system, check, gift card, etc.)</li>
                                            <li>Your country (if outside the U.S.), so we can choose a compatible option</li>
                                        </ul>
                                        <p className="text-[10px] text-slate-400 leading-tight italic">
                                            Do not email bank account numbers, passwords, or security codes. We will reply with a secure way to provide any required details.
                                        </p>
                                    </div>
                                </div>

                                {/* Optional: InstantTea credits */}
                                <div className="pt-4 border-t border-slate-100 space-y-2">
                                    <h3 className="font-bold text-slate-900">
                                        Optional: InstantTea credits (unrelated to payment)
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        If you&apos;d like to explore InstantTea with your own AI governance documents, you may create an account to receive <strong>100 free credits</strong>. This is completely optional and not required to receive your honorarium.
                                    </p>
                                </div>
                            </CardContent>
                        </ScrollArea>
                    </div>

                    <CardFooter className="flex flex-col gap-3 bg-slate-50/50 pt-0 pb-6 px-6">
                        <Button
                            onClick={() => {
                                window.location.href = '/?view=landing';
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md text-base py-5 font-bold"
                        >
                            Explore InstantTea
                        </Button>

                        <Button
                            onClick={() => {
                                window.location.href = '/sign-up';
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-base py-5 font-bold"
                        >
                            Create an account
                        </Button>

                        <div className="flex justify-end w-full items-center mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDownload}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                <Download className="h-3 w-3 mr-1" /> My Data
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden bg-white relative animate-in fade-in zoom-in-95 duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 z-20"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="bg-gradient-to-r from-green-400 to-emerald-600 relative overflow-hidden pb-8">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -right-10 text-white/10 transform rotate-12">
                        <CheckCircle2 className="w-64 h-64" />
                    </div>
                    <CardHeader className="relative z-10 text-center pt-8 pb-2 text-white">
                        <div className="mx-auto bg-white/20 backdrop-blur-md p-3 rounded-full mb-4 w-20 h-20 flex items-center justify-center shadow-lg border border-white/30">
                            <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-shadow-sm tracking-tight">Study Complete!</CardTitle>
                        <p className="text-green-50 text-lg font-medium mt-2">Thank you for your contribution.</p>
                    </CardHeader>
                </div>

                <CardContent className="space-y-6 text-center pt-8">
                    <p className="text-muted-foreground leading-relaxed">
                        Please submit your results to complete the session.
                        <br />
                        <span className="text-xs text-slate-400">(Your data is explicitly backed up to our secure server)</span>
                    </p>

                    <Button
                        onClick={handleEmailClick}
                        disabled={emailStatus !== 'idle'}
                        size="lg"
                        className={`w-full py-6 text-lg shadow-xl transition-all text-white ${emailStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                            emailStatus === 'error' ? 'bg-amber-600 hover:bg-amber-700' :
                                'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                    >
                        {emailStatus === 'sending' ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Results <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>

                    {/* Optional backup download if they want it */}
                    <div className="pt-2">
                        <Button
                            variant="link"
                            size="sm"
                            onClick={onDownload}
                            className="text-slate-400 hover:text-emerald-600"
                        >
                            <Download className="mr-1 h-3 w-3" /> Download copy for my records
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
