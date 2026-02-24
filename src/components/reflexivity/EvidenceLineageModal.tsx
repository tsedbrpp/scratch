import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Quote, FileText } from 'lucide-react';

interface EvidenceQuote {
    text: string;
    source?: string;
    context?: string;
}

interface EvidenceLineageModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    quotes: EvidenceQuote[];
    sourceType?: "Order of Worth" | "Cultural Cluster" | "Trace";
}

export function EvidenceLineageModal({
    isOpen,
    onClose,
    title,
    description,
    quotes,
    sourceType = "Trace"
}: EvidenceLineageModalProps) {
    const renderContextWithHighlight = (contextText: string, quoteText: string) => {
        if (!contextText) return null;
        if (!quoteText) return <span className="whitespace-pre-wrap">{contextText}</span>;

        // Clean up quote for searching (remove leading/trailing ellipses or basic quotes that AI might wrap it in)
        const cleanQuote = quoteText.replace(/^[\s\.\"\']+/, '').replace(/[\s\.\"\']+$/, '').trim();

        if (!cleanQuote || cleanQuote.length < 5) return <span className="whitespace-pre-wrap">{contextText}</span>;

        const idx = contextText.indexOf(cleanQuote);
        if (idx === -1) return <span className="whitespace-pre-wrap">{contextText}</span>;

        const before = contextText.substring(0, idx);
        const match = contextText.substring(idx, idx + cleanQuote.length);
        const after = contextText.substring(idx + cleanQuote.length);

        return (
            <span className="whitespace-pre-wrap block">
                {before}
                <mark className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 font-medium">{match}</mark>
                {after}
            </span>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{sourceType} Evidence Lineage</span>
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-900">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-slate-600 mt-2">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="space-y-6">
                    {quotes.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                            No direct textual evidence extracted for this item.
                        </div>
                    ) : (
                        quotes.map((quote, idx) => (
                            <div key={idx} className="relative pl-6 border-l-2 border-indigo-200 group hover:border-indigo-400 transition-colors">
                                <Quote className="absolute -left-2.5 top-0 h-5 w-5 text-indigo-100 bg-white p-0.5 group-hover:text-indigo-500 transition-colors" fill="currentColor" />
                                <blockquote className="text-sm text-slate-800 italic leading-relaxed mb-2">
                                    "{quote.text}"
                                </blockquote>
                                {quote.source && (
                                    <div className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                                        — {quote.source}
                                    </div>
                                )}
                                {quote.context && (
                                    <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 shadow-inner max-h-60 overflow-y-auto">
                                        <div className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-2">Expanded Context</div>
                                        {renderContextWithHighlight(quote.context, quote.text)}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
