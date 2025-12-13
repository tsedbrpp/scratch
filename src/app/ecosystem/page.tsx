"use client";

import { useState, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { EcosystemActor, EcosystemConfiguration, CulturalHolesAnalysisResult } from "@/types/ecosystem";

// Components
import { ActorList } from "@/components/ecosystem/ActorList";
import { EcosystemMap } from "@/components/ecosystem/EcosystemMap";
import { CulturalHolesAnalysis } from "@/components/ecosystem/CulturalHolesAnalysis";
import { ConfigurationDialog } from "@/components/ecosystem/ConfigurationDialog";
import { AbsencePanel } from "@/components/ecosystem/AbsencePanel";
import { ScenarioPanel } from "@/components/ecosystem/ScenarioPanel";
import { ScenarioId } from "@/lib/scenario-engine";
import { EcosystemTable } from "@/components/ecosystem/EcosystemTable";
import { Network, List } from "lucide-react";


export default function EcosystemPage() {
    const [actors, setActors] = useServerStorage<EcosystemActor[]>("ecosystem_actors", []);
    const [configurations, setConfigurations] = useServerStorage<EcosystemConfiguration[]>("ecosystem_configurations", []);
    const [selectedActorId, setSelectedActorId] = useServerStorage<string | null>("ecosystem_selected_actor_id", null);



    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationQuery, setSimulationQuery] = useServerStorage<string>("ecosystem_simulation_query", "AI startups and policy actors in Brussels");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [culturalHoles, setCulturalHoles] = useServerStorage<CulturalHolesAnalysisResult | null>("ecosystem_cultural_holes", null);
    const [isAnalyzingHoles, setIsAnalyzingHoles] = useState(false);

    // Interaction Modes
    const [interactionMode, setInteractionMode] = useState<"drag" | "select">("drag");
    const [selectedForGrouping, setSelectedForGrouping] = useState<string[]>([]);
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [newConfigName, setNewConfigName] = useState("");
    const [newConfigDesc, setNewConfigDesc] = useState("");

    // Extraction State
    const [isExtractionDialogOpen, setIsExtractionDialogOpen] = useState(false);
    const [extractionText, setExtractionText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);

    // Lens State
    const [activeLens, setActiveLens] = useState<"None" | "Market" | "Critical" | "Infrastructure">("None");

    // Scenario State
    const [activeScenario, setActiveScenario] = useState<ScenarioId>("None");
    const [sidebarMode, setSidebarMode] = useState<"absence" | "scenario">("scenario");

    // View & Filter State
    const [viewMode, setViewMode] = useState<"map" | "table">("map");
    const [filterType, setFilterType] = useState<EcosystemActor["type"] | "All">("All");

    const filteredActors = actors.filter(actor =>
        filterType === "All" ? true : actor.type === filterType
    );

    // Graph interaction state
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const uniqueIds = new Set();
        let hasDuplicates = false;
        actors.forEach(actor => {
            if (uniqueIds.has(actor.id)) {
                hasDuplicates = true;
            } else {
                uniqueIds.add(actor.id);
            }
        });

        if (hasDuplicates) {
            console.warn("Detected duplicate actors in state. Deduplicating...");
            setActors(prev => {
                const seen = new Set();
                return prev.filter(actor => {
                    if (seen.has(actor.id)) return false;
                    seen.add(actor.id);
                    return true;
                });
            });
        }
    }, [actors, setActors]);

    // Initialize positions when actors change
    useEffect(() => {
        setPositions(prev => {
            const newPositions = { ...prev };
            let hasChanges = false;
            actors.forEach((actor, i) => {
                if (!newPositions[actor.id]) {
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
    }, [actors.length, actors.map(a => a.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSimulate = async (queryOverride?: string, source: EcosystemActor["source"] = "simulation") => {
        setIsSimulating(true);
        const query = queryOverride || simulationQuery;

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/ecosystem/simulate', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ query: query })
            });
            const data = await response.json();
            console.log("Simulation Response:", data); // DEBUG

            if (data.success && data.actors) {
                setActors(prev => {
                    const existingIds = new Set(prev.map(a => a.id));
                    const existingNames = new Set(prev.map(a => a.name.toLowerCase()));
                    const newUniqueActors: EcosystemActor[] = [];

                    data.actors.forEach((actor: EcosystemActor) => {
                        const normalizedName = actor.name.toLowerCase();
                        // Generate a temporary ID if one is missing from the API
                        const actorId = actor.id || crypto.randomUUID();

                        // Check deduplication (using name as primary key if ID is new)
                        if (!existingNames.has(normalizedName)) {
                            existingIds.add(actorId);
                            existingNames.add(normalizedName);
                            // Apply tags and ID
                            newUniqueActors.push({ ...actor, id: actorId, source: source });
                        } else {
                            console.log("Skipping duplicate actor:", actor.name); // DEBUG
                        }
                    });

                    if (newUniqueActors.length === 0) {
                        console.warn("No new unique actors found to add."); // DEBUG
                        // alert("No new unique actors found."); // Removed alert to be less intrusive if it happens often during "fill gap"
                        return prev;
                    }

                    console.log("Adding new actors:", newUniqueActors); // DEBUG
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
        if (actors.length < 2) {
            alert("Need at least 2 actors to analyze cultural holes.");
            return;
        }
        setIsAnalyzingHoles(true);
        try {
            // Map actors to sources format for the advanced analysis API
            const sources = actors.map(a => ({
                id: a.id,
                title: a.name,
                text: `ACTOR TYPE: ${a.type}\nDESCRIPTION: ${a.description}\nINFLUENCE: ${a.influence}`
            }));

            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/cultural-analysis', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    sources: sources,
                    lensId: 'default'
                })
            });
            const data = await response.json();
            if (data.success && data.analysis) {
                setCulturalHoles(data.analysis);
            } else {
                alert("Analysis failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Holes analysis error:", error);
            alert("Failed to analyze cultural holes.");
        } finally {
            setIsAnalyzingHoles(false);
        }
    };

    const handleExtractAssemblage = async () => {
        if (!extractionText.trim()) return;
        setIsExtracting(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: extractionText,
                    analysisMode: 'assemblage_extraction',
                    sourceType: 'User Input'
                })
            });

            const data = await response.json();
            if (data.success && data.analysis) {
                const { assemblage, actors: newActorsList } = data.analysis;

                // 1. Process Actors
                const memberIds: string[] = [];
                const currentActors = [...actors];

                newActorsList.forEach((newActor: { name: string; type: string; description?: string }) => {
                    // Check if actor exists (fuzzy match by name)
                    const existing = currentActors.find(a => a.name.toLowerCase() === newActor.name.toLowerCase());
                    if (existing) {
                        memberIds.push(existing.id);
                    } else {
                        const id = crypto.randomUUID();
                        const createdActor: EcosystemActor = {
                            id,
                            name: newActor.name,
                            type: (newActor.type as EcosystemActor["type"]) || "Civil Society", // Default fallback
                            description: newActor.description || "",
                            influence: "Medium",
                            metrics: { influence: 5, alignment: 5, resistance: 5 }
                        };
                        currentActors.push(createdActor);
                        memberIds.push(id);

                        // Assign random position
                        setPositions(prev => ({
                            ...prev,
                            [id]: { x: Math.random() * 600 + 100, y: Math.random() * 300 + 50 }
                        }));
                    }
                });

                setActors(currentActors);

                // 2. Create Configuration
                if (memberIds.length > 0) {
                    const newConfig: EcosystemConfiguration = {
                        id: crypto.randomUUID(),
                        name: assemblage.name || "New Assemblage",
                        description: assemblage.description || "Extracted from text",
                        memberIds,
                        properties: {
                            stability: assemblage.properties?.stability || "Medium",
                            generativity: assemblage.properties?.generativity || "Medium"
                        },
                        color: `hsl(${Math.random() * 360}, 70%, 80%)`
                    };
                    setConfigurations(prev => [...prev, newConfig]);
                }

                setIsExtractionDialogOpen(false);
                setExtractionText("");
            } else {
                alert("Extraction failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Extraction failed:", error);
            alert("Failed to extract assemblage. Please try again.");
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
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/ecosystem/clear-cache', {
                method: 'POST',
                headers: headers
            });
            const data = await response.json();
            if (data.success) {
                alert("Cache cleared! Run a new simulation to get actors with website URLs.");
            } else {
                alert("Failed to clear cache: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Clear cache error:", error);
            alert("Failed to clear cache.");
        }
    };

    // Configuration Management
    const handleCreateConfiguration = () => {
        if (selectedForGrouping.length < 2) {
            alert("Select at least 2 actors to create a configuration.");
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
            properties: {
                stability: "Medium",
                generativity: "Medium"
            },
            color: `hsl(${Math.random() * 360}, 70%, 85%)` // Random pastel color
        };

        setConfigurations(prev => [...prev, newConfig]);
        setIsConfigDialogOpen(false);
        setNewConfigName("");
        setNewConfigDesc("");
        setSelectedForGrouping([]);
        setInteractionMode("drag"); // Switch back to drag mode
    };

    const toggleSelection = (actorId: string) => {
        setSelectedForGrouping(prev => {
            const isSelected = prev.includes(actorId);
            return isSelected
                ? prev.filter(id => id !== actorId)
                : [...prev, actorId];
        });
    };

    const handleActorDrag = (actorId: string, x: number, y: number) => {
        setPositions(prev => ({
            ...prev,
            [actorId]: { x, y }
        }));
    };

    const handleConfigDrag = (configId: string, dx: number, dy: number) => {
        const config = configurations.find(c => c.id === configId);
        if (!config) return;

        setPositions(prev => {
            const newPositions = { ...prev };
            config.memberIds.forEach(memberId => {
                const currentPos = prev[memberId];
                if (currentPos) {
                    newPositions[memberId] = {
                        x: currentPos.x + dx,
                        y: currentPos.y + dy
                    };
                }
            });
            return newPositions;
        });
    };

    // Layer State
    const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
        resistance: false
    });

    const toggleLayer = (layer: string) => {
        setActiveLayers(prev => ({
            ...prev,
            [layer]: !prev[layer]
        }));
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">

            {/* Sidebar: Actor Management */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
                <ActorList
                    actors={actors}
                    selectedActorId={selectedActorId}
                    onSelectActor={setSelectedActorId}
                    onClearAll={handleClearAll}
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
                />
            </div>

            {/* Main Content: Visualizations */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Field-Level Ecosystem</h2>
                        <p className="text-slate-500">Mapping the social structure, network ties, and cultural holes in the AI governance field.</p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        {/* View & Filter Controls */}
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                            <div className="flex bg-slate-100 p-0.5 rounded mr-2">
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1 ${viewMode === "map" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <Network className="h-3 w-3" />
                                    Graph
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1 ${viewMode === "table" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <List className="h-3 w-3" />
                                    Table
                                </button>
                            </div>

                            <select
                                className="text-xs border-none bg-transparent font-medium text-slate-600 focus:ring-0 cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
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

                        {/* Lens Selector (Only relevant for Graph) */}
                        {viewMode === "map" && (
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm scale-90 origin-right">
                                <span className="text-xs font-semibold text-slate-500 uppercase px-2">Lenses:</span>
                                {(["None", "Market", "Critical", "Infrastructure"] as const).map(lens => (
                                    <button
                                        key={lens}
                                        onClick={() => setActiveLens(lens)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeLens === lens
                                            ? "bg-slate-900 text-white shadow"
                                            : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {lens}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {viewMode === "map" ? (
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
                        activeScenario={activeScenario}
                    />
                ) : (
                    <EcosystemTable
                        actors={filteredActors}
                        onSelectActor={setSelectedActorId}
                        selectedActorId={selectedActorId}
                    />
                )}

                {viewMode === "map" && (
                    <CulturalHolesAnalysis
                        culturalHoles={culturalHoles}
                        isAnalyzingHoles={isAnalyzingHoles}
                        onAnalyze={handleAnalyzeHoles}
                    />
                )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
                {/* Sidebar Toggle */}
                <div className="flex rounded-md bg-slate-100 p-1">
                    <button
                        onClick={() => setSidebarMode("absence")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${sidebarMode === "absence" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Absences
                    </button>
                    <button
                        onClick={() => setSidebarMode("scenario")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${sidebarMode === "scenario" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Scenarios
                    </button>
                </div>

                {sidebarMode === "absence" ? (
                    <AbsencePanel
                        actors={actors}
                        analyzedText={extractionText}
                        onSimulate={handleSimulate}
                    />
                ) : (
                    <ScenarioPanel actors={actors} activeScenario={activeScenario} setActiveScenario={setActiveScenario} />
                )}
            </div>

            <ConfigurationDialog
                isOpen={isConfigDialogOpen}
                onClose={() => setIsConfigDialogOpen(false)}
                name={newConfigName}
                setName={setNewConfigName}
                description={newConfigDesc}
                setDescription={setNewConfigDesc}
                onConfirm={confirmCreateConfiguration}
            />
        </div>
    );
}
