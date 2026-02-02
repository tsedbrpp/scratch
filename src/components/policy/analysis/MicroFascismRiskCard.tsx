import { useState } from "react";
import { MicroFascismRisk } from "@/lib/risk-calculator";
import { AnalysisResult, UserRebuttal } from "@/types";
import { RebuttalButton } from "@/components/policy/RebuttalButton";
import { AlertTriangle, ShieldAlert, Zap, EyeOff, Gavel, History, Ban, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { interpretRiskNarrative } from "@/lib/narrative-interpreters";

interface MicroFascismRiskCardProps {
    risk: MicroFascismRisk;
    analysis: AnalysisResult;
    sourceTitle?: string;
    className?: string; // Allow external styling overrides
    compact?: boolean;
    onUpdate?: (updates: Partial<AnalysisResult>) => void;
}

export function MicroFascismRiskCard({ risk, analysis, sourceTitle, onUpdate, className, compact = false }: MicroFascismRiskCardProps) {
    const [narrative, setNarrative] = useState<string | null>(analysis.extended_risk_diagnostic || null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRebuttal = (dimensionKey: string, text: string) => {
        if (!onUpdate) return;

        const newRebuttal: UserRebuttal = {
            text,
            timestamp: new Date().toISOString(),
            user: "Researcher" // Placeholder for auth user
        };

        const currentRebuttals = analysis.rebuttals || {};

        onUpdate({
            rebuttals: {
                ...currentRebuttals,
                [dimensionKey]: newRebuttal
            }
        });
    };

    if (!risk) return null;

    const getScoreColor = (score: number) => {
        if (score >= 5) return "text-red-600 bg-red-50 border-red-200";
        if (score >= 3) return "text-amber-600 bg-amber-50 border-amber-200";
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
    };

    const getBarColor = (score: number) => {
        if (score >= 5) return "bg-red-600";
        if (score >= 3) return "bg-amber-500";
        return "bg-emerald-500";
    };

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/risk-summary', {
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
                if (onUpdate) {
                    onUpdate({ extended_risk_diagnostic: data.narrative });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const dimensions = [
        {
            key: "power_hardening",
            label: "Power Hardening",
            icon: Gavel,
            triggered: risk.flags.power_hardening,
            explanation: risk.explanations.power,
        },
        {
            key: "agency_collapse",
            label: "Agency Collapse",
            icon: ShieldAlert,
            triggered: risk.flags.agency_collapse,
            explanation: risk.explanations.agency,
        },
        {
            key: "epistemic_narrowing",
            label: "Epistemic Narrowing",
            icon: EyeOff,
            triggered: risk.flags.epistemic_narrowing,
            explanation: risk.explanations.epistemic,
        },
        {
            key: "structural_violence",
            label: "Structural Violence",
            icon: Zap,
            triggered: risk.flags.structural_violence,
            explanation: risk.explanations.structural,
        },
        {
            key: "temporal_closure",
            label: "Temporal Closure",
            icon: History,
            triggered: risk.flags.temporal_closure,
            explanation: risk.explanations.temporal,
        },
        {
            key: "absence_as_control",
            label: "Absence as Control",
            icon: Ban,
            triggered: risk.flags.absence_as_control,
            explanation: risk.explanations.absence,
        },
    ];

    return (
        <Card className={`border-2 ${risk.score >= 5 ? 'border-red-500 shadow-md ring-4 ring-red-500/10' : 'border-slate-200'} ${className || 'mt-8'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-6 w-6 ${risk.score >= 5 ? 'text-red-600' : 'text-slate-500'}`} />
                        <CardTitle className="text-xl font-bold uppercase tracking-wide">
                            Micro-Fascism Risk Index
                        </CardTitle>
                    </div>
                    <Badge className={`text-sm px-3 py-1 ${getScoreColor(risk.score)}`}>
                        {risk.level}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Lead with Narrative Interpretation */}
                <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {interpretRiskNarrative({ score: risk.score, level: risk.level, flags: risk.flags })}
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
                                className="w-full border-dashed text-slate-500 hover:text-slate-800 hover:border-slate-400"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Extended Analysis...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Extended Diagnostic
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100 animate-in fade-in zoom-in-95 duration-300">
                                <h5 className="text-xs font-bold text-purple-700 uppercase mb-2 flex items-center gap-2">
                                    <Sparkles className="h-3 w-3" />
                                    Extended Diagnostic
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
                        <AccordionTrigger className="text-xs text-slate-500 hover:text-slate-700 py-2 hover:no-underline">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="h-3 w-3" />
                                View Parametric Data
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex items-center gap-4 pt-2 pb-4">
                                <div className="text-2xl font-black text-slate-600">
                                    {risk.score}<span className="text-sm text-slate-400 font-normal">/6</span>
                                </div>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${getBarColor(risk.score)}`}
                                        style={{ width: `${(risk.score / 6) * 100}%` }}
                                    />
                                </div>
                                <Badge className={`text-xs ${getScoreColor(risk.score)}`}>
                                    {risk.level}
                                </Badge>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 gap-4'}`}>
                    {dimensions.map((dim) => (
                        <div
                            key={dim.key}
                            className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${dim.triggered ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100 opacity-60'
                                }`}
                        >
                            <div className={`p-2 rounded-full mt-0.5 ${dim.triggered ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                <dim.icon className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold uppercase mb-1 ${dim.triggered ? 'text-red-900' : 'text-slate-500'}`}>
                                    {dim.label}
                                </h4>
                                {dim.triggered ? (
                                    <p className="text-xs text-red-800 leading-snug">
                                        {dim.explanation}
                                    </p>
                                ) : (
                                    !compact && (
                                        <p className="text-xs text-slate-400 italic">
                                            No critical drift detected.
                                        </p>
                                    )
                                )}


                                <div className="mt-2 flex items-center justify-between">
                                    {analysis.rebuttals?.[dim.key] && (
                                        <div className="bg-purple-50 border border-purple-100 p-2 rounded text-xs text-purple-800 italic flex-1 mr-2 relative">
                                            <span className="font-bold not-italic text-[10px] uppercase text-purple-600 block mb-0.5">Researcher Context:</span>
                                            {analysis.rebuttals[dim.key].text}
                                        </div>
                                    )}
                                    {onUpdate && (
                                        <div className={analysis.rebuttals?.[dim.key] ? "" : "ml-auto"}>
                                            <RebuttalButton
                                                dimensionKey={dim.key}
                                                dimensionLabel={dim.label}
                                                existingRebuttal={analysis.rebuttals?.[dim.key]?.text}
                                                onSave={(text) => handleRebuttal(dim.key, text)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase tracking-wider">
                    Diagnostic Tool • Not a Moral Judgment • Detects Structural Hardening
                </div>
            </CardContent>
        </Card>
    );
}
