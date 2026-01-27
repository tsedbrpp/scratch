import React from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { ProvisionalBadge } from '@/components/ui/provisional-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, ExternalLink, Maximize2, Minimize2, X, FileText, Search, Globe, Layers } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { AssemblageExtractionDialog } from './AssemblageExtractionDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ActorCard } from './ActorCard';

interface ActorListProps {
    actors: EcosystemActor[];
    selectedActorId: string | null;
    onSelectActor: (id: string) => void;
    onClearAll: () => void;

    // Expansion Props
    isExpanded?: boolean;
    onToggleExpand?: () => void;

    // Extraction Props
    isExtracting: boolean;
    extractionText: string;
    setExtractionText: (text: string) => void;
    onExtract: () => void;
    isExtractionDialogOpen: boolean;
    setIsExtractionDialogOpen: (open: boolean) => void;

    onClose?: () => void;
    // New Props for Discovery
    discoveryQuery?: string;
    setDiscoveryQuery?: (query: string) => void;
    extractionMode?: "text" | "discovery";
    setExtractionMode?: (mode: "text" | "discovery") => void;

    // Link Enrichment
    onEnrichLinks?: () => void;
    isEnriching?: boolean;
    enrichProgress?: number;

    // Selection Props [NEW]
    selectedForGrouping: string[];
    onToggleSelection: (id: string) => void;
    onCreateConfiguration: () => void;
    configurations?: EcosystemConfiguration[]; // [NEW] For membership display
}

export function ActorList({
    actors,
    selectedActorId,
    onSelectActor,
    onClearAll,
    isExpanded = false,
    onToggleExpand,
    isExtracting,
    extractionText,
    setExtractionText,
    onExtract,
    isExtractionDialogOpen,
    setIsExtractionDialogOpen,
    onClose,
    discoveryQuery = "",
    setDiscoveryQuery,
    extractionMode = "text",
    setExtractionMode,
    onEnrichLinks,
    isEnriching = false,
    enrichProgress = 0,
    selectedForGrouping,
    onToggleSelection,
    onCreateConfiguration,
    configurations = []
}: ActorListProps) {
    const { isReadOnly } = useDemoMode();

    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredActors = React.useMemo(() => {
        if (!searchQuery.trim()) return actors;
        const lowerQuery = searchQuery.toLowerCase();
        return actors.filter(actor =>
            actor.name.toLowerCase().includes(lowerQuery) ||
            actor.description?.toLowerCase().includes(lowerQuery) ||
            actor.type.toLowerCase().includes(lowerQuery)
        );
    }, [actors, searchQuery]);

    return (
        <Card className="h-[500px] lg:h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Trace Provenance ({filteredActors.length})</CardTitle>
                    <div className="flex gap-1">
                        {onToggleExpand && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={onToggleExpand} title={isExpanded ? "Collapse" : "Expand"}>
                                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                        )}
                        {onClose && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-slate-100 text-slate-500 hover:bg-slate-200" onClick={onClose} title="Close Panel">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        {/* Extraction Dialog */}
                        <Dialog open={isExtractionDialogOpen} onOpenChange={setIsExtractionDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    title={isReadOnly ? "Sign in to extract actors" : "Extract from Text"}
                                    disabled={isReadOnly}
                                >
                                    <FileText className={`h-4 w-4 ${isReadOnly ? 'text-slate-300' : 'text-emerald-600'}`} />
                                </Button>
                            </DialogTrigger>
                        </Dialog>

                        <AssemblageExtractionDialog
                            open={isExtractionDialogOpen}
                            onOpenChange={setIsExtractionDialogOpen}
                            isExtracting={isExtracting}
                            extractionText={extractionText}
                            setExtractionText={setExtractionText}
                            discoveryQuery={discoveryQuery}
                            onExtract={onExtract}
                            extractionMode={extractionMode || "text"}
                            setExtractionMode={setExtractionMode || (() => { })}
                            setDiscoveryQuery={setDiscoveryQuery || (() => { })}
                        />

                        {/* Link Enrichment Button */}
                        {onEnrichLinks && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={onEnrichLinks}
                                disabled={isEnriching}
                                title="Find Actor Links"
                            >
                                {isEnriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                            </Button>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" title="Clear All Actors">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Clear All Actors?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove all actors (including mock data). You&apos;ll start with an empty ecosystem. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onClearAll} className="bg-red-600 hover:bg-red-700">
                                        Clear All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Enrichment Progress Bar if active */}
                {isEnriching && (
                    <div className="mt-2 text-[10px] text-indigo-600 flex items-center gap-2 bg-indigo-50 p-1 rounded px-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Finding Links... {enrichProgress}%
                    </div>
                )}
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        placeholder="Search actors..."
                        className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-slate-50 text-slate-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Create Configuration Action [NEW] */}
                {selectedForGrouping.length >= 2 && (
                    <div className="mt-3 animate-in slide-in-from-top-2">
                        <Button
                            onClick={onCreateConfiguration}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-2 h-9 text-sm font-semibold"
                        >
                            <Layers className="h-4 w-4" />
                            Define Macro Assemblage ({selectedForGrouping.length})
                        </Button>
                    </div>
                )}
            </CardHeader >
            <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0">
                {actors.length === 0 && (
                    <div className="text-center p-6 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg m-2 bg-slate-50/50">
                        <div className="flex justify-center mb-3">
                            <div className="relative">
                                <Globe className="h-10 w-10 text-slate-300" />
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-slate-200">
                                    <X className="h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                        <h3 className="font-semibold text-slate-700 mb-1">Strategic Subtraction Active</h3>
                        <p className="text-xs text-slate-500 max-w-[280px] mx-auto mb-4 leading-relaxed">
                            Automated web scraping and predictive modeling are excluded to preserve empirical traceability.
                            You must adhere researcher-curated text to trace mediations.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExtractionDialogOpen(true)}
                            className="bg-white hover:bg-slate-50 text-xs gap-2"
                        >
                            <FileText className="h-3 w-3 text-emerald-600" />
                            Adhere Empirical Source
                        </Button>
                    </div>
                )}

                {filteredActors.map(actor => (
                    <ActorCard
                        key={actor.id}
                        actor={actor}
                        isSelected={selectedActorId === actor.id}
                        isGroupSelected={selectedForGrouping.includes(actor.id)}
                        onSelect={() => onSelectActor(actor.id)}
                        onToggleGroupSelection={() => onToggleSelection(actor.id)}
                        configurations={configurations}
                    />
                ))}
            </CardContent>
        </Card >
    );
}
