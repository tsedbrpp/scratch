import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, GitCompare, Maximize2, Minimize2, FileText } from 'lucide-react';
import { analyzeDocument, AnalysisMode } from '@/services/analysis';
import { AnalysisResult, LegitimacyAnalysis, Source } from '@/types';

interface MultiLensAnalysisProps {
    initialText?: string;
    sources?: Source[];
}

type LensType = 'dsf' | 'cultural_framing' | 'institutional_logics' | 'legitimacy';

const LENSES: { id: LensType; name: string; description: string }[] = [
    { id: 'dsf', name: 'Decolonial Framework', description: 'Power, agency, and coloniality' },
    { id: 'cultural_framing', name: 'Cultural Framing', description: 'Values, narratives, and epistemic authority' },
    { id: 'institutional_logics', name: 'Institutional Logics', description: 'Conflicting institutional orders and practices' },
    { id: 'legitimacy', name: 'Legitimacy Orders', description: 'Justification regimes and moral vocabulary' }
];

export function MultiLensAnalysis({ initialText = '', sources = [] }: MultiLensAnalysisProps) {
    const [text, setText] = useState(initialText);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState<string>('');
    const [results, setResults] = useState<Record<LensType, AnalysisResult | null>>({
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

        setIsAnalyzing(true);
        const newResults = { ...results };

        try {
            for (const lens of LENSES) {
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
                } catch (error) {
                    console.error(`Error analyzing with ${lens.name}:`, error);
                }
            }
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
            setProgress('');
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
                return result.dominant_logic ? `Dominant Logic: ${result.dominant_logic}. ${result.overall_assessment}` : 'No institutional insight.';
            case 'legitimacy':
                const legitResult = result as unknown as LegitimacyAnalysis;
                return legitResult.dominant_order ? `Dominant Order: ${legitResult.dominant_order}. Justification: ${legitResult.justification_logic}` : 'No legitimacy insight.';
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
                        Run multiple theoretical lenses simultaneously to reveal how different frameworks interpret the same text.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sources.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <Select onValueChange={handleSourceSelect}>
                                <SelectTrigger className="w-full md:w-[300px]">
                                    <SelectValue placeholder="Select a document to analyze..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sources.map(source => (
                                        <SelectItem key={source.id} value={source.id}>
                                            {source.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-slate-400">or paste text below</span>
                        </div>
                    )}
                    <Textarea
                        placeholder="Paste text to analyze here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[150px] font-mono text-sm"
                    />
                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !text.trim()}
                        className="w-full sm:w-auto"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {progress}
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Run All Lenses
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {Object.values(results).some(r => r !== null) && (
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
            )}
        </div>
    );
}
