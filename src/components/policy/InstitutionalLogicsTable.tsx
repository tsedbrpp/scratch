import React from 'react';
import { Source } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // Assuming we have this or can use a simple div
import { TextParser, extractKeyTakeaway } from "@/components/ui/TextParser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogicsVisualizer } from "./LogicsVisualizer";

interface InstitutionalLogicsTableProps {
    sources: Source[];
}

const LOGIC_TYPES = ["market", "state", "professional", "community"] as const;

// Helper to normalize conflict names (e.g. "state vs market" -> "market-state")
function normalizeConflictName(name: string): string {
    return name.toLowerCase()
        .replace(" and ", " vs ")
        .replace(" & ", " vs ")
        .split(" vs ")
        .map(s => s.trim())
        .sort()
        .join(" vs ");
}

export function InstitutionalLogicsTable({ sources }: InstitutionalLogicsTableProps) {
    // 1. Prepare Conflicts Data
    // we need to collect ALL unique conflict pairs from all sources
    const allConflictPairs = new Set<string>();
    sources.forEach(source => {
        source.institutional_logics?.logic_conflicts?.forEach(conflict => {
            if (conflict.between) {
                allConflictPairs.add(normalizeConflictName(conflict.between));
            }
        });
    });
    const sortedConflicts = Array.from(allConflictPairs).sort();

    return (
        <div className="space-y-8">
            <Tabs defaultValue="logics" className="w-full">
                <div className="flex justify-center mb-6">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="logics" className="px-6">Core Logics</TabsTrigger>
                        <TabsTrigger value="conflicts" className="px-6">Key Conflicts</TabsTrigger>
                    </TabsList>
                </div>

                {/* --- LOGICS VIEW --- */}
                <TabsContent value="logics" className="mt-0">
                    <LogicsVisualizer sources={sources} />
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-3 font-semibold text-slate-500 w-32 min-w-[120px]">Logic</th>
                                        {sources.map((source, i) => (
                                            <th key={i} className="p-3 font-semibold text-slate-900 min-w-[280px]">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${source.colorClass ? source.colorClass.replace('bg-', 'bg-').replace('border-', 'bg-') : 'bg-slate-400'}`} />
                                                    {source.title}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {LOGIC_TYPES.map((logicType) => (
                                        <tr key={logicType} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-3 font-medium text-slate-700 capitalize align-top bg-slate-50/30 group-hover:bg-slate-50 border-r border-slate-100">
                                                {logicType}
                                            </td>
                                            {sources.map((source, idx) => {
                                                // Access the specific logic object
                                                // Need to cast or access safely as key signature might differ slightly in types
                                                const logicData = source.institutional_logics?.logics?.[logicType as keyof typeof source.institutional_logics.logics];

                                                if (!logicData) {
                                                    return (
                                                        <td key={idx} className="p-3 align-top text-slate-400 italic text-xs">
                                                            Not detected
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={idx} className="p-3 align-top space-y-4">
                                                        {/* Strength Bar */}
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn("h-full rounded-full",
                                                                        logicType === 'market' ? "bg-purple-500" :
                                                                            logicType === 'state' ? "bg-blue-500" :
                                                                                logicType === 'community' ? "bg-emerald-500" :
                                                                                    "bg-amber-500" // professional
                                                                    )}
                                                                    style={{ width: `${(logicData.strength || 0) * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-600 w-8 text-right">
                                                                {((logicData.strength || 0) * 100).toFixed(0)}%
                                                            </span>
                                                        </div>

                                                        {/* Manifestations */}
                                                        <div className="space-y-4">
                                                            {logicData.manifestation_material && (
                                                                <div>
                                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Material</span>
                                                                    {(() => {
                                                                        const summary = extractKeyTakeaway(logicData.manifestation_material);
                                                                        return summary ? (
                                                                            <div className="font-semibold text-slate-800 text-xs mt-1 mb-1 bg-slate-50 p-1.5 rounded border border-slate-100 leading-snug">
                                                                                {summary}
                                                                            </div>
                                                                        ) : null;
                                                                    })()}
                                                                    <div className="text-slate-700 text-xs mt-1 leading-relaxed pl-1">
                                                                        <TextParser text={logicData.manifestation_material} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {logicData.manifestation_discursive && (
                                                                <div>
                                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Discursive</span>
                                                                    {(() => {
                                                                        const summary = extractKeyTakeaway(logicData.manifestation_discursive);
                                                                        return summary ? (
                                                                            <div className="font-semibold text-slate-800 text-xs mt-1 mb-1 bg-slate-50 p-1.5 rounded border border-slate-100 leading-snug">
                                                                                {summary}
                                                                            </div>
                                                                        ) : null;
                                                                    })()}
                                                                    <div className="text-slate-700 text-xs mt-1 leading-relaxed pl-1">
                                                                        <TextParser text={logicData.manifestation_discursive} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* --- CONFLICTS VIEW --- */}
                <TabsContent value="conflicts" className="mt-0">
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-3 font-semibold text-slate-500 w-40 min-w-[150px]">Conflict Pair</th>
                                        {sources.map((source, i) => (
                                            <th key={i} className="p-3 font-semibold text-slate-900 min-w-[280px]">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${source.colorClass ? source.colorClass.replace('bg-', 'bg-').replace('border-', 'bg-') : 'bg-slate-400'}`} />
                                                    {source.title}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sortedConflicts.length === 0 && (
                                        <tr>
                                            <td colSpan={sources.length + 1} className="p-8 text-center text-slate-400">
                                                No specific logic conflicts detected across these documents.
                                            </td>
                                        </tr>
                                    )}
                                    {sortedConflicts.map((pair) => (
                                        <tr key={pair} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-3 font-medium text-slate-700 align-top bg-slate-50/30 group-hover:bg-slate-50 border-r border-slate-100">
                                                <div className="capitalize">{pair}</div>
                                            </td>
                                            {sources.map((source, idx) => {
                                                // Find the conflict that matches this normalized pair
                                                const conflict = source.institutional_logics?.logic_conflicts?.find(c =>
                                                    c.between && normalizeConflictName(c.between) === pair
                                                );

                                                if (!conflict) {
                                                    return (
                                                        <td key={idx} className="p-3 align-top text-slate-300 text-xs">
                                                            -
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={idx} className="p-3 align-top space-y-3">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Site of Conflict</span>
                                                            <div className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                                                                <TextParser text={conflict.site_of_conflict || ""} />
                                                            </div>
                                                        </div>
                                                        {conflict.resolution_strategy && (
                                                            <div className="bg-amber-50 border border-amber-100 p-2 rounded">
                                                                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Resolution</span>
                                                                <div className="text-amber-900 text-xs mt-0.5 leading-relaxed">
                                                                    {conflict.resolution_strategy}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
