import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { AnalysisResult } from '@/types';

interface LogicsVisualizerProps {
    analysis: AnalysisResult;
}

export function LogicsVisualizer({ analysis }: LogicsVisualizerProps) {
    if (!analysis.logics) return null;

    // Always show all 4 logics, even if strength is 0
    const rawData = [
        { subject: 'Market', value: analysis.logics.market?.strength || 0 },
        { subject: 'State', value: analysis.logics.state?.strength || 0 },
        { subject: 'Professional', value: analysis.logics.professional?.strength || 0 },
        { subject: 'Community', value: analysis.logics.community?.strength || 0 },
    ];

    const hasData = rawData.some(item => item.value > 0);

    // Determine if values are 0-1 scale or 0-10 scale
    const maxValue = Math.max(...rawData.map(d => d.value));
    const isNormalized = maxValue <= 1;

    // If values are 0-1, scale them to 0-10 for better visualization
    const data = rawData.map(item => ({
        subject: item.subject,
        displayValue: isNormalized ? item.value * 10 : item.value,
        originalValue: item.value,
        fullMark: 10
    }));

    if (!hasData) {
        return (
            <div className="text-sm text-slate-500 italic mt-4">
                No institutional logics data available
            </div>
        );
    }

    return (
        <div className="w-full mt-4 mb-6">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="45%" outerRadius="55%" data={data}>
                        <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 10]}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                            tickCount={6}
                            tickFormatter={(value) => isNormalized ? (value / 10).toFixed(1) : value.toString()}
                        />
                        <Radar
                            name="Logic Strength"
                            dataKey="displayValue"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="#10b981"
                            fillOpacity={0.25}
                            dot={{ fill: '#10b981', r: 4 }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                padding: '8px 12px'
                            }}
                            itemStyle={{ color: '#10b981', fontWeight: 600 }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: number, name: string, props: any) => {
                                const original = props.payload.originalValue;
                                return [isNormalized ? `${original.toFixed(2)}` : `${original}/10`, 'Strength'];
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend with actual values */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {data.map((item) => (
                    <div key={item.subject} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded border border-slate-200">
                        <span className="font-medium text-slate-700">{item.subject}</span>
                        <span className="font-bold text-emerald-600">
                            {isNormalized ? item.originalValue.toFixed(2) : `${item.originalValue}/10`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
