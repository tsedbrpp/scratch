"use client";

import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { OntologyData, OntologyNode } from "@/types/ontology";

// Research Mode Components
import { useResearchMode } from "@/hooks/useResearchMode";
import { EvaluatorLoginDialog } from "@/components/ontology/research/EvaluatorLoginDialog";
import { ConsentScreen } from "@/components/ontology/research/ConsentScreen";
import { ProfileModal } from "@/components/ontology/research/ProfileModal";
import { CalibrationModal } from "@/components/ontology/research/CalibrationModal";

import { DebriefScreen } from "@/components/ontology/research/DebriefScreen";

// Components
import { EvaluationInterface } from "@/components/ontology/ConceptDetailsModal";
import { generateCasesFromOntology } from "@/lib/study-utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";




export default function OntologyPage() {
    const { sources } = useSources();
    const [selectedSourceId] = useServerStorage<string>("ontology_selected_source_id", "");
    const [ontologyMaps] = useServerStorage<Record<string, OntologyData>>("ontology_maps", {});

    // Memoize generated cases for both login and import fallback
    const generatedCases = useMemo(() => generateCasesFromOntology(sources, ontologyMaps), [sources, ontologyMaps]);

    // Research Mode Hook
    const {
        state: researchState,
        isLoading: isResearchLoading,
        login: researchLogin,
        giveConsent: researchGiveConsent,
        saveProfile: researchSaveProfile,
        submitResponse: researchSubmitResponse,
        nextCase: researchNextCase,
        prevCase: researchPrevCase,
        currentCase: researchCurrentCase,
        resetStudy: resetStudy,
        logout: researchLogout, // [NEW]
        completeStudy: completeStudy, // [NEW]
        debugCompleteStudy: researchDebugCompleteStudy, // [NEW]
        restoreSession: researchRestoreSession,
        cases: researchCases
    } = useResearchMode(generatedCases);



    const handleNextCase = () => {
        if (!researchState.playlist || !researchCases) return;
        const nextIndex = researchState.currentCaseIndex + 1;
        if (nextIndex >= researchState.playlist.length) {
            // ALWAYS show the debrief screen when finishing, even if previously dismissed
            setIsDebriefDismissed(false);

            // Force completion state if not already set (relying on button validation)
            if (!researchState.isComplete) {
                completeStudy();
            }
            setSelectedNodeId(null);
            return;
        }

        if (nextIndex < researchState.playlist.length) {
            const nextCaseId = researchState.playlist[nextIndex];
            const nextCase = researchCases.find(c => c.id === nextCaseId);

            if (nextCase) {
                setSelectedNodeId(nextCase.nodeId);
                researchNextCase();
            } else {
                console.error("Next case not found in cases list", nextCaseId);
            }
        }
    };

    const handlePrevCase = () => {
        if (!researchState.playlist || !researchCases) return;
        const prevIndex = researchState.currentCaseIndex - 1;
        if (prevIndex >= 0) {
            const prevCaseId = researchState.playlist[prevIndex];
            const prevCase = researchCases.find(c => c.id === prevCaseId);
            if (prevCase) {
                setSelectedNodeId(prevCase.nodeId);
                researchPrevCase();
            }
        }
    };

    const handleReset = async () => {
        if (confirm("Withdraw from the study? This will delete ALL local progress and permanently remove your data from our servers. This action cannot be undone.")) {
            // Clear all local storage keys related to the app
            localStorage.removeItem("ontology_selected_node_id");
            localStorage.removeItem("ontology_selected_source_id");
            localStorage.removeItem("instant_tea_research_store");
            await resetStudy();
            window.location.reload();
        }
    };

    // Local state for Login Dialog
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isDebriefDismissed, setIsDebriefDismissed] = useState(false);

    // ... (rest of component until ConceptDetailsModal) ...



    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);



    // Get the currently active map based on selectedSourceId
    const currentOntologyData = (selectedSourceId && ontologyMaps && ontologyMaps[selectedSourceId])
        ? ontologyMaps[selectedSourceId]
        : null;



    // Sync selectedNodeId with current research case (Fix for session import)
    useEffect(() => {
        // Auto-close modal when study is complete so Debrief screen is visible
        if (researchState.isComplete) {
            setSelectedNodeId(null);
            return;
        }

        if (researchCurrentCase) {
            setSelectedNodeId(researchCurrentCase.nodeId);
        }
    }, [researchCurrentCase, researchState.isComplete]); // setSelectedNodeId is stable (from useServerStorage)


    // Research Mode Logic helpers
    const handleDownloadData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(researchState, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `instanttea_study_${researchState.evaluatorCode}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };











    const selectedNode = currentOntologyData?.nodes?.find(n => n.id === selectedNodeId);

    // [Fix] Ghost Node Fallback
    // If we are locating a node that represents a "Ghost" (missing) actor, it might not exist in the map data.
    // We synthesize a virtual node so the modal can still open for evaluation.
    const effectiveSelectedNode = selectedNode || (
        (researchCurrentCase && selectedNodeId === researchCurrentCase.nodeId)
            ? {
                id: researchCurrentCase.nodeId,
                label: researchCurrentCase.title.split(': ')[1] || researchCurrentCase.title, // Extract name from "Case 1: Name"
                description: "This actor is currently under investigation for absence.",
                category: "Actor", // Default to Actor
                isGhost: true,
                color: "#e2e8f0", // Slate 200
                x: 0, y: 0
            } as OntologyNode
            : null
    );

    // RESEARCH MODE RENDER LOGIC
    // --------------------------
    // 1. Consent Screen (if logged in but no consent)
    const showConsent = !!researchState.evaluatorCode && !researchState.consentGiven;
    // 2. Profile Screen (if consent but no profile)
    const showProfile = !!researchState.consentGiven && !researchState.profile;
    // 3. Calibration Screen (if profile but current case is calibration)
    const showCalibration = !!researchState.profile && researchCurrentCase?.isCalibration;
    // 4. Debrief Screen (if complete)
    const showDebrief = researchState.isComplete && !isDebriefDismissed;

    // Save/Download Study State
    const handleResearchSave = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(researchState, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `research-session-${researchState.evaluatorCode}-${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast.success("Progress saved to file");
    };

    // Suspend Session (Clear local, keep server)
    const handleSuspend = async () => {
        const code = researchState.evaluatorCode;
        if (confirm(`Your progress is securely saved.\n\nTo resume later, simply enter your Evaluator Code: ${code}\n\nClick OK to exit the session now.`)) {
            await researchLogout();
            window.location.reload();
        }
    };


    return (
        <ErrorBoundary>
            <div className="space-y-8 relative">


                {/* RESEARCH MODE OVERLAYS */}
                {/* RESEARCH MODE OVERLAYS */}
                <EvaluatorLoginDialog
                    isOpen={isLoginOpen}
                    onLogin={async (code, cases) => {
                        // Try to restore first
                        const restored = await researchRestoreSession(code, cases);
                        if (restored) {
                            toast.success("Welcome back! Previous session restored.");
                            setIsLoginOpen(false);
                        } else {
                            // Start new
                            researchLogin(code, cases);
                            toast.success("New session started.");
                            setIsLoginOpen(false);
                        }
                    }}
                    generatedCases={generatedCases}
                    // onResume={handleResearchImport} // Removed manual upload from UI
                    isLoading={isResearchLoading}
                    onClose={() => setIsLoginOpen(false)}
                />

                {showConsent && (
                    <ConsentScreen
                        onConsent={researchGiveConsent}
                        onDecline={() => resetStudy()} // Log out/reset if declined
                    />
                )}

                {showProfile && (
                    <ProfileModal onComplete={researchSaveProfile} />
                )}

                {showCalibration && (
                    <CalibrationModal onComplete={(rating) => {
                        if (researchCurrentCase) {
                            // Map the qualitative rating to a score number for storage
                            const strengthMap: Record<string, number> = {
                                'low': 20,
                                'med': 60,
                                'high': 90
                            };

                            researchSubmitResponse(researchCurrentCase.id, {
                                strength: strengthMap[rating] || 0,
                                confidence: 'high',
                                missingRoles: ['calibration'], // Dummy value for calibration
                                institutionalLogics: {
                                    market: null,
                                    state: null,
                                    professional: null,
                                    community: null
                                },
                                reflexivity: "Calibration task completed",
                                isUncertain: false,
                                missingRolesOther: "",
                                startedAt: Date.now(),
                                timeOnCaseMs: 0
                            });

                            // Small timeout to ensure state update propagates before switching case?
                            // React state updates are batched, but nextCase also updates state.
                            // They usually work fine together in event handlers.
                            setTimeout(() => {
                                researchNextCase();
                            }, 50);
                        }
                    }}
                        onReset={async () => {
                            if (confirm("Reset study progress? This will delete all local data.")) {
                                await resetStudy();
                                window.location.reload();
                            }
                        }}
                    />
                )}

                {showDebrief && (
                    <DebriefScreen
                        studyState={researchState}
                        onDownload={handleDownloadData}
                        onClose={async () => {
                            await resetStudy();
                            window.location.reload();
                        }}
                    />
                )}



                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <Network className="h-8 w-8 text-indigo-600" />
                            Survey & Validation
                        </h2>
                    </div>
                </div>

                {/* Welcome Section for New Evaluators (also shown after study completion + debrief dismissal) */}
                {(!researchState.evaluatorCode || (researchState.isComplete && isDebriefDismissed)) && (
                    <Card className="overflow-hidden border-indigo-100 shadow-xl bg-white">
                        <div className="flex flex-col lg:flex-row">
                            {/* Image Section */}
                            <div className="lg:w-1/3 relative min-h-[300px] lg:min-h-full bg-indigo-50">
                                <Image
                                    src="/surveybkg.png"
                                    alt="Survey Background"
                                    fill
                                    priority
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply"></div>
                            </div>

                            {/* Content Section */}
                            <CardContent className="flex-1 pt-8 px-8 pb-8 lg:px-12 lg:pt-12 bg-gradient-to-br from-white to-indigo-50/30">
                                <div className="max-w-2xl">
                                    <h2 className="text-3xl font-bold text-indigo-950 mb-4 tracking-tight">Ghost Node Validation Study</h2>

                                    <p className="text-slate-700 mb-6 leading-relaxed text-lg">
                                        Thank you for participating. A &ldquo;ghost node&rdquo; is a stakeholder or actor that may be materially relevant to governance but absent from the policy text&apos;s formal roles, rights, obligations, or enforcement pathways.
                                    </p>

                                    <div className="space-y-6 mb-10">
                                        <div className="bg-white/80 rounded-xl p-5 border border-indigo-100 shadow-sm">
                                            <h4 className="font-bold text-indigo-900 mb-2 uppercase text-xs tracking-widest">To begin:</h4>
                                            <p className="text-slate-700">
                                                Enter your <strong>Evaluator Code</strong> to load your assigned cases and start the survey.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ul className="space-y-3 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                    <strong>Estimated time:</strong> 30&ndash;60 minutes
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                    Pause & resume later with same code
                                                </li>
                                            </ul>
                                            <ul className="space-y-3 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                    Best experience on laptop/desktop
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 items-center">
                                        <Button
                                            onClick={() => setIsLoginOpen(true)}
                                            size="lg"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[180px] h-14 text-lg font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                                        >
                                            <PlayCircle className="h-6 w-6 mr-2" />
                                            Begin Survey
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsLoginOpen(true)}
                                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-14 px-6 font-semibold"
                                        >
                                            Resume survey
                                        </Button>
                                    </div>

                                    <div className="mt-12 pt-6 border-t border-indigo-100 text-[13px] text-slate-500 italic">
                                        If your code isn&apos;t recognized or you have technical issues, contact <a href="mailto:Tod.Sedbrook@bears.unco.edu" className="text-indigo-600 font-bold hover:underline">Tod.Sedbrook@bears.unco.edu</a>.
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                )}

                <EvaluationInterface
                    selectedNode={effectiveSelectedNode}
                    isActive={
                        !!selectedNodeId &&
                        researchState.consentGiven &&
                        !!researchState.profile &&
                        !researchCurrentCase?.isCalibration &&
                        !researchState.isComplete
                    }
                    onClose={() => setSelectedNodeId(null)}
                    sourceId={researchCurrentCase?.sourceId || selectedSourceId}
                    researchCurrentCase={researchCurrentCase || undefined}
                    researchResponse={researchCurrentCase ? researchState.responses[researchCurrentCase.id] : undefined}
                    onResearchSubmit={(data) => {
                        if (researchCurrentCase) {
                            researchSubmitResponse(researchCurrentCase.id, data);
                        }
                    }}
                    onNextCase={handleNextCase}
                    onPrevCase={handlePrevCase}
                    onReset={handleReset}
                    onDebug={researchDebugCompleteStudy}
                    onSave={handleResearchSave}
                    onSuspend={handleSuspend}
                    studyState={researchState}
                    // Pass derived values directly to avoid modal logic complexity
                    currentCaseIndex={researchState.currentCaseIndex}
                    totalCases={researchCases ? researchCases.length : (researchState.playlist?.length || 0)}
                    isLastCase={researchState.playlist && researchState.currentCaseIndex === researchState.playlist.length - 1}
                />
            </div>
        </ErrorBoundary>
    );
}
