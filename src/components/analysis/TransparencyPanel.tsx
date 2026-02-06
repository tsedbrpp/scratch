import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertCircle, BookOpen, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransparencyMetadata } from '@/services/transparency-service';

interface TransparencyPanelProps {
    metadata: TransparencyMetadata;
    score?: number;
}

export function TransparencyPanel({ metadata, score }: TransparencyPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const confidenceColors = {
        high: 'bg-green-900/30 text-green-300 border-green-500/30',
        medium: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30',
        low: 'bg-red-900/30 text-red-300 border-red-500/30'
    };

    return (
        <Card className="bg-zinc-900/50 border-zinc-700/50 overflow-hidden">
            {/* Header - Always Visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-white">How This Was Calculated</span>
                    {score !== undefined && (
                        <Badge variant="outline" className="ml-2">
                            Score: {score}
                        </Badge>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-zinc-700/50">
                    {/* Formula Section */}
                    <div className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Code className="w-4 h-4 text-purple-400" />
                            <h4 className="font-semibold text-white">Formula</h4>
                        </div>
                        <p className="text-sm text-zinc-300 mb-2">
                            {metadata.formula.description}
                        </p>
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded p-3 font-mono text-sm text-purple-300">
                            {metadata.formula.mathematical_notation}
                        </div>
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-zinc-400 font-semibold">Variables:</p>
                            {Object.entries(metadata.formula.variables).map(([key, desc]) => (
                                <div key={key} className="text-xs text-zinc-400 ml-4">
                                    <span className="font-mono text-purple-300">{key}</span>: {desc}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Theoretical Basis Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            <h4 className="font-semibold text-white">Theoretical Foundation</h4>
                        </div>
                        <p className="text-sm text-zinc-300 mb-2">
                            <span className="font-semibold">Framework:</span> {metadata.theoretical_basis.framework}
                        </p>
                        <div className="mb-2">
                            <p className="text-xs text-zinc-400 font-semibold mb-1">Key Concepts:</p>
                            <div className="flex flex-wrap gap-1">
                                {metadata.theoretical_basis.key_concepts.map((concept, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {concept}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        {metadata.theoretical_basis.citations.length > 0 && (
                            <div>
                                <p className="text-xs text-zinc-400 font-semibold mb-1">Citations:</p>
                                <ul className="text-xs text-zinc-400 space-y-1 ml-4">
                                    {metadata.theoretical_basis.citations.map((citation, i) => (
                                        <li key={i} className="list-disc">{citation}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Confidence & Caveats */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <h4 className="font-semibold text-white">Limitations & Caveats</h4>
                        </div>
                        <div className="mb-2">
                            <Badge className={confidenceColors[metadata.calculation_provenance.confidence_level]}>
                                Confidence: {metadata.calculation_provenance.confidence_level}
                            </Badge>
                        </div>
                        <ul className="text-sm text-zinc-300 space-y-1 ml-4">
                            {metadata.calculation_provenance.caveats.map((caveat, i) => (
                                <li key={i} className="list-disc">{caveat}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Design Rationale */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-indigo-400" />
                            <h4 className="font-semibold text-white">Design Decisions</h4>
                        </div>
                        <div className="space-y-2 text-sm text-zinc-300">
                            <div>
                                <p className="font-semibold text-zinc-200 mb-1">Why this approach:</p>
                                <p className="text-zinc-400">{metadata.design_rationale.why_this_approach}</p>
                            </div>
                            {metadata.design_rationale.alternatives_considered.length > 0 && (
                                <div>
                                    <p className="font-semibold text-zinc-200 mb-1">Alternatives considered:</p>
                                    <ul className="text-zinc-400 space-y-1 ml-4">
                                        {metadata.design_rationale.alternatives_considered.map((alt, i) => (
                                            <li key={i} className="list-disc">{alt}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {metadata.design_rationale.known_limitations.length > 0 && (
                                <div>
                                    <p className="font-semibold text-zinc-200 mb-1">Known limitations:</p>
                                    <ul className="text-zinc-400 space-y-1 ml-4">
                                        {metadata.design_rationale.known_limitations.map((limit, i) => (
                                            <li key={i} className="list-disc">{limit}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="pt-2 border-t border-zinc-700/50">
                                <p className="font-semibold text-zinc-200 mb-1">Designer Positionality:</p>
                                <p className="text-zinc-400 italic">{metadata.design_rationale.designer_positionality}</p>
                            </div>
                        </div>
                    </div>

                    {/* Version Info */}
                    <div className="pt-2 border-t border-zinc-700/50 text-xs text-zinc-500">
                        Version {metadata.version} • Last updated {metadata.last_updated}
                    </div>
                </div>
            )}
        </Card>
    );
}
