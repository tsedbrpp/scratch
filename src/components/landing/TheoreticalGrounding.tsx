"use client";

import React from "react";

export function TheoreticalGrounding() {
    return (
        <div className="bg-slate-950 py-16 border-b border-slate-900 relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:text-center mb-12">
                    <h2 className="text-base font-semibold leading-7 text-emerald-400">Theoretical Grounding</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Why &quot;Translational, Ephemeral Assemblages&quot;?
                    </p>
                </div>
                <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
                    <div className="flex flex-col bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 group hover:-translate-y-1">
                        <dt className="flex items-center gap-x-3 text-xl font-bold leading-7 text-white mb-4">
                            Translational
                            <span className="text-xs font-normal text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">from ANT</span>
                        </dt>
                        <dd className="flex flex-auto flex-col text-base leading-7 text-slate-300">
                            <p className="flex-auto">
                                Outputs are actively produced through processes of inscription, enrollment, and mobilization—not neutral discoveries. instantTEA &quot;translates&quot; heterogeneous actors (human, non-human, material, discursive) into visible networks.
                            </p>
                        </dd>
                    </div>
                    <div className="flex flex-col bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 group hover:-translate-y-1">
                        <dt className="flex items-center gap-x-3 text-xl font-bold leading-7 text-white mb-4">
                            Ephemeral
                            <span className="text-xs font-normal text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">from Assemblage Theory</span>
                        </dt>
                        <dd className="flex flex-auto flex-col text-base leading-7 text-slate-300">
                            <p className="flex-auto">
                                Emphasizes temporality, contingency, and decay. Assemblages are never fully stable. instantTEA&apos;s &quot;instant&quot; snapshots capture a moment, but they fade or evolve—encouraging users to revisit and iterate.
                            </p>
                        </dd>
                    </div>
                    <div className="flex flex-col bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 group hover:-translate-y-1">
                        <dt className="flex items-center gap-x-3 text-xl font-bold leading-7 text-white mb-4">
                            Assemblages
                            <span className="text-xs font-normal text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Ontological Commitment</span>
                        </dt>
                        <dd className="flex flex-auto flex-col text-base leading-7 text-slate-300">
                            <p className="flex-auto">
                                Retains the core focus on emergent wholes from heterogeneous parts, with capacities for expression, agency, and becoming. Keeps instantTEA grounded in relational ontologies.
                            </p>
                        </dd>
                    </div>
                </div>
            </div>
        </div>
    );
}
