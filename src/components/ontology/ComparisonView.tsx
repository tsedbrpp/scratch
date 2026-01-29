import React from 'react';
import { ComparisonResult } from '@/types/ontology';
import { Source } from '@/types'; // Import Source type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { SystemCritiqueSection } from "@/components/common/SystemCritiqueSection";
import { ConceptCard } from './ConceptCard';
import { AssemblageGauges } from './AssemblageGauges';

interface ComparisonViewProps {
    result: ComparisonResult;
    sources: Source[];
}

export function ComparisonView({ result, sources }: ComparisonViewProps) {
    // Resolve Source Names
    const sourceA = sources.find(s => s.id === result.sourceAId);
    const sourceB = sources.find(s => s.id === result.sourceBId);
    const sourceC = result.sourceCId ? sources.find(s => s.id === result.sourceCId) : undefined;

    // Remap metrics to use actual names
    const mappedMetrics = result.assemblage_metrics?.map(m => {
        let label = m.jurisdiction;
        // Check for standard placeholder labels or ID matches
        if ((m.jurisdiction === 'Ontology A' || m.jurisdiction === 'Source A') && sourceA) label = sourceA.title;
        else if ((m.jurisdiction === 'Ontology B' || m.jurisdiction === 'Source B') && sourceB) label = sourceB.title;
        else if ((m.jurisdiction === 'Ontology C' || m.jurisdiction === 'Source C') && sourceC) label = sourceC.title;
        return { ...m, jurisdiction: label };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Interactive Assemblage Gauges (The "Machine") */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Assemblage Metrics
                </h3>
                <p className="text-slate-500 text-sm">
                    AI-derived scores for Territorialization (Rigidity) and Coding (Rule Density).
                </p>
                <AssemblageGauges metrics={mappedMetrics} />
            </div>

            {/* Comparison Summary */}
            <Card className="bg-indigo-50 border-indigo-200">
                <CardHeader>
                    <CardTitle className="text-xl text-indigo-900">
                        Comparison Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-indigo-800 leading-relaxed font-medium">
                        {result.summary}
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Structural Differences</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {result.structural_differences}
                        </p>
                    </CardContent>
                </Card>
                <ConceptCard
                    title="Shared Concepts"
                    concepts={result.shared_concepts}
                    variant="outline"
                    className="bg-white" // ensure bg matches previous visual if needed, though default card is usually white
                // Outline badges previously had: className="bg-green-50 text-green-700 border-green-200"
                // ConceptCard variant='outline' gives default outline. 
                // I might need to adjust ConceptCard to support custom badge classes if strict visual parity is needed.
                // For now, standard 'outline' is acceptable for a clean refactor.
                />
            </div>

            <div className={`grid grid-cols-1 md:gap-6 ${result.sourceCId ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                <ConceptCard
                    title="Unique to Source A"
                    concepts={result.unique_concepts_source_a}
                />
                <ConceptCard
                    title="Unique to Source B"
                    concepts={result.unique_concepts_source_b}
                />
                {result.sourceCId && (
                    <ConceptCard
                        title="Unique to Source C"
                        concepts={result.unique_concepts_source_c || []}
                        emptyMessage="No unique concepts identified."
                    />
                )}
            </div>

            {/* System Critique (Devil's Advocate) */}
            {result.system_critique && (
                <SystemCritiqueSection critique={{
                    ...result.system_critique,
                    blind_spots: result.system_critique.blind_spots || [],
                    critique: "Comparison Critique", // Default title
                    implications: []
                }} />
            )}
        </div>
    );
}
