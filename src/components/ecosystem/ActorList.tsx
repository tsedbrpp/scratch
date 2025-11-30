import React from 'react';
import { EcosystemActor } from '@/types/ecosystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Globe, Plus, Search, Loader2, Trash2, ExternalLink, FileText, Wand2, Zap } from 'lucide-react';

interface ActorListProps {
    actors: EcosystemActor[];
    selectedActorId: string | null;
    onSelectActor: (id: string) => void;
    onClearAll: () => void;

    // Simulation Props
    isSimulating: boolean;
    simulationQuery: string;
    setSimulationQuery: (query: string) => void;
    onSimulate: () => void;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onClearCache: () => void;

    // Extraction Props
    isExtracting: boolean;
    extractionText: string;
    setExtractionText: (text: string) => void;
    onExtract: () => void;
    isExtractionDialogOpen: boolean;
    setIsExtractionDialogOpen: (open: boolean) => void;

    // Analysis Props
    isAnalyzingHoles: boolean;
    onAnalyze: () => void;
}

export function ActorList({
    actors,
    selectedActorId,
    onSelectActor,
    onClearAll,
    isSimulating,
    simulationQuery,
    setSimulationQuery,
    onSimulate,
    isDialogOpen,
    setIsDialogOpen,
    onClearCache,
    isExtracting,
    extractionText,
    setExtractionText,
    onExtract,
    isExtractionDialogOpen,
    setIsExtractionDialogOpen,
    isAnalyzingHoles,
    onAnalyze
}: ActorListProps) {
    return (
        <Card className="h-[500px] lg:h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Ecosystem Actors</CardTitle>
                    <div className="flex gap-1">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" title="Simulate Data">
                                    <Globe className="h-4 w-4 text-indigo-600" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Discover Actors</DialogTitle>
                                    <DialogDescription>
                                        Use web search to discover and import actors into the ecosystem.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="query" className="text-right">
                                            Search Query
                                        </Label>
                                        <Input
                                            id="query"
                                            value={simulationQuery}
                                            onChange={(e) => setSimulationQuery(e.target.value)}
                                            className="col-span-3 text-slate-900"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={onClearCache}>
                                        Clear Cache
                                    </Button>
                                    <Button onClick={onSimulate} disabled={isSimulating}>
                                        {isSimulating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Discovering...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Simulate
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isExtractionDialogOpen} onOpenChange={setIsExtractionDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" title="Extract from Text">
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Extract Assemblage</DialogTitle>
                                    <DialogDescription>
                                        Paste text to automatically extract actors and create a Super-Node configuration.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Textarea
                                        placeholder="Paste text here (e.g., 'The CCP uses the SIFARE server to regulate pharmaceutical distribution...')"
                                        value={extractionText}
                                        onChange={(e) => setExtractionText(e.target.value)}
                                        className="min-h-[150px]"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={onExtract} disabled={isExtracting}>
                                        {isExtracting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Extracting...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                Extract & Group
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Analyze Cultural Holes"
                            onClick={onAnalyze}
                            disabled={isAnalyzingHoles}
                        >
                            {isAnalyzingHoles ? (
                                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                            ) : (
                                <Zap className="h-4 w-4 text-amber-600" />
                            )}
                        </Button>

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
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        placeholder="Search actors..."
                        className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-slate-50 text-slate-900"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0">
                {actors.length === 0 && (
                    <div className="text-center p-6 text-slate-500 text-sm border-2 border-dashed border-slate-100 rounded-lg m-2">
                        <Globe className="h-8 w-8 mx-auto mb-2 text-indigo-200" />
                        <p>No actors found.</p>
                        <p className="mt-2 text-xs">Click the <Globe className="inline h-3 w-3 text-indigo-600" /> icon above to simulate ecosystem data.</p>
                    </div>
                )}
                {actors.map(actor => (
                    <div
                        key={actor.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedActorId === actor.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-slate-50'}`}
                        onClick={() => onSelectActor(actor.id)}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{actor.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                {actor.type}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{actor.description}</p>
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
        </Card>
    );
}
