import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText, Globe, Search } from 'lucide-react';

interface AssemblageExtractionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    // State
    isExtracting: boolean;
    extractionText: string;
    setExtractionText: (text: string) => void;
    discoveryQuery: string;
    setDiscoveryQuery: (query: string) => void;
    extractionMode: "text" | "discovery";
    setExtractionMode: (mode: "text" | "discovery") => void;

    // Actions
    onExtract: () => void;
}

export function AssemblageExtractionDialog({
    open,
    onOpenChange,
    isExtracting,
    extractionText,
    setExtractionText,
    discoveryQuery,
    setDiscoveryQuery,
    extractionMode,
    setExtractionMode,
    onExtract
}: AssemblageExtractionDialogProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Extract & Trace Assemblage</DialogTitle>
                    <DialogDescription>
                        Identify actors, agencies, and relationships to populate the ecosystem.
                    </DialogDescription>
                </DialogHeader>

                {/* Tabs for Mode Selection */}
                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-4 border-b border-slate-200">
                        <button
                            onClick={() => setExtractionMode("text")}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${extractionMode === 'text' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Adhere Text
                        </button>
                        <button
                            onClick={() => setExtractionMode("discovery")}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${extractionMode === 'discovery' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Discover Topic
                        </button>
                    </div>

                    {extractionMode === 'text' ? (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500">
                                Paste research text, policy documents, or field notes. Adheres to "Strategic Subtraction."
                            </p>
                            <Textarea
                                placeholder="Paste text here (e.g., 'The CCP uses the SIFARE server to regulate pharmaceutical distribution...')"
                                value={extractionText}
                                onChange={(e) => setExtractionText(e.target.value)}
                                className="min-h-[150px]"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500">
                                Automatically scan the web for relevant actors and forces related to a topic.
                            </p>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter topic (e.g., 'AI Regulation in Brazil')"
                                    value={discoveryQuery}
                                    onChange={(e) => setDiscoveryQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && discoveryQuery) onExtract();
                                    }}
                                />
                            </div>
                            <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-500 border border-slate-200">
                                <Globe className="h-3 w-3 inline mr-1 mb-0.5" />
                                Uses Google Search API to aggregate snippets and infer assemblage structure.
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onExtract} disabled={isExtracting || (extractionMode === 'text' ? !extractionText : !discoveryQuery)} className="bg-slate-900 text-white w-full sm:w-auto">
                        {isExtracting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {extractionMode === 'text' ? 'Tracing Text...' : 'Scanning Web...'}
                            </>
                        ) : (
                            <>
                                {extractionMode === 'text' ? <FileText className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
                                {extractionMode === 'text' ? 'Trace Actors' : 'Scan & Trace'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
