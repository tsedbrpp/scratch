import React, { useState } from 'react';
import { useDemoMode } from '@/hooks/useDemoMode'; // [NEW]
import { useServerStorage } from '@/hooks/useServerStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Maximize2, Minimize2, FileText, VolumeX, Sparkles } from 'lucide-react';
import { analyzeDocument, AnalysisMode } from '@/services/analysis';
import { AnalysisResult, LegitimacyAnalysis, Source } from '@/types';
import dynamic from 'next/dynamic';
const SpectralRadar = dynamic(() => import('./SpectralRadar').then(mod => mod.SpectralRadar), {
    loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Radar...</div>,
    ssr: false
});
import { SystemCritiqueSection } from '@/components/common/SystemCritiqueSection';
import { EvidenceLineageModal } from '@/components/reflexivity/EvidenceLineageModal';
import { DeepAnalysisProgressGraph, AnalysisStepStatus } from "@/components/comparison/DeepAnalysisProgressGraph";
import { Wand2 } from 'lucide-react'; // Added Wand2
import { LegitimacyVisualizer } from './LegitimacyVisualizer';
import { LogicsVisualizer } from './LogicsVisualizer';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ConceptNetworkGraph } from './ConceptNetworkGraph';

interface MultiLensAnalysisProps {
    initialText?: string;
    sources?: Source[];
    onRefresh?: () => void;
}

type LensType = 'dsf' | 'cultural_framing' | 'institutional_logics' | 'legitimacy';

const LENSES: { id: LensType; name: string; description: string }[] = [
    { id: 'dsf', name: 'Decolonial Framework', description: 'Power, agency, and coloniality' },
    { id: 'cultural_framing', name: 'Cultural Framing', description: 'Values, narratives, and epistemic authority' },
    { id: 'institutional_logics', name: 'Institutional Logics', description: 'Conflicting institutional orders and practices' },
    { id: 'legitimacy', name: 'Legitimacy Orders', description: 'Justification regimes and moral vocabulary' }
];

export function MultiLensAnalysis({ initialText = '', sources = [], onRefresh }: MultiLensAnalysisProps) {
    const { isReadOnly } = useDemoMode(); // [NEW]

    // Helper function to determine actual document type from both type field and title
    const getDocumentType = (source: Source): "Policy" | "Web" | "Trace" => {
        // Check title prefix first (more reliable for user-added sources)
        if (source.title.startsWith('[Web]')) return "Web";
        if (source.title.startsWith('[Trace]')) return "Trace";

        // Fall back to type field
        if (source.type === 'Web') return "Web";
        if (source.type === 'Trace') return "Trace";

        // Default to Policy for PDF, Text, Word types
        return "Policy";
    };

    // Filter to only show Policy documents
    const policyDocuments = sources.filter(s => getDocumentType(s) === "Policy");

    // Persist text input
    const [text, setText] = useServerStorage("multi_lens_text", initialText);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState<string>('');

    // [NEW] Granular Progress State for Graph
    const [analysisProgress, setAnalysisProgress] = useState<{
        decolonial: AnalysisStepStatus;
        cultural: AnalysisStepStatus;
        logics: AnalysisStepStatus;
        legitimacy: AnalysisStepStatus;
        message?: string;
    }>({
        decolonial: 'pending',
        cultural: 'pending',
        logics: 'pending',
        legitimacy: 'pending'
    });

    interface Evidence {
        title: string;
        type: "Order of Worth" | "Cultural Cluster" | "Trace";
        quotes: { text: string; source: string }[];
    }

    const [activeEvidence, setActiveEvidence] = useState<Evidence | null>(null);

    // Persist analysis results
    const [results, setResults] = useServerStorage<Record<LensType, AnalysisResult | null>>("multi_lens_results", {
        dsf: null,
        cultural_framing: null,
        institutional_logics: null,
        legitimacy: null
    });

    const [expandedLens, setExpandedLens] = useState<LensType | null>(null);

    const handleSourceSelect = (sourceId: string) => {
        const source = sources.find(s => s.id === sourceId);
        if (source && source.extractedText) {
            setText(source.extractedText.substring(0, 15000)); // Limit text length for analysis
        }
    };

    const [forceRefresh, setForceRefresh] = useState(false);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        if (isReadOnly) { // [NEW]
            alert("Analysis disabled in Demo Mode");
            return;
        }

        setIsAnalyzing(true);

        // [FIX] Clear previous results immediately
        const emptyResults: Record<LensType, AnalysisResult | null> = {
            dsf: null,
            cultural_framing: null,
            institutional_logics: null,
            legitimacy: null
        };
        setResults(emptyResults);

        const newResults = { ...emptyResults };

        // Reset Progress
        setAnalysisProgress({
            decolonial: 'pending',
            cultural: 'pending',
            logics: 'pending',
            legitimacy: 'pending',
            message: forceRefresh ? 'Forcing Re-Analysis...' : 'Initializing Entanglement...'
        });

        try {
            // Artificial delay to show start
            setAnalysisProgress(prev => ({ ...prev, decolonial: 'analyzing', message: 'Calibrating Decolonial Framework...' }));
            await new Promise(r => setTimeout(r, 800));

            for (const lens of LENSES) {
                const stepKey = lens.id === 'dsf' ? 'decolonial' :
                    lens.id === 'cultural_framing' ? 'cultural' :
                        lens.id === 'institutional_logics' ? 'logics' : 'legitimacy';

                setAnalysisProgress(prev => ({
                    ...prev,
                    [stepKey]: 'analyzing',
                    message: `Running ${lens.name}...`
                }));

                setProgress(`Running ${lens.name}...`);

                try {
                    const result = await analyzeDocument(
                        text,
                        lens.id as AnalysisMode,
                        'Policy Document', // Default source type
                        forceRefresh // Use the state variable
                    );
                    newResults[lens.id] = result;
                    setResults({ ...newResults });

                    setAnalysisProgress(prev => ({ ...prev, [stepKey]: 'done' }));

                } catch (error) {
                    console.error(`Error analyzing with ${lens.name}:`, error);
                    setAnalysisProgress(prev => ({ ...prev, [stepKey]: 'error' }));
                }
            }
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
            setProgress('');
            // Keep the graph in "done" state for a moment or until reset?
            // For now, we leave it. The graph will be replaced by the result content or we can keep showing it.
            // Actually, usually we hide the graph when done or reset it.
            // Let's reset it after a delay so the user sees "Done".
            setTimeout(() => {
                setAnalysisProgress(prev => ({ ...prev, message: 'Analysis Complete' }));
            }, 1000);
        }
    };

    const getKeyInsight = (lens: LensType, result: AnalysisResult | null) => {
        if (!result) return 'No analysis yet.';

        switch (lens) {
            case 'dsf':
                return result.key_insight || result.reflexivity_situated_praxis || 'No insight generated.';
            case 'cultural_framing':
                return result.dominant_cultural_logic ? `Dominant Logic: ${result.dominant_cultural_logic}. ${result.state_market_society}` : result.key_insight || 'No cultural insight.';
            case 'institutional_logics':
                if (result.dominant_logic) {
                    return `Dominant Logic: ${result.dominant_logic}. ${result.overall_assessment || ''}`;
                }
                return result.overall_assessment || 'No institutional insight.';
            case 'legitimacy':
                const legitResult = result as unknown as LegitimacyAnalysis;
                // Temporarily treat as unknown to safely check for object structure
                const justificationRaw = legitResult.justification_logic as unknown;
                let justification = "";

                // Handle case where LLM returns object instead of string
                if (typeof justificationRaw === 'object' && justificationRaw !== null) {
                    const jObj = justificationRaw as { summary?: string; text?: string; description?: string;[key: string]: unknown };
                    justification = jObj.summary || jObj.text || jObj.description || JSON.stringify(jObj);
                } else {
                    justification = String(justificationRaw);
                }

                if (legitResult.dominant_order) {
                    return `Dominant Order: ${legitResult.dominant_order}. Justification: ${justification}`;
                }
                return justification || 'No legitimacy insight.';
            default:
                return 'N/A';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-indigo-600" />
                        Comparative Lens Analysis
                    </CardTitle>
                    <CardDescription>
                        Deploy multiple theoretical lenses simultaneously to observe how the assemblage refracts the artifact.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {policyDocuments.length > 0 && ( // Keep checks but improve UX below
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <Select onValueChange={handleSourceSelect}>
                                    <SelectTrigger className="w-full md:w-[300px]">
                                        <SelectValue placeholder="Select artifact to assemble..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {policyDocuments.map(source => (
                                            <SelectItem key={source.id} value={source.id}>
                                                {source.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {onRefresh && (
                                    <Button variant="ghost" size="sm" onClick={onRefresh} title="Refresh Source List">
                                        <Sparkles className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="text-xs text-slate-400 flex justify-between items-center px-1">
                                <span>or paste text below</span>
                                <span>
                                    {policyDocuments.length} Policy docs available
                                    {sources.length > policyDocuments.length && ` (${sources.length - policyDocuments.length} filtered)`}
                                </span>
                            </div>
                        </div>
                    )}
                    <Textarea
                        placeholder="Paste text for theoretical entanglement..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[150px] font-mono text-sm"
                    />
                    {isAnalyzing ? (
                        <div className="min-h-[250px] flex items-center justify-center border border-slate-100 rounded-lg bg-slate-50/50">
                            <DeepAnalysisProgressGraph status={analysisProgress} currentStepMessage={analysisProgress.message} />
                        </div>
                    ) : (
                        <div className="relative min-h-[250px] bg-slate-50/30 rounded-lg border border-dashed border-slate-200 overflow-hidden group">
                            {/* Background Graph (Idle) */}
                            <div className="absolute inset-0 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-500 pointer-events-none">
                                <DeepAnalysisProgressGraph status={{ decolonial: 'pending', cultural: 'pending', logics: 'pending', legitimacy: 'pending' }} />
                            </div>

                            {/* Overlay Action */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] group-hover:bg-white/20 transition-all z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!text.trim() || isReadOnly}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg animate-in zoom-in-95 duration-300 scale-110"
                                    >
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Initiate Entanglement
                                    </Button>

                                    <div className="flex items-center space-x-2 bg-white/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-indigo-100 animate-in fade-in zoom-in duration-500 delay-100">
                                        <input
                                            type="checkbox"
                                            id="force-refresh-chk"
                                            checked={forceRefresh}
                                            onChange={(e) => setForceRefresh(e.target.checked)}
                                            className="h-3.5 w-3.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <label htmlFor="force-refresh-chk" className="text-xs font-medium text-indigo-600 cursor-pointer select-none">
                                            Force Re-Analysis
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 text-center mt-2">
                        <span className="inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            AI inputs processed by OpenAI (GPT-5.1) & Google (Gemini 3 Pro / Search).
                        </span>
                    </p>
                </CardContent>
            </Card>

            {Object.values(results).some(r => r !== null) && (
                <div className="space-y-6">
                    {/* Visualization of Entanglements */}
                    <SpectralRadar results={results} />

                    <div className="grid gap-6 md:grid-cols-2">
                        {LENSES.map((lens) => (
                            <Card key={lens.id} className={`flex flex-col transition-all duration-300 ${expandedLens === lens.id ? 'md:col-span-2 ring-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'}`}>
                                <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                                {lens.name}
                                                {results[lens.id] && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Ready</span>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {lens.description}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => setExpandedLens(expandedLens === lens.id ? null : lens.id)}
                                        >
                                            {expandedLens === lens.id ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 text-sm text-slate-600 pt-4">
                                    {results[lens.id] ? (
                                        <div className="space-y-4">

                                            {/* --- LEGITIMACY LENS --- */}
                                            {lens.id === 'legitimacy' && (
                                                <>
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3">
                                                                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide block mb-1">Dominant Order</span>
                                                                <p className="font-semibold text-indigo-900 leading-tight">
                                                                    {(results['legitimacy'] as any).dominant_order || 'Undetermined'}
                                                                </p>
                                                            </div>
                                                            <Accordion type="single" collapsible className="w-full">
                                                                <AccordionItem value="justification" className="border-none">
                                                                    <AccordionTrigger className="py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:no-underline">
                                                                        View Justification Logic
                                                                    </AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                                                                            {(results['legitimacy'] as any).justification_logic || 'No justification logic available.'}
                                                                        </p>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </Accordion>
                                                        </div>
                                                        <div className="flex-1 min-h-[180px] -my-4">
                                                            <LegitimacyVisualizer analysis={results['legitimacy'] as unknown as LegitimacyAnalysis} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* --- INSTITUTIONAL LOGICS LENS --- */}
                                            {lens.id === 'institutional_logics' && (
                                                <>
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3">
                                                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block mb-1">Dominant Logic</span>
                                                                <p className="font-semibold text-emerald-900 leading-tight">
                                                                    {results['institutional_logics']?.dominant_logic || 'Undetermined'}
                                                                </p>
                                                            </div>
                                                            <Accordion type="single" collapsible className="w-full">
                                                                <AccordionItem value="assessment" className="border-none">
                                                                    <AccordionTrigger className="py-2 text-xs font-medium text-slate-500 hover:text-emerald-600 hover:no-underline">
                                                                        View Overall Assessment
                                                                    </AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                                                                            {results['institutional_logics']?.overall_assessment || 'No assessment available.'}
                                                                        </p>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </Accordion>
                                                        </div>
                                                        <div className="flex-1 min-h-[180px] -my-4">
                                                            <LogicsVisualizer analysis={results['institutional_logics']!} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* --- CULTURAL FRAMING --- */}
                                            {lens.id === 'cultural_framing' && (
                                                <div className="space-y-3">
                                                    <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                                                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">Dominant Cultural Logic</span>
                                                        <p className="font-semibold text-amber-900 leading-tight">
                                                            {results['cultural_framing']?.dominant_cultural_logic || 'Undetermined'}
                                                        </p>
                                                    </div>

                                                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">The &quot;Imagined&quot; State</span>
                                                        <p className="text-xs leading-relaxed">
                                                            {results['cultural_framing']?.state_market_society || getKeyInsight(lens.id, results[lens.id])}
                                                        </p>
                                                    </div>

                                                    {/* Concept Network Graph */}
                                                    {results['cultural_framing']?.concept_map && (
                                                        <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                                    Cultural Logic Network
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {results['cultural_framing'].concept_map.nodes.length} Nodes
                                                                </span>
                                                            </div>
                                                            <div className="h-[500px] w-full relative">
                                                                <ConceptNetworkGraph data={results['cultural_framing'].concept_map} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* --- DECOLONIAL FRAMEWORK --- */}
                                            {lens.id === 'dsf' && (
                                                <div className="space-y-3">
                                                    <div className="bg-rose-50 border border-rose-100 rounded-md p-3">
                                                        <span className="text-xs font-bold text-rose-800 uppercase tracking-wide block mb-1">Key Dynamic</span>
                                                        <p className="font-semibold text-rose-900 leading-tight">
                                                            {results['dsf']?.key_insight || 'Undetermined'}
                                                        </p>
                                                    </div>
                                                    <Accordion type="single" collapsible className="w-full">
                                                        <AccordionItem value="praxis" className="border-none">
                                                            <AccordionTrigger className="py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:no-underline">
                                                                Detailed Situated Praxis
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                                                                    {results['dsf']?.reflexivity_situated_praxis || 'No detail available.'}
                                                                </p>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>
                                            )}


                                            {/* Voices Silenced Section (Shared across all lenses) */}
                                            {results[lens.id]?.silenced_voices && results[lens.id]!.silenced_voices!.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-slate-100">
                                                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                                        <VolumeX className="h-3 w-3" /> Voices Silenced
                                                    </span>
                                                    <ul className="space-y-1">
                                                        {results[lens.id]!.silenced_voices!.slice(0, expandedLens === lens.id ? undefined : 2).map((voice, idx) => (
                                                            <li key={idx} className="text-xs text-red-800 font-medium flex items-start gap-2">
                                                                <span className="block w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                                                {voice}
                                                            </li>
                                                        ))}
                                                        {results[lens.id]!.silenced_voices!.length > 2 && expandedLens !== lens.id && (
                                                            <li className="text-xs text-red-500 italic pl-3 cursor-pointer hover:underline" onClick={() => setExpandedLens(lens.id)}>
                                                                + {results[lens.id]!.silenced_voices!.length - 2} more (click to expand)
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            {expandedLens === lens.id && (
                                                <div className="mt-4 space-y-2 animate-in fade-in duration-300 pt-4 border-t border-slate-100">
                                                    <h4 className="font-medium text-slate-900">Raw Analysis Data</h4>
                                                    <pre className="whitespace-pre-wrap bg-slate-900 text-slate-50 p-4 rounded-md text-xs overflow-x-auto max-h-[300px]">
                                                        {JSON.stringify(results[lens.id], null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-md border border-dashed border-slate-200">
                                            <div className="p-3 bg-white rounded-full mb-2 shadow-sm">
                                                <Sparkles className="h-4 w-4 text-slate-300" />
                                            </div>
                                            <span className="text-xs font-medium">Waiting for analysis...</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* System Critique (Devil's Advocate) */}
                    {results['dsf'] && results['dsf'].system_critique && (
                        <SystemCritiqueSection critique={results['dsf'].system_critique} />
                    )}
                </div>
            )}

            <EvidenceLineageModal
                isOpen={!!activeEvidence}
                onClose={() => setActiveEvidence(null)}
                title={activeEvidence?.title || ""}
                description="Verbatim text segments that triggered this classification."
                quotes={activeEvidence?.quotes || []}
                sourceType={activeEvidence?.type || "Trace"}
            />
        </div>
    );
}
