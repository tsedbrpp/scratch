

import React from "react";
import { Upload, Search, Share2, ArrowRight } from "lucide-react";

export function StepByStep() {
    return (
        <div id="features" className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        From Text to Topology in 3 Steps
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-slate-600">
                        Policy Prism streamlines the complex process of structural policy analysis.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">

                        {/* Step 1 */}
                        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Upload className="h-8 w-8" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-slate-900 mb-3 text-center">
                                1. Upload Documents
                            </dt>
                            <dd className="flex flex-auto flex-col text-sm leading-6 text-slate-600 text-center">
                                <p className="flex-auto">
                                    Drag and drop one or more policy documents (PDF, Docx).
                                    The system automatically extracts text and prepares it for analysis.
                                </p>
                            </dd>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Search className="h-8 w-8" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-slate-900 mb-3 text-center">
                                2. Select Your Lenses
                            </dt>
                            <dd className="flex flex-auto flex-col text-sm leading-6 text-slate-600 text-center">
                                <p className="flex-auto">
                                    Choose strict theoretical lenses (e.g., "Legitimacy", "Justification") to filter the analysis.
                                    Our AI traces actors and actants based on your specific framework.
                                </p>
                            </dd>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-sm border border-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Share2 className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-slate-900 mb-3 text-center">
                                3. Visualize & Export
                            </dt>
                            <dd className="flex flex-auto flex-col text-sm leading-6 text-slate-600 text-center">
                                <p className="flex-auto">
                                    Interact with the dynamic force-directed graph.
                                    Export your "Assemblage Snapshot" as a high-res PDF for your paper or presentation.
                                </p>
                            </dd>
                        </div>

                    </dl>
                </div>
            </div>
        </div>
    );
}
