"use client";

import { useWorkspace } from "@/providers/WorkspaceProvider";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AbstractMachineCompareD3, ViewMode } from "./AbstractMachineCompareD3";
import { AbstractMachineAnalysis } from "@/types";
import { AlertCircle, ArrowLeftRight, ChevronRight, Layers, Network } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

interface LightweightSource {
    id: string;
    title: string;
}

const urlSchema = z.object({
    left: z.string().optional(),
    right: z.string().optional(),
    view: z.enum(["machine", "strata", "state"]).catch("machine"),
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
        const missingIds = idsToFetch.filter(id => !fullMachines[id]);

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
                        data.forEach(item => {
                            next[item.id] = item.abstract_machine;
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

    const handleParamChange = (key: "left" | "right" | "view", value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.push(`?${params.toString()}`, { scroll: false });
    };

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

    // Prepare data directly for the renderer
    const leftMachine = leftId ? fullMachines[leftId] || null : null;
    const rightMachine = rightId ? fullMachines[rightId] || null : null;

    const leftTitle = sourcesList.find(s => s.id === leftId)?.title || "Unknown Document";
    const rightTitle = sourcesList.find(s => s.id === rightId)?.title || "Unknown Document";

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

                <div className="flex flex-col flex-1 gap-4 lg:flex-row lg:items-center min-w-0">
                    {/* View Switcher */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shrink-0">
                        {([
                            ["machine", "Machine"],
                            ["strata", "Strata"],
                            ["state", "State Capture"]
                        ] as const).map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => handleParamChange("view", val)}
                                className={`px-4 py-2 text-xs font-medium transition-colors ${viewMode === val
                                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block mx-2"></div>

                    {/* Source Selectors */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden min-w-[200px]">
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

            {/* D3 Payload */}
            <div className="flex-1 w-full min-h-0 relative">
                <AbstractMachineCompareD3
                    leftMachine={leftMachine}
                    rightMachine={rightMachine}
                    leftTitle={leftTitle}
                    rightTitle={rightTitle}
                    viewMode={viewMode}
                />
            </div>
        </div>
    );
}
