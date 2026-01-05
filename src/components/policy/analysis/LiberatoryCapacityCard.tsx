import { useState } from "react";
import { LiberatoryCapacity } from "@/lib/liberatory-calculator";
import { AnalysisResult } from "@/types";
import { Sprout, RefreshCw, Hand, Scale, MessageSquare, History, HeartHandshake, Loader2, Sparkles, Feather, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { interpretCapacityNarrative } from "@/lib/narrative-interpreters";

interface LiberatoryCapacityCardProps {
    capacity: LiberatoryCapacity;
    analysis: AnalysisResult;
    sourceTitle?: string;
    className?: string;
    compact?: boolean;
}

export function LiberatoryCapacityCard({ capacity, analysis, sourceTitle, className, compact = false }: LiberatoryCapacityCardProps) {
    const [narrative, setNarrative] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!capacity) return null;

    const getScoreColor = (score: number) => {
        if (score >= 6) return "text-emerald-700 bg-emerald-50 border-emerald-200";
        if (score >= 3) return "text-yellow-700 bg-yellow-50 border-yellow-200";
        return "text-slate-600 bg-slate-50 border-slate-200";
    };

    const getBarColor = (score: number) => {
        if (score >= 6) return "bg-emerald-600";
        if (score >= 3) return "bg-yellow-500";
        return "bg-slate-400";
    };

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/liberatory-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis,
                    context: sourceTitle
                })
            });
            const data = await response.json();
            if (data.success && data.narrative) {
                setNarrative(data.narrative);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const signals = [
        {
            key: "power_reversibility",
            label: "Power Reversibility",
            icon: RefreshCw,
            triggered: capacity.signals.power_reversibility,
            explanation: capacity.explanations.power,
        },
        {
            key: "agency_protection",
            label: "Situated Agency",
            icon: Hand,
            triggered: capacity.signals.agency_protection,
            explanation: capacity.explanations.agency,
        },
        {
            key: "epistemic_plurality",
            label: "Epistemic Plurality",
            icon: Sparkles,
            triggered: capacity.signals.epistemic_plurality,
            explanation: capacity.explanations.epistemic,
        },
        {
            key: "exit_rights",
            label: "Exit/Refusal Rights",
            icon: Scale,
            triggered: capacity.signals.exit_rights,
            explanation: capacity.explanations.exit,
        },
        {
            key: "repair_recognition",
            label: "Repair & Care",
            icon: HeartHandshake,
            triggered: capacity.signals.repair_recognition,
            explanation: capacity.explanations.repair,
        },
        {
            key: "temporal_openness",
            label: "Temporal Openness",
            icon: History,
            triggered: capacity.signals.temporal_openness,
            explanation: capacity.explanations.temporal,
        },
        {
            key: "proportionality",
            label: "Proportionality",
            icon: Feather, // Light burden
            triggered: capacity.signals.proportionality,
            explanation: capacity.explanations.proportionality,
        },
        {
            key: "contestable_safety",
            label: "Contestable Safety",
            icon: MessageSquare,
            triggered: capacity.signals.contestable_safety,
            explanation: capacity.explanations.safety,
        }
    ];

    return (
        <Card className={`border-2 ${capacity.score >= 6 ? 'border-emerald-500 shadow-md ring-4 ring-emerald-500/10' : 'border-slate-200'} ${className || 'mt-6'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sprout className={`h-6 w-6 ${capacity.score >= 6 ? 'text-emerald-600' : 'text-slate-500'}`} />
                        <CardTitle className="text-xl font-bold uppercase tracking-wide text-slate-800">
                            Liberatory Capacity Index
                        </CardTitle>
                    </div>
                    <Badge className={`text-sm px-3 py-1 ${getScoreColor(capacity.score)}`}>
                        {capacity.level}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Lead with Narrative Interpretation */}
                <div className="mb-6 bg-emerald-50/30 p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {interpretCapacityNarrative({ score: capacity.score, level: capacity.level, signals: capacity.signals })}
                    </p>
                </div>

                {/* Optional Extended Diagnostic */}
                {!compact && (
                    <div className="mb-6">
                        {!narrative ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateSummary}
                                disabled={isLoading}
                                className="w-full border-dashed border-emerald-200 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 hover:border-emerald-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Extended Assessment...
                                    </>
                                ) : (
                                    <>
                                        <Sprout className="mr-2 h-4 w-4" />
                                        Generate Extended Diagnostic
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 animate-in fade-in zoom-in-95 duration-300">
                                <h5 className="text-xs font-bold text-emerald-700 uppercase mb-2 flex items-center gap-2">
                                    <Sprout className="h-3 w-3" />
                                    Extended Assessment
                                </h5>
                                <p className="text-sm text-slate-800 leading-relaxed">
                                    {narrative}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Parametric Data - Collapsible */}
                <Accordion type="single" collapsible className="mb-6">
                    <AccordionItem value="metrics" className="border-none">
                        <AccordionTrigger className="text-xs text-emerald-600 hover:text-emerald-800 py-2 hover:no-underline">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="h-3 w-3" />
                                View Parametric Data
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex items-center gap-4 pt-2 pb-4">
                                <div className="text-2xl font-black text-emerald-600">
                                    {capacity.score}<span className="text-sm text-slate-400 font-normal">/8</span>
                                </div>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${getBarColor(capacity.score)}`}
                                        style={{ width: `${(capacity.score / 8) * 100}%` }}
                                    />
                                </div>
                                <Badge className={`text-xs ${getScoreColor(capacity.score)}`}>
                                    {capacity.level}
                                </Badge>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 gap-4'}`}>
                    {signals.map((sig) => (
                        <div
                            key={sig.key}
                            className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${sig.triggered ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100 opacity-60'
                                }`}
                        >
                            <div className={`p-2 rounded-full mt-0.5 ${sig.triggered ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <sig.icon className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold uppercase mb-1 ${sig.triggered ? 'text-emerald-900' : 'text-slate-500'}`}>
                                    {sig.label}
                                </h4>
                                {sig.triggered ? (
                                    <p className="text-xs text-emerald-800 leading-snug">
                                        {sig.explanation}
                                    </p>
                                ) : (
                                    !compact && (
                                        <p className="text-xs text-slate-400 italic">
                                            Critera not met. | {sig.explanation}
                                        </p>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase tracking-wider">
                    Measures Reversibility, Plurality, and Structural Openness
                </div>
            </CardContent>
        </Card>
    );
}
