import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, CheckCircle2, AlertTriangle, BookOpen, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StructuralConcernResult } from '@/lib/structural-concern-service';

interface StructuralAnalysisCardProps {
    actorName: string;
    excerptCount: number;
    result: StructuralConcernResult | null;
    challengedResult?: StructuralConcernResult | null;
    escalation?: any;
    onHighlightExcerpts?: (excerptIds: string[]) => void;
    onGenerate?: () => void;
    isGenerating?: boolean;
}

export function StructuralAnalysisCard({
    actorName,
    excerptCount,
    result,
    challengedResult,
    escalation,
    onHighlightExcerpts,
    onGenerate,
    isGenerating
}: StructuralAnalysisCardProps) {
    const [hoveredClaimIdx, setHoveredClaimIdx] = useState<number | null>(null);

    const handleMouseEnter = (claimIdx: number, excerptIds: string[]) => {
        setHoveredClaimIdx(claimIdx);
        if (onHighlightExcerpts) onHighlightExcerpts(excerptIds);
    };

    const handleMouseLeave = () => {
        setHoveredClaimIdx(null);
        if (onHighlightExcerpts) onHighlightExcerpts([]);
    };

    if (!result) {
        if (onGenerate) {
            return (
                <Card className="border border-slate-200 shadow-sm mt-6 overflow-hidden bg-white">
                    <CardHeader className="pb-4 border-b bg-slate-50/80">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-indigo-600" />
                                Structural Concern Mapping
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                        <Brain className="h-8 w-8 text-slate-300 mb-3" />
                        <h4 className="text-sm font-semibold text-slate-700 mb-1">No Structural Analysis Available</h4>
                        <p className="text-xs text-slate-500 mb-4 max-w-xs">
                            Generate an AI analysis to see if this actor's absence is a structural concern based on the provided excerpts.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            onClick={onGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Analyzing Excerpts...</>
                            ) : (
                                <><Brain className="h-3 w-3 mr-2" /> Run Structural Analysis</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            );
        }
        return null;
    }

    if (result?.insufficientEvidence) {
        return (
            <Card className="border border-amber-200 bg-amber-50 shadow-sm mt-6">
                <CardHeader className="pb-3 border-b border-amber-100 bg-white/50">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-900">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Insufficient Structural Evidence
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-sm text-amber-800 leading-relaxed">
                    {result.thesis || "The provided excerpts do not contain enough structural or role-allocating text to make grounded claims about governance standing or explicit exclusion. The model refused to hallucinate a structural role based on this data alone."}
                </CardContent>
            </Card>
        );
    }

    const validClaims = result?.claims || [];

    const getLogicColor = (logic: string) => {
        switch (logic) {
            case 'role-allocation': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'categorical boundary': return 'bg-violet-100 text-violet-800 border-violet-200';
            case 'procedural participation': return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'silencing / omission': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'external reference-only': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const highlightQuotes = (text: string) => {
        if (!text) return text;
        const parts = text.split(/(["“”''].*?["“”''])/g);
        return parts.map((part, i) => {
            if (/^["“”''].*["“”'']$/.test(part)) {
                return (
                    <span key={i} className="bg-indigo-50 text-indigo-700 px-1 rounded-sm font-medium">
                        {part}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <Card className="border border-slate-200 shadow-sm mt-6 overflow-hidden bg-white">
            <CardHeader className="pb-4 border-b bg-slate-50/80">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                            Structural Concern Mapping
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1">
                            Analyzed strictly from <strong>{excerptCount} excerpts</strong> for {actorName}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Thesis Statement */}
                {result?.thesis && (
                    <div className="p-5 bg-indigo-50/50 border-b border-indigo-100">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Net Effect / Thesis
                        </h4>
                        <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                            {highlightQuotes(result.thesis)}
                        </p>
                    </div>
                )}

                {/* Claims List */}
                <div className="divide-y divide-slate-100">
                    {validClaims.map((claim, idx) => (
                        <div
                            key={idx}
                            className={`p-5 transition-colors ${hoveredClaimIdx === idx ? 'bg-slate-50' : 'bg-white'}`}
                            onMouseEnter={() => handleMouseEnter(idx, claim.supportedBy)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <h4 className="text-sm font-semibold text-slate-800">
                                    {idx + 1}. {claim.sectionTitle}
                                </h4>
                                <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${getLogicColor(claim.logicType)}`}>
                                    {claim.logicType.replace(/-/g, ' ')}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                {highlightQuotes(claim.claimText)}
                            </p>

                            {/* Grounding Context */}
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase font-semibold">
                                    Grounded In
                                </Badge>
                                <span className="text-xs text-slate-500 font-mono">
                                    {claim.supportedBy.length} Excerpt{claim.supportedBy.length === 1 ? '' : 's'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Challenged Results Section */}
                {challengedResult && (
                    <div className="border-t-2 border-dashed border-indigo-200 bg-purple-50/30">
                        <div className="p-4 bg-purple-100/50 border-b border-purple-100 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-purple-700" />
                            <h3 className="font-semibold text-purple-900 text-sm">Anti-Structural Concern Findings</h3>
                        </div>
                        {challengedResult.thesis && (
                            <div className="p-5 border-b border-purple-100/50">
                                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Net Effect / Challenge Thesis
                                </h4>
                                <p className="text-sm text-purple-950 font-medium leading-relaxed">
                                    {highlightQuotes(challengedResult.thesis)}
                                </p>
                            </div>
                        )}
                        <div className="divide-y divide-purple-100/50">
                            {challengedResult.claims?.map((claim, idx) => (
                                <div
                                    key={`challenge-${idx}`}
                                    className="p-5 bg-transparent"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h4 className="text-sm font-semibold text-slate-800">
                                            {idx + 1}. {claim.sectionTitle}
                                        </h4>
                                        <Badge variant="outline" className={`text-[10px] whitespace-nowrap border-purple-200 text-purple-700 bg-purple-50/50`}>
                                            {claim.logicType.replace(/-/g, ' ')}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                        {highlightQuotes(claim.claimText)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {escalation && (
                    <div className="border-t-2 border-indigo-300 bg-slate-50">
                        <div className="p-4 bg-slate-100 border-b flex items-center gap-2">
                            <Brain className="h-4 w-4 text-slate-700" />
                            <h3 className="font-semibold text-slate-900 text-sm">Escalation Evaluation</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Verdict</h4>
                                <Badge variant={escalation.verdict === 'pro_stronger' ? 'destructive' : escalation.verdict === 'anti_stronger' ? 'default' : 'secondary'}>
                                    {escalation.verdict === 'pro_stronger' ? 'Pro-Exclusion Stronger' : escalation.verdict === 'anti_stronger' ? 'Anti-Exclusion Stronger' : 'Tie / Inconclusive'}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Methodological Critique</h4>
                                <p className="text-sm text-slate-800 leading-relaxed italic">{escalation.methodologicalCritique.notes}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Tier 1: Proven</h4>
                                    <p className="text-sm text-slate-700">{escalation.tier1Proven.text}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Tier 2: Unproven</h4>
                                    <p className="text-sm text-slate-700">{escalation.tier2Unproven.text}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-slate-50 border-t py-3 px-5 text-xs text-slate-400 flex items-center justify-between">
                <span>AI-generated formal mapping based solely on provided quote text.</span>
                <span>{validClaims.length} structural points proved.</span>
            </CardFooter>
        </Card >
    );
}
