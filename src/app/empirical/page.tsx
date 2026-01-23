"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSources } from "@/hooks/useSources";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Source } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Filter, Sparkles, Loader2, Trash, Eye, FileText, Maximize } from "lucide-react";
import { AnalysisResults } from "@/components/policy/AnalysisResults";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";

export default function EmpiricalPage() {
    const { sources, isLoading, addSource, updateSource, deleteSource } = useSources();
    const { isReadOnly } = useDemoMode();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [newSource, setNewSource] = useState({
        title: "",
        description: "",
        type: "Trace",
        text: "",
    });

    const [viewingSource, setViewingSource] = useState<Source | null>(null);

    const [fullScreenAnalysisSource, setFullScreenAnalysisSource] = useState<Source | null>(null);

    // Credit System
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [showTopUp, setShowTopUp] = useState(false);

    // ... existing search state ...
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
    const [customQuery, setCustomQuery] = useServerStorage<string>("empirical_custom_query", "");
    const [selectedPlatforms, setSelectedPlatforms] = useServerStorage<string[]>("empirical_selected_platforms", ["reddit", "hackernews", "forums"]);

    // Identify Policy Documents (Not traces)
    const policyDocuments = sources.filter(s => s.type !== "Trace");

    // Filter traces based on selection and search
    const filteredSources = sources.filter((source) =>
        source.type === "Trace" &&
        source.policyId === selectedPolicyId &&
        (source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) {
            toast.error("Adding traces is disabled in Demo Mode.");
            return;
        }
        if (!selectedPolicyId) {
            toast.error("Please select a policy document first.");
            return;
        }

        const source: Source = {
            id: Date.now().toString(),
            title: newSource.title,
            description: newSource.description,
            type: "Trace",
            addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Active Case",
            colorClass: "bg-orange-100",
            iconClass: "text-orange-600",
            extractedText: newSource.text,
            policyId: selectedPolicyId // Link to selected policy
        };
        await addSource(source);
        setNewSource({ title: "", description: "", type: "Trace", text: "" });
        setIsAddDialogOpen(false);
        toast.success("Trace added successfully");
    };

    // ... handleSearchTraces ...

    const handleSearchTraces = async () => {
        if (isReadOnly) {
            toast.error("Searching traces is disabled in Demo Mode.");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }

        // ... existing implementation ...
        if (!selectedPolicyId) {
            toast.error("Please select a policy document first.");
            return;
        }

        // Find the full source object for the selected policy to use as context if needed
        const activePolicy = sources.find(s => s.id === selectedPolicyId);

        if (!activePolicy?.extractedText && !customQuery.trim()) {
            toast.error("No text in selected policy and no custom query provided.");
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

                for (const trace of newTraces) {
                    await addSource(trace);
                }

                toast.success(`Found ${newTraces.length} traces from the web!`);
                setCustomQuery("");
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
            toast.error("Failed to search for traces");
        } finally {
            setIsSearching(false);
            setIsSearchDialogOpen(false);
        }
    };


    const handleAnalyze = async (sourceId: string) => {
        if (isReadOnly) {
            toast.error("Analysis is disabled in Demo Mode.");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }
        const source = sources.find(s => s.id === sourceId);
        if (!source || !source.extractedText) {
            toast.error('No text available to analyze.');
            return;
        }

        setAnalyzingId(sourceId);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: source.extractedText.substring(0, 4000), // Limit to first 4000 chars
                    sourceType: 'Empirical Trace',
                    analysisMode: 'dsf'
                })
            });

            const result = await response.json();

            if (result.success) {
                await updateSource(sourceId, { analysis: result.analysis });
                // Un-minimize if it was legally minimized before re-analysis
                // setMinimizedAnalysisIds(prev => prev.filter(id => id !== sourceId));

                toast.success('Analysis complete!', {
                    action: {
                        label: 'View Results',
                        onClick: () => setFullScreenAnalysisSource(sources.find(s => s.id === sourceId) || null) // Re-fetch to get latest state
                    }
                });
                refetchCredits();
            } else {
                toast.error(`Analysis failed: ${result.error || 'Unknown error'} `);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Failed to analyze. Make sure your OpenAI API key is configured.');
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleDelete = async (sourceId: string) => {
        if (isReadOnly) {
            toast.error("Deleting traces is disabled in Demo Mode.");
            return;
        }
        if (confirm('Are you sure you want to delete this source?')) {
            await deleteSource(sourceId);
        }
    };

    const handleDeleteAll = async () => {
        if (isReadOnly) {
            toast.error("Deleting traces is disabled in Demo Mode.");
            return;
        }
        if (!selectedPolicyId) return;
        if (confirm('Are you sure you want to delete ALL empirical traces for this policy? This action cannot be undone.')) {
            const traceIds = filteredSources.map(s => s.id);
            for (const id of traceIds) {
                try {
                    await deleteSource(id);
                } catch (e) {
                    console.error(`Failed to delete source ${id}:`, e);
                }
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => refetchCredits()} />
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Empirical Data</h2>
                    <p className="text-slate-500">Manage empirical traces linked to specific policy documents.</p>
                </div>

                {/* Policy Selector Section */}
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Active Policy Document</h3>
                                <p className="text-sm text-slate-500">Select a document to view its traces</p>
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
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2 flex-1 max-w-md">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input
                                        type="text"
                                        placeholder="Search traces..."
                                        className="w-full pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" className="border-slate-200">
                                    <Filter className="mr-2 h-4 w-4" /> Filter
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAll}
                                    disabled={filteredSources.length === 0 || isReadOnly}
                                    title={isReadOnly ? "Deletion disabled in Demo Mode" : ""}
                                >
                                    <Trash className="mr-2 h-4 w-4" /> Delete All
                                </Button>

                                <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                            disabled={isReadOnly}
                                            title={isReadOnly ? "Search disabled in Demo Mode" : ""}
                                        >
                                            <Search className="mr-2 h-4 w-4" /> Search Web
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Search Web for Empirical Traces</DialogTitle>
                                            <DialogDescription>
                                                Find real forum posts, Reddit threads, and discussions.
                                                {sources.find(s => s.id === selectedPolicyId) ? ` linked to ${sources.find(s => s.id === selectedPolicyId)?.title}` : ''}.
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

                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-slate-900 text-white hover:bg-slate-800"
                                            disabled={isReadOnly}
                                            title={isReadOnly ? "Adding traces disabled in Demo Mode" : ""}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Manual Trace
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Empirical Trace</DialogTitle>
                                            <DialogDescription>
                                                Add a forum post, public comment, or interview transcript linked to the selected policy.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddSource}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="title" className="text-right">
                                                        Title
                                                    </Label>
                                                    <Input
                                                        id="title"
                                                        value={newSource.title}
                                                        onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                                                        className="col-span-3 text-slate-900"
                                                        required
                                                        placeholder="e.g., Reddit Thread on Uber"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="description" className="text-right">
                                                        Description
                                                    </Label>
                                                    <Input
                                                        id="description"
                                                        value={newSource.description}
                                                        onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                                                        className="col-span-3 text-slate-900"
                                                        required
                                                        placeholder="e.g., Drivers discussing algorithm changes"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-start gap-4">
                                                    <Label htmlFor="text" className="text-right pt-2">
                                                        Content
                                                    </Label>
                                                    <textarea
                                                        id="text"
                                                        value={newSource.text}
                                                        onChange={(e) => setNewSource({ ...newSource, text: e.target.value })}
                                                        className="col-span-3 flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                                                        placeholder="Paste the text content of the trace here..."
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Save Trace</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredSources.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p>No empirical traces found for this policy.</p>
                                    <p className="text-sm mt-2">Add a new trace manually or use &quot;Search Web&quot; to find public discussions.</p>
                                </div>
                            ) : (
                                filteredSources.map((source) => (
                                    <Card key={source.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-col md:flex-row items-start justify-between space-y-4 md:space-y-0 pb-2">
                                            <div className="space-y-1 flex-1 min-w-0 pr-0 md:pr-4 w-full">
                                                <CardTitle className="text-base font-semibold break-words">{source.title}</CardTitle>
                                                <CardDescription className="break-words">{source.description}</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end md:justify-start">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setViewingSource(source)}
                                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                                    title="View trace content"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(source.id)}
                                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                                    disabled={isReadOnly}
                                                    title={isReadOnly ? "Deletion disabled in Demo Mode" : ""}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mt-4 flex items-center space-x-2">
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                    {source.status}
                                                </Badge>
                                                <span className="text-xs text-slate-500">
                                                    {source.type}
                                                </span>
                                            </div>
                                            <div className="mt-4 text-xs text-slate-500">
                                                Added: {source.addedDate}
                                            </div>
                                            {source.extractedText && (
                                                <div className="mt-4">
                                                    <Button
                                                        onClick={() => handleAnalyze(source.id)}
                                                        disabled={analyzingId === source.id || isReadOnly}
                                                        title={isReadOnly ? "Analysis disabled in Demo Mode" : ""}
                                                        className="w-full bg-purple-600 text-white hover:bg-purple-700"
                                                        size="sm"
                                                    >
                                                        {analyzingId === source.id ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Analyzing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles className="mr-2 h-4 w-4" />
                                                                Analyze with AI
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                            {source.analysis && (
                                                <div className="relative mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4 text-purple-500" />
                                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Analysis Ready</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setFullScreenAnalysisSource(source)}
                                                        className="gap-2 text-xs border-slate-200 hover:bg-slate-50 hover:text-purple-700"
                                                    >
                                                        <Maximize className="h-3 w-3" />
                                                        View Full Analysis
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Policy Selected</h3>
                        <p className="text-slate-500 mt-2">Please select a policy document above to view and manage its empirical traces.</p>
                    </div>
                )}

            </div>

            {/* Full Screen Analysis Dialog */}
            <Dialog open={!!fullScreenAnalysisSource} onOpenChange={(open) => !open && setFullScreenAnalysisSource(null)}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-6">
                    <DialogHeader className="shrink-0 mb-4 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">{fullScreenAnalysisSource?.title}</DialogTitle>
                            <DialogDescription>
                                Full Screen Analysis View
                            </DialogDescription>
                        </div>
                        {/* Custom Close Button for nicer placement if standard one conflicts, but standard X is fine usually. */}
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-4 pb-8">
                        {fullScreenAnalysisSource?.analysis ? (
                            <div className="max-w-7xl mx-auto">
                                <AnalysisResults analysis={fullScreenAnalysisSource.analysis} sourceTitle={fullScreenAnalysisSource.title} sourceId={fullScreenAnalysisSource.id} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Analysis data not available.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingSource} onOpenChange={(open) => !open && setViewingSource(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{viewingSource?.title}</DialogTitle>
                        <DialogDescription>
                            Extracted text content from {viewingSource?.type}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-md border border-slate-200 text-sm font-mono whitespace-pre-wrap">
                        {viewingSource?.extractedText ? (
                            viewingSource.extractedText.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
                                part.match(/https?:\/\/[^\s]+/) ? (
                                    <a
                                        key={index}
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        {part}
                                    </a>
                                ) : (
                                    <span key={index}>{part}</span>
                                )
                            )
                        ) : (
                            "No text content available."
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
