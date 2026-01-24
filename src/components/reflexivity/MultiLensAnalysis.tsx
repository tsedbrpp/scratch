import React, { useState } from 'react';
import { useDemoMode } from '@/hooks/useDemoMode'; // [NEW]
import { useServerStorage } from '@/hooks/useServerStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, GitCompare, Maximize2, Minimize2, FileText, VolumeX, Sparkles } from 'lucide-react';
import { analyzeDocument, AnalysisMode } from '@/services/analysis';
import { AnalysisResult, LegitimacyAnalysis, Source } from '@/types';
import { SpectralRadar } from './SpectralRadar';
import { SystemCritiqueSection } from '@/components/common/SystemCritiqueSection';
import { EvidenceLineageModal } from '@/components/reflexivity/EvidenceLineageModal';
import { DeepAnalysisProgressGraph, AnalysisStepStatus } from "@/components/comparison/DeepAnalysisProgressGraph";
import { RefreshCw, Wand2 } from 'lucide-react'; // Added Wand2, RefreshCw

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
            message: 'Initializing Entanglement...'
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
                        true // Force refresh to ensure fresh comparison
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
                        <GitCompare className="h-5 w-5 text-indigo-600" />
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
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!text.trim() || isReadOnly}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg animate-in zoom-in-95 duration-300 scale-110"
                                >
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Initiate Entanglement
                                </Button>
                                <p className="text-xs text-slate-500 mt-3 font-medium bg-white/50 px-2 py-1 rounded">
                                    Click to trace the artifact through 4 critical dimensions
                                </p>
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
                            <Card key={lens.id} className={`flex flex-col ${expandedLens === lens.id ? 'md:col-span-2 ring-2 ring-indigo-500' : ''}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold text-slate-800">
                                                {lens.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {lens.description}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => setExpandedLens(expandedLens === lens.id ? null : lens.id)}
                                        >
                                            {expandedLens === lens.id ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 text-sm text-slate-600">
                                    {results[lens.id] ? (
                                        <div className="space-y-3">
                                            <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Key Insight</span>
                                                <p className="leading-relaxed">
                                                    {getKeyInsight(lens.id, results[lens.id])}
                                                </p>
                                            </div>

                                            {/* Legitimacy Interactive Orders */}
                                            {lens.id === 'legitimacy' && results['legitimacy'] && (
                                                <div className="mt-3">
                                                    <span className="text-xs font-semibold text-slate-500 block mb-2">Orders of Worth (Click for Evidence)</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries((results['legitimacy'] as unknown as LegitimacyAnalysis).orders || {})
                                                            .filter(([, score]) => score > 0)
                                                            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                                                            .map(([order, score]) => (
                                                                <div
                                                                    key={order}
                                                                    className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                                                                    onClick={() => {
                                                                        const legAnalysis = results['legitimacy'] as unknown as LegitimacyAnalysis;
                                                                        const quotes = legAnalysis.evidence_quotes?.[order] || [];
                                                                        setActiveEvidence({
                                                                            title: `${order.charAt(0).toUpperCase() + order.slice(1)} Order`,
                                                                            type: "Order of Worth",
                                                                            quotes: quotes.map(q => ({ text: q, source: "Policy Text" }))
                                                                        });
                                                                    }}
                                                                >
                                                                    <span className="font-medium text-slate-700 group-hover:text-indigo-700 capitalize">{order}</span>
                                                                    <span className="bg-slate-100 text-slate-600 px-1.5 rounded-full font-bold group-hover:bg-indigo-100 group-hover:text-indigo-700">{score}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Voices Silenced Section */}
                                            {results[lens.id]?.silenced_voices && results[lens.id]!.silenced_voices!.length > 0 && (
                                                <div className="bg-red-50 p-3 rounded-md border border-red-100 relative overflow-hidden group">
                                                    <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <VolumeX className="h-12 w-12 text-red-900" />
                                                    </div>
                                                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                                        <VolumeX className="h-3 w-3" /> Voices Silenced
                                                    </span>
                                                    <ul className="space-y-1 relative z-10">
                                                        {results[lens.id]!.silenced_voices!.map((voice, idx) => (
                                                            <li key={idx} className="text-xs text-red-800 font-medium flex items-start gap-2">
                                                                <span className="block w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                                                {voice}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {expandedLens === lens.id && (
                                                <div className="mt-4 space-y-2 animate-in fade-in duration-300">
                                                    <h4 className="font-medium text-slate-900">Detailed Analysis</h4>
                                                    <pre className="whitespace-pre-wrap bg-slate-900 text-slate-50 p-4 rounded-md text-xs overflow-x-auto max-h-[300px]">
                                                        {JSON.stringify(results[lens.id], null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-md border border-dashed">
                                            Waiting for analysis...
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
