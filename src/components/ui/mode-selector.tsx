"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type AnalysisMode = "ant_trace" | "assemblage_realist" | "hybrid_reflexive";

interface ModeSelectorProps {
    value: AnalysisMode;
    onChange: (mode: AnalysisMode) => void;
    className?: string;
}

const MODES: Record<AnalysisMode, { label: string; desc: string; icon: string }> = {
    ant_trace: {
        label: "ANT Trace",
        icon: "🔍",
        desc: "Pure network mapping and association tracing (methodological)"
    },
    assemblage_realist: {
        label: "Assemblage Analysis",
        icon: "🏗️",
        desc: "Mechanisms, capacities, and explanatory depth (ontological)"
    },
    hybrid_reflexive: {
        label: "Hybrid (Reflexive)",
        icon: "🔄",
        desc: "Combined approach with explicit theoretical tensions"
    }
};

export function ModeSelector({ value, onChange, className }: ModeSelectorProps) {
    const selectedMode = MODES[value];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <label className="text-sm font-medium">Analysis Mode:</label>

            <TooltipProvider>
                <Select value={value} onValueChange={(val) => onChange(val as AnalysisMode)}>
                    <SelectTrigger className="w-[250px]">
                        {/* Manual Render for Trigger to ensure Tooltip works and styling is consistent */}
                        <div className="flex items-center gap-2 w-full">
                            <span>{selectedMode.icon} {selectedMode.label}</span>
                            <div
                                className="ml-auto"
                                onClick={(e) => e.stopPropagation()} // Prevent dropdown open on icon click if intended
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help p-0.5 rounded hover:bg-slate-200">
                                            <Info className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p className="max-w-xs text-xs">{selectedMode.desc}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(MODES).map(([key, mode]) => (
                            <SelectItem key={key} value={key as AnalysisMode}>
                                <div className="flex items-center gap-2 w-full justify-between">
                                    <span>{mode.icon} {mode.label}</span>
                                    {/* Tooltip in list item as well */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="ml-2 cursor-help">
                                                <Info className="h-3 w-3 text-slate-300 hover:text-slate-500" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p className="max-w-xs text-xs">{mode.desc}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TooltipProvider>
        </div>
    );
}
