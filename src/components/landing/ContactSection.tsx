"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
    return (
        <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-100 text-indigo-600 mb-2">
                        <Mail className="h-6 w-6" />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Still have questions?
                    </h2>

                    <p className="text-lg text-slate-600 leading-relaxed">
                        Whether you need help with your account, have questions about the methodology, or want to discuss enterprise options, we're here to help.
                    </p>

                    <div className="pt-4">
                        <a href="mailto:admin@instanttea.com">
                            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-lg h-auto">
                                <Mail className="mr-2 h-5 w-5" />
                                admin@instanttea.com
                            </Button>
                        </a>
                        <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
                            Response time: Within 24 hours
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
