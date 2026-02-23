"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { EcosystemActor, EcosystemConfiguration, AssemblageAnalysis } from "@/types/ecosystem";
import { generateGhostId, mergeGhostNodes } from "@/lib/ecosystem-utils";
import { AssemblageExport } from "@/types/bridge"; // [NEW] Import Data Contract
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation"; // [NEW] For Deep Linking

import { useDemoMode } from "@/hooks/useDemoMode";
import { useAssemblageExtraction } from "@/hooks/useAssemblageExtraction";
import { GhostNode } from "@/types";
import { useWorkspace } from "@/providers/WorkspaceProvider"; // [NEW] Workspace Context


// Components
import { ActorList } from "@/components/ecosystem/ActorList";
import { EcosystemMap } from "@/components/ecosystem/EcosystemMap";
import { ConfigurationDialog } from "@/components/ecosystem/ConfigurationDialog";
import { toast } from "sonner";
import { AssemblagePanel } from "@/components/ecosystem/AssemblagePanel";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Loader2, ArrowLeft, PanelRightOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisMode } from "@/components/ui/mode-selector";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog";
import { useCredits } from "@/hooks/useCredits";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActorCard } from '@/components/ecosystem/ActorCard';
import { ConceptDetailsModal } from "@/components/ontology/ConceptDetailsModal";



function EcosystemContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isReadOnly } = useDemoMode();
    const { currentWorkspaceId } = useWorkspace(); // [NEW] Workspace ID
    const returnToSynthesis = searchParams.get("returnTo") === "synthesis";
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
    const [ontologyMaps] = useServerStorage<Record<string, import("@/types/ontology").OntologyData>>("ontology_maps", {});


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
    const [selectedConfigIds, setSelectedConfigIds] = useState<string[]>([]); // Unification State (Multi-Select)

    // Extraction State
    const [isExtractionDialogOpen, setIsExtractionDialogOpen] = useState(false);
    const [extractionText, setExtractionText] = useState("");
    // const [isExtracting, setIsExtracting] = useState(false); // Managed by hook

    // Theoretical Analysis Mode
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("hybrid_reflexive");

    // View & Filter State
    const [colorMode, setColorMode] = useState<"type" | "epistemic">("type");
    const [filterType, setFilterType] = useState<EcosystemActor["type"] | "All">("All");





    // Graph interaction state
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [mounted, setMounted] = useState(false);

    const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({ resistance: false });

    // Link Enrichment State
    const [isEnriching, setIsEnriching] = useState(false);
    const [enrichProgress, setEnrichProgress] = useState(0);

    // [NEW] ANT Workbench State
    const [collapsedAssemblages, setCollapsedAssemblages] = useState<Set<string>>(new Set());
    const [tracedActorId, setTracedActorId] = useState<string | null>(null);

    const handleToggleCollapse = (id: string) => {
        setCollapsedAssemblages(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

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
                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                        if (currentWorkspaceId) headers['x-workspace-id'] = currentWorkspaceId;

                        const response = await fetch('/api/enrich-actor', {
                            method: 'POST',
                            headers,
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
        if (modeParam === 'text' || modeParam === 'extraction') {
            setIsExtractionDialogOpen(true);
        }
    }, [searchParams, selectedPolicyId, setSelectedPolicyId, setIsExtractionDialogOpen]);

    // [v2.0 Spec] Fetch Ghost Nodes from Unified Catalog
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [mergedVoices, setMergedVoices] = useState<any[]>([]);
    const [isGhostNodesLoading, setIsGhostNodesLoading] = useState(!!selectedPolicyId);

    useEffect(() => {
        if (!selectedPolicyId) {
            setMergedVoices([]);
            setIsGhostNodesLoading(false);
            return;
        }

        const fetchGhostNodes = async () => {
            setIsGhostNodesLoading(true);
            try {
                const headers: HeadersInit = {};
                if (currentWorkspaceId) headers['x-workspace-id'] = currentWorkspaceId;

                const res = await fetch(`/api/ghost-nodes/${selectedPolicyId}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.ghostNodes) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setMergedVoices(data.ghostNodes.map((gn: any) => {
                            const catalogId = gn.fingerprint || gn.id;
                            const reason = (gn.evidence && gn.evidence.length > 0) ? gn.evidence[0].rationale : (gn.description || gn.whyAbsent || 'Structurally absent actor');
                            return {
                                ...gn, // [NEW] Preserve full object for rich modal display
                                id: catalogId.startsWith('ghost-') ? catalogId : `ghost-${catalogId}`,
                                name: gn.name || gn.label,
                                description: gn.description || '',
                                type: `Missing Voice (${gn.status || 'proposed'})`,
                                ghostReason: reason,
                                // [NEW] Shim for V2 Analytical UI consistency
                                evidenceQuotes: gn.evidenceQuotes || (gn.evidence && gn.evidence.length > 0 ? gn.evidence.map((e: { quote?: string; rationale: string; context?: string }) => ({
                                    quote: e.quote || e.rationale,
                                    actors: [gn.name || gn.label],
                                    sourceRef: e.context || selectedPolicyId || 'Document Evidence'
                                })) : []),
                                claim: gn.claim || {
                                    summaryBullets: gn.description ? [gn.description] : ["Actor identified as structurally absent from the policy document."],
                                    disambiguations: [],
                                    fullReasoning: reason
                                }
                            };
                        }));
                        console.log(`[Ecosystem] Loaded ${data.ghostNodes.length} unified ghost nodes for policy ${selectedPolicyId}`);
                    }
                } else {
                    console.warn(`[Ecosystem] Ghost Node API returned ${res.status}`);
                }
            } catch (err) {
                console.error("[Ecosystem] Failed to fetch unified ghost nodes:", err);
            } finally {
                setIsGhostNodesLoading(false);
            }
        };
        fetchGhostNodes();
    }, [selectedPolicyId, currentWorkspaceId]); // Keep deps to re-trigger if needed

    // [NEW] Centralized Data Merging
    const displayedActors = useMemo(() => {
        return mergeGhostNodes(actors, mergedVoices);
    }, [actors, mergedVoices]);

    const filteredActors = useMemo(() => displayedActors.filter(actor =>
        filterType === "All" ? true : actor.type === filterType
    ), [displayedActors, filterType]);

    // [NEW] Separate useEffect for tracing once actors are loaded
    useEffect(() => {
        const traceParam = searchParams.get("trace");

        // Wait until sources are loaded and we have either standard actors or absence data
        if (traceParam && !isSourcesLoading && !isGhostNodesLoading && (actors.length > 0 || absenceAnalysis || selectedConfigIds.length > 0 || mergedVoices.length > 0)) {
            // Robust decoding: handle potential double-encoding or raw URI components
            let decodedTrace = traceParam;
            try {
                decodedTrace = decodeURIComponent(traceParam);
                // Try a second decode just in case it was double encoded by Next router
                if (decodedTrace.includes('%')) {
                    decodedTrace = decodeURIComponent(decodedTrace);
                }
            } catch (e) {
                console.warn("Could not decode trace param:", traceParam);
            }

            // [ROBUST MATCHING] Aggressive normalization for name matching
            const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            const targetNorm = normalize(decodedTrace);

            // Try ID match first (exact)
            let matchedActor = actors.find(a => a.id === traceParam || a.id === decodedTrace);
            let matchedGhost = mergedVoices.find(v => v.id === traceParam || v.id === decodedTrace || (v.fingerprint === decodedTrace));

            // Then try normalized name match on standard actors
            if (!matchedActor && !matchedGhost) {
                matchedActor = actors.find(a => normalize(a.name) === targetNorm);
            }

            // Then try normalized name match on Ghost Nodes
            if (!matchedActor && !matchedGhost) {
                matchedGhost = mergedVoices.find(v => normalize(v.name) === targetNorm);
            }

            // Determine the final ID to trace (align with ecosystem-utils 'ghost-' prefix mapping)
            const finalTraceId = matchedActor?.id || (matchedGhost ? (matchedGhost.id.startsWith('ghost-') ? matchedGhost.id : `ghost-${matchedGhost.id}`) : null);
            const finalTraceName = matchedActor?.name || matchedGhost?.name;

            if (finalTraceId) {
                if (finalTraceId !== tracedActorId) {
                    console.log("Deep Link: Tracing Actor", finalTraceName, "ID:", finalTraceId);
                    setTracedActorId(finalTraceId);
                    setIsSidebarOpen(true);
                    setActiveTab("actors");
                }
            } else if (targetNorm.length > 0) {
                // If we have a target but no match, only toast error if loading is truly finished
                if (!isGhostNodesLoading && !isSourcesLoading) {
                    toast.error(`Trace failed: Target [${decodedTrace}] not found.`);
                    console.warn("Invalid trace parameter:", traceParam, " Decoded:", decodedTrace, " Normalized:", targetNorm);
                    // Proactively try to log what we HAVE so we can see why it failed
                    console.log("[Ecosystem] Available actors:", actors.length, "Available Ghosts:", mergedVoices.length);
                }
            }
        } else if (!traceParam && tracedActorId) {
            // Clear trace if URL param is removed
            setTracedActorId(null);
        }
    }, [searchParams, actors, isSourcesLoading, isGhostNodesLoading, tracedActorId, absenceAnalysis, selectedConfigIds, configurations, mergedVoices]);

    // [NEW] Sync tracedActorId state BACK to the URL for shareability and state consistency
    useEffect(() => {
        if (!mounted) return;

        const currentTrace = searchParams.get("trace");
        const targetName = tracedActorId ? (displayedActors.find(a => a.id === tracedActorId)?.name) : null;

        if (tracedActorId && targetName) {
            if (currentTrace !== targetName) {
                const params = new URLSearchParams(window.location.search);
                params.set("trace", targetName); // URLSearchParams handles encoding
                router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
            }
        } else if (!tracedActorId && currentTrace) {
            const params = new URLSearchParams(window.location.search);
            params.delete("trace");
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }
    }, [tracedActorId, displayedActors, searchParams, router, mounted]);


    // Handlers



    // Extraction Hook
    const { isExtracting, extractAssemblage } = useAssemblageExtraction({
        isReadOnly,
        hasCredits,
        creditsLoading,
        setIsTopUpOpen
    });

    const handleExtractAssemblage = async () => {
        const result = await extractAssemblage('text', extractionText);

        if (result.success && result.newActors) {
            // Only add actors to the graph, don't create an assemblage automatically
            setActors(prev => [...prev, ...result.newActors!]);

            // Assign Positions
            setPositions(prev => {
                const nextPos = { ...prev };
                result.newActors!.forEach(actor => {
                    nextPos[actor.id] = { x: Math.random() * 600 + 100, y: Math.random() * 300 + 50 };
                });
                return nextPos;
            });

            // Don't create assemblage automatically - user can use "Suggest Assemblage" feature
            // or manually select actors to create configurations

            setIsExtractionDialogOpen(false);
            setExtractionText("");
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
        setSelectedConfigIds([newConfig.id]); // [FIX] Auto-select for export
        setIsConfigDialogOpen(false);
        setNewConfigName("");
        setNewConfigDesc("");
        setSelectedForGrouping([]);
        setInteractionMode("drag");
        setActiveTab("analysis");
        setIsSidebarOpen(true);
    };

    const toggleSelection = (actorId: string) => {
        if (interactionMode === "select") {
            setSelectedForGrouping(prev =>
                prev.includes(actorId) ? prev.filter(id => id !== actorId) : [...prev, actorId]
            );
        } else {
            // [CHANGED] Do NOT open sidebar. Just select for modal.
            setSelectedActorId(prev => prev === actorId ? null : actorId);
            // if (selectedActorId !== actorId) {
            //    setActiveTab("actors");
            //    setIsSidebarOpen(true);
            // }
        }
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

    const handleConfigClick = (configId: string, multi: boolean = false) => {
        setSelectedConfigIds(prev => {
            if (multi) {
                return prev.includes(configId) ? prev.filter(id => id !== configId) : [...prev, configId];
            }
            // [CHANGED] Toggle logic for single selection: If clicking active one, deselect it.
            return prev.includes(configId) && prev.length === 1 ? [] : [configId];
        });
        // Only open sidebar if we are selecting something
        if (!selectedConfigIds.includes(configId)) {
            setActiveTab("analysis");
            setIsSidebarOpen(true);
        }
    };

    const handleDeleteConfiguration = (configId: string) => {
        setConfigurations(prev => {
            const newList = prev.filter(c => c.id !== configId);
            return newList;
        });

        if (selectedConfigIds.includes(configId)) {
            setSelectedConfigIds(prev => prev.filter(id => id !== configId));
            if (selectedConfigIds.length <= 1) setActiveTab("actors");
        }
    };

    const toggleLayer = (layer: string) => {
        setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    };



    const handleListSelectionToggle = (actorId: string) => {
        setSelectedForGrouping(prev => prev.includes(actorId) ? prev.filter(x => x !== actorId) : [...prev, actorId]);
    };

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
            {/* [NEW] Centered Actor Detail Modal */}
            <Dialog open={!!selectedActorId} onOpenChange={(open) => !open && setSelectedActorId(null)}>
                <DialogContent className={cn(
                    "max-h-[90vh] overflow-y-auto border-none bg-transparent shadow-none p-0",
                    selectedActorId?.startsWith('ghost-') || mergedVoices.find(v => v.id === selectedActorId)
                        ? "sm:max-w-4xl"
                        : "sm:max-w-md"
                )}>
                    {selectedActorId && (() => {
                        const standardActor = actors.find(a => a.id === selectedActorId);
                        const ghostNode = mergedVoices.find(v => v.id === selectedActorId);

                        /* eslint-disable @typescript-eslint/no-explicit-any */
                        if (ghostNode || (standardActor && (standardActor.source === 'absence_fill' || (standardActor as any).isGhost))) {
                            const rawNode = ghostNode || standardActor;

                            // [NEW] Robust shim for V2 UI components in the modal
                            const node = {
                                ...rawNode,
                                claim: (rawNode as any).claim || {
                                    fullReasoning: (rawNode as any).rationale || (rawNode as any).whyAbsent || (rawNode as any).description || 'No rationale available.'
                                },
                                evidenceQuotes: (rawNode as any).evidenceQuotes || ((rawNode as any).evidence && (rawNode as any).evidence.length > 0 ? (rawNode as any).evidence.map((e: any) => ({
                                    quote: e.quote || e.rationale,
                                    actors: [rawNode!.name || (rawNode as any).label],
                                    sourceRef: e.context || selectedPolicyId || 'Document Evidence'
                                })) : [])
                            };

                            return (
                                <ConceptDetailsModal
                                    selectedNode={{
                                        id: node!.id,
                                        label: node!.name,
                                        category: "Actor",
                                        isGhost: true,
                                        ...node
                                    } as any}
                                    isActive={true}
                                    onClose={() => setSelectedActorId(null)}
                                    sourceId={selectedPolicyId || undefined}
                                />
                            );
                        }
                        /* eslint-enable @typescript-eslint/no-explicit-any */

                        if (standardActor) {
                            return (
                                <div className="bg-white rounded-lg p-6 pt-12 relative overflow-hidden">
                                    <DialogHeader className="mb-4">
                                        <DialogTitle>Actor Details</DialogTitle>
                                        <DialogDescription>
                                            Examining actor properties and assemblage memberships.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ActorCard
                                        actor={standardActor}
                                        isSelected={true}
                                        isGroupSelected={selectedForGrouping.includes(selectedActorId)}
                                        onSelect={() => { }}
                                        onToggleGroupSelection={() => handleListSelectionToggle(selectedActorId)}
                                        configurations={configurations}
                                    />
                                </div>
                            );
                        }

                        return null;
                    })()}
                </DialogContent>
            </Dialog>

            <CreditTopUpDialog
                open={isTopUpOpen}
                onOpenChange={setIsTopUpOpen}
                onSuccess={() => refetchCredits()}
            />

            {/* Configuration Dialog for Manual Assemblage Creation */}
            <ConfigurationDialog
                isOpen={isConfigDialogOpen}
                onClose={() => setIsConfigDialogOpen(false)}
                name={newConfigName}
                setName={setNewConfigName}
                description={newConfigDesc}
                setDescription={setNewConfigDesc}
                onConfirm={confirmCreateConfiguration}
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
                                                        if (currentWorkspaceId) headers['x-workspace-id'] = currentWorkspaceId;
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
                                        }
                                        }
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
                <div className="flex-1 flex flex-row min-h-0 relative">
                    {/* Full Screen Map Container */}
                    <div className="flex-1 relative bg-slate-50 overflow-hidden">
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
                            selectedConfigIds={selectedConfigIds}
                            activeLayers={activeLayers}
                            toggleLayer={toggleLayer}
                            colorMode={colorMode}
                            onConfigClick={handleConfigClick}
                            onClearConfig={() => setSelectedConfigIds([])}
                            analysisMode={analysisMode}
                            setAnalysisMode={setAnalysisMode}
                            configLayout={configLayout}
                            onConfigSelect={(id) => handleConfigClick(id, true)}
                            // [NEW] ANT Props
                            collapsedIds={collapsedAssemblages}
                            tracedId={tracedActorId}
                            onToggleCollapse={handleToggleCollapse}
                            selectedActorId={selectedActorId}
                            // [FIX] Merge missing_voices from selected assemblage, global absence analysis, AND ontology
                            absenceAnalysis={(() => {
                                const selectedAnalysis = selectedConfigIds.length === 1
                                    ? configurations.find(c => c.id === selectedConfigIds[0])?.analysisData
                                    : null;

                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const baseAnalysis = selectedAnalysis || absenceAnalysis || { missing_voices: [] } as any;

                                return {
                                    ...baseAnalysis,
                                    missing_voices: mergedVoices
                                };
                            })()}
                            onAddConfiguration={(config) => {
                                setConfigurations(prev => [...prev, config]);
                                setSelectedConfigIds([config.id]);
                                setActiveTab("analysis");
                                setIsSidebarOpen(true);
                            }}
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
                                                actors={displayedActors}
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
                                                // Link Enrichment
                                                onEnrichLinks={handleEnrichLinks}
                                                isEnriching={isEnriching}
                                                enrichProgress={enrichProgress}
                                                // Selection [NEW]
                                                selectedForGrouping={selectedForGrouping}
                                                onToggleSelection={handleListSelectionToggle}
                                                onCreateConfiguration={handleCreateConfiguration}
                                                configurations={configurations}
                                                // [NEW] ANT Props
                                                tracedActorId={tracedActorId}
                                                onTraceActor={setTracedActorId}
                                            />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="analysis" className="h-full m-0 p-0 border-0 outline-none data-[state=active]:flex flex-col">
                                        <div className="h-full overflow-y-auto">
                                            <AssemblagePanel
                                                actors={actors}
                                                analyzedText={extractionText}
                                                savedAnalysis={selectedConfigIds.length === 1 ? configurations.find(c => c.id === selectedConfigIds[0])?.analysisData : absenceAnalysis}
                                                onSaveAnalysis={(analysis) => {
                                                    if (selectedConfigIds.length === 1) {
                                                        const targetId = selectedConfigIds[0];
                                                        setConfigurations(prev => prev.map(c => c.id === targetId ? { ...c, analysisData: analysis } : c));
                                                    } else {
                                                        setAbsenceAnalysis(analysis);
                                                    }
                                                }}
                                                onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                                isExpanded={isSidebarExpanded}
                                                // [FIX] Pass Array
                                                selectedConfigs={configurations.filter(c => selectedConfigIds.includes(c.id))}
                                                onClose={() => setIsSidebarOpen(false)}
                                                onUpdateConfig={(updatedConfig) => {
                                                    setConfigurations(prev => prev.map(c => c.id === updatedConfig.id ? updatedConfig : c));
                                                }}
                                                onUpdateActors={setActors}
                                                // [NEW] Management & Reordering
                                                allConfigurations={configurations}
                                                onReorderConfigs={(newConfigs) => setConfigurations(newConfigs)}
                                                onSelectConfig={(id, multi) => handleConfigClick(id, multi)}
                                                onDeleteConfig={handleDeleteConfiguration}
                                                // [NEW] ANT Props
                                                collapsedIds={collapsedAssemblages}
                                                onToggleCollapse={handleToggleCollapse}
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

                                    if (selectedConfigIds.length > 0) {
                                        // Case A: Export Selected Configuration (First one if multiple)
                                        const config = configurations.find(c => c.id === selectedConfigIds[0]);
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
                                                    constraints: (config.analysisData as AssemblageAnalysis)?.impacts?.filter((i) => i.type?.toLowerCase() === 'constraint').map((i) => i.description) || [],
                                                    affordances: (config.analysisData as AssemblageAnalysis)?.impacts?.filter((i) => i.type?.toLowerCase() === 'affordance').map((i) => i.description) || [],
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
                                        alert("Analysis incomplete. Please go to the 'Analysis' tab in the right sidebar and generate insights before saving.");
                                    }
                                }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Save & Return to Synthesis
                            </Button>
                        </div>
                    )}
                </div>
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
