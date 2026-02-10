import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info, Code, Network, ArrowRight, Layers, Play, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { analyzeBridgingDrift, DriftAnalysisResult, AnalysisStatus } from '@/services/bridging-analysis';

// --- DATA TYPES & MOCKS (API Contract) ---

export interface FrameworkDimension {
    id: string;
    name: string;
    description: string;
    question: string;
    color: string;
}

export interface GapType {
    id: string;
    name: string;
    description: string;
    relatedDimensions: string[]; // IDs of dimensions involved in this gap
}

export interface BridgingFrameworkProps {
    initialMode?: 'guide' | 'analysis';
    policyText?: string;
    technicalText?: string;
    onAnalysisComplete?: (results: Record<string, DriftAnalysisResult>) => void; // Callback for lifting state
    initialResults?: Record<string, DriftAnalysisResult>; // [NEW] Restoration
}

const DIMENSIONS: FrameworkDimension[] = [
    {
        id: 'doc_analysis',
        name: '1. Document Analysis',
        description: 'Analyzing the specific ethical rhetoric and promises made in policy documents.',
        question: 'What explicit ethical commitments are made in the text?',
        color: '#3b82f6' // Blue
    },
    {
        id: 'tech_analysis',
        name: '2. Technical Analysis',
        description: 'Examining the technical architecture, code implementation, and model cards.',
        question: 'How are these values translated into code and system design?',
        color: '#8b5cf6' // Violet
    },
    {
        id: 'implementation',
        name: '3. Implementation',
        description: 'Observing the actual deployment and operational context of the system.',
        question: 'How does the system function in practice?',
        color: '#10b981' // Green
    },
    {
        id: 'outcome',
        name: '4. Outcome Analysis',
        description: 'Measuring the real-world impacts and downstream effects on stakeholders.',
        question: 'What are the observable results and side effects?',
        color: '#f59e0b' // Amber
    },
    {
        id: 'enforcement',
        name: '5. Enforcement',
        description: 'Tracing the mechanisms of accountability and recourse.',
        question: 'What happens when the system fails or causes harm?',
        color: '#ef4444' // Red
    },
    {
        id: 'timeline',
        name: '6. Temporal Drift',
        description: 'Tracking how the system and its governance evolve over time.',
        question: 'How do rhetoric and reality diverge as the system scales?',
        color: '#6366f1' // Indigo
    }
];

const GAP_TYPES: GapType[] = [
    {
        id: 'rhetoric_reality',
        name: 'Rhetoric-Reality Gap',
        description: 'The distance between high-level ethical principles and actual technical implementation details.',
        relatedDimensions: ['doc_analysis', 'tech_analysis']
    },
    {
        id: 'enforcement_gap',
        name: 'Enforcement Gap',
        description: 'When policies exist but lack effective mechanisms for accountability or correction.',
        relatedDimensions: ['doc_analysis', 'enforcement']
    },
    {
        id: 'scale_drift',
        name: 'Scale & Temporal Drift',
        description: 'When a system works as intended initially but degrades or shifts purpose over time.',
        relatedDimensions: ['implementation', 'timeline', 'outcome']
    },
    {
        id: 'impact_blindness',
        name: 'Impact Blindness',
        description: 'When technical metrics are optimized without regard for downstream social outcomes.',
        relatedDimensions: ['tech_analysis', 'outcome']
    }
];

// --- NETWORK VISUALIZATION COMPONENT ---

const NetworkNode = ({
    dimension,
    x,
    y,
    isActive,
    isDimmed,
    isAnalyzing,
    result,
    onClick,
    onHover
}: {
    dimension: FrameworkDimension;
    x: number;
    y: number;
    isActive: boolean;
    isDimmed: boolean;
    isAnalyzing: boolean;
    result?: DriftAnalysisResult;
    onClick: () => void;
    onHover: (hovering: boolean) => void;
}) => (
    <g
        className={cn("transition-opacity duration-300 cursor-pointer", isDimmed ? "opacity-30" : "opacity-100")}
        transform={`translate(${x}, ${y})`}
        onClick={onClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
    >
        {/* Pulsing effect when analyzing */}
        {isAnalyzing && (
            <circle r={35} fill={dimension.color} opacity={0.3} className="animate-ping" />
        )}

        {/* Fill based on drift score if available (High drift = stronger color, or distinct indicator) */}
        <circle
            r={30}
            fill={result ? dimension.color : (isActive ? dimension.color : "white")}
            fillOpacity={result ? 0.2 + (result.driftScore * 0.8) : 1}
            stroke={dimension.color}
            strokeWidth={isActive || result ? 3 : 1}
            className="transition-all duration-300"
        />

        {/* Drift Score Badge */}
        {result && (
            <g transform="translate(20, -20)">
                <circle r={12} fill="white" stroke={dimension.color} />
                <text textAnchor="middle" dy={4} fontSize={10} fontWeight="bold" fill={dimension.color}>
                    {(result.driftScore * 100).toFixed(0)}%
                </text>
            </g>
        )}

        <foreignObject x={-60} y={35} width={120} height={60}>
            <div className="text-center text-xs font-medium leading-tight text-slate-700 dark:text-slate-200">
                {dimension.name}
            </div>
        </foreignObject>
        <foreignObject x={-12} y={-12} width={24} height={24} className="pointer-events-none">
            <div className={cn("flex items-center justify-center text-xs font-bold w-full h-full",
                isActive && !result ? "text-white" : dimension.color,
                result ? "text-slate-900 font-extrabold" : ""
            )}>
                {dimension.id.charAt(0).toUpperCase()}
            </div>
        </foreignObject>
    </g>
);

const NetworkLink = ({
    x1, y1, x2, y2, color, active
}: {
    x1: number; y1: number; x2: number; y2: number; color: string; active: boolean
}) => (
    <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={active ? color : "#e2e8f0"}
        strokeWidth={active ? 3 : 1}
        strokeDasharray={active ? "none" : "5,5"}
        className="transition-all duration-500 will-change-[stroke]"
    />
);

export function BridgingFramework({ policyText, technicalText, onAnalysisComplete, initialResults }: BridgingFrameworkProps) {
    const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);
    const [activeGapId, setActiveGapId] = useState<string | null>(null);
    const [hoveredDimensionId, setHoveredDimensionId] = useState<string | null>(null);

    // Analysis State
    // [FIX] Initialize with persisted results if available
    const [status, setStatus] = useState<AnalysisStatus>(initialResults ? 'done' : 'idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [results, setResults] = useState<Record<string, DriftAnalysisResult>>(initialResults || {});
    const [error, setError] = useState<string | null>(null);

    // Calculate hexagon positions
    const centerX = 300;
    const centerY = 200;
    const radius = 140;

    const nodePositions = useMemo(() => {
        return DIMENSIONS.map((dim, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            return {
                ...dim,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    }, []);

    const selectedDimension = DIMENSIONS.find(d => d.id === selectedDimensionId);
    // Use real result if available
    const selectedResult = selectedDimensionId ? results[selectedDimensionId] : null;

    const getHighlightState = (dimId: string) => {
        if (activeGapId) {
            const gap = GAP_TYPES.find(g => g.id === activeGapId);
            return gap?.relatedDimensions.includes(dimId);
        }
        if (hoveredDimensionId) {
            return hoveredDimensionId === dimId;
        }
        return selectedDimensionId === dimId;
    };

    const isDimmed = (dimId: string) => {
        if (activeGapId) {
            const gap = GAP_TYPES.find(g => g.id === activeGapId);
            return !gap?.relatedDimensions.includes(dimId);
        }
        return false;
    };

    const handleRunAnalysis = async () => {
        if (!policyText || !technicalText) return;

        setStatus('planning');
        setError(null);
        setResults({});
        setSelectedDimensionId(null);
        setActiveGapId(null);

        analyzeBridgingDrift(
            policyText,
            technicalText,
            (msg) => {
                setStatusMessage(msg);
                if (msg.includes("Analyzing Dimension:")) {
                    // Extract dimension name from message to highlight node? 
                    // Ideally the API would send structured status 'type': 'working_on', 'id': '...'
                    // For now we rely on the generic message
                    setStatus('tracing');
                }
            },
            (result) => {
                setResults(prev => {
                    const next = { ...prev, [result.dimensionId]: result };
                    return next;
                });
                // Auto-select the dimension being analyzed to show progress vividly
                setSelectedDimensionId(result.dimensionId);
            },
            (err) => {
                setError(err);
                setStatus('error');
            }
        ).then(() => {
            // We can rely on the 'done' event in the stream or just completion here
            if (status !== 'error') setStatus('done');
        });
    };

    // [FIX] Call onAnalysisComplete in useEffect to avoid setState-in-render
    useEffect(() => {
        if (onAnalysisComplete && Object.keys(results).length > 0) {
            onAnalysisComplete(results);
        }
    }, [results, onAnalysisComplete]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header & Controls */}
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">Ethics Rhetoric and Technical Practice</h2>
                        <p className="text-muted-foreground max-w-3xl">
                            Trace the translation of values through the assemblage.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Button
                            onClick={handleRunAnalysis}
                            disabled={!policyText || !technicalText || status === 'planning' || status === 'tracing'}
                            className={cn(
                                "gap-2 min-w-[150px]",
                                status === 'done' ? "bg-green-600 hover:bg-green-700" : ""
                            )}
                        >
                            {status === 'planning' || status === 'tracing' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : status === 'done' ? (
                                <>
                                    <Play className="w-4 h-4" />
                                    Re-Run Analysis
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Start Trace Analysis
                                </>
                            )}
                        </Button>
                        {status === 'planning' || status === 'tracing' ? (
                            <span className="text-xs text-muted-foreground animate-pulse">{statusMessage}</span>
                        ) : null}
                    </div>
                </div>

                {(!policyText || !technicalText) && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-md flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <Info className="w-4 h-4" />
                        <div>
                            <span className="font-semibold">Exploration Mode:</span> You can explore the framework concepts below. To run a live analysis, select two documents (Policy vs Technical) in the sidebar.
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-md text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Error: {error}
                    </div>
                )}

                {/* [DEBUG] Warning if text is suspiciously short */}
                {((policyText && policyText.length < 100) || (technicalText && technicalText.length < 100)) && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                            <strong>Warning:</strong> Input text is extremely short ({policyText?.length || 0} / {technicalText?.length || 0} chars).
                            Analysis may fail or produce hallucinated results. Ensure selected documents have extracted text.
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Interactive Network Tracing */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Network className="w-4 h-4 text-slate-500" />
                                Assemblage Network
                            </h3>
                            <Badge variant="outline" className="font-normal text-xs uppercase tracking-wider">
                                {activeGapId ? "Tracing Gap" : selectedDimensionId ? "Focus Mode" : "Overview"}
                            </Badge>
                        </div>

                        <div className="relative w-full h-[400px] flex items-center justify-center select-none">
                            <svg width="100%" height="100%" viewBox="0 0 600 400" className="overflow-visible">
                                {/* Links */}
                                {nodePositions.map((node1, i) =>
                                    nodePositions.slice(i + 1).map((node2) => {
                                        const isLinkedActive = getHighlightState(node1.id) && getHighlightState(node2.id);
                                        return (
                                            <NetworkLink
                                                key={`${node1.id}-${node2.id}`}
                                                x1={node1.x} y1={node1.y}
                                                x2={node2.x} y2={node2.y}
                                                color={activeGapId ? "#64748b" : node1.color}
                                                active={!!isLinkedActive}
                                            />
                                        );
                                    })
                                )}

                                {/* Nodes */}
                                {nodePositions.map((node) => (
                                    <NetworkNode
                                        key={node.id}
                                        dimension={node}
                                        x={node.x}
                                        y={node.y}
                                        isActive={!!getHighlightState(node.id)}
                                        isDimmed={isDimmed(node.id)}
                                        isAnalyzing={status === 'tracing' && statusMessage.includes(node.id) /* Imperfect but helpful visual */}
                                        result={results[node.id]}
                                        onClick={() => {
                                            setSelectedDimensionId(node.id);
                                            setActiveGapId(null);
                                        }}
                                        onHover={(hovering) => setHoveredDimensionId(hovering ? node.id : null)}
                                    />
                                ))}
                            </svg>
                        </div>
                    </Card>

                    {/* Detailed Dimension View */}
                    {selectedDimension && !activeGapId && (
                        <Card className="animate-in slide-in-from-top-4 duration-300 border-l-4" style={{ borderLeftColor: selectedDimension.color }}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            {selectedDimension.name}
                                        </CardTitle>
                                        <CardDescription>{selectedDimension.description}</CardDescription>
                                    </div>
                                    {selectedResult && (
                                        <div className="flex flex-col items-end">
                                            <Badge variant={selectedResult.driftScore > 0.5 ? "destructive" : "outline"}>
                                                Drift: {(selectedResult.driftScore * 100).toFixed(0)}%
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!selectedResult ? (
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300">Diagnostic Question:</p>
                                        <p className="text-lg italic mt-1 text-slate-600 dark:text-slate-400">&quot;{selectedDimension.question}&quot;</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="prose prose-sm dark:prose-invert">
                                            <p className="font-medium">{selectedResult.summary}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800">
                                                <div className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Rhetoric (Promise)</div>
                                                <p className="text-xs italic text-blue-900 dark:text-blue-100">&quot;{selectedResult.evidence?.rhetoric || "No rhetoric extracted"}&quot;</p>
                                            </div>
                                            <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded border border-violet-100 dark:border-violet-800">
                                                <div className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-1">Reality (Technical)</div>
                                                <p className="text-xs italic text-violet-900 dark:text-violet-100">&quot;{selectedResult.evidence?.reality || "No reality extracted"}&quot;</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
                                            <p className="text-xs text-slate-500 font-mono">Reasoning: {selectedResult.evidence?.reasoning || "No reasoning provided"}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeGapId && (
                        <Card className="animate-in slide-in-from-top-4 duration-300 border-l-4 border-slate-500">
                            <CardHeader>
                                <CardTitle className="text-lg">{GAP_TYPES.find(g => g.id === activeGapId)?.name}</CardTitle>
                                <CardDescription>Tracing the disconnect in the assemblage</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">{GAP_TYPES.find(g => g.id === activeGapId)?.description}</p>
                                <div className="flex gap-2">
                                    {GAP_TYPES.find(g => g.id === activeGapId)?.relatedDimensions.map(dimId => {
                                        const dim = DIMENSIONS.find(d => d.id === dimId);
                                        const res = results[dimId];
                                        return (
                                            <Badge key={dimId} variant="secondary" className="gap-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dim?.color }} />
                                                {dim?.name}
                                                {res && <span className="ml-1 opacity-50">({(res.driftScore * 100).toFixed(0)}%)</span>}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Common Translations & Drifts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {GAP_TYPES.map((gap) => (
                                <Button
                                    key={gap.id}
                                    variant={activeGapId === gap.id ? "secondary" : "ghost"}
                                    className={cn(
                                        "justify-start h-auto py-3 px-4 text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all",
                                        activeGapId === gap.id && "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                    )}
                                    onClick={() => {
                                        setActiveGapId(activeGapId === gap.id ? null : gap.id);
                                        setSelectedDimensionId(null);
                                    }}
                                >
                                    <div>
                                        <div className="font-medium text-sm">{gap.name}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{gap.description}</div>
                                    </div>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Accordion type="single" collapsible>
                        <AccordionItem value="dev-guide" className="border-none">
                            <AccordionTrigger className="py-2 text-sm text-slate-500 hover:text-slate-800 hover:no-underline">
                                <span className="flex items-center gap-2">
                                    <Code className="w-4 h-4" />
                                    For Developers: Automation Architecture
                                </span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="mt-2 bg-slate-50 dark:bg-slate-950">
                                    <Tabs defaultValue="architecture" className="w-full">
                                        <TabsList className="w-full grid grid-cols-2 rounded-none rounded-t-lg bg-slate-100 dark:bg-slate-900 p-0">
                                            <TabsTrigger value="architecture" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 border-r">Architecture</TabsTrigger>
                                            <TabsTrigger value="code" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">TypeScript Ref</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="architecture" className="p-4 space-y-4">
                                            <div className="text-xs text-muted-foreground space-y-2">
                                                <p>Pipeline architecture using AI analysis engines to populate the DriftVector state.</p>
                                                <div className="flex flex-col gap-2 items-center p-4 border border-dashed rounded bg-white dark:bg-black/20">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-[10px] w-full text-center">Raw Policy Data</div>
                                                    <ArrowRight className="w-3 h-3 text-slate-400 rotate-90" />
                                                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded text-[10px] w-full text-center">AI Extraction Engine (OpenAI/Gemini)</div>
                                                    <ArrowRight className="w-3 h-3 text-slate-400 rotate-90" />
                                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded text-[10px] w-full text-center">Comparison Logic (Gap Detection)</div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="code" className="p-0">
                                            <ScrollArea className="h-[200px] w-full">
                                                <div className="p-4">
                                                    <pre className="text-[10px] font-mono leading-tight bg-slate-950 text-slate-50 p-3 rounded">
                                                        {`interface DriftAnalysisResult {
  dimensionId: string;
  driftScore: number;
  evidence: {
    rhetoric: string;
    reality: string;
  }
}
`}
                                                    </pre>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>
                                    </Tabs>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
