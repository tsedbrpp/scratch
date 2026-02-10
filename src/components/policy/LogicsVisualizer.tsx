import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import { Source } from '@/types';

interface LogicsVisualizerProps {
    sources: Source[];
}

const LOGIC_TYPES = ["market", "state", "professional", "community"];

export function LogicsVisualizer({ sources }: LogicsVisualizerProps) {
    if (!sources || sources.length === 0) return null;

    // Transform data for Recharts Radar
    // Data format: [{ subject: 'Market', A: 120, B: 110, fullMark: 150 }, ...]
    const data = LOGIC_TYPES.map(logic => {
        const item: any = { subject: logic.charAt(0).toUpperCase() + logic.slice(1) };
        sources.forEach(source => {
            const logicData = source.institutional_logics?.logics?.[logic as keyof typeof source.institutional_logics.logics];
            // Normalize to 0-100 for chart
            item[source.id] = (logicData?.strength || 0) * 100;
        });
        return item;
    });

    return (
        <div className="w-full h-[350px] bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 text-center uppercase tracking-wider">
                Comparative Logic Strength
            </h3>
            <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        {sources.map((source, idx) => (
                            <Radar
                                key={source.id}
                                name={source.title}
                                dataKey={source.id}
                                stroke={source.colorClass ? getHexColor(source.colorClass) : '#94a3b8'}
                                fill={source.colorClass ? getHexColor(source.colorClass) : '#94a3b8'}
                                fillOpacity={0.3}
                            />
                        ))}
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontSize: '12px', padding: 0 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Helper to map Tailwind classes to Hex for Recharts
// This is a simplified mapping, ideally we'd use computed styles or a robust map
function getHexColor(colorClass: string): string {
    if (colorClass.includes('purple')) return '#a855f7';
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('amber')) return '#f59e0b';
    if (colorClass.includes('red')) return '#ef4444';
    if (colorClass.includes('cyan')) return '#06b6d4';
    if (colorClass.includes('indigo')) return '#6366f1';
    if (colorClass.includes('rose')) return '#f43f5e';
    if (colorClass.includes('orange')) return '#f97316';

    // Default fallback
    return '#94a3b8'; // slate-400
}
