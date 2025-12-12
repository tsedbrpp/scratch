import React from 'react';
import { ComparisonResult } from '@/types/ontology';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SystemCritiqueSection } from "@/components/common/SystemCritiqueSection";

interface ComparisonViewProps {
    result: ComparisonResult;
}

export function ComparisonView({ result }: ComparisonViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-indigo-50 border-indigo-200">
                <CardHeader>
                    <CardTitle className="text-xl text-indigo-900">Comparison Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-indigo-800 leading-relaxed">
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
                        <p className="text-sm text-slate-600">
                            {result.structural_differences}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Shared Concepts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {result.shared_concepts.map((concept, i) => (
                                <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {concept}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-slate-500">Unique to Source A</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {result.unique_concepts_source_a.map((concept, i) => (
                                <Badge key={i} variant="secondary">
                                    {concept}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-slate-500">Unique to Source B</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {result.unique_concepts_source_b.map((concept, i) => (
                                <Badge key={i} variant="secondary">
                                    {concept}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* System Critique (Devil's Advocate) */}
            {result.system_critique && (
                <SystemCritiqueSection critique={result.system_critique} />
            )}
        </div>
    );
}
