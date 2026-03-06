"use client";

import React, { useEffect, useState, useRef } from "react";
import { TEAAnalysis } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, ArrowRight, ShieldAlert, BookOpen, Layers, AlertTriangle, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

export function TEADiagram({ data }: { data: TEAAnalysis }) {
    // We'll use a responsive flex-col to flex-row layout.
    // The actual arrows from the python script are complex.
    // For this React version, we'll use a clean, modern card flow that works well on all screens.

    if (!data) return <div className="p-8 text-center text-muted-foreground">No TEA data available. Generates a new analysis.</div>;

    return (
        <div className="flex flex-col space-y-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Network className="h-6 w-6 text-indigo-600" />
                        Translation-Embedding Account (TEA)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Travel → Translate → Embed → Legibility → Contest</p>
                </div>
            </div>

            {/* AI Short Summary */}
            {data.short_summary && (
                <div className="bg-indigo-100/50 border border-indigo-200 text-indigo-900 px-5 py-4 rounded-lg text-sm shadow-sm font-medium leading-relaxed">
                    {data.short_summary}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                {/* 1. Portable Governance Codes */}
                <div className="flex flex-col space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">1. Portable Vocabularies</h3>
                    <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Attributes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(data.vocabularies || []).map(code => (
                                <div key={code.id} className="text-sm">
                                    <span className="font-semibold text-blue-900 dark:text-blue-100">{code.term}</span>
                                    <p className="text-blue-700/80 dark:text-blue-400/80 text-xs mt-1">{code.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* 2. Local Translation Regimes */}
                <div className="flex flex-col space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">2. Local Translations</h3>
                    {(data.translations || []).map(regime => (
                        <Card key={regime.id} className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-emerald-800 dark:text-emerald-300">{regime.jurisdiction}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-2">{regime.description}</p>
                                {(regime.referential_drift || []).map((drift, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-900 dark:text-emerald-100">
                                        <ArrowRight className="h-3 w-3 text-emerald-500" />
                                        <span>{drift}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 3. Stratifying Infrastructures */}
                <div className="flex flex-col space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">3. Embedding Infrastructures</h3>
                    <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                <Layers className="h-4 w-4" /> Core Mechanisms
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(data.embedding_infrastructures || []).map(inf => (
                                <div key={inf.id} className="text-sm">
                                    <span className="font-semibold text-amber-900 dark:text-amber-100">{inf.name}</span>
                                    <p className="text-amber-700/80 dark:text-amber-400/80 text-xs mt-0.5">{inf.description}</p>
                                </div>
                            ))}

                            {/* Inject Stratified Legibility here as a sub-component */}
                            {data.stratified_legibility && (
                                <div className="mt-6 pt-4 border-t border-amber-200/50 dark:border-amber-800/50">
                                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-2 uppercase tracking-wide">Stratified Legibility</h4>
                                    <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mb-3">{data.stratified_legibility.description}</p>

                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-[10px] uppercase text-amber-600 dark:text-amber-500 font-bold">Highly Legible</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {data.stratified_legibility.highly_legible.map((l, i) => <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] py-0 px-1.5">{l}</Badge>)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase text-slate-500 font-bold">Weakly / Indirectly Legible</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(data.stratified_legibility.weakly_legible || []).map((l, i) => <Badge key={i} variant="outline" className="text-slate-500 text-[10px] py-0 px-1.5 border-amber-200">{l}</Badge>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Coordinating Apex Nodes */}
                <div className="flex flex-col space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">4. Apex Nodes</h3>
                    <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 h-full">
                        <CardContent className="pt-6 space-y-4">
                            {(data.apex_nodes || []).map(node => (
                                <div key={node.id} className="text-sm">
                                    <span className="font-bold text-rose-900 dark:text-rose-100">{node.name}</span>
                                    <ul className="mt-2 space-y-1">
                                        {(node.function || []).map((fn, i) => (
                                            <li key={i} className="text-rose-700/90 dark:text-rose-400/90 text-xs flex items-start gap-1">
                                                <span className="text-rose-400">•</span> {fn}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* 5. Sedimentation & Counter-Translations */}
                <div className="flex flex-col space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">5. Outcomes</h3>

                    {/* Sedimentation */}
                    <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm uppercase tracking-wide text-indigo-800 dark:text-indigo-300">Sedimentation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {(data.contestations || []).filter(o => o.type === "sedimentation").map(out => (
                                <div key={out.id} className="text-xs">
                                    <p className="text-indigo-900 dark:text-indigo-100 font-medium">{out.description}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {(out.examples || []).map((ex, i) => <Badge key={i} variant="secondary" className="bg-indigo-100 text-indigo-800 text-[10px] py-0">{ex}</Badge>)}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Counter-Translations */}
                    <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900 border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm uppercase tracking-wide text-red-800 dark:text-red-400 flex items-center gap-1.5">
                                <ShieldAlert className="h-4 w-4" /> Counter-Translations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(data.contestations || []).filter(o => o.type === "counter_translation").map(out => (
                                <div key={out.id} className="text-xs">
                                    <p className="text-red-900 dark:text-red-100 font-medium">{out.description}</p>
                                    <ul className="mt-1.5 space-y-1">
                                        {(out.examples || []).map((ex, i) => (
                                            <li key={i} className="text-red-700/90 dark:text-red-400/90 text-[10px] flex items-start gap-1">
                                                <span className="text-red-400 mt-0.5">↳</span> {ex}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <p className="text-[10px] text-red-600/60 dark:text-red-500/60 italic mt-2 border-t border-red-200 pt-2">
                                * Counter-coding reopens categories that infrastructure attempted to close.
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Level 6: Theoretical Propositions (Evidence) */}
            {data.propositions && data.propositions.length > 0 && (
                <div className="relative z-10 pt-6 border-t border-slate-200 mt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="text-indigo-600 h-6 w-6" />
                        <h3 className="text-xl font-semibold text-slate-800">Evidence for TEA Propositions</h3>
                    </div>
                    <div className="space-y-4">
                        {data.propositions.map((prop, i) => {
                            let BadgeIcon = HelpCircle;
                            let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";

                            if (prop.support_level === "strong") {
                                BadgeIcon = CheckCircle2;
                                badgeColor = "bg-green-100 text-green-800 border-green-200";
                            } else if (prop.support_level === "moderate") {
                                BadgeIcon = AlertCircle;
                                badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
                            } else if (prop.support_level === "weak") {
                                BadgeIcon = AlertTriangle;
                                badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
                            }

                            return (
                                <Card key={i} className="border-indigo-100 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-indigo-900 mb-2 text-sm">
                                                    Proposition {prop.id.replace('prop_', '')}: {prop.proposition}
                                                </h4>
                                                <p className="text-sm text-slate-700 bg-indigo-50/50 p-3 rounded-md border border-indigo-50/50">
                                                    <strong className="text-indigo-950 block mb-1">Empirical Evidence:</strong>
                                                    {prop.evidence}
                                                </p>
                                            </div>
                                            <div className="md:w-32 flex-shrink-0 flex items-start justify-end">
                                                <Badge variant="outline" className={`flex items-center gap-1.5 px-2.5 py-1 ${badgeColor}`}>
                                                    <BadgeIcon className="h-3.5 w-3.5" />
                                                    <span className="capitalize font-medium">{prop.support_level} Support</span>
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Narrative Synthesis Block */}
            {data.raw_synthesis_text && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-4">Theoretical Synthesis Narrative</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        {(data.raw_synthesis_text || '').split('\n').map((line, i) => {
                            if (!line.trim()) return <br key={i} />;
                            if (line.startsWith('**') || line.startsWith('Proposition')) return <h4 key={i} className="mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                            return <p key={i} className="mb-2">{line}</p>;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
