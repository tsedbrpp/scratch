import React from 'react';
import { Quote } from 'lucide-react';
import { Source } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CulturalFramingTableProps {
    dimension: string;
    sources: Source[];
}

// Mappings based on src/lib/prompts/cultural-framing.ts
const ASPECT_MAPS: Record<string, string[]> = {
    state_market_society: [
        "Role of the State",
        "Market Actors",
        "Civil Society / Communities",
        "Institutional Imaginaries",
        "The Imagined Subject"
    ],
    technology_role: [
        "Positioning",
        "Literacy & Access",
        "Agency & Control"
    ],
    rights_conception: [
        "Individual vs. Collective",
        "Procedural vs. Substantive",
        "Universality vs. Context",
        "Silenced Groups",
        "Enforcement Mechanisms"
    ],
    historical_context: [
        "Historical References",
        "Discursive Silences",
        "Universalism vs. Situatedness"
    ],
    epistemic_authority: [
        "Authority Holders",
        "Legitimacy Source",
        "Truth & Risk Assumptions",
        "Global Borrowing"
    ]
};



export function CulturalFramingTable({ dimension, sources }: CulturalFramingTableProps) {
    const aspects = ASPECT_MAPS[dimension] || ["Aspect 1", "Aspect 2", "Aspect 3", "Aspect 4", "Aspect 5"];

    // Pre-process rows: For each aspect index, gather data from all sources
    const rows = aspects.map((aspect, index) => {
        return {
            aspect,
            cells: sources.map(source => {
                const rawText = source.cultural_framing?.[dimension as keyof typeof source.cultural_framing] as string;
                if (!rawText) return { text: "N/A", quotes: [] };

                // Split bullets
                const bullets = rawText.split('•').map(p => p.trim()).filter(p => p.length > 0);

                // Get the bullet corresponding to this row index
                // Fallback to empty if not found (or last available if overflow? No, strict index is safer for comparison)
                const bullet = bullets[index] || "";

                return parseAnalysis(bullet);
            })
        };
    });

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-3 font-semibold text-slate-500 w-48 min-w-[150px]">Aspect</th>
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
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-3 font-medium text-slate-500 align-top bg-slate-50/30 group-hover:bg-slate-50">
                                    {row.aspect}
                                </td>
                                {row.cells.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="p-3 align-top text-slate-700 leading-relaxed">
                                        {cell.text === "N/A" || !cell.text ? (
                                            <span className="text-slate-400 italic text-xs">Not analyzed</span>
                                        ) : (
                                            <div className="space-y-2">
                                                <div>
                                                    {cell.text.split(/([“"][^”"]+[”"])/).map((part, i) => {
                                                        // Highlight quotes slightly
                                                        if (part.startsWith('“') || part.startsWith('"')) {
                                                            return <span key={i} className="text-indigo-700 font-medium">{part}</span>;
                                                        }
                                                        return <span key={i}>{part}</span>;
                                                    })}
                                                </div>
                                                {/* 
                                                // Optional: Deduplicated evidence list if needed, 
                                                // but inline highlighting (above) is often better for scannability.
                                                */}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper to extract evidence (quotes)
function parseAnalysis(text: string): { text: string; quotes: string[] } {
    if (!text) return { text: "", quotes: [] };

    const quotes: string[] = [];
    // Extract quotes with specific citations if possible, or just quotes
    // Regex for “...” (...) or "..." (...)
    const quoteRegex = /([“"][^”"]+[”"]\s*\(.*?\))/g;
    let match;
    while ((match = quoteRegex.exec(text)) !== null) {
        quotes.push(match[1]);
    }

    // Attempt to extract just the framing text by removing the quotes (rough cleanup)
    // For the table view, we arguably just want the whole text but maybe allow highlighting
    // For now, let's keep the full text as "Framing" but bold key parts logic if we reused TextParser logic.
    // Actually, simple is better: return full text, pass evidence separately for specific display if needed.

    return {
        text: text, // Return full text for now, can refine to strip quotes if it gets too long
        quotes
    };
}
