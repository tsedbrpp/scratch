"use client";

import { useState, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { generateImage } from "@/services/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Network, Zap, Plus, Search, Globe, Loader2, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Placeholder types for Ecosystem Actors
interface EcosystemActor {
    id: string;
    name: string;
    type: "Startup" | "Policymaker" | "Civil Society" | "Academic" | "Infrastructure";
    description: string;
    influence: "High" | "Medium" | "Low";
    url?: string;
}



export default function EcosystemPage() {
    const [actors, setActors] = useServerStorage<EcosystemActor[]>("ecosystem_actors", []);
    const [selectedActorId, setSelectedActorId] = useServerStorage<string | null>("ecosystem_selected_actor_id", null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationQuery, setSimulationQuery] = useServerStorage<string>("ecosystem_simulation_query", "AI startups and policy actors in Brussels");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [culturalHoles, setCulturalHoles] = useServerStorage<any>("ecosystem_cultural_holes", null);
    const [isAnalyzingHoles, setIsAnalyzingHoles] = useState(false);

    // Graph interaction state
    const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);



    // Initialize positions when actors change
    useState(() => {
        const newPositions = { ...positions };
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

        if (hasChanges) {
            setPositions(newPositions);
        }
    });

    // Update positions if actors list changes (e.g. cleared or added)
    // We use a separate effect to handle updates to the actor list after mount
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
    }, [actors.length, actors.map(a => a.id).join(',')]);

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
                setActors(prev => {
                    const existingNames = new Set(prev.map(a => a.name.toLowerCase()));
                    const newUniqueActors = data.actors.filter((a: EcosystemActor) => !existingNames.has(a.name.toLowerCase()));

                    if (newUniqueActors.length === 0) {
                        alert("No new unique actors found.");
                        return prev;
                    }

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
        setPositions({});
    };

    const handleClearCache = async () => {
        try {
            const response = await fetch('/api/ecosystem/clear-cache', {
                method: 'POST',
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


    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent, actorId: string) => {
        e.stopPropagation();
        setDraggingId(actorId);
        setSelectedActorId(actorId);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!draggingId) return;

        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        setPositions(prev => ({
            ...prev,
            [draggingId]: { x: svgP.x, y: svgP.y }
        }));
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            {/* Sidebar: Actor Management */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
                <Card className="h-[500px] lg:h-full flex flex-col">
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
                                            <DialogTitle>Discover Actors</DialogTitle>
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
                                                    className="col-span-3 text-slate-900"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={handleClearCache}>
                                                Clear Cache
                                            </Button>
                                            <Button onClick={handleSimulate} disabled={isSimulating}>
                                                {isSimulating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Discovering...
                                                    </>
                                                ) : (
                                                    "Discover"
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
                                className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-slate-50 text-slate-900"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0">
                        {actors.length === 0 && (
                            <div className="text-center p-6 text-slate-500 text-sm border-2 border-dashed border-slate-100 rounded-lg m-2">
                                <Globe className="h-8 w-8 mx-auto mb-2 text-indigo-200" />
                                <p>No actors found.</p>
                                <p className="mt-2 text-xs">Click the <Globe className="inline h-3 w-3 text-indigo-600" /> icon above to simulate ecosystem data.</p>
                            </div>
                        )}
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
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{actor.description}</p>
                                {actor.url && (
                                    <a
                                        href={actor.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Visit Website
                                    </a>
                                )}
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
                            Visualizing ties between actors. Drag nodes to rearrange the network.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 bg-slate-50/50 p-6 border-t">
                        <svg
                            width="100%"
                            height="400"
                            className="border border-slate-200 rounded-lg bg-white cursor-move"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
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
                                        (source.type === "Civil Society" && target.type === "Academic") ||
                                        (source.type === "Infrastructure" && target.type === "Startup") ||
                                        (source.type === "Infrastructure" && target.type === "Policymaker") ||
                                        (source.type === "Infrastructure" && target.type === "Academic")
                                    );

                                    if (!shouldConnect) return null;

                                    // Determine label based on relationship
                                    let label = "";
                                    if (source.type === "Policymaker" && target.type === "Civil Society") label = "Consultation";
                                    else if (source.type === "Startup" && target.type === "Academic") label = "R&D";
                                    else if (source.type === "Policymaker" && target.type === "Startup") label = "Regulation";
                                    else if (source.type === "Civil Society" && target.type === "Academic") label = "Data";
                                    else if (source.type === "Infrastructure" && target.type === "Startup") label = "Built By";
                                    else if (source.type === "Infrastructure" && target.type === "Policymaker") label = "Regulates";
                                    else if (source.type === "Infrastructure" && target.type === "Academic") label = "Studies";
                                    else label = "Link";

                                    // Get positions from state
                                    const pos1 = positions[source.id];
                                    const pos2 = positions[target.id];

                                    if (!pos1 || !pos2) return null;

                                    const x1 = pos1.x;
                                    const y1 = pos1.y;
                                    const x2 = pos2.x;
                                    const y2 = pos2.y;

                                    // Midpoint for label
                                    const midX = (x1 + x2) / 2;
                                    const midY = (y1 + y2) / 2;

                                    const isHighlighted = selectedActorId === source.id || selectedActorId === target.id;
                                    const opacity = selectedActorId && !isHighlighted ? 0.15 : 0.4;

                                    return (
                                        <g key={`${source.id}-${target.id}`} style={{ transition: 'opacity 0.3s ease', opacity }}>
                                            <line
                                                x1={x1}
                                                y1={y1}
                                                x2={x2}
                                                y2={y2}
                                                stroke="#94a3b8"
                                                strokeWidth={isHighlighted ? 2 : 1}
                                                markerEnd="url(#actor-arrow)"
                                            />
                                            <rect
                                                x={midX - 24}
                                                y={midY - 8}
                                                width="48"
                                                height="16"
                                                rx="4"
                                                fill="white"
                                                stroke="#e2e8f0"
                                                strokeWidth="1"
                                            />
                                            <text
                                                x={midX}
                                                y={midY}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize="9"
                                                fill="#64748b"
                                                fontWeight="500"
                                            >
                                                {label}
                                            </text>
                                        </g>
                                    );
                                })
                            )}

                            {/* Actor nodes */}
                            {actors.map((actor, i) => {
                                const pos = positions[actor.id];
                                if (!pos) return null;

                                const x = pos.x;
                                const y = pos.y;

                                const isSelected = selectedActorId === actor.id;
                                const isDimmed = selectedActorId && !isSelected;
                                const opacity = isDimmed ? 0.3 : 1;
                                const scale = isSelected ? 1.15 : 1;

                                // Color by type
                                const colorMap: Record<string, string> = {
                                    "Startup": "#3b82f6",
                                    "Policymaker": "#dc2626",
                                    "Civil Society": "#16a34a",
                                    "Academic": "#9333ea",
                                    "Infrastructure": "#f59e0b"
                                };
                                const color = colorMap[actor.type] || "#64748b";

                                return (
                                    <g
                                        key={actor.id}
                                        onMouseDown={(e) => handleMouseDown(e, actor.id)}
                                        style={{ cursor: 'grab', transition: draggingId === actor.id ? 'none' : 'all 0.3s ease', opacity }}
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
                                    { type: "Academic", color: "#9333ea" },
                                    { type: "Infrastructure", color: "#f59e0b" }
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
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
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

                                <ConceptCloud holes={culturalHoles.holes} />

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
                                            <CulturalHoleChart hole={hole} />
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

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function CulturalHoleChart({ hole }: { hole: any }) {
    if (!hole.scores) return null;

    const data = Object.entries(hole.scores).map(([name, score]) => ({
        name,
        score: score as number
    }));

    return (
        <div className="mt-4 h-[150px] w-full">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Concept Affinity Gap</p>
                <div className="flex gap-2 text-[9px] text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>High Affinity</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>Low Affinity</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 10]} hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score < 5 ? '#f59e0b' : '#3b82f6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function ConceptCloud({ holes }: { holes: any[] }) {
    if (!holes || holes.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            {holes.map((hole, i) => {
                const size = hole.significance === 'High' ? 'text-lg' : hole.significance === 'Medium' ? 'text-sm' : 'text-xs';
                const weight = hole.significance === 'High' ? 'font-bold' : 'font-medium';
                const opacity = hole.significance === 'High' ? 'opacity-100' : 'opacity-70';

                return (
                    <span key={i} className={`${size} ${weight} ${opacity} text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-100 shadow-sm`}>
                        {hole.concept}
                    </span>
                );
            })}
        </div>
    );
}
