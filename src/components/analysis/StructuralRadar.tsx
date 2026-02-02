import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { HelpCircle } from "lucide-react";
import { HelpTooltip } from "@/components/help/HelpTooltip";

interface StructuralRadarProps {
    scores?: {
        centralization: number;
        rights_focus: number;
        flexibility: number;
        market_power: number;
        procedurality: number;
        coloniality?: number;
    };
}

export function StructuralRadar({ scores }: StructuralRadarProps) {
    // Default scores if not provided
    const defaultScores = {
        centralization: 50,
        rights_focus: 50,
        flexibility: 50,
        market_power: 50,
        procedurality: 50,
        coloniality: 50
    };

    const s = scores || defaultScores;

    const data = [
        { subject: 'Centralization', A: s.centralization, fullMark: 100 },
        { subject: 'Rights Focus', A: s.rights_focus, fullMark: 100 },
        { subject: 'Flexibility', A: s.flexibility, fullMark: 100 },
        { subject: 'Market Power', A: s.market_power, fullMark: 100 },
        { subject: 'Procedurality', A: s.procedurality, fullMark: 100 },
        { subject: 'Coloniality', A: s.coloniality || 0, fullMark: 100 },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Governance Profile</h4>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Structural distribution across six dimensions</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded text-[10px] font-bold text-indigo-600">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    LIVE ANALYSIS
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs">
                                            <p className="font-bold text-slate-900 mb-1">{payload[0].payload.subject}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${payload[0].value}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono font-bold text-indigo-600">{payload[0].value}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Radar
                            name="Governance"
                            dataKey="A"
                            stroke="#4f46e5"
                            strokeWidth={2}
                            fill="#4f46e5"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <MetricLabel label="High Centralization" value={s.centralization > 70} />
                    <MetricLabel label="Rights-Preserving" value={s.rights_focus > 70} />
                    <MetricLabel label="Agile/Flexible" value={s.flexibility > 70} />
                </div>
                <div className="space-y-2">
                    <MetricLabel label="Market Dominant" value={s.market_power > 70} />
                    <MetricLabel label="Bureaucratic" value={s.procedurality > 70} />
                    <MetricLabel label="Center-Heavy" value={(s.coloniality || 0) > 70} />
                </div>
            </div>
        </div>
    );
}

function MetricLabel({ label, value }: { label: string, value: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <span className={`text-[10px] font-medium ${value ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
        </div>
    );
}
