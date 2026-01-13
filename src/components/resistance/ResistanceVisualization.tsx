"use client";

import { useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity, ShieldAlert, ZapOff, Info, Crosshair, FileText, Target } from "lucide-react";
import { VectorsForceGraph } from "@/components/resistance/VectorsForceGraph";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface ResistanceSynthesisResult {
    executive_summary: string;
    dominant_strategies: {
        strategy: string;
        frequency: string;
        description: string;
        minor_actor_verification?: string;
    }[];
    lines_of_flight?: { // Optional to handle old data
        narrative_aggregate: string;
        scoring_breakdown: {
            connectivity: string;
            intensity: string;
            decoding_impact: string;
            exteriority: string;
            trajectory: string;
        };
        recapture_pressure: string;
        vectors_of_deterritorialization: (string | {
            name: string;
            intensity: string;
            description: string;
        })[];
    };
    reflexive_audit?: {
        analyst_positionality: string;
        uncertainty_flags: string;
    };
    implications_for_legitimacy: string;
}

const SCORE_MAP: Record<string, number> = {
    "High": 3,
    "Medium": 2,
    "Low": 1,
    "None": 0
};

const FREQ_MAP: Record<string, number> = {
    "High": 100,
    "Medium": 60,
    "Low": 30
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const RECAPTURE_GLOSSARY: Record<string, string> = {
    "High": "The system is actively hostile, attempting to block, ban, or legally punish this behavior (Reterritorialization).",
    "Medium": "The system is attempting to 'systemize' or co-opt the behavior—turning a bug into a feature or regulating it.",
    "Low": "The system either ignores this resistance or is currently too slow/rigid to react to it."
};

interface ResistanceVisualizationProps {
    result: ResistanceSynthesisResult;
    monitoredVectors?: string[];
    onToggleMonitor?: (id: string) => void;
}

export function ResistanceVisualization({ result, monitoredVectors = [], onToggleMonitor }: ResistanceVisualizationProps) {

    // 1. Process Data for Radar Chart (Lines of Flight)
    const radarData = useMemo(() => {
        if (!result.lines_of_flight?.scoring_breakdown) return [];

        const getScore = (val: string) => {
            const v = val.toLowerCase();
            if (v.includes("high")) return 3;
            if (v.includes("medium")) return 2;
            if (v.includes("low")) return 1;
            return 0; // "None" or unknown
        };

        return Object.entries(result.lines_of_flight.scoring_breakdown).map(([key, value]) => ({
            subject: key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
            score: getScore(value),
            fullMark: 3
        }));
    }, [result]);

    // 2. Process Data for Bar Chart (Strategies)
    const strategyData = useMemo(() => {
        return result.dominant_strategies.map(s => ({
            name: s.strategy,
            value: FREQ_MAP[s.frequency] || 20,
            frequency: s.frequency
        }));
    }, [result]);



    // Robustly parse recapture level (handling "High:", "High -", etc.)
    const recaptureLevel = useMemo(() => {
        const raw = result.lines_of_flight?.recapture_pressure || "Low";
        const firstWord = raw.split(/[\s:_.-]+/)[0]; // Split by space, colon, underscore, dot, dash
        return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase(); // Normalize Case
    }, [result]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 1: Lines of Flight Radar */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-orange-500" />
                        Lines of Flight Configuration
                    </h4>
                    <div className="h-[300px] w-full items-center justify-center flex">
                        {radarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 3]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Flight Potential"
                                        dataKey="score"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.4}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: number) => {
                                            return Object.keys(SCORE_MAP).find(k => SCORE_MAP[k] === value) || value;
                                        }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-400 text-sm">No flight data available</div>
                        )}
                    </div>
                    {/* Recapture Indicator */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={`mt-4 p-3 rounded-lg border flex items-center justify-between cursor-help transition-colors hover:bg-opacity-80 ${recaptureLevel === 'High' ? 'bg-red-50 border-red-200 text-red-800' :
                                    recaptureLevel === 'Medium' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                                        'bg-green-50 border-green-200 text-green-800'
                                    }`}>
                                    <div className="flex items-center">
                                        {recaptureLevel === 'High' ? <ShieldAlert className="h-4 w-4 mr-2" /> : <ZapOff className="h-4 w-4 mr-2" />}
                                        <span className="font-semibold text-sm flex items-center gap-1">
                                            Recapture Pressure: {recaptureLevel}
                                            <Info className="h-3 w-3 opacity-50" />
                                        </span>
                                    </div>
                                    <span className="text-xs opacity-75">
                                        {result.lines_of_flight?.recapture_pressure.split(':').slice(1).join(':') || "Systemizing"}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-3 bg-slate-900 border-slate-800 text-slate-100">
                                <p className="font-bold text-xs uppercase tracking-wider mb-1 text-slate-400">Concept Definition</p>
                                <p className="text-sm font-semibold mb-2">Recapture Pressure</p>
                                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                    The intensity with which the dominant system attempts to neutralize, absorb, or forbid this line of flight to bring it back under control.
                                </p>
                                <div className="border-t border-slate-700 pt-2">
                                    <p className="font-bold text-xs uppercase tracking-wider mb-1 text-slate-400">Current Status: {recaptureLevel}</p>
                                    <p className="text-xs text-slate-300">
                                        {RECAPTURE_GLOSSARY[recaptureLevel] || "Status varies based on specific context."}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Chart 2: Strategy Dominance */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-blue-500" />
                        Strategy Dominance
                    </h4>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={strategyData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={140}
                                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                                    tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                                    interval={0}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: any, props: any) => [props.payload.frequency, "Frequency"]}
                                    labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {strategyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Visual Vectors */}
            {result.lines_of_flight?.vectors_of_deterritorialization && result.lines_of_flight.vectors_of_deterritorialization.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-3 flex items-center text-sm uppercase tracking-wide">
                        <Zap className="h-4 w-4 mr-2" /> Vectors of Deterritorialization
                    </h4>

                    {/* Replaced badges with interactive Force Graph */}
                    <VectorsForceGraph
                        vectors={result.lines_of_flight.vectors_of_deterritorialization as any[]}
                        narrativeContext={result.lines_of_flight.narrative_aggregate || ""}
                        executiveSummary={result.executive_summary}
                        scoring={result.lines_of_flight.scoring_breakdown}
                        monitoredVectors={monitoredVectors}
                        onToggleMonitor={onToggleMonitor}
                    />

                </div>
            )}
        </div>
    );
}

