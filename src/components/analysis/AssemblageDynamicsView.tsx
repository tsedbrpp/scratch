import React, { useState } from "react";
import { AnalysisResult } from "@/types";
import { Activity, Info, Maximize2, Minimize2 } from "lucide-react";
import { DynamicsCard } from "@/components/policy/analysis/DynamicsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useServerStorage } from "@/hooks/useServerStorage";
import { EcosystemActor } from "@/types/ecosystem";
import { TerritorializationView } from "@/components/ecosystem/TerritorializationView";
import { DeterritorializationView } from "@/components/ecosystem/DeterritorializationView";
import { CodingView } from "@/components/ecosystem/CodingView";
import { SimulationNode } from "@/hooks/useForceGraph";

interface AssemblageDynamicsViewProps {
    analysis: AnalysisResult;
    sourceId: string; // [FIX] Filter by document ID
}

export function AssemblageDynamicsView({ analysis, sourceId }: AssemblageDynamicsViewProps) {
    const [activeTab, setActiveTab] = useState("territorialization");
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch ecosystem actors to power the simulations
    const [allActors] = useServerStorage<EcosystemActor[]>("ecosystem_actors", []);

    // Filter actors for THIS assemblage only
    const actors = allActors.filter(a => a.sourceId === sourceId || a.materialized_from?.source_id === sourceId);

    // Map EcosystemActors to SimulationNodes
    // We assume a default radius/size based on influence if not present, though useForceGraph handles most of this.
    // However, the views expect SimulationNode[].
    const nodes: SimulationNode[] = actors.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        radius: a.influence === 'High' ? 45 : a.influence === 'Medium' ? 30 : 20,
        // Optional: map other properties if needed by specific views
        metrics: a.metrics
    })) as SimulationNode[];

    if (!analysis.assemblage_dynamics) return null;

    return (
        <div className={`space-y-6 animate-in fade-in duration-500 transition-all ${isExpanded ? 'fixed inset-0 z-50 bg-slate-50 p-6 overflow-y-auto' : ''}`}>

            <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto flex flex-col ${isExpanded ? 'min-h-[90vh]' : 'min-h-[1000px]'}`}>

                {/* Header Section */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg shrink-0">
                            <Activity className="h-5 w-5 text-teal-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Assemblage Dynamics</h2>
                            <p className="text-xs text-slate-500">Interactive modeling of territorialization, lines of flight, and coding.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 h-9">
                                    <TabsTrigger value="territorialization" className="text-xs">Territorialization</TabsTrigger>
                                    <TabsTrigger value="deterritorialization" className="text-xs">Deterritorialization</TabsTrigger>
                                    <TabsTrigger value="coding" className="text-xs">Coding</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="shrink-0"
                            title={isExpanded ? "Minimize" : "Maximize view"}
                        >
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 bg-slate-50/30 flex flex-col min-h-0 relative">
                    {/* Text Analysis Overlay / Context */}
                    <div className="px-6 py-4 bg-white border-b border-slate-100/50">
                        {activeTab === 'territorialization' && (
                            <DynamicsCard
                                label="Territorialization"
                                subLabel="(Stabilization)"
                                content={analysis.assemblage_dynamics.territorialization}
                                color="teal"
                            />
                        )}
                        {activeTab === 'deterritorialization' && (
                            <DynamicsCard
                                label="Deterritorialization"
                                subLabel="(Lines of Flight)"
                                content={analysis.assemblage_dynamics.deterritorialization}
                                color="cyan"
                            />
                        )}
                        {activeTab === 'coding' && (
                            <DynamicsCard
                                label="Coding"
                                subLabel="(Translation)"
                                content={analysis.assemblage_dynamics.coding}
                                color="emerald"
                            />
                        )}
                    </div>

                    {/* Interactive Viewport */}
                    <div className="flex-1 relative w-full h-full min-h-[500px] overflow-hidden">
                        <Tabs value={activeTab} className="h-full w-full">
                            <TabsContent value="territorialization" className="h-full mt-0 p-4 data-[state=inactive]:hidden">
                                <TerritorializationView
                                    isExpanded={isExpanded}
                                    nodes={nodes}
                                />
                            </TabsContent>
                            <TabsContent value="deterritorialization" className="h-full mt-0 p-4 data-[state=inactive]:hidden">
                                <DeterritorializationView
                                    isExpanded={isExpanded}
                                    nodes={nodes}
                                />
                            </TabsContent>
                            <TabsContent value="coding" className="h-full mt-0 p-4 data-[state=inactive]:hidden">
                                <CodingView
                                    isExpanded={isExpanded}
                                    nodes={nodes}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
