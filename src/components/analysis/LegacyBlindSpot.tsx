import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LegacyBlindSpotProps {
    text: string;
    index: number;
}

/**
 * Tier 0: Simple string rendering for legacy blind spots
 * Maintains backward compatibility with existing analyses
 */
export function LegacyBlindSpot({ text, index }: LegacyBlindSpotProps) {
    return (
        <div className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-100">
            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-700 leading-tight">{text}</span>
        </div>
    );
}
