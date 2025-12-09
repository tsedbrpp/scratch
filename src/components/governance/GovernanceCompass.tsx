"use client";

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DriftVector } from '@/lib/governance';

interface GovernanceCompassProps {
    analysis: DriftVector | null;
}

export function GovernanceCompass({ analysis }: GovernanceCompassProps) {
    if (!analysis) {
        return (
            <Card className="h-[500px] flex items-center justify-center bg-slate-50 border-dashed">
                <p className="text-slate-400">Run analysis to generate Governance Compass</p>
            </Card>
        );
    }

    const data = [
        { x: analysis.rhetoric.x, y: analysis.rhetoric.y, name: 'Rhetoric', fill: '#3b82f6' }, // Blue
        { x: analysis.reality.x, y: analysis.reality.y, name: 'Reality', fill: '#0f172a' },   // Black
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Governance Drift Compass</CardTitle>
                <CardDescription>
                    Visualizing the gap between ethical rhetoric and technical reality.
                    <br />
                    <span className="text-xs text-slate-500">
                        Drift Magnitude: {analysis.magnitude.toFixed(2)} |
                        X-Shift: {analysis.driftX.toFixed(2)} |
                        Y-Shift: {analysis.driftY.toFixed(2)}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] w-full relative">
                    {/* Background Quadrant Labels */}
                    <div className="absolute top-4 right-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded opacity-80">
                        REGENERATIVE / PARTICIPATORY
                    </div>
                    <div className="absolute bottom-4 left-4 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded opacity-80">
                        EXTRACTIVE / ASYMMETRICAL
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Power"
                                domain={[-1.2, 1.2]}
                                label={{ value: 'Power: Asymmetrical (-) vs Participatory (+)', position: 'bottom', offset: 0 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Value"
                                domain={[-1.2, 1.2]}
                                label={{ value: 'Value: Extractive (-) vs Regenerative (+)', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle' } }}
                            />
                            <ReferenceLine x={0} stroke="#64748b" />
                            <ReferenceLine y={0} stroke="#64748b" />

                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />

                            <Scatter name="Points" data={data} fill="#8884d8">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                <LabelList dataKey="name" position="top" offset={10} style={{ fill: '#64748b', fontSize: '12px', fontWeight: 'bold' }} />
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>

                    {/* SVG Overlay for the Arrow (Drift Vector) */}
                    {/* Note: Precise overlay requires mapping coordinates to pixels, which is hard with ResponsiveContainer. 
                        For this MVP, we rely on the scatter points. A more advanced version would use a custom SVG layer. */}
                </div>
            </CardContent>
        </Card>
    );
}
