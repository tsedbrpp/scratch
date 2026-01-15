"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Search, GitBranch, ArrowLeft } from "lucide-react";

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-semibold text-slate-900">instantTEA</span>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-slate-600 hover:text-blue-600">
                            Skip to Dashboard
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                            <Globe className="h-4 w-4" />
                            Global Coverage
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            Global AI Policy Analysis
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            For this example analysis, we explore several global AI policies. Before exploring the data, understand the scope of our analysis. instantTEA compares regulatory frameworks across four key jurisdictions.
                        </p>
                    </div>

                    {/* Jurisdictions Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-16">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4">🇪🇺</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">EU AI Act</h3>
                            <p className="text-slate-600">
                                The world's first comprehensive AI law, focusing on risk categorization and fundamental rights impact assessments.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4">🇧🇷</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Brazil PL 2338</h3>
                            <p className="text-slate-600">
                                A rights-based approach regulating the development and use of AI, emphasizing civil liability and transparency.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4">🇮🇳</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">India DPDP Act</h3>
                            <p className="text-slate-600">
                                Focuses on digital personal data protection, establishing a framework for processing digital personal data.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4">🇺🇸</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Colorado AI Act</h3>
                            <p className="text-slate-600">
                                Focuses on preventing algorithmic discrimination in high-risk AI systems, one of the first state-level AI regulations in the US.
                            </p>
                        </div>
                    </div>

                    {/* Functionality Section */}
                    <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white mb-16">
                        <h2 className="text-2xl font-bold mb-8 text-center border-b border-slate-800 pb-8">System Capabilities</h2>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="flex flex-col gap-4">
                                <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Search className="h-6 w-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-100">Assemblage Discovery</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Identify and map the human and non-human actors that constitute these regulatory environments. See how policy documents enroll different agencies, technologies, and values.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <GitBranch className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-emerald-100">Trace Analysis</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Follow the trajectory of specific concepts (e.g., "risk", "sovereignty", "innovation") across different legal texts to see how their meaning shifts and evolves in different contexts.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 text-lg rounded-full shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all hover:scale-105">
                                Proceed to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
