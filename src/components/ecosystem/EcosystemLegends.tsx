import React from 'react';
import { SWISS_COLORS } from '@/lib/ecosystem-utils';

export const ViewTypeLegend = () => (
    <div className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-none z-[50] bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-xl">
        <div className="absolute -top-3 left-3 bg-slate-700 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
            Actor Types
        </div>
        {Object.entries(SWISS_COLORS).filter(([k]) => k !== 'default').map(([key, color]) => (
            <div key={key} className="flex items-center gap-2 justify-end">
                <span className="capitalize text-[10px] font-medium text-slate-800 bg-white/70 px-1.5 rounded-sm shadow-sm">{key.replace("civilsociety", "Civil Society")}</span>
                <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: color }} />
            </div>
        ))}
    </div>
);

export const StratumLegend = () => (
    <div className="absolute top-32 right-8 flex flex-col gap-6 pointer-events-none z-[50] bg-slate-900/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 shadow-2xl">
        {/* Title */}
        <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
            Legal Verticality
        </div>

        {/* Level 1: Law */}
        <div className="flex items-center justify-end gap-3 group">
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-800 bg-white/90 px-2 py-0.5 rounded shadow-sm border border-slate-200">Legal Object (Law)</span>
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/10" style={{ backgroundColor: "#6366f1" }}></div>
                </div>
                <span className="text-[9px] text-slate-500 font-medium mr-1">Constraint / Regulation</span>
            </div>
            <div className="h-0.5 w-12 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
        </div>

        {/* Level 2: Policymakers */}
        <div className="flex items-center justify-end gap-3 opacity-90">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium tracking-wide text-slate-700 bg-white/60 px-2 py-0.5 rounded border border-slate-100">Policymakers</span>
                <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/10" style={{ backgroundColor: SWISS_COLORS.policymaker }}></div>
            </div>
            <div className="h-0.5 w-8 bg-slate-400"></div>
        </div>

        {/* Level 3: Civil Society / Academic */}
        <div className="flex items-center justify-end gap-3 opacity-90">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium tracking-wide text-slate-600 bg-white/50 px-2 py-0.5 rounded">Civil Society</span>
                <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/10" style={{ backgroundColor: SWISS_COLORS.civilsociety }}></div>
            </div>
            <div className="h-0.5 w-6 bg-slate-400"></div>
        </div>

        {/* Level 4: Market (Startups) */}
        <div className="flex items-center justify-end gap-3 opacity-90">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium tracking-wide text-slate-500 bg-white/40 px-2 py-0.5 rounded">Market / Startups</span>
                <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/10" style={{ backgroundColor: SWISS_COLORS.startup }}></div>
            </div>
            <div className="h-0.5 w-6 bg-slate-400"></div>
        </div>

        {/* Level 5: Algorithms */}
        <div className="flex items-center justify-end gap-3 opacity-90">
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded shadow-sm border border-emerald-200">Algorithmic Agents</span>
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/10" style={{ backgroundColor: SWISS_COLORS.algorithm }}></div>
                </div>
                <span className="text-[9px] text-emerald-700 font-medium mr-1">Code / Actants</span>
            </div>
            <div className="h-0.5 w-10 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
        </div>

        {/* Level 6: Infrastructure */}
        <div className="flex items-center justify-end gap-3 opacity-90">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium tracking-wide text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded">Infrastructure</span>
                <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-black/10" style={{ backgroundColor: SWISS_COLORS.infrastructure }}></div>
            </div>
            <div className="h-0.5 w-4 bg-slate-400"></div>
        </div>

        {/* Depth Cue Line */}
        <div className="absolute right-0 top-6 bottom-6 w-1 bg-gradient-to-b from-indigo-500 via-slate-300 to-emerald-500 opacity-60 rounded-full"></div>
    </div>
);
