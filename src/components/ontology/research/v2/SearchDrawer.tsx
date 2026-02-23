import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSources } from '@/hooks/useSources';


interface SearchDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    searchChips?: string[];
    initialQuery?: string;
    documentId: string;
}

export function SearchDrawer({ isOpen, onClose, searchChips, initialQuery, documentId }: SearchDrawerProps) {
    const [query, setQuery] = React.useState(initialQuery || '');
    const [isSearching, setIsSearching] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    const { sources } = useSources();
    const source = sources.find(s => s.id === documentId);
    const documentText = source?.extractedText || '';

    React.useEffect(() => {
        if (isOpen) {
            setQuery(initialQuery || '');
            setHasSearched(!!initialQuery);
        }
    }, [isOpen, initialQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            setHasSearched(true);
        }, 300);
    };

    // Simple text search, split by paragraphs
    const paragraphs = documentText.split(/\n\s*\n/).filter(p => p.trim());

    const searchResults = React.useMemo(() => {
        if (!query.trim()) return paragraphs; // return all paragraphs if no query

        const lowerQuery = query.toLowerCase();
        return paragraphs.filter(p => p.toLowerCase().includes(lowerQuery));
    }, [query, paragraphs]);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="sm:max-w-md w-[400px] flex flex-col h-full bg-white p-6 shadow-2xl border-l border-slate-200">
                <SheetHeader className="mb-6 shrink-0">
                    <SheetTitle>Search Document</SheetTitle>
                    <SheetDescription>
                        Search the full policy document to verify contextual absences.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSearch} className="flex gap-2 mb-6 shrink-0 z-10 relative">
                    <Input
                        placeholder="Search for terms... (leave empty for full text)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </form>

                {searchChips && searchChips.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Suggested Terms</h4>
                        <div className="flex flex-wrap gap-2">
                            {searchChips.map(chip => (
                                <Badge
                                    key={chip}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-slate-200 transition-colors"
                                    onClick={() => {
                                        setQuery(chip);
                                        // Auto trigger search
                                        setIsSearching(true);
                                        setTimeout(() => {
                                            setIsSearching(false);
                                            setHasSearched(true);
                                        }, 400);
                                    }}
                                >
                                    {chip}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {(hasSearched || !query) && !isSearching && (
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-50/50 rounded-lg border border-slate-200 p-2 gap-2 mt-4 shadow-inner">
                        <div className="p-3 bg-white rounded flex justify-between items-center shrink-0 shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-600 font-medium">
                                {query.trim() ? `Found ${searchResults.length} occurrences in text` : `Full Document View`}
                            </p>
                            {!query.trim() && (
                                <p className="text-xs text-slate-400">{paragraphs.length} paragraphs</p>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto rounded bg-white shadow-sm border border-slate-100 p-4 relative isolate custom-scrollbar">
                            {searchResults.length > 0 ? (
                                <div className="space-y-6 pb-6 pr-2">
                                    {searchResults.map((p, idx) => {
                                        // Highlight query if exists
                                        if (query.trim()) {
                                            const parts = p.split(new RegExp(`(${query})`, 'gi'));
                                            return (
                                                <p key={idx} className="text-sm text-slate-700 leading-relaxed pb-4 border-b border-slate-50 last:border-0">
                                                    {parts.map((part, i) =>
                                                        part.toLowerCase() === query.toLowerCase() ?
                                                            <mark key={i} className="bg-yellow-200 text-slate-900 font-medium py-0.5 px-1 rounded-sm">{part}</mark> : part
                                                    )}
                                                </p>
                                            );
                                        }
                                        return (
                                            <p key={idx} className="text-sm text-slate-700 leading-relaxed pb-4 border-b border-slate-50 last:border-0">
                                                {p}
                                            </p>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    No textual evidence found matching "{query}"
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
