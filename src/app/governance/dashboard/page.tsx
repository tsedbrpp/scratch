"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSources } from '@/hooks/useSources';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Layers, BarChart3, AlertOctagon, Activity } from 'lucide-react';

export default function GovernanceOrchestrationPage() {
    const { sources, isLoading } = useSources();

    // 1. Calculate Risk Classifications
    const riskStats = useMemo(() => {
        const stats = {
            total: sources.length,
            high: 0,
            medium: 0,
            low: 0,
            requiresAction: 0
        };

        sources.forEach(source => {
            const status = source.analysis?.escalation_status;
            if (status?.level === 'HARD') stats.high++;
            if (status?.level === 'MEDIUM') stats.medium++;
            if (status?.level === 'SOFT' || !status) stats.low++;

            if (status?.status === 'DETECTED' || status?.status === 'DEFERRED') {
                stats.requiresAction++;
            }
        });

        return stats;
    }, [sources]);

    // 2. Calculate Recurrence Patterns (Dominant Logics)
    const recurrencePatterns = useMemo(() => {
        const patterns: Record<string, { count: number, sources: string[] }> = {};

        sources.forEach(source => {
            const logic = source.analysis?.dominant_logic;
            if (logic) {
                if (!patterns[logic]) {
                    patterns[logic] = { count: 0, sources: [] };
                }
                patterns[logic].count++;
                patterns[logic].sources.push(source.title);
            }
        });

        // Filter for > 1 occurrence and sort
        return Object.entries(patterns)
            .filter(([_, data]) => data.count > 1)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5); // Top 5
    }, [sources]);

    if (isLoading) {
        return <div className="p-12 text-center text-slate-400">Loading Orchestration Data...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-center max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl font-light text-slate-900">Governance Orchestration</h1>
                    <p className="text-slate-500 mt-1">Resource-grounded insights and risk landscape analysis.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/governance/console">
                        <Button variant="outline" className="gap-2">
                            <Activity className="w-4 h-4" />
                            Meta-Governance Console
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Risk Landscape Card */}
                <Card className="md:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            Risk Landscape
                        </CardTitle>
                        <CardDescription>Escalation status across the ecosystem.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col items-center">
                                <span className="text-red-800 font-bold text-2xl">{riskStats.high}</span>
                                <span className="text-red-600 text-sm font-medium uppercase tracking-wide">High Risk</span>
                                <span className="text-red-400 text-xs mt-1">Blocking</span>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex flex-col items-center">
                                <span className="text-amber-800 font-bold text-2xl">{riskStats.medium}</span>
                                <span className="text-amber-600 text-sm font-medium uppercase tracking-wide">Uncertainty</span>
                                <span className="text-amber-400 text-xs mt-1">Review Needed</span>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col items-center">
                                <span className="text-emerald-800 font-bold text-2xl">{riskStats.low}</span>
                                <span className="text-emerald-600 text-sm font-medium uppercase tracking-wide">Stable</span>
                                <span className="text-emerald-400 text-xs mt-1">Clear</span>
                            </div>
                        </div>

                        {riskStats.requiresAction > 0 && (
                            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertOctagon className="w-5 h-5 text-amber-500" />
                                    <div className="text-sm">
                                        <span className="font-semibold text-slate-700">{riskStats.requiresAction} Sources</span> require mitigation or review.
                                    </div>
                                </div>
                                <Button size="sm" variant="secondary" asChild>
                                    <Link href="/synthesis">View in Synthesis</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. System Stats */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-600" />
                            Orchestration Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <span className="text-slate-500 text-sm">Active Sources</span>
                            <span className="font-mono font-bold text-lg">{riskStats.total}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <span className="text-slate-500 text-sm">Recurring Patterns</span>
                            <span className="font-mono font-bold text-lg">{recurrencePatterns.length}</span>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                &quot;Governance is not just policy, but the orchestration of material assemblages.&quot;
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Recurrence / Dominant Logics */}
                <Card className="md:col-span-3 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            Recurring Assemblage Patterns
                        </CardTitle>
                        <CardDescription>Dominant logics detected frequently across the corpus, indicating structural tendencies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recurrencePatterns.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                No significant recurring patterns detected yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recurrencePatterns.map(([logic, data]) => (
                                    <div key={logic} className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-100 hover:border-purple-200 transition-colors">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 text-purple-700 font-bold flex items-center justify-center">
                                            {data.count}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-slate-800 text-lg">{logic}</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Present in: {data.sources.slice(0, 3).join(", ")}
                                                {data.sources.length > 3 && ` and ${data.sources.length - 3} others`}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500"
                                                    style={{ width: `${Math.min((data.count / sources.length) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
