"use client";

import React from "react";
import Image from "next/image";
import { Lock, Shield, Database, GitGraph } from "lucide-react";

export function TrustEthics() {
    return (
        <div className="py-24 sm:py-32 bg-slate-900 text-slate-300">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Trust, Ethics & Privacy</h2>
                        <p className="mt-6 text-lg leading-8">
                            Built for critical research with a commitment to data sovereignty and transparency.
                        </p>
                    </div>
                    <div className="lg:w-1/2 relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                        <Image
                            src="/trust-ethics.png"
                            alt="Digital Trust and Privacy"
                            width={800}
                            height={600}
                            className="relative rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-auto hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <div className="flex flex-col">
                        <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                            <Lock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                            Data Handling & Privacy
                        </dt>
                        <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                            <p className="flex-auto">
                                Uploaded documents are stored securely and are <strong>never used to train public AI models</strong>. You retain full ownership of your data. Files can be permanently deleted from our servers at any time.
                            </p>
                        </dd>
                    </div>
                    <div className="flex flex-col">
                        <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                            <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
                            Research Context
                        </dt>
                        <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                            <p className="flex-auto">
                                Developed as part of academic research on using AI for critical analysis. This open-source tool is designed to reveal power structures, not reinforce them.
                            </p>
                        </dd>
                    </div>
                </div>

                {/* Privacy Badges */}
                <div className="mt-16 pt-10 border-t border-white/10 flex flex-wrap justify-center gap-8 opacity-80">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-slate-300">GDPR Ready</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <Lock className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">End-to-End Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <Database className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-slate-300">No Model Training</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <GitGraph className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-slate-300">Open Source</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
