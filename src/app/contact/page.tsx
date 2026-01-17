"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 px-8 py-10 text-white text-center">
                        <h1 className="text-3xl font-bold tracking-tight mb-4">Contact Us</h1>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                            We're here to help with your research, account, or enterprise inquiries.
                        </p>
                    </div>

                    <div className="p-8 md:p-12 space-y-12">
                        {/* Primary Contact */}
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-100 text-indigo-600">
                                <Mail className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Email Support</h3>
                                <p className="text-slate-500 mt-2">
                                    For all general inquiries, support requests, and bug reports.
                                </p>
                            </div>
                            <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800 px-8">
                                <a href="mailto:admin@instanttea.com">
                                    admin@instanttea.com
                                </a>
                            </Button>
                            <p className="text-sm text-slate-400">
                                Typical response time: Less than 24 hours
                            </p>
                        </div>

                        {/* Additional Info / Office (Optional/Placeholder) */}
                        <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row gap-8 justify-center items-center text-center md:text-left">
                            <div className="max-w-md">
                                <h4 className="font-semibold text-slate-900 flex items-center gap-2 justify-center md:justify-start">
                                    <MapPin className="h-4 w-4 text-slate-500" />
                                    Mailing Address
                                </h4>
                                <p className="text-sm text-slate-600 mt-2">
                                    instantTEA Research Group<br />
                                    (Digital Only Operating Entity)<br />
                                    Global
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
