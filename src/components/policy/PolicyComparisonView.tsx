import { Source } from "@/types";
import { calculateMicroFascismRisk } from "@/lib/risk-calculator";
import { calculateLiberatoryCapacity } from "@/lib/liberatory-calculator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    AlertTriangle, Sprout, Scale, Sparkles, Gavel, ShieldAlert, EyeOff, Zap, History, Ban,
    RefreshCw, Hand, HeartHandshake, Feather, MessageSquare, Info
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PolicyComparisonViewProps {
    sources: Source[];
}

export function PolicyComparisonView({ sources }: PolicyComparisonViewProps) {
    if (!sources || sources.length === 0) {
        return (
            <div className="text-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500">
                <Scale className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Policies Selected</h3>
                <p>Select documents from the "My Documents" tab to compare them here.</p>
            </div>
        );
    }

    const comparisons = sources.map(source => {
        const risk = source.analysis ? calculateMicroFascismRisk(source.analysis) : null;
        const liberty = source.analysis ? calculateLiberatoryCapacity(source.analysis) : null;
        return {
            source,
            risk,
            liberty,
            anchor: source.analysis?.anchor_bias_choice || 'N/A',
            insight: source.analysis?.key_insight || 'No analysis available.'
        };
    });

    // --- Helpers for Color Coding ---
    const getRiskBg = (score: number) => {
        if (score >= 5) return "bg-red-50 border-red-200 text-red-900";
        if (score >= 3) return "bg-amber-50 border-amber-200 text-amber-900";
        return "bg-emerald-50 border-emerald-200 text-emerald-900";
    };

    const getLibertyBg = (score: number) => {
        if (score >= 6) return "bg-emerald-50 border-emerald-200 text-emerald-900";
        if (score >= 3) return "bg-amber-50 border-amber-200 text-amber-900";
        return "bg-slate-50 border-slate-200 text-slate-700";
    };

    // --- Dimension Definitions ---
    const riskDimensions = [
        { key: "power_hardening", label: "Power Hardening", icon: Gavel },
        { key: "agency_collapse", label: "Agency Collapse", icon: ShieldAlert },
        { key: "epistemic_narrowing", label: "Epistemic Narrowing", icon: EyeOff },
        { key: "structural_violence", label: "Structural Violence", icon: Zap },
        { key: "temporal_closure", label: "Temporal Closure", icon: History },
        { key: "absence_as_control", label: "Absence as Control", icon: Ban },
    ] as const;

    const libertyDimensions = [
        { key: "power_reversibility", label: "Power Reversibility", icon: RefreshCw },
        { key: "agency_protection", label: "Situated Agency", icon: Hand },
        { key: "epistemic_plurality", label: "Epistemic Plurality", icon: Sparkles },
        { key: "exit_rights", label: "Exit/Refusal Rights", icon: Scale },
        { key: "repair_recognition", label: "Repair & Care", icon: HeartHandshake },
        { key: "temporal_openness", label: "Temporal Openness", icon: History },
        { key: "proportionality", label: "Proportionality", icon: Feather },
        { key: "contestable_safety", label: "Contestable Safety", icon: MessageSquare },
    ] as const;

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Scale className="h-5 w-5 text-indigo-600" />
                    Comparative Diagnostic Matrix
                </CardTitle>
                <CardDescription>
                    Flattened matrix view for rapid cross-policy signal analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="min-w-max">
                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-50 shadow-sm">
                                <TableRow className="hover:bg-slate-50">
                                    <TableHead className="w-[220px] min-w-[220px] bg-slate-50 text-slate-700 font-bold sticky left-0 z-50 border-r border-slate-200 pl-6 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        Diagnostic Criteria
                                    </TableHead>
                                    {comparisons.map((c) => (
                                        <TableHead key={c.source.id} className="min-w-[120px] max-w-[120px] align-top py-4 border-l border-slate-100 text-left">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className="text-sm font-bold text-slate-900 leading-tight line-clamp-3" title={c.source.title}>
                                                    {c.source.title}
                                                </span>
                                                <Badge variant="outline" className={`w-fit text-[10px] border-0 px-1.5 py-0 ${c.source.colorClass}`}>
                                                    {c.source.type}
                                                </Badge>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* --- High Level Scores --- */}
                                <TableRow className="bg-slate-50/30">
                                    <TableCell className="font-semibold text-slate-600 sticky left-0 z-40 bg-slate-50/95 backdrop-blur border-r border-slate-200 pl-6">
                                        <div className="flex items-center gap-2">
                                            Overall Risk Index
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Info className="h-4 w-4 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" />
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-4 shadow-xl border-indigo-100" side="right" align="start">
                                                    <div className="space-y-3">
                                                        <div className="border-b border-indigo-100 pb-2 mb-2">
                                                            <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                                                                <Gavel className="h-4 w-4" />
                                                                Risk Calculation Logic
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-1">Sum of 6 weighted micro-fascism signals (0-6 scale).</p>
                                                        </div>
                                                        <ul className="space-y-2 text-sm text-slate-600">
                                                            <li className="flex items-start gap-2">
                                                                <span className="font-bold text-xs uppercase bg-red-50 text-red-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Power</span>
                                                                <span>Centralization &gt; 75% or rigid procedure.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="font-bold text-xs uppercase bg-red-50 text-red-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Agency</span>
                                                                <span>Rights Focus &lt; 35% (collapse).</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="font-bold text-xs uppercase bg-red-50 text-red-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Truth</span>
                                                                <span>Coloniality &gt; 60% or high silence.</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </TableCell>
                                    {comparisons.map((c) => (
                                        <TableHead key={c.source.id} className="border-l border-slate-100 p-2 text-left">
                                            {c.risk ? (
                                                <div className={cn("rounded-md p-2 border mr-auto w-fit text-center", getRiskBg(c.risk.score))}>
                                                    <div className="text-2xl font-black leading-none mb-1">
                                                        {c.risk.score}<span className="text-xs opacity-60 font-medium">/6</span>
                                                    </div>
                                                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">{c.risk.level}</div>
                                                </div>
                                            ) : <span className="text-slate-300 text-xs">-</span>}
                                        </TableHead>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-slate-50/30">
                                    <TableCell className="font-semibold text-slate-600 sticky left-0 z-40 bg-slate-50/95 backdrop-blur border-r border-slate-200 pl-6">
                                        <div className="flex items-center gap-2">
                                            Liberatory Potential
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Info className="h-4 w-4 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer" />
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-4 shadow-xl border-emerald-100" side="right" align="start">
                                                    <div className="space-y-3">
                                                        <div className="border-b border-emerald-100 pb-2 mb-2">
                                                            <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                                                                <Sprout className="h-4 w-4" />
                                                                Liberatory Logic
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-1">Sum of 8 capacity signals based on governance metrics (0-8 scale).</p>
                                                        </div>
                                                        <ul className="space-y-2 text-sm text-slate-600">
                                                            <li className="flex items-start gap-2">
                                                                <span className="font-bold text-xs uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Revokes</span>
                                                                <span>Centralization &lt; 40% (reversible).</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="font-bold text-xs uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Codesign</span>
                                                                <span>Rights Focus &gt; 65% or explicit codesign.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="font-bold text-xs uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Refusal</span>
                                                                <span>Explicit exit rights or opt-out.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="font-bold text-xs uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded shrink-0 mt-0.5">Repair</span>
                                                                <span>Verification of maintenance/care labor.</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </TableCell>
                                    {comparisons.map((c) => (
                                        <TableHead key={c.source.id} className="border-l border-slate-100 p-2 text-left">
                                            {c.liberty ? (
                                                <div className={cn("rounded-md p-2 border mr-auto w-fit text-center", getLibertyBg(c.liberty.score))}>
                                                    <div className="text-2xl font-black leading-none mb-1">
                                                        {c.liberty.score}<span className="text-xs opacity-60 font-medium">/8</span>
                                                    </div>
                                                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">{c.liberty.level}</div>
                                                </div>
                                            ) : <span className="text-slate-300 text-xs">-</span>}
                                        </TableHead>
                                    ))}
                                </TableRow>



                                {/* --- Section: Risk Signals --- */}
                                <TableRow className="bg-slate-100/50 hover:bg-slate-100/50">
                                    <TableCell colSpan={comparisons.length + 1} className="py-2 pl-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        Micro-Fascism Signals
                                    </TableCell>
                                </TableRow>

                                {riskDimensions.map((dim) => (
                                    <TableRow key={dim.key} className="hover:bg-slate-50/50 group">
                                        <TableCell className="text-sm font-medium text-slate-700 sticky left-0 z-40 bg-white group-hover:bg-slate-50/50 border-r border-slate-200 pl-6 align-top py-3">
                                            <div className="flex items-center gap-2">
                                                <dim.icon className="h-4 w-4 text-slate-400" />
                                                {dim.label}
                                            </div>
                                        </TableCell>
                                        {comparisons.map((c) => {
                                            const triggered = c.risk?.flags[dim.key as keyof typeof c.risk.flags];
                                            const explanation = c.risk?.explanations[dim.key.split('_')[0] as keyof typeof c.risk.explanations];

                                            return (
                                                <TableCell key={c.source.id} className={cn(
                                                    "border-l border-slate-100 p-3 align-top transition-colors text-xs leading-relaxed text-left",
                                                    triggered ? "bg-red-50/30" : ""
                                                )}>
                                                    {triggered ? (
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <div className="flex items-center gap-1.5 text-red-700 font-bold uppercase text-[10px]">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Detected
                                                            </div>
                                                            <span className="text-slate-800">{explanation}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 italic text-[10px]">Not detected</span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}

                                {/* --- Section: Liberatory Signals --- */}
                                <TableRow className="bg-slate-100/50 hover:bg-slate-100/50">
                                    <TableCell colSpan={comparisons.length + 1} className="py-2 pl-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        Liberatory Capacity
                                    </TableCell>
                                </TableRow>

                                {libertyDimensions.map((dim) => (
                                    <TableRow key={dim.key} className="hover:bg-slate-50/50 group">
                                        <TableCell className="text-sm font-medium text-slate-700 sticky left-0 z-40 bg-white group-hover:bg-slate-50/50 border-r border-slate-200 pl-6 align-top py-3">
                                            <div className="flex items-center gap-2">
                                                <dim.icon className="h-4 w-4 text-slate-400" />
                                                {dim.label}
                                            </div>
                                        </TableCell>
                                        {comparisons.map((c) => {
                                            const triggered = c.liberty?.signals[dim.key as keyof typeof c.liberty.signals];
                                            const explanationKey = dim.key === 'proportionality' || dim.key === 'contestable_safety'
                                                ? dim.key.split('_')[1] // 'safety' for contestable_safety? No wait, check mapping.
                                                : dim.key.split('_')[0];

                                            // Manual fix for key mapping if needed, or rely on consistent naming.
                                            // Let's check LiberatoryCapacityCard mapping:
                                            // agency_protection -> capacity.explanations.agency
                                            // exit_rights -> capacity.explanations.exit
                                            // contestable_safety -> capacity.explanations.safety

                                            let explanation = "";
                                            if (c.liberty) {
                                                if (dim.key === 'agency_protection') explanation = c.liberty.explanations.agency;
                                                else if (dim.key === 'exit_rights') explanation = c.liberty.explanations.exit;
                                                else if (dim.key === 'repair_recognition') explanation = c.liberty.explanations.repair;
                                                else if (dim.key === 'contestable_safety') explanation = c.liberty.explanations.safety;
                                                else if (dim.key === 'proportionality') explanation = c.liberty.explanations.proportionality || '';
                                                else explanation = (c.liberty.explanations as any)[dim.key.split('_')[0]];
                                            }

                                            return (
                                                <TableCell key={c.source.id} className={cn(
                                                    "border-l border-slate-100 p-3 align-top transition-colors text-xs leading-relaxed text-left",
                                                    triggered ? "bg-emerald-50/30" : ""
                                                )}>
                                                    {triggered ? (
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase text-[10px]">
                                                                <Sprout className="h-3 w-3" />
                                                                Active
                                                            </div>
                                                            <span className="text-slate-800">{explanation}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 italic text-[10px]">Criterion not met</span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
