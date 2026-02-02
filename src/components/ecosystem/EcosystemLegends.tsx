import React from 'react';
import { SWISS_COLORS } from '@/lib/ecosystem-utils';

interface LegendSectionProps {
    title: string;
    children: React.ReactNode;
}

const LegendSection = React.memo(({ title, children }: LegendSectionProps) => (
    <div>
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3 border-b border-white/5 pb-2">
            {title}
        </div>
        <div className="space-y-2.5">
            {children}
        </div>
    </div>
));

interface LegendRowProps {
    label: string;
    value?: string;
    color?: string;
    icon?: React.ReactNode;
}

const LegendRow = React.memo(({ label, value, color, icon }: LegendRowProps) => (
    <div className="flex items-center justify-between">
        <span className="capitalize text-[11px] text-slate-300 font-medium">
            {label}
        </span>
        <div className="flex items-center gap-2">
            {value && <span className="text-[9px] text-slate-400 italic opacity-80">{value}</span>}
            {icon ? icon : <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: color }} />}
        </div>
    </div>
));

export const ViewTypeLegend = React.memo(() => (
    <div className="w-56 flex flex-col gap-6 select-none z-[50] bg-slate-800/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl text-xs text-white ring-1 ring-white/5 cursor-grab active:cursor-grabbing">

        {/* Actor Taxonomy Section */}
        <LegendSection title="Actor Taxonomy">
            {Object.entries(SWISS_COLORS).filter(([k]) => k !== 'default').map(([key, color]) => (
                <LegendRow
                    key={key}
                    label={key === 'civilsociety' ? 'Civil Society' : key}
                    color={color}
                />
            ))}
        </LegendSection>

        {/* Visual Materiality Section */}
        <LegendSection title="Visual Materiality">
            <LegendRow
                label="High Stability"
                value="Glossy"
                icon={<div className="w-4 h-4 rounded-full bg-slate-400 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4)]" />}
            />
            <LegendRow
                label="Low Stability"
                value="Matte"
                icon={<div className="w-4 h-4 rounded-full bg-slate-600 border border-slate-500/50" />}
            />
            <LegendRow
                label="Bias Hotspots"
                value="Glow"
                icon={<div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />}
            />
            <LegendRow
                label="Provisional"
                value="Wireframe"
                icon={<div className="w-4 h-4 rounded-full border border-slate-400/80 bg-transparent shadow-[0_0_4px_rgba(255,255,255,0.1)]" />}
            />
        </LegendSection>

        {/* Association Dynamics (Optional Footer) */}
        <div className="pt-2 border-t border-white/5 mt-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[9px] text-slate-400">Power</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[9px] text-slate-400">Logic</span>
                </div>
            </div>
        </div>
    </div>
));
