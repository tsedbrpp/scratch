import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface Metric {
    jurisdiction: string;
    territorialization: number;
    territorialization_justification: string;
    coding: number;
    coding_justification: string;
}

interface AssemblageGaugesProps {
    metrics?: Metric[];
}

const Dial = ({ value, label, color, description, comparisonValues = [] }: { value: number, label: string, color: string, description: string, comparisonValues?: number[] }) => {
    // Convert 0-100 to Angle (-90 to 90 degrees)
    const angle = (val: number) => (val / 100) * 180 - 90;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-36 h-20 overflow-hidden mb-2 group cursor-help transition-all hover:scale-105">
                {/* Gauge Background */}
                <div className="absolute bottom-0 w-36 h-36 rounded-full border-[14px] border-slate-100 border-t-transparent border-l-transparent border-r-transparent transform rotate-45" />

                {/* Ghost Needles (Comparison) */}
                {comparisonValues.map((val, idx) => (
                    <div
                        key={`ghost-${idx}`}
                        className="absolute bottom-0 left-1/2 w-0.5 h-28 bg-slate-300 origin-bottom rounded-full z-0 opacity-60"
                        style={{ transform: `translateX(-50%) rotate(${angle(val)}deg)` }}
                    />
                ))}

                {/* Limit markers (optional visual flair for 0 and 100) */}
                <div className="absolute bottom-1 left-2 w-1 h-3 bg-slate-200 rotate-[-90deg]"></div>
                <div className="absolute bottom-1 right-2 w-1 h-3 bg-slate-200 rotate-[90deg]"></div>

                {/* Primary Needle */}
                <div
                    className={`absolute bottom-0 left-1/2 w-1.5 h-28 ${color.replace('text-', 'bg-')} origin-bottom rounded-full transition-transform duration-1000 ease-out z-10 shadow-sm`}
                    style={{ transform: `translateX(-50%) rotate(${angle(value)}deg)` }}
                />

                {/* Pivot */}
                <div className="absolute bottom-0 left-1/2 w-5 h-5 bg-slate-800 rounded-full transform -translate-x-1/2 translate-y-1/2 z-20 border-2 border-white shadow-md" />

                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0 right-0 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg text-center z-50 pointer-events-none mt-4 mx-2">
                    {description}
                    {comparisonValues.length > 0 && <div className="mt-1 text-slate-400 border-t border-slate-700 pt-1 font-mono text-[9px]">Others: {comparisonValues.join(', ')}</div>}
                </div>
            </div>

            <div className="text-center mt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
                <div className={`text-2xl font-black ${color} tabular-nums leading-none`}>{value}</div>
            </div>
        </div>
    );
};

const GaugePanel = ({ metric, allMetrics }: { metric: Metric, allMetrics: Metric[] }) => {
    // Get comparison values for this specific gauge type, excluding self
    const otherTerritorialization = allMetrics
        .filter(m => m.jurisdiction !== metric.jurisdiction)
        .map(m => m.territorialization);

    const otherCoding = allMetrics
        .filter(m => m.jurisdiction !== metric.jurisdiction)
        .map(m => m.coding);

    return (
        <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="text-center mb-6 border-b border-slate-100 pb-3">
                    <Badge variant="outline" className="bg-white text-slate-900 border-slate-300 font-bold px-4 py-1.5 shadow-sm text-sm">
                        {metric.jurisdiction.toUpperCase()}
                    </Badge>
                </div>

                <div className="flex justify-around items-end gap-2 mb-8">
                    <Dial
                        value={metric.territorialization}
                        label="Territorialization"
                        color="text-red-600"
                        description={metric.territorialization_justification}
                        comparisonValues={otherTerritorialization}
                    />
                    <Dial
                        value={metric.coding}
                        label="Coding"
                        color="text-indigo-600"
                        description={metric.coding_justification}
                        comparisonValues={otherCoding}
                    />
                </div>

                {/* AI Rationale Display */}
                <div className="bg-slate-50/50 rounded-lg p-3 text-xs text-slate-600 border border-slate-100/80">
                    <div className="font-semibold text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-widest text-[9px]">
                        AI Rationale
                    </div>
                    <div className="space-y-3">
                        <div className="relative pl-3 border-l-2 border-red-100">
                            <span className="block font-bold text-red-900 mb-0.5 text-[10px] uppercase">Territorialization</span>
                            <span className="italic leading-snug">"{metric.territorialization_justification || 'No data'}"</span>
                        </div>
                        <div className="relative pl-3 border-l-2 border-indigo-100">
                            <span className="block font-bold text-indigo-900 mb-0.5 text-[10px] uppercase">Coding</span>
                            <span className="italic leading-snug">"{metric.coding_justification || 'No data'}"</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export function AssemblageGauges({ metrics }: AssemblageGaugesProps) {
    if (!metrics || metrics.length === 0) {
        return (
            <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">No assemblage metrics available. Run a new synthesis to generate gauge data.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {metrics.map((metric, idx) => (
                <GaugePanel key={idx} metric={metric} allMetrics={metrics} />
            ))}
        </div>
    );
}
