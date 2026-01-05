"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe, Download, ExternalLink } from "lucide-react";
import { ResistanceArtifact } from "@/types/resistance";
import { Card } from "@/components/ui/card";
import { useWebDiscovery } from "@/hooks/useWebDiscovery";

interface DiscoveryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (artifact: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'>) => void;
}

export function DiscoveryDialog({ isOpen, onClose, onImport }: DiscoveryDialogProps) {
    const { query, setQuery, results, isLoading, importingUrl, isDemoMode, handleSearch, handleImport } = useWebDiscovery({ onImport });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-purple-600" />
                        Web Discovery Agent
                    </DialogTitle>
                    <DialogDescription>
                        Search for resistance artifacts (manifestos, position papers) from civil society organizations.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-6">
                    {/* Search Bar */}
                    <div className="flex flex-col gap-2">
                        {isDemoMode && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-md text-sm flex items-center gap-2">
                                <span className="font-bold">Demo Mode:</span>
                                API keys missing. Showing example data. Add keys to .env.local to enable real search.
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                    placeholder="Search query..."
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search Web"}
                            </Button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="space-y-3">
                        {results && results.map((result, idx) => (
                            <Card key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-slate-900">{result.title}</h4>
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {result.source}
                                            </Badge>
                                        </div>
                                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                            {result.url}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {result.snippet}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                            <span>{result.date}</span>
                                            <span>•</span>
                                            <span className="capitalize">{result.type.replace('_', ' ')}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleImport(result)}
                                        disabled={!!importingUrl}
                                    >
                                        {importingUrl === result.url ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                Import
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        ))}

                        {!results && !isLoading && (
                            <div className="text-center py-12 text-slate-400">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Enter a query to find resistance artifacts.</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
