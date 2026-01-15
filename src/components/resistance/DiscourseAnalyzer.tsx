"use client"

import { useState } from "react";
import { ResistanceArtifact, ArtifactAnalysisResult } from "@/types/resistance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, BookOpen, MessageCircle, Network } from "lucide-react";
import { useDemoMode } from "@/hooks/useDemoMode";

interface DiscourseAnalyzerProps {
    artifact: ResistanceArtifact;
    onAnalysisComplete?: (analysis: ArtifactAnalysisResult) => void;
}

export function DiscourseAnalyzer({ artifact, onAnalysisComplete }: DiscourseAnalyzerProps) {
    const { isReadOnly } = useDemoMode();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<ArtifactAnalysisResult | null>(
        artifact.frames ? {
            artifact_id: artifact.id,
            frames: artifact.frames,
            strategies: artifact.rhetorical_strategies || [],
            reconfiguration: artifact.reconfiguration_potential,
            generated_at: new Date().toISOString()
        } : null
    );

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
            }

            const response = await fetch('/api/resistance/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    artifact_id: artifact.id,
                    artifact_text: artifact.text,
                    analysis_type: 'full'
                })
            });

            const data = await response.json();
            if (data.success) {
                setAnalysis(data.analysis);
                onAnalysisComplete?.(data.analysis);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Analysis Trigger */}
            {!analysis && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Discourse Analysis</h3>
                        <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
                            Analyze this artifact to extract discourse frames, rhetorical strategies,
                            and assemblage reconfiguration potential.
                        </p>
                        <Button onClick={handleAnalyze} disabled={isAnalyzing || isReadOnly} title={isReadOnly ? "Analysis disabled in Demo Mode" : ""}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Run Discourse Analysis
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Analysis Results */}
            {analysis && (
                <>
                    {/* Discourse Frames */}
                    {analysis.frames && analysis.frames.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-lg">Discourse Frames</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.frames.map((frame, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <h4 className="font-bold text-slate-900">{frame.frame_name}</h4>
                                        <p className="text-sm text-slate-700 mt-1">{frame.description}</p>
                                        {frame.evidence_quotes && frame.evidence_quotes.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {frame.evidence_quotes.map((quote, qIdx) => (
                                                    <blockquote key={qIdx} className="text-xs text-slate-600 italic pl-3 border-l-2 border-slate-200">
                                                        "{quote}"
                                                    </blockquote>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Rhetorical Strategies */}
                    {analysis.strategies && analysis.strategies.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-green-600" />
                                    <CardTitle className="text-lg">Rhetorical Strategies</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.strategies.map((strategy, idx) => (
                                    <div key={idx} className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <Badge className="bg-green-200 text-green-800">
                                                {strategy.strategy.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-2">{strategy.description}</p>
                                        <p className="text-xs text-slate-600 mt-2 italic">
                                            Example: "{strategy.example}"
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Assemblage Reconfiguration */}
                    {analysis.reconfiguration && (
                        <Card className="border-2 border-purple-200">
                            <CardHeader className="bg-purple-50">
                                <div className="flex items-center gap-2">
                                    <Network className="h-5 w-5 text-purple-600" />
                                    <CardTitle className="text-lg">Assemblage Reconfiguration Analysis</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <h4 className="font-semibold text-sm text-purple-900 mb-1">Deterritorializes:</h4>
                                    <p className="text-sm text-slate-700">{analysis.reconfiguration.deterritorializes}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-sm text-purple-900 mb-1">Recodes:</h4>
                                    <p className="text-sm text-slate-700">{analysis.reconfiguration.recodes}</p>
                                </div>

                                {analysis.reconfiguration.new_connections && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-purple-900 mb-2">New Connections:</h4>
                                        <ul className="space-y-1">
                                            {analysis.reconfiguration.new_connections.map((conn, idx) => (
                                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                    <span className="text-purple-500 mt-1">→</span>
                                                    <span>{conn}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.reconfiguration.lines_of_flight && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-purple-900 mb-2">Lines of Flight:</h4>
                                        <ul className="space-y-1">
                                            {analysis.reconfiguration.lines_of_flight.map((line, idx) => (
                                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                    <span className="text-purple-500 mt-1">↗</span>
                                                    <span>{line}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-purple-100">
                                    <h4 className="font-semibold text-sm text-purple-900 mb-2">Theoretical Contribution:</h4>
                                    <p className="text-sm text-slate-800 leading-relaxed bg-white p-3 rounded border border-purple-100">
                                        {analysis.reconfiguration.theoretical_contribution}
                                    </p>
                                </div>

                                {analysis.reconfiguration.empirical_evidence && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-purple-900 mb-2">Empirical Evidence:</h4>
                                        <blockquote className="text-xs text-slate-600 italic pl-3 border-l-2 border-purple-200">
                                            {analysis.reconfiguration.empirical_evidence}
                                        </blockquote>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Re-analyze button */}
                    <div className="flex justify-center">
                        <Button variant="outline" onClick={handleAnalyze} disabled={isAnalyzing || isReadOnly} title={isReadOnly ? "Analysis disabled in Demo Mode" : ""}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Re-analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Re-run Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
