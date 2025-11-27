import { Source, AnalysisResult } from "@/types";
import { AnalysisMode } from "@/services/analysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Globe, Loader2, Sparkles, Trash, Globe2, Scale, Pencil } from "lucide-react";
import { AnalysisResults } from "./AnalysisResults";

interface DocumentCardProps {
    source: Source;
    isAnalyzing: boolean;
    isSearching: boolean;
    onAnalyze: (id: string, mode: AnalysisMode) => void;
    onDelete: (id: string) => void;
    onEdit: (source: Source) => void;
    onFindTraces: (source: Source) => void;
    onView: (source: Source) => void;
}

export function DocumentCard({
    source,
    isAnalyzing,
    isSearching,
    onAnalyze,
    onDelete,
    onEdit,
    onFindTraces,
    onView
}: DocumentCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col md:flex-row items-start justify-between space-y-4 md:space-y-0 pb-2">
                <div className="space-y-1 flex-1 min-w-0 pr-0 md:pr-4 w-full">
                    <CardTitle className="text-base font-semibold break-words">{source.title}</CardTitle>
                    <CardDescription className="break-words">{source.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end md:justify-start">
                    <div
                        className={`rounded-full p-2 ${source.colorClass} cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => onView(source)}
                        title="Click to view extracted text"
                    >
                        <FileText className={`h-4 w-4 ${source.iconClass}`} />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFindTraces(source)}
                        disabled={isSearching || !source.extractedText}
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30"
                        title={source.extractedText ? "Find empirical traces using Google Search" : "Upload a PDF or add text first to enable trace search"}
                    >
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Globe className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(source.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-4 flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                        {source.status}
                    </Badge>
                    <span className="text-xs text-slate-500">
                        {source.type} {source.pageCount ? `• ${source.pageCount} pages` : ''}
                    </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    <div>Added: {source.addedDate}</div>
                    {source.publicationDate && (
                        <>
                            <div>•</div>
                            <div>Published: {source.publicationDate}</div>
                        </>
                    )}
                    {source.version && (
                        <>
                            <div>•</div>
                            <div>v{source.version}</div>
                        </>
                    )}
                    {source.jurisdiction && (
                        <>
                            <div>•</div>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {source.jurisdiction}
                            </Badge>
                        </>
                    )}
                </div>
                <div className="mt-4 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(source)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
                {source.extractedText && (
                    <div className="mt-4 space-y-2">
                        <Button
                            onClick={() => onAnalyze(source.id, 'dsf')}
                            disabled={isAnalyzing}
                            className="w-full bg-purple-600 text-white hover:bg-purple-700"
                            size="sm"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {source.analysis ? 'Re-analyze with AI' : 'Analyze with AI'}
                                </>
                            )}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => onAnalyze(source.id, 'cultural_framing')}
                                disabled={isAnalyzing}
                                variant="outline"
                                size="sm"
                                className="text-xs border-purple-200 hover:bg-purple-50"
                                title="Analyze cultural framing for CFP"
                            >
                                <Globe2 className="mr-1 h-3 w-3" />
                                Cultural
                            </Button>
                            <Button
                                onClick={() => onAnalyze(source.id, 'institutional_logics')}
                                disabled={isAnalyzing}
                                variant="outline"
                                size="sm"
                                className="text-xs border-purple-200 hover:bg-purple-50"
                                title="Analyze institutional logics for CFP"
                            >
                                <Scale className="mr-1 h-3 w-3" />
                                Logics
                            </Button>
                        </div>
                    </div>
                )}
                {source.analysis && <AnalysisResults analysis={source.analysis} />}
            </CardContent>
        </Card>
    );
}
