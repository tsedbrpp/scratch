import React from 'react';
import { EcosystemActor } from '@/types/ecosystem';
import { ProvisionalBadge } from '@/components/ui/provisional-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, ExternalLink, Maximize2, Minimize2, X, FileText, Wand2, Globe, Search } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

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
    onClose
}: ActorListProps) {
    const { isReadOnly } = useDemoMode();

    return (
        <Card className="h-[500px] lg:h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Trace Provenance ({actors.length})</CardTitle>
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
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Extract Assemblage</DialogTitle>
                                    <DialogDescription>
                                        Paste text to trace actants and create a Super-Node configuration.
                                        This adheres to the &quot;Strategic Subtraction&quot; principle: only empirical traces are visualized.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Textarea
                                        placeholder="Paste text here (e.g., &apos;The CCP uses the SIFARE server to regulate pharmaceutical distribution...&apos;)"
                                        value={extractionText}
                                        onChange={(e) => setExtractionText(e.target.value)}
                                        className="min-h-[150px]"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={onExtract} disabled={isExtracting} className="bg-slate-900 text-white">
                                        {isExtracting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Adhering Source...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                Adhere Empirical Source
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>



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
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        placeholder="Search actors..."
                        className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-slate-50 text-slate-900"
                    />
                </div>

                {/* Explicit Actions Row */}
            </CardHeader>
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
                {actors.map(actor => (
                    <div
                        key={actor.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors relative ${selectedActorId === actor.id ? 'bg-indigo-50 border-indigo-200' :
                            actor.source === 'absence_fill' ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50' : 'bg-white hover:bg-slate-50'}`}
                        onClick={() => onSelectActor(actor.id)}
                    >
                        {actor.source === 'absence_fill' && (
                            <div className="absolute -top-1.5 -right-1.5">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-medium text-sm ${actor.source === 'absence_fill' ? 'text-amber-900 group-hover:text-amber-700' : ''}`}>
                                    {actor.name}
                                </span>
                                {(!actor.source || actor.source === 'default') && (
                                    <ProvisionalBadge
                                        className="h-4 px-1 text-[9px] border-indigo-200 bg-indigo-50 text-indigo-600"
                                        fragility={{ value: 0.4, interpretation: "provisional", factors: { input_completeness: 0.5, model_uncertainty: 0.3, theoretical_tension: 0.4, empirical_grounding: 0.8 } }}
                                    />
                                )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                {actor.source === 'absence_fill' && (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-5 border-amber-300 text-amber-600 bg-amber-100">
                                        Recovered
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                    {actor.type}
                                </Badge>
                                {actor.role_type && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-slate-100 text-slate-600 border border-slate-200">
                                        {actor.role_type}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{actor.description}</p>

                        {/* Trace Evidence Display */}
                        {actor.quotes && actor.quotes.length > 0 && (
                            <div className="mt-2 mb-2 bg-slate-50 p-2 rounded border border-slate-100">
                                <p className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider">
                                    <FileText className="h-3 w-3" /> Empirical Traces
                                </p>
                                <ul className="space-y-1">
                                    {actor.quotes.map((quote, idx) => (
                                        <li key={idx} className="text-[10px] text-slate-600 italic border-l-2 border-indigo-200 pl-2">
                                            &quot;{quote}&quot;
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {actor.url && (
                            <a
                                href={actor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="h-3 w-3" />
                                Visit Website
                            </a>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card >
    );
}
