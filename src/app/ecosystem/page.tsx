"use client";

import { useState, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { EcosystemActor, EcosystemConfiguration, CulturalHolesAnalysisResult, AssemblageAnalysis } from "@/types/ecosystem";

// Components
import { ActorList } from "@/components/ecosystem/ActorList";
import { EcosystemMap } from "@/components/ecosystem/EcosystemMap";
import { CulturalHolesAnalysis } from "@/components/ecosystem/CulturalHolesAnalysis";
import { ConfigurationDialog } from "@/components/ecosystem/ConfigurationDialog";
import { AssemblagePanel } from "@/components/ecosystem/AssemblagePanel";
import { ScenarioPanel } from "@/components/ecosystem/ScenarioPanel";
import { ScenarioId } from "@/lib/scenario-engine";
import { EcosystemTable } from "@/components/ecosystem/EcosystemTable";
import { AssemblageCompass } from "@/components/ecosystem/AssemblageCompass";
import { Network, List, Compass, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, FileText, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function EcosystemPage() {
    // Sources for policy selection
    const { sources, isLoading: isSourcesLoading } = useSources();
    const [selectedPolicyId, setSelectedPolicyId] = useServerStorage<string | null>("ecosystem_active_policy_id", null);
    const policyDocuments = sources.filter(s => s.type !== "Trace");

    // Dynamic Storage Keys
    const actorsKey = selectedPolicyId ? `ecosystem_actors_${selectedPolicyId}` : "ecosystem_actors_temp";
    const configsKey = selectedPolicyId ? `ecosystem_configurations_${selectedPolicyId}` : "ecosystem_configurations_temp";
    const selectedActorKey = selectedPolicyId ? `ecosystem_selected_actor_id_${selectedPolicyId}` : "ecosystem_selected_actor_id_temp";
    const simulationQueryKey = selectedPolicyId ? `ecosystem_simulation_query_${selectedPolicyId}` : "ecosystem_simulation_query_temp";
    const holesKey = selectedPolicyId ? `ecosystem_cultural_holes_${selectedPolicyId}` : "ecosystem_cultural_holes_temp";
    const absenceKey = selectedPolicyId ? `ecosystem_absence_analysis_${selectedPolicyId}` : "ecosystem_absence_analysis_temp";

    // Storage Hooks
    // Note: When selectedPolicyId is null, we use a 'temp' key or just don't render the main content to avoid loading junk.
    // However, hooks must be called unconditionally.
    const [actors, setActors] = useServerStorage<EcosystemActor[]>(actorsKey, []);
    const [configurations, setConfigurations] = useServerStorage<EcosystemConfiguration[]>(configsKey, []);
    const [selectedActorId, setSelectedActorId] = useServerStorage<string | null>(selectedActorKey, null);
    const [simulationQuery, setSimulationQuery] = useServerStorage<string>(simulationQueryKey, "AI startups and policy actors in Brussels");
    const [culturalHoles, setCulturalHoles] = useServerStorage<CulturalHolesAnalysisResult | null>(holesKey, null);
    const [absenceAnalysis, setAbsenceAnalysis] = useServerStorage<AssemblageAnalysis | null>(absenceKey, null);

    // Layout State (Zen Mode + Expansion)
    const [showLeftPanel, setShowLeftPanel] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [isLeftExpanded, setIsLeftExpanded] = useState(false);
    const [isRightExpanded, setIsRightExpanded] = useState(false);

    const [isSimulating, setIsSimulating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAnalyzingHoles, setIsAnalyzingHoles] = useState(false);

    // Interaction Modes
    const [interactionMode, setInteractionMode] = useState<"drag" | "select">("drag");
    const [selectedForGrouping, setSelectedForGrouping] = useState<string[]>([]);
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [newConfigName, setNewConfigName] = useState("");
    const [newConfigDesc, setNewConfigDesc] = useState("");
    const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null); // Unification State

    // Extraction State
    const [isExtractionDialogOpen, setIsExtractionDialogOpen] = useState(false);
    const [extractionText, setExtractionText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);

    // Lens State
    const [activeLens, setActiveLens] = useState<"None" | "Market" | "Critical" | "Infrastructure" | "Decolonial">("None");

    // Scenario State
    const [activeScenario, setActiveScenario] = useState<ScenarioId>("None");
    const [sidebarMode, setSidebarMode] = useState<"absence" | "scenario">("absence");

    // View & Filter State
    const [viewMode, setViewMode] = useState<"map" | "table" | "compass">("map");
    const [colorMode, setColorMode] = useState<"type" | "epistemic">("type");
    const [filterType, setFilterType] = useState<EcosystemActor["type"] | "All">("All");

    const filteredActors = actors.filter(actor =>
        filterType === "All" ? true : actor.type === filterType
    );



    // Graph interaction state
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [mounted, setMounted] = useState(false);

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
    }, [actors]); // Depend on actors to re-run layout for new actors

    // Handlers
    const handleSimulate = async (queryOverride?: string, source: EcosystemActor["source"] = "simulation") => {
        setIsSimulating(true);
        const query = queryOverride || simulationQuery;

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            // Always try to send demo ID if available (handles client/server env mismatch)
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/ecosystem/simulate', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ query: query })
            });
            const data = await response.json();

            if (data.success && data.actors) {
                setActors(prev => {
                    const existingIds = new Set(prev.map(a => a.id));
                    const newUniqueActors: EcosystemActor[] = [];
                    data.actors.forEach((actor: EcosystemActor) => {
                        const actorId = actor.id || crypto.randomUUID();
                        if (!existingIds.has(actorId)) {
                            newUniqueActors.push({ ...actor, id: actorId, source: source });
                        }
                    });
                    return [...prev, ...newUniqueActors];
                });
                setIsDialogOpen(false);
            } else {
                alert("Simulation failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Simulation error:", error);
            alert("Failed to simulate ecosystem.");
        } finally {
            setIsSimulating(false);
        }
    };

    const handleAnalyzeHoles = async () => {
        if (actors.length < 2) return;
        setIsAnalyzingHoles(true);
        try {
            const sources = actors.map(a => ({
                id: a.id,
                title: a.name,
                text: `ACTOR TYPE: ${a.type}\nDESCRIPTION: ${a.description}\nINFLUENCE: ${a.influence}`
            }));

            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/cultural-analysis', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ sources, lensId: 'default' })
            });
            const data = await response.json();
            if (data.success && data.analysis) {
                setCulturalHoles(data.analysis);
                // Scroll to the results
                setTimeout(() => {
                    const element = document.getElementById('cultural-holes-section');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            } else {
            }
        } catch (error) {
            console.error("Holes analysis error:", error);
        } finally {
            setIsAnalyzingHoles(false);
        }
    };

    const handleExtractAssemblage = async () => {
        if (!extractionText.trim()) return;
        setIsExtracting(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: extractionText,
                    analysisMode: 'assemblage_extraction_v3',
                    sourceType: 'User Input'
                })
            });

            const data = await response.json();

            if (data.success && data.analysis) {
                const { assemblage, actors: newActorsList } = data.analysis;
                const memberIds: string[] = [];
                const currentActors = [...actors];

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newActorsList.forEach((newActor: any, index: number) => {

                    // Compute Dimensional Scores
                    const m = newActor.metrics || {};

                    // Influence = Average of (Territoriality + Coding + Centrality)
                    let influenceScore = 5;
                    if (m.territoriality !== undefined && m.coding !== undefined && m.centrality !== undefined) {
                        influenceScore = Math.round((m.territoriality + m.coding + m.centrality) / 3);
                    } else if (m.influence !== undefined) {
                        influenceScore = m.influence; // Fallback to prompt output if direct score provided
                    }

                    // Resistance = Max of (Counter-Conduct, Discursive Opposition)
                    let resistanceScore = 5;
                    if (m.counter_conduct !== undefined && m.discursive_opposition !== undefined) {
                        resistanceScore = Math.max(m.counter_conduct, m.discursive_opposition);
                    } else if (m.resistance !== undefined) {
                        resistanceScore = m.resistance; // Fallback
                    }

                    const id = crypto.randomUUID();
                    currentActors.push({
                        id,
                        name: newActor.name,
                        type: newActor.type || "Civil Society",
                        description: newActor.description || "",
                        influence: "Medium", // Legacy field
                        metrics: {
                            influence: influenceScore,
                            alignment: m.alignment || 5,
                            resistance: resistanceScore,
                            rationale: m.rationale || "No rationale provided.",
                            // Store dimensions for tooltip
                            territoriality: m.territoriality,
                            coding: m.coding,
                            centrality: m.centrality,
                            counter_conduct: m.counter_conduct,
                            discursive_opposition: m.discursive_opposition
                        },
                        quotes: newActor.evidence_quotes || [],
                        region: newActor.region || "Unknown",
                        role_type: newActor.role_type
                    });
                    memberIds.push(id);
                    setPositions(prev => ({ ...prev, [id]: { x: Math.random() * 600 + 100, y: Math.random() * 300 + 50 } }));
                });

                setActors(currentActors);

                if (memberIds.length > 0) {
                    const newConfig: EcosystemConfiguration = {
                        id: crypto.randomUUID(),
                        name: assemblage.name || "New Assemblage",
                        description: assemblage.description || "Extracted from text",
                        memberIds,
                        properties: {
                            stability: assemblage.properties.stability || "Medium",
                            generativity: assemblage.properties.generativity || "Medium",
                            territorialization_score: assemblage.properties.territorialization_score,
                            coding_intensity_score: assemblage.properties.coding_intensity_score
                        },
                        // Store the full analysis result (including traces/metrics) for the details panel
                        analysisData: data.analysis,
                        color: `hsl(${Math.random() * 360}, 70%, 80%)`
                    };
                    setConfigurations(prev => [...prev, newConfig]);

                    // Auto-select the new assemblage and open the panel
                    setSelectedConfigId(newConfig.id);
                    setSidebarMode("absence");
                    setShowRightPanel(true);
                }
                setIsExtractionDialogOpen(false);
                setExtractionText("");
            }
        } catch (error) {
            console.error("Extraction failed:", error);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleClearAll = () => {
        setActors([]);
        setConfigurations([]);
        setSelectedActorId(null);
        setCulturalHoles(null);
        setPositions({});
        setSelectedForGrouping([]);
    };

    const handleClearCache = async () => {
        try {
            const headers: HeadersInit = {};
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }
            await fetch('/api/ecosystem/clear-cache', { method: 'POST', headers });
            alert("Cache cleared!");
        } catch (error) {
            console.error("Clear cache error:", error);
        }
    };

    const handleCreateConfiguration = () => {
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
        setIsConfigDialogOpen(false);
        setNewConfigName("");
        setNewConfigDesc("");
        setSelectedForGrouping([]);
        setInteractionMode("drag");
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
        const config = configurations.find(c => c.id === configId);
        if (!config) return;
        setPositions(prev => {
            const newPositions = { ...prev };
            config.memberIds.forEach(memberId => {
                const currentPos = prev[memberId];
                if (currentPos) {
                    newPositions[memberId] = { x: currentPos.x + dx, y: currentPos.y + dy };
                }
            });
            return newPositions;
        });
    };

    const handleConfigClick = (configId: string) => {
        setSelectedConfigId(configId);
        setShowRightPanel(true);
        setSidebarMode("absence");
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
        <div className="flex flex-col h-full gap-4">

            <div className="flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Assemblage Diagram</h2>
                        <p className="text-slate-500">Tracing the territories, flows, and coding intensities of the governance regime.</p>
                    </div>
                </div>

                {/* Policy Selector Section */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">Active Policy Document</h3>
                                </div>
                            </div>
                            <div className="w-full md:w-[300px]">
                                <Select
                                    value={selectedPolicyId || ""}
                                    onValueChange={async (val) => {
                                        // Migration Logic: If we are in "Temp" mode (no policy) and have actors,
                                        // carry them over to the new policy context so the user doesn't lose their work.
                                        if (!selectedPolicyId && actors.length > 0) {
                                            const confirmMigrate = window.confirm("You have actors in the scratchpad. Do you want to move them to this policy?");
                                            if (confirmMigrate) {
                                                try {
                                                    const headers: HeadersInit = { 'Content-Type': 'application/json' };
                                                    if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                                                        headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
                                                    }

                                                    // Manually save current state to the NEW keys
                                                    await Promise.all([
                                                        fetch('/api/storage', {
                                                            method: 'POST',
                                                            headers,
                                                            body: JSON.stringify({ key: `ecosystem_actors_${val}`, value: actors }),
                                                        }),
                                                        fetch('/api/storage', {
                                                            method: 'POST',
                                                            headers,
                                                            body: JSON.stringify({ key: `ecosystem_configurations_${val}`, value: configurations }),
                                                        })
                                                    ]);
                                                } catch (err) {
                                                    console.error("Migration failed:", err);
                                                }
                                            }
                                        }
                                        setSelectedPolicyId(val);
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Select a policy document..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {policyDocuments.length === 0 ? (
                                            <div className="p-2 text-sm text-slate-500 text-center">No documents found</div>
                                        ) : (
                                            policyDocuments.map(doc => (
                                                <SelectItem key={doc.id} value={doc.id}>
                                                    {doc.title}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


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
                    </div>
                </div>
            ) : (
                <Tabs defaultValue="map" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center px-1 shrink-0">
                        <TabsList className="bg-slate-100">
                            <TabsTrigger value="map" className="gap-2">
                                <Network className="h-4 w-4" /> Visual Assemblage
                            </TabsTrigger>
                            <TabsTrigger value="table" className="gap-2">
                                <List className="h-4 w-4" /> Table View
                            </TabsTrigger>
                            <TabsTrigger value="compass" className="gap-2">
                                <Compass className="h-4 w-4" /> Assemblage Compass
                            </TabsTrigger>
                            <TabsTrigger value="holes" className="gap-2">
                                <FileText className="h-4 w-4" /> Cultural Holes
                            </TabsTrigger>
                        </TabsList>

                        {/* Global Actions (like Clear Cache) could go here */}
                    </div>

                    {/* TAB 1: VISUAL ASSEMBLAGE (FULL MAP) */}
                    <TabsContent value="map" className="flex-1 flex overflow-hidden mt-4 gap-6 data-[state=inactive]:hidden">

                        {/* Map View - Retaining Sidebar Logic for Selection/Simulation, but defaults can be managed */}
                        <div className="flex flex-col lg:flex-row h-full gap-6 flex-1 overflow-hidden">
                            {/* Left Panel (Actor List) */}
                            {showLeftPanel && (
                                <div className={`flex flex-col gap-4 shrink-0 transition-all duration-300 overflow-y-auto ${isLeftExpanded ? 'w-full lg:w-[600px] xl:w-[700px] z-20 shadow-xl' : 'w-full lg:w-80'}`}>
                                    <ActorList
                                        actors={actors}
                                        selectedActorId={selectedActorId}
                                        onSelectActor={setSelectedActorId}
                                        onClearAll={handleClearAll}
                                        isExpanded={isLeftExpanded}
                                        onToggleExpand={() => setIsLeftExpanded(!isLeftExpanded)}
                                        isSimulating={isSimulating}
                                        simulationQuery={simulationQuery}
                                        setSimulationQuery={setSimulationQuery}
                                        onSimulate={handleSimulate}
                                        isDialogOpen={isDialogOpen}
                                        setIsDialogOpen={setIsDialogOpen}
                                        onClearCache={handleClearCache}
                                        isExtracting={isExtracting}
                                        extractionText={extractionText}
                                        setExtractionText={setExtractionText}
                                        onExtract={handleExtractAssemblage}
                                        isExtractionDialogOpen={isExtractionDialogOpen}
                                        setIsExtractionDialogOpen={setIsExtractionDialogOpen}
                                        isAnalyzingHoles={isAnalyzingHoles}
                                        onAnalyze={handleAnalyzeHoles}
                                        onClose={() => setShowLeftPanel(false)}
                                    />
                                </div>
                            )}

                            {/* Center (The Map) */}
                            <div className="flex-1 flex flex-col gap-4 overflow-hidden relative transition-all duration-300">
                                {/* Map Header / Toolbar */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-10 pointer-events-none">
                                    <div className="flex items-center gap-3 pointer-events-auto">
                                        {!showLeftPanel && (
                                            <button onClick={() => setShowLeftPanel(true)} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm border border-slate-200" title="Show Actor List">
                                                <PanelLeftOpen size={20} />
                                            </button>
                                        )}
                                        {showLeftPanel && (
                                            <button onClick={() => setShowLeftPanel(false)} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm border border-slate-200" title="Hide Actor List">
                                                <PanelLeftClose size={20} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                                        <div className="flex items-center gap-2">
                                            {/* Color Mode Toggle */}
                                            <div className="flex bg-slate-100 p-0.5 rounded mr-2 border shadow-sm">
                                                <button onClick={() => setColorMode("type")} className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${colorMode === "type" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>Type</button>
                                                <button onClick={() => setColorMode("epistemic")} className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1 ${colorMode === "epistemic" ? "bg-white shadow text-emerald-700" : "text-slate-500 hover:text-slate-700"}`}>Epistemic</button>
                                            </div>

                                            {/* Filter Checkbox/Select */}
                                            <div className="bg-slate-100 p-0.5 rounded border shadow-sm">
                                                <select
                                                    className="text-xs border-none bg-transparent font-medium text-slate-600 focus:ring-0 cursor-pointer h-7"
                                                    value={filterType}
                                                    onChange={(e) => setFilterType(e.target.value as EcosystemActor["type"] | "All")}
                                                >
                                                    <option value="All">All Types</option>
                                                    <option value="Policymaker">Policymakers</option>
                                                    <option value="Startup">Startups</option>
                                                    <option value="Civil Society">Civil Society</option>
                                                    <option value="Academic">Academics</option>
                                                    <option value="Infrastructure">Infrastructure</option>
                                                    <option value="Algorithm">Algorithms</option>
                                                    <option value="Dataset">Datasets</option>
                                                </select>
                                            </div>

                                            {/* Right Panel Toggle */}
                                            {!showRightPanel && (
                                                <button onClick={() => setShowRightPanel(true)} className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-600 transition-colors border shadow-sm" title="Show Details">
                                                    <PanelRightOpen size={18} />
                                                </button>
                                            )}
                                            {showRightPanel && (
                                                <button onClick={() => setShowRightPanel(false)} className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-600 transition-colors border shadow-sm" title="Hide Details">
                                                    <PanelRightClose size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Lens Selector */}
                                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm scale-90 origin-right">
                                            <span className="text-xs font-semibold text-slate-500 uppercase px-2">Lenses:</span>
                                            {(["None", "Market", "Critical", "Infrastructure"] as const).map(lens => (
                                                <button
                                                    key={lens}
                                                    onClick={() => setActiveLens(lens)}
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeLens === lens ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}
                                                >
                                                    {lens}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actual Map Component */}
                                <div className="flex-1 min-h-0 border rounded-xl overflow-hidden shadow-sm relative">
                                    <EcosystemMap
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
                                        activeLayers={activeLayers}
                                        toggleLayer={toggleLayer}
                                        activeLens={activeLens}
                                        colorMode={colorMode}
                                        onConfigClick={handleConfigClick}
                                        absenceAnalysis={absenceAnalysis}
                                    />
                                    {/* Removed CulturalHolesAnalysis from here */}
                                </div>
                            </div>

                            {/* Right Panel (Details/Inspector) */}
                            {showRightPanel && (
                                <div className={`shrink-0 flex flex-col gap-4 transition-all duration-300 overflow-y-auto ${isRightExpanded ? 'w-full lg:w-[800px] xl:w-[1000px] z-20 shadow-xl' : 'w-full lg:w-72'}`}>
                                    {/* Sidebar Toggle */}
                                    <div className="flex rounded-md bg-slate-100 p-1">
                                        <button onClick={() => setSidebarMode("absence")} className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${sidebarMode === "absence" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Absences</button>
                                        <button onClick={() => setSidebarMode("scenario")} className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${sidebarMode === "scenario" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Scenarios</button>
                                    </div>

                                    {sidebarMode === "absence" ? (
                                        <AssemblagePanel
                                            actors={actors}
                                            analyzedText={extractionText}
                                            onSimulate={handleSimulate}
                                            savedAnalysis={absenceAnalysis}
                                            onSaveAnalysis={(analysis) => {
                                                if (selectedConfigId) {
                                                    setConfigurations(prev => prev.map(c => c.id === selectedConfigId ? { ...c, analysisData: analysis } : c));
                                                } else {
                                                    setAbsenceAnalysis(analysis);
                                                }
                                            }}
                                            onToggleExpand={() => setIsRightExpanded(!isRightExpanded)}
                                            isExpanded={isRightExpanded} // Pass state specifically if component supports it (AssemblagePanel might not use it yet visually but good to pass if interface allows, otherwise ignore)
                                            selectedConfig={configurations.find(c => c.id === selectedConfigId)}
                                            onClose={() => { setShowRightPanel(false); setSelectedConfigId(null); }}
                                        />
                                    ) : (
                                        <ScenarioPanel
                                            actors={actors}
                                            activeScenario={activeScenario}
                                            setActiveScenario={setActiveScenario}
                                            onClose={() => { setShowRightPanel(false); setSelectedConfigId(null); }}
                                            onToggleExpand={() => setIsRightExpanded(!isRightExpanded)}
                                            isExpanded={isRightExpanded}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* TAB 2: TABLE VIEW */}
                    <TabsContent value="table" className="flex-1 overflow-hidden mt-4 p-4 data-[state=inactive]:hidden">
                        <Card className="h-full border-slate-200">
                            <CardContent className="p-0 h-full overflow-hidden">
                                <EcosystemTable
                                    actors={filteredActors}
                                    onSelectActor={setSelectedActorId}
                                    selectedActorId={selectedActorId}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 3: ASSEMBLAGE COMPASS */}
                    <TabsContent value="compass" className="flex-1 overflow-auto mt-4 p-4 data-[state=inactive]:hidden">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                            <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center shrink-0">
                                <Compass className="w-5 h-5 mr-2 text-indigo-600" /> Epistemic Compass
                            </h3>
                            <div className="flex-1 min-h-0">
                                <AssemblageCompass
                                    actors={filteredActors}
                                    onSelectActor={setSelectedActorId}
                                    selectedActorId={selectedActorId}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 4: CULTURAL HOLES */}
                    <TabsContent value="holes" className="flex-1 overflow-auto mt-4 p-6 data-[state=inactive]:hidden">
                        <div id="cultural-holes-section" className="bg-amber-50/50 p-6 rounded-xl border border-amber-100 min-h-full">
                            <CulturalHolesAnalysis
                                culturalHoles={culturalHoles}
                                isAnalyzingHoles={isAnalyzingHoles}
                                onAnalyze={handleAnalyzeHoles}
                            />
                        </div>
                    </TabsContent>

                    <ConfigurationDialog
                        isOpen={isConfigDialogOpen}
                        onClose={() => setIsConfigDialogOpen(false)}
                        name={newConfigName}
                        setName={setNewConfigName}
                        description={newConfigDesc}
                        setDescription={setNewConfigDesc}
                        onConfirm={confirmCreateConfiguration}
                    />
                </Tabs>
            )}
        </div>
    );
}
