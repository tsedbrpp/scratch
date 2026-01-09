"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FragilityScore } from '@/types/provisional';

interface ProvisionalBadgeProps {
    fragility?: FragilityScore;
    className?: string;
}

export function ProvisionalBadge({ fragility, className }: ProvisionalBadgeProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={`flex items-center gap-1 border-yellow-500/50 text-yellow-600 bg-yellow-500/10 ${className}`}>
                        <AlertTriangle className="h-3 w-3" />
                        Provisional
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <p className="font-semibold">AI-generated interpretation</p>
                        <p className="text-xs">Subject to contestation and revision</p>
                        {fragility && (
                            <p className="text-xs mt-2 border-t pt-1">
                                Fragility: {(fragility.value * 100).toFixed(0)}% ({fragility.interpretation})
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface FragilityIndicatorProps {
    score: FragilityScore;
    className?: string;
}

export function FragilityIndicator({ score, className }: FragilityIndicatorProps) {
    const getColor = () => {
        if (score.value > 0.7) return 'bg-red-500';
        if (score.value > 0.5) return 'bg-orange-500';
        if (score.value > 0.3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`flex items-center gap-2 cursor-help ${className}`}>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">Fragility:</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 w-3 rounded-full ${i <= (score.value * 5) ? getColor() : 'bg-muted'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground capitalize">
                                ({score.interpretation})
                            </span>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1 text-xs p-1">
                        <p className="font-semibold mb-2">Fragility Factors:</p>
                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
                            <span>Input completeness:</span>
                            <span className="font-mono">{(score.factors.input_completeness * 100).toFixed(0)}%</span>

                            <span>Model uncertainty:</span>
                            <span className="font-mono">{(score.factors.model_uncertainty * 100).toFixed(0)}%</span>

                            <span>Theoretical tension:</span>
                            <span className="font-mono">{(score.factors.theoretical_tension * 100).toFixed(0)}%</span>

                            <span>Empirical grounding:</span>
                            <span className="font-mono">{(score.factors.empirical_grounding * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
