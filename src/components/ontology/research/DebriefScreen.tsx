"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Download, X, Loader2, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
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
    const router = useRouter();



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

    const handleCloseFull = () => {
        onClose();
        router.push('/?view=landing');
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

                    <CardContent className="space-y-6 pt-6 px-6">
                        {/* Payment Reminder */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                💰 Honorarium Payment
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                To receive your honorarium, please submit how you would like to receive payment ( Zelle, PayPal, or Venmo). Please provide your account information. Send payment instructions to <a href="mailto:tod.sedbrook@bears.unco.edu" className="text-indigo-700 font-bold hover:underline">tod.sedbrook@bears.unco.edu</a>. For any other payment methods, please email instructions.
                            </p>
                        </div>

                        {/* Free Credits Invitation */}
                        <p className="text-sm text-slate-600 leading-relaxed">
                            We invite you to sign-up and log-in to receive 100 free credits to allow analysis of your policy documents. We are happy to honor any requests for more free credits for evaluation.
                        </p>

                        {/* Free Credits Alert */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start">
                            <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900">Earn Free Credits</h4>
                                <p className="text-xs text-blue-800 mt-1">
                                    Receive free credits for testing policy analysis with your own documents!
                                </p>
                            </div>
                        </div>

                        {/* Encouragement to Explore */}
                        <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                            <p>
                                We invite you to explore the advanced ontology tools and interactive features of InstantTea, designed for deep policy analysis.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 bg-slate-50/50 pt-0 pb-6 px-6">
                        <Button
                            onClick={handleCloseFull}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md text-base py-5"
                        >
                            Close Survey and Explore InstantTea
                        </Button>

                        <div className="flex justify-between w-full items-center mt-2">
                            <Button
                                variant="link"
                                onClick={() => router.push('/governance/contributor-credits')}
                                className="text-indigo-600 hover:text-indigo-800 font-medium px-0"
                            >
                                Learn How to Earn Free Credits <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
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
                        className={`w-full py-6 text-lg shadow-xl transition-all ${emailStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                            emailStatus === 'error' ? 'bg-amber-600 hover:bg-amber-700' :
                                'bg-indigo-600 hover:bg-indigo-700'
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
                            className="text-slate-400 hover:text-indigo-600"
                        >
                            <Download className="mr-1 h-3 w-3" /> Download copy for my records
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
