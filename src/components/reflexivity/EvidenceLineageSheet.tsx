import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Quote, FileText } from 'lucide-react';

interface EvidenceQuote {
    text: string;
    source?: string;
    context?: string;
}

interface EvidenceLineageSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    quotes: EvidenceQuote[];
    sourceType?: "Order of Worth" | "Cultural Cluster" | "Trace";
}

export function EvidenceLineageSheet({
    isOpen,
    onClose,
    title,
    description,
    quotes,
    sourceType = "Trace"
}: EvidenceLineageSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{sourceType} Evidence Lineage</span>
                    </div>
                    <SheetTitle className="text-2xl font-bold text-slate-900">{title}</SheetTitle>
                    {description && (
                        <SheetDescription className="text-slate-600 mt-2">
                            {description}
                        </SheetDescription>
                    )}
                </SheetHeader>

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
                                    <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                        Context: {quote.context}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
