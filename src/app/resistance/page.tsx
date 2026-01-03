"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Zap, EyeOff, Activity, Wrench, Users, Play, Loader2, Quote, Search, Trash, FileText } from "lucide-react";
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

const STRATEGY_DEFINITIONS = [
    { title: "Gambiarra", icon: Wrench, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Obfuscation", icon: EyeOff, color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Solidarity", icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { title: "Refusal", icon: Zap, color: "text-red-600", bg: "bg-red-100" },
];

interface ResistanceSynthesisResult {
    executive_summary: string;
    dominant_strategies: { strategy: string; frequency: string; description: string }[];
    emerging_themes: string[];
    implications_for_policy: string;
}

export default function ResistancePage() {
    const { sources, addSource, updateSource, deleteSource, isLoading } = useSources();
    const [selectedTraceId, setSelectedTraceId] = useServerStorage<string | null>("resistance_selected_trace_id", null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

    // Identify Policy Documents (Not traces)
    const policyDocuments = sources.filter(s => s.type !== "Trace");

    // Filter traces based on selection
    const traces = sources.filter(s =>
        (s.type === 'Trace' || (s.type === 'Text' && s.extractedText)) &&
        s.policyId === selectedPolicyId
    );

    const handleAnalyzeTrace = async (trace: Source) => {
        if (!trace.extractedText) return;

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
                    customQuery: customQuery.trim() || undefined,
                    platforms: selectedPlatforms
                })
            });

            const result = await response.json();
            console.log("DEBUG: Search Result Traces:", result.traces); // Check raw response in browser console

            if (result.success && Array.isArray(result.traces)) {
                const newTraces = result.traces.map((trace: { title: string; description: string; query: string; content: string; sourceUrl: string; strategy?: string; explanation?: string }) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    title: `[Web] ${trace.title}`,
                    description: `${trace.description} • Query: "${trace.query}"`,
                    type: "Trace",
                    extractedText: `${trace.content}\n\nSource: ${trace.sourceUrl}`,
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
                    await addSource(trace);
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
        if (confirm(`Are you sure you want to delete this trace?`)) {
            await deleteSource(traceId);
            if (selectedTraceId === traceId) {
                setSelectedTraceId(null);
            }
        }
    };

    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [synthesisResult, setSynthesisResult] = useServerStorage<ResistanceSynthesisResult | null>("resistance_synthesis_result", null);

    const handleSynthesizeFindings = async () => {
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
                    }))
                })
            });

            const result = await response.json();
            if (result.success) {
                setSynthesisResult(result.analysis);
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
                                disabled={isSynthesizing || traces.filter(t => t.resistance_analysis).length < 2}
                                className="border-purple-200 hover:bg-purple-50 text-purple-700"
                            >
                                {isSynthesizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                                Synthesize Findings
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
                                            disabled={isSearching}
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
                                    <CardTitle className="text-purple-900 flex items-center">
                                        <Activity className="mr-2 h-5 w-5" /> Synthesis of Findings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-purple-900 mb-1">Executive Summary</h4>
                                        <p className="text-purple-800 text-sm leading-relaxed">{synthesisResult.executive_summary}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-purple-900 mb-2">Dominant Strategies</h4>
                                            <ul className="space-y-2">
                                                {synthesisResult.dominant_strategies?.map((s: { strategy: string; frequency: string; description: string }, i: number) => (
                                                    <li key={i} className="text-sm bg-white p-2 rounded border border-purple-100">
                                                        <span className="font-bold text-purple-700">{s.strategy}</span> ({s.frequency}): {s.description}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-purple-900 mb-2">Emerging Themes</h4>
                                            <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                                                {synthesisResult.emerging_themes?.map((t: string, i: number) => (
                                                    <li key={i}>{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-purple-900 mb-1">Policy Implications</h4>
                                        <p className="text-purple-800 text-sm">{synthesisResult.implications_for_policy}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                                No traces found. Use &quot;Search for Traces&quot; to filter public comments and discussions for this policy.
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
                                                        {trace.resistance_analysis?.strategy_detected ? (
                                                            <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 border-purple-200">
                                                                {trace.resistance_analysis.strategy_detected}
                                                            </Badge>
                                                        ) : trace.resistance_analysis && (
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
