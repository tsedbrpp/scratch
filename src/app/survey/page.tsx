"use client";

import { useState, useMemo, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { useDemoMode } from "@/hooks/useDemoMode"; // [NEW]
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Network, PlayCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { OntologyData, OntologyNode, ComparisonResult } from "@/types/ontology";
import { getColorForCategory } from "@/lib/ontology-utils";

// Research Mode Components
import { useResearchMode } from "@/hooks/useResearchMode";
import { EvaluatorLoginDialog } from "@/components/ontology/research/EvaluatorLoginDialog";
import { ConsentScreen } from "@/components/ontology/research/ConsentScreen";
import { ProfileModal } from "@/components/ontology/research/ProfileModal";
import { CalibrationModal } from "@/components/ontology/research/CalibrationModal";

import { DebriefScreen } from "@/components/ontology/research/DebriefScreen";

// Components
import { OntologyMap } from "@/components/ontology/OntologyMap";
import { ConceptList } from "@/components/ontology/ConceptList";
import { MapGallery } from "@/components/ontology/MapGallery";
import { ConceptDetailsModal } from "@/components/ontology/ConceptDetailsModal";
import { ComparisonView } from "@/components/ontology/ComparisonView";
import { generateCasesFromOntology } from "@/lib/study-utils";
import { deleteStudyData } from "@/app/actions/research";

// Static Data (Fallback) - Kept for initial state visualization


const STATIC_CONCEPTS = [
    {
        id: "0",
        label: "Coloniality of Power",
        description: "The living legacy of colonialism in contemporary power structures, defining who has the authority to classify and organize the world.",
        quote: "The coloniality of power is not just a historical event, but a continuous process of ordering the world.",
        category: "Core",
        color: "#fca5a5",
        x: 250, y: 50
    },
    {
        id: "1",
        label: "Algorithmic Rationality",
        description: "The logic by which algorithms order, sort, and prioritize information, often embedding specific cultural and epistemological values.",
        quote: "Algorithms are not neutral tools; they are crystallized forms of rationality.",
        category: "Mechanism",
        color: "#d8b4fe",
        x: 450, y: 150
    },
    {
        id: "2",
        label: "Global South State",
        description: "The political entity situated in the periphery of the world-system, navigating the imposition of external AI norms while asserting sovereignty.",
        quote: "The state in the Global South is not merely a regulator but a site of contestation.",
        category: "Actor",
        color: "#93c5fd",
        x: 50, y: 150
    },
    {
        id: "3",
        label: "Data Extractivism",
        description: "The process of extracting data from human life and turning it into a resource for capital accumulation.",
        quote: "Data is the new oil, but the extraction process leaves behind social pollution.",
        category: "Mechanism",
        color: "#d8b4fe",
        x: 400, y: 300
    },
    {
        id: "4",
        label: "Fundamental Rights",
        description: "The set of ethical and legal principles protected by frameworks like the EU AI Act, often framed as universal but historically situated.",
        quote: "Rights are the language through which power is negotiated and contested.",
        category: "Value",
        color: "#86efac",
        x: 100, y: 300
    },
    {
        id: "5",
        label: "Sociotechnical Assemblage",
        description: "Complex arrangements of humans, machines, norms, and resources that constitute AI systems as loosely coupled, emergently structured entities.",
        quote: "AI is not a thing, but an assemblage of social and technical relations that orchestrate value.",
        category: "Core",
        color: "#fca5a5",
        x: 250, y: 200
    },
] as OntologyNode[];

const STATIC_NETWORK_LINKS = [
    { source: "0", target: "1", relation: "informs" },
    { source: "0", target: "2", relation: "constrains" },
    { source: "0", target: "5", relation: "shapes" },
    { source: "1", target: "3", relation: "enables" },
    { source: "1", target: "5", relation: "structures" },
    { source: "2", target: "4", relation: "protects" },
    { source: "2", target: "5", relation: "regulates" },
    { source: "3", target: "5", relation: "feeds" },
    { source: "4", target: "5", relation: "embedded in" },
];

export default function OntologyPage() {
    const { sources } = useSources();
    const { isReadOnly } = useDemoMode(); // [NEW]
    const [selectedSourceId, setSelectedSourceId] = useServerStorage<string>("ontology_selected_source_id", "");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ontologyMaps, setOntologyMaps] = useServerStorage<Record<string, OntologyData>>("ontology_maps", {});

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
        importState: researchImportState,
        resetStudy: resetStudy,
        completeStudy: completeStudy, // [NEW]
        restoreSession: researchRestoreSession,
        cases: researchCases
    } = useResearchMode();



    const handleNextCase = () => {
        if (!researchState.playlist || !researchCases) return;
        const nextIndex = researchState.currentCaseIndex + 1;
        console.log("handleNextCase", { current: researchState.currentCaseIndex, next: nextIndex, total: researchState.playlist.length });

        // If we are at the end, verify completion and close modal
        if (nextIndex >= researchState.playlist.length) {
            console.log("End of study detected. Completing...");

            // ALWAYS show the debrief screen when finishing, even if previously dismissed
            console.log("Forcing Debrief Display (setIsDebriefDismissed(false))");
            setIsDebriefDismissed(false);

            // Force completion state if not already set (relying on button validation)
            if (!researchState.isComplete) {
                console.log("Calling completeStudy()");
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
        if (confirm("Reset study progress? This will delete all local data and return you to the start.")) {
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

    // ... (rest of component until ConceptDetailsModal) ...


    // Comparison State
    const [isComparing, setIsComparing] = useServerStorage<boolean>("ontology_is_comparing", false);
    const [selectedForComparison, setSelectedForComparison] = useServerStorage<string[]>("ontology_selected_comparison_ids", []);
    const [comparisonResult, setComparisonResult, isComparisonResultLoading] = useServerStorage<ComparisonResult | null>("ontology_comparison_result", null);
    const [isComparingLoading, setIsComparingLoading] = useState(false);

    // Interactivity State
    // [Fix] Isolated storage key for survey to prevent state bleeding from ontology page
    // Switched to useState to prevent 403 errors for anonymous evaluators (read-only)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    type ViewMode = 'all' | 'ghost-network' | 'hide-ghosts';
    const [viewMode, setViewMode] = useState<ViewMode>('all');

    // [Fix] Hydration Mismatch for Radix UI
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {

        setIsMounted(true);
    }, []);

    // Filter sources that have text available for analysis and exclude 'Web' and 'Trace' sources
    const analyzedSources = sources.filter(s => s.extractedText && s.type !== 'Web' && s.type !== 'Trace');

    // Group sources by type for the dropdown
    const groupedSources = useMemo(() => {
        return analyzedSources.reduce((acc, source) => {
            const type = source.type || 'Other';
            if (!acc[type]) acc[type] = [];
            acc[type].push(source);
            return acc;
        }, {} as Record<string, typeof analyzedSources>);
    }, [analyzedSources]);

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

    // Memoize generated cases for both login and import fallback
    const generatedCases = useMemo(() => generateCasesFromOntology(sources, ontologyMaps), [sources, ontologyMaps]);







    const toggleComparisonSelection = (sourceId: string) => {
        if (selectedForComparison.includes(sourceId)) {
            setSelectedForComparison(prev => prev.filter(id => id !== sourceId));
        } else {
            if (selectedForComparison.length < 3) { // Updated limit to 3
                setSelectedForComparison(prev => [...prev, sourceId]);
            }
        }
    };



    // Filtering Logic
    // Filter nodes based on category and view mode
    const displayNodes = currentOntologyData
        ? currentOntologyData.nodes.filter(n => {
            const categoryMatch = !selectedCategory || n.category === selectedCategory;

            // View mode filtering
            let viewMatch = true;
            if (viewMode === 'hide-ghosts') {
                viewMatch = !n.isGhost;
            } else if (viewMode === 'ghost-network') {
                // Show ghost nodes + actors they connect to
                if (n.isGhost) {
                    viewMatch = true;
                } else {
                    // Check if this real node is connected to any ghost node
                    const connectedToGhost = currentOntologyData.nodes.some(ghostNode => {
                        if (!ghostNode.isGhost) return false;
                        return ghostNode.potentialConnections?.some(pc =>
                            pc.targetActor === n.label || n.label.includes(pc.targetActor) || pc.targetActor.includes(n.label)
                        );
                    });
                    viewMatch = connectedToGhost;
                }
            }
            // viewMode === 'all' shows everything

            return categoryMatch && viewMatch;
        })
        : STATIC_CONCEPTS;

    const displayLinks = currentOntologyData
        ? currentOntologyData.links.filter(l => {
            const sourceNode = currentOntologyData.nodes.find(n => n.id === l.source);
            const targetNode = currentOntologyData.nodes.find(n => n.id === l.target);
            if (selectedCategory) {
                return sourceNode?.category === selectedCategory && targetNode?.category === selectedCategory;
            }
            return true;
        })
        : STATIC_NETWORK_LINKS;

    const selectedNode = currentOntologyData
        ? currentOntologyData.nodes.find(n => n.id === selectedNodeId)
        : STATIC_CONCEPTS.find(n => n.id === selectedNodeId);

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
    const [isDebriefDismissed, setIsDebriefDismissed] = useState(false);
    const showDebrief = researchState.isComplete && !isDebriefDismissed;

    console.log("OntologyPage Render", {
        isComplete: researchState.isComplete,
        isDebriefDismissed,
        showDebrief,
        currentCaseIndex: researchState.currentCaseIndex,
        playlistLength: researchState.playlist?.length
    });

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
            await resetStudy();
            window.location.reload();
        }
    };

    // Withdraw Study (Delete all data)
    const handleWithdraw = async () => {
        const code = researchState.evaluatorCode;
        if (confirm("Are you sure you want to withdraw? \n\nThis will PERMANENTLY DELETE all your progress and data from our system.\n\nThis action cannot be undone.")) {
            if (code) {
                await deleteStudyData(code);
            }
            await resetStudy();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-8 relative">


            {/* RESEARCH MODE OVERLAYS */}
            {/* RESEARCH MODE OVERLAYS */}
            <EvaluatorLoginDialog
                isOpen={isLoginOpen}
                onLogin={async (code, cases) => {
                    // Try to restore first
                    const restored = await researchRestoreSession(code);
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

            {/* RESEARCH NAVIGATOR (Visible during assessment) */}
            {researchState.profile && !researchState.isComplete && !showCalibration && (
                <>
                    {/* Centered "Evaluate Current Case" Button floating at bottom if modal closed */}
                    {!selectedNodeId && researchCurrentCase && (

                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-white p-2 rounded-full shadow-lg border border-purple-100 animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <Button
                                size="lg"
                                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-full px-8 h-12 gap-2 text-base font-semibold"
                                onClick={() => {
                                    if (researchCurrentCase) {
                                        setSelectedNodeId(researchCurrentCase.nodeId);
                                    }
                                }}
                            >
                                <Network className="h-5 w-5" />
                                Evaluate Case {researchState.currentCaseIndex + 1}
                            </Button>
                        </div>
                    )}
                </>
            )}


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Network className="h-8 w-8 text-indigo-600" />
                        Survey & Validation
                    </h2>

                    {/* Welcome Section for New Evaluators */}
                    {!researchState.evaluatorCode && (
                        <Card className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Welcome Evaluator</h3>
                                <p className="text-slate-700 mb-4 max-w-3xl">
                                    Thank you for participating in this &quot;ghost node&quot; validation study. You are looking at the network of associations for the selected AI policy document.
                                    Use the drop-down above to select and review other policy documents.
                                    Once you are ready, please enter your designated <strong>Evaluator Code</strong> to load your assigned cases and begin the survey.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Begin Survey
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open('/glossary', '_blank')}
                                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                    >
                                        Review Glossary
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsLoginOpen(true)}
                                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                    >
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Resume survey
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="text-slate-500 mt-2 flex flex-wrap items-center gap-2 text-sm">
                        Visualizing the assemblage:
                        <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 cursor-default">Core</Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 cursor-default">Mechanism</Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 cursor-default">Actor</Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 cursor-default">Value</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">


                    {researchState.evaluatorCode && !researchState.isComplete ? (
                        <>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={handleWithdraw}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Withdraw from study and remove all data
                            </Button>
                        </>
                    ) : null}

                    {!isComparing && (
                        <div className="flex flex-col items-end gap-1.5">
                            <span className="text-base font-bold text-indigo-900">Select a Policy Document</span>
                            {isMounted ? (
                                <Select
                                    value={selectedSourceId || ""}
                                    onValueChange={(val) => {
                                        if (val !== selectedSourceId) {
                                            setSelectedSourceId(val);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-[300px] border-2 border-indigo-600 shadow-md h-11 bg-white">
                                        <SelectValue placeholder="Select a policy to review" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(groupedSources).map(([type, groupSources]) => (
                                            <SelectGroup key={type}>
                                                <SelectLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 pl-2 py-1">
                                                    {type} Sources
                                                </SelectLabel>
                                                {groupSources.map((source) => {
                                                    const dotColor =
                                                        source.type === 'PDF' ? 'bg-red-500' :
                                                            source.type === 'Web' ? 'bg-sky-500' :
                                                                source.type === 'Word' ? 'bg-blue-600' :
                                                                    source.type === 'Trace' ? 'bg-amber-500' :
                                                                        'bg-slate-400';
                                                    return (
                                                        <SelectItem key={source.id} value={source.id}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                                                                <span className="truncate max-w-[200px]" title={source.title}>{source.title}</span>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="w-[280px] h-10 bg-slate-100 rounded-md animate-pulse" />
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* Comparison Result View */}
            {
                isComparing && comparisonResult && (
                    <ComparisonView result={comparisonResult} sources={sources} />
                )
            }

            {/* Main Visualization */}
            {
                !isComparing && (
                    <>
                        {currentOntologyData?.summary && (
                            <Card className="bg-slate-50 border-indigo-100">
                                <CardContent className="pt-6">
                                    <p className="text-slate-700 leading-relaxed">
                                        <span className="font-semibold text-indigo-700">Analysis Summary: </span>
                                        {currentOntologyData.summary}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Ghost Node Statistics */}
                        {currentOntologyData && currentOntologyData.ghostNodeCount && currentOntologyData.ghostNodeCount > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                                <Card className="border-blue-200 bg-blue-50">
                                    <CardContent className="pt-6">
                                        <div className="text-3xl font-bold text-blue-700">
                                            {currentOntologyData.nodes.filter(n => !n.isGhost).length}
                                        </div>
                                        <div className="text-sm text-blue-600 mt-1 font-semibold">Visible Actors</div>
                                        <div className="text-xs text-blue-500 mt-1">Explicitly mentioned organizations and entities</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-purple-200 bg-purple-50">
                                    <CardContent className="pt-6">
                                        <div className="text-3xl font-bold text-purple-700">
                                            {currentOntologyData.ghostNodeCount}
                                        </div>
                                        <div className="text-sm text-purple-600 mt-1 font-semibold">Ghost Nodes</div>
                                        <div className="text-xs text-purple-500 mt-1">Implied or influential but unmentioned actors</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-gray-200 bg-gray-50">
                                    <CardContent className="pt-6">
                                        <div className="text-3xl font-bold text-gray-700">
                                            {currentOntologyData.links.length}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1 font-semibold">Connections</div>
                                        <div className="text-xs text-gray-500 mt-1">Relationships linking actors and concepts</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                {/* Ghost Node Toggle */}
                                {currentOntologyData && currentOntologyData.ghostNodeCount && currentOntologyData.ghostNodeCount > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium text-slate-700">View Mode</div>
                                        <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                                            <SelectTrigger className="w-[280px] bg-purple-50 border-purple-300">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    <div className="flex items-center gap-2">
                                                        <span>🌐</span>
                                                        <div>
                                                            <div className="font-medium">All Actors</div>
                                                            <div className="text-xs text-slate-500">Show complete network</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="ghost-network">
                                                    <div className="flex items-center gap-2">
                                                        <span>👻</span>
                                                        <div>
                                                            <div className="font-medium">Ghost Network Only ({currentOntologyData.ghostNodeCount})</div>
                                                            <div className="text-xs text-slate-500">Absent actors + their connections</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="hide-ghosts">
                                                    <div className="flex items-center gap-2">
                                                        <span>👤</span>
                                                        <div>
                                                            <div className="font-medium">Hide Ghost Nodes</div>
                                                            <div className="text-xs text-slate-500">Only present actors</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <OntologyMap
                                    nodes={displayNodes}
                                    links={displayLinks}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={setSelectedNodeId}
                                    highlightNodeId={researchCurrentCase?.nodeId}
                                />
                            </div>
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h3 className="text-lg font-semibold mb-4">All Actors</h3>
                                        <div className="h-[400px] overflow-y-auto pr-2">
                                            <ConceptList
                                                nodes={displayNodes}
                                                selectedNodeId={selectedNodeId}
                                                onSelectNode={setSelectedNodeId}
                                            />
                                        </div>
                                        <div className="mt-4 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                className="w-full text-xs"
                                                onClick={() => {
                                                    if (selectedCategory) {
                                                        setSelectedCategory(null);
                                                    } else {
                                                        // Cycle through or pick one? Just clear for now if set.
                                                    }
                                                }}
                                            >
                                                {selectedCategory ? "Clear Filter" : "Filter by Category"}
                                            </Button>
                                            {/* Simple Category Chips */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {["Core", "Mechanism", "Actor", "Value"].map(cat => (
                                                    <Badge
                                                        key={cat}
                                                        variant={selectedCategory === cat ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                                    >
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <MapGallery
                                    ontologyMaps={ontologyMaps}
                                    sources={sources}
                                    selectedSourceId={selectedSourceId || ""}
                                    onSelectSource={setSelectedSourceId}
                                    isComparing={isComparing}
                                    selectedForComparison={selectedForComparison}
                                    onToggleComparisonSelection={toggleComparisonSelection}
                                    onCompare={() => setIsComparing(true)}
                                    isComparingLoading={isComparingLoading}
                                    isComparisonResultLoading={false}
                                />
                            </div>
                        </div>
                    </>
                )
            }






            <ConceptDetailsModal
                selectedNode={effectiveSelectedNode}
                isOpen={
                    !!selectedNodeId &&
                    researchState.consentGiven &&
                    !!researchState.profile &&
                    !researchCurrentCase?.isCalibration &&
                    !researchState.isComplete
                }
                onClose={() => setSelectedNodeId(null)}
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

                onSave={handleResearchSave}
                onSuspend={handleSuspend}
                studyState={researchState}
                // Pass derived values directly to avoid modal logic complexity
                currentCaseIndex={researchState.currentCaseIndex}
                totalCases={researchCases ? researchCases.length : (researchState.playlist?.length || 0)}
                isLastCase={researchState.playlist && researchState.currentCaseIndex === researchState.playlist.length - 1}
            />
        </div >
    );
}
