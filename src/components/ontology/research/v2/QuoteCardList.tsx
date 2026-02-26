import React from 'react';
import { EvidenceQuote } from '@/lib/study-config';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, ExternalLink } from 'lucide-react';
import { useSources } from '@/hooks/useSources';

import { useRouter } from 'next/navigation';
import { useEvaluationContext } from './EvaluationContext';

interface QuoteCardListProps {
    quotes?: EvidenceQuote[];
    onContextRequest?: (quote: EvidenceQuote) => void;
    onFullDocRequest?: () => void;
    documentLabel?: string;
    highlightedExcerptIds?: string[];
    // Pass the Case ID so we can stably hash targets
    caseId?: string;
    onQuoteSelected?: (quote: EvidenceQuote) => void;
}

export function QuoteCardList({ quotes, onContextRequest, onFullDocRequest, documentLabel, highlightedExcerptIds = [], caseId, onQuoteSelected }: QuoteCardListProps) {
    const { sources } = useSources();

    // Attempt to grab context safely (fallback if rendered outside Provider)
    let contextVals;
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        contextVals = useEvaluationContext();
    } catch (e) {
        contextVals = null;
    }
    const resolvedTargets = contextVals?.resolvedTargets || [];
    const registerEvidenceRef = contextVals?.registerEvidenceRef;
    const focusMode = contextVals?.focusMode;

    if (!quotes || quotes.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-lg text-slate-600 bg-slate-50/50">
                <div className="mb-3 text-slate-400 flex justify-center">
                    <Maximize2 className="h-8 w-8 opacity-50" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">No quotes extracted for this case</h4>
                <p className="text-sm mb-5 text-slate-500 max-w-md mx-auto leading-relaxed">
                    This may indicate: (a) true absence in excerpts, (b) extraction failure, or (c) excerpt set too narrow.
                </p>
                <div className="flex justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={onFullDocRequest}>
                        <ExternalLink className="h-4 w-4 mr-2 text-slate-400" />
                        Search Full Document
                    </Button>
                    <Button variant="outline" size="sm" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800">
                        Mark Insufficient Evidence
                    </Button>
                </div>
            </div>
        );
    }

    const getSourceName = (id: string, fallback?: string) => {
        const source = sources.find(s => s.id === id);
        return source ? source.title : (fallback || id);
    };

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Key Quotes (verbatim)</h3>
                <p className="text-sm text-slate-500">These excerpts are exact text from the policy. Use &quot;Open in context&quot; to view surrounding paragraphs.</p>
            </div>
            {quotes.map((quote, i) => {
                const legacyHighlight = highlightedExcerptIds.includes(quote.id);
                // The rigorous target ID defined in our Target Registry
                const targetId = `quote-${caseId}-${i}`;
                const isTargeted = resolvedTargets.includes(targetId);
                const isFocused = focusMode?.required && isTargeted;

                const borderClass = isFocused
                    ? 'border-l-fuchsia-600 ring-4 ring-fuchsia-500/30'
                    : isTargeted
                        ? 'border-l-indigo-600 ring-2 ring-indigo-500/50 transform scale-[1.01]'
                        : legacyHighlight
                            ? 'border-l-indigo-400'
                            : 'border-l-blue-500';

                return (
                    <Card
                        key={quote.id || i}
                        id={targetId}
                        ref={(el) => {
                            if (registerEvidenceRef) registerEvidenceRef(targetId, el);
                        }}
                        className={`border-l-4 shadow-sm overflow-hidden transition-all duration-300 ${borderClass} ${isFocused ? 'bg-fuchsia-50/20' : isTargeted ? 'bg-indigo-50/30' : ''} ${(focusMode && !isTargeted) ? 'opacity-40 grayscale-[50%]' : ''}`}
                    >
                        <CardHeader className={`border-b py-3 px-4 ${(isTargeted || isFocused) ? 'bg-indigo-100/50' : 'bg-slate-50'}`}>
                            <CardTitle className="text-sm font-semibold text-slate-800">
                                {quote.heading || "Excerpt"}
                                {legacyHighlight && <Badge variant="secondary" className="ml-2 bg-indigo-200 text-indigo-800 text-[10px]">Grounded Claim Reference</Badge>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className={`p-4 ${legacyHighlight ? 'bg-transparent' : 'bg-white'}`}>
                            <blockquote className="font-mono text-sm text-slate-700 whitespace-pre-wrap border-l-2 border-slate-200 pl-3">
                                {quote.text}
                            </blockquote>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t py-3 px-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="text-xs font-medium text-slate-500">
                                    Source: {getSourceName(quote.sourceRef.docId, documentLabel)} {quote.sourceRef.section ? `• ${quote.sourceRef.section}` : ''} {quote.sourceRef.paragraph ? `• ${quote.sourceRef.paragraph}` : ''}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {quote.actorTags.map(tag => (
                                        <Badge key={`actor-${tag}`} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] uppercase">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {quote.mechanismTags.map(tag => (
                                        <Badge key={`mech-${tag}`} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                {isFocused && onQuoteSelected && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full sm:w-auto h-8 text-xs gap-1 bg-fuchsia-600 hover:bg-fuchsia-700 animate-pulse"
                                        onClick={() => onQuoteSelected(quote)}
                                    >
                                        Select as Evidence
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto h-8 text-xs gap-1"
                                    onClick={() => onContextRequest && onContextRequest(quote)}
                                >
                                    <Maximize2 className="h-3 w-3" /> Context
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto h-8 text-xs gap-1"
                                    onClick={() => onFullDocRequest && onFullDocRequest()}
                                >
                                    <ExternalLink className="h-3 w-3" /> Full Doc
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
