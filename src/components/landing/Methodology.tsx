"use client";

import React from "react";
import { Database, Cpu, GitGraph, Play } from "lucide-react";

export function Methodology() {
    return (
        <div className="py-24 sm:py-32 bg-slate-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">Methodology</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        From Archive to Insight
                    </p>
                    <p className="mt-6 text-lg leading-8 text-slate-600">
                        A systematic approach to analyzing complex textual datasets through multiple theoretical lenses.
                    </p>

                    {/* Video Panel */}
                    <div className="mt-12 w-full max-w-4xl mx-auto">
                        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <div className="p-1 bg-indigo-500/20 rounded">
                                        <Play className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    Introduction To instantTEA
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    A video exploration of the need for instantTEA.
                                </p>
                            </div>
                            <div className="aspect-video w-full bg-black relative">
                                <video
                                    controls
                                    className="w-full h-full object-contain"
                                    poster="/landing-bg.png"
                                >
                                    <source src="/assemblagebr.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                                    <Database className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Data Ingestion
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">
                                    Upload PDFs, scrape web traces, and organize your primary sources. The system automatically extracts text and prepares it for analysis.
                                </p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                                    <Cpu className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                AI-Powered Analysis
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">
                                    Apply specific theoretical lenses (Resistance, Cultural Framing, Institutional Logics) using advanced LLMs to extract structured insights.
                                </p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-600">
                                    <GitGraph className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Network Synthesis
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">
                                    Visualize relationships between actors, concepts, and documents. Detect cultural holes and generate comparative reports.
                                </p>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
