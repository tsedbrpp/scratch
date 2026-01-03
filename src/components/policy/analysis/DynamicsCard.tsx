import React from 'react';

export function DynamicsCard({ label, subLabel, content, color }: { label: string, subLabel: string, content: string, color: string }) {
    return (
        <div className={`flex flex-col p-4 rounded-lg bg-white/80 border border-${color}-100 shadow-sm hover:shadow-md transition-all h-full`}>
            <div className={`text-xs font-bold text-${color}-700 uppercase mb-0.5`}>
                {label}
            </div>
            <div className={`text-[10px] font-medium text-${color}-600/80 uppercase mb-3 tracking-wide`}>
                {subLabel}
            </div>
            <div className="text-sm text-slate-700 leading-relaxed flex-grow">
                {content}
            </div>
        </div>
    );
}
