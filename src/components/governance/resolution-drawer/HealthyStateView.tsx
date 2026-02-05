import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const HealthyStateView: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 text-center">
                <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-900">Governance: Healthy</h3>
                <p className="text-emerald-700 text-sm mt-1">Analysis is safe to propagate.</p>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passed Checks</h4>

                <div className="flex gap-3">
                    <div className="mt-1 bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0">1</div>
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">No Discursive Overreach</p>
                        <p className="text-xs text-slate-500 mt-0.5">Free from "Subtle Determinism" or "Hidden Normativity".</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="mt-1 bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0">2</div>
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">Procedural Validity</p>
                        <p className="text-xs text-slate-500 mt-0.5">No outstanding mandatory "Binding Actions" required.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="mt-1 bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0">3</div>
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">Epistemic Stability</p>
                        <p className="text-xs text-slate-500 mt-0.5">Pattern Sentinel reports low uncertainty.</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded text-xs text-slate-500 border border-slate-100 italic">
                "Healthy means the analysis is safe to propagate into downstream synthesis tasks without injecting mandatory corrections."
            </div>
        </div>
    );
};
