"use client";

import { useState, useRef, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Share2, Database, Globe, Scale, Brain, Sparkles, Loader2, RefreshCw, X, ArrowRightLeft, Check, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface OntologyNode {
    id: string;
    label: string;
    category: string;
    description?: string;
    quote?: string;
    x?: number;
    y?: number;
    color?: string;
}

interface OntologyLink {
    source: string;
    target: string;
    relation: string;
}

interface OntologyData {
    summary?: string;
    nodes: OntologyNode[];
    links: OntologyLink[];
}

interface ComparisonResult {
    summary: string;
    shared_concepts: string[];
    unique_concepts_source_a: string[];
    unique_concepts_source_b: string[];
    structural_differences: string;
    relationship_divergences: { concept: string; difference: string }[];
}

// Static Data (Fallback)
const STATIC_CONCEPTS = [
    {
        title: "Coloniality of Power",
        description: "The living legacy of colonialism in contemporary power structures, defining who has the authority to classify and organize the world.",
        quote: "The coloniality of power is not just a historical event, but a continuous process of ordering the world.",
        category: "Core",
        icon: Globe,
        colorClass: "bg-red-100",
        iconClass: "text-red-600",
    },
    {
        title: "Algorithmic Rationality",
        description: "The logic by which algorithms order, sort, and prioritize information, often embedding specific cultural and epistemological values.",
        quote: "Algorithms are not neutral tools; they are crystallized forms of rationality.",
        category: "Mechanism",
        icon: Brain,
        colorClass: "bg-purple-100",
        iconClass: "text-purple-600",
    },
    {
        title: "Global South State",
        description: "The political entity situated in the periphery of the world-system, navigating the imposition of external AI norms while asserting sovereignty.",
        quote: "The state in the Global South is not merely a regulator but a site of contestation.",
        category: "Actor",
        icon: Share2,
        colorClass: "bg-blue-100",
        iconClass: "text-blue-600",
    },
    {
        title: "Data Extractivism",
        description: "The process of extracting data from human life and turning it into a resource for capital accumulation.",
        quote: "Data is the new oil, but the extraction process leaves behind social pollution.",
        category: "Mechanism",
        icon: Database,
        colorClass: "bg-purple-100",
        iconClass: "text-purple-600",
    },
    {
        title: "Fundamental Rights",
        description: "The set of ethical and legal principles protected by frameworks like the EU AI Act, often framed as universal but historically situated.",
        quote: "Rights are the language through which power is negotiated and contested.",
        category: "Value",
        icon: Scale,
        colorClass: "bg-green-100",
        iconClass: "text-green-600",
    },
    {
        title: "Sociotechnical Assemblage",
        description: "Complex arrangements of humans, machines, norms, and resources that constitute AI systems as loosely coupled, emergently structured entities.",
        quote: "AI is not a thing, but an assemblage of social and technical relations that orchestrate value.",
        category: "Core",
        icon: Network,
        colorClass: "bg-red-100",
        iconClass: "text-red-600",
    },
];

const STATIC_NETWORK_NODES = [
    { id: "0", label: "Coloniality", x: 250, y: 50, color: "#fca5a5" },
    { id: "1", label: "Algorithmic\nRationality", x: 450, y: 150, color: "#d8b4fe" },
    { id: "2", label: "Global South\nState", x: 50, y: 150, color: "#93c5fd" },
    { id: "3", label: "Data\nExtractivism", x: 400, y: 300, color: "#d8b4fe" },
    { id: "4", label: "Fundamental\nRights", x: 100, y: 300, color: "#86efac" },
    { id: "5", label: "Assemblage", x: 250, y: 200, color: "#fca5a5" },
];

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
    const { sources, isLoading } = useSources();
    const [selectedSourceId, setSelectedSourceId] = useServerStorage<string>("ontology_selected_source_id", "");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Store multiple maps keyed by source ID
    const [ontologyMaps, setOntologyMaps] = useServerStorage<Record<string, OntologyData>>("ontology_maps", {});

    // Comparison State
    const [isComparing, setIsComparing] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isComparingLoading, setIsComparingLoading] = useState(false);

    // Interactivity State
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useServerStorage<string | null>("ontology_selected_node_id", null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Filter sources that have text available for analysis
    const analyzedSources = sources.filter(s => s.extractedText);

    // Get the currently active map based on selectedSourceId
    const currentOntologyData = (selectedSourceId && ontologyMaps && ontologyMaps[selectedSourceId])
        ? ontologyMaps[selectedSourceId]
        : null;

    const getColorForCategory = (category: string) => {
        const lower = category.toLowerCase();
        // Using lighter pastel shades (300/400) for better text readability
        if (lower.includes('core') || lower.includes('concept')) return "#fca5a5"; // Red-300
        if (lower.includes('mechanism')) return "#d8b4fe"; // Purple-300
        if (lower.includes('actor')) return "#93c5fd"; // Blue-300
        if (lower.includes('value')) return "#86efac"; // Green-300
        if (lower.includes('methodology')) return "#fdba74"; // Orange-300
        return "#cbd5e1"; // Slate-300
    };

    const handleGenerateOntology = async () => {
        const source = analyzedSources.find(s => s.id === selectedSourceId);
        if (!source || !source.extractedText) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: source.extractedText.substring(0, 3000), // Limit text length
                    analysisMode: 'ontology',
                    force: true // Force refresh to bypass cache
                })
            });

            const data = await response.json();
            if (data.success && data.analysis) {
                // Process nodes to add coordinates and colors
                const processedNodes = data.analysis.nodes.map((node: OntologyNode, index: number) => ({
                    ...node,
                    x: 300 + 200 * Math.cos(2 * Math.PI * index / data.analysis.nodes.length),
                    y: 200 + 150 * Math.sin(2 * Math.PI * index / data.analysis.nodes.length),
                    color: getColorForCategory(node.category)
                }));

                const newMap: OntologyData = {
                    summary: data.analysis.summary,
                    nodes: processedNodes,
                    links: data.analysis.links
                };

                // Update the maps record
                setOntologyMaps({
                    ...ontologyMaps,
                    [selectedSourceId]: newMap
                });
            } else {
                alert("Analysis failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Ontology generation error:", error);
            alert("Failed to generate ontology.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCompareOntologies = async () => {
        if (selectedForComparison.length !== 2) return;

        const sourceAId = selectedForComparison[0];
        const sourceBId = selectedForComparison[1];
        const sourceA = sources.find(s => s.id === sourceAId);
        const sourceB = sources.find(s => s.id === sourceBId);
        const mapA = ontologyMaps?.[sourceAId];
        const mapB = ontologyMaps?.[sourceBId];

        if (!sourceA || !sourceB || !mapA || !mapB) return;

        setIsComparingLoading(true);
        setComparisonResult(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisMode: 'ontology_comparison',
                    sourceA: { title: sourceA.title, data: mapA },
                    sourceB: { title: sourceB.title, data: mapB },
                    force: true
                })
            });

            const data = await response.json();
            if (data.success && data.analysis) {
                setComparisonResult(data.analysis);
            } else {
                alert("Comparison failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Comparison error:", error);
            alert("Failed to compare ontologies.");
        } finally {
            setIsComparingLoading(false);
        }
    };

    const toggleComparisonSelection = (sourceId: string) => {
        if (selectedForComparison.includes(sourceId)) {
            setSelectedForComparison(prev => prev.filter(id => id !== sourceId));
        } else {
            if (selectedForComparison.length < 2) {
                setSelectedForComparison(prev => [...prev, sourceId]);
            }
        }
    };

    // Dragging Logic
    const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setDraggingNodeId(nodeId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingNodeId || !currentOntologyData || !svgRef.current) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const y = e.clientY - svgRect.top;

        // Update the specific map in the record
        if (selectedSourceId) {
            const updatedNodes = currentOntologyData.nodes.map(node =>
                node.id === draggingNodeId ? { ...node, x, y } : node
            );

            setOntologyMaps({
                ...ontologyMaps,
                [selectedSourceId]: {
                    ...currentOntologyData,
                    nodes: updatedNodes
                }
            });
        }
    };

    const handleMouseUp = () => {
        setDraggingNodeId(null);
    };

    // Filtering Logic
    const displayNodes = currentOntologyData
        ? currentOntologyData.nodes.filter(n => !selectedCategory || n.category === selectedCategory)
        : STATIC_NETWORK_NODES; // Fallback for static visualization

    const displayLinks = currentOntologyData
        ? currentOntologyData.links.filter(l => {
            const sourceNode = currentOntologyData.nodes.find(n => n.id === l.source);
            const targetNode = currentOntologyData.nodes.find(n => n.id === l.target);
            // Only show link if both nodes are visible
            if (selectedCategory) {
                return sourceNode?.category === selectedCategory && targetNode?.category === selectedCategory;
            }
            return true;
        })
        : STATIC_NETWORK_LINKS;

    const selectedNode = currentOntologyData
        ? currentOntologyData.nodes.find(n => n.id === selectedNodeId)
        : null; // Static nodes handled in render

    const selectedNodeColors = selectedNode ? {
        bg: selectedNode.color || getColorForCategory(selectedNode.category),
        text: "text-slate-900"
    } : null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Network className="h-8 w-8 text-indigo-600" />
                        Concept Network
                    </h2>
                    <div className="text-slate-500 mt-2 flex flex-wrap items-center gap-2 text-sm">
                        Visualizing the assemblage:
                        <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 cursor-default">Core</Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 cursor-default">Mechanism</Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 cursor-default">Actor</Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 cursor-default">Value</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant={isComparing ? "secondary" : "outline"}
                        onClick={() => {
                            setIsComparing(!isComparing);
                            setComparisonResult(null);
                            setSelectedForComparison([]);
                        }}
                        className="gap-2"
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        {isComparing ? "Exit Comparison" : "Compare Maps"}
                    </Button>

                    {!isComparing && (
                        <>
                            <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Select a source to analyze" />
                                </SelectTrigger>
                                <SelectContent>
                                    {analyzedSources.map((source) => (
                                        <SelectItem key={source.id} value={source.id}>
                                            {source.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleGenerateOntology}
                                disabled={!selectedSourceId || isAnalyzing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Map
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Comparison Result View */}
            {isComparing && comparisonResult && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-indigo-50 border-indigo-200">
                        <CardHeader>
                            <CardTitle className="text-xl text-indigo-900">Comparison Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-indigo-800 leading-relaxed">
                                {comparisonResult.summary}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Structural Differences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600">
                                    {comparisonResult.structural_differences}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Shared Concepts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {comparisonResult.shared_concepts.map((concept, i) => (
                                        <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {concept}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-slate-500">Unique to Source A</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {comparisonResult.unique_concepts_source_a.map((concept, i) => (
                                        <Badge key={i} variant="secondary">
                                            {concept}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-slate-500">Unique to Source B</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {comparisonResult.unique_concepts_source_b.map((concept, i) => (
                                        <Badge key={i} variant="secondary">
                                            {concept}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Main Visualization (Hidden when comparing to focus on results/selection) */}
            {!isComparing && (
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Visualization Column */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="h-[600px] flex flex-col overflow-hidden border-slate-200 shadow-sm">
                                <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                        Concept Map
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {selectedCategory && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedCategory(null)}
                                                className="h-6 px-2 text-xs text-slate-500 hover:text-slate-900"
                                            >
                                                <RefreshCw className="mr-1 h-3 w-3" />
                                                Restore All
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <div className="flex-1 bg-slate-50 relative overflow-hidden">
                                    <svg
                                        ref={svgRef}
                                        className="w-full h-full cursor-grab active:cursor-grabbing"
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                    >
                                        {/* Links */}
                                        {displayLinks.map((link, i) => {
                                            // Find coordinates (handle both dynamic and static fallback)
                                            const source = displayNodes.find(n => n.id === link.source);
                                            const target = displayNodes.find(n => n.id === link.target);
                                            if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return null;

                                            const midX = (source.x + target.x) / 2;
                                            const midY = (source.y + target.y) / 2;

                                            return (
                                                <g key={i}>
                                                    <line
                                                        x1={source.x}
                                                        y1={source.y}
                                                        x2={target.x}
                                                        y2={target.y}
                                                        stroke="#cbd5e1"
                                                        strokeWidth="2"
                                                    />
                                                    <text
                                                        x={midX}
                                                        y={midY}
                                                        textAnchor="middle"
                                                        dy={-4}
                                                        className="text-[10px] fill-slate-500 font-medium pointer-events-none select-none"
                                                        style={{ textShadow: "0 0 4px white, 0 0 4px white" }}
                                                    >
                                                        {link.relation}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Nodes */}
                                        {displayNodes.map((node) => (
                                            <g
                                                key={node.id}
                                                transform={`translate(${node.x},${node.y})`}
                                                onMouseEnter={() => setHoveredNodeId(node.id)}
                                                onMouseLeave={() => setHoveredNodeId(null)}
                                                onMouseDown={(e) => handleMouseDown(e, node.id)}
                                                onClick={() => setSelectedNodeId(node.id)}
                                                className="cursor-pointer transition-opacity duration-200"
                                                style={{
                                                    opacity: hoveredNodeId && hoveredNodeId !== node.id ? 0.4 : 1
                                                }}
                                            >
                                                <circle
                                                    r={selectedNodeId === node.id ? 45 : 40}
                                                    fill={node.color || getColorForCategory(node.category)}
                                                    className="transition-all duration-300 shadow-sm"
                                                    stroke={selectedNodeId === node.id ? "#4f46e5" : "white"}
                                                    strokeWidth={selectedNodeId === node.id ? 3 : 2}
                                                />
                                                <foreignObject x="-35" y="-35" width="70" height="70">
                                                    <div className="h-full w-full flex items-center justify-center text-center">
                                                        <span className="text-xs font-medium text-slate-800 line-clamp-3 leading-tight px-1">
                                                            {node.label}
                                                        </span>
                                                    </div>
                                                </foreignObject>
                                            </g>
                                        ))}
                                    </svg>

                                    {/* Legend Overlay */}
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
                                        <div className="text-xs font-semibold text-slate-500 mb-2">Legend</div>
                                        {['Core', 'Mechanism', 'Actor', 'Value'].map(cat => (
                                            <div
                                                key={cat}
                                                className={`flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded ${selectedCategory === cat ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
                                                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: getColorForCategory(cat) }}
                                                />
                                                <span className="text-xs text-slate-600">{cat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Concepts List Column */}
                        <div className="space-y-4 h-[600px] overflow-y-auto pr-2">
                            <h3 className="text-lg font-semibold text-slate-900 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
                                All Concepts
                            </h3>
                            <div className="space-y-3">
                                {displayNodes.length > 0 ? (
                                    displayNodes.map((node) => (
                                        <Card
                                            key={node.id}
                                            className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${selectedNodeId === node.id ? 'ring-2 ring-indigo-500' : ''}`}
                                            style={{ borderLeftColor: node.color || getColorForCategory(node.category) }}
                                            onClick={() => setSelectedNodeId(node.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-slate-900">{node.label}</h4>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                        {node.category}
                                                    </Badge>
                                                </div>
                                                {node.description && (
                                                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                                        {node.description}
                                                    </p>
                                                )}
                                                {node.quote && (
                                                    <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-500 italic border-l-2 border-slate-200">
                                                        &quot;{node.quote.substring(0, 80)}...&quot;
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400 text-sm">
                                        No concepts found for this category.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Gallery of Generated Maps */}
            {ontologyMaps && Object.keys(ontologyMaps).length > 0 && (
                <div className="space-y-4 mt-12 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-slate-900">All Generated Maps</h3>
                        {isComparing && (
                            <Button
                                onClick={handleCompareOntologies}
                                disabled={selectedForComparison.length !== 2 || isComparingLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isComparingLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Comparing...
                                    </>
                                ) : (
                                    <>
                                        Compare Selected ({selectedForComparison.length})
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {isComparing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold">Comparison Mode Active</p>
                                <p>Select exactly two maps from the list below to compare their concepts and structures.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(ontologyMaps).map(([sourceId, mapData]) => {
                            const source = sources.find(s => s.id === sourceId);
                            if (!source) return null;

                            const isSelectedForComparison = selectedForComparison.includes(sourceId);
                            const isCurrentlyViewing = selectedSourceId === sourceId;

                            return (
                                <Card
                                    key={sourceId}
                                    className={`overflow-hidden transition-all ${isSelectedForComparison
                                            ? 'ring-2 ring-indigo-500 shadow-md'
                                            : isCurrentlyViewing && !isComparing
                                                ? 'ring-2 ring-indigo-200'
                                                : 'hover:shadow-md'
                                        }`}
                                    onClick={() => isComparing && toggleComparisonSelection(sourceId)}
                                >
                                    <CardHeader className="pb-2 bg-slate-50/50 flex flex-row items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base font-semibold text-slate-900 truncate max-w-[200px]">
                                                {source.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {mapData.nodes.length} Concepts • {mapData.links.length} Links
                                            </CardDescription>
                                        </div>
                                        {isComparing && (
                                            <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${isSelectedForComparison ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                                {isSelectedForComparison && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <p className="text-xs text-slate-500 line-clamp-3 mb-4 h-12">
                                            {mapData.summary || "No summary available."}
                                        </p>
                                        {!isComparing && (
                                            <Button
                                                variant={isCurrentlyViewing ? "secondary" : "outline"}
                                                className="w-full text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSourceId(sourceId);
                                                }}
                                            >
                                                {isCurrentlyViewing ? "Currently Viewing" : "View Map"}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Concept Modal */}
            <Dialog open={!!selectedNodeId} onOpenChange={(open) => !open && setSelectedNodeId(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    {selectedNode && selectedNodeColors && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-full p-2 ${selectedNodeColors.bg}`}>
                                            <Brain className={`h-6 w-6 ${selectedNodeColors.text}`} />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl font-bold text-slate-900">
                                                {selectedNode.label}
                                            </DialogTitle>
                                            <div className="mt-1">
                                                <Badge variant="outline" className={`${selectedNodeColors.text} ${selectedNodeColors.bg} border-0`}>
                                                    {selectedNode.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="py-4 space-y-6">
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

                                {/* Static example fallback for static nodes if needed */}
                                {!currentOntologyData && (
                                    <div className="text-xs text-slate-400 mt-4">
                                        * This is a static example node.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {/* Handle Static Node Details Lookup if needed */}
                    {!currentOntologyData && selectedNode && !selectedNode.description && (
                        (() => {
                            const staticConcept = STATIC_CONCEPTS[parseInt(selectedNode.id)];
                            if (!staticConcept) return null;
                            return (
                                <>
                                    <DialogHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-full p-2 ${staticConcept.colorClass}`}>
                                                <staticConcept.icon className={`h-6 w-6 ${staticConcept.iconClass}`} />
                                            </div>
                                            <div>
                                                <DialogTitle className="text-2xl font-bold text-slate-900">
                                                    {staticConcept.title}
                                                </DialogTitle>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className="bg-slate-100">
                                                        {staticConcept.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogHeader>
                                    <div className="py-4 space-y-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                                            <p className="text-slate-700 leading-relaxed">
                                                {staticConcept.description}
                                            </p>
                                        </div>
                                        {staticConcept.quote && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidence</h4>
                                                <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r">
                                                    <p className="text-slate-700 italic">
                                                        &quot;{staticConcept.quote}&quot;
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
