import Link from "next/link";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import type { Metadata } from 'next';
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
    title: 'Contact Us | InstantTea',
    description: 'Get in touch with the InstantTea team for research questions, account issues, or enterprise inquiries related to our AI governance mapping tools.',
};

export default function ContactPage() {

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
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}


