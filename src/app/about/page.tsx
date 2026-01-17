
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, GitBranch, Globe } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
                        Bridging Policy Intent <br className="hidden sm:block" /> and Reality
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        instantTEA is an open-source research initiative designed to map, analyze, and critique the complex ecosystems of global AI governance.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-24">
                    <div className="prose prose-lg prose-slate text-slate-600">
                        <h3 className="flex items-center gap-3 text-indigo-600 font-semibold mb-4">
                            <BookOpen className="h-6 w-6" /> Our Mission
                        </h3>
                        <p>
                            We aim to provide researchers, activists, and policymakers with the tools to decompose complex legal texts and regulatory frameworks. By visualizing the "assemblages"—the mix of actors, laws, technologies, and ideologies—we reveal where power truly lies.
                        </p>
                    </div>
                    <div className="prose prose-lg prose-slate text-slate-600">
                        <h3 className="flex items-center gap-3 text-indigo-600 font-semibold mb-4">
                            <GitBranch className="h-6 w-6" /> Our Origin
                        </h3>
                        <p>
                            Born from academic research into "Decolonial Situatedness in Global AI Governance," this project specifically examines the tensions between Western regulatory models (like the EU AI Act) and the unique realities of the Global South (e.g., Brazil's PL 2338).
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-8 mb-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Core Values</h2>
                    <div className="grid sm:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Human-Centric</h3>
                            <p className="text-sm text-slate-600">Technology should serve human rights and dignity, not just efficiency.</p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                <Globe className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Data Sovereignty</h3>
                            <p className="text-sm text-slate-600">Your research data belongs to you. We enable local analysis and deletion.</p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <GitBranch className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Critical Openness</h3>
                            <p className="text-sm text-slate-600">Open source code allows anyone to verify our methods and bias.</p>
                        </div>
                    </div>
                </div>
            </div>
            <LandingFooter />
        </div>
    );
}
