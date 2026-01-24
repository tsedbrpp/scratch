"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Source, ResistanceSynthesisResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResistanceVisualization } from "@/components/resistance/ResistanceVisualization";

import { Zap, EyeOff, Activity, Wrench, Users, Loader2, Search, Trash } from "lucide-react";

import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";

// Define Strategy Definitions with Icons for UI
const STRATEGY_DEFINITIONS = [
    { title: "Gambiarra", icon: Wrench, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Obfuscation", icon: EyeOff, color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Solidarity", icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { title: "Refusal", icon: Zap, color: "text-red-600", bg: "bg-red-100" },
];
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";



export default function ResistancePage() {
    const { sources, addSource, updateSource, deleteSource, isLoading } = useSources();
    const { isReadOnly } = useDemoMode();
    const [selectedTraceId, setSelectedTraceId] = useServerStorage<string | null>("resistance_selected_trace_id", null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

    // Credit System
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [showTopUp, setShowTopUp] = useState(false);

    // Identify Policy Documents (Not traces)
    const policyDocuments = sources.filter(s => s.type !== "Trace");

    // Filter traces based on selection
    const traces = sources.filter(s =>
        ((s.type === 'Trace' && s.traceType === 'resistance') || (s.type === 'Text' && s.extractedText)) &&
        s.policyId === selectedPolicyId
    );

    const [isFetching, setIsFetching] = useState(false);

    const handleDeepFetch = async (trace: Source) => {
        if (!trace.sourceUrl) return;
        if (isReadOnly) {
            toast.error("Deep fetch disabled in Demo Mode");
            return;
        }

        setIsFetching(true);
        toast.info("Fetching full content...", { description: "Retrieving original article text." });

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/fetch-url', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ url: trace.sourceUrl })
            });

            const result = await response.json();
            if (result.success && result.text) {
                // Update source with full text
                const updatedTrace = {
                    ...trace,
                    extractedText: result.text.substring(0, 15000), // Cap size
                    description: `[Full Text Fetched] ${trace.description}`
                };

                await updateSource(trace.id, {
                    extractedText: updatedTrace.extractedText,
                    description: updatedTrace.description
                });

                toast.success("Content Fetched!", { description: "Now re-analyzing with full context..." });

                // Re-Analyze automatically
                await handleAnalyzeTrace(updatedTrace);
            } else {
                toast.error("Fetch failed", { description: result.error || "Could not extract content." });
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Network error during fetch.");
        } finally {
            setIsFetching(false);
        }
    };

    // Existing handleAnalyzeTrace...
    const handleAnalyzeTrace = async (trace: Source) => {
        if (!trace.extractedText) return;
        if (isReadOnly) {
            toast.error("Analysis disabled in Demo Mode");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }

        setIsAnalyzing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: trace.extractedText.substring(0, 3000),
                    sourceType: 'Empirical Trace',
                    analysisMode: 'resistance'
                })
            });

            const result = await response.json();
            if (result.success) {
                await updateSource(trace.id, { resistance_analysis: result.analysis });
                refetchCredits(); // Refresh credits after successful analysis
                toast.success("Trace analyzed successfully!");
            } else {
                if (response.status === 429 || result.error === "Quota Exceeded") {
                    toast.error("Quota Exceeded", {
                        description: "You have reached your lifetime API limit. Please contact admin.",
                        duration: 5000,
                    });
                } else {
                    toast.error("Analysis failed", { description: result.error });
                }
            }
        } catch (error) {
            console.error("Analysis failed", error);
            toast.error("Failed to analyze trace.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const selectedTrace = traces.find(t => t.id === selectedTraceId);
    const currentAnalysis = selectedTrace?.resistance_analysis;

    const [isSearching, setIsSearching] = useState(false);
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
    const [searchSource, setSearchSource] = useState<Source | null>(null);
    const [customQuery, setCustomQuery] = useServerStorage<string>("resistance_custom_query", "");
    const [selectedPlatforms, setSelectedPlatforms] = useServerStorage<string[]>("resistance_selected_platforms", ["reddit", "hackernews", "forums"]);
    const [dynamicLexicon, setDynamicLexicon] = useState<string>("");
    const [showFrictionLog, setShowFrictionLog] = useState(false);

    // Persistent Strategy Tracking
    const [monitoredVectors, setMonitoredVectors] = useServerStorage<string[]>("monitored_vectors", []);

    const handleToggleMonitor = (id: string) => {
        setMonitoredVectors(prev => {
            const current = prev || [];
            if (current.includes(id)) {
                return current.filter(v => v !== id);
            } else {
                return [...current, id];
            }
        });
    };

    const handleSearchTraces = async () => {
        if (isReadOnly) {
            toast.error("Search disabled in Demo Mode");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }
        if (!selectedPolicyId) {
            alert("Please select a policy document first.");
            return;
        }

        // Need either a policy source or custom query
        // If searching with a specific source context, valid. Or just custom query.
        // But we MUST link result to selectedPolicyId.

        // Find the full source object for the selected policy to use as context if needed
        const activePolicy = sources.find(s => s.id === selectedPolicyId);

        if (!activePolicy?.extractedText && !customQuery.trim()) {
            alert("No text in selected policy and no custom query provided.");
            return;
        }

        setIsSearching(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/search-traces', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    policyText: activePolicy?.extractedText?.substring(0, 3000),
                    policyTitle: activePolicy?.title,
                    customQuery: customQuery.trim() || undefined,
                    dynamicLexicon: dynamicLexicon.trim() || undefined,
                    platforms: selectedPlatforms
                })
            });

            const result = await response.json();


            if (result.success && Array.isArray(result.traces)) {
                const newTraces = result.traces.map((trace: { title: string; description: string; query: string; content: string; sourceUrl: string; strategy?: string; explanation?: string }) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    title: `[Web] ${trace.title}`,
                    description: `${trace.description} • Query: "${trace.query}"`,
                    type: "Trace",
                    traceType: "resistance" as const, // Explicitly mark as resistance reaction
                    extractedText: `${trace.content}\n\nSource: ${trace.sourceUrl}`,
                    sourceUrl: trace.sourceUrl, // Persist the URL!
                    addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    status: "Active Case",
                    colorClass: "bg-blue-100",
                    iconClass: "text-blue-600",
                    policyId: selectedPolicyId, // Link to selected policy
                    resistance_analysis: trace.strategy ? {
                        strategy_detected: trace.strategy,
                        evidence_quote: trace.content,
                        interpretation: trace.explanation || "⚠️ NO INTERPRETATION RECEIVED",
                        confidence: "Medium"
                    } : undefined
                }));

                // Add each new trace to the store
                for (const trace of newTraces) {
                    const addedSource = await addSource(trace);

                    // Auto-Analyze "Weak" classifications to get specific strategy
                    const weakStrategies = ["Potential Resistance", "Friction", "Unclassified"];
                    if (!trace.resistance_analysis?.strategy_detected || weakStrategies.includes(trace.resistance_analysis.strategy_detected)) {
                        handleAnalyzeTrace(addedSource);
                    }
                }

                toast.success(`Found ${newTraces.length} resistance traces from the web for ${activePolicy?.title}!`);
                setCustomQuery(""); // Reset query
            } else {
                if (response.status === 429 || result.error === "Quota Exceeded") {
                    toast.error("Quota Exceeded", {
                        description: "You have reached your lifetime API limit. Please contact admin.",
                        duration: 5000,
                    });
                } else {
                    toast.error("Search failed", { description: result.error || "Unknown error" });
                }
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to search for traces", { description: "Make sure your Google Search API is configured." });
        } finally {
            setIsSearching(false);
            setIsSearchDialogOpen(false);
        }
    };

    const handleDeleteTrace = async (traceId: string) => {
        if (isReadOnly) {
            toast.error("Deletion disabled in Demo Mode");
            return;
        }
        if (confirm(`Are you sure you want to delete this trace?`)) {
            await deleteSource(traceId);
            if (selectedTraceId === traceId) {
                setSelectedTraceId(null);
            }
        }
    };

    const handleResetTraces = async () => {
        if (!selectedPolicyId) return;
        if (isReadOnly) {
            toast.error("Reset disabled in Demo Mode");
            return;
        }

        if (confirm("Are you sure? This will DELETE ALL traces for this policy and CLEAR the search cache. This action cannot be undone.")) {
            // 1. Delete all traces for this policy
            const policyTraces = sources.filter(s => s.type === 'Trace' && s.policyId === selectedPolicyId);
            let deletedCount = 0;

            for (const trace of policyTraces) {
                await deleteSource(trace.id);
                deletedCount++;
            }

            // 2. Clear Server Cache
            try {
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                    headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
                }

                // We need to re-construct the same context to generate the key
                const activePolicy = sources.find(s => s.id === selectedPolicyId);
                const response = await fetch('/api/search-traces', {
                    method: 'DELETE',
                    headers: headers,
                    body: JSON.stringify({
                        policyText: activePolicy?.extractedText?.substring(0, 3000),
                        // customQuery: customQuery.trim() || undefined, // We might not know the exact query used, but usually cache is cleared by just clearing the "latest" one or all if possible.
                        // Actually, the API requires the exact params to generate the key.
                        // If the user changed the query, we can't clear the old one easily. 
                        // But usually users want to clear the *current* view.
                        customQuery: customQuery.trim() || undefined,
                        platforms: selectedPlatforms
                    })
                });

                if (response.ok) {
                    toast.success(`Reset Complete`, { description: `Deleted ${deletedCount} traces and cleared cache.` });
                } else {
                    toast.warning(`Traces deleted, but cache clear failed.`);
                }
            } catch (error) {
                console.error("Reset error:", error);
                toast.error("Network error during reset.");
            }

            setSelectedTraceId(null);
            setSynthesisResult(null);
        }
    };

    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [synthesisResult, setSynthesisResult] = useServerStorage<ResistanceSynthesisResult | null>(
        selectedPolicyId ? `resistance_synthesis_result_${selectedPolicyId}` : "resistance_synthesis_result_draft",
        null
    );

    const handleSynthesizeFindings = async () => {
        if (isReadOnly) {
            toast.error("Synthesis disabled in Demo Mode");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }
        const analyzedTraces = traces.filter(t => t.resistance_analysis);
        if (analyzedTraces.length < 2) {
            toast.error("Not enough data", { description: "Please analyze at least 2 traces before synthesizing." });
            return;
        }

        // Check if we already have results and ask for confirmation
        if (synthesisResult) {
            if (!confirm("Existing synthesis found. Do you want to re-run it? This will overwrite the current findings.")) {
                return;
            }
        }

        setIsSynthesizing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    analysisMode: 'resistance_synthesis',
                    documents: analyzedTraces.map(t => ({
                        title: t.title,
                        content: t.extractedText,
                        analysis: t.resistance_analysis
                    })),
                    force: !!synthesisResult // Force refresh if we are overwriting existing results
                })
            });

            const result = await response.json();
            if (result.success) {
                setSynthesisResult(result.analysis);
                refetchCredits();
                toast.success("Synthesis complete!");
            } else {
                toast.error("Synthesis failed", { description: result.details || result.error || "Unknown error" });
            }
        } catch (error) {
            console.error("Synthesis error:", error);
            toast.error("Failed to synthesize findings.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <CreditTopUpDialog
                open={showTopUp}
                onOpenChange={setShowTopUp}
                onSuccess={() => refetchCredits()}
            />
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Micro-Resistance: Empirical Traces</h2>
                    <p className="text-slate-500">Analyze empirical traces linked to specific policy documents.</p>
                </div>

                {/* Policy Selector Section */}
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Active Policy Document</h3>
                                <p className="text-sm text-slate-500">Select a document to view resistance analysis</p>
                            </div>
                        </div>
                        <div className="w-full md:w-[300px]">
                            <Select
                                value={selectedPolicyId || ""}
                                onValueChange={(val) => setSelectedPolicyId(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a policy document..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {policyDocuments.length === 0 ? (
                                        <div className="p-2 text-sm text-slate-500 text-center">No documents found</div>
                                    ) : (
                                        policyDocuments.map(doc => (
                                            <SelectItem key={doc.id} value={doc.id}>
                                                {doc.title}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {selectedPolicyId ? (
                    <>
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={handleSynthesizeFindings}
                                disabled={isSynthesizing || traces.filter(t => t.resistance_analysis).length < 2 || isReadOnly}
                                className="border-purple-200 hover:bg-purple-50 text-purple-700"
                            >
                                {isSynthesizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                                Synthesize Findings
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleResetTraces}
                                disabled={isReadOnly}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 mr-2"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Reset & Clear
                            </Button>
                            <Button
                                variant={showFrictionLog ? "secondary" : "outline"}
                                onClick={() => setShowFrictionLog(!showFrictionLog)}
                                className={`mr-2 ${showFrictionLog ? "bg-orange-100 text-orange-800 border-orange-200" : "text-slate-600"}`}
                            >
                                <Activity className="mr-2 h-4 w-4" />
                                {showFrictionLog ? "View Cards" : "Friction Log"}
                            </Button>
                            <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                        <Search className="mr-2 h-4 w-4" /> Search for Traces
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle>Search Web for Resistance Traces</DialogTitle>
                                        <DialogDescription>
                                            Find real forum posts, Reddit threads, and discussions about resistance to {sources.find(s => s.id === selectedPolicyId)?.title}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                                Custom Query (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-md text-sm"
                                                placeholder="e.g. 'workarounds'"
                                                value={customQuery}
                                                onChange={(e) => setCustomQuery(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                                Dynamic Lexicon (Slang/Jargon)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-md text-sm"
                                                placeholder="e.g. 'quiet quitting', 'algo-speak'"
                                                value={dynamicLexicon}
                                                onChange={(e) => setDynamicLexicon(e.target.value)}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Inject community-specific terms to aid detection.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {[
                                                { id: 'reddit', label: 'Reddit' },
                                                { id: 'hackernews', label: 'Hacker News' },
                                                { id: 'forums', label: 'Forums' },
                                                { id: 'twitter', label: 'Twitter/X' },
                                                { id: 'technews', label: 'Tech News' },
                                                { id: 'mastodon', label: 'Mastodon' }
                                            ].map(platform => (
                                                <label key={platform.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPlatforms.includes(platform.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedPlatforms([...selectedPlatforms, platform.id]);
                                                            } else {
                                                                setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{platform.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            onClick={handleSearchTraces}
                                            disabled={isSearching || isReadOnly}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isSearching ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Searching Web...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="mr-2 h-4 w-4" />
                                                    Search
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {synthesisResult && (
                            <Card className="bg-purple-50 border-purple-200">
                                <CardHeader>
                                    <CardTitle className="text-purple-900 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Activity className="mr-2 h-5 w-5" /> Assemblage Analysis & Lines of Flight
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Executive Summary */}
                                    <div>
                                        <h4 className="font-semibold text-purple-900 mb-1">Executive Summary</h4>
                                        <p className="text-purple-800 text-sm leading-relaxed">{synthesisResult.executive_summary}</p>
                                    </div>

                                    {/* Lines of Flight Dashboard */}
                                    <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                                            <Zap className="h-4 w-4 mr-2 text-orange-500" /> Lines of Flight Assessment
                                        </h4>

                                        <div className="mb-4">
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <p className="text-slate-700 leading-relaxed italic">
                                                    &quot;{synthesisResult.lines_of_flight?.narrative_aggregate || "No flight analysis available."}&quot;
                                                </p>
                                            </div>

                                            {/* Visualization Component */}
                                            <ResistanceVisualization
                                                result={synthesisResult}
                                                monitoredVectors={monitoredVectors}
                                                onToggleMonitor={handleToggleMonitor}
                                            />                          </div>

                                    </div>

                                    {/* Reflexive Audit */}
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                            <EyeOff className="h-4 w-4 mr-2" /> Reflexive Audit Trail
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="font-medium text-blue-800">Analyst Positionality:</span>
                                                <p className="text-blue-700 mt-1">{synthesisResult.reflexive_audit?.analyst_positionality}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-blue-800">Uncertainty Flags:</span>
                                                <p className="text-blue-700 mt-1">{synthesisResult.reflexive_audit?.uncertainty_flags}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Dominant Strategies Section Removed (Now in Visualization) */}
                                        <div>
                                            <h4 className="font-semibold text-purple-900 mb-2">Implications for Legitimacy</h4>
                                            <p className="p-3 bg-white rounded border border-purple-100 text-sm text-purple-800">
                                                {synthesisResult.implications_for_legitimacy}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Trace Selector or Friction Log */}
                            <div className={showFrictionLog ? "lg:col-span-3" : "space-y-4"}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-900 flex items-center">
                                        <Activity className="mr-2 h-4 w-4" /> {showFrictionLog ? "Friction Log (Raw Signals)" : "Available Traces"}
                                    </h3>
                                    {showFrictionLog && (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            Shadow Resistance Mode
                                        </Badge>
                                    )}
                                </div>

                                <div className={showFrictionLog ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                                    {traces.length === 0 && (
                                        <Card className="bg-slate-50 border-dashed col-span-full">
                                            <CardContent className="p-4 text-center text-sm text-slate-500">
                                                No traces found. Use &quot;Search for Traces&quot; to filter public comments and discussions for this policy.
                                            </CardContent>
                                        </Card>
                                    )}
                                    {traces.map(trace => (
                                        <Card
                                            key={trace.id}
                                            className={`transition-all hover:border-purple-400 ${selectedTraceId === trace.id ? 'border-purple-600 ring-1 ring-purple-600' : ''} ${showFrictionLog ? 'bg-orange-50/30' : ''}`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div
                                                        className="flex-1 min-w-0 pr-2 cursor-pointer"
                                                        onClick={() => setSelectedTraceId(trace.id)}
                                                    >
                                                        <div className="font-medium text-slate-900 break-words">{trace.title}</div>
                                                        <div className={`text-xs text-slate-500 mt-1 break-words ${showFrictionLog ? 'line-clamp-4' : ''}`}>
                                                            {trace.description}
                                                            {trace.sourceUrl && (
                                                                <span className="block mt-1 text-blue-400 truncate hover:underline">
                                                                    {new URL(trace.sourceUrl).hostname.replace('www.', '')}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {showFrictionLog && trace.resistance_analysis?.evidence_quote && (
                                                            <div className="mt-2 text-xs italic text-slate-600 bg-white p-2 rounded border border-slate-100">
                                                                "{trace.resistance_analysis.evidence_quote.substring(0, 100)}..."
                                                            </div>
                                                        )}

                                                        {trace.resistance_analysis?.strategy_detected ? (() => {
                                                            const strategy = STRATEGY_DEFINITIONS.find(s => s.title === trace.resistance_analysis?.strategy_detected);
                                                            const badgeClass = strategy
                                                                ? `mt-2 ${strategy.bg} ${strategy.color} border-${strategy.color.split('-')[1]}-200`
                                                                : "mt-2 bg-purple-100 text-purple-700 border-purple-200";

                                                            return (
                                                                <Badge variant="secondary" className={badgeClass}>
                                                                    {strategy?.icon && <strategy.icon className="w-3 h-3 mr-1 inline" />}
                                                                    {trace.resistance_analysis.strategy_detected}
                                                                </Badge>
                                                            );
                                                        })() : trace.resistance_analysis && (
                                                            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                                                                Analyzed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1 items-center shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                let url = trace.sourceUrl;
                                                                // Fallback: Try to extract from text if missing (legacy fix)
                                                                if (!url && trace.extractedText) {
                                                                    const match = trace.extractedText.match(/Source: (https?:\/\/[^\s]+)/);
                                                                    if (match) url = match[1];
                                                                }

                                                                if (url) {
                                                                    window.open(url, '_blank');
                                                                } else {
                                                                    toast.error("No source URL available", { description: "The URL was not saved with this trace." });
                                                                }
                                                            }}
                                                            title={trace.sourceUrl || "View Source"}
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-slate-400 hover:bg-red-100 hover:text-red-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTrace(trace.id);
                                                            }}
                                                            title="Delete Trace"
                                                            disabled={isReadOnly}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Middle Column: Analysis Area - HIDE if Friction Log is ON */}
                            {!showFrictionLog && (
                                <div className="lg:col-span-2 space-y-6">
                                    {selectedTrace ? (
                                        <div className="space-y-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex justify-between items-center">
                                                        <span>Analysis: {selectedTrace.title}</span>
                                                        {!currentAnalysis && (
                                                            <Button
                                                                onClick={() => handleAnalyzeTrace(selectedTrace)}
                                                                disabled={isAnalyzing || isReadOnly}
                                                                className="bg-purple-600 hover:bg-purple-700"
                                                            >
                                                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                                                Analyze Trace
                                                            </Button>
                                                        )}
                                                        {selectedTrace.sourceUrl && !selectedTrace.description.includes("[Full Text Fetched]") && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleDeepFetch(selectedTrace)}
                                                                disabled={isFetching || isAnalyzing || isReadOnly}
                                                                className="ml-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                            >
                                                                {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                                                Deep Fetch
                                                            </Button>
                                                        )}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {currentAnalysis ? (
                                                        <div className="space-y-6">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="p-3 bg-purple-100 rounded-full">
                                                                    <Zap className="h-6 w-6 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm text-slate-500 uppercase tracking-wider font-bold">Strategy Detected</div>
                                                                    <div className="text-2xl font-bold text-slate-900">{currentAnalysis.strategy_detected}</div>
                                                                </div>
                                                                <Badge className={currentAnalysis.confidence === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                                    {currentAnalysis.confidence} Confidence
                                                                </Badge>
                                                            </div>

                                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                                                                <Quote className="absolute top-2 left-2 h-8 w-8 text-slate-200 -z-0" />
                                                                <p className="text-slate-700 italic relative z-10 pl-6">
                                                                    &quot;{currentAnalysis.evidence_quote}&quot;
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <h4 className="font-semibold text-slate-900 mb-2">Interpretation</h4>
                                                                <p className="text-slate-600 leading-relaxed">
                                                                    {currentAnalysis.interpretation}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 text-slate-500">
                                                            <p>Select &quot;Analyze Trace&quot; to identify resistance strategies using the LLM.</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Reference Definitions */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {STRATEGY_DEFINITIONS.map(def => (
                                                    <div key={def.title} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                        <div className={`p-2 rounded-full ${def.bg}`}>
                                                            <def.icon className={`h-4 w-4 ${def.color}`} />
                                                        </div>
                                                        <span className="font-medium text-slate-700">{def.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                            <Activity className="h-10 w-10 text-slate-300 mb-4" />
                                            <p className="text-slate-500">Select a trace from the left to begin analysis</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Policy Selected</h3>
                        <p className="text-slate-500 mt-2">Please select a policy document above to view and manage its resistance traces.</p>
                    </div>
                )}
            </div>
        </div >
    );
}
