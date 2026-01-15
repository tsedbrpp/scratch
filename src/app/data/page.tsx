"use client";
// Force cache refresh


import { useState, useRef } from "react";
import { AiAbsenceAnalysis } from "@/types/ecosystem";
import { useSources } from "@/hooks/useSources";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useDemoMode } from "@/hooks/useDemoMode";
import { ReportData, LensType } from "@/types/report";
import {
    ResistanceSynthesisResult,
    EcosystemImpact,
    AnalysisResult,
    Source,
    LegitimacyAnalysis,
    ComparativeSynthesis,
    PositionalityData
} from "@/types";
import { EcosystemActor, EcosystemConfiguration } from "@/types/ecosystem";
import { CulturalAnalysisResult } from "@/types/cultural";
import { ComparisonResult as OntologyComparisonResult, OntologyData } from "@/types/ontology";
import { SynthesisComparisonResult } from "@/types/synthesis";
import { analyzeDocument, AnalysisMode } from "@/services/analysis";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { DocumentCard } from "@/components/policy/DocumentCard";
import { AddDocumentDialog } from "@/components/policy/AddDocumentDialog";
import { ViewSourceDialog } from "@/components/policy/ViewSourceDialog";
import { EditSourceDialog } from "@/components/policy/EditSourceDialog";
import { DocumentToolbar } from "@/components/policy/DocumentToolbar";
import { PolicyComparisonView } from "@/components/policy/PolicyComparisonView";
import { AnalysisResults } from "@/components/policy/AnalysisResults";
import { PolicyFocusView } from "@/components/policy/PolicyFocusView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AddUrlDialog } from "@/components/policy/AddUrlDialog";
import { PositionalityDialog } from "@/components/reflexivity/PositionalityDialog";
import { generateFullReportDOCX } from "@/utils/generateFullReportDOCX";
import { Loader2 } from "lucide-react";
import { ExportReportDialog } from "@/components/policy/ExportReportDialog";
import { ReportSectionSelection } from "@/types/report";
import { ArtifactRepository } from "@/components/resistance/ArtifactRepository";
import { ResistanceArtifactView } from "@/components/resistance/ResistanceArtifactView";
import { ResistanceArtifact } from "@/types/resistance";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";

export default function PolicyDocumentsPage() {
    // ----------------------------------------------------------------------
    // 1. Hooks & State
    // ----------------------------------------------------------------------
    const { sources, isLoading: isSourcesLoading, addSource, updateSource, deleteSource } = useSources();
    const { isReadOnly } = useDemoMode();
    const { hasCredits } = useCredits();

    // Data for Full Report Aggregation
    const [resistanceSynthesis] = useServerStorage<ResistanceSynthesisResult | null>("resistance_synthesis_result", null);
    const [ecosystemActors, setEcosystemActors] = useServerStorage<EcosystemActor[]>("ecosystem_actors", []);
    const [ecosystemConfigs] = useServerStorage<EcosystemConfiguration[]>("ecosystem_configurations", []);

    const [absenceAnalysis] = useServerStorage<AiAbsenceAnalysis | null>("ecosystem_absence_analysis", null);
    const [synthesisComparison] = useServerStorage<SynthesisComparisonResult | null>("synthesis_comparison_result", null);
    const [comparativeSynthesisResults] = useServerStorage<Record<string, ComparativeSynthesis>>("comparison_synthesis_results_v2", {});
    const [culturalAnalysis] = useServerStorage<CulturalAnalysisResult | null>("cultural_analysis_result_v5", null);
    const [synthesisImpacts] = useServerStorage<EcosystemImpact[]>("synthesis_ecosystem_impacts", []);
    const [ontologyMaps] = useServerStorage<Record<string, OntologyData>>("ontology_maps", {});
    const [ontologyComparison] = useServerStorage<OntologyComparisonResult | null>("ontology_comparison_result", null);
    const [multiLensResults] = useServerStorage<Record<string, AnalysisResult | null>>("multi_lens_results", {
        dsf: null, cultural_framing: null, institutional_logics: null, legitimacy: null
    });
    const [multiLensText] = useServerStorage<string>("multi_lens_text", "");

    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
    const [isExportReportDialogOpen, setIsExportReportDialogOpen] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [searchingId, setSearchingId] = useState<string | null>(null);
    const [focusedSourceId, setFocusedSourceId] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [viewingSource, setViewingSource] = useState<Source | null>(null);
    const [editingSource, setEditingSource] = useState<Source | null>(null);
    const [isPositionalityDialogOpen, setIsPositionalityDialogOpen] = useState(false);
    const [pendingAnalysis, setPendingAnalysis] = useState<{ sourceId: string, mode: AnalysisMode, force: boolean } | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedArtifact, setSelectedArtifact] = useState<ResistanceArtifact | null>(null);
    const [showTopUp, setShowTopUp] = useState(false);

    // ----------------------------------------------------------------------
    // 2. Computed Values
    // ----------------------------------------------------------------------
    const filteredSources = sources.filter(source =>
        source.type !== 'Trace' &&
        (source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectedSources = sources.filter(s => selectedIds.includes(s.id));

    // ----------------------------------------------------------------------
    // 3. Handlers
    // ----------------------------------------------------------------------
    const toggleSelection = (id: string, selected: boolean) => {
        if (selected) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(sid => sid !== id));
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredSources.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSources.map(s => s.id));
        }
    };

    const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isReadOnly) {
            alert('Document uploads are disabled in Demo Mode.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        const file = e.target.files?.[0];
        if (!file) return;

        // Enforce 10MB Limit
        const MAX_SIZE_MB = 10;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploading(true);
        try {
            const extractionResult = await extractTextFromPDF(file);
            const text = typeof extractionResult === 'string' ? extractionResult : extractionResult.text;
            const newDoc: Source = {
                id: Date.now().toString(),
                title: file.name.replace('.pdf', ''),
                description: `Uploaded ${new Date().toLocaleDateString()} `,
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
        if (isReadOnly) {
            alert('Adding content from URL is disabled in Demo Mode.');
            return;
        }

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
            description: `Fetched from ${new URL(url).hostname} `,
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
        if (isReadOnly) {
            alert('Adding documents is disabled in Demo Mode.');
            return;
        }
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
        if (isReadOnly) {
            alert('Analysis is disabled in Demo Mode.');
            return;
        }

        const source = sources.find(s => s.id === sourceId);
        if (!source || !source.extractedText) {
            alert('No text available to analyze. Please upload a PDF or add text first.');
            return;
        }

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
        if (isReadOnly) {
            alert('Analysis is disabled in Demo Mode.');
            setIsPositionalityDialogOpen(false);
            setPendingAnalysis(null);
            return;
        }
        const { sourceId, mode, force } = pendingAnalysis;
        const source = sources.find(s => s.id === sourceId);

        setIsPositionalityDialogOpen(false); // Close dialog immediately

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

            // Check for Insufficient Credits (402)
            // Error usually comes as "Error: Insufficient Credits..."
            if (errorMessage.includes("Insufficient Credits") || errorMessage.includes("Payment Required") || errorMessage.includes("402")) {
                console.log("Triggering Top Up Dialog due to error:", errorMessage);
                setShowTopUp(true);
            } else {
                alert(`Analysis failed: ${errorMessage} `);
            }
        } finally {
            setAnalyzingId(null);
            setPendingAnalysis(null);
        }
    };

    const handleFindTraces = async (source: Source) => {
        if (isReadOnly) {
            alert('Trace search is disabled in Demo Mode.');
            return;
        }

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
                    maxResults: 10
                })
            });

            const result = await response.json();

            if (result.success && Array.isArray(result.results) && result.results.length > 0) {
                console.log("DEBUG: Data Page Search Results:", result.results);
                // Create trace sources from search results
                const newTraces: Source[] = result.results.map((item: { title: string; snippet: string; link: string; strategy?: string; explanation?: string }) => ({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    title: `[Trace] ${item.title} `,
                    description: item.snippet || 'No description available',
                    type: "Trace" as const,
                    traceType: "provenance" as const, // Explicitly mark as provenance
                    extractedText: `${item.snippet} \n\nSource: ${item.link} \n\nFound via search for: "${result.searchQuery || 'policy analysis'}"\n\nInitial Classification: ${item.strategy || 'None'} `,
                    addedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    status: "Active Case" as const,
                    colorClass: "bg-blue-100",
                    iconClass: "text-blue-600",
                    policyId: source.id, // Linked to the policy document
                    resistance_analysis: item.strategy ? {
                        strategy_detected: item.strategy,
                        evidence_quote: item.snippet,
                        interpretation: item.explanation || "⚠️ NO INTERPRETATION RECEIVED",
                        confidence: "Medium" // Start with medium confidence until verified
                    } : undefined
                }));

                // Add all traces to the store
                for (const trace of newTraces) {
                    await addSource(trace);
                }

                alert(`✅ Found ${newTraces.length} empirical traces! Added to sources.`);
            } else {
                alert(`No traces found.${result.error || 'Try analyzing the document first or check your Google Search API configuration.'} `);
            }
        } catch (error: unknown) {
            console.error('Search error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to search for traces: ${errorMessage} \n\nMake sure your Google Search API credentials are configured in .env.local`);
        } finally {
            setSearchingId(null);
        }
    };

    const handleDelete = async (sourceId: string) => {
        if (isReadOnly) {
            alert('Deleting documents is disabled in Demo Mode.');
            return;
        }
        if (confirm('Are you sure you want to delete this source?')) {
            await deleteSource(sourceId);
        }
    };

    // Helper to manually fetch storage data (since hooks can't be used inside the handler)
    const fetchServerStorage = async <T,>(key: string): Promise<T | null> => {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }
            const response = await fetch(`/api/storage?key=${encodeURIComponent(key)}`, { headers });
            if (response.ok) {
                const data = await response.json();
                return data.value as T;
            }
        } catch (error) {
            console.error(`Failed to fetch storage key "${key}":`, error);
        }
        return null;
    };

    const handleGenerateReport = async (selection: ReportSectionSelection) => {
        if (isReadOnly) {
            alert("Report generation is disabled in Demo Mode.");
            return;
        }
        setIsExporting(true);
        try {
            // Determine Context for Ecosystem Data
            // Priority:
            // 1. First selected document (if comparing or selecting)
            // 2. Focused document
            // 3. Fallback to global/temp keys (current behavior)

            const contextId = selectedIds.length > 0 ? selectedIds[0] : (focusedSourceId || null);

            let finalActors = ecosystemActors;
            let finalConfigs = ecosystemConfigs;

            let finalAbsence = absenceAnalysis;

            if (contextId) {
                console.log(`Fetching Ecosystem Context for Policy ID: ${contextId}`);
                const [actorsData, configsData, absenceData] = await Promise.all([
                    fetchServerStorage<EcosystemActor[]>(`ecosystem_actors_${contextId}`),
                    fetchServerStorage<EcosystemConfiguration[]>(`ecosystem_configurations_${contextId}`),
                    fetchServerStorage<AiAbsenceAnalysis>(`ecosystem_absence_analysis_${contextId}`)
                ]);

                if (actorsData) finalActors = actorsData;
                if (configsData) finalConfigs = configsData;
                if (absenceData) finalAbsence = absenceData;

                console.log(`Ecosystem Data Fetched - Actors: ${finalActors?.length || 0}, Configs: ${finalConfigs?.length || 0}`);
            } else {
                console.warn('No contextId found for ecosystem data - using global state (likely empty)');
            }

            // Fetch methodological logs
            const methodLogs = await fetchServerStorage<any[]>('methodological_logs') || [];

            // Fetch resistance artifacts
            const resistanceArtifacts = await fetchServerStorage<ResistanceArtifact[]>('resistance_artifacts') || [];

            const reportData: ReportData = {
                sources: sources, // Or just selectedSources? The generator filters internally based on 'analyzedSources' logic anyway.
                resistance: resistanceSynthesis,
                ecosystem: {
                    actors: finalActors,
                    configurations: finalConfigs,

                    absenceAnalysis: finalAbsence,
                    assemblage: finalAbsence as any
                },
                synthesis: {
                    comparison: (comparativeSynthesisResults['assemblage'] as any) || synthesisComparison,
                    ecosystemImpacts: synthesisImpacts
                },
                ontology: {
                    maps: ontologyMaps,
                    comparison: ontologyComparison
                },
                multiLens: {
                    results: multiLensResults as Record<LensType, AnalysisResult | null>,
                    text: multiLensText
                },
                cultural: culturalAnalysis,
                logs: methodLogs,
                resistanceArtifacts: resistanceArtifacts
            };

            await generateFullReportDOCX(reportData, selection);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to generate report.");
        } finally {
            setIsExporting(false);
        }
    };

    // ----------------------------------------------------------------------
    // 4. Render
    // ----------------------------------------------------------------------
    if (isSourcesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data & Policy Analysis</h1>
                    <p className="text-slate-500 mt-1">Manage documents, run diagnostics, and compare frameworks.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <DocumentToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onUpload={handlePDFUpload}
                        isUploading={isUploading}
                        fileInputRef={fileInputRef}
                        onAddClick={() => setIsAddDialogOpen(true)}
                        onAddUrlClick={() => setIsUrlDialogOpen(true)}
                        onExportReport={() => setIsExportReportDialogOpen(true)}
                        isExporting={isExporting}
                        isReadOnly={isReadOnly}
                    />
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="documents" className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="documents" className="uppercase text-xs font-bold px-4">My Documents</TabsTrigger>
                        <TabsTrigger value="resistance" className="uppercase text-xs font-bold px-4">Resistance</TabsTrigger>
                        <TabsTrigger value="compare" className="uppercase text-xs font-bold px-4">
                            Compare <span className="ml-2 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[10px]">{selectedIds.length}</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="documents" className="space-y-4">
                    {filteredSources.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">No documents found</h3>
                            <p className="text-slate-500 text-sm mt-1">Upload a PDF or add a URL to get started.</p>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${focusedSourceId ? 'hidden' : ''}`}>
                            {filteredSources.map((source) => (
                                <DocumentCard
                                    key={source.id}
                                    source={source}
                                    isAnalyzing={analyzingId === source.id}
                                    isSearching={searchingId === source.id}
                                    isSelected={selectedIds.includes(source.id)}
                                    onSelect={(selected) => toggleSelection(source.id, selected)}
                                    onAnalyze={handleAnalyze}
                                    onDelete={handleDelete}
                                    onEdit={(s) => { setEditingSource(s); }}
                                    onFindTraces={handleFindTraces}
                                    onView={(s) => setViewingSource(s)}
                                    onUpdateSource={handleEditSource}
                                    isFocused={focusedSourceId === source.id}
                                    onToggleFocus={() => setFocusedSourceId(focusedSourceId === source.id ? null : source.id)}
                                    isReadOnly={isReadOnly}
                                />
                            ))}
                        </div>
                    )}

                    {/* Focus Mode View */}
                    {focusedSourceId && (() => {
                        const focusedSource = sources.find(s => s.id === focusedSourceId);
                        if (!focusedSource) return null;

                        return (
                            <PolicyFocusView
                                source={focusedSource}
                                onUpdateSource={async (updates) => {
                                    await updateSource(focusedSource.id, updates);
                                }}
                                onClose={() => setFocusedSourceId(null)}
                            />
                        );
                    })()}
                </TabsContent>

                <TabsContent value="resistance" className="mt-0">
                    {selectedArtifact ? (
                        <ResistanceArtifactView
                            artifact={selectedArtifact}
                            onBack={() => setSelectedArtifact(null)}
                            onUpdate={setSelectedArtifact}
                        />
                    ) : (
                        <ArtifactRepository
                            onSelectArtifact={setSelectedArtifact}
                        />
                    )}
                </TabsContent>

                <TabsContent value="compare">
                    <PolicyComparisonView sources={selectedSources} />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
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

            {/* Edit Source Dialog (if you have one, or remove if unused) */}
            <EditSourceDialog
                source={editingSource}
                open={!!editingSource}
                onOpenChange={(open: boolean) => !open && setEditingSource(null)}
                onSave={handleEditSource}
            />

            <PositionalityDialog
                isOpen={isPositionalityDialogOpen}
                onClose={() => setIsPositionalityDialogOpen(false)}
                onConfirm={proceedWithAnalysis}
            />

            <ExportReportDialog
                open={isExportReportDialogOpen}
                onOpenChange={setIsExportReportDialogOpen}
                onGenerate={handleGenerateReport}
                isGenerating={isExporting}
            />

            <CreditTopUpDialog
                open={showTopUp}
                onOpenChange={setShowTopUp}
                onSuccess={() => {
                    // Refresh is handled by Dashboard component or page reload if needed
                    // But let's alert user success
                    alert("Credits added! Please try running the analysis again.");
                }}
            />
        </div>
    );
}
