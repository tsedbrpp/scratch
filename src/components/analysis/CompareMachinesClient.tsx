"use client";

import { useWorkspace } from "@/providers/WorkspaceProvider";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AbstractMachineCompareD3 } from "./AbstractMachineCompareD3";
import { AbstractMachineAnalysis } from "@/types";
import { AlertCircle, ArrowLeftRight, ChevronRight, Layers, Network, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { normalizeAbstractMachine } from "./abstractMachineNormalize";
import { diffAbstractMachines } from "./abstractMachineDiff";
import type { AICompareAbstractMachinesResponse } from "@/lib/prompts/compare-machines";
import { ComparisonDashboard } from "./ComparisonDashboard";

interface LightweightSource {
    id: string;
    title: string;
}

const urlSchema = z.object({
    left: z.string().optional(),
    right: z.string().optional(),
    view: z.enum(["dashboard", "machine", "strata", "state", "diff", "ai"]).catch("machine"),
});

export function CompareMachinesClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentWorkspaceId } = useWorkspace();

    // Parse URL Params safely
    const parsedParams = urlSchema.safeParse({
        left: searchParams.get("left") || undefined,
        right: searchParams.get("right") || undefined,
        view: searchParams.get("view") || "machine",
    });

    const leftId = parsedParams.success ? parsedParams.data.left : undefined;
    const rightId = parsedParams.success ? parsedParams.data.right : undefined;
    const viewMode = parsedParams.success ? parsedParams.data.view : "machine";

    const [sourcesList, setSourcesList] = useState<LightweightSource[]>([]);
    const [fullMachines, setFullMachines] = useState<Record<string, AbstractMachineAnalysis>>({});
    const [status, setStatus] = useState<"loading" | "error" | "ready" | "empty">("loading");

    // AI Analysis State
    const [aiReport, setAiReport] = useState<{ timestamp: number, comparison: AICompareAbstractMachinesResponse, model_name: string, schema_version?: number } | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [analyzedIds, setAnalyzedIds] = useState<{ left?: string, right?: string }>({ left: leftId, right: rightId });

    // Sync AI Report state when the selected documents change
    if (analyzedIds.left !== leftId || analyzedIds.right !== rightId) {
        setAiReport(null);
        setAiError(null);
        setAnalyzedIds({ left: leftId, right: rightId });
    }

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

    // Fetch the lightweight list when workspace is ready
    useEffect(() => {
        // Wait until Workspace is initialized (handles both auth and demo states)
        if (!currentWorkspaceId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== 'true') return;

        let mounted = true;

        async function fetchList() {
            try {
                const res = await fetch("/api/sources/abstract-machines?list=true", {
                    headers: getHeaders()
                });
                if (!res.ok) throw new Error("Failed to fetch abstract machines list");

                const data: LightweightSource[] = await res.json();

                if (mounted) {
                    if (data.length === 0) {
                        setStatus("empty");
                    } else {
                        setSourcesList(data);
                        setStatus("ready");

                        // Auto-select latest two if URL params are empty
                        if (!leftId && !rightId && data.length >= 1) {
                            const newLeft = data[0].id;
                            const newRight = data.length > 1 ? data[1].id : undefined;

                            const params = new URLSearchParams(searchParams.toString());
                            params.set("left", newLeft);
                            if (newRight) params.set("right", newRight);

                            // Prevent full re-fetch spam by waiting a tick
                            requestAnimationFrame(() => {
                                router.replace(`?${params.toString()}`, { scroll: false });
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching machines list:", err);
                if (mounted) setStatus("error");
            }
        }

        fetchList();

        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWorkspaceId, getHeaders]); // React to workspace ID changes

    // Fetch actual machine payloads when selection changes
    useEffect(() => {
        const idsToFetch = [leftId, rightId].filter(Boolean) as string[];
        const missingIds = idsToFetch.filter(id => fullMachines[id] === undefined);

        if (missingIds.length === 0) return; // Already have them cached

        let mounted = true;

        async function fetchMachines() {
            try {
                const res = await fetch(`/api/sources/abstract-machines?ids=${missingIds.join(',')}`, {
                    headers: getHeaders()
                });
                if (!res.ok) throw new Error("Failed to fetch full machines");

                const data: { id: string, abstract_machine: AbstractMachineAnalysis }[] = await res.json();

                if (mounted) {
                    setFullMachines(prev => {
                        const next = { ...prev };
                        missingIds.forEach(id => {
                            const found = data.find(item => item.id === id);
                            next[id] = found ? found.abstract_machine : (null as any);
                        });
                        return next;
                    });
                }
            } catch (err) {
                console.error("Error fetching full machine data:", err);
            }
        }

        fetchMachines();

        return () => { mounted = false; };
    }, [leftId, rightId, fullMachines, getHeaders]);

    // Optional: Auto-fetch AI report if we mount/switch to AI view and have both IDs
    const fetchAiAnalysis = React.useCallback(async (force = false) => {
        if (!leftId || !rightId) return;
        setIsGeneratingAi(true);
        setAiError(null);
        try {
            const isForce = force === true; // Enforce strict boolean so Zod doesn't fail on React Event objects
            const res = await fetch(`/api/analyze/compare-machines`, {
                method: "POST",
                headers: { ...getHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ leftId, rightId, force: isForce })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to generate AI analysis");
            }
            const data = await res.json();
            setAiReport(data);
        } catch (err: unknown) {
            setAiError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsGeneratingAi(false);
        }
    }, [leftId, rightId, getHeaders]);

    // Refetch AI Analysis if we explicitly switch to the View and haven't fetched it yet
    React.useEffect(() => {
        let mounted = true;

        if ((viewMode === "ai" || viewMode === "dashboard") && leftId && rightId && !aiReport && !isGeneratingAi && !aiError) {
            // Prevent duplicate triggers by eagerly setting the loading state
            setIsGeneratingAi(true);

            fetchAiAnalysis().finally(() => {
                if (mounted) {
                    setIsGeneratingAi(false);
                }
            });
        }

        return () => { mounted = false; };
        // We INTENTIONALLY exclude `isGeneratingAi`, `aiReport`, `aiError` and `fetchAiAnalysis` from this hook's dependency array.
        // Including them causes React to infinitely cycle as the state resolves and triggers re-evaluations.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, leftId, rightId]);

    const handleParamChange = (key: "left" | "right" | "view", value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Prepare data directly for the renderer (Moved above conditional returns to satisfy Hooks rules)
    const leftMachine = leftId ? fullMachines[leftId] || null : null;
    const rightMachine = rightId ? fullMachines[rightId] || null : null;

    const leftTitle = sourcesList.find(s => s.id === leftId)?.title || "Unknown Document";
    const rightTitle = sourcesList.find(s => s.id === rightId)?.title || "Unknown Document";

    // Normalize and compute diff before conditionally returning
    const leftNorm = React.useMemo(() => (leftMachine ? normalizeAbstractMachine(leftMachine) : null), [leftMachine]);
    const rightNorm = React.useMemo(() => (rightMachine ? normalizeAbstractMachine(rightMachine) : null), [rightMachine]);

    const computedDiff = React.useMemo(() => {
        if (!leftNorm?.normalized || !rightNorm?.normalized) return null;
        return diffAbstractMachines(leftNorm.normalized, rightNorm.normalized);
    }, [leftNorm, rightNorm]);

    const canRender = Boolean(leftNorm?.normalized && rightNorm?.normalized);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
                <Network className="w-8 h-8 mb-4 opacity-50 text-blue-500" />
                <p>Loading abstract machines workspace...</p>
            </div>
        );
    }

    if (status === "empty") {
        return (
            <div className="flex justify-center p-6 sm:p-12 md:p-24 pl-8">
                <div className="flex flex-col items-center justify-center max-w-md text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
                        <Layers className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Machines Extracted</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        To compare abstract machines, you first need to extract them from your ingested policy documents.
                    </p>
                    <Link
                        href="/data"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        Go to Data & Sources
                        <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-red-500">
                <AlertCircle className="w-8 h-8 mb-4 opacity-50" />
                <p>Failed to load abstract machines. Please try refreshing.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header Controls */}
            <header className="flex flex-wrap items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2 mr-4 hidden md:flex">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded flex items-center justify-center">
                        <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">Compare Abstract Machines</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Side-by-side Layout</p>
                    </div>
                </div>

                <div className="flex flex-wrap flex-1 gap-4 items-center min-w-0">
                    {/* View Switcher */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto shrink-0 max-w-full">
                        {([
                            ["dashboard", "Visualizations"],
                            ["machine", "Machine"],
                            ["strata", "Strata"],
                            ["state", "State Capture"],
                            ["diff", "Computed Diff"],
                            ["ai", "AI Analysis"]
                        ] as const).map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => handleParamChange("view", val)}
                                className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${viewMode === val
                                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Source Selectors */}
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <div className="flex items-center flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden min-w-[150px]">
                            <select
                                value={leftId || ""}
                                onChange={e => handleParamChange("left", e.target.value)}
                                className="w-full text-sm p-2 bg-transparent text-slate-900 dark:text-slate-100 outline-none truncate"
                            >
                                <option value="" disabled>Select Left Document...</option>
                                {sourcesList.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>

                        <ArrowLeftRight className="w-4 h-4 text-slate-400 shrink-0" />

                        <div className="flex items-center flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden min-w-[200px]">
                            <select
                                value={rightId || ""}
                                onChange={e => handleParamChange("right", e.target.value)}
                                className="w-full text-sm p-2 bg-transparent text-slate-900 dark:text-slate-100 outline-none truncate"
                            >
                                <option value="" disabled>Select Right Document...</option>
                                {sourcesList.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Legend Panel */}
            <div className="flex flex-wrap text-sm gap-2 sm:gap-6 px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 whitespace-nowrap overflow-x-auto">
                <div className="text-slate-500 font-mono text-[10px] uppercase tracking-widest flex items-center mr-2">
                    Visual Legend
                </div>
                {viewMode === "machine" && (
                    <>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-4 h-3 bg-blue-50 dark:bg-blue-900 border border-blue-600 dark:border-blue-500 rounded-sm"></div>
                            <span>Operator</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-3 h-3 bg-green-50 dark:bg-green-900 border border-green-600 dark:border-green-500 rounded-full"></div>
                            <span>Token</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-3 h-3 bg-amber-50 dark:bg-amber-900 border border-amber-600 dark:border-amber-500" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
                            <span>Global Constraint (dashed line)</span>
                        </div>
                    </>
                )}
                {viewMode === "strata" && (
                    <>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-4 h-3 bg-purple-50 dark:bg-purple-900 border border-purple-600 dark:border-purple-500 rounded-sm"></div>
                            <span>Content</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-4 h-3 bg-pink-50 dark:bg-pink-900 border border-pink-600 dark:border-pink-500 rounded-sm"></div>
                            <span>Expression</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 ml-2">
                            <div className="w-6 h-px bg-slate-400"></div>
                            <span>Resonance</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-6 h-px border-b border-dashed border-slate-400"></div>
                            <span>Clash</span>
                        </div>
                    </>
                )}
                {viewMode === "state" && (
                    <>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-4 h-3 bg-teal-50 dark:bg-teal-900 border border-teal-600 dark:border-teal-500 rounded-sm"></div>
                            <span>State Node</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 ml-2">
                            <div className="w-10 h-px bg-slate-400 relative">
                                <svg className="w-3 h-3 absolute right-0 -translate-y-[5px]" viewBox="0 -5 10 10" preserveAspectRatio="none"><path d="M0,-5L10,0L0,5" fill="currentColor" /></svg>
                            </div>
                            <span>Transformation trigger</span>
                        </div>
                    </>
                )}
            </div>

            {/* Same Document Warning */}
            {leftId && leftId === rightId && (
                <div className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400 text-sm rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    You have selected the same document on both sides. This will show a mirrored view.
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 w-full min-h-0 relative overflow-y-auto">
                {viewMode === "diff" ? (
                    <div className="p-6 max-w-7xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Computed Structural Diff</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                                A deterministic set-based comparison of operators, constraints, and transformations between the two abstract machines.
                            </p>
                        </div>

                        {!canRender && (
                            <div className="text-sm text-slate-500 italic p-8 border border-dashed border-slate-300 rounded-xl text-center">
                                Please select both a Left and Right document to compute the diff.
                            </div>
                        )}

                        {canRender && computedDiff && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <section className="p-5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-xl shadow-sm">
                                    <div className="font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/30 pb-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        Shared Spine
                                    </div>
                                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                        {computedDiff.textRepresentation.sharedSpine.length === 0 ? <li className="text-slate-400 italic text-xs">No shared elements found.</li> : null}
                                        {computedDiff.textRepresentation.sharedSpine.map((x: string) => (
                                            <li key={x} className="flex gap-2"><span className="text-emerald-500">•</span> <span>{x}</span></li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="p-5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-xl shadow-sm">
                                    <div className="font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/30 pb-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        Only in Left ({leftTitle})
                                    </div>
                                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                        {computedDiff.textRepresentation.onlyInLeft.length === 0 ? <li className="text-slate-400 italic text-xs">No unique elements on left.</li> : null}
                                        {computedDiff.textRepresentation.onlyInLeft.map((x: string) => (
                                            <li key={x} className="flex gap-2"><span className="text-blue-500">•</span> <span>{x}</span></li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="p-5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-xl shadow-sm">
                                    <div className="font-bold text-purple-800 dark:text-purple-400 mb-3 flex items-center gap-2 border-b border-purple-100 dark:border-purple-900/30 pb-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        Only in Right ({rightTitle})
                                    </div>
                                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                        {computedDiff.textRepresentation.onlyInRight.length === 0 ? <li className="text-slate-400 italic text-xs">No unique elements on right.</li> : null}
                                        {computedDiff.textRepresentation.onlyInRight.map((x: string) => (
                                            <li key={x} className="flex gap-2"><span className="text-purple-500">•</span> <span>{x}</span></li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        )}
                    </div>
                ) : viewMode === "dashboard" ? (
                    <div className="flex-1 w-full p-4 h-full bg-slate-100 dark:bg-black/20">
                        <ComparisonDashboard
                            leftMachine={(leftNorm?.normalized as AbstractMachineAnalysis) || null}
                            rightMachine={(rightNorm?.normalized as AbstractMachineAnalysis) || null}
                            leftSource={sourcesList.find(s => s.id === leftId) as any}
                            rightSource={sourcesList.find(s => s.id === rightId) as any}
                            aiReport={aiReport as any}
                            onRegenerate={() => fetchAiAnalysis(true)}
                            isRegenerating={isGeneratingAi}
                        />
                    </div>
                ) : viewMode === "ai" ? (
                    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
                        <div className="flex items-center gap-4 justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                    AI Structural Analysis
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Deleuzian Assemblage comparison generated by {aiReport?.model_name || "AI"}.
                                </p>
                            </div>
                            <button
                                onClick={() => fetchAiAnalysis(true)}
                                disabled={isGeneratingAi || !canRender}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm rounded-lg text-sm font-medium transition-colors"
                            >
                                {isGeneratingAi ? "Analyzing..." : aiReport ? "Regenerate" : "Generate Report"}
                            </button>
                        </div>

                        {!canRender && (
                            <div className="text-sm text-slate-500 italic p-8 border border-dashed border-slate-300 rounded-xl text-center">
                                Please select both a Left and Right document to generate an AI analysis.
                            </div>
                        )}

                        {isGeneratingAi && (
                            <div className="flex flex-col items-center justify-center p-12 text-indigo-600 dark:text-indigo-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p className="text-sm font-medium">Extracting theoretical comparisons...</p>
                            </div>
                        )}

                        {aiError && !isGeneratingAi && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-900">
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                {aiError}
                            </div>
                        )}

                        {aiReport && !isGeneratingAi && (
                            <div className="space-y-10">
                                {/* Shared Spine */}
                                <section>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-l-4 border-emerald-500 pl-3">
                                        Shared Spine (Obligatory Passage Points)
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{aiReport.comparison.shared_spine.explanation}</p>
                                    <ul className="space-y-3 pl-4">
                                        {aiReport.comparison.shared_spine.items.map((item, i) => (
                                            <li key={i} className="text-sm bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-100 dark:border-slate-800">
                                                <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.element_name}</span>: {item.significance}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Differences */}
                                <section>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-l-4 border-amber-500 pl-3">
                                        Fundamental Divergences
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{aiReport.comparison.differences.explanation}</p>
                                    <ul className="space-y-3 pl-4">
                                        {aiReport.comparison.differences.items.map((item, i) => (
                                            <li key={i} className="text-sm bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-100 dark:border-slate-800">
                                                <span className="font-bold text-amber-700 dark:text-amber-400">{item.element_name}</span>: {item.description}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Double Articulation */}
                                <section>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-l-4 border-blue-500 pl-3">
                                        Double Articulation
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{aiReport.comparison.double_articulation.explanation}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{leftTitle}</div>
                                            {aiReport.schema_version === 2 ? (
                                                <div className="text-sm text-slate-800 dark:text-slate-300">
                                                    <div className="font-semibold mb-1">Content:</div>
                                                    <ul className="list-disc pl-4 mb-3">{aiReport.comparison.double_articulation.left_content_items?.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
                                                    <div className="font-semibold mb-1">Expression:</div>
                                                    <ul className="list-disc pl-4">{aiReport.comparison.double_articulation.left_expression_items?.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-800 dark:text-slate-300">{(aiReport.comparison.double_articulation as any).left_tension}</p>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{rightTitle}</div>
                                            {aiReport.schema_version === 2 ? (
                                                <div className="text-sm text-slate-800 dark:text-slate-300">
                                                    <div className="font-semibold mb-1">Content:</div>
                                                    <ul className="list-disc pl-4 mb-3">{aiReport.comparison.double_articulation.right_content_items?.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
                                                    <div className="font-semibold mb-1">Expression:</div>
                                                    <ul className="list-disc pl-4">{aiReport.comparison.double_articulation.right_expression_items?.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-800 dark:text-slate-300">{(aiReport.comparison.double_articulation as any).right_tension}</p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Conclusion */}
                                <section className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-3">
                                        Synthesis
                                    </h3>
                                    <p className="text-indigo-950 dark:text-indigo-100 leading-relaxed italic">
                                        &quot;{aiReport.comparison.conclusion}&quot;
                                    </p>
                                    <div className="mt-4 text-[10px] text-indigo-400 uppercase tracking-wider text-right">
                                        Generated by {aiReport.model_name}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                ) : (
                    <AbstractMachineCompareD3
                        leftMachine={(leftNorm?.normalized as AbstractMachineAnalysis) || null}
                        rightMachine={(rightNorm?.normalized as AbstractMachineAnalysis) || null}
                        leftTitle={leftTitle}
                        rightTitle={rightTitle}
                        viewMode={viewMode as "machine" | "strata" | "state"}
                    />
                )}
            </div>
        </div>
    );
}
