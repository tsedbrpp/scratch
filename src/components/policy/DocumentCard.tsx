import { Source, AnalysisResult } from "@/types";
import { AnalysisMode } from "@/services/analysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Globe, Loader2, Sparkles, Trash, Pencil, MoreVertical, PlayCircle, Eye, Search, Maximize2, Minimize2, Zap } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";

interface DocumentCardProps {
    source: Source;
    isAnalyzing: boolean;
    isSearching: boolean;
    isSelected?: boolean;
    onSelect?: (selected: boolean) => void;
    onAnalyze: (id: string, mode: AnalysisMode) => void;
    onDelete: (id: string) => void;
    onEdit: (source: Source) => void;
    onFindTraces: (source: Source) => void;
    onView: (source: Source) => void;
    onUpdateSource?: (id: string, updates: Partial<Source>) => void;
    isFocused?: boolean;
    onToggleFocus?: () => void;
    isReadOnly?: boolean;
}

export function DocumentCard({
    source,
    isAnalyzing,
    isSearching,
    isSelected = false,
    onSelect,
    onAnalyze,
    onDelete,
    onEdit,
    onFindTraces,
    onView,
    onUpdateSource,
    isFocused = false,
    onToggleFocus,
    isReadOnly = false
}: DocumentCardProps) {
    const hasAnalysis = !!source.analysis;

    return (
        <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md bg-indigo-50/10' : 'hover:shadow-md border-slate-200'}`}>
            <CardHeader className="flex flex-row items-start gap-4 p-4 pb-2">
                {/* Selection Checkbox */}
                {onSelect && (
                    <div className="pt-1">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(c) => onSelect(c === true)}
                            className="h-5 w-5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 border-slate-300"
                        />
                    </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold leading-tight line-clamp-2" title={source.title}>
                            {source.title}
                        </CardTitle>

                        {/* Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 -mr-2">
                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onView(source)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Text
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onFindTraces(source)}
                                    disabled={!source.extractedText || isReadOnly}
                                    title={isReadOnly ? "Trace generation disabled in Demo Mode" : ""}
                                >
                                    <Globe className="mr-2 h-4 w-4" /> Find Traces
                                </DropdownMenuItem>
                                {onToggleFocus && (
                                    <DropdownMenuItem onClick={onToggleFocus}>
                                        {isFocused ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                                        {isFocused ? 'Exit Focus' : 'Focus Mode'}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onEdit(source)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit Metadata
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(source.id)} className="text-red-600">
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <CardDescription className="text-xs line-clamp-1">{source.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="secondary" className={`${hasAnalysis ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} text-[10px] uppercase font-bold`}>
                        {hasAnalysis ? 'Analyzed' : 'Draft'}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                        {source.type} • {source.addedDate}
                    </span>
                    {source.jurisdiction && (
                        <>
                            <span className="text-[10px] text-slate-300">•</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {source.jurisdiction}
                            </Badge>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        size="sm"
                        variant={hasAnalysis ? "outline" : "default"}
                        className={`w-full text-xs h-8 ${!hasAnalysis && 'bg-indigo-600 hover:bg-indigo-700'}`}
                        onClick={() => onAnalyze(source.id, 'dsf')}
                        disabled={isAnalyzing || isReadOnly}
                        title={isReadOnly ? "Analysis disabled in Demo Mode" : ""}
                    >
                        {isAnalyzing ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                            <PlayCircle className="mr-2 h-3 w-3" />
                        )}
                        {hasAnalysis ? 'Re-Run Analysis' : 'Run Analysis'}
                    </Button>

                    {hasAnalysis && (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-full text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                            onClick={() => onAnalyze(source.id, 'stress_test')}
                            disabled={isAnalyzing || isReadOnly}
                            title={isReadOnly ? "Analysis disabled in Demo Mode" : ""}
                        >
                            <Zap className="mr-2 h-3 w-3" />
                            Run Stress Test
                        </Button>
                    )}
                </div>

                {/* Inline Analysis Results (if available) - simplified for card */}
                {source.analysis && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <AnalysisResults
                            analysis={source.analysis}
                            sourceTitle={source.title}
                            onUpdate={async (updates) => {
                                if (onUpdateSource && source.analysis) {
                                    await onUpdateSource(source.id, {
                                        analysis: { ...source.analysis, ...updates }
                                    });
                                }
                            }}
                        />
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
