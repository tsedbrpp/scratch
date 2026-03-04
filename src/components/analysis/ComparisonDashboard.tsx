"use client";

import React, { useMemo } from "react";
import { AbstractMachineAnalysis } from "@/types";
import { AICompareAbstractMachinesResponse } from "@/lib/prompts/compare-machines";
import { ComparativeAssemblageD3 } from "./ComparativeAssemblageD3";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentSource {
    id: string;
    title: string;
}

interface ComparisonDashboardProps {
    leftMachine?: AbstractMachineAnalysis;
    rightMachine?: AbstractMachineAnalysis;
    leftSource?: DocumentSource;
    rightSource?: DocumentSource;
    aiReport?: {
        model_name: string;
        schema_version?: number;
        timestamp: number;
        comparison: AICompareAbstractMachinesResponse;
    };
    onRegenerate: () => void;
    isRegenerating: boolean;
}

export function ComparisonDashboard({ leftMachine, rightMachine, leftSource, rightSource, aiReport, onRegenerate, isRegenerating }: ComparisonDashboardProps) {

    // 0. Process Data (Rules of Hooks require this before early returns)
    const capacitiesData = useMemo(() => {
        return aiReport?.comparison?.affective_capacities?.scores?.map((item: any) => ({
            name: item.stakeholder,
            Left: item.left_score,
            Right: item.right_score,
            confidence: item.confidence,
            rationale: item.rationale
        })) || [];
    }, [aiReport?.comparison?.affective_capacities]);

    const monteCarloData = useMemo(() => {
        return (aiReport?.comparison as any)?.scenario_assessments?.simulations?.map((item: any) => ({
            name: item.scenario,
            Left: item.left_likelihood,
            Right: item.right_likelihood,
            confidence: item.confidence,
            rationale: item.rationale
        })) || [];
    }, [aiReport?.comparison]);

    // 1. Loading State
    if (!aiReport && isRegenerating) {
        return (
            <div className="w-full h-full flex flex-col gap-6 p-4">
                <div className="h-16 w-full"><Skeleton className="w-full h-full rounded-xl" /></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
                    <Skeleton className="w-full h-full rounded-xl" />
                    <Skeleton className="w-full h-full rounded-xl" />
                </div>
            </div>
        );
    }

    // 2. Empty State
    if (!aiReport || !leftMachine || !rightMachine) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full text-slate-500">
                <AlertCircle className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No AI Analysis Found</h3>
                <p className="max-w-md mb-6">Generate an AI structural comparison to view the interactive dashboard.</p>
                <Button onClick={onRegenerate} disabled={isRegenerating}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Dashboard
                </Button>
            </div>
        );
    }

    // 3. Fallback Version State (V1/V2 Cache)
    if (aiReport.schema_version !== 2.1) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full text-slate-500">
                <AlertCircle className="w-12 h-12 mb-4 text-amber-500" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Dashboard Data Missing</h3>
                <p className="max-w-lg mb-6 text-sm">Your previously generated comparison uses an older schema that does not have the numeric probabilities required to plot the charts. Please regenerate the analysis to view the dashboard.</p>
                <Button onClick={onRegenerate} disabled={isRegenerating}>
                    {isRegenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Regenerate Analysis
                </Button>
            </div>
        );
    }

    // 4. Dashboard View



    const da = aiReport.comparison.double_articulation;

    // Left Blue, Right Orange styling
    const LEFT_COLOR = "#b2d1eb"; // Soft Blue matching original screenshot for bars
    const RIGHT_COLOR = "#f1b373"; // Soft Orange matching screenshot for bars
    const LEFT_DARK = "#1d4ed8";
    const RIGHT_DARK = "#c2410c";

    const isDarkMode = document.documentElement.classList.contains('dark');
    const L_BAR = isDarkMode ? LEFT_DARK : LEFT_COLOR;
    const R_BAR = isDarkMode ? RIGHT_DARK : RIGHT_COLOR;

    const renderCustomBarLabel = (props: any) => {
        const { x, y, width, value } = props;
        return (
            <text x={x + width / 2} y={y - 6} fill="#64748b" textAnchor="middle" fontSize={10} fontWeight={500}>
                {Number(value).toFixed(2)}
            </text>
        );
    };

    const renderCustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div
                    className={`p-3 rounded-lg border shadow-lg text-xs max-w-md max-h-[350px] overflow-y-auto custom-scrollbar ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700'}`}
                    style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', zIndex: 1000, position: 'relative' }}
                >
                    <div className="font-bold mb-2 break-words text-[13px]">{label}</div>
                    <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: L_BAR }}></div>{payload[0]?.name}:</div>
                        <span className="font-medium">{payload[0]?.value?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: R_BAR }}></div>{payload[1]?.name}:</div>
                        <span className="font-medium">{payload[1]?.value?.toFixed(2)}</span>
                    </div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold flex justify-between">
                        <span>LLM Rationale</span>
                        <span className="text-indigo-500">Conf: {data.confidence?.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] leading-relaxed italic text-slate-600 dark:text-slate-400">
                        "{data.rationale}"
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto space-y-6 pb-[400px]">

            <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shrink-0 p-4 rounded-xl flex gap-3">
                <AlertCircle className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                    <h5 className="text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wide font-bold">Illustrative Simulation</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                        Numeric values and simulations shown in the charts below are illustrative interpretations deterministically generated via <code>{aiReport.model_name}</code>. They represent structural leverage potentials derived from the text, not empirical real-world enforcement statistics.
                    </p>
                </div>
            </div>

            {/* Figure 1: Network graph (Full Width) */}
            <div className="w-full h-[600px] shrink-0 flex flex-col items-center">
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Figure 1: Comparative Algorithmic Assemblages</h3>
                <h4 className="text-xs text-slate-500 mb-4 tracking-wide font-medium">Shared OPP Spine + Divergent Territorializations</h4>
                <ComparativeAssemblageD3 leftMachine={leftMachine} rightMachine={rightMachine} />
            </div>

            {/* Figures Stack */}
            <div className="flex flex-col gap-8 shrink-0">

                {/* Figure 2: Double Articulation Strata */}
                <div className="flex flex-col w-full h-[500px] bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 overflow-hidden">
                    <div className="text-center mb-6">
                        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Figure 2: Double Articulation (Content / Expression Strata)</h3>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4 h-full relative">
                        {/* Headers */}
                        <div className="absolute top-0 left-0 w-[49%] text-center text-xs font-bold text-slate-600 dark:text-slate-400">{leftSource?.title || "Left Document"}</div>
                        <div className="absolute top-0 right-0 w-[49%] text-center text-xs font-bold text-slate-600 dark:text-slate-400">{rightSource?.title || "Right Document"}</div>

                        <div className="col-span-1 flex flex-col gap-4 mt-6 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-lg flex-1">
                                <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1">Content Stratum</div>
                                <div className="text-center text-[10px] text-slate-500 mb-4">(machinic assemblage of bodies)</div>
                                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                    {da?.left_content_items?.map((it: string, i: number) => <li key={i} className="flex gap-2 leading-relaxed"><span className="text-blue-500 shrink-0">•</span> {it}</li>)}
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-lg flex-1">
                                <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1">Expression Stratum</div>
                                <div className="text-center text-[10px] text-slate-500 mb-4">(collective assemblage of enunciation)</div>
                                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                    {da?.left_expression_items?.map((it: string, i: number) => <li key={i} className="flex gap-2 leading-relaxed"><span className="text-blue-500 shrink-0">•</span> {it}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div className="col-span-1 flex flex-col gap-4 mt-6 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-lg flex-1">
                                <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1">Content Stratum</div>
                                <div className="text-center text-[10px] text-slate-500 mb-4">(machinic assemblage of bodies)</div>
                                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                    {da?.right_content_items?.map((it: string, i: number) => <li key={i} className="flex gap-2 leading-relaxed"><span className="text-orange-500 shrink-0">•</span> {it}</li>)}
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-lg flex-1">
                                <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-1">Expression Stratum</div>
                                <div className="text-center text-[10px] text-slate-500 mb-4">(collective assemblage of enunciation)</div>
                                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                    {da?.right_expression_items?.map((it: string, i: number) => <li key={i} className="flex gap-2 leading-relaxed"><span className="text-orange-500 shrink-0">•</span> {it}</li>)}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Figure 3: Affective Capacities */}
                <div className="w-full h-[500px] bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
                    <div className="text-center mb-1">
                        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Figure 3: Affective Capacities – Who Gains Leverage?</h3>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Interpretive (LLM)</div>
                    </div>
                    <div className="flex-1 min-h-0 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={capacitiesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDarkMode ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: isDarkMode ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                                <RechartsTooltip position={{ y: 0 }} content={renderCustomTooltip} cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }} wrapperStyle={{ zIndex: 1000, pointerEvents: "auto" }} />
                                <Legend wrapperStyle={{ fontSize: '11px', color: isDarkMode ? '#cbd5e1' : '#475569' }} />
                                <Bar dataKey="Left" name={leftSource?.title?.slice(0, 15) || "Left"} fill={L_BAR} radius={[2, 2, 0, 0]} label={renderCustomBarLabel} maxBarSize={100} isAnimationActive={false} />
                                <Bar dataKey="Right" name={rightSource?.title?.slice(0, 15) || "Right"} fill={R_BAR} radius={[2, 2, 0, 0]} label={renderCustomBarLabel} maxBarSize={100} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Figure 4: Scenario Assessments */}
                <div className="w-full h-[600px] bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
                    <div className="text-center mb-1">
                        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Figure 4: Scenario Assessments</h3>
                        <div className="flex justify-center gap-2 items-center text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                            <span className="font-bold">Interpretive (LLM)</span>
                            <span>•</span>
                            <span>Based on Structural Restrictiveness</span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monteCarloData} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                                <XAxis
                                    dataKey="name"
                                    angle={-30}
                                    textAnchor="end"
                                    height={100}
                                    tick={{ fontSize: 10, fill: isDarkMode ? "#94a3b8" : "#64748b" }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v: string) => v.length > 25 ? v.slice(0, 25) + '...' : v}
                                />
                                <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: isDarkMode ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                                <RechartsTooltip position={{ y: 0 }} content={renderCustomTooltip} cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }} wrapperStyle={{ zIndex: 1000, pointerEvents: "auto" }} />
                                <Bar dataKey="Left" name={leftSource?.title?.slice(0, 15) || "Left"} fill={L_BAR} radius={[2, 2, 0, 0]} label={renderCustomBarLabel} maxBarSize={80} isAnimationActive={false} />
                                <Bar dataKey="Right" name={rightSource?.title?.slice(0, 15) || "Right"} fill={R_BAR} radius={[2, 2, 0, 0]} label={renderCustomBarLabel} maxBarSize={80} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

