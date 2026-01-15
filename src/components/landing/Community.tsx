"use client";

import React from "react";
import { GraduationCap, Users, Shield, Building } from "lucide-react";

export function Community() {
    return (
        <div className="py-24 sm:py-32 bg-white border-t border-slate-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Community</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Who uses instantTEA?
                    </p>
                </div>
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
                    <div className="flex flex-col items-start p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                        <div className="p-3 bg-blue-100 rounded-xl mb-4">
                            <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">For Researchers & Scholars</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Use instantTEA for initial tracing of actors in empirical studies, then layer with slower methods for full assemblage mapping.
                        </p>
                    </div>
                    <div className="flex flex-col items-start p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                        <div className="p-3 bg-indigo-100 rounded-xl mb-4">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">For Practitioners & Activists</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Quick counter-mapping of power relations (e.g., regulatory tensions in AI governance, platform monopolies). Ephemerality supports tactical interventions without claiming exhaustive truth.
                        </p>
                    </div>
                    <div className="flex flex-col items-start p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                        <div className="p-3 bg-teal-100 rounded-xl mb-4">
                            <Building className="h-6 w-6 text-teal-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">For Educators & General Users</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Accessible entry point to complex theories—generate a snapshot, then explore &quot;what&apos;s missing&quot; or &quot;what could change.&quot;
                        </p>
                    </div>
                    <div className="flex flex-col items-start p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                        <div className="p-3 bg-amber-100 rounded-xl mb-4">
                            <Shield className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Edge Cases & Nuances</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Outputs may highlight fragile alliances or overlooked agencies, but users must remain attentive to situated biases (e.g., data sources, algorithmic inscriptions). Not for high-stakes decision-making without verification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
