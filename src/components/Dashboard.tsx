"use client";

import { useState, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources"; // Import hook
import { EcosystemActor } from "@/types/ecosystem";
import { Source } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Activity, Upload, Scale, Zap, Coins, Plus, Network } from "lucide-react";
import Link from "next/link";
import { GalaxyGraph } from "@/components/landing/GalaxyGraph";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";

export function Dashboard() {
    const { sources } = useSources(); // Fetch sources internally
    const docCount = sources.filter(s => s.type !== 'Trace').length;
    const traceCount = sources.filter(s => s.type === 'Trace').length;
    const analyzedCount = sources.filter(s => s.analysis || s.cultural_framing || s.institutional_logics).length;

    const [credits, setCredits] = useState<number | null>(null);
    const [showTopUp, setShowTopUp] = useState(false);

    useEffect(() => {
        fetch('/api/credits')
            .then(res => res.json())
            .then(data => setCredits(data.credits))
            .catch(err => console.error("Failed to fetch credits", err));
    }, []);

    // Retrieve ecosystem state to visualize resistance
    const [actors] = useServerStorage<EcosystemActor[]>("ecosystem_actors", []);
    const highResistanceCount = actors.filter(a => (a.metrics?.deterritorialization === 'Strong' || Number(a.metrics?.deterritorialization) > 5)).length;

    return (
        <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Assemblage Dashboard
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Assemblage Resumed. Continue critical entanglement with complex narratives.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex flex-col items-end px-2">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">CreditsAvailable</span>
                        <span className="text-xl font-bold text-indigo-600 flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            {credits !== null ? credits : '...'}
                        </span>
                    </div>
                    <Button onClick={() => setShowTopUp(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="mr-1 h-3 w-3" /> Top Up
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">
                            Documents
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{docCount}</div>
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                            Primary policy texts
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900">
                            Empirical Traces
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Search className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-900">{traceCount}</div>
                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                            Collected from web sources
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900">
                            Analyzed Sources
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900">{analyzedCount}</div>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                            Processed with AI lenses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Rhizomatic Explorer (Primary Navigation) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Rhizomatic Navigation</h3>
                        <p className="text-sm text-slate-500">Explore the assemblage through entangled concepts.</p>
                    </div>
                    {highResistanceCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 animate-pulse">
                            High Resistance Detected in Ecosystem
                        </span>
                    )}
                </div>
                <div className="mb-12">
                    <GalaxyGraph highResistanceCount={highResistanceCount} />
                </div>
            </div>

            {/* Entry Points (Primary Navigation) */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">How do you want to begin?</h3>
                <div className="grid gap-6 md:grid-cols-3">
                    <Link href="/data">
                        <div className="group relative h-full flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer">
                            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors duration-200">
                                <Upload className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 mb-2">Upload Material</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Curate your archive. Upload PDF policy documents, white papers, or datasets to serve as the ground for your analysis.
                            </p>
                            <div className="mt-auto pt-4 flex items-center text-xs font-semibold text-indigo-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                                Go to Archive &rarr;
                            </div>
                        </div>
                    </Link>

                    <Link href="/ecosystem?mode=discovery">
                        <div className="group relative h-full flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-200">
                                <Network className="h-6 w-6 text-blue-600 group-hover:text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 mb-2">Trace an Actor</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Don't have a doc? Start with an actor (e.g., "AI Act") and let the system trace associations via the web.
                            </p>
                            <div className="mt-auto pt-4 flex items-center text-xs font-semibold text-blue-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                                Launch Discovery &rarr;
                            </div>
                        </div>
                    </Link>

                    <Link href="/ecosystem?mode=text">
                        <div className="group relative h-full flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer">
                            <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors duration-200">
                                <FileText className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 mb-2">Paste & Analyze</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Quickly paste text segments, interview transcripts, or field notes for immediate ad-hoc extraction.
                            </p>
                            <div className="mt-auto pt-4 flex items-center text-xs font-semibold text-emerald-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                                Start Analysis &rarr;
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
            <CreditTopUpDialog
                open={showTopUp}
                onOpenChange={setShowTopUp}
                onSuccess={() => {
                    // Refresh credits
                    fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits));
                }}
            />
        </div>
    );
}
