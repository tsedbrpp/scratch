import React from 'react';
import { TheoreticalTensionsDialog } from './TheoreticalTensionsDialog';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { ProvisionalBadge } from '@/components/ui/provisional-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, ExternalLink, Maximize2, Minimize2, X, FileText, Search, Globe, Layers, Info } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { AssemblageExtractionDialog } from './AssemblageExtractionDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ActorCard } from './ActorCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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


    // Link Enrichment
    onEnrichLinks?: () => void;
    isEnriching?: boolean;
    enrichProgress?: number;

    // Selection Props [NEW]
    selectedForGrouping: string[];
    onToggleSelection: (id: string) => void;
    onCreateConfiguration: () => void;
    configurations?: EcosystemConfiguration[]; // [NEW] For membership display
    // [NEW] ANT Workbench Props
    tracedActorId?: string | null;
    onTraceActor?: (id: string | null) => void;
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
    onEnrichLinks,
    isEnriching = false,
    enrichProgress = 0,
    selectedForGrouping,
    onToggleSelection,
    onCreateConfiguration,
    configurations = [],
    tracedActorId,
    onTraceActor
}: ActorListProps) {
    const { isReadOnly } = useDemoMode();

    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredActors = React.useMemo(() => {
        let result = actors;
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = actors.filter(actor =>
                actor.name.toLowerCase().includes(lowerQuery) ||
                actor.description?.toLowerCase().includes(lowerQuery) ||
                actor.type.toLowerCase().includes(lowerQuery)
            );
        }

        // [NEW] Pin traced actor to top
        if (tracedActorId) {
            result = [...result].sort((a, b) => {
                if (a.id === tracedActorId) return -1;
                if (b.id === tracedActorId) return 1;
                return 0;
            });
        }

        return result;
    }, [actors, searchQuery, tracedActorId]);

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
                            onExtract={onExtract}
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
                                        This will remove all actors. You&apos;ll start with an empty ecosystem. This action cannot be undone.
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
            <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0 flex flex-col">
                {/* Empty State with Extraction Button - Always visible for adding more actors */}
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
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-700">Strategic Subtraction Active</h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs p-3 space-y-2 bg-slate-900 border border-slate-700 shadow-xl z-50 text-slate-100">
                                        <p className="font-semibold text-indigo-300">Why are features disabled?</p>
                                        <p>
                                            <span className="font-medium text-slate-200">Anti-Hallucination:</span> Automated web crawling is disabled to prevent the inclusion of irrelevant or &quot;invented&quot; data.
                                        </p>
                                        <p>
                                            <span className="font-medium text-slate-200">Empirical Traceability:</span> In qualitative research (ANT), you must &quot;trace&quot; connections in the text. By only analyzing documents you upload, we guarantee every insight has a provenance.
                                        </p>
                                        <p>
                                            <span className="font-medium text-slate-200">You are the Filter:</span> The AI refuses to &quot;fill in the blanks&quot; from the internet, ensuring all claims are grounded in your specific corpus.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-xs text-slate-500 max-w-[280px] mx-auto mb-4 leading-relaxed">
                            Automated web scraping and predictive modeling are excluded to preserve empirical traceability.
                            You must adhere researcher-curated text to trace mediations.
                        </p>
                    </div>
                )}

                {/* Extraction Button - Always visible */}
                <div className="px-2 pb-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExtractionDialogOpen(true)}
                        className="w-full bg-white hover:bg-slate-50 text-xs gap-2"
                    >
                        <FileText className="h-3 w-3 text-emerald-600" />
                        {actors.length === 0 ? 'Adhere Empirical Source' : 'Add More Actors'}
                    </Button>
                </div>

                <div className="flex-1 space-y-2">
                    {filteredActors.map(actor => (
                        <ActorCard
                            key={actor.id}
                            actor={actor}
                            isSelected={selectedActorId === actor.id}
                            isGroupSelected={selectedForGrouping.includes(actor.id)}
                            onSelect={() => onSelectActor(actor.id)}
                            onToggleGroupSelection={() => onToggleSelection(actor.id)}
                            configurations={configurations}
                            // [NEW]
                            isTraced={tracedActorId === actor.id}
                            onTrace={() => onTraceActor && onTraceActor(tracedActorId === actor.id ? null : actor.id)}
                        />
                    ))}
                </div>

                <div className="p-2 pt-4 border-t mt-auto">
                    <div className="flex justify-center">
                        <TheoreticalTensionsDialog />
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
