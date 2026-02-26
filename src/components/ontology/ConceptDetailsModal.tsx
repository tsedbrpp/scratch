"use client";

import React, { useState, useEffect } from 'react';
import { OntologyNode } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ClipboardList, Info, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Clock, ArrowRight, Check, Search, AlertTriangle, Link as LinkIcon, Expand, Sparkles, Activity, ShieldAlert, MoveDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GhostNodeSurvey } from './research/GhostNodeSurvey';
import { Card, CardContent } from '@/components/ui/card';
import { StudyCase, GhostNodeSurveyResponse, StudyState, SurveyResponseData, EvidenceQuote } from '@/lib/study-config';
import { QuoteHighlighter } from './QuoteHighlighter';
import { useRouter } from 'next/navigation';
import { EvaluationProvider } from './research/v2/EvaluationContext';

// V2 Components
import { CaseSummaryBar } from './research/v2/CaseSummaryBar';
import { QuoteCardList } from './research/v2/QuoteCardList';
import { MissingSignalsPanel } from './research/v2/MissingSignalsPanel';
import { ClaimCard } from './research/v2/ClaimCard';
import { SurveyInstructionsDialog } from './research/v2/SurveyInstructionsDialog';
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
    onSave,
    studyState,
    currentCaseIndex,
    totalCases,
    isLastCase,
    sourceId
}: ConceptDetailsModalProps) {
    const isDev = process.env.NODE_ENV === 'development';
    const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuoteContext, setActiveQuoteContext] = useState<EvidenceQuote | null>(null);
    const router = useRouter(); // [NEW] Use Next.js router for Deep Linking

    // [New] Highlighted excerpts state for hover
    const [highlightedExcerptIds, setHighlightedExcerptIds] = useState<string[]>([]);
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
    const [generatedStructuralAnalysis, setGeneratedStructuralAnalysis] = useState<StructuralConcernResult | null>(null);

    // [NEW] Track if the bottom survey form is minimized
    const [isFormMinimized, setIsFormMinimized] = useState(false);

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

    // Define extended type for ghost data to replace 'any' casting (Code Smell Fix)
    type GhostDataExt = OntologyNode & {
        evidenceQuotes?: any[];
        structuralAnalysis?: any;
        antiStructuralAnalysis?: any;
        escalation?: any;
        claim?: any;
        roster?: any;
        missingSignals?: any[];
        potentialConnections?: any[];
        ghostType?: string | null;
        evidenceGrade?: string | null;
        absenceScore?: number | null;
        scoreBreakdown?: any;
        counterfactual?: any;
        materialImpact?: string | null;
        oppAccess?: string | null;
        sanctionPower?: string | null;
        dataVisibility?: string | null;
        representationType?: string | null;
        nodeStanding?: 'structural_ghost' | 'standing_candidate' | 'mention_only';
    };

    const ghostData = selectedNode as unknown as GhostDataExt;

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
        },
        // GNDP v1.0 fields
        ghostType: ghostData.ghostType || null,
        evidenceGrade: ghostData.evidenceGrade || null,
        absenceScore: ghostData.absenceScore ?? null,
        scoreBreakdown: ghostData.scoreBreakdown || null,
        counterfactual: ghostData.counterfactual || null,
        materialImpact: ghostData.materialImpact || null,
        oppAccess: ghostData.oppAccess || null,
        sanctionPower: ghostData.sanctionPower || null,
        dataVisibility: ghostData.dataVisibility || null,
        representationType: ghostData.representationType || null,
    } as any : null);

    // [NEW] Apply consistent analytical enrichment to the effective case
    const effectiveCase = baseCase ? {
        ...baseCase,
        // [NEW] Ensure structuralAnalysis is explicitly passed through to the UI. If challenged, display it below.
        structuralAnalysis: generatedStructuralAnalysis || baseCase.structuralAnalysis || ghostData.structuralAnalysis || null,
        antiStructuralAnalysis: generatedStructuralAnalysis?.antiStructuralAnalysis || baseCase.antiStructuralAnalysis || baseCase.structuralAnalysis?.antiStructuralAnalysis || ghostData.antiStructuralAnalysis || ghostData.structuralAnalysis?.antiStructuralAnalysis || null,
        escalationAnalysis: generatedStructuralAnalysis?.escalation || baseCase.escalation || baseCase.structuralAnalysis?.escalation || ghostData.escalation || ghostData.structuralAnalysis?.escalation || null,
        claim: {
            ...(baseCase.claim || {}),
            summaryBullets: baseCase.claim?.summaryBullets || [],
            disambiguations: baseCase.claim?.disambiguations || [],
            // Prioritize the large 'ghostReason' paragraph over the short 1-sentence 'claim.fullReasoning'
            fullReasoning: ghostData.ghostReason || ghostData.whyAbsent || baseCase.claim?.fullReasoning || ghostData.description || 'No reasoning provided.',
            discourseThreats: baseCase.claim?.discourseThreats || baseCase.discourseThreats || ghostData.discourseThreats || []
        }
    } : null;

    const displayCaseNumber = (currentCaseIndex !== undefined ? currentCaseIndex : (studyState ? studyState.currentCaseIndex : -1)) + 1;
    const displayTotalCases = totalCases !== undefined ? totalCases : (studyState && studyState.playlist ? studyState.playlist.length : 0);

    return (
        <TooltipProvider>
            <Card className={cn(
                "shadow-lg overflow-hidden bg-white flex flex-col mx-auto",
                isResearchTarget ? "w-[100vw] h-[100vh] max-w-none rounded-none border-0" : "w-11/12 max-w-[1600px] max-h-[95vh] border-indigo-100"
            )}>
                {/* Header */}
                <div className="px-6 py-4 border-b shrink-0 select-none">
                    {/* Navigation Header for Research Mode */}
                    {isResearchTarget && studyState && (
                        <div className="flex items-center justify-between bg-slate-50 -mx-6 -mt-4 px-6 py-2 border-b mb-4">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="font-medium">Case {displayCaseNumber} of {displayTotalCases}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <SurveyInstructionsDialog />
                                <div className="h-4 w-[1px] bg-slate-200 mx-1" />
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
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-full">
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
                                        {/* Primary Status Pill (Always Visible) */}
                                        {selectedNode.isGhost && (ghostData as any)?.nodeStanding && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge className={`ml-2 cursor-help ${(ghostData as any).nodeStanding === 'standing_candidate'
                                                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                        : (ghostData as any).nodeStanding === 'mention_only'
                                                            ? 'bg-slate-50 text-slate-500 border-slate-300'
                                                            : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                                        }`}>
                                                        {(ghostData as any).nodeStanding === 'standing_candidate' ? 'Standing Candidate'
                                                            : (ghostData as any).nodeStanding === 'mention_only' ? 'Mentioned · No Standing'
                                                                : 'Standing Validated'}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[280px]">
                                                    <p>Primary AI evaluation of this actor's governance standing within the text.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        {/* Current Study Case Badge */}
                                        {isResearchTarget && (
                                            <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                                Current Study Case
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Phase 1: Collapsible Technical Metadata Drawer */}
                                {selectedNode.isGhost && (
                                    <Collapsible className="mt-2 text-left">
                                        <div className="flex items-center">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-500 hover:text-slate-800 p-0 -ml-2 mb-1">
                                                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                                                    View AI Claim Details & Typologies
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="animate-in slide-in-from-top-2 duration-200 pt-1 pb-2">
                                            <div className="flex flex-wrap items-center gap-2">
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

                                                {/* GNDP v1.0 Badges */}
                                                {ghostData.ghostType && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge className={`ml-2 cursor-help ${ghostData.ghostType === 'Structural' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                ghostData.ghostType === 'Data' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' :
                                                                    ghostData.ghostType === 'Representational' ? 'bg-violet-100 text-violet-800 border-violet-200' :
                                                                        ghostData.ghostType === 'Scale' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                            ghostData.ghostType === 'Temporal' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                                                ghostData.ghostType === 'SupplyChain' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                                                    'bg-gray-100 text-gray-800 border-gray-200'
                                                                }`}>
                                                                {ghostData.ghostType} Ghost
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[250px]">
                                                            <p>{({
                                                                'Structural': 'Excluded from formal governance architecture',
                                                                'Data': 'Experience not measured within compliance structures',
                                                                'Representational': 'Proxy speaks without accountability or binding representation',
                                                                'Scale': 'Present at one governance scale but absent at another',
                                                                'Temporal': 'Affected later but excluded from early-stage design',
                                                                'SupplyChain': 'Hidden upstream/downstream labor or resource contribution',
                                                            } as Record<string, string>)[ghostData.ghostType] || 'Ghost typology classification'}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {ghostData.evidenceGrade && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge className={`ml-2 cursor-help font-mono text-[10px] ${ghostData.evidenceGrade === 'E4' ? 'bg-green-100 text-green-800 border-green-200' :
                                                                ghostData.evidenceGrade === 'E3' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                                }`}>
                                                                {ghostData.evidenceGrade}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[250px]">
                                                            <p>{({
                                                                'E4': 'Explicit exclusion — direct denial or boundary language',
                                                                'E3': 'Structural framing — enumerated roles systematically omit this actor',
                                                                'E2': 'Weak/speculative — non-mention only, no structural evidence',
                                                                'E1': 'No textual evidence of exclusion found',
                                                            } as Record<string, string>)[ghostData.evidenceGrade] || 'Evidence quality grade'}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {ghostData.absenceScore != null && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge className={`ml-2 cursor-help font-semibold tabular-nums ${ghostData.absenceScore >= 70 ? 'bg-red-100 text-red-800 border-red-300' :
                                                                ghostData.absenceScore >= 40 ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                                }`}>
                                                                {ghostData.absenceScore}/100
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[280px]">
                                                            <p className="font-medium mb-1">GNDP Absence Score</p>
                                                            {ghostData.scoreBreakdown && (
                                                                <div className="text-[11px] space-y-0.5">
                                                                    <div>Material Impact: {ghostData.scoreBreakdown.materialImpact}/30</div>
                                                                    <div>OPP Exclusion: {ghostData.scoreBreakdown.oppExclusion}/25</div>
                                                                    <div>Sanction Absence: {ghostData.scoreBreakdown.sanctionAbsence}/20</div>
                                                                    <div>Data Invisibility: {ghostData.scoreBreakdown.dataInvisibility}/15</div>
                                                                    <div>Representation Gap: {ghostData.scoreBreakdown.representationGap}/10</div>
                                                                </div>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}
                            </div>
                        </div>
                        {/* Removing Trace in Ecosystem Map Button per user request */}
                    </div>

                    {/* Tabs Logic removed for unified view */}
                </div>

                <div className="flex-1 overflow-y-auto relative flex flex-col min-h-0">
                    <div className="w-full px-6 py-4 relative scroll-smooth">
                        <EvaluationProvider caseData={effectiveCase}>
                            <div className="space-y-6 flex flex-col">
                                {/* Survey Questions overlay moved to the bottom based on user request */}

                                {/* Evidence Rendering for Research Target OR any Ghost Node */}
                                {effectiveCase && (
                                    <div className="space-y-4 mb-6 relative">
                                        {effectiveCase.evidenceQuotes ? (
                                            // V2 Grid Layout
                                            <div className="w-full">
                                                <CaseSummaryBar currentCase={effectiveCase} />

                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                                    {/* Left Column (8 cols): Anchored Evidence via Sticky Rail */}
                                                    <div className="lg:col-span-8 relative">
                                                        {/* Phase 2: Single Scroll + Sticky Evidence Rail */}
                                                        {/* On lg screens this becomes a sticky sidebar within the scrolling modal container */}
                                                        <div className="lg:sticky lg:top-4 max-h-[calc(100vh-[180px])] overflow-y-auto hide-scrollbar pb-6 pr-2 -mr-2">
                                                            <QuoteCardList
                                                                quotes={effectiveCase.evidenceQuotes}
                                                                documentLabel={effectiveCase.title.includes(':') ? effectiveCase.title.split(':')[0].trim() : undefined}
                                                                onContextRequest={handleContextRequest}
                                                                onFullDocRequest={handleFullDocRequest}
                                                                highlightedExcerptIds={highlightedExcerptIds}
                                                                caseId={effectiveCase.id}
                                                            />

                                                            {/* Structural Concern Deep Mapping */}
                                                            <div className="mt-4">
                                                                <StructuralAnalysisCard
                                                                    actorName={effectiveCase.title}
                                                                    excerptCount={effectiveCase.evidenceQuotes?.length || 0}
                                                                    result={effectiveCase.structuralAnalysis}
                                                                    challengedResult={effectiveCase.antiStructuralAnalysis}
                                                                    escalation={effectiveCase.escalationAnalysis}
                                                                    onHighlightExcerpts={setHighlightedExcerptIds}
                                                                    onGenerate={handleGenerateAnalysis}
                                                                    isGenerating={isGeneratingAnalysis}
                                                                />
                                                            </div>
                                                        </div>
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

                                                        {/* CF panel moved to full-width below grid */}
                                                        {/* GNDP Access Profile */}
                                                        {(ghostData.oppAccess || ghostData.dataVisibility || ghostData.representationType || ghostData.sanctionPower) && (
                                                            <Card className="shadow-sm">
                                                                <CardContent className="p-4">
                                                                    <h4 className="text-sm font-semibold text-slate-800 mb-2">GNDP Access Profile</h4>
                                                                    <div className="space-y-1.5 text-xs">
                                                                        {ghostData.oppAccess && (
                                                                            <div className="flex justify-between"><span className="text-slate-500">OPP Access</span><Badge variant="outline" className="text-[10px]">{ghostData.oppAccess}</Badge></div>
                                                                        )}
                                                                        {ghostData.sanctionPower && (
                                                                            <div className="flex justify-between"><span className="text-slate-500">Sanction Power</span><Badge variant="outline" className="text-[10px]">{ghostData.sanctionPower}</Badge></div>
                                                                        )}
                                                                        {ghostData.dataVisibility && (
                                                                            <div className="flex justify-between"><span className="text-slate-500">Data Visibility</span><Badge variant="outline" className="text-[10px]">{ghostData.dataVisibility}</Badge></div>
                                                                        )}
                                                                        {ghostData.representationType && (
                                                                            <div className="flex justify-between"><span className="text-slate-500">Representation</span><Badge variant="outline" className="text-[10px]">{ghostData.representationType}</Badge></div>
                                                                        )}
                                                                        {ghostData.materialImpact && (
                                                                            <div className="flex justify-between"><span className="text-slate-500">Material Impact</span><Badge variant="outline" className={`text-[10px] ${ghostData.materialImpact === 'High' ? 'border-red-300 text-red-700' : ghostData.materialImpact === 'Medium' ? 'border-amber-300 text-amber-700' : ''}`}>{ghostData.materialImpact}</Badge></div>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                </div>



                                            </div>
                                        ) : (
                                            // V1 Legacy Layout
                                            <>
                                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3 text-sm text-blue-800">
                                                    <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                    <p>
                                                        <strong>Review Evidence:</strong> Please analyze the document evidence (Pane 1) and the interpretive claim (Pane 2) below.
                                                        Address the survey evaluation questions above based on these points.
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

                                    </div>
                                )}
                                {/* ====== FULL-WIDTH COUNTERFACTUAL PANEL (REDESIGNED) ====== */}
                                {effectiveCase?.counterfactual && (() => {
                                    const cf = effectiveCase.counterfactual;
                                    const humanize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                                    const isV3 = cf.mechanismChain && cf.mechanismChain.length > 0 && typeof cf.mechanismChain[0] === 'object' && 'kind' in (cf.mechanismChain[0] as any);
                                    const impactLevel = cf.estimatedImpact?.level || cf.counterfactualImpact;

                                    const kindColors: Record<string, string> = {
                                        EvidenceCollection: 'bg-sky-50 text-sky-700 border-sky-200',
                                        Aggregation: 'bg-violet-50 text-violet-700 border-violet-200',
                                        Admissibility: 'bg-amber-50 text-amber-700 border-amber-200',
                                        ReviewInitiation: 'bg-blue-50 text-blue-700 border-blue-200',
                                        Notice: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                                        ResponseDueProcess: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                        RemedyEnforcement: 'bg-red-50 text-red-700 border-red-200',
                                        Deterrence: 'bg-orange-50 text-orange-700 border-orange-200',
                                    };

                                    return (
                                        <Card className="shadow-sm border border-slate-200 bg-white overflow-hidden mt-6">

                                            {/* 1. THE CATALYST (Hero Banner) */}
                                            <div className="bg-amber-50/80 border-b border-amber-200 px-6 py-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                                    <TooltipProvider>
                                                        <Tooltip delayDuration={300}>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1.5 cursor-help group">
                                                                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest border-b border-dotted border-transparent group-hover:border-amber-900/40 transition-colors pb-0.5">The Catalyst (Counterfactual)</h3>
                                                                    <Info className="h-4 w-4 text-amber-600/70 group-hover:text-amber-600 transition-colors" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                <p>A simulated change in rules, definitions, or procedural rights that tests how the current system would adapt if this actor were formally empowered.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                {cf.scenario ? (
                                                    <p className="text-lg font-medium text-amber-950 leading-relaxed italic">"{cf.scenario}"</p>
                                                ) : cf.reasoning ? (
                                                    <p className="text-base text-amber-900 leading-relaxed">{cf.reasoning}</p>
                                                ) : null}
                                            </div>

                                            <CardContent className="p-0">
                                                {/* 2. THE PROCESS (Flowchart) */}
                                                {(cf.chokepoint || (cf.mechanismChain && cf.mechanismChain.length > 0)) && (
                                                    <div className="px-6 py-8 bg-slate-50 border-b border-slate-100 flex flex-col items-center relative">
                                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 w-full text-center">Mechanism of Change</h4>

                                                        {cf.mechanismChain && (cf.mechanismChain.length > 0) && (
                                                            <div className="absolute top-6 right-6">
                                                                <TooltipProvider>
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="text-xs text-indigo-600 font-medium border border-indigo-100 bg-indigo-50 px-2 py-1 rounded-md cursor-help inline-flex">
                                                                                {cf.mechanismChain.length} Steps Generated
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                            <p>Number of procedural or legal steps required for a system to escalate a challenge, dispute, or non-compliance issue under this counterfactual scenario.</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        )}

                                                        {/* Step 0: Gate */}
                                                        {cf.chokepoint && (
                                                            <div className="w-full max-w-sm">
                                                                <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-sm text-center relative z-10">
                                                                    <div className="mx-auto bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mb-2">
                                                                        <Activity className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex items-center justify-center gap-1.5 mb-1 group">
                                                                        <TooltipProvider>
                                                                            <Tooltip delayDuration={300}>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className="flex items-center gap-1 cursor-help">
                                                                                        <p className="text-xs font-bold text-blue-900 uppercase tracking-widest border-b border-dotted border-transparent group-hover:border-blue-900/40 transition-colors pb-0.5">Governance Gate</p>
                                                                                        <Info className="h-3.5 w-3.5 text-blue-500/70 group-hover:text-blue-500 transition-colors" />
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                                    <p>A procedural control point, decision mechanism, or formal process that dictates access, oversight, or enforcement within the system.</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-slate-800">{cf.chokepoint.oppName}</p>
                                                                    <Badge variant="outline" className="mt-2 text-[10px] text-blue-600 border-blue-200 bg-blue-50/50">
                                                                        {cf.chokepoint.oppType.replace(/_/g, ' ')}
                                                                    </Badge>
                                                                    {cf.chokepoint.obligationType && (
                                                                        <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2 break-words">
                                                                            <span className="font-semibold text-slate-700">Obligation:</span> {cf.chokepoint.obligationType.replace(/([A-Z])/g, ' $1').trim()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {cf.mechanismChain && cf.mechanismChain.length > 0 && (
                                                                    <div className="flex justify-center -mt-2 -mb-2 relative z-0">
                                                                        <div className="h-8 border-l-2 border-dashed border-slate-300"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Steps 1..N: Mechanism Chain */}
                                                        {cf.mechanismChain && cf.mechanismChain.length > 0 && (
                                                            <div className="w-full max-w-lg space-y-0 flex flex-col items-center relative z-10">
                                                                {cf.mechanismChain.map((item: any, i: number) => {
                                                                    const isTyped = typeof item === 'object' && item.kind;
                                                                    const stepText = isTyped ? item.step : item;
                                                                    const kindLabel = isTyped ? item.kind.replace(/([A-Z])/g, ' $1').trim() : (isV3 ? 'Process' : null);
                                                                    const colorClasses = isTyped && kindColors[item.kind] ? kindColors[item.kind] : 'bg-white text-slate-700 border-slate-200';

                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            <div className={`w-full bg-white border-2 rounded-lg p-3 shadow-sm flex items-center gap-3 transition-colors ${isTyped && kindColors[item.kind] ? kindColors[item.kind].replace('bg-', 'border-').split(' ')[2] : 'border-slate-200'}`}>
                                                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${colorClasses}`}>
                                                                                    {i + 1}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    {kindLabel && <div className="text-[9px] uppercase tracking-widest font-bold opacity-60 mb-0.5">{kindLabel}</div>}
                                                                                    <div className="text-sm font-medium leading-snug">{stepText}</div>
                                                                                </div>
                                                                            </div>
                                                                            {i < cf.mechanismChain.length - 1 && (
                                                                                <div className="flex justify-center py-1.5 opacity-40">
                                                                                    <MoveDown className="h-4 w-4 text-slate-400" />
                                                                                </div>
                                                                            )}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* 3. THE OUTCOME (Cards/Grid) */}
                                                <div className="p-6 bg-slate-50/50 border-t border-slate-200">
                                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Projected Outcomes</h4>

                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                        {/* Impact Card */}
                                                        {impactLevel && (
                                                            <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm col-span-1 lg:col-span-3 flex flex-col md:flex-row md:items-center gap-4">
                                                                <TooltipProvider>
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="flex-shrink-0 bg-indigo-50 text-indigo-600 rounded-full h-8 w-8 flex items-center justify-center border border-indigo-100 cursor-help">
                                                                                <Activity className="h-4 w-4" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                            <p>The magnitude and nature of change caused by this counterfactual scenario.</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <div className="flex-1">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">System Impact</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-semibold text-slate-800">{impactLevel}</span>
                                                                        {cf.estimatedImpact?.guidanceBindingness && (
                                                                            <span className="text-xs text-slate-500">• {cf.estimatedImpact.guidanceBindingness}</span>
                                                                        )}
                                                                    </div>
                                                                    {cf.estimatedImpact?.qualifier && (
                                                                        <p className="text-sm text-slate-600 mt-1">{cf.estimatedImpact.qualifier}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Shielded / Risk */}
                                                        {(cf.shieldedActors?.length > 0 || cf.riskRedistribution?.shieldedActors?.length > 0) && (
                                                            <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm flex flex-col lg:col-span-1">
                                                                <TooltipProvider>
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="flex-shrink-0 bg-rose-50 text-rose-600 rounded-full h-8 w-8 flex items-center justify-center border border-rose-100 mb-3 cursor-help">
                                                                                <ShieldAlert className="h-4 w-4" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                            <p>Actors or groups whose actions or responsibilities are obscured or protected from accountability in this scenario.</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Shielded from Scrutiny</span>
                                                                <div className="flex flex-col gap-1.5 mt-2">
                                                                    {cf.shieldedActors?.map((s: any, i: number) => (
                                                                        <div key={i} className="text-sm font-medium text-slate-800">
                                                                            {humanize(s.actor)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Beneficiaries */}
                                                        {(cf.beneficiaryMechanisms?.length > 0 || cf.riskRedistribution?.beneficiariesOfAbsence?.length > 0) && (
                                                            <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm flex flex-col lg:col-span-2">
                                                                <TooltipProvider>
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-full h-8 w-8 flex items-center justify-center border border-emerald-100 mb-3 cursor-help">
                                                                                <Check className="h-4 w-4" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                            <p>Actors or groups who gain structural, financial, or political advantages in this scenario.</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Beneficiaries</span>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                                                    {cf.beneficiaryMechanisms?.map((b: any, i: number) => (
                                                                        <div key={i} className="text-sm font-medium text-slate-800">
                                                                            {humanize(b.actor)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Confidence Footer */}
                                                    {cf.confidence && (
                                                        <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                                                            <div className="flex flex-wrap items-center gap-4 text-sm mb-4 pb-4 border-b border-slate-100">
                                                                <TooltipProvider>
                                                                    <Tooltip delayDuration={300}>
                                                                        <TooltipTrigger asChild>
                                                                            <span className="font-semibold text-slate-700 cursor-help border-b border-dotted border-slate-400">Confidence</span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                            <p>Overall assessment of certainty for the generated outcome based on the source text.</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                <div className="flex items-center gap-3 text-slate-600 ml-auto mr-auto lg:mx-0">
                                                                    <TooltipProvider>
                                                                        <Tooltip delayDuration={300}>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="cursor-help border-b border-dotted border-slate-400">
                                                                                    Evidence: <span className="font-medium text-slate-800">{cf.confidence.evidenceBase}</span>
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                                <p>Amount and directness of textual or structural support for the outcome.</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>

                                                                    <span className="text-slate-300">|</span>

                                                                    <TooltipProvider>
                                                                        <Tooltip delayDuration={300}>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="cursor-help border-b border-dotted border-slate-400">
                                                                                    Speculative: <span className="font-medium text-slate-800">{cf.confidence.speculativeConfidence}</span>
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" className="text-xs max-w-xs shadow-md">
                                                                                <p>Degree to which the outcome relies on logical leaps or unstated assumptions.</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                {cf.confidence.caveat && (
                                                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{cf.confidence.caveat}</p>
                                                                )}

                                                                {(cf.confidence.grounded || cf.confidence.inferred || cf.confidence.unknown) && (
                                                                    <div className="flex flex-col gap-3 text-sm">
                                                                        {cf.confidence.grounded && (
                                                                            <div className="flex gap-4 items-start">
                                                                                <span className="text-emerald-600 font-semibold w-20 shrink-0">Grounded</span>
                                                                                <span className="text-slate-600 leading-relaxed">{cf.confidence.grounded}</span>
                                                                            </div>
                                                                        )}
                                                                        {cf.confidence.inferred && (
                                                                            <div className="flex gap-4 items-start">
                                                                                <span className="text-amber-600 font-semibold w-20 shrink-0">Inferred</span>
                                                                                <span className="text-slate-600 leading-relaxed">{cf.confidence.inferred}</span>
                                                                            </div>
                                                                        )}
                                                                        {cf.confidence.unknown && (
                                                                            <div className="flex gap-4 items-start">
                                                                                <span className="text-slate-400 font-semibold w-20 shrink-0">Unknown</span>
                                                                                <span className="text-slate-600 leading-relaxed">{cf.confidence.unknown}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })()}

                                {/* We'll re-structure the wrapper entirely to avoid stickiness limiting height */}
                                {isResearchTarget && currentCase && (
                                    <div className="w-full mx-auto mt-8 border-t border-purple-100 flex-shrink-0 rounded-t-xl overflow-visible pb-4 transition-all duration-300">
                                        <Card className="border-purple-200 shadow-lg bg-white overflow-visible flex flex-col rounded-b-none border-b-0">
                                            <div
                                                className="bg-purple-50 px-6 py-3 border-b border-purple-100 flex items-center justify-between flex-shrink-0 cursor-pointer hover:bg-purple-100/80 transition-colors"
                                                onClick={() => setIsFormMinimized(!isFormMinimized)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ClipboardList className="h-5 w-5 text-purple-600" />
                                                    <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider">Complete Survey Questions</h3>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-purple-200/50 text-purple-700">
                                                    {isFormMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            {!isFormMinimized && (
                                                <div className="flex-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                                    <CardContent className="p-6">
                                                        {currentCase.evaluationConfig ? (
                                                            <GhostNodeEvaluationForm
                                                                config={currentCase.evaluationConfig}
                                                                initialData={existingResponse}
                                                                surveyTitle={currentCase.title}
                                                                onChange={handleSurveyChange}
                                                            />
                                                        ) : (
                                                            <GhostNodeSurvey
                                                                config={currentCase.config!}
                                                                initialData={existingResponse}
                                                                onChange={handleSurveyChange}
                                                            />
                                                        )}
                                                        <div className="mt-8 flex justify-end items-center border-t border-slate-100 pt-6 w-full">
                                                            <Button
                                                                size="lg"
                                                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white gap-2 shadow-sm transition-colors"
                                                                disabled={
                                                                    currentCase.evaluationConfig
                                                                        ? !(existingResponse &&
                                                                            (existingResponse as any).absenceGate &&
                                                                            (existingResponse as any).groundingGate &&
                                                                            (existingResponse as any).euAiActOmissionAgreement &&
                                                                            (existingResponse as any).counterfactualFeasibility &&
                                                                            (existingResponse as any).scenarioConfidence)
                                                                        : !!(currentCase.config?.requireReflexivity && (!(existingResponse as any)?.reflexivity || String((existingResponse as any).reflexivity).length < 15))
                                                                }
                                                                onClick={() => {
                                                                    if (onSave) {
                                                                        onSave();
                                                                    }
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
                                                    </CardContent>
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </EvaluationProvider>
                    </div>
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
                {
                    activeQuoteContext && (
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
                    )
                }
            </Card >
        </TooltipProvider >
    );
}

// [Fix] Restore named export for compatibility with main ontology page
export const ConceptDetailsModal = EvaluationInterface;
