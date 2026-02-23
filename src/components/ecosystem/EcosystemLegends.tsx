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
    isActive?: boolean;
    onClick?: () => void;
}

const LegendRow = React.memo(({ label, value, color, icon, isActive = true, onClick }: LegendRowProps) => (
    <div
        className={`flex items-center justify-between transition-opacity duration-200 ${onClick ? 'cursor-pointer hover:bg-white/5 -mx-2 px-2 py-1 rounded' : ''} ${!isActive ? 'opacity-40' : 'opacity-100'}`}
        onClick={onClick}
    >
        <span className="capitalize text-[11px] text-slate-300 font-medium select-none">
            {label}
        </span>
        <div className="flex items-center gap-2">
            {value && <span className="text-[9px] text-slate-400 italic opacity-80 select-none">{value}</span>}
            {icon ? icon : <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: color }} />}
        </div>
    </div>
));

interface ViewTypeLegendProps {
    activeTaxonomyFilter?: string | null;
    onTaxonomySelect?: (key: string) => void;
    activeMaterialityFilter?: string | null;
    onMaterialitySelect?: (key: string) => void;
    activePatternFilter?: string | null;
    onPatternSelect?: (key: string) => void;
}

export const ViewTypeLegend = React.memo(({
    activeTaxonomyFilter = null, onTaxonomySelect,
    activeMaterialityFilter = null, onMaterialitySelect,
    activePatternFilter = null, onPatternSelect
}: ViewTypeLegendProps) => (
    <div className="w-64 flex flex-col gap-6 select-none z-[50] bg-slate-800/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl text-xs text-white ring-1 ring-white/5 cursor-grab active:cursor-grabbing max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">

        {/* Actor Taxonomy Section */}
        <LegendSection title="Actor Taxonomy">
            {Object.entries(SWISS_COLORS).filter(([k]) => k !== 'default').map(([key, color]) => {
                const isActive = activeTaxonomyFilter === null || activeTaxonomyFilter === key;
                return (
                    <LegendRow
                        key={key}
                        label={key === 'civilsociety' ? 'Civil Society' : key === 'privatetech' ? 'Private Tech / Startup' : key}
                        color={color}
                        isActive={isActive}
                        onClick={onTaxonomySelect ? () => onTaxonomySelect(key) : undefined}
                    />
                );
            })}
        </LegendSection>

        {/* Visual Materiality Section */}
        <LegendSection title="Visual Materiality">
            <LegendRow
                label="High Stability"
                value="Glossy"
                icon={<div className="w-4 h-4 rounded-full bg-slate-400 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4)]" />}
                isActive={activeMaterialityFilter === null || activeMaterialityFilter === 'high_stability'}
                onClick={onMaterialitySelect ? () => onMaterialitySelect('high_stability') : undefined}
            />
            <LegendRow
                label="Low Stability"
                value="Matte"
                icon={<div className="w-4 h-4 rounded-full bg-slate-600 border border-slate-500/50" />}
                isActive={activeMaterialityFilter === null || activeMaterialityFilter === 'low_stability'}
                onClick={onMaterialitySelect ? () => onMaterialitySelect('low_stability') : undefined}
            />
            <LegendRow
                label="Bias Hotspots"
                value="Glow"
                icon={<div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />}
                isActive={activeMaterialityFilter === null || activeMaterialityFilter === 'bias_hotspots'}
                onClick={onMaterialitySelect ? () => onMaterialitySelect('bias_hotspots') : undefined}
            />
            <LegendRow
                label="Provisional"
                value="Wireframe"
                icon={<div className="w-4 h-4 rounded-full border border-slate-400/80 bg-transparent shadow-[0_0_4px_rgba(255,255,255,0.1)]" />}
                isActive={activeMaterialityFilter === null || activeMaterialityFilter === 'provisional'}
                onClick={onMaterialitySelect ? () => onMaterialitySelect('provisional') : undefined}
            />
        </LegendSection>

        {/* Association Patterns Section */}
        <LegendSection title="Association Patterns">
            <LegendRow
                label="Power Flow"
                value="Directed"
                icon={<div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-red-400" /><div className="w-1.5 h-1.5 rounded-full bg-red-400" /></div>}
                isActive={activePatternFilter === null || activePatternFilter === 'power'}
                onClick={onPatternSelect ? () => onPatternSelect('power') : undefined}
            />
            <LegendRow
                label="Logic Flow"
                value="Associative"
                icon={<div className="w-4 h-0.5 border-t border-dashed border-amber-400" />}
                isActive={activePatternFilter === null || activePatternFilter === 'logic'}
                onClick={onPatternSelect ? () => onPatternSelect('logic') : undefined}
            />
            <LegendRow
                label="Absent / Ghost"
                value="Virtual"
                icon={<div className="w-4 h-0.5 border-t border-dotted border-indigo-400" />}
                isActive={activePatternFilter === null || activePatternFilter === 'ghost'}
                onClick={onPatternSelect ? () => onPatternSelect('ghost') : undefined}
            />
        </LegendSection>
    </div>
));
