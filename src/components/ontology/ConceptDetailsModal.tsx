import React, { useState, useEffect } from 'react';
import { OntologyNode } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ClipboardList, Info, ChevronLeft, ChevronRight, Clock, ArrowRight, Check } from 'lucide-react'; // [Refactor] Added Info, Chevrons, Clock
import { GhostNodeSurvey } from './research/GhostNodeSurvey';
import { Card, CardContent } from '@/components/ui/card';
import { StudyCase, GhostNodeSurveyResponse, StudyState, SurveyResponseData } from '@/lib/study-config'; // [Refactor] Imported types

interface ConceptDetailsModalProps {
    selectedNode: OntologyNode | null;
    isOpen: boolean;
    onClose: () => void;
    isStatic?: boolean;
    researchCurrentCase?: StudyCase;
    researchResponse?: GhostNodeSurveyResponse;
    onResearchSubmit?: (data: SurveyResponseData) => void;
    onNextCase?: () => void;
    onPrevCase?: () => void;
    onReset?: () => void;
    onReset?: () => void;
    onSave?: () => void;
    onSuspend?: () => void;
    studyState?: StudyState;
    currentCaseIndex?: number;
    totalCases?: number;
    isLastCase?: boolean;
}

export function ConceptDetailsModal({
    selectedNode,
    isOpen,
    onClose,
    isStatic = false,
    researchCurrentCase,
    researchResponse,
    onResearchSubmit,
    onNextCase,
    onPrevCase,
    onReset,
    onSave,
    onSuspend,
    studyState,
    currentCaseIndex,
    totalCases,
    isLastCase
}: ConceptDetailsModalProps) {
    // ... existing code ...


    const [activeTab, setActiveTab] = useState<'explore' | 'evaluate'>('explore');
    const [showOriginalDetails, setShowOriginalDetails] = useState(false);

    // Reset tab when node changes
    const nodeId = selectedNode?.id;
    useEffect(() => {
        if (isOpen) {
            setActiveTab('explore');
            setShowOriginalDetails(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, nodeId]); // Use ID for stabilitylity

    if (!selectedNode) return null;

    const selectedNodeColors = {
        bg: selectedNode.color || getColorForCategory(selectedNode.category),
        text: "text-slate-900"
    };

    // Check if this node is the current target in the research study
    const isResearchTarget = researchCurrentCase?.nodeId === selectedNode.id;

    const handleSurveyChange = (data: Partial<GhostNodeSurveyResponse>) => {
        if (onResearchSubmit) {
            // Cast to SurveyResponseData if it has all required fields?
            // The GhostNodeSurvey might return Partial, but we should ensure valid submission.
            // For now, let's assume the survey state management inside GhostNodeSurvey handles validity or we cast it.
            // Actually, GhostNodeSurvey onChange sends Partial.
            // But onResearchSubmit in props now expects SurveyResponseData (Omit<...>)
            // We'll keep the signature in ConceptDetailsModal as Partial for internal flexibility 
            // BUT the parent expects specific data. 
            // Let's refine: The GhostNodeSurvey *onChange* gives partial updates.
            // But we only call onResearchSubmit when? 
            // Ah, ConceptDetailsModal doesn't have a "Submit" button for the *data*, it auto-saves?
            // "Your response is auto-saved." says the UI.
            // So we pass every partial change up? 
            // If so, onResearchSubmit should probably accept Partial<SurveyResponseData>.
            onResearchSubmit(data as SurveyResponseData);
        }
    };

    const currentCase = researchCurrentCase; // Alias for cleaner code usage below
    const existingResponse = researchResponse;

    // Calculate time remaining (simplified from StudyNavigator logic) - REMOVED
    // const startTime = studyState?.consentTimestamp || Date.now();
    // const estTimeRemaining = studyState ? Math.max(0, Math.round((720 - (Date.now() - startTime) / 60000))) : 0;

    // Use passed props or fallback to derived values (safe navigation)
    const displayCaseNumber = (currentCaseIndex !== undefined ? currentCaseIndex : (studyState ? studyState.currentCaseIndex : -1)) + 1;
    const displayTotalCases = totalCases !== undefined ? totalCases : (studyState && studyState.playlist ? studyState.playlist.length : 0);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
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
                                    className="h-7 px-2 mr-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Save and exit safely. You can resume later."
                                >
                                    <ClipboardList className="h-3.5 w-3.5 mr-1" />
                                    Suspend & Exit
                                </Button>
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
                                    disabled={!existingResponse} // Disable if no response? Or allow skipping? Usually allow if saved.
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
                                <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
                                    {(isResearchTarget && currentCase) ? currentCase.title : selectedNode.label}
                                </DialogTitle>
                                <div className="mt-1">
                                    <Badge variant="outline" className={`${selectedNodeColors.text} ${selectedNodeColors.bg} border-0`}>
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
                </DialogHeader>

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

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Original Ontology Data</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Standard Ontology Data */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                                <p className="text-slate-700 leading-relaxed">
                                    {selectedNode.description || "No description available."}
                                </p>
                            </div>

                            {selectedNode.quote && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidence</h4>
                                    <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r">
                                        <p className="text-slate-700 italic">
                                            &quot;{selectedNode.quote}&quot;
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Original Ghost Node Data (Rendered for info, even in Research Mode if desired) */}
                            {selectedNode.isGhost && selectedNode.whyAbsent && (
                                <div className="mt-8 border-t pt-6">
                                    <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">
                                        <span role="img" aria-label="ghost">👻</span> Why Absent? (Original Data)
                                    </h4>
                                    <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r mb-4">
                                        <p className="text-slate-700">{selectedNode.whyAbsent}</p>
                                    </div>

                                    {selectedNode.potentialConnections && selectedNode.potentialConnections.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Potential Connections</h4>
                                            <div className="space-y-3">
                                                {selectedNode.potentialConnections.map((conn, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                        <div className="text-sm">
                                                            <span className="font-semibold text-purple-600">→ {conn.targetActor}</span>
                                                            <span className="text-slate-500 mx-2">({conn.relationshipType})</span>
                                                        </div>
                                                        <div className="text-xs text-slate-600 mt-1">{conn.evidence}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}

                    {/* EVALUATE TAB */}
                    {activeTab === 'evaluate' && isResearchTarget && currentCase && (
                        <div className="max-w-2xl mx-auto pb-8">

                            {/* Toggle Original Data */}
                            <div className="mb-4 flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowOriginalDetails(!showOriginalDetails)}
                                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                >
                                    {showOriginalDetails ? "Hide" : "Show"} Original Node Details
                                </Button>
                            </div>

                            {showOriginalDetails && selectedNode.isGhost && selectedNode.whyAbsent && (
                                <div className="mb-6 p-4 border rounded-lg bg-slate-50 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">
                                        <span role="img" aria-label="ghost">👻</span> Why Absent?
                                    </h4>
                                    <div className="p-3 bg-white border border-purple-100 rounded mb-4 shadow-sm">
                                        <p className="text-slate-700 text-sm">{selectedNode.whyAbsent}</p>
                                    </div>
                                    {selectedNode.potentialConnections && selectedNode.potentialConnections.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potential Connections</h4>
                                            {selectedNode.potentialConnections.map((conn, idx) => (
                                                <div key={idx} className="text-xs p-2 bg-white rounded border border-slate-200">
                                                    <span className="font-semibold text-purple-600">→ {conn.targetActor}</span>
                                                    <span className="text-slate-500 mx-1">({conn.relationshipType})</span>
                                                    <div className="text-slate-600 mt-0.5">{conn.evidence}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

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


                            <div className="mt-8 flex justify-between items-center border-t pt-6 w-full">
                                {onReset && (
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={onReset}
                                    >
                                        Reset Study
                                    </Button>
                                )}

                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={onClose}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm"
                                        disabled={
                                            (currentCase.config.requireReflexivity && (!existingResponse?.reflexivity || existingResponse.reflexivity.length < 40)) ||
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
            </DialogContent>
        </Dialog >
    );
}
