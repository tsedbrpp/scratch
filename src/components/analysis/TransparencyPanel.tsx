import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertCircle, BookOpen, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransparencyMetadata } from '@/services/transparency-service';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransparencyPanelProps {
    metadata: TransparencyMetadata;
    score?: number;
}

export function TransparencyPanel({ metadata, score }: TransparencyPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const confidenceColors = {
        high: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30',
        medium: 'bg-amber-950/50 text-amber-400 border-amber-500/30',
        low: 'bg-rose-950/50 text-rose-400 border-rose-500/30'
    };

    const getScoreInterpretation = (s: number, metric: string) => {
        if (s >= 90) return "Very High: Maximum structural intensity and analytical certainty.";
        if (s >= 70) {
            if (metric.includes("Asymmetry")) return "High Imbalance: Significant epistemic exclusion detected.";
            if (metric.includes("Power")) return "Significant Concentration: Power is held by a few key actors.";
            return "High Intensity: This pattern is prominent and analytically significant.";
        }
        if (s >= 50) return "Moderate: Notable pattern presence with balanced counter-forces.";
        if (s >= 30) return "Low: Minor presence; mostly distributed or ambiguous.";
        return "Minimal: This dynamic is not a primary driver in this analysis.";
    };

    return (
        <TooltipProvider>
            <Card className="bg-zinc-900 border-zinc-700 shadow-xl overflow-hidden group transition-all duration-300 hover:border-zinc-500">
                {/* Header - Always Visible */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-800 transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Info className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <span className="font-bold text-zinc-100 block">{metadata.metric_name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Calculation Methodology</span>
                        </div>
                        {score !== undefined && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge className="ml-2 bg-indigo-500 text-white border-none px-3 py-1 font-mono text-sm shadow-lg shadow-indigo-500/20 cursor-help">
                                        Score: {score}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs p-3 shadow-2xl">
                                    <p className="font-bold mb-1 border-b border-zinc-700 pb-1 uppercase text-[10px] tracking-wider text-indigo-400">Interpretive Guide</p>
                                    <p className="text-xs leading-relaxed">
                                        {getScoreInterpretation(score, metadata.metric_name)}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-300">
                            {isExpanded ? 'Collapse' : 'Details'}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-zinc-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-zinc-400" />
                        )}
                    </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-5 pb-6 space-y-6 border-t border-zinc-800 animate-in slide-in-from-top-1 duration-200">
                        {/* Formula Section */}
                        <div className="pt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Code className="w-4 h-4 text-purple-400" />
                                <h4 className="font-bold text-zinc-100 uppercase text-xs tracking-wider">The Formula</h4>
                            </div>
                            <p className="text-sm text-zinc-200 mb-4 leading-relaxed">
                                {metadata.formula.description}
                            </p>
                            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-purple-400 shadow-inner">
                                {metadata.formula.mathematical_notation}
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-2 border-l-2 border-zinc-800 pl-4">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Variables:</p>
                                {Object.entries(metadata.formula.variables).map(([key, desc]) => (
                                    <div key={key} className="text-xs text-zinc-300">
                                        <span className="font-mono text-purple-400 font-bold">{key}</span>: {desc}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Theoretical Basis Section */}
                        <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-blue-400" />
                                <h4 className="font-bold text-zinc-100 uppercase text-xs tracking-wider">Knowledge Roots</h4>
                            </div>
                            <p className="text-sm text-zinc-200 mb-4">
                                <span className="text-zinc-500 font-medium italic">Integrated Framework:</span> <span className="text-blue-400 font-semibold">{metadata.theoretical_basis.framework}</span>
                            </p>
                            <div className="mb-4">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Key Theoretical Lenses:</p>
                                <div className="flex flex-wrap gap-2">
                                    {metadata.theoretical_basis.key_concepts.map((concept, i) => (
                                        <Badge key={i} variant="secondary" className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700">
                                            {concept}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            {metadata.theoretical_basis.citations.length > 0 && (
                                <div className="pt-3 border-t border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Primary Citations:</p>
                                    <ul className="text-xs text-zinc-300 space-y-2">
                                        {metadata.theoretical_basis.citations.map((citation, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-blue-500">•</span>
                                                <span className="italic">{citation}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Confidence & Design Section */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                    <h4 className="font-bold text-zinc-100 uppercase text-xs tracking-wider">Limitations</h4>
                                </div>
                                <div className="mb-3">
                                    <Badge className={confidenceColors[metadata.calculation_provenance.confidence_level] + " font-bold px-3 py-1"}>
                                        Confidence: {metadata.calculation_provenance.confidence_level.toUpperCase()}
                                    </Badge>
                                </div>
                                <ul className="text-xs text-zinc-300 space-y-2">
                                    {metadata.calculation_provenance.caveats.map((caveat, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-amber-500/50">•</span>
                                            <span>{caveat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-4 h-4 text-indigo-400" />
                                    <h4 className="font-bold text-zinc-100 uppercase text-xs tracking-wider">Design Decision</h4>
                                </div>
                                <p className="text-xs text-zinc-300 leading-relaxed italic mb-4">
                                    "{metadata.design_rationale.why_this_approach}"
                                </p>
                                <div className="pt-3 border-t border-indigo-500/10">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Positionality:</p>
                                    <p className="text-[10px] text-indigo-300 font-medium">
                                        {metadata.design_rationale.designer_positionality}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-[10px] uppercase font-bold tracking-[0.2em]">
                            <span className="text-zinc-600">Metric Kernel v{metadata.version}</span>
                            <span className="text-zinc-600">Updated: {metadata.last_updated}</span>
                        </div>
                    </div>
                )}
            </Card>
        </TooltipProvider>
    );
}
