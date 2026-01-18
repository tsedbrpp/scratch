

import React from "react";
import { Upload, Search, Share2, ArrowRight } from "lucide-react";

export function StepByStep() {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        From Text to Topology in 3 Steps
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-slate-600">
                        Instant TEA streamlines the complex process of Actor-Network Theory mapping.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">

                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
                                <Upload className="h-8 w-8 text-indigo-600" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-slate-900">
                                1. Upload Documents
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">
                                    Drag and drop one or more policy documents (PDF, Docx).
                                    The system automatically extracts text and prepares it for analysis.
                                </p>
                            </dd>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                                <Search className="h-8 w-8 text-emerald-600" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-slate-900">
                                2. Select Your Lenses
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">
                                    Choose strict theoretical lenses (e.g., "Legitimacy", "Justification") to filter the analysis.
                                    Our AI traces actors and actants based on your specific framework.
                                </p>
                            </dd>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 border border-purple-100">
                                <Share2 className="h-8 w-8 text-purple-600" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-slate-900">
                                3. Visualize & Export
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
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
