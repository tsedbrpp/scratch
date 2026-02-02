import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface FrameworkRadarProps {
    data: any[];
    labelA: string;
    labelB?: string;
    labelC?: string;
    selectedSourceB?: string;
    selectedSourceC?: string;
}

export function FrameworkRadar({ data, labelA, labelB, labelC, selectedSourceB, selectedSourceC }: FrameworkRadarProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name={labelA} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                {selectedSourceB && <Radar name={labelB} dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />}
                {selectedSourceC && <Radar name={labelC} dataKey="C" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />}
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
}
