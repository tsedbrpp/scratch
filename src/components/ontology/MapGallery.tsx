import React from 'react';
import { OntologyData } from '@/types/ontology';
import { Source } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface MapGalleryProps {
    ontologyMaps: Record<string, OntologyData>;
    sources: Source[];
    selectedSourceId: string;
    onSelectSource: (sourceId: string) => void;
    isComparing: boolean;
    selectedForComparison: string[];
    onToggleComparisonSelection: (sourceId: string) => void;
    onCompare: () => void;
    isComparingLoading: boolean;
    isComparisonResultLoading: boolean;
}

export function MapGallery({
    ontologyMaps,
    sources,
    selectedSourceId,
    onSelectSource,
    isComparing,
    selectedForComparison,
    onToggleComparisonSelection,
    onCompare,
    isComparingLoading,
    isComparisonResultLoading
}: MapGalleryProps) {
    if (!ontologyMaps || Object.keys(ontologyMaps).length === 0) return null;

    return (
        <div className="space-y-4 mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">All Generated Maps</h3>
                {isComparing && (
                    <Button
                        onClick={onCompare}
                        disabled={selectedForComparison.length !== 2 || isComparingLoading || isComparisonResultLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isComparingLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Comparing...
                            </>
                        ) : (
                            <>
                                Compare Selected ({selectedForComparison.length})
                            </>
                        )}
                    </Button>
                )}
            </div>

            {isComparing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold">Comparison Mode Active</p>
                        <p>Select exactly two maps from the list below to compare their concepts and structures.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(ontologyMaps).map(([sourceId, mapData]) => {
                    const source = sources.find(s => s.id === sourceId);
                    if (!source) return null;

                    const isSelectedForComparison = selectedForComparison.includes(sourceId);
                    const isCurrentlyViewing = selectedSourceId === sourceId;

                    return (
                        <Card
                            key={sourceId}
                            className={`overflow-hidden transition-all ${isSelectedForComparison
                                ? 'ring-2 ring-indigo-500 shadow-md'
                                : isCurrentlyViewing && !isComparing
                                    ? 'ring-2 ring-indigo-200'
                                    : 'hover:shadow-md'
                                }`}
                            onClick={() => isComparing && onToggleComparisonSelection(sourceId)}
                        >
                            <CardHeader className="pb-2 bg-slate-50/50 flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold text-slate-900 truncate max-w-[200px]">
                                        {source.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {mapData.nodes.length} Concepts • {mapData.links.length} Links
                                    </CardDescription>
                                </div>
                                {isComparing && (
                                    <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${isSelectedForComparison ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                        {isSelectedForComparison && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 line-clamp-3 mb-4 h-12">
                                    {mapData.summary || "No summary available."}
                                </p>
                                {!isComparing && (
                                    <Button
                                        variant={isCurrentlyViewing ? "secondary" : "outline"}
                                        className="w-full text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectSource(sourceId);
                                        }}
                                    >
                                        {isCurrentlyViewing ? "Currently Viewing" : "View Map"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
