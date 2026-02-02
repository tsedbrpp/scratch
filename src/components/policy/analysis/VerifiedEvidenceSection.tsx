import { AnalysisResult } from "@/types";
import { ShieldCheck, CheckCircle2, XCircle, Info, Copy, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { TextHighlightDialog } from "./TextHighlightDialog";

interface VerifiedEvidenceSectionProps {
    quotes: NonNullable<AnalysisResult['verified_quotes']>;
    fullText?: string;
    sourceTitle?: string;
}

export function VerifiedEvidenceSection({ quotes, fullText, sourceTitle }: VerifiedEvidenceSectionProps) {
    const verifiedCount = quotes.filter(q => q.verified).length;
    const score = Math.round((verifiedCount / quotes.length) * 100);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [highlightText, setHighlightText] = useState("");

    const handleLocate = (text: string) => {
        setHighlightText(text);
        setDialogOpen(true);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <TextHighlightDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                text={fullText || "No text content available."}
                highlightText={highlightText}
                sourceTitle={sourceTitle}
            />

            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className={`h-4 w-4 ${score === 100 ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Fact-Tracer</h4>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-help">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Grounding Score:</span>
                                    <Info className="h-3 w-3 text-slate-400" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-slate-800 z-50">
                                <p className="max-w-[200px] text-xs">
                                    Percentage of AI-cited quotes found verbatim in the source text.
                                    <br /><br />
                                    <strong>100%</strong> = All quotes verified.
                                    <br />
                                    <strong>&lt;100%</strong> = Some quotes may be paraphrased or hallucinatory.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${score === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {score}%
                    </span>
                </div>
            </div>
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                {quotes.map((q, i) => (
                    <div key={i} className={`group flex gap-3 p-3 rounded-lg border text-xs ${q.verified ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                        <div className="shrink-0 mt-0.5">
                            {q.verified ?
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> :
                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                            }
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                            <p className={`font-mono leading-relaxed text-[11px] break-words whitespace-pre-wrap ${q.verified ? 'text-emerald-900' : 'text-red-900'}`}>
                                &quot;{q.text}&quot;
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {!q.verified && (
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                                        Hallucination Warning: Text not found
                                    </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Source: {q.source || q.context || "AI Extracted"}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => navigator.clipboard.writeText(q.text)}
                                className="p-1 hover:bg-slate-100 rounded"
                                title="Copy Quote"
                            >
                                <Copy className="h-3 w-3 text-slate-400" />
                            </button>
                            {q.verified && fullText && (
                                <button
                                    onClick={() => handleLocate(q.text)}
                                    className="p-1 hover:bg-slate-100 rounded"
                                    title="Locate in Document"
                                >
                                    <Search className="h-3 w-3 text-indigo-500" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
