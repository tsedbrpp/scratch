
import React from 'react';
import { Badge } from "@/components/ui/badge";

export type FilterMode = 'all' | 'intermediaries' | 'mediators' | 'strong_mediators';

interface MediatorFilterProps {
    currentFilter: FilterMode;
    onFilterChange: (mode: FilterMode) => void;
    counts: {
        intermediaries: number;
        mediators: number;
        strong_mediators: number;
    };
}

export function MediatorFilter({ currentFilter, onFilterChange, counts }: MediatorFilterProps) {
    return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Relationship Filter</h4>

            <FilterOption
                mode="all"
                label="Show All"
                count={counts.intermediaries + counts.mediators}
                active={currentFilter === 'all'}
                color="slate"
                onClick={onFilterChange}
            />
            <FilterOption
                mode="intermediaries"
                label="Intermediaries"
                count={counts.intermediaries}
                active={currentFilter === 'intermediaries'}
                color="blue"
                subtext="Stable (0.0 - 0.5)"
                onClick={onFilterChange}
            />
            <FilterOption
                mode="mediators"
                label="Mediators"
                count={counts.mediators}
                active={currentFilter === 'mediators'}
                color="orange"
                subtext="Emerging (0.5 - 0.7)"
                onClick={onFilterChange}
            />
            <FilterOption
                mode="strong_mediators"
                label="Strong Mediators"
                count={counts.strong_mediators}
                active={currentFilter === 'strong_mediators'}
                color="red"
                subtext="Contested (0.7 - 1.0)"
                onClick={onFilterChange}
            />
        </div>
    );
}

interface FilterOptionProps {
    mode: FilterMode;
    label: string;
    count: number;
    active: boolean;
    color: 'slate' | 'blue' | 'orange' | 'red';
    subtext?: string;
    onClick: (mode: FilterMode) => void;
}

function FilterOption({ mode, label, count, active, color, subtext, onClick }: FilterOptionProps) {
    const bgColors = {
        slate: active ? 'bg-slate-100' : 'hover:bg-slate-50',
        blue: active ? 'bg-blue-50' : 'hover:bg-slate-50',
        orange: active ? 'bg-orange-50' : 'hover:bg-slate-50',
        red: active ? 'bg-red-50' : 'hover:bg-slate-50'
    };

    const textColors = {
        slate: 'text-slate-700',
        blue: 'text-blue-700',
        orange: 'text-orange-700',
        red: 'text-red-700'
    };

    return (
        <button
            onClick={() => onClick(mode)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${bgColors[color]} ${active ? 'ring-1 ring-inset ring-slate-200' : ''}`}
        >
            <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${textColors[color]}`}>{label}</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1">{count}</Badge>
            </div>
            {subtext && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{subtext}</div>}
        </button>
    );
}
