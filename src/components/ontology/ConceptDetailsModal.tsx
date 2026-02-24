"use client";

import React, { useState, useEffect } from 'react';
import { OntologyNode } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ClipboardList, Info, ChevronLeft, ChevronRight, Clock, ArrowRight, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GhostNodeSurvey } from './research/GhostNodeSurvey';
import { Card, CardContent } from '@/components/ui/card';
import { StudyCase, GhostNodeSurveyResponse, StudyState, SurveyResponseData, EvidenceQuote } from '@/lib/study-config';
import { GhostNode } from '@/types';
import { QuoteHighlighter } from './QuoteHighlighter';
import { useRouter } from 'next/navigation';

// V2 Components
import { CaseSummaryBar } from './research/v2/CaseSummaryBar';
import { QuoteCardList } from './research/v2/QuoteCardList';
import { MissingSignalsPanel } from './research/v2/MissingSignalsPanel';
import { ClaimCard } from './research/v2/ClaimCard';
import { SearchDrawer } from './research/v2/SearchDrawer';
import { GhostNodeEvaluationForm } from './research/v2/GhostNodeEvaluationForm';
import { EvidenceLineageModal } from '../reflexivity/EvidenceLineageModal';
import { StructuralAnalysisCard } from './research/v2/StructuralAnalysisCard';
import type { StructuralConcernResult } from '@/lib/structural-concern-service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ABSENCE_DESCRIPTIONS: Record<string, string> = {
    'textual-absence': "Simply not mentioned in the text.",
    'structural-exclusion': "Lack of formal roles or institutions for the actor in this context.",
    'discursive-marginalization': "The document's logic or framing excludes the actor's primary concerns.",
    'constitutive-silence': "An absence that is fundamental to the document's logic or world-view.",
    'Textual': "Simply not mentioned in the text.",
    'Structural': "Lack of formal roles or institutions for the actor.",
    'Discursive': "The document's framing excludes the actor's concerns.",
    'Constitutive': "An absence fundamental to the document's logic."
};

const EXCLUSION_DESCRIPTIONS: Record<string, string> = {
    'silenced': "Active omission or censorship of the actor's perspective.",
    'marginalized': "Actor is mentioned but their influence or agency is minimized.",
    'structurally-excluded': "The framework inherently prevents the actor's participation.",
    'displaced': "Actor's roles have been reassigned to other entities."
};

interface ConceptDetailsModalProps {
    selectedNode: OntologyNode | null;
    isActive: boolean;
    onClose: () => void;
    isStatic?: boolean;
    sourceId?: string; // [NEW] Link back to policy
    researchCurrentCase?: StudyCase;
    researchResponse?: GhostNodeSurveyResponse;
    onResearchSubmit?: (data: SurveyResponseData) => void;
    onNextCase?: () => void;
    onPrevCase?: () => void;
    onReset?: () => void;
    onSave?: () => void;
    onSuspend?: () => void;
    onDebug?: () => void;
    studyState?: StudyState;
    currentCaseIndex?: number;
    totalCases?: number;
    isLastCase?: boolean;
}

export function EvaluationInterface({
    selectedNode,
    isActive,
    onClose,
    isStatic = false,
    researchCurrentCase,
    researchResponse,
    onResearchSubmit,
    onNextCase,
    onPrevCase,
    onReset,
    onSuspend,
    onDebug, // [NEW]
    studyState,
    currentCaseIndex,
    totalCases,
    isLastCase,
    sourceId
}: ConceptDetailsModalProps) {
    const isDev = process.env.NODE_ENV === 'development';
    const [activeTab, setActiveTab] = useState<'explore' | 'evaluate'>('explore');
    const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuoteContext, setActiveQuoteContext] = useState<EvidenceQuote | null>(null);
    const router = useRouter(); // [NEW] Use Next.js router for Deep Linking

    // [New] Highlighted excerpts state for hover
    const [highlightedExcerptIds, setHighlightedExcerptIds] = useState<string[]>([]);
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
    const [generatedStructuralAnalysis, setGeneratedStructuralAnalysis] = useState<StructuralConcernResult | null>(null);

    const handleSearchRequest = (query: string) => {
        setSearchQuery(query);
        setIsSearchDrawerOpen(true);
    };

    const handleContextRequest = (quote: EvidenceQuote) => {
        setActiveQuoteContext(quote);
    };

    const handleFullDocRequest = () => {
        if (sourceId) {
            setSearchQuery('');
            setIsSearchDrawerOpen(true);
        } else {
            console.warn("No sourceId available to open full document");
        }
    };

    const handleGenerateAnalysis = async () => {
        if (!baseCase || !sourceId) return;

        setIsGeneratingAnalysis(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisMode: 'structural_concern',
                    actorName: baseCase.title,
                    title: sourceId,
                    excerpts: baseCase.evidenceQuotes || [],
                    context: baseCase.claim?.fullReasoning || ''
                })
            });

            const data = await response.json();
            if (data.success && data.analysis) {
                setGeneratedStructuralAnalysis(data.analysis.structural_concern || data.analysis);
            } else {
                console.error("Failed to analyze:", data.error);
                alert("Failed to run structural analysis.");
            }
        } catch (error) {
            console.error("Analysis error:", error);
            alert("Error running analysis.");
        } finally {
            setIsGeneratingAnalysis(false);
        }
    };

    // Reset tab when case changes
    const nodeId = selectedNode?.id;
    const caseId = researchCurrentCase?.id;

    useEffect(() => {
        if (isActive) {
            // Only reset if not already 'explore' to avoid unnecessary re-renders
            setActiveTab(prev => prev !== 'explore' ? 'explore' : prev);
            setHighlightedExcerptIds([]);
            setGeneratedStructuralAnalysis(null);
            setIsGeneratingAnalysis(false);
        }
    }, [isActive, nodeId, caseId]);


    if (!isActive || !selectedNode) return null;

    const selectedNodeColors = {
        bg: selectedNode.color || getColorForCategory(selectedNode.category),
        text: "text-slate-900"
    };

    // Check if this node is the current target in the research study
    const isResearchTarget = researchCurrentCase?.nodeId === selectedNode.id;

    const handleSurveyChange = (data: Partial<GhostNodeSurveyResponse>) => {
        if (onResearchSubmit) {
            onResearchSubmit(data as SurveyResponseData);
        }
    };

    const currentCase = researchCurrentCase;
    const existingResponse = researchResponse;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const ghostData = selectedNode as any;

    // [NEW] Synthetic case for general ghost nodes to reuse evidence components
    const baseCase = (isResearchTarget && currentCase) ? currentCase : (selectedNode?.isGhost ? {
        id: selectedNode.id,
        title: selectedNode.label,
        evidenceQuotes: ghostData.evidenceQuotes?.map((q: any, i: number) => ({
            id: `q-${selectedNode.id}-${i}`,
            text: q.quote || q.text || '',
            context: q.context || '',
            sourceRef: typeof q.sourceRef === 'string' ? { docId: q.sourceRef } : q.sourceRef || { docId: (sourceId || 'Unknown') },
            actorTags: q.actors || q.actorTags || [],
            mechanismTags: q.mechanismTags || [],
            heading: q.heading || 'Excerpt'
        })),
        structuralAnalysis: ghostData.structuralAnalysis || null,
        claim: ghostData.claim || {
            summaryBullets: [],
            disambiguations: [],
            fullReasoning: ghostData.ghostReason || ghostData.whyAbsent || ghostData.description || 'No reasoning provided.'
        },
        roster: ghostData.roster ? {
            actorsInSection: ghostData.roster.actorsInSection || ghostData.roster.actors || [],
            mechanismsInSection: ghostData.roster.mechanismsInSection || ghostData.roster.mechanisms || []
        } : { actorsInSection: [], mechanismsInSection: [] },
        missingSignals: ghostData.missingSignals?.map((s: any, i: number) => ({
            id: s.id || `s-${selectedNode.id}-${i}`,
            label: s.signal || s.label || ''
        })) || [],
        pane1: {
            evidencePoints: selectedNode.quote ? [selectedNode.quote] : (ghostData.potentialConnections?.map((pc: any) => `${pc.relationshipType} to ${pc.targetActor}: ${pc.evidence}`) || [])
        },
        pane2: {
            hypothesis: ghostData.exclusionType || 'Missing Voice',
            reasoning: ghostData.description || 'No reasoning provided.'
        }
    } as any : null);

    // [NEW] Apply consistent analytical enrichment to the effective case
    const effectiveCase = baseCase ? {
        ...baseCase,
        // [NEW] Ensure structuralAnalysis is explicitly passed through to the UI. If challenged, display it below.
        structuralAnalysis: generatedStructuralAnalysis || baseCase.structuralAnalysis || ghostData.structuralAnalysis || null,
        antiStructuralAnalysis: generatedStructuralAnalysis?.antiStructuralAnalysis || baseCase.antiStructuralAnalysis || baseCase.structuralAnalysis?.antiStructuralAnalysis || ghostData.antiStructuralAnalysis || ghostData.structuralAnalysis?.antiStructuralAnalysis || null,
        claim: {
            ...(baseCase.claim || {}),
            summaryBullets: baseCase.claim?.summaryBullets || [],
            disambiguations: baseCase.claim?.disambiguations || [],
            // Prioritize the large 'ghostReason' paragraph over the short 1-sentence 'claim.fullReasoning'
            fullReasoning: ghostData.ghostReason || ghostData.whyAbsent || baseCase.claim?.fullReasoning || ghostData.description || 'No reasoning provided.',
            discourseThreats: baseCase.claim?.discourseThreats || baseCase.discourseThreats || ghostData.discourseThreats || []
        }
    } : null;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const displayCaseNumber = (currentCaseIndex !== undefined ? currentCaseIndex : (studyState ? studyState.currentCaseIndex : -1)) + 1;
    const displayTotalCases = totalCases !== undefined ? totalCases : (studyState && studyState.playlist ? studyState.playlist.length : 0);

    return (
        <TooltipProvider>
            <Card className="shadow-lg border-indigo-100 overflow-hidden bg-white flex flex-col max-w-4xl mx-auto w-full max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b shrink-0 select-none">
                    {/* Navigation Header for Research Mode */}
                    {isResearchTarget && studyState && (
                        <div className="flex items-center justify-between bg-slate-50 -mx-6 -mt-4 px-6 py-2 border-b mb-4">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="font-medium">Case {displayCaseNumber} of {displayTotalCases}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSuspend}
                                    className="h-7 px-2 text-slate-600 hover:text-slate-900"
                                    title="Save and exit safely. You can resume later."
                                >
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    Suspend and Resume later
                                </Button>
                                {onReset && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReset(); }}
                                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Withdraw from the study and delete all your data."
                                    >
                                        Withdraw and Delete All
                                    </Button>
                                )}

                                {isDev && onDebug && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onDebug}
                                        className="h-7 px-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse border-dashed"
                                        title="DEV ONLY: Auto-fill all cases and skip to end"
                                    >
                                        Debug: Fast Finish
                                    </Button>
                                )}
                                <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onPrevCase}
                                    disabled={displayCaseNumber <= 1}
                                    className="h-7 px-2"
                                    title="Previous Case"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onNextCase}
                                    disabled={!existingResponse && process.env.NODE_ENV !== 'development'}
                                    className="h-7 px-2"
                                    title="Next Case"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${selectedNodeColors.bg}`}>
                                <Brain className={`h-6 w-6 ${selectedNodeColors.text}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                    {(isResearchTarget && currentCase) ? currentCase.title : selectedNode.label}
                                </h3>
                                <div className="mt-1 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="outline" className={cn(selectedNodeColors.text, selectedNodeColors.bg, "border-0 cursor-help")}>
                                                    {selectedNode.category}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Analytical category assigned by the ontology.</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        {selectedNode.isGhost && (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200 cursor-help">
                                                            {selectedNode.absenceType?.includes('constitutive') ? 'Constitutive' :
                                                                selectedNode.absenceType?.includes('discursive') ? 'Discursive' :
                                                                    selectedNode.absenceType?.includes('structural') ? 'Structural' :
                                                                        selectedNode.absenceType?.includes('textual') ? 'Textual' :
                                                                            (selectedNode.absenceType?.split('-')[0] || 'Ghost')}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[200px]">
                                                        <p>{selectedNode.absenceType ? (ABSENCE_DESCRIPTIONS[selectedNode.absenceType] || ABSENCE_DESCRIPTIONS[selectedNode.absenceType.split('-')[0].charAt(0).toUpperCase() + selectedNode.absenceType.split('-')[0].slice(1)] || "Mechanism of absence in the document.") : "Actor is absent from the current data."}</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge className="ml-2 bg-slate-100 text-slate-600 border-slate-200 lowercase cursor-help">
                                                            {selectedNode.exclusionType || 'absent'}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[200px]">
                                                        <p>{selectedNode.exclusionType ? (EXCLUSION_DESCRIPTIONS[selectedNode.exclusionType] || "Type of exclusion detected.") : "This actor is not represented in the text."}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </>
                                        )}
                                        {isResearchTarget && (
                                            <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                                Current Study Case
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* [NEW] Trace in Ecosystem Map Button */}
                        {!isStatic && sourceId && selectedNode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 ml-4 flex-shrink-0"
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    params.set('sourceId', sourceId);
                                    params.set('trace', selectedNode.label);
                                    router.push(`/ecosystem?${params.toString()}`);
                                }}
                            >
                                <ArrowRight className="h-4 w-4" />
                                Trace in Ecosystem Map
                            </Button>
                        )}
                    </div>

                    {/* Tabs Logic */}
                    {isResearchTarget && (
                        <div className="flex items-center gap-2 mt-4 border-b w-full">
                            <button
                                onClick={() => setActiveTab('explore')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'explore'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <FileText className="h-4 w-4" />
                                Explore Evidence
                            </button>
                            <button
                                onClick={() => setActiveTab('evaluate')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'evaluate'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <ClipboardList className="h-4 w-4" />
                                Evaluate
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* EXPLORE TAB */}
                    {(activeTab === 'explore' || !isResearchTarget) && (
                        <div className="space-y-6">
                            {/* Evidence Rendering for Research Target OR any Ghost Node */}
                            {effectiveCase && (
                                <div className="space-y-4 mb-6 relative">
                                    {effectiveCase.evidenceQuotes ? (
                                        // V2 Grid Layout
                                        <div className="w-full">
                                            <CaseSummaryBar currentCase={effectiveCase} />

                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                                {/* Left Column (8 cols) */}
                                                <div className="lg:col-span-8">
                                                    <QuoteCardList
                                                        quotes={effectiveCase.evidenceQuotes}
                                                        documentLabel={effectiveCase.title.includes(':') ? effectiveCase.title.split(':')[0].trim() : undefined}
                                                        onContextRequest={handleContextRequest}
                                                        onFullDocRequest={handleFullDocRequest}
                                                    />

                                                    {/* [NEW] Structural Concern Deep Mapping */}
                                                    <StructuralAnalysisCard
                                                        actorName={effectiveCase.title}
                                                        excerptCount={effectiveCase.evidenceQuotes?.length || 0}
                                                        result={effectiveCase.structuralAnalysis}
                                                        challengedResult={effectiveCase.antiStructuralAnalysis}
                                                        onHighlightExcerpts={setHighlightedExcerptIds}
                                                        onGenerate={handleGenerateAnalysis}
                                                        isGenerating={isGeneratingAnalysis}
                                                    />
                                                </div>

                                                {/* Right Column (4 cols) */}
                                                <div className="lg:col-span-4 space-y-4">
                                                    <MissingSignalsPanel
                                                        signals={effectiveCase.missingSignals}
                                                        onSearchRequest={handleSearchRequest}
                                                    />
                                                    <Card className="shadow-sm">
                                                        <CardContent className="p-4">
                                                            <h4 className="text-sm font-semibold text-slate-800 mb-2">Search Document</h4>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(effectiveCase.searchChips || ['public', 'citizen', 'transparency']).map((chip: string) => (
                                                                    <Badge
                                                                        key={chip}
                                                                        variant="secondary"
                                                                        className="cursor-pointer hover:bg-slate-200 text-[10px]"
                                                                        onClick={() => handleSearchRequest(chip)}
                                                                    >
                                                                        {chip}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full mt-3 h-8 text-xs gap-1"
                                                                onClick={() => handleSearchRequest('')}
                                                            >
                                                                <Search className="h-3 w-3" /> Custom Search
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            <ClaimCard claim={effectiveCase.claim} />
                                        </div>
                                    ) : (
                                        // V1 Legacy Layout
                                        <>
                                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3 text-sm text-blue-800">
                                                <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                <p>
                                                    <strong>Review Evidence:</strong> Please analyze the document evidence (Pane 1) and the interpretive claim (Pane 2) below.
                                                    You will assessing the strength of this absence in the <strong>Evaluate</strong> tab.
                                                </p>
                                            </div>

                                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                                <CardContent className="pt-6">
                                                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                                                        Pane 1: Document Evidence
                                                    </h4>
                                                    <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed">
                                                        {effectiveCase.pane1?.evidencePoints.map((pt: string, i: number) => (
                                                            <li key={i}><QuoteHighlighter text={pt} /></li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-l-4 border-l-purple-500 shadow-sm">
                                                <CardContent className="pt-6">
                                                    <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">
                                                        Pane 2: Interpretive Claim
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div>
                                                            <span className="font-semibold text-slate-900 block mb-1">Hypothesis:</span>
                                                            <p className="text-slate-700">{effectiveCase.pane2?.hypothesis}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-slate-900 block mb-1">Reasoning:</span>
                                                            <p className="text-slate-700"><QuoteHighlighter text={effectiveCase.pane2?.reasoning || ''} /></p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </>
                                    )}

                                    {/* Only show evaluation prompt in research mode */}
                                    {isResearchTarget && (
                                        <div className="flex justify-center pt-8 border-t mt-8">
                                            <Button onClick={() => setActiveTab('evaluate')} size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                                Proceed to Evaluation <ClipboardList className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* EVALUATE TAB */}
                    {activeTab === 'evaluate' && isResearchTarget && currentCase && (
                        <div className="max-w-2xl mx-auto pb-8">
                            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 flex gap-3 text-sm text-purple-800">
                                <Info className="h-5 w-5 flex-shrink-0" />
                                <p>
                                    Please evaluate based on the evidence provided in the &quot;Explore&quot; tab.
                                    Your response is auto-saved.
                                </p>
                            </div>

                            {currentCase.evaluationConfig ? (
                                <GhostNodeEvaluationForm
                                    config={currentCase.evaluationConfig}
                                    initialData={existingResponse}
                                    onChange={handleSurveyChange}
                                />
                            ) : (
                                <GhostNodeSurvey
                                    config={currentCase.config!}
                                    initialData={existingResponse}
                                    onChange={handleSurveyChange}
                                />
                            )}

                            <div className="mt-8 flex justify-end items-center border-t pt-6 w-full">

                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        size="lg"
                                        className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm"
                                        disabled={
                                            (currentCase.config?.requireReflexivity && (!existingResponse?.reflexivity || existingResponse.reflexivity.length < 15)) ||
                                            (currentCase.evaluationConfig && (existingResponse?.absenceGate === undefined || existingResponse?.absenceGate === 'unsure')) ||
                                            (existingResponse?.strength === null || existingResponse?.strength === undefined)
                                        }
                                        onClick={() => {
                                            if (onNextCase) {
                                                onNextCase();
                                            } else {
                                                onClose();
                                            }
                                        }}
                                    >
                                        {isLastCase ? "Finish Study" : "Finish & Next Case"}
                                        {!isLastCase && <ArrowRight className="h-4 w-4" />}
                                        {isLastCase && <Check className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* V2 UI Overlays */}
                <SearchDrawer
                    isOpen={isSearchDrawerOpen}
                    onClose={() => setIsSearchDrawerOpen(false)}
                    initialQuery={searchQuery}
                    searchChips={currentCase?.searchChips}
                    documentId={sourceId || ''}
                />

                {/* Evidence Lineage Modal for Context */}
                {activeQuoteContext && (
                    <EvidenceLineageModal
                        isOpen={!!activeQuoteContext}
                        onClose={() => setActiveQuoteContext(null)}
                        title="Excerpt Context"
                        description="This is the exact quote extracted from the document."
                        quotes={[{
                            text: activeQuoteContext.text,
                            source: researchCurrentCase?.title,
                            context: activeQuoteContext.context || "Contextual surrounding paragraphs are currently limited in this view. Use 'Full Doc' to jump to the document text."
                        }]}
                        sourceType="Trace"
                    />
                )}
            </Card>
        </TooltipProvider>
    );
}

// [Fix] Restore named export for compatibility with main ontology page
export const ConceptDetailsModal = EvaluationInterface;
