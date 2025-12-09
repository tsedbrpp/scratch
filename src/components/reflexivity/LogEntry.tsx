import { MethodLog } from "@/types/logs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, CheckCircle, BrainCircuit, Scale, User, Bot } from "lucide-react";

const formatEnum = (value: string) => {
    return value.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

export function LogEntry({ log }: { log: MethodLog }) {
    const isConflictLog = !!log.details.discrepancy;
    const isPositionalityLog = log.action === "Positionality Calibration";

    return (
        <div className={`border-l-2 pl-4 py-3 space-y-2 transition-all ${isConflictLog ? 'border-amber-400 bg-amber-50/30 rounded-r-lg pr-2' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                </span>
                <Badge variant={isConflictLog ? "default" : "outline"} className={`text-xs ${isConflictLog ? 'bg-amber-600 hover:bg-amber-700' : ''}`}>
                    {log.action}
                </Badge>
            </div>

            {/* Positionality Statement */}
            {log.details.statement && (
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-sm text-slate-700 italic relative">
                    <User className="h-3 w-3 absolute top-3 left-2 text-slate-400" />
                    <div className="pl-4">"{log.details.statement}"</div>
                    {isPositionalityLog && (
                        <div className="mt-2 text-xs text-slate-500 flex gap-2">
                            <Badge variant="secondary" className="text-[10px]">Locus: {log.details.locus as string}</Badge>
                            <Badge variant="secondary" className="text-[10px]">Lens: {log.details.discipline as string}</Badge>
                        </div>
                    )}
                </div>
            )}

            {/* Rich Conflict Resolution Log */}
            {log.details.discrepancy && (
                <div className="mt-2 space-y-3">
                    <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-4 w-4 text-amber-600" />
                            <span className="font-semibold text-slate-800 text-xs uppercase tracking-wide">Interpretive Discrepancy</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>The AI detected a divergence between its analysis and your anchor. This log captures how you resolved it.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                <div className="flex items-center gap-1 mb-1">
                                    <Bot className="h-3 w-3 text-indigo-500" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">AI Proposition</span>
                                </div>
                                <span className="font-medium text-indigo-700 text-sm block">
                                    {formatEnum(log.details.discrepancy.systemProposition.placement)}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                    {log.details.discrepancy.systemProposition.evidence}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                <div className="flex items-center gap-1 mb-1">
                                    <User className="h-3 w-3 text-emerald-500" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Human Anchor</span>
                                </div>
                                <span className="font-medium text-emerald-700 text-sm block">
                                    {formatEnum(log.details.discrepancy.humanAnchor.placement)}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                    {log.details.discrepancy.humanAnchor.evidence}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-100 p-2 rounded text-xs">
                        <span className="font-semibold text-slate-600">Resolution:</span>
                        <div className="flex items-center gap-2">
                            <span className={log.details.resolution?.action === 'MANUAL_OVERRIDE' ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {formatEnum(log.details.resolution?.action || '')}
                            </span>
                            <span className="text-slate-500">→</span>
                            <span className="text-slate-800 font-medium">{formatEnum(log.details.resolution?.finalValue || '')}</span>
                        </div>
                    </div>

                    {log.details.justification && (
                        <div className="bg-red-50 p-3 rounded-md border border-red-100 text-red-900 text-xs">
                            <div className="flex items-center gap-2 mb-1 text-red-700 font-semibold">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Analyst Rationale</span>
                            </div>
                            <p className="italic pl-5">
                                "{typeof log.details.justification === 'string' ? log.details.justification : log.details.justification.rationale}"
                            </p>
                        </div>
                    )}

                    {log.details.reflexivity && (
                        <div className="bg-purple-50 p-3 rounded-md border border-purple-100 text-purple-900 text-xs">
                            <div className="flex items-center gap-2 mb-1 text-purple-700 font-semibold">
                                <BrainCircuit className="h-3 w-3" />
                                <span>System Reflexivity</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-purple-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p>How the system is updating its internal model based on this interaction.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <p className="pl-5">
                                {log.details.reflexivity.feedbackLoop}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Standard Validation Details (Legacy) */}
            {!log.details.discrepancy && log.details.agreement && (
                <div className="text-xs space-y-1 pl-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600">Agreement:</span>
                        <span className={log.details.agreement === 'yes' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                            {log.details.agreement.toUpperCase()}
                        </span>
                    </div>
                    {log.details.initial_impression && (
                        <p className="text-slate-600"><span className="font-semibold">Initial Impression:</span> {log.details.initial_impression}</p>
                    )}
                </div>
            )}
        </div>
    );
}
