"use client";

import { useState } from "react";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Share2, Database, Globe, Scale, Brain, Sparkles, Loader2 } from "lucide-react";

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

// Static Data (Fallback)
const STATIC_CONCEPTS = [
    {
        title: "Coloniality of Power",
        description: "The living legacy of colonialism in contemporary power structures, defining who has the authority to classify and organize the world.",
        quote: "The coloniality of power is not just a historical event, but a continuous process of ordering the world.",
        category: "Core Concept",
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
        title: "Border Thinking",
        description: "Epistemic response from the exteriority of modernity; thinking from the borders of modern/colonial world-system.",
        quote: "To think from the border is to challenge the universality of Western epistemology.",
        category: "Methodology",
        icon: Share2,
        colorClass: "bg-orange-100",
        iconClass: "text-orange-600",
    },
    {
        title: "Data Extractivism",
        description: "The process of extracting data from human life and turning it into a resource for capital accumulation.",
        quote: "Data is the new oil, but the extraction process leaves behind social pollution.",
        category: "Process",
        icon: Database,
        colorClass: "bg-green-100",
        iconClass: "text-green-600",
    },
    {
        title: "Epistemic Violence",
        description: "The destruction of non-Western ways of knowing and the imposition of a single, universalized epistemology.",
        quote: "The silencing of other ways of knowing is a form of violence.",
        category: "Impact",
        icon: Scale,
        colorClass: "bg-slate-100",
        iconClass: "text-slate-600",
    },
    {
        title: "Sociotechnical Assemblage",
        description: "Complex arrangements of humans, machines, norms, and resources that constitute AI systems as loosely coupled, emergently structured entities.",
        quote: "AI is not a thing, but an assemblage of social and technical relations that orchestrate value.",
        category: "Structure",
        icon: Network,
        colorClass: "bg-blue-100",
        iconClass: "text-blue-600",
    },
];

const STATIC_NETWORK_NODES = [
    { id: "0", label: "Coloniality", x: 250, y: 50, color: "#dc2626" },
    { id: "1", label: "Algorithmic\nRationality", x: 450, y: 150, color: "#9333ea" },
    { id: "2", label: "Border\nThinking", x: 50, y: 150, color: "#ea580c" },
    { id: "3", label: "Data\nExtractivism", x: 400, y: 300, color: "#16a34a" },
    { id: "4", label: "Epistemic\nViolence", x: 100, y: 300, color: "#64748b" },
    { id: "5", label: "Assemblage", x: 250, y: 200, color: "#3b82f6" },
];

const STATIC_NETWORK_LINKS = [
    { source: "0", target: "1", relation: "informs" },
    { source: "0", target: "4", relation: "causes" },
    { source: "0", target: "5", relation: "shapes" },
    { source: "1", target: "3", relation: "enables" },
    { source: "1", target: "5", relation: "structures" },
    { source: "2", target: "0", relation: "resists" },
    { source: "2", target: "4", relation: "counters" },
    { source: "3", target: "5", relation: "feeds" },
    { source: "4", target: "5", relation: "embedded in" },
];

export default function OntologyPage() {
    const { sources, isLoading } = useSources();
    const [selectedSourceId, setSelectedSourceId] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ontologyData, setOntologyData] = useState<OntologyData | null>(null);

    // Interactivity State
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Filter sources that have text available for analysis
    const analyzedSources = sources.filter(s => s.extractedText);

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
                    analysisMode: 'ontology'
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
                setOntologyData({
                    summary: data.analysis.summary,
                    nodes: processedNodes,
                    links: data.analysis.links
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

    const getColorForCategory = (category: string) => {
        const lower = category.toLowerCase();
        if (lower.includes('core') || lower.includes('concept')) return "#dc2626"; // Red
        if (lower.includes('mechanism')) return "#9333ea"; // Purple
        if (lower.includes('actor')) return "#2563eb"; // Blue
        if (lower.includes('value')) return "#16a34a"; // Green
        if (lower.includes('methodology')) return "#ea580c"; // Orange
        return "#64748b"; // Slate
    };

    const getColorClassForCategory = (category: string) => {
        const lower = category.toLowerCase();
        if (lower.includes('core') || lower.includes('concept')) return { bg: "bg-red-100", text: "text-red-600", border: "border-red-200" };
        if (lower.includes('mechanism')) return { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" };
        if (lower.includes('actor')) return { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" };
        if (lower.includes('value')) return { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" };
        if (lower.includes('methodology')) return { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" };
        return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
    };

    // Use static data if no dynamic data is generated
    const displayNodes = ontologyData ? ontologyData.nodes : STATIC_NETWORK_NODES;
    const displayLinks = ontologyData ? ontologyData.links : STATIC_NETWORK_LINKS;

    // Filtered cards based on selection
    const filteredNodes = selectedNodeId
        ? displayNodes.filter(n => n.id === selectedNodeId)
        : displayNodes;

    // Helper to check if a node is connected to the hovered node
    const isConnected = (nodeId: string) => {
        if (!hoveredNodeId) return false;
        return displayLinks.some(link =>
            (link.source === hoveredNodeId && link.target === nodeId) ||
            (link.target === hoveredNodeId && link.source === nodeId)
        );
    };

    const handleNodeClick = (nodeId: string) => {
        if (selectedNodeId === nodeId) {
            setSelectedNodeId(null); // Deselect
        } else {
            setSelectedNodeId(nodeId); // Select
            // Scroll to cards section
            const cardsSection = document.getElementById('concept-cards');
            if (cardsSection) {
                cardsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ontological Cartography of Algorithmic Assemblages</h2>
                    <p className="text-slate-500">Mapping the key concepts, materialities, and relationships in the sociotechnical assemblage.</p>
                </div>
            </div>

            {/* Analysis Controls */}
            <Card className="border-indigo-100 bg-indigo-50/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-indigo-600" />
                        <CardTitle>Assemblage Mapping</CardTitle>
                    </div>
                    <CardDescription>Select a document to extract its conceptual ontology</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Select Document</label>
                            <select
                                className="w-full p-2 border rounded-md text-sm bg-white"
                                value={selectedSourceId}
                                onChange={(e) => setSelectedSourceId(e.target.value)}
                            >
                                <option value="">Select a source...</option>
                                {analyzedSources.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                            onClick={handleGenerateOntology}
                            disabled={!selectedSourceId || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                    Extracting...
                                </>
                            ) : (
                                <>
                                    <Network className="mr-2 h-4 w-4" />
                                    Generate Map
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Ontology Summary */}
            {ontologyData?.summary && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-600" />
                            <CardTitle className="text-lg">Ontological Summary</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {ontologyData.summary}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Network Visualization */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{ontologyData ? "Extracted Concept Map" : "Concept Network (Example)"}</CardTitle>
                            <CardDescription>
                                {ontologyData
                                    ? "Interactive map. Hover to see connections, click to filter details."
                                    : "Static example. Hover to see connections, click to filter details."}
                            </CardDescription>
                        </div>
                        {/* Legend */}
                        <div className="flex gap-3 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                                <span>Core Concept</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                                <span>Mechanism</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                <span>Actor/Structure</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                <span>Value/Process</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center overflow-x-auto bg-slate-50/50 py-8">
                    <svg width="700" height="500" className="border border-slate-200 rounded-lg bg-white shadow-sm">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="32" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                            </marker>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Links */}
                        {displayLinks.map((link, i) => {
                            const sourceNode = displayNodes.find(n => n.id === link.source);
                            const targetNode = displayNodes.find(n => n.id === link.target);

                            if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) return null;

                            // Determine opacity based on hover/selection
                            const isRelated = hoveredNodeId === link.source || hoveredNodeId === link.target || selectedNodeId === link.source || selectedNodeId === link.target;
                            const isDimmed = (hoveredNodeId && !isRelated) || (selectedNodeId && !isRelated);
                            const opacity = isDimmed ? 0.1 : 1;
                            const strokeWidth = isRelated ? 2.5 : 1.5;
                            const strokeColor = isRelated ? "#64748b" : "#cbd5e1";

                            return (
                                <g key={i} style={{ transition: 'all 0.3s ease' }}>
                                    <line
                                        x1={sourceNode.x}
                                        y1={sourceNode.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                        opacity={opacity}
                                        markerEnd="url(#arrowhead)"
                                    />
                                    {/* Link Label - Only show if related or no hover */}
                                    {(!hoveredNodeId || isRelated) && (
                                        <text
                                            x={(sourceNode.x + targetNode.x) / 2}
                                            y={(sourceNode.y + targetNode.y) / 2 - 5}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="#64748b"
                                            opacity={opacity}
                                            className="pointer-events-none select-none"
                                        >
                                            {link.relation}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Nodes */}
                        {displayNodes.map((node) => {
                            const isHovered = hoveredNodeId === node.id;
                            const isSelected = selectedNodeId === node.id;
                            const isConnectedToHover = isConnected(node.id);
                            const isDimmed = (hoveredNodeId && !isHovered && !isConnectedToHover) || (selectedNodeId && !isSelected && selectedNodeId !== null && !hoveredNodeId);

                            const opacity = isDimmed ? 0.3 : 1;
                            const scale = isHovered || isSelected ? 1.1 : 1;
                            const strokeWidth = isSelected ? 3 : (isHovered ? 2 : 0);
                            const strokeColor = isSelected ? "#0f172a" : node.color;

                            const tx = node.x || 0;
                            const ty = node.y || 0;

                            return (
                                <g
                                    key={node.id}
                                    onClick={() => handleNodeClick(node.id)}
                                    onMouseEnter={() => setHoveredNodeId(node.id)}
                                    onMouseLeave={() => setHoveredNodeId(null)}
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease', opacity }}
                                    transform={`translate(${tx}, ${ty}) scale(${scale}) translate(${-tx}, ${-ty})`}
                                >
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r="35"
                                        fill="white"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                        filter={isHovered || isSelected ? "url(#glow)" : ""}
                                    />
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r="30"
                                        fill={node.color || "#64748b"}
                                        opacity="0.15"
                                    />
                                    <text
                                        x={node.x}
                                        y={node.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="11"
                                        fontWeight="600"
                                        fill="#1e293b"
                                        className="pointer-events-none select-none"
                                    >
                                        {node.label.split(/[\s_]+/).slice(0, 2).map((line, i) => (
                                            <tspan key={i} x={node.x} dy={i === 0 ? (node.label.split(/[\s_]+/).length > 1 ? -6 : 0) : 12}>
                                                {line}
                                            </tspan>
                                        ))}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </CardContent>
            </Card>

            {/* Concept Cards */}
            <div id="concept-cards" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">
                        {selectedNodeId ? "Selected Concept Details" : "All Concepts"}
                    </h3>
                    {selectedNodeId && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedNodeId(null)}>
                            Show All
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {ontologyData ? (
                        filteredNodes.map((n) => {
                            const node = n as OntologyNode;
                            const colors = getColorClassForCategory(node.category);
                            return (
                                <Card key={node.id} className={`hover:shadow-md transition-all duration-300 ${selectedNodeId === node.id ? 'ring-2 ring-indigo-500 shadow-lg' : ''}`}>
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-semibold">{node.label}</CardTitle>
                                            <Badge variant="secondary" className="mt-1">
                                                {node.category}
                                            </Badge>
                                        </div>
                                        <div className={`rounded-full p-2 ${colors.bg}`}>
                                            <Brain className={`h-5 w-5 ${colors.text}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                            {node.description || "No description available."}
                                        </p>
                                        {node.quote && (
                                            <div className="mt-4 p-3 bg-slate-50 border-l-4 border-indigo-200 rounded-r text-xs italic text-slate-700">
                                                &quot;{node.quote}&quot;
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        // Static fallback logic with filtering
                        (selectedNodeId
                            ? STATIC_CONCEPTS.filter((_, i) => STATIC_NETWORK_NODES[i].id === selectedNodeId)
                            : STATIC_CONCEPTS
                        ).map((concept) => (
                            <Card key={concept.title} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold">{concept.title}</CardTitle>
                                        <Badge variant="secondary" className="mt-1">
                                            {concept.category}
                                        </Badge>
                                    </div>
                                    <div className={`rounded-full p-2 ${concept.colorClass}`}>
                                        <concept.icon className={`h-5 w-5 ${concept.iconClass}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                        {concept.description}
                                    </p>
                                    {concept.quote && (
                                        <div className="mt-4 p-3 bg-slate-50 border-l-4 border-indigo-200 rounded-r text-xs italic text-slate-700">
                                            &quot;{concept.quote}&quot;
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
