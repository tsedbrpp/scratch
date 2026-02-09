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
import { LegitimacyAnalysis } from '@/types';

interface LegitimacyVisualizerProps {
    analysis: LegitimacyAnalysis;
}

export function LegitimacyVisualizer({ analysis }: LegitimacyVisualizerProps) {
    if (!analysis.orders) return null;

    const data = Object.entries(analysis.orders).map(([order, score]) => ({
        subject: order.charAt(0).toUpperCase() + order.slice(1),
        A: score,
        fullMark: 10,
    }));

    return (
        <div className="h-[250px] w-full mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                        name="Legitimacy Score"
                        dataKey="A"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fill="#4f46e5"
                        fillOpacity={0.2}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
