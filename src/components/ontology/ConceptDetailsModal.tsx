"use client";

import React, { useState, useEffect } from 'react';
import { OntologyNode } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ClipboardList, Info, ChevronLeft, ChevronRight, Clock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GhostNodeSurvey } from './research/GhostNodeSurvey';
import { Card, CardContent } from '@/components/ui/card';
import { StudyCase, GhostNodeSurveyResponse, StudyState, SurveyResponseData } from '@/lib/study-config'; // [Refactor] Imported types

interface ConceptDetailsModalProps {
    selectedNode: OntologyNode | null;
    isActive: boolean;
    onClose: () => void;
    isStatic?: boolean;
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
    isLastCase
}: ConceptDetailsModalProps) {
    const isDev = process.env.NODE_ENV === 'development';
    const [activeTab, setActiveTab] = useState<'explore' | 'evaluate'>('explore');

    // Reset tab when case changes
    const nodeId = selectedNode?.id;
    const caseId = researchCurrentCase?.id;

    useEffect(() => {
        if (isActive) {
            // Only reset if not already 'explore' to avoid unnecessary re-renders
            setActiveTab(prev => prev !== 'explore' ? 'explore' : prev);
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

    const displayCaseNumber = (currentCaseIndex !== undefined ? currentCaseIndex : (studyState ? studyState.currentCaseIndex : -1)) + 1;
    const displayTotalCases = totalCases !== undefined ? totalCases : (studyState && studyState.playlist ? studyState.playlist.length : 0);

    return (
        <Card className="shadow-lg border-indigo-100 overflow-hidden bg-white flex flex-col max-w-4xl mx-auto w-full mb-12">
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
                                    onClick={onReset}
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
                                disabled={!existingResponse}
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
                            <div className="mt-1 flex items-center">
                                <Badge variant="outline" className={cn(selectedNodeColors.text, selectedNodeColors.bg, "border-0")}>
                                    {selectedNode.category}
                                </Badge>
                                {isResearchTarget && (
                                    <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                        Current Study Case
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
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
                        {/* Research Mode Pane 1 & 2 */}
                        {isResearchTarget && currentCase && (
                            <div className="space-y-4 mb-6">
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
                                            {currentCase.pane1.evidencePoints.map((pt, i) => (
                                                <li key={i}>{pt}</li>
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
                                                <p className="text-slate-700">{currentCase.pane2.hypothesis}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-900 block mb-1">Reasoning:</span>
                                                <p className="text-slate-700">{currentCase.pane2.reasoning}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-center pt-4">
                                    <Button onClick={() => setActiveTab('evaluate')} size="lg" className="gap-2">
                                        Proceed to Evaluation <ClipboardList className="h-4 w-4" />
                                    </Button>
                                </div>
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

                        <GhostNodeSurvey
                            config={currentCase.config}
                            initialData={existingResponse}
                            onChange={handleSurveyChange}
                        />

                        <div className="mt-8 flex justify-end items-center border-t pt-6 w-full">

                            <div className="flex gap-2 ml-auto">
                                <Button
                                    size="lg"
                                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm"
                                    disabled={
                                        (currentCase.config.requireReflexivity && (!existingResponse?.reflexivity || existingResponse.reflexivity.length < 15)) ||
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
        </Card>
    );
}

// [Fix] Restore named export for compatibility with main ontology page
export const ConceptDetailsModal = EvaluationInterface;
