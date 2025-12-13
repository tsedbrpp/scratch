import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, ShieldAlert, Users, BrainCircuit, Sparkles, Loader2, ArrowRight, Plus } from 'lucide-react';
import { EcosystemActor } from '@/types/ecosystem';

interface AbsencePanelProps {
    actors: EcosystemActor[];
    analyzedText?: string;
    onSimulate?: (query: string, source?: "default" | "simulation" | "absence_fill") => Promise<void>;
    topic?: string;
}

interface AiAbsenceAnalysis {
    narrative: string;
    missing_voices: { name: string; reason: string; category: string }[];
    structural_voids: string[];
    blindspot_intensity: "Low" | "Medium" | "High";
}

export function AbsencePanel({ actors, analyzedText = "", onSimulate, topic }: AbsencePanelProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AiAbsenceAnalysis | null>(null);
    const [simulatingIndex, setSimulatingIndex] = useState<number | null>(null);

    const handleDeepScan = async () => {
        setIsAnalyzing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/ecosystem/absence', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ actors, text: analyzedText })
            });
            const data = await response.json();
            console.log("Deep Scan Data Received:", data); // DEBUG LOG
            if (data.success) {
                setAiAnalysis(data.analysis);
            } else {
                console.error("Deep Scan returned success:false", data);
            }
        } catch (error) {
            console.error("Deep Scan failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const analysis = useMemo(() => {
        const results = {
            missingStakeholders: [] as string[],
            deferredStandards: [] as string[],
            enforcementDependencies: [] as string[]
        };

        // 1. Missing Stakeholders (Heuristic: Check for common missing groups)
        const commonStakeholders = [
            "Civil Society",
            "Labor Unions",
            "Environmental Groups",
            "Marginalized Communities",
            "Local Government",
            "Auditors"
        ];

        const presentTypes = new Set(actors.map(a => a.type));
        const presentNames = new Set(actors.map(a => a.name.toLowerCase()));

        commonStakeholders.forEach(stakeholder => {
            // Check if type matches or name fuzzy matches
            const isPresent = Array.from(presentTypes).some(t => t.toLowerCase() === stakeholder.toLowerCase()) ||
                Array.from(presentNames).some(n => n.includes(stakeholder.toLowerCase()));

            if (!isPresent) {
                results.missingStakeholders.push(stakeholder);
            }
        });

        // 2. Deferred Standards (Heuristic: Keywords in text)
        if (analyzedText) {
            const deferredKeywords = [
                "to be defined",
                "future rulemaking",
                "voluntary standard",
                "industry best practice",
                "as appropriate",
                "subject to available resources"
            ];

            // Simple sentence extraction
            const sentences = analyzedText.split(/[.!?]+/);
            deferredKeywords.forEach(keyword => {
                sentences.forEach(sentence => {
                    if (sentence.toLowerCase().includes(keyword)) {
                        results.deferredStandards.push(sentence.trim());
                    }
                });
            });

            // 3. Enforcement Dependencies
            const enforcementKeywords = [
                "upon establishment of",
                "contingent on",
                "subject to funding",
                "capacity building",
                "member state discretion"
            ];

            enforcementKeywords.forEach(keyword => {
                sentences.forEach(sentence => {
                    if (sentence.toLowerCase().includes(keyword)) {
                        results.enforcementDependencies.push(sentence.trim());
                    }
                });
            });
        }

        return results;
    }, [actors, analyzedText]);

    return (
        <Card className="h-full border-l-4 border-l-slate-400 bg-slate-50/50 flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Absence Analysis
                    </div>
                </CardTitle>
                <CardDescription>
                    Tracking what is missing, deferred, or silenced.
                </CardDescription>

                {/* AI Trigger */}
                <div className="pt-2">
                    <Button
                        size="sm"
                        onClick={handleDeepScan}
                        disabled={isAnalyzing}
                        className={`w-full text-xs font-medium gap-2 transition-all ${aiAnalysis ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Scanning Voids...
                            </>
                        ) : aiAnalysis ? (
                            <>
                                <BrainCircuit className="h-3 w-3" />
                                Re-Scan with AI
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3 w-3" />
                                Deep Scan
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto flex-1 p-4">

                {/* AI Results Section */}
                {aiAnalysis && (
                    <div className="space-y-4 border-2 border-indigo-100 rounded-lg p-2 bg-white">
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 shadow-sm">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1 flex items-center justify-between gap-1">
                                <span className="flex items-center gap-1">
                                    <BrainCircuit className="h-3 w-3" />
                                    Assemblage Critique
                                </span>
                                {aiAnalysis.blindspot_intensity && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${aiAnalysis.blindspot_intensity === "High" ? "bg-red-100 text-red-700 border-red-200" :
                                            aiAnalysis.blindspot_intensity === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                "bg-emerald-100 text-emerald-700 border-emerald-200"
                                        }`}>
                                        Intensity: {aiAnalysis.blindspot_intensity}
                                    </span>
                                )}
                            </h4>
                            <p className="text-xs text-indigo-900 leading-relaxed italic">
                                "{aiAnalysis.narrative}"
                            </p>
                        </div>

                        {/* Structural Voids */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                                <AlertCircle className="h-3 w-3" />
                                Functional Voids
                            </h4>
                            <ul className="space-y-1">
                                {aiAnalysis.structural_voids.map((voidDesc, i) => (
                                    <li key={i} className="text-xs text-slate-700 pl-2 border-l-2 border-slate-300">
                                        {voidDesc}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Missing Voices */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                                <Users className="h-3 w-3" />
                                Excluded Actors
                            </h4>
                            <div className="grid gap-2">
                                {aiAnalysis.missing_voices.map((mv, i) => (
                                    <div key={i} className="bg-white p-2 rounded border border-slate-200 shadow-sm group hover:border-indigo-300 transition-colors">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <div className="flex-1">
                                                <span className="font-semibold text-xs text-slate-900 block">{mv.name}</span>
                                                <span className="text-[10px] uppercase bg-slate-100 px-1 rounded text-slate-500">{mv.category}</span>
                                            </div>
                                            {onSimulate && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 -mt-1 -mr-1"
                                                    title={`Simulate ${mv.name}`}
                                                    disabled={simulatingIndex === i}
                                                    onClick={async () => {
                                                        setSimulatingIndex(i);
                                                        const context = topic ? `within the broader assemblage of "${topic}"` : "relevant to this ecosystem";
                                                        try {
                                                            await onSimulate(
                                                                `Generate detailed ecosystem actors representing "${mv.name}" (${mv.category}) ${context}. Key context: ${mv.reason}`,
                                                                "absence_fill"
                                                            );
                                                        } finally {
                                                            setSimulatingIndex(null);
                                                        }
                                                    }}
                                                >
                                                    {simulatingIndex === i ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Plus className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-tight">{mv.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-200 my-4" />
                    </div>
                )}

                {/* Standard Heuristics (Always Visible as Baseline) */}
                <div className="opacity-80 hover:opacity-100 transition-opacity">
                    {!aiAnalysis && <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">- Initial Heuristic Scan -</h3>}

                    {/* Missing Stakeholders */}
                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            Standard Gaps
                        </h4>
                        {analysis.missingStakeholders.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {analysis.missingStakeholders.map(s => (
                                    <span key={s} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic">No standard missing types detected.</p>
                        )}
                    </div>

                    {/* Deferred Standards */}
                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            Deferred Mechanisms
                        </h4>
                        {analysis.deferredStandards.length > 0 ? (
                            <ul className="space-y-2">
                                {analysis.deferredStandards.slice(0, 3).map((s, i) => (
                                    <li key={i} className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                        "{s}..."
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-500 italic">
                                {analyzedText ? "No deferred mechanisms found in text." : "Scan text to detect deferred standards."}
                            </p>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
