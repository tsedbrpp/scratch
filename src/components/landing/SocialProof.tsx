


import React from "react";
import { Terminal, Shield, Cpu, CreditCard } from "lucide-react";

export function SocialProof() {
    return (

        <div className="bg-slate-50 py-16 border-b border-slate-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <p className="text-center text-sm font-semibold text-emerald-600 mb-12 uppercase tracking-widest">
                    Trusted by Researchers & Policy Analysts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Testimonial 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-slate-600 italic mb-4">
                            "Instant TEA saved me hours of initial mapping for my paper on the AI Act. It found connections I would have missed."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">JD</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Dr. Jane D.</p>
                                <p className="text-xs text-slate-500">AI Governance Researcher</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-slate-600 italic mb-4">
                            "Finally, a tool that respects the nuance of Actor-Network Theory while automating the grunt work. Essential for my fieldwork."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">MK</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Marco K.</p>
                                <p className="text-xs text-slate-500">PhD Candidate, STS</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-slate-600 italic mb-4">
                            "The comparative lens features unlocked a whole new dimension for my policy critique. Highly recommended."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">SL</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Sarah L.</p>
                                <p className="text-xs text-slate-500">Policy Analyst</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center border-t border-slate-200 pt-8">
                    <p className="text-xs text-slate-400">
                        Powered by state-of-the-art AI models for accurate, up-to-date mappings.
                    </p>
                </div>
            </div>
        </div>
    );
}
