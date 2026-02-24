import React from 'react';
import { EvidenceQuote } from '@/lib/study-config';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, ExternalLink } from 'lucide-react';
import { useSources } from '@/hooks/useSources';

interface QuoteCardListProps {
    quotes?: EvidenceQuote[];
    onContextRequest?: (quote: EvidenceQuote) => void;
    onFullDocRequest?: () => void;
    documentLabel?: string;
    highlightedExcerptIds?: string[];
}

export function QuoteCardList({ quotes, onContextRequest, onFullDocRequest, documentLabel, highlightedExcerptIds = [] }: QuoteCardListProps) {
    const { sources } = useSources();

    if (!quotes || quotes.length === 0) {
        return (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
                No verbatim quotes provided for this case.
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
            {quotes.map((quote) => {
                const isHighlighted = highlightedExcerptIds.includes(quote.id);
                return (
                    <Card
                        key={quote.id}
                        className={`border-l-4 shadow-sm overflow-hidden transition-all duration-300 ${isHighlighted ? 'border-l-indigo-600 ring-2 ring-indigo-500/50 bg-indigo-50/30 transform scale-[1.01]' : 'border-l-blue-500'}`}
                    >
                        <CardHeader className={`border-b py-3 px-4 ${isHighlighted ? 'bg-indigo-100/50' : 'bg-slate-50'}`}>
                            <CardTitle className="text-sm font-semibold text-slate-800">
                                {quote.heading || "Excerpt"}
                                {isHighlighted && <Badge variant="secondary" className="ml-2 bg-indigo-200 text-indigo-800 text-[10px]">Grounded Claim Reference</Badge>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className={`p-4 ${isHighlighted ? 'bg-transparent' : 'bg-white'}`}>
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
                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
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
