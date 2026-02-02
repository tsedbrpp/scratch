"use client";

import React, { useState } from 'react';
import { BlindSpotEnhanced, BlindSpotInteractive } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Scale, Boxes, Clock, Globe, ArrowRight, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';

interface EnhancedBlindSpotCardProps {
    spot: BlindSpotEnhanced | BlindSpotInteractive;
    onReAnalyze?: (spotId: string) => void;
    onMarkAddressed?: (spotId: string) => void;
}

const CATEGORY_CONFIG = {
    epistemic: { icon: Eye, color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
    power: { icon: Scale, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700' },
    materiality: { icon: Boxes, color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
    temporality: { icon: Clock, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
    coloniality: { icon: Globe, color: 'rose', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', textColor: 'text-rose-700' }
};

const SEVERITY_CONFIG = {
    high: { variant: 'destructive' as const, label: 'High Priority', icon: AlertTriangle },
    medium: { variant: 'default' as const, label: 'Medium Priority', icon: AlertTriangle },
    low: { variant: 'secondary' as const, label: 'Low Priority', icon: AlertTriangle }
};

/**
 * Tier 2+: Enhanced blind spot with evidence, implications, and mitigations
 * Expandable sections for progressive disclosure
 */
export function EnhancedBlindSpotCard({ spot, onReAnalyze, onMarkAddressed }: EnhancedBlindSpotCardProps) {
    const [expanded, setExpanded] = useState(false);
    const categoryConfig = spot.category ? CATEGORY_CONFIG[spot.category] : null;
    const severityConfig = spot.severity ? SEVERITY_CONFIG[spot.severity] : SEVERITY_CONFIG.medium;
    const CategoryIcon = categoryConfig?.icon;
    const SeverityIcon = severityConfig.icon;
    const isInteractive = 'status' in spot;

    return (
        <div className={`p-4 bg-white rounded-lg border-2 transition-all ${expanded ? 'border-amber-300 shadow-md' : 'border-slate-200 hover:border-amber-200'
            }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{spot.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{spot.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <SeverityBadge severity={spot.severity || 'medium'} />
                    {categoryConfig && CategoryIcon && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.borderColor} border`}>
                            <CategoryIcon className="h-2.5 w-2.5" />
                            <span className={categoryConfig.textColor}>{spot.category}</span>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-controls={`blind-spot-details-${spot.id || 'default'}`}
                aria-label={expanded ? "Hide blind spot evidence and mitigations" : "Show blind spot evidence and mitigations"}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded px-1 -ml-1 font-medium transition-all"
            >
                {expanded ? (
                    <>
                        <ChevronUp className="h-3 w-3" aria-hidden="true" />
                        Hide Details
                    </>
                ) : (
                    <>
                        <ChevronDown className="h-3 w-3" aria-hidden="true" />
                        Show Evidence & Mitigations
                    </>
                )}
            </button>

            {/* Expandable Sections */}
            {expanded && (
                <div
                    id={`blind-spot-details-${spot.id || 'default'}`}
                    className="mt-4 space-y-4 border-t border-slate-100 pt-4"
                >
                    {/* Evidence */}
                    {spot.evidence && (
                        <div>
                            <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <div className="w-1 h-4 bg-amber-500 rounded" />
                                Evidence
                            </h5>
                            {spot.evidence.quote && (
                                <blockquote className="text-xs italic text-slate-600 border-l-2 border-amber-300 pl-3 py-1 bg-amber-50/30 rounded-r mb-2">
                                    "{spot.evidence.quote}"
                                </blockquote>
                            )}
                            <p className="text-xs text-slate-500 leading-relaxed">
                                <span className="font-medium text-slate-600">Context:</span> {spot.evidence.context}
                            </p>
                        </div>
                    )}

                    {/* Implications */}
                    {spot.implications && (
                        <div>
                            <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <div className="w-1 h-4 bg-rose-500 rounded" />
                                Implications
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/30 p-2 rounded border border-rose-100">
                                {spot.implications}
                            </p>
                        </div>
                    )}

                    {/* Severity Rationale */}
                    {spot.severity_rationale && (
                        <div>
                            <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <div className="w-1 h-4 bg-indigo-500 rounded" />
                                Why {spot.severity} severity?
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {spot.severity_rationale}
                            </p>
                        </div>
                    )}

                    {/* Suggested Mitigations */}
                    {spot.suggested_mitigations && spot.suggested_mitigations.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <div className="w-1 h-4 bg-emerald-500 rounded" />
                                Suggested Actions
                            </h5>
                            <ul className="space-y-2">
                                {spot.suggested_mitigations.map((mitigation, i) => (
                                    <li key={i} className="flex items-start gap-2 bg-emerald-50/30 p-2 rounded border border-emerald-100">
                                        <ArrowRight className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-slate-700 leading-relaxed">{mitigation}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons (Tier 3 only) */}
                    {isInteractive && (
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onReAnalyze?.(spot.id)}
                                className="text-xs"
                                aria-label={`Re-analyze with focus on: ${spot.title}`}
                            >
                                Re-Analyze with Focus
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onMarkAddressed?.(spot.id)}
                                className="text-xs"
                                aria-label={`Mark blind spot as addressed: ${spot.title}`}
                            >
                                Mark as Addressed
                            </Button>
                        </div>
                    )}

                    {/* Status Badge (Tier 3 only) */}
                    {isInteractive && spot.status !== 'detected' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                            <span className="font-medium">Status:</span>
                            <Badge variant="outline" className="capitalize">
                                {spot.status}
                            </Badge>
                            {spot.addressed_in && (
                                <span className="text-xs text-slate-400">
                                    → Addressed in analysis {spot.addressed_in.slice(0, 8)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
