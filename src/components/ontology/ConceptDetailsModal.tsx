"use client";

import React, { useState, useEffect } from 'react';
import { OntologyNode } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ClipboardList, Info, ChevronLeft, ChevronRight, Clock, ArrowRight, Check, Search, AlertTriangle } from 'lucide-react';
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

                                                {(ghostData.evidenceGrade === 'E1' || ghostData.evidenceGrade === 'E2') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge className="ml-2 bg-amber-50 text-amber-700 border-amber-300 border-dashed cursor-help">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Insufficient Evidence
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[250px]">
                                                            <p>Evidence grade {ghostData.evidenceGrade}: this ghost node lacks sufficient textual grounding. Score and typology are withheld.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {effectiveCase?.counterfactual?.confidence && (() => {
                                                    const cf = effectiveCase.counterfactual;
                                                    const levels = ['Low', 'Medium', 'High'];
                                                    const cfLevel = cf.confidence ? levels[Math.min(
                                                        levels.indexOf(cf.confidence.evidenceBase),
                                                        levels.indexOf(cf.confidence.speculativeConfidence)
                                                    )] : null;
                                                    return cfLevel ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge className={`ml-2 cursor-help text-[9px] font-normal ${cfLevel === 'Low' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                                        cfLevel === 'Medium' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                                                                            'bg-slate-200 text-slate-700 border-slate-300'
                                                                    }`}>
                                                                    CF: {cfLevel === 'Medium' ? 'Med' : cfLevel}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[250px]">
                                                                <p className="font-medium mb-1">Counterfactual Confidence</p>
                                                                <div className="text-[11px] space-y-0.5">
                                                                    <div>Evidence base: {cf.confidence.evidenceBase}</div>
                                                                    <div>Speculative confidence: {cf.confidence.speculativeConfidence}</div>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-1 italic">Conservative estimate (min of both)</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ) : null;
                                                })()}
                                                {effectiveCase?.counterfactual && !effectiveCase.counterfactual.confidence && (
                                                    <Badge className="ml-2 text-[9px] font-normal bg-slate-50 text-slate-400 border-slate-200 border-dashed">
                                                        CF: ?
                                                    </Badge>
                                                )}
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
                                                        highlightedExcerptIds={highlightedExcerptIds}
                                                    />

                                                    {/* [NEW] Structural Concern Deep Mapping */}
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

                                                    {/* GNDP Counterfactual Panel — v3/v2/v1 */}
                                                    {effectiveCase?.counterfactual && (() => {
                                                        const cf = effectiveCase.counterfactual;
                                                        const humanize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                                                        const isV3 = cf.mechanismChain && cf.mechanismChain.length > 0 && typeof cf.mechanismChain[0] === 'object' && 'kind' in (cf.mechanismChain[0] as any);
                                                        const isV2 = !isV3 && (!!cf.scenario || !!cf.mechanismChain);
                                                        const isLegacy = !isV3 && !isV2;
                                                        const impactLevel = cf.estimatedImpact?.level || cf.counterfactualImpact;
                                                        const impactClass = impactLevel === 'Transformative' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            impactLevel === 'Moderate' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                'bg-gray-100 text-gray-600 border-gray-200';
                                                        return (
                                                            <Card className="shadow-sm border border-slate-200 bg-white">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="text-sm font-semibold text-slate-800">{'\u26A0'} Counterfactual Scenario</h4>
                                                                        <div className="flex gap-1">
                                                                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] font-normal">speculative</Badge>
                                                                            {isLegacy && <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[9px] font-normal">legacy</Badge>}
                                                                        </div>
                                                                    </div>

                                                                    {/* v2: Scenario statement */}
                                                                    {cf.scenario && (
                                                                        <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 mb-3">
                                                                            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-1">Scenario</p>
                                                                            <p className="text-[11px] text-slate-700 leading-relaxed">{cf.scenario}</p>
                                                                        </div>
                                                                    )}

                                                                    {/* v1 fallback: reasoning */}
                                                                    {!cf.scenario && cf.reasoning && (
                                                                        <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 mb-3">
                                                                            <p className="text-[11px] text-slate-700 leading-relaxed">{cf.reasoning}</p>
                                                                        </div>
                                                                    )}

                                                                    <div className="space-y-3 text-xs text-slate-700">
                                                                        {/* Impact level */}
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-slate-500 font-medium">CF Impact:</span>
                                                                            <Badge className={`text-[10px] ${impactClass}`}>
                                                                                {impactLevel}
                                                                            </Badge>
                                                                            {cf.estimatedImpact?.qualifier && (
                                                                                <span className="text-[10px] text-slate-400 italic">{cf.estimatedImpact.qualifier}</span>
                                                                            )}
                                                                        </div>

                                                                        {/* Enforcement ladder */}
                                                                        {cf.estimatedImpact?.enforcementLadder && cf.estimatedImpact.enforcementLadder.length > 0 && (
                                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                                <span className="text-[10px] text-slate-400">Escalation:</span>
                                                                                {cf.estimatedImpact.enforcementLadder.map((e: any, i: number) => (
                                                                                    <span key={i} className="text-[9px] text-slate-500">
                                                                                        {i > 0 && <span className="text-slate-300 mx-0.5">{'\u2192'}</span>}
                                                                                        <span className="font-medium">{e.step.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                                                        {e.note && <span className="text-slate-400 ml-0.5">({e.note})</span>}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {/* Chokepoint — v3 role semantics or v2 bindingDuty */}
                                                                        {cf.chokepoint && (
                                                                            <div className="bg-blue-50/50 border border-blue-100 rounded px-2 py-1.5">
                                                                                <span className="text-[10px] font-medium text-blue-800">Gate: </span>
                                                                                <span className="text-[10px] text-blue-700">{cf.chokepoint.oppName}</span>
                                                                                <span className="text-[9px] text-blue-500 ml-1">({cf.chokepoint.oppType.replace(/_/g, ' ')})</span>
                                                                                {cf.chokepoint.standingActor && cf.chokepoint.obligatedActor ? (
                                                                                    <div className="mt-1 space-y-0.5">
                                                                                        <p className="text-[10px] text-slate-600">
                                                                                            <span className="font-medium text-emerald-700">Standing:</span> {cf.chokepoint.standingActor}
                                                                                        </p>
                                                                                        <p className="text-[10px] text-slate-600">
                                                                                            <span className="font-medium text-indigo-700">Obligation:</span> {cf.chokepoint.obligatedActor}
                                                                                            {cf.chokepoint.obligatedActorType && <span className="text-slate-400 ml-0.5">({cf.chokepoint.obligatedActorType})</span>}
                                                                                            {cf.chokepoint.obligationType && <span className="text-slate-500 ml-1">{'\u2192'} {cf.chokepoint.obligationType.replace(/([A-Z])/g, ' $1').trim()}</span>}
                                                                                        </p>
                                                                                    </div>
                                                                                ) : cf.chokepoint.bindingDuty ? (
                                                                                    <p className="text-[10px] text-slate-600 mt-0.5">Duty: {cf.chokepoint.bindingDuty}</p>
                                                                                ) : null}
                                                                            </div>
                                                                        )}

                                                                        {/* Mechanism chain — v3 typed or v2 plain */}
                                                                        {cf.mechanismChain && cf.mechanismChain.length > 0 && (
                                                                            <div>
                                                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Mechanism of change</span>
                                                                                <div className="mt-1 space-y-1">
                                                                                    {cf.mechanismChain.map((item: any, i: number) => {
                                                                                        const isTyped = typeof item === 'object' && item.kind;
                                                                                        const stepText = isTyped ? item.step : item;
                                                                                        const kindLabel = isTyped ? item.kind.replace(/([A-Z])/g, ' $1').trim() : null;
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
                                                                                            <div key={i} className="flex items-start gap-2">
                                                                                                <span className="text-[10px] font-mono text-slate-400 mt-0.5 shrink-0">{i + 1}.</span>
                                                                                                {kindLabel && (
                                                                                                    <Badge variant="outline" className={`text-[8px] shrink-0 mt-0.5 ${kindColors[item.kind] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{kindLabel}</Badge>
                                                                                                )}
                                                                                                <span className="text-[11px] text-slate-700">{stepText}</span>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* v1 fallback: power dynamics grid */}
                                                                        {!isV2 && cf.territorialization && (() => {
                                                                            const TERR_LABELS: Record<string, string> = {
                                                                                destabilizesPower: 'Shifts existing power dynamics',
                                                                                introducesAccountability: 'Introduces new accountability',
                                                                                reconfiguresData: 'Changes data collection obligations',
                                                                                altersEnforcement: 'Modifies enforcement mechanisms',
                                                                            };
                                                                            return (
                                                                                <div>
                                                                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Power dynamics</span>
                                                                                    <div className="mt-1 space-y-1">
                                                                                        {Object.entries(cf.territorialization).map(([key, val]: [string, any]) => (
                                                                                            <div key={key} className="flex items-center gap-2">
                                                                                                <span className={`text-[11px] font-bold ${val ? 'text-green-600' : 'text-gray-400'}`}>{val ? '\u2713' : '\u2717'}</span>
                                                                                                <span className={`text-[11px] ${val ? 'text-slate-700' : 'text-slate-400'}`}>{TERR_LABELS[key] || key}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}

                                                                        {/* v2: Beneficiary mechanisms */}
                                                                        {cf.beneficiaryMechanisms && cf.beneficiaryMechanisms.length > 0 && (
                                                                            <div>
                                                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Who benefits from their exclusion?</span>
                                                                                <div className="mt-1 space-y-1.5">
                                                                                    {cf.beneficiaryMechanisms.map((b: any, i: number) => (
                                                                                        <div key={i} className="flex items-start gap-1.5">
                                                                                            <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600 shrink-0 mt-0.5">{humanize(b.actor)}</Badge>
                                                                                            <span className="text-[10px] text-slate-500">{b.mechanism}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* v1 fallback: bare beneficiary list */}
                                                                        {!isV2 && cf.riskRedistribution?.beneficiariesOfAbsence?.length > 0 && (
                                                                            <div>
                                                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Who benefits from their exclusion?</span>
                                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                                    {cf.riskRedistribution.beneficiariesOfAbsence.map((b: string) => (
                                                                                        <Badge key={b} variant="outline" className="text-[10px] border-slate-300 text-slate-600">{humanize(b)}</Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* v2: Shielded actors with mechanisms */}
                                                                        {cf.shieldedActors && cf.shieldedActors.length > 0 && (
                                                                            <div>
                                                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Shielded from scrutiny</span>
                                                                                <div className="mt-1 space-y-1.5">
                                                                                    {cf.shieldedActors.map((s: any, i: number) => (
                                                                                        <div key={i} className="flex items-start gap-1.5">
                                                                                            <Badge variant="outline" className="text-[10px] border-red-200 text-red-600 shrink-0 mt-0.5">{humanize(s.actor)}</Badge>
                                                                                            <span className="text-[10px] text-slate-500">{s.mechanism}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* v1 fallback: bare shielded list */}
                                                                        {!isV2 && cf.riskRedistribution?.shieldedActors?.length > 0 && (
                                                                            <div>
                                                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Shielded from scrutiny</span>
                                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                                    {cf.riskRedistribution.shieldedActors.map((s: string) => (
                                                                                        <Badge key={s} variant="outline" className="text-[10px] border-red-200 text-red-600">{humanize(s)}</Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Confidence assessment — v3 grounded/inferred/unknown */}
                                                                        {cf.confidence && (
                                                                            <div className="border-t border-slate-100 pt-2 mt-2">
                                                                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Confidence</span>
                                                                                <div className="flex items-center gap-3 mt-1">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className="text-[10px] text-slate-400">Evidence:</span>
                                                                                        <Badge variant="outline" className={`text-[9px] ${cf.confidence.evidenceBase === 'High' ? 'border-green-300 text-green-700' :
                                                                                                cf.confidence.evidenceBase === 'Medium' ? 'border-amber-300 text-amber-700' :
                                                                                                    'border-slate-300 text-slate-500'
                                                                                            }`}>{cf.confidence.evidenceBase}</Badge>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className="text-[10px] text-slate-400">Speculative:</span>
                                                                                        <Badge variant="outline" className={`text-[9px] ${cf.confidence.speculativeConfidence === 'High' ? 'border-green-300 text-green-700' :
                                                                                                cf.confidence.speculativeConfidence === 'Medium' ? 'border-amber-300 text-amber-700' :
                                                                                                    'border-slate-300 text-slate-500'
                                                                                            }`}>{cf.confidence.speculativeConfidence}</Badge>
                                                                                    </div>
                                                                                </div>
                                                                                {cf.confidence.caveat && (
                                                                                    <p className="text-[10px] text-slate-400 italic mt-1">{cf.confidence.caveat}</p>
                                                                                )}
                                                                                {/* v3: Grounded / Inferred / Unknown mini-table */}
                                                                                {(cf.confidence.grounded || cf.confidence.inferred || cf.confidence.unknown) && (
                                                                                    <div className="mt-2 border border-slate-100 rounded overflow-hidden">
                                                                                        <table className="w-full text-[10px]">
                                                                                            <tbody>
                                                                                                {cf.confidence.grounded && (
                                                                                                    <tr className="border-b border-slate-50">
                                                                                                        <td className="px-2 py-1 font-medium text-green-700 bg-green-50/50 w-20">Grounded</td>
                                                                                                        <td className="px-2 py-1 text-slate-600">{cf.confidence.grounded}</td>
                                                                                                    </tr>
                                                                                                )}
                                                                                                {cf.confidence.inferred && (
                                                                                                    <tr className="border-b border-slate-50">
                                                                                                        <td className="px-2 py-1 font-medium text-amber-700 bg-amber-50/50 w-20">Inferred</td>
                                                                                                        <td className="px-2 py-1 text-slate-600">{cf.confidence.inferred}</td>
                                                                                                    </tr>
                                                                                                )}
                                                                                                {cf.confidence.unknown && (
                                                                                                    <tr>
                                                                                                        <td className="px-2 py-1 font-medium text-red-700 bg-red-50/50 w-20">Unknown</td>
                                                                                                        <td className="px-2 py-1 text-slate-600">{cf.confidence.unknown}</td>
                                                                                                    </tr>
                                                                                                )}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                )}
                                                                                {/* v3: Assumptions */}
                                                                                {cf.confidence.assumptions && cf.confidence.assumptions.length > 0 && (
                                                                                    <div className="mt-1.5">
                                                                                        <span className="text-[9px] text-slate-400 uppercase tracking-wide">Assumptions</span>
                                                                                        <div className="mt-0.5 space-y-0.5">
                                                                                            {cf.confidence.assumptions.map((a: string, i: number) => (
                                                                                                <p key={i} className="text-[10px] text-slate-500 pl-2 border-l border-slate-200">{a}</p>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })()}
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
