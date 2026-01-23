"use client";

import { useState } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources";
import { useDemoMode } from "@/hooks/useDemoMode"; // [NEW]
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, ArrowRightLeft, Sparkles, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OntologyData, OntologyNode, ComparisonResult } from "@/types/ontology";
import { getColorForCategory } from "@/lib/ontology-utils";
import { CreditTopUpDialog } from "@/components/CreditTopUpDialog"; // [NEW]
import { useCredits } from "@/hooks/useCredits"; // [NEW]

// Components
import { OntologyMap } from "@/components/ontology/OntologyMap";
import { ConceptList } from "@/components/ontology/ConceptList";
import { MapGallery } from "@/components/ontology/MapGallery";
import { ConceptDetailsModal } from "@/components/ontology/ConceptDetailsModal";
import { ComparisonView } from "@/components/ontology/ComparisonView";

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

    // Comparison State
    const [isComparing, setIsComparing] = useServerStorage<boolean>("ontology_is_comparing", false);
    const [selectedForComparison, setSelectedForComparison] = useServerStorage<string[]>("ontology_selected_comparison_ids", []);
    const [comparisonResult, setComparisonResult, isComparisonResultLoading] = useServerStorage<ComparisonResult | null>("ontology_comparison_result", null);
    const [isComparingLoading, setIsComparingLoading] = useState(false);

    // Interactivity State
    const [selectedNodeId, setSelectedNodeId] = useServerStorage<string | null>("ontology_selected_node_id", null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Credit System
    const { hasCredits, refetch: refetchCredits, loading: creditsLoading } = useCredits();
    const [showTopUp, setShowTopUp] = useState(false);

    // Filter sources that have text available for analysis
    const analyzedSources = sources.filter(s => s.extractedText);

    // Get the currently active map based on selectedSourceId
    const currentOntologyData = (selectedSourceId && ontologyMaps && ontologyMaps[selectedSourceId])
        ? ontologyMaps[selectedSourceId]
        : null;

    const handleGenerateOntology = async () => {
        if (selectedSourceId && analyzedSources.find(s => s.id === selectedSourceId) && ontologyMaps && ontologyMaps[selectedSourceId]) {
            // Allow viewing cached maps
        } else if (isAnalyzing) {
            return;
        }
        // NOTE: We don't strictly block generation if it's cached, but if new generation is required:
        if (isReadOnly) {
            alert("Ontology generation is disabled in Demo Mode.");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }

        const source = analyzedSources.find(s => s.id === selectedSourceId);
        if (!source || !source.extractedText) return;

        setIsAnalyzing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
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
                    label: node.label || node.id,
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
                refetchCredits();
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
        if (isReadOnly) {
            alert("Comparison is disabled in Demo Mode.");
            return;
        }

        // Credit Check
        if (!creditsLoading && !hasCredits) {
            setShowTopUp(true);
            return;
        }
        if (selectedForComparison.length < 2 || selectedForComparison.length > 3) return;
        if (isComparisonResultLoading) return; // Prevent run if still loading

        const sourceAId = selectedForComparison[0];
        const sourceBId = selectedForComparison[1];
        const sourceCId = selectedForComparison[2]; // Optional

        // Check for existing result
        if (comparisonResult) {
            // Check if the existing result matches the currently selected sources
            const currentIds = [...selectedForComparison].sort();
            const existingIds = [
                comparisonResult.sourceAId,
                comparisonResult.sourceBId,
                comparisonResult.sourceCId
            ].filter(Boolean) as string[];
            existingIds.sort();

            // Simple array equality check
            const isSameComparison = currentIds.length === existingIds.length &&
                currentIds.every((val, index) => val === existingIds[index]);

            if (isSameComparison) {
                // IDs match! Show the existing result without re-running or asking
                setIsComparing(true); // Ensure comparison view is active
                return;
            }

            // IDs differ, ask to overwrite
            const confirmRun = confirm("Existing comparison found for DIFFERENT maps. Do you want to run a new comparison? This will overwrite the current results.");
            if (!confirmRun) {
                return;
            }
        }

        const sourceA = sources.find(s => s.id === sourceAId);
        const sourceB = sources.find(s => s.id === sourceBId);
        const sourceC = sourceCId ? sources.find(s => s.id === sourceCId) : undefined;

        const mapA = ontologyMaps?.[sourceAId];
        const mapB = ontologyMaps?.[sourceBId];
        const mapC = sourceCId ? ontologyMaps?.[sourceCId] : undefined;

        if (!sourceA || !sourceB || !mapA || !mapB) return;
        if (sourceCId && (!sourceC || !mapC)) return; // If 3rd selected but missing data, abort

        setIsComparingLoading(true);
        // setComparisonResult(null); // Keep previous result for better UX during load

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const payload: any = {
                analysisMode: 'ontology_comparison',
                sourceA: { title: sourceA.title, data: mapA },
                sourceB: { title: sourceB.title, data: mapB },
                force: true
            };

            if (sourceC && mapC) {
                payload.sourceC = { title: sourceC.title, data: mapC };
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success && data.analysis) {
                // Attach the source IDs to the result so we can identify it later
                const analysisWithIds: ComparisonResult = {
                    ...data.analysis,
                    sourceAId: sourceAId,
                    sourceBId: sourceBId,
                    sourceCId: sourceCId
                };
                setComparisonResult(analysisWithIds);
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
            if (selectedForComparison.length < 3) { // Updated limit to 3
                setSelectedForComparison(prev => [...prev, sourceId]);
            }
        }
    };

    const handleNodeDrag = (nodeId: string, x: number, y: number) => {
        if (selectedSourceId && currentOntologyData) {
            const updatedNodes = currentOntologyData.nodes.map(node =>
                node.id === nodeId ? { ...node, x, y } : node
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

    // Filtering Logic
    const displayNodes = currentOntologyData
        ? currentOntologyData.nodes.filter(n => !selectedCategory || n.category === selectedCategory)
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

    return (
        <div className="space-y-8">
            <CreditTopUpDialog open={showTopUp} onOpenChange={setShowTopUp} onSuccess={() => refetchCredits()} />
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
                                disabled={!selectedSourceId || isAnalyzing || (isReadOnly && analyzedSources.find(s => s.id === selectedSourceId) && !ontologyMaps?.[selectedSourceId])}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                title={isReadOnly && (!ontologyMaps?.[selectedSourceId!]) ? "Generation disabled in Demo Mode" : ""}
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
                <ComparisonView result={comparisonResult} sources={sources} />
            )}

            {/* Main Visualization */}
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
                        <div className="lg:col-span-2 space-y-4">
                            <OntologyMap
                                nodes={displayNodes}
                                links={displayLinks}
                                selectedCategory={selectedCategory}
                                onSelectCategory={setSelectedCategory}
                                selectedNodeId={selectedNodeId}
                                onSelectNode={setSelectedNodeId}
                                onNodeDrag={handleNodeDrag}
                            />
                        </div>

                        <ConceptList
                            nodes={displayNodes}
                            selectedNodeId={selectedNodeId}
                            onSelectNode={setSelectedNodeId}
                        />
                    </div>
                </>
            )}

            <MapGallery
                ontologyMaps={ontologyMaps}
                sources={sources}
                selectedSourceId={selectedSourceId}
                onSelectSource={setSelectedSourceId}
                isComparing={isComparing}
                selectedForComparison={selectedForComparison}
                onToggleComparisonSelection={toggleComparisonSelection}
                onCompare={handleCompareOntologies}
                isComparingLoading={isComparingLoading}
                isComparisonResultLoading={isComparisonResultLoading}
            />

            <ConceptDetailsModal
                selectedNode={selectedNode || null}
                isOpen={!!selectedNodeId}
                onClose={() => setSelectedNodeId(null)}
                isStatic={!currentOntologyData}
            />
        </div>
    );
}
