"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Network, Zap, Plus, Search, Globe, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Placeholder types for Ecosystem Actors
interface EcosystemActor {
    id: string;
    name: string;
    type: "Startup" | "Policymaker" | "Civil Society" | "Academic";
    description: string;
    influence: "High" | "Medium" | "Low";
}

const MOCK_ACTORS: EcosystemActor[] = [
    { id: "1", name: "TechCorp AI", type: "Startup", description: "Leading generative AI startup focused on enterprise solutions.", influence: "High" },
    { id: "2", name: "PolicyWatch", type: "Civil Society", description: "NGO monitoring AI regulation compliance.", influence: "Medium" },
    { id: "3", name: "Ministry of Digital", type: "Policymaker", description: "Government body responsible for AI Act implementation.", influence: "High" },
    { id: "4", name: "Prof. Smith", type: "Academic", description: "Key voice in AI ethics discourse.", influence: "Medium" },
];

export default function EcosystemPage() {
    const [actors, setActors] = useState<EcosystemActor[]>(MOCK_ACTORS);
    const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationQuery, setSimulationQuery] = useState("AI startups and policy actors in Brussels");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [culturalHoles, setCulturalHoles] = useState<any>(null);
    const [isAnalyzingHoles, setIsAnalyzingHoles] = useState(false);

    const handleSimulate = async () => {
        setIsSimulating(true);
        try {
            const response = await fetch('/api/ecosystem/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: simulationQuery })
            });
            const data = await response.json();
            if (data.success && data.actors) {
                setActors(prev => [...prev, ...data.actors]);
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
            const actorsText = actors.map(a => `ACTOR: ${a.name} (${a.type})\nDESCRIPTION: ${a.description}`).join("\n\n");

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: actorsText,
                    analysisMode: 'cultural_holes'
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

    const handleClearAll = () => {
        setActors([]);
        setSelectedActorId(null);
        setCulturalHoles(null);
    };

    return (
        <div className="flex h-full gap-6">
            {/* Sidebar: Actor Management */}
            <div className="w-80 flex flex-col gap-4 shrink-0">
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Ecosystem Actors</CardTitle>
                            <div className="flex gap-1">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Simulate Data">
                                            <Globe className="h-4 w-4 text-indigo-600" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Simulate Ecosystem Data</DialogTitle>
                                            <DialogDescription>
                                                Use web search to discover and import actors into the ecosystem.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="query" className="text-right">
                                                    Search Query
                                                </Label>
                                                <Input
                                                    id="query"
                                                    value={simulationQuery}
                                                    onChange={(e) => setSimulationQuery(e.target.value)}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleSimulate} disabled={isSimulating}>
                                                {isSimulating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Simulating...
                                                    </>
                                                ) : (
                                                    "Start Simulation"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Clear All Actors">
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Clear All Actors?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove all actors (including mock data). You'll start with an empty ecosystem. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700">
                                                Clear All
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative mt-2">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Search actors..."
                                className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-slate-50"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0">
                        {actors.map(actor => (
                            <div
                                key={actor.id}
                                className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedActorId === actor.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-slate-50'}`}
                                onClick={() => setSelectedActorId(actor.id)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{actor.name}</span>
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                        {actor.type}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{actor.description}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Main Content: Visualizations */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Field-Level Ecosystem</h2>
                    <p className="text-slate-500">Mapping the social structure, network ties, and cultural holes in the AI governance field.</p>
                </div>

                {/* Social Graph Visualization */}
                <Card className="min-h-[400px] flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-indigo-600" />
                            <CardTitle>Social Network Graph</CardTitle>
                        </div>
                        <CardDescription>
                            Visualizing ties between actors based on shared discourse and direct interaction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 bg-slate-50/50 p-6 border-t">
                        <svg width="100%" height="400" className="border border-slate-200 rounded-lg bg-white">
                            <defs>
                                <marker id="actor-arrow" markerWidth="8" markerHeight="8" refX="20" refY="4" orient="auto">
                                    <polygon points="0 0, 8 4, 0 8" fill="#94a3b8" />
                                </marker>
                                <filter id="actor-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Generate connections based on actor types */}
                            {actors.map((source, i) =>
                                actors.slice(i + 1).map((target, j) => {
                                    // Create connections between actors of different types
                                    const shouldConnect = (
                                        (source.type === "Policymaker" && target.type === "Civil Society") ||
                                        (source.type === "Startup" && target.type === "Academic") ||
                                        (source.type === "Policymaker" && target.type === "Startup") ||
                                        (source.type === "Civil Society" && target.type === "Academic")
                                    );

                                    if (!shouldConnect) return null;

                                    // Calculate positions in a circular layout
                                    const totalActors = actors.length;
                                    const sourceAngle = (i / totalActors) * 2 * Math.PI;
                                    const targetAngle = ((i + j + 1) / totalActors) * 2 * Math.PI;
                                    const centerX = 350;
                                    const centerY = 200;
                                    const radius = 120;

                                    const x1 = centerX + radius * Math.cos(sourceAngle);
                                    const y1 = centerY + radius * Math.sin(sourceAngle);
                                    const x2 = centerX + radius * Math.cos(targetAngle);
                                    const y2 = centerY + radius * Math.sin(targetAngle);

                                    const isHighlighted = selectedActorId === source.id || selectedActorId === target.id;
                                    const opacity = selectedActorId && !isHighlighted ? 0.15 : 0.4;

                                    return (
                                        <line
                                            key={`${source.id}-${target.id}`}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke="#94a3b8"
                                            strokeWidth={isHighlighted ? 2 : 1}
                                            opacity={opacity}
                                            markerEnd="url(#actor-arrow)"
                                            style={{ transition: 'all 0.3s ease' }}
                                        />
                                    );
                                })
                            )}

                            {/* Actor nodes */}
                            {actors.map((actor, i) => {
                                const totalActors = actors.length;
                                const angle = (i / totalActors) * 2 * Math.PI;
                                const centerX = 350;
                                const centerY = 200;
                                const radius = 120;
                                const x = centerX + radius * Math.cos(angle);
                                const y = centerY + radius * Math.sin(angle);

                                const isSelected = selectedActorId === actor.id;
                                const isDimmed = selectedActorId && !isSelected;
                                const opacity = isDimmed ? 0.3 : 1;
                                const scale = isSelected ? 1.15 : 1;

                                // Color by type
                                const colorMap: Record<string, string> = {
                                    "Startup": "#3b82f6",
                                    "Policymaker": "#dc2626",
                                    "Civil Society": "#16a34a",
                                    "Academic": "#9333ea"
                                };
                                const color = colorMap[actor.type] || "#64748b";

                                return (
                                    <g
                                        key={actor.id}
                                        onClick={() => setSelectedActorId(isSelected ? null : actor.id)}
                                        onMouseEnter={() => setSelectedActorId(actor.id)}
                                        style={{ cursor: 'pointer', transition: 'all 0.3s ease', opacity }}
                                        transform={`translate(${x}, ${y}) scale(${scale}) translate(${-x}, ${-y})`}
                                    >
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="28"
                                            fill="white"
                                            stroke={color}
                                            strokeWidth={isSelected ? 3 : 2}
                                            filter={isSelected ? "url(#actor-glow)" : ""}
                                        />
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="24"
                                            fill={color}
                                            opacity="0.2"
                                        />
                                        <text
                                            x={x}
                                            y={y}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontSize="10"
                                            fontWeight="600"
                                            fill="#1e293b"
                                            className="pointer-events-none select-none"
                                        >
                                            {actor.name.split(' ').slice(0, 2).map((word, wi) => (
                                                <tspan key={wi} x={x} dy={wi === 0 ? (actor.name.split(' ').length > 1 ? -5 : 0) : 11}>
                                                    {word.substring(0, 8)}
                                                </tspan>
                                            ))}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Legend */}
                            <g transform="translate(20, 20)">
                                <text x="0" y="0" fontSize="11" fontWeight="600" fill="#64748b">Actor Types:</text>
                                {[
                                    { type: "Startup", color: "#3b82f6" },
                                    { type: "Policymaker", color: "#dc2626" },
                                    { type: "Civil Society", color: "#16a34a" },
                                    { type: "Academic", color: "#9333ea" }
                                ].map((item, i) => (
                                    <g key={item.type} transform={`translate(0, ${(i + 1) * 18})`}>
                                        <circle cx="5" cy="0" r="4" fill={item.color} />
                                        <text x="12" y="0" fontSize="9" dominantBaseline="middle" fill="#64748b">
                                            {item.type}
                                        </text>
                                    </g>
                                ))}
                            </g>
                        </svg>
                    </CardContent>
                </Card>

                {/* Cultural Holes Visualization */}
                <Card className="min-h-[300px] flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-600" />
                                <CardTitle>Cultural Holes & Disconnects</CardTitle>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleAnalyzeHoles} disabled={isAnalyzingHoles}>
                                {isAnalyzingHoles ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    "Analyze Holes"
                                )}
                            </Button>
                        </div>
                        <CardDescription>
                            Identifying semantic distance and missing links between actor communities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 bg-slate-50/50 p-6 border-t">
                        {culturalHoles ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm text-slate-700">Connectivity Score</h4>
                                    <Badge variant={culturalHoles.overall_connectivity_score > 0.7 ? "default" : "destructive"}>
                                        {(culturalHoles.overall_connectivity_score * 100).toFixed(0)}%
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    {culturalHoles.holes?.map((hole: any, i: number) => (
                                        <div key={i} className="bg-white p-4 rounded-md border border-amber-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-amber-700 text-sm">{hole.concept}</span>
                                                <Badge variant="outline" className="text-xs">{hole.significance}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-600 mb-2">{hole.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span>Between:</span>
                                                {hole.between?.map((g: string) => (
                                                    <Badge key={g} variant="secondary" className="text-[10px] h-5">{g}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {culturalHoles.recommendations?.length > 0 && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <h4 className="font-semibold text-sm text-slate-700 mb-3">Bridging Recommendations</h4>
                                        <ul className="space-y-2">
                                            {culturalHoles.recommendations.map((rec: any, i: number) => (
                                                <li key={i} className="text-xs text-slate-600 flex gap-2">
                                                    <span className="font-bold text-indigo-600">• {rec.role}:</span>
                                                    {rec.action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-8">
                                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>No analysis yet.</p>
                                <p className="text-xs mt-1">Click "Analyze Holes" to detect disconnects.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
