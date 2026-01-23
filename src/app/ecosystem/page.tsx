"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { EcosystemActor, EcosystemConfiguration, AssemblageAnalysis } from "@/types/ecosystem";
import { AssemblageExport } from "@/types/bridge"; // [NEW] Import Data Contract
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { inferActorType } from "@/lib/ecosystem-utils";
import { useRouter, useSearchParams } from "next/navigation"; // [NEW] For Deep Linking

import { useDemoMode } from "@/hooks/useDemoMode";
import { useAssemblageExtraction } from "@/hooks/useAssemblageExtraction";


// Components
import { ActorList } from "@/components/ecosystem/ActorList";
import { EcosystemMap } from "@/components/ecosystem/EcosystemMap";
import { ConfigurationDialog } from "@/components/ecosystem/ConfigurationDialog";
import { AssemblagePanel } from "@/components/ecosystem/AssemblagePanel";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Loader2, LayoutGrid, ArrowLeft, PanelRightOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisMode } from "@/components/ui/mode-selector";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";



function EcosystemContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isReadOnly } = useDemoMode();
    const returnToSynthesis = searchParams.get("returnTo") === "synthesis";
    const mode = searchParams.get("mode");

    // Sources for policy selection
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    const { sources, isLoading: isSourcesLoading } = useSources();
    const [selectedPolicyId, setSelectedPolicyId] = useServerStorage<string | null>(STORAGE_KEYS.ECOSYSTEM_ACTIVE_POLICY, null);
    const policyDocuments = sources.filter(s => s.type !== "Trace");

    // Dynamic Storage Keys using constants
    const actorsKey = STORAGE_KEYS.ECOSYSTEM_ACTORS(selectedPolicyId);
    const configsKey = STORAGE_KEYS.ECOSYSTEM_CONFIGURATIONS(selectedPolicyId);
    const selectedActorKey = STORAGE_KEYS.ECOSYSTEM_SELECTED_ACTOR(selectedPolicyId);
    const absenceKey = STORAGE_KEYS.ECOSYSTEM_ABSENCE_ANALYSIS(selectedPolicyId);

    // Storage Hooks
    const [actors, setActors] = useServerStorage<EcosystemActor[]>(actorsKey, []);
    const [configurations, setConfigurations] = useServerStorage<EcosystemConfiguration[]>(configsKey, []);
    const [selectedActorId, setSelectedActorId] = useServerStorage<string | null>(selectedActorKey, null);

    const [absenceAnalysis, setAbsenceAnalysis] = useServerStorage<AssemblageAnalysis | null>(absenceKey, null);

    // Config Layout State (for dragging)
    const [configLayout, setConfigLayout] = useState<Record<string, { x: number, y: number }>>({});

    // Layout State
    const [activeTab, setActiveTab] = useState("actors");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);


    const [interactionMode, setInteractionMode] = useState<"drag" | "select">("drag");
    const [selectedForGrouping, setSelectedForGrouping] = useState<string[]>([]);
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [newConfigName, setNewConfigName] = useState("");
    const [newConfigDesc, setNewConfigDesc] = useState("");
    const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null); // Unification State

    // Extraction State
    const [isExtractionDialogOpen, setIsExtractionDialogOpen] = useState(false);
    const [extractionText, setExtractionText] = useState("");
    const [discoveryQuery, setDiscoveryQuery] = useState("");
    const [extractionMode, setExtractionMode] = useState<"text" | "discovery">("text");
    // const [isExtracting, setIsExtracting] = useState(false); // Managed by hook

    // Theoretical Analysis Mode
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("hybrid_reflexive");

    // View & Filter State
    const [colorMode, setColorMode] = useState<"type" | "epistemic">("type");
    const [filterType, setFilterType] = useState<EcosystemActor["type"] | "All">("All");

    const filteredActors = useMemo(() => actors.filter(actor =>
        filterType === "All" ? true : actor.type === filterType
    ), [actors, filterType]);



    // Graph interaction state
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [mounted, setMounted] = useState(false);

    // Link Enrichment State
    const [isEnriching, setIsEnriching] = useState(false);
    const [enrichProgress, setEnrichProgress] = useState(0);

    const handleEnrichLinks = async () => {
        if (!actors || actors.length === 0) return;

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setIsTopUpOpen(true);
            return;
        }

        setIsEnriching(true);
        setEnrichProgress(0);

        const actorsToEnrich = actors.filter(a => !a.url);
        const total = actorsToEnrich.length;
        let processed = 0;
        const updatedActors = [...actors];

        // Process in batches of 3 to avoid rate limits
        const BATCH_SIZE = 3;

        try {
            for (let i = 0; i < total; i += BATCH_SIZE) {
                const batch = actorsToEnrich.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async (actor) => {
                    try {
                        const response = await fetch('/api/enrich-actor', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                actorName: actor.name,
                                context: actor.type === 'Policymaker' ? 'government ministry' : 'official website, home page'
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.url) {
                                const index = updatedActors.findIndex(a => a.id === actor.id);
                                if (index !== -1) {
                                    updatedActors[index] = { ...updatedActors[index], url: data.url };
                                }
                                refetchCredits();
                            }
                        }
                    } catch (err) {
                        console.warn(`Failed to enrich ${actor.name}`, err);
                    }
                }));

                processed += batch.length;
                setEnrichProgress(Math.round((processed / total) * 100));

                // Update text as we go
                setActors([...updatedActors]);
            }
        } catch (error) {
            console.error("Enrichment failed", error);
            alert("Failed to complete link enrichment.");
        } finally {
            setIsEnriching(false);
            setEnrichProgress(0);
        }
    };

    // Graph Effects
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setPositions(prev => {
            const newPositions = { ...prev };
            let hasChanges = false;
            actors.forEach((actor, i) => {
                if (!newPositions[actor.id]) {
                    // Start in circle layout but allow drag to override
                    const totalActors = actors.length;
                    const angle = (i / totalActors) * 2 * Math.PI;
                    const centerX = 350;
                    const centerY = 200;
                    const radius = 120;
                    newPositions[actor.id] = {
                        x: centerX + radius * Math.cos(angle),
                        y: centerY + radius * Math.sin(angle)
                    };
                    hasChanges = true;
                }
            });
            return hasChanges ? newPositions : prev;
        });
        // Depend on actors to re-run layout for new actors
    }, [actors]);

    // [NEW] Deep Linking Initialization
    useEffect(() => {
        const sourceIdParam = searchParams.get("sourceId");
        if (sourceIdParam && sourceIdParam !== selectedPolicyId) {
            console.log("Deep Link: Setting Policy ID", sourceIdParam);
            setSelectedPolicyId(sourceIdParam);
        }

        const modeParam = searchParams.get("mode");
        if (modeParam === 'discovery') {
            setExtractionMode('discovery');
            setIsExtractionDialogOpen(true);
        } else if (modeParam === 'text' || modeParam === 'extraction') {
            setExtractionMode('text');
            setIsExtractionDialogOpen(true);
        }
    }, [searchParams, selectedPolicyId, setSelectedPolicyId, setExtractionMode, setIsExtractionDialogOpen]);

    // Handlers



    // Extraction Hook
    const { isExtracting, extractAssemblage } = useAssemblageExtraction({
        isReadOnly,
        hasCredits,
        creditsLoading,
        setIsTopUpOpen
    });

    const handleExtractAssemblage = async () => {
        const input = extractionMode === 'text' ? extractionText : discoveryQuery;
        const result = await extractAssemblage(extractionMode, input);

        if (result.success && result.newActors && result.memberIds && result.newConfig) {
            setActors(prev => [...prev, ...result.newActors!]);

            // Assign Positions
            setPositions(prev => {
                const nextPos = { ...prev };
                result.newActors!.forEach(actor => {
                    nextPos[actor.id] = { x: Math.random() * 600 + 100, y: Math.random() * 300 + 50 };
                });
                return nextPos;
            });

            setConfigurations(prev => [...prev, result.newConfig!]);
            setSelectedConfigId(result.newConfig.id);
            setActiveTab("analysis");
            setIsSidebarOpen(true);

            setIsExtractionDialogOpen(false);
            setExtractionText("");
            setDiscoveryQuery("");
        }
    };

    const handleClearAll = () => {
        setActors([]);
        setConfigurations([]);
        setSelectedActorId(null);

        setPositions({});
        setSelectedForGrouping([]);
    };



    const handleCreateConfiguration = () => {
        console.log("Create Configuration Clicked. Selected actors:", selectedForGrouping.length);
        if (selectedForGrouping.length < 2) {
            alert("Select at least 2 actors.");
            return;
        }
        setIsConfigDialogOpen(true);
    };

    const confirmCreateConfiguration = () => {
        const newConfig: EcosystemConfiguration = {
            id: crypto.randomUUID(),
            name: newConfigName || "New Configuration",
            description: newConfigDesc || "A unified entity of actors.",
            memberIds: selectedForGrouping,
            properties: { stability: "Medium", generativity: "Medium" },
            color: `hsl(${Math.random() * 360}, 70%, 85%)`
        };

        setConfigurations(prev => [...prev, newConfig]);
        setSelectedConfigId(newConfig.id); // [FIX] Auto-select for export
        setIsConfigDialogOpen(false);
        setNewConfigName("");
        setNewConfigDesc("");
        setSelectedForGrouping([]);
        setInteractionMode("drag");
        setActiveTab("analysis");
        setIsSidebarOpen(true);
    };

    const toggleSelection = (actorId: string) => {
        setSelectedForGrouping(prev => {
            const isSelected = prev.includes(actorId);
            return isSelected ? prev.filter(id => id !== actorId) : [...prev, actorId];
        });
    };

    const handleActorDrag = (actorId: string, x: number, y: number) => {
        setPositions(prev => ({ ...prev, [actorId]: { x, y } }));
    };

    const handleConfigDrag = (configId: string, dx: number, dy: number) => {
        setConfigLayout(prev => {
            const current = prev[configId] || { x: 0, y: 0 };
            return {
                ...prev,
                [configId]: {
                    x: current.x + dx,
                    y: current.y + dy
                }
            };
        });
    };

    const handleConfigClick = (configId: string) => {
        setSelectedConfigId(configId);
        setActiveTab("analysis");
        setIsSidebarOpen(true);
    };

    const handleDeleteConfiguration = (configId: string) => {
        setConfigurations(prev => prev.filter(c => c.id !== configId));
        if (selectedConfigId === configId) {
            setSelectedConfigId(null);
            setActiveTab("actors");
        }
    };

    const toggleLayer = (layer: string) => {
        setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({ resistance: false });

    if (!mounted) return null;

    if (isSourcesLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }




    return (
        <div className="flex flex-col h-full gap-4 relative isolate">
            <CreditTopUpDialog
                open={isTopUpOpen}
                onOpenChange={setIsTopUpOpen}
                onSuccess={() => refetchCredits()}
            />

            {/* NEW: Map Background Layer */}
            {!selectedPolicyId ? (
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-12">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Network className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Policy Selected</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Please select a policy document above to visualize the actors, assemblages, and cultural absences specific to that context.
                        </p>
                        {/* Policy Selector as Floating Card for Empty State */}
                        <div className="mt-8 max-w-xs mx-auto text-left">
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardContent className="p-4">
                                    <Select
                                        value={selectedPolicyId || ""}
                                        onValueChange={async (val) => {
                                            if (!selectedPolicyId && actors.length > 0) {
                                                const confirmMigrate = window.confirm("You have actors in the scratchpad. Do you want to move them to this policy?");
                                                if (confirmMigrate) {
                                                    try {
                                                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                                                        if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                                                            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
                                                        }
                                                        await Promise.all([
                                                            fetch('/api/storage', { method: 'POST', headers, body: JSON.stringify({ key: `ecosystem_actors_${val}`, value: actors }) }),
                                                            fetch('/api/storage', { method: 'POST', headers, body: JSON.stringify({ key: `ecosystem_configurations_${val}`, value: configurations }) })
                                                        ]);
                                                    } catch (err) { console.error("Migration failed:", err); }
                                                }
                                            }
                                            setSelectedPolicyId(val);
                                        }}
                                    >
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue placeholder="Select a policy document..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {policyDocuments.map(doc => (
                                                <SelectItem key={doc.id} value={doc.id}>{doc.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Full Screen Map Container */}
                    <div className="absolute inset-0 z-0 bg-slate-50 overflow-hidden">
                        {/* Map is always rendered if policy is selected */}
                        <EcosystemMap
                            isReadOnly={isReadOnly}
                            actors={filteredActors}
                            configurations={configurations}
                            positions={positions}
                            interactionMode={interactionMode}
                            setInteractionMode={setInteractionMode}
                            selectedForGrouping={selectedForGrouping}
                            onToggleSelection={toggleSelection}
                            onCreateConfiguration={handleCreateConfiguration}
                            onActorDrag={handleActorDrag}
                            onConfigDrag={handleConfigDrag}
                            onDeleteConfiguration={handleDeleteConfiguration}
                            selectedConfigId={selectedConfigId}
                            activeLayers={activeLayers}
                            toggleLayer={toggleLayer}
                            colorMode={colorMode}
                            onConfigClick={handleConfigClick}
                            absenceAnalysis={absenceAnalysis}
                            analysisMode={analysisMode}
                            setAnalysisMode={setAnalysisMode}
                            configLayout={configLayout}
                            onConfigSelect={setSelectedConfigId}
                            extraToolbarContent={
                                <div className="flex items-center gap-2">
                                    <div className="w-[180px]">
                                        <Select
                                            value={selectedPolicyId || ""}
                                            onValueChange={(val) => setSelectedPolicyId(val)}
                                        >
                                            <SelectTrigger className="h-7 text-xs border-transparent bg-transparent hover:bg-slate-200 focus:ring-0">
                                                <SelectValue placeholder="Policy..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {policyDocuments.map(doc => (
                                                    <SelectItem key={doc.id} value={doc.id}>{doc.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {!isSidebarOpen && (
                                        <>
                                            <div className="w-px h-3 bg-slate-300 mx-0.5" />
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-xs font-medium gap-1.5 text-slate-500 hover:text-slate-900"
                                                            onClick={() => setIsSidebarOpen(true)}
                                                        >
                                                            <PanelRightOpen className="h-4 w-4" />
                                                            Open Panel
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Open Analysis Panel</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </>
                                    )}
                                </div>
                            }
                        />
                    </div>

                    {/* Floating Windows (Draggable) */}

                    {/* Consolidated Right Sidebar */}
                    <div className={`transition-all duration-300 border-l border-slate-200 bg-white flex flex-col shadow-xl z-20 shrink-0 h-full ${!isSidebarOpen
                        ? "w-0 border-0 overflow-hidden opacity-0"
                        : isSidebarExpanded
                            ? "w-[800px] opacity-100"
                            : "w-[400px] opacity-100"
                        }`}>
                        <div className="p-2 border-b border-slate-100 bg-white">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full grid grid-cols-2">
                                    <TabsTrigger value="actors">Actors</TabsTrigger>
                                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                                </TabsList>
                                <div className="mt-2 h-[calc(100vh-135px)] overflow-hidden">
                                    <TabsContent value="actors" className="h-full m-0 p-0 border-0 outline-none data-[state=active]:flex flex-col">
                                        <div className="h-full overflow-y-auto">
                                            <ActorList
                                                actors={actors}
                                                selectedActorId={selectedActorId}
                                                onSelectActor={setSelectedActorId}
                                                onClearAll={handleClearAll}
                                                isExpanded={isSidebarExpanded}
                                                onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                                isExtracting={isExtracting}
                                                extractionText={extractionText}
                                                setExtractionText={setExtractionText}
                                                onExtract={handleExtractAssemblage}
                                                isExtractionDialogOpen={isExtractionDialogOpen}
                                                setIsExtractionDialogOpen={setIsExtractionDialogOpen}
                                                onClose={() => setIsSidebarOpen(false)}
                                                discoveryQuery={discoveryQuery}
                                                setDiscoveryQuery={setDiscoveryQuery}
                                                extractionMode={extractionMode}
                                                setExtractionMode={setExtractionMode}
                                                // Link Enrichment
                                                onEnrichLinks={handleEnrichLinks}
                                                isEnriching={isEnriching}
                                                enrichProgress={enrichProgress}
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="analysis" className="h-full m-0 p-0 border-0 outline-none data-[state=active]:flex flex-col">
                                        <div className="h-full overflow-y-auto">
                                            <AssemblagePanel
                                                actors={actors}
                                                analyzedText={extractionText}
                                                savedAnalysis={selectedConfigId ? configurations.find(c => c.id === selectedConfigId)?.analysisData : absenceAnalysis}
                                                onSaveAnalysis={(analysis) => {
                                                    if (selectedConfigId) {
                                                        setConfigurations(prev => prev.map(c => c.id === selectedConfigId ? { ...c, analysisData: analysis } : c));
                                                    } else {
                                                        setAbsenceAnalysis(analysis);
                                                    }
                                                }}
                                                onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                                isExpanded={isSidebarExpanded}
                                                selectedConfig={configurations.find(c => c.id === selectedConfigId)}
                                                onClose={() => setIsSidebarOpen(false)}
                                                onUpdateConfig={(updatedConfig) => {
                                                    setConfigurations(prev => prev.map(c => c.id === updatedConfig.id ? updatedConfig : c));
                                                }}
                                                onUpdateActors={setActors}
                                            />
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>

                    {/* 3. Assemblage Compass (Optional - could be another Tab or Window) */}
                    {/* Currently integrated into AssemblagePanel or separate - leaving as is or making separate window?
                    The original tabs logic suggested 'Compass' as a tab. 
                    Let's create a separate toggle for Compass Window if needed, 
                    OR assume user opens it via menu. For now, sticking to the main 2 panels.
                */}


                    {/* Dialogs */}
                    <ConfigurationDialog
                        isOpen={isConfigDialogOpen}
                        onClose={() => setIsConfigDialogOpen(false)}
                        name={newConfigName}
                        setName={setNewConfigName}
                        description={newConfigDesc}
                        setDescription={setNewConfigDesc}
                        onConfirm={confirmCreateConfiguration}
                    />

                    {/* [NEW] Return Path for Deep Linking */}
                    {returnToSynthesis && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center gap-2"
                                disabled={isReadOnly}
                                title={isReadOnly ? "Export disabled in Demo Mode" : ""}
                                onClick={() => {
                                    // Validation: Check for Policy
                                    if (!selectedPolicyId) return;

                                    let exportData: AssemblageExport | null = null;

                                    if (selectedConfigId) {
                                        // Case A: Export Selected Configuration
                                        const config = configurations.find(c => c.id === selectedConfigId);
                                        if (config) {
                                            exportData = {
                                                id: config.id,
                                                policyId: selectedPolicyId,
                                                generatedAt: new Date().toISOString(),
                                                version: 1,
                                                status: 'draft',
                                                analyst: { id: 'current-user', positionality: 'Analyst' },
                                                nodes: actors.filter(a => config.memberIds.includes(a.id)),
                                                impactNarrative: {
                                                    summary: config.description,
                                                    constraints: config.analysisData?.impacts?.filter((i: any) => i.type?.toLowerCase() === 'constraint').map((i: any) => i.description) || [],
                                                    affordances: config.analysisData?.impacts?.filter((i: any) => i.type?.toLowerCase() === 'affordance').map((i: any) => i.description) || [],
                                                    provenance: 'ecosystem_generated'
                                                },
                                                topology: {
                                                    territorializationScore: Number(config.properties.territorialization_score) || 5,
                                                    codingIntensityScore: Number(config.properties.coding_intensity_score) || 5
                                                }
                                            };
                                        }
                                    } else if (absenceAnalysis) {
                                        // Case B: Export Global Analysis (Absence/Trace Analysis)

                                        exportData = {
                                            id: `global-${selectedPolicyId}`,
                                            policyId: selectedPolicyId,
                                            generatedAt: new Date().toISOString(),
                                            version: 1,
                                            status: 'draft',
                                            analyst: { id: 'current-user', positionality: 'Analyst' },
                                            nodes: actors,
                                            impactNarrative: {
                                                summary: absenceAnalysis.assemblage?.description || absenceAnalysis.narrative || "Global Assemblage Analysis",
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                constraints: absenceAnalysis.impacts?.filter((i: any) => i.type?.toLowerCase() === 'constraint').map((i: any) => i.description) || [],
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                affordances: absenceAnalysis.impacts?.filter((i: any) => i.type?.toLowerCase() === 'affordance').map((i: any) => i.description) || [],
                                                provenance: 'ecosystem_generated'
                                            },
                                            topology: {
                                                territorializationScore: Number(absenceAnalysis.assemblage?.properties?.territorialization_score) || 5,
                                                codingIntensityScore: Number(absenceAnalysis.assemblage?.properties?.coding_intensity_score) || 5
                                            }
                                        };
                                    }

                                    if (exportData) {
                                        sessionStorage.setItem(`assemblage_export_${selectedPolicyId}`, JSON.stringify(exportData));
                                        console.log("Export Saved:", exportData);
                                        router.push("/synthesis");
                                    } else {
                                        alert("No assemblage analysis found. Please run 'Trace Inscriptions' or create a configuration first.");
                                    }
                                }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Save & Return to Synthesis
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function EcosystemPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        }>
            <EcosystemContent />
        </Suspense>
    );
}
