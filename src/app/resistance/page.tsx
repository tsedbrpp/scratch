"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, EyeOff, Activity, Wrench, Users, Play, Loader2, Quote, Search, Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const STRATEGY_DEFINITIONS = [
    { title: "Gambiarra", icon: Wrench, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Obfuscation", icon: EyeOff, color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Solidarity", icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { title: "Refusal", icon: Zap, color: "text-red-600", bg: "bg-red-100" },
];

export default function ResistancePage() {
    const { sources, addSource, updateSource, deleteSource, isLoading } = useSources();
    const [selectedTraceId, setSelectedTraceId] = useServerStorage<string | null>("resistance_selected_trace_id", null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Filter for sources that are explicitly marked as 'Trace' or have text content
    const traces = sources.filter(s => s.type === 'Trace' || (s.type === 'Text' && s.extractedText));

    const handleAnalyzeTrace = async (trace: Source) => {
        if (!trace.extractedText) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: trace.extractedText.substring(0, 3000),
                    sourceType: 'Empirical Trace',
                    analysisMode: 'resistance'
                })
            });

            const result = await response.json();
            if (result.success) {
                await updateSource(trace.id, { resistance_analysis: result.analysis });
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

    const handleSearchTraces = async () => {
        // Need either a policy source or custom query
        if (!searchSource?.extractedText && !customQuery.trim()) {
            alert("Please select a policy or enter a custom search query.");
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch('/api/search-traces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    policyText: searchSource?.extractedText?.substring(0, 3000),
                    customQuery: customQuery.trim() || undefined,
                    platforms: selectedPlatforms
                })
            });

            const result = await response.json();
            if (result.success && Array.isArray(result.traces)) {
                const newTraces = result.traces.map((trace: { title: string; description: string; query: string; content: string; sourceUrl: string }) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    title: `[Web] ${trace.title}`,
                    description: `${trace.description} • Query: "${trace.query}"`,
                    type: "Trace",
                    extractedText: `${trace.content}\n\nSource: ${trace.sourceUrl}`,
                    addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    status: "Active Case",
                    colorClass: "bg-blue-100",
                    iconClass: "text-blue-600"
                }));

                // Add each new trace to the store
                for (const trace of newTraces) {
                    await addSource(trace);
                }

                toast.success(`Found ${newTraces.length} resistance traces from the web!`);
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
        if (confirm(`Are you sure you want to delete this trace?`)) {
            await deleteSource(traceId);
            if (selectedTraceId === traceId) {
                setSelectedTraceId(null);
            }
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Micro-Resistance Grounding</h2>
                    <p className="text-slate-500">Analyze empirical traces (forum posts, comments) to identify real-world resistance strategies.</p>
                </div>
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
                                Find real forum posts, Reddit threads, and discussions about resistance to AI policies.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Auto-extract from Policy (Optional)
                                </label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm"
                                    onChange={(e) => {
                                        const source = sources.find(s => s.id === e.target.value);
                                        setSearchSource(source || null);
                                    }}
                                >
                                    <option value="">Select Policy...</option>
                                    {sources.filter(s => s.type === 'PDF').map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">AI will extract key terms to search for</p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500">Or</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Custom Search Query
                                </label>
                                <Input
                                    placeholder='e.g., "uber drivers algorithm resistance"'
                                    value={customQuery}
                                    onChange={(e) => setCustomQuery(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Search Platforms
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'reddit', label: 'Reddit' },
                                        { id: 'hackernews', label: 'Hacker News' },
                                        { id: 'forums', label: 'Forums' }
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
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleSearchTraces}
                                disabled={(!searchSource && !customQuery.trim()) || isSearching}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Trace Selector */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center">
                        <Activity className="mr-2 h-4 w-4" /> Available Traces
                    </h3>
                    <div className="space-y-2">
                        {traces.length === 0 && (
                            <Card className="bg-slate-50 border-dashed">
                                <CardContent className="p-4 text-center text-sm text-slate-500">
                                    No traces found. Go to Data page to add "Empirical Trace" sources or use "Search for Traces".
                                </CardContent>
                            </Card>
                        )}
                        {traces.map(trace => (
                            <Card
                                key={trace.id}
                                className={`transition-all hover:border-purple-400 ${selectedTraceId === trace.id ? 'border-purple-600 ring-1 ring-purple-600' : ''}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div
                                            className="flex-1 min-w-0 pr-2 cursor-pointer"
                                            onClick={() => setSelectedTraceId(trace.id)}
                                        >
                                            <div className="font-medium text-slate-900 break-words">{trace.title}</div>
                                            <div className="text-xs text-slate-500 mt-1 break-words">{trace.description}</div>
                                            {trace.resistance_analysis && (
                                                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                                                    Analyzed
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTrace(trace.id);
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Middle Column: Analysis Area */}
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
                                                disabled={isAnalyzing}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                                Analyze Trace
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
                                                    "{currentAnalysis.evidence_quote}"
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
                                            <p>Select "Analyze Trace" to identify resistance strategies using the LLM.</p>
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
            </div>
        </div>
    );
}
