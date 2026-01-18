"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActionState, useEffect, useState } from "react";
import { sendContactEmail } from "@/app/actions/contact";
import { toast } from "sonner";

const initialState = {
    success: false,
    error: ""
};

export default function ContactPage() {
    // React 19 / Next.js 15: useActionState (formerly useFormState)
    // If on older versions, use useFormState from react-dom
    const [state, formAction, isPending] = useActionState(sendContactEmail, initialState);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (state.success) {
            toast.success("Message sent successfully!");
            setIsSuccess(true);
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Info Panel */}
                    <div className="bg-slate-900 text-white p-10 lg:p-12 flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-4">Contact Us</h1>
                            <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                We're here to help with your research questions, account issues, or enterprise inquiries.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-white/10 shrink-0">
                                        <Mail className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Email Support</h3>
                                        <p className="text-slate-400 text-sm mt-1">Typical response time: &lt; 24h</p>
                                        <a href="mailto:support@instanttea.com" className="text-emerald-400 text-sm hover:underline mt-1 block">
                                            support@instanttea.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-white/10 shrink-0">
                                        <MapPin className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Locations</h3>
                                        <p className="text-slate-400 text-sm mt-1">
                                            Global (Digital Operating Entity)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 lg:mt-0">
                            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                                <blockquote className="text-slate-300 italic text-sm">
                                    "Communication is the first step in translating the social."
                                </blockquote>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form Panel */}
                    <div className="p-10 lg:p-12 bg-white">
                        {isSuccess ? (
                            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                                <p className="text-slate-500 mb-8 max-w-xs">
                                    Thank you for reaching out. We've received your message and will get back to you shortly.
                                </p>
                                <Button
                                    onClick={() => setIsSuccess(false)}
                                    variant="outline"
                                    className="border-slate-200"
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" placeholder="Dr. Jane Doe" required className="bg-slate-50 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="jane@university.edu" required className="bg-slate-50 border-slate-200" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" name="subject" placeholder="Question about Academic Grants..." required className="bg-slate-50 border-slate-200" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Tell us how we can help..."
                                        required
                                        className="min-h-[150px] bg-slate-50 border-slate-200 resize-none"
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                    {/* Honeypot Field - Hidden from humans */}
                                    <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                                    {!process.env.NEXT_PUBLIC_SMTP_CONFIGURED && (
                                        <p className="text-[10px] text-slate-400 text-center mt-3">
                                            (Note: In Demo Mode, messages are simulated)
                                        </p>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
