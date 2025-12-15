"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Sparkles, Loader2, Trash, Eye } from "lucide-react";
import { AnalysisResults } from "@/components/policy/AnalysisResults";

export default function EmpiricalPage() {
    const { sources, isLoading, addSource, updateSource, deleteSource } = useSources();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [newSource, setNewSource] = useState({
        title: "",
        description: "",
        type: "Trace",
        text: "",
    });

    const [viewingSource, setViewingSource] = useState<Source | null>(null);

    const filteredSources = sources.filter((source) =>
        source.type === "Trace" &&
        (source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
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
        };
        await addSource(source);
        setNewSource({ title: "", description: "", type: "Trace", text: "" });
        setIsAddDialogOpen(false);
    };

    const handleAnalyze = async (sourceId: string) => {
        const source = sources.find(s => s.id === sourceId);
        if (!source || !source.extractedText) {
            alert('No text available to analyze.');
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
                    sourceType: 'Empirical Trace'
                })
            });

            const result = await response.json();

            if (result.success) {
                await updateSource(sourceId, { analysis: result.analysis });
                alert('Analysis complete! Scroll down to see results.');
            } else {
                alert(`Analysis failed: ${result.error || 'Unknown error'} `);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Failed to analyze. Make sure your OpenAI API key is configured in .env.local');
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleDelete = async (sourceId: string) => {
        if (confirm('Are you sure you want to delete this source?')) {
            await deleteSource(sourceId);
        }
    };

    const handleDeleteAll = async () => {
        if (confirm('Are you sure you want to delete ALL empirical traces? This action cannot be undone.')) {
            const traceIds = sources.filter(s => s.type === "Trace").map(s => s.id);
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Empirical Data</h2>
                    <p className="text-slate-500">Manage empirical traces (public comments, forum posts, interviews).</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        onClick={handleDeleteAll}
                        disabled={filteredSources.length === 0}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete All Traces
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                                <Plus className="mr-2 h-4 w-4" /> Add Trace
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Empirical Trace</DialogTitle>
                                <DialogDescription>
                                    Add a forum post, public comment, or interview transcript.
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

            <div className="flex items-center space-x-2">
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSources.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        <p>No empirical traces found.</p>
                        <p className="text-sm mt-2">Add a new trace manually or use &quot;Find Traces&quot; on the Policy Documents page.</p>
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
                                            disabled={analyzingId === source.id}
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
                                    <AnalysisResults analysis={source.analysis} />
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

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
