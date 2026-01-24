"use client";

import { ConfidenceScore } from "@/types/provenance";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ConfidenceBadgeProps {
    confidence?: ConfidenceScore;
    className?: string;
}

/**
 * Displays an AI confidence score with color-coded badge and justification tooltip
 * 
 * Color scheme:
 * - Green (>80%): High confidence
 * - Yellow (60-80%): Moderate confidence
 * - Red (<60%): Low confidence
 */
export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
    if (!confidence) {
        return null;
    }

    const { score, justification } = confidence;

    // Determine color based on score
    const getColorClass = () => {
        if (score >= 80) return "bg-green-100 text-green-800 border-green-300";
        if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300";
        return "bg-red-100 text-red-800 border-red-300";
    };

    const getLabel = () => {
        if (score >= 80) return "High";
        if (score >= 60) return "Moderate";
        return "Low";
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className={`${getColorClass()} ${className} cursor-help flex items-center gap-1`}
                    >
                        <Info className="h-3 w-3" />
                        {getLabel()} Confidence ({score}%)
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                    <div className="space-y-1">
                        <p className="font-semibold text-xs">AI Confidence Justification:</p>
                        <p className="text-xs text-slate-600">{justification}</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
