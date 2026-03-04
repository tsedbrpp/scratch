"use client";

import { useWorkspace } from "@/providers/WorkspaceProvider";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertTriangle, Layers, Loader2, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { FrictionGraph } from "./FrictionGraph";

interface Source {
    id: string;
    title: string;
    text: string;
    type: "PDF" | "Web" | "Text" | "Trace" | "Word";
}

export function ControversyDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentWorkspaceId } = useWorkspace();

    const selectedDocId = searchParams.get("doc") || undefined;

    const [sourcesList, setSourcesList] = useState<Source[]>([]);
    const [status, setStatus] = useState<"loading" | "error" | "ready" | "empty">("loading");

    const [mapData, setMapData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    const getHeaders = useCallback((base: HeadersInit = {}) => {
        const headers = { ...base } as Record<string, string>;
        if (currentWorkspaceId) {
            headers['x-workspace-id'] = currentWorkspaceId;
        }
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }
        return headers;
    }, [currentWorkspaceId]);

    // Fetch documents list
    useEffect(() => {
        if (!currentWorkspaceId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== 'true') return;

        let mounted = true;
        async function fetchList() {
            try {
                // Fetch all documents. (Assuming /api/sources exists)
                const res = await fetch("/api/sources", { headers: getHeaders() });
                if (!res.ok) throw new Error("Failed to fetch sources");
                const data = await res.json();

                if (mounted) {
                    if (data.length === 0) setStatus("empty");
                    else {
                        // Filter out secondary evidence (Web) and micro-resistance findings (Trace)
                        const policyDocs = data.filter((s: Source) => s.type !== 'Web' && s.type !== 'Trace');

                        if (policyDocs.length === 0) {
                            setStatus("empty");
                        } else {
                            setSourcesList(policyDocs);
                            setStatus("ready");
                            if (!selectedDocId) {
                                router.replace(`?doc=${policyDocs[0].id}`, { scroll: false });
                            }
                        }
                    }
                }
            } catch (err) {
                if (mounted) setStatus("error");
            }
        }
        fetchList();
        return () => { mounted = false; };
    }, [currentWorkspaceId, getHeaders, selectedDocId, router]);

    const activeDoc = sourcesList.find(s => s.id === selectedDocId);

    // Fetch existing map on doc selection
    useEffect(() => {
        if (!selectedDocId || status !== "ready") return;

        const mounted = true;
        async function fetchMap() {
            setIsGenerating(true);
            setMapError(null);
            try {
                // Actually the route is a POST that can act as a GET if we tell it we just want to check cache?
                // For now, we'll just POST but use checkCacheOnly: false if we explicitly clicekd generate,
                // Wait, if we want to just check the cache, how does our endpoint handle it?
                // Our endpoint currently has no GET logic, so we must POST to it. 
                // There is no query cache. Wait, the endpoint uses `force: false`. So POSTing is fine, it will return cache if available.
                // But it's better to add a simple GET or check cache if necessary.
                // Let's just avoid auto-fetch unless they click generate to save API hits, or let's try a POST with `checkCacheOnly` which the main logic doesn't fully support yet for Controversy route.

                // Let's try doing the POST with force: false
                // But wait, it will run the LLM if cache misses! That's bad for auto-load.
                // We'll skip auto-loading and require explicit generation click, UNLESS we know it exists.
                // Let's keep it manual generation for now: "Run Meta-Synthesis"
                setIsGenerating(false);
            } catch (e) {
                if (mounted) setIsGenerating(false);
            }
        }
        setMapData(null);
        // fetchMap();
    }, [selectedDocId, status]);

    const handleGenerate = async (force = false) => {
        if (!selectedDocId || !activeDoc) return;
        setIsGenerating(true);
        setMapError(null);

        try {
            const res = await fetch("/api/analyze/controversy-mapping", {
                method: "POST",
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    policyId: selectedDocId,
                    documentTitle: activeDoc.title,
                    force
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed to generate map");

            setMapData(data.controversyMap);
        } catch (e: any) {
            setMapError(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center p-12 text-slate-500 animate-pulse">
                <Activity className="w-8 h-8 mb-4 opacity-50" />
                <p className="text-sm font-medium">Loading workspace...</p>
            </div>
        );
    }

    if (status === "empty") {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-slate-500 max-w-md mx-auto text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700">No Documents Found</h3>
                <p className="text-sm text-slate-500">Upload a policy document to trace controversies.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-200 bg-white flex flex-col z-10 shrink-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        Trace Documents
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto w-full">
                    {sourcesList.map((doc) => {
                        const isSelected = selectedDocId === doc.id;
                        return (
                            <button
                                key={doc.id}
                                onClick={() => router.push(`?doc=${doc.id}`)}
                                className={`w-full text-left p-4 border-b border-slate-100 transition-colors hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="text-sm font-medium text-slate-800 truncate mb-1" title={doc.title}>
                                    {doc.title}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">DOC ID: {doc.id.substring(0, 8)}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col relative">
                {/* Epistemic Transparency Banner */}
                <div className="w-full bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-start gap-3 shrink-0">
                    <AlertTriangle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-800">
                        <strong>Generative meta-synthesis by LLM.</strong> All detected frictions and contradictions are proposed
                        connections — always verify against primary lens outputs.
                    </p>
                </div>

                <div className="flex-1 p-6 flex flex-col max-w-7xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                Controversy Map
                                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">Meta-Synthesis</span>
                            </h1>
                            <p className="text-slate-500 mt-1">Synthesizing consensus and frictions across all 7 ontological strata.</p>
                        </div>

                        <button
                            onClick={() => handleGenerate(!!mapData)}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'shadow-md shadow-indigo-200'}`}
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isGenerating ? "Synthesizing Strata..." : mapData ? "Regenerate Map" : "Run Meta-Synthesis"}
                        </button>
                    </div>

                    {mapError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3 text-sm">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <div>
                                <strong>Synthesis Failed</strong>
                                <p>{mapError}</p>
                            </div>
                        </div>
                    )}

                    {!mapData && !isGenerating && !mapError && (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50 space-y-4">
                            <Layers className="h-12 w-12 text-slate-300" />
                            <div className="text-center">
                                <h3 className="font-semibold text-slate-700">Structure Ready</h3>
                                <p className="text-sm text-slate-500 max-w-sm">
                                    Click "Run Meta-Synthesis" to aggregate Cultural Framing, Micro-Resistance, Abstract Machines, and other lenses into a single map.
                                </p>
                            </div>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 space-y-6">
                            <div className="relative">
                                <Activity className="h-10 w-10 text-indigo-400 animate-pulse" />
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-indigo-800 font-medium animate-pulse">Running Pre-LLM Compression (7 strata)...</p>
                                <p className="text-xs text-indigo-500 max-w-sm">
                                    Aggregating Context &gt; Packing JSON &gt; Structuring Frictions
                                </p>
                            </div>
                        </div>
                    )}

                    {mapData && !isGenerating && (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {mapData.isPartial && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start gap-2 text-xs">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Partial Map Generated.</strong> Analysis lacks full cross-strata representation.
                                        Sources used: {mapData.sourcesUsed?.join(", ")}.
                                    </div>
                                </div>
                            )}

                            {/* Render Heatmap / Network Graph via D3 */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex flex-col h-[500px]">
                                <FrictionGraph data={mapData} />
                            </div>

                            {/* Textural summary beneath graph */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        Consensus Zones
                                    </h3>
                                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                        {mapData.consensus_zones?.map((z: any, i: number) => (
                                            <div key={i} className="text-sm p-3 bg-slate-50 border border-slate-100 rounded-md">
                                                <div className="font-medium text-slate-700 mb-1">{z.topic}</div>
                                                <div className="text-slate-600 text-xs mb-2">{z.description}</div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Strength: {z.strength}/10</span>
                                                    <div className="text-[10px] text-slate-500 flex gap-1 items-center">
                                                        <Layers className="h-3 w-3" />
                                                        {z.evidence_from_lenses?.length} lenses
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                                        Structural Contradictions
                                    </h3>
                                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                        {mapData.structural_contradictions?.map((c: any, i: number) => (
                                            <div key={i} className="text-sm p-3 bg-rose-50/50 border border-rose-100 rounded-md">
                                                <div className="text-slate-700 text-xs mb-3 italic">"{c.description}"</div>
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded leading-none mt-0.5 shrink-0">CLAIM</span>
                                                        <span className="text-xs text-slate-600">{c.narrative_claim}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded leading-none mt-0.5 shrink-0">REALITY</span>
                                                        <span className="text-xs text-slate-600">{c.structural_reality}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
