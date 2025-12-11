"use client";

import { useState, useRef } from "react";
import { useSources } from "@/hooks/useSources";
import { Source, LegitimacyAnalysis, PositionalityData, AnalysisResult } from "@/types";
import { analyzeDocument, AnalysisMode } from "@/services/analysis";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { DocumentCard } from "@/components/policy/DocumentCard";
import { AddDocumentDialog } from "@/components/policy/AddDocumentDialog";
import { ViewSourceDialog } from "@/components/policy/ViewSourceDialog";
import { EditSourceDialog } from "@/components/policy/EditSourceDialog";
import { DocumentToolbar } from "@/components/policy/DocumentToolbar";
import { AddUrlDialog } from "@/components/policy/AddUrlDialog";
import { PositionalityDialog } from "@/components/reflexivity/PositionalityDialog";
import { Loader2 } from "lucide-react";

export default function PolicyDocumentsPage() {
    const { sources, isLoading: isSourcesLoading, addSource, updateSource, deleteSource } = useSources();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [searchingId, setSearchingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewingSource, setViewingSource] = useState<Source | null>(null);
    const [editingSource, setEditingSource] = useState<Source | null>(null);
    const [isPositionalityDialogOpen, setIsPositionalityDialogOpen] = useState(false);
    const [pendingAnalysis, setPendingAnalysis] = useState<{ sourceId: string, mode: AnalysisMode, force: boolean } | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const filteredSources = sources.filter(source =>
        source.type !== 'Trace' &&
        (source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const extractionResult = await extractTextFromPDF(file);
            const text = typeof extractionResult === 'string' ? extractionResult : extractionResult.text;
            const newDoc: Source = {
                id: Date.now().toString(),
                title: file.name.replace('.pdf', ''),
                description: `Uploaded ${new Date().toLocaleDateString()}`,
                type: "PDF",
                addedDate: new Date().toLocaleDateString(),
                status: "Active Case",
                colorClass: "bg-purple-100",
                iconClass: "text-purple-600",
                extractedText: text
            };
            await addSource(newDoc);
            alert('PDF uploaded successfully!');
        } catch (error) {
            console.error('PDF upload error:', error);
            alert('Failed to upload PDF. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUrlAdd = async (url: string) => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
        }

        const response = await fetch('/api/fetch-url', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch URL');
        }

        const newDoc: Source = {
            id: Date.now().toString(),
            title: data.title || url,
            description: `Fetched from ${new URL(url).hostname}`,
            type: "Web",
            addedDate: new Date().toLocaleDateString(),
            status: "Active Case",
            colorClass: "bg-emerald-100",
            iconClass: "text-emerald-600",
            extractedText: data.content,
            url: data.url
        };

        await addSource(newDoc);
        alert('Website content added successfully!');
    };

    const handleAddSource = async (title: string, description: string, pageCount: string, publicationDate: string, version: string) => {
        const source: Source = {
            id: Date.now().toString(),
            title,
            description,
            type: "Text",
            pageCount: pageCount ? parseInt(pageCount) : undefined,
            publicationDate: publicationDate || undefined,
            version: version || undefined,
            addedDate: new Date().toLocaleDateString(),
            status: "Active Case",
            colorClass: "bg-blue-100",
            iconClass: "text-blue-600"
        };
        await addSource(source);
    };

    const handleEditSource = async (sourceId: string, updates: Partial<Source>) => {
        await updateSource(sourceId, updates);
    };

    const handleAnalyze = async (sourceId: string, mode: AnalysisMode) => {
        const source = sources.find(s => s.id === sourceId);
        if (!source || !source.extractedText) {
            alert('No text available to analyze. Please upload a PDF or add text first.');
            return;
        }

        // Check if analysis already exists
        let force = false;
        const hasAnalysis =
            (mode === 'dsf' && source.analysis) ||
            (mode === 'cultural_framing' && source.cultural_framing) ||
            (mode === 'institutional_logics' && source.institutional_logics) ||
            (mode === 'legitimacy' && source.legitimacy_analysis) ||
            (mode === 'stress_test' && source.analysis?.stress_test_report);

        if (hasAnalysis) {
            if (!confirm('Analysis already exists for this document. Click OK to FORCE a re-run (bypassing cache), or Cancel to abort.')) {
                return;
            }
            force = true;
        }

        setPendingAnalysis({ sourceId, mode, force });
        setIsPositionalityDialogOpen(true);
    };

    const proceedWithAnalysis = async (positionalityData: PositionalityData) => {
        if (!pendingAnalysis) return;
        const { sourceId, mode, force } = pendingAnalysis;
        const source = sources.find(s => s.id === sourceId);

        setIsPositionalityDialogOpen(false);

        if (!source || !source.extractedText) return;

        setAnalyzingId(sourceId);
        try {
            const result = await analyzeDocument(
                source.extractedText.substring(0, 150000),
                mode,
                'Policy Document',
                force,
                sourceId,
                source.title,
                positionalityData,
                source.analysis // Pass existing analysis to avoid re-running it during stress test
            );

            const updates: Partial<Source> = {};
            if (mode === 'dsf') updates.analysis = result;
            if (mode === 'cultural_framing') updates.cultural_framing = result;
            if (mode === 'institutional_logics') updates.institutional_logics = result;
            if (mode === 'legitimacy') updates.legitimacy_analysis = result as unknown as LegitimacyAnalysis;
            if (mode === 'stress_test') {
                // The API returns a full analysis object including standard DSF fields AND stress_test_report
                updates.analysis = result;
            }

            await updateSource(sourceId, updates);

            if (mode === 'dsf' || mode === 'stress_test') {
                alert('Analysis complete! Scroll down to see results inside the document card.');
            } else {
                alert(`✅ ${mode === 'cultural_framing' ? 'Cultural framing' : mode === 'institutional_logics' ? 'Institutional logics' : 'Legitimacy'} analysis complete! Go to Comparison page to view results.`);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Analysis failed: ${errorMessage}`);
        } finally {
            setAnalyzingId(null);
            setPendingAnalysis(null);
        }
    };

    const handleFindTraces = async (source: Source) => {
        if (!source.extractedText) {
            alert('Please upload a PDF or add text first before finding traces.');
            return;
        }

        setSearchingId(source.id);
        try {
            // Generate search terms from the document text
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/search', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    policyText: source.extractedText.substring(0, 3000),
                    maxResults: 5
                })
            });

            const result = await response.json();

            if (result.success && Array.isArray(result.results) && result.results.length > 0) {
                // Create trace sources from search results
                const newTraces: Source[] = result.results.map((item: { title: string; snippet: string; link: string }) => ({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    title: `[Trace] ${item.title}`,
                    description: item.snippet || 'No description available',
                    type: "Trace" as const,
                    extractedText: `${item.snippet}\n\nSource: ${item.link}\n\nFound via search for: "${result.searchQuery || 'policy analysis'}"`,
                    addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    status: "Active Case" as const,
                    colorClass: "bg-blue-100",
                    iconClass: "text-blue-600"
                }));

                // Add all traces to the store
                for (const trace of newTraces) {
                    await addSource(trace);
                }

                alert(`✅ Found ${newTraces.length} empirical traces!\n\nSearch query: "${result.searchQuery}"\n\nTraces have been added to your sources. Go to the Resistance page to analyze them.`);
            } else {
                alert(`No traces found. ${result.error || 'Try analyzing the document first or check your Google Search API configuration.'}`);
            }
        } catch (error: unknown) {
            console.error('Search error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to search for traces: ${errorMessage}\n\nMake sure your Google Search API credentials are configured in .env.local`);
        } finally {
            setSearchingId(null);
        }
    };

    const handleDelete = async (sourceId: string) => {
        if (confirm('Are you sure you want to delete this source?')) {
            await deleteSource(sourceId);
        }
    };

    if (isSourcesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <DocumentToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onUpload={handlePDFUpload}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                onAddClick={() => setIsAddDialogOpen(true)}
                onAddUrlClick={() => setIsUrlDialogOpen(true)}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSources.map((source) => (
                    <DocumentCard
                        key={source.id}
                        source={source}
                        isAnalyzing={analyzingId === source.id}
                        isSearching={searchingId === source.id}
                        onAnalyze={handleAnalyze}
                        onDelete={handleDelete}
                        onEdit={(source) => setEditingSource(source)}
                        onFindTraces={handleFindTraces}
                        onView={(source) => setViewingSource(source)}
                        onUpdateSource={updateSource}
                    />
                ))}
            </div>

            <AddDocumentDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onAdd={handleAddSource}
            />

            <AddUrlDialog
                open={isUrlDialogOpen}
                onOpenChange={setIsUrlDialogOpen}
                onAdd={handleUrlAdd}
            />

            <ViewSourceDialog
                source={viewingSource}
                onOpenChange={(open) => !open && setViewingSource(null)}
            />

            <EditSourceDialog
                source={editingSource}
                open={!!editingSource}
                onOpenChange={(open) => !open && setEditingSource(null)}
                onSave={handleEditSource}
            />

            <PositionalityDialog
                isOpen={isPositionalityDialogOpen}
                onClose={() => setIsPositionalityDialogOpen(false)}
                onConfirm={proceedWithAnalysis}
            />
        </div>
    );
}
