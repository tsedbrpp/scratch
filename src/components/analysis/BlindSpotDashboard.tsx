"use client";

import React, { useState } from 'react';
import { AnalysisResult } from '@/types';
import { BlindSpotRenderer } from './BlindSpotRenderer';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import {
    calculateEpistemicCoverageScore,
    groupBlindSpotsBySeverity,
    sortBlindSpotsBySeverity,
    detectOverallTier
} from '@/utils/blindSpotHelpers';

interface BlindSpotDashboardProps {
    critique: NonNullable<AnalysisResult['system_critique']>;
    onReAnalyze?: (spotId: string) => void;
    onMarkAddressed?: (spotId: string) => void;
}

/**
 * Dashboard for epistemic blind spots with progressive disclosure
 * Default: Compact summary with coverage score
 * Opt-in: Detailed breakdown with all blind spots
 */
export function BlindSpotDashboard({ critique, onReAnalyze, onMarkAddressed }: BlindSpotDashboardProps) {
    const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

    const blindSpots = critique.blind_spots || [];
    const coverageScore = critique.epistemic_coverage_score || calculateEpistemicCoverageScore(blindSpots);
    const tier = critique.detection_tier || detectOverallTier(blindSpots);
    const { high, medium, low } = groupBlindSpotsBySeverity(blindSpots);

    // Coverage interpretation
    const getCoverageStatus = (score: number) => {
        if (score >= 80) return { label: 'Excellent', color: 'emerald', icon: CheckCircle };
        if (score >= 60) return { label: 'Good', color: 'blue', icon: Info };
        if (score >= 40) return { label: 'Fair', color: 'amber', icon: AlertTriangle };
        return { label: 'Needs Attention', color: 'red', icon: AlertTriangle };
    };

    const status = getCoverageStatus(coverageScore);
    const StatusIcon = status.icon;

    return (
        <div className="space-y-4">
            {/* Summary Card (Always Visible) */}
            <div className={`p-4 rounded-lg border-2 bg-gradient-to-br ${status.color === 'emerald' ? 'from-emerald-50 to-green-50 border-emerald-200' :
                status.color === 'blue' ? 'from-blue-50 to-indigo-50 border-blue-200' :
                    status.color === 'amber' ? 'from-amber-50 to-orange-50 border-amber-200' :
                        'from-red-50 to-rose-50 border-red-200'
                }`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 text-${status.color}-600`} />
                        <h3 className="text-sm font-bold text-slate-900">Epistemic Awareness</h3>
                    </div>
                    <Badge
                        variant="outline"
                        className={`bg-white border-${status.color}-300 text-${status.color}-700 font-bold`}
                    >
                        Coverage: {coverageScore}%
                    </Badge>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {high.length > 0
                        ? `${high.length} high-priority blind spot${high.length > 1 ? 's' : ''} detected. Review to strengthen analysis.`
                        : blindSpots.length > 0
                            ? `${blindSpots.length} potential gap${blindSpots.length > 1 ? 's' : ''} identified. Analysis shows ${status.label.toLowerCase()} reflexive awareness.`
                            : 'No major blind spots detected. However, all analyses are provisional—consider alternative lenses.'
                    }
                </p>

                {/* Quick Stats */}
                {blindSpots.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        <StatBadge label="Total" value={blindSpots.length} color="slate" />
                        <StatBadge label="High" value={high.length} color="red" />
                        <StatBadge label="Medium" value={medium.length} color="amber" />
                        <StatBadge label="Low" value={low.length} color="slate" />
                    </div>
                )}

                {/* Tier Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Detection Quality:</span>
                        <Badge variant="outline" className="text-xs">
                            Tier {tier} {tier === 0 ? '(Legacy)' : tier === 1 ? '(Basic)' : tier === 2 ? '(Enhanced)' : '(Interactive)'}
                        </Badge>
                    </div>

                    {blindSpots.length > 0 && (
                        <button
                            onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}
                            aria-expanded={viewMode === 'detailed'}
                            aria-label={viewMode === 'summary' ? "Show detailed blind spot breakdown" : "Collapse to summary view"}
                            className="text-xs text-amber-700 hover:text-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1 font-medium transition-all"
                        >
                            {viewMode === 'summary' ? 'View Detailed Breakdown →' : '← Collapse to Summary'}
                        </button>
                    )}
                </div>
            </div>

            {/* Dynamic Content Area (Detailed View or Zero State) */}
            <div aria-live="polite" className="transition-all duration-300">
                {viewMode === 'detailed' && blindSpots.length > 0 ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                All Blind Spots ({blindSpots.length})
                            </h4>
                            <span className="text-xs text-slate-500">
                                Sorted by severity (high → low)
                            </span>
                        </div>

                        {/* High-Severity (Always Expanded) */}
                        {high.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-4 bg-red-500 rounded" />
                                    <span className="text-xs font-bold text-red-700 uppercase">
                                        High Priority ({high.length})
                                    </span>
                                </div>
                                {high.map((spot, i) => (
                                    <BlindSpotRenderer
                                        key={i}
                                        spot={spot}
                                        index={i}
                                        onReAnalyze={onReAnalyze}
                                        onMarkAddressed={onMarkAddressed}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Medium-Severity (Top 3 Expanded, Rest Collapsed) */}
                        {medium.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-4 bg-amber-500 rounded" />
                                    <span className="text-xs font-bold text-amber-700 uppercase">
                                        Medium Priority ({medium.length})
                                    </span>
                                </div>
                                {medium.slice(0, 3).map((spot, i) => (
                                    <BlindSpotRenderer
                                        key={i}
                                        spot={spot}
                                        index={i}
                                        onReAnalyze={onReAnalyze}
                                        onMarkAddressed={onMarkAddressed}
                                    />
                                ))}
                                {medium.length > 3 && (
                                    <details className="mt-2 group">
                                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors p-2 bg-slate-50 rounded border border-slate-200 list-none flex items-center gap-2">
                                            <span className="group-open:rotate-90 transition-transform">▶</span>
                                            Show {medium.length - 3} more medium-priority blind spots...
                                        </summary>
                                        <div className="mt-2 space-y-2">
                                            {medium.slice(3).map((spot, i) => (
                                                <BlindSpotRenderer
                                                    key={i + 3}
                                                    spot={spot}
                                                    index={i + 3}
                                                    onReAnalyze={onReAnalyze}
                                                    onMarkAddressed={onMarkAddressed}
                                                />
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Low-Severity (Collapsed by Default) */}
                        {low.length > 0 && (
                            <details className="space-y-2 group">
                                <summary className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors list-none">
                                    <div className="w-1 h-4 bg-slate-400 rounded" />
                                    <span className="text-xs font-bold text-slate-600 uppercase">
                                        Low Priority ({low.length})
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-auto group-open:hidden">Click to expand</span>
                                    <span className="text-[10px] text-slate-400 ml-auto hidden group-open:block">Click to collapse</span>
                                </summary>
                                <div className="mt-2 space-y-2 pl-3">
                                    {low.map((spot, i) => (
                                        <BlindSpotRenderer
                                            key={i}
                                            spot={spot}
                                            index={i}
                                            onReAnalyze={onReAnalyze}
                                            onMarkAddressed={onMarkAddressed}
                                        />
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                ) : blindSpots.length === 0 ? (
                    /* Zero Blind Spots (Celebratory) */
                    <div className="p-6 bg-emerald-50 rounded-lg border-2 border-emerald-200 text-center animate-in fade-in zoom-in-95 duration-500">
                        <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-emerald-900 mb-1">High Epistemic Coverage</h3>
                        <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto mb-4">
                            No major blind spots detected. However, all analyses are provisional—consider alternative theoretical lenses or re-analyze with different prompts to explore other perspectives.
                        </p>
                        <div className="pt-4 border-t border-emerald-100 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Theoretical Note</span>
                            <p className="text-[10px] text-emerald-600 leading-tight italic max-w-xs">
                                "The absence of a blind spot is often the biggest blind spot of all." — Epistemic Humility Protocol
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

/**
 * Stat Badge Component
 */
function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className={`p-2 rounded border bg-${color}-50 border-${color}-200`} title={`${value} ${label} blind spots`}>
            <div className={`text-lg font-bold text-${color}-700`}>{value}</div>
            <div className={`text-[10px] text-${color}-600 uppercase tracking-tight`}>{label}</div>
        </div>
    );
}
