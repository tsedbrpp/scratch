import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info } from "lucide-react";

interface VocabularyItem {
    term: string;
    order: string;
    level?: string;
}

interface MoralVocabularyMatrixProps {
    vocabulary: VocabularyItem[] | string[] | string;
}

export function MoralVocabularyMatrix({ vocabulary }: MoralVocabularyMatrixProps) {
    const [selectedCell, setSelectedCell] = useState<{ order: string; level: string; items: string[] } | null>(null);

    // 1. Normalize Data
    let items: VocabularyItem[] = [];
    if (Array.isArray(vocabulary)) {
        if (vocabulary.every(v => typeof v === 'string')) {
            // Legacy string array - mostly useless for matrix unless we AI-guess (too risky), 
            // so we'll dump them in a "Unclassified" bucket or handling them gracefully.
            // For now, let's treat them as "Unclassified / Meso" default
            items = (vocabulary as string[]).map(term => ({ term, order: "default", level: "meso" }));
        } else {
            items = vocabulary as VocabularyItem[];
        }
    } else if (typeof vocabulary === 'string') {
        items = vocabulary.split(',').map(s => ({ term: s.trim(), order: "default", level: "meso" }));
    }

    // 2. Aggregate Data for Heatmap
    const orders = ["market", "industrial", "civic", "domestic", "inspired", "fame"];
    const levels = ["micro", "meso", "macro"];

    const matrix: Record<string, Record<string, string[]>> = {};

    // Initialize
    orders.forEach(o => {
        matrix[o] = {};
        levels.forEach(l => matrix[o][l] = []);
    });

    // Populate
    let unclassifiedCount = 0;

    items.forEach(item => {
        const orderKey = item.order?.toLowerCase() || "default";
        const levelKey = item.level?.toLowerCase() || "meso";

        if (orders.includes(orderKey) && levels.includes(levelKey)) {
            matrix[orderKey][levelKey].push(item.term);
        } else if (orders.includes(orderKey)) {
            // Fallback level
            matrix[orderKey]["meso"].push(item.term);
        } else {
            unclassifiedCount++;
        }
    });

    // Color definitions (using Tailwind classes for base colors)
    const colorMap: Record<string, { bg: string, text: string, border: string, intense: string }> = {
        market: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-200", intense: "bg-purple-500" },
        industrial: { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-200", intense: "bg-slate-500" },
        civic: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-200", intense: "bg-emerald-500" },
        domestic: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-200", intense: "bg-amber-500" },
        inspired: { bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-200", intense: "bg-rose-500" },
        fame: { bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-200", intense: "bg-cyan-500" },
    };

    // Calculate max count for scaling (simple relative intensity)
    let maxCount = 0;
    Object.values(matrix).forEach(row => {
        Object.values(row).forEach(cell => {
            if (cell.length > maxCount) maxCount = cell.length;
        });
    });

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        Moral Vocabulary Matrix
                        <Dialog>
                            <DialogTrigger>
                                <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-slate-600" />
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>About the Moral Matrix</DialogTitle>
                                </DialogHeader>
                                <div className="text-sm text-slate-600 space-y-3">
                                    <p>This matrix visualizes the <strong>scale</strong> (Micro/Meso/Macro) relative to the <strong>Order of Worth</strong> (Moral Value System).</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>Macro</strong>: High-level values and ideals (e.g., "Liberty", "Efficiency").</li>
                                        <li><strong>Meso</strong>: Organizational structures and policies (e.g., "Protocols", "Audits").</li>
                                        <li><strong>Micro</strong>: Specific mechanisms and technical details (e.g., "Latency", "User Agent").</li>
                                    </ul>
                                    <p>A balanced justification typically spans all three levels. Gaps may indicate "High Rhetoric, Low Verification" (Macro-heavy) or "Technocratic Silence" (Micro-heavy).</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardTitle>
                    <div className="text-xs text-slate-500">
                        {items.length} terms analyzed
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-[120px_1fr_1fr_1fr] divide-y divide-slate-100">
                    {/* Header Row */}
                    <div className="bg-slate-50 text-xs font-semibold text-slate-500 p-3 flex items-center">
                        Order of Worth
                    </div>
                    {levels.map(level => (
                        <div key={level} className="bg-slate-50 text-xs font-semibold text-slate-500 p-3 text-center capitalize border-l border-slate-100 hidden md:block">
                            {level}
                        </div>
                    ))}

                    {/* Data Rows */}
                    {orders.map(order => {
                        const style = colorMap[order];
                        const rowTotal = levels.reduce((sum, l) => sum + matrix[order][l].length, 0);
                        const isDominant = rowTotal > 0 && (rowTotal / items.length) > 0.3; // Highlight if > 30% of terms

                        return (
                            <React.Fragment key={order}>
                                <div className={`p-3 text-sm font-medium flex items-center justify-between group relative ${style.bg} ${style.border} border-l-4`}>
                                    <span className={style.text + " capitalize"}>{order}</span>
                                    {isDominant && <Badge variant="secondary" className="text-[10px] bg-white/50 ml-2">Dominant</Badge>}
                                </div>
                                {levels.map(level => {
                                    const cellItems = matrix[order][level];
                                    const count = cellItems.length;
                                    const intensity = maxCount > 0 ? count / maxCount : 0;

                                    // Visualizing "Empty" vs "Occupied"
                                    const isEmpty = count === 0;

                                    return (
                                        <div
                                            key={`${order}-${level}`}
                                            className={`
                                                relative p-2 border-l border-slate-100 transition-all cursor-pointer hover:bg-slate-50
                                                ${isEmpty ? 'bg-white' : ''}
                                            `}
                                            onClick={() => count > 0 && setSelectedCell({ order, level, items: cellItems })}
                                        >
                                            {/* Heatmap Bar / Background */}
                                            {!isEmpty && (
                                                <div
                                                    className={`absolute bottom-0 left-0 h-1 ${style.intense} transition-all`}
                                                    style={{ width: `${Math.min(100, (count / maxCount) * 100)}%`, opacity: 0.6 }}
                                                />
                                            )}

                                            <div className="flex flex-col items-center justify-center h-full min-h-[40px]">
                                                {count > 0 ? (
                                                    <div className="text-center">
                                                        <span className={`text-lg font-bold ${style.text}`}>{count}</span>
                                                        <span className="text-[10px] text-slate-400 block -mt-1">{count === 1 ? 'term' : 'terms'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-200 text-xl">·</span>
                                                )}
                                            </div>

                                            {/* Hover tooltip for quick preview */}
                                            {count > 0 && (
                                                <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-white/95 flex items-center justify-center text-xs text-center p-1 pointer-events-none transition-opacity border border-slate-200 z-10 shadow-sm">
                                                    <span className="line-clamp-2">{cellItems.slice(0, 3).join(", ")}{cellItems.length > 3 && "..."}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </CardContent>

            {/* Drill-down Dialog */}
            <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="capitalize flex items-center gap-2">
                            {selectedCell?.order} Words
                            <Badge variant="outline" className="uppercase">{selectedCell?.level}</Badge>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 mt-4">
                        {selectedCell?.items.map((term, i) => (
                            <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded text-sm text-slate-700">
                                {term}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
