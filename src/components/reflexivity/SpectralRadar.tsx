"use client";

import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { AnalysisResult, LegitimacyAnalysis } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface SpectralRadarProps {
    results: Record<string, AnalysisResult | null>;
}

export function SpectralRadar({ results }: SpectralRadarProps) {
    // 1. Extract Governance Scores (if available)
    const governanceResult = results['institutional_logics']; // Often holds gov scores in this app structure, or 'governance' if key exists.
    // Actually, based on types, governance scores might be in any result if the prompt extracted them.
    // But usually it's specifically the "Institutional Logics" or a specific "Governance" lens.
    // Let's iterate and find the first result with governance scores.
    const govScores = Object.values(results).find(r => r?.governance_scores)?.governance_scores;

    // 2. Extract Legitimacy Orders
    const legitimacyResult = results['legitimacy'] as unknown as LegitimacyAnalysis | undefined;
    // Note: cast as LegitimacyAnalysis because the generic AnalysisResult might not fully capture the specific shape if types aren't perfectly unified.
    // Looking at src/types/index.ts, `legitimacy_analysis` is a property on Source, but `AnalysisResult` has `legitimacy_claims`. 
    // However, the `MultiLensAnalysis` component casts the result to `LegitimacyAnalysis` in `getKeyInsight`, so the result object ITSELF mirrors that structure for that lens.
    const legOrders = legitimacyResult?.orders;


    if (!govScores && !legOrders) {
        return null;
    }

    // 3. Transform Data for Radar Chart
    // We want to normalize everything to 0-10 scale if possible.
    // Governance scores are usually 0-10 or 0-1. Let's assume 0-10 based on typical prompt.
    // Legitimacy orders are 0-10.

    const data = [
        { subject: 'Market', A: legOrders?.market || 0, B: govScores?.market_power || 0, fullMark: 10 },
        { subject: 'Civic/Rights', A: legOrders?.civic || 0, B: govScores?.rights_focus || 0, fullMark: 10 },
        { subject: 'Industrial/Proc', A: legOrders?.industrial || 0, B: govScores?.procedurality || 0, fullMark: 10 },
        { subject: 'Domestic/Flex', A: legOrders?.domestic || 0, B: govScores?.flexibility || 0, fullMark: 10 },
        { subject: 'Inspiration/Cent', A: legOrders?.inspired || 0, B: govScores?.centralization || 0, fullMark: 10 },
        // { subject: 'Fame', A: legOrders?.fame || 0, B: 0, fullMark: 10 },
    ];

    return (
        <Card className="col-span-1 md:col-span-2 border-indigo-100 bg-slate-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    Diffractive Spectral Radar
                </CardTitle>
                <CardDescription className="text-xs">
                    Visualizing the interference pattern between Legitimacy Orders (Justification) and Governance Mechanics (Power).
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />

                        <Radar
                            name="Legitimacy (Justification)"
                            dataKey="A"
                            stroke="#8884d8"
                            strokeWidth={2}
                            fill="#8884d8"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Governance (Mechanics)"
                            dataKey="B"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            fill="#82ca9d"
                            fillOpacity={0.3}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
