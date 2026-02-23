"use client";

import { Send, Loader2, CheckCircle2 } from "lucide-react";
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

export function ContactForm() {
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

    if (isSuccess) {
        return (
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
        );
    }

    return (
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
    );
}
