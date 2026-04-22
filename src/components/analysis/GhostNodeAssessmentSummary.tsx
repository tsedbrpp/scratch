"use client";

import React, { useMemo } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Shield,
    FileText,
    Ban,
    Ghost,
    BarChart3,
    AlertTriangle,
    History,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AnalystAssessment, GhostNodeAssessmentStatus } from '@/lib/ghost-nodes/types';

// ─── Types ───────────────────────────────────────────────────────────

interface GhostNodeLike {
    id?: string;
    label?: string;
    name?: string;
    isGhost?: boolean;
    absenceType?: string;
    exclusionType?: string;
    analystAssessment?: AnalystAssessment;
    // Allow any extra fields
    [key: string]: unknown;
}

interface GhostNodeAssessmentSummaryProps {
    ghostNodes: GhostNodeLike[];
}

// ─── Status Config ───────────────────────────────────────────────────

const STATUS_COLORS: Record<GhostNodeAssessmentStatus, { bg: string; fill: string; text: string; label: string }> = {
    proposed: { bg: 'bg-slate-100', fill: '#94a3b8', text: 'text-slate-600', label: 'Unassessed' },
    confirmed: { bg: 'bg-emerald-100', fill: '#10b981', text: 'text-emerald-700', label: 'Confirmed' },
    contested: { bg: 'bg-amber-100', fill: '#f59e0b', text: 'text-amber-700', label: 'Contested' },
    deferred: { bg: 'bg-slate-200', fill: '#64748b', text: 'text-slate-500', label: 'Deferred' },
};

const CRITERIA_META = [
    { key: 'functionalRelevance' as const, label: 'Functional Relevance', icon: Shield, short: 'FR' },
    { key: 'textualTrace' as const, label: 'Textual Trace', icon: FileText, short: 'TT' },
    { key: 'structuralForeclosure' as const, label: 'Structural Foreclosure', icon: Ban, short: 'SF' },
];

// ─── Component ───────────────────────────────────────────────────────

export function GhostNodeAssessmentSummary({ ghostNodes }: GhostNodeAssessmentSummaryProps) {
    const stats = useMemo(() => {
        const total = ghostNodes.length;
        if (total === 0) return null;

        // Status distribution
        const statusCounts: Record<GhostNodeAssessmentStatus, number> = {
            proposed: 0, confirmed: 0, contested: 0, deferred: 0,
        };

        // Criteria aggregates
        const criteriaStats = {
            functionalRelevance: { met: 0, unmet: 0, unassessed: 0 },
            textualTrace: { met: 0, unmet: 0, unassessed: 0 },
            structuralForeclosure: { met: 0, unmet: 0, unassessed: 0 },
        };

        // Most contested criterion
        const failedCounts: Record<string, number> = {};

        // Reflexive note count
        let reflexiveNoteCount = 0;
        let assessedCount = 0;

        // P3: Total provenance entries
        let totalHistoryEntries = 0;
        // P4: Multi-analyst tracking
        const allAssessorIds = new Set<string>();
        let nodesWithDisagreement = 0;
        // Floridi moral status counts
        const moralStatusCounts = { moral_patient: 0, moral_agent: 0, both: 0, undetermined: 0 };

        ghostNodes.forEach(node => {
            const assessment = node.analystAssessment;
            if (!assessment) {
                statusCounts.proposed++;
                criteriaStats.functionalRelevance.unassessed++;
                criteriaStats.textualTrace.unassessed++;
                criteriaStats.structuralForeclosure.unassessed++;
                return;
            }

            assessedCount++;
            statusCounts[assessment.status]++;

            // Criteria
            for (const c of CRITERIA_META) {
                const val = assessment.criteriaChecklist?.[c.key];
                if (val === true) criteriaStats[c.key].met++;
                else if (val === false) criteriaStats[c.key].unmet++;
                else criteriaStats[c.key].unassessed++;
            }

            // Failed criterion
            if (assessment.failedCriterion) {
                failedCounts[assessment.failedCriterion] = (failedCounts[assessment.failedCriterion] || 0) + 1;
            }

            // Reflexive notes
            if (assessment.reflexiveNote?.trim()) {
                reflexiveNoteCount++;
            }

            // Floridi moral status
            const ms = assessment.moralStatus || 'undetermined';
            if (ms in moralStatusCounts) {
                moralStatusCounts[ms as keyof typeof moralStatusCounts]++;
            }

            // P3: Count history entries
            if (assessment.assessmentHistory) {
                totalHistoryEntries += assessment.assessmentHistory.length;
                // P4: Collect unique assessors and check for disagreements
                const nodeAssessors = new Map<string, string>();
                assessment.assessmentHistory.forEach(e => {
                    if (e.assessorId) {
                        allAssessorIds.add(e.assessorId);
                        nodeAssessors.set(e.assessorId, e.status);
                    }
                });
                if (nodeAssessors.size > 1) {
                    const verdicts = [...nodeAssessors.values()];
                    if (!verdicts.every(v => v === verdicts[0])) {
                        nodesWithDisagreement++;
                    }
                }
            }
        });

        // Most frequently failed criterion
        const mostFailed = Object.entries(failedCounts)
            .sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            assessedCount,
            statusCounts,
            criteriaStats,
            mostFailed: mostFailed ? { criterion: mostFailed[0], count: mostFailed[1] } : null,
            reflexiveNoteCount,
            assessmentRate: total > 0 ? Math.round((assessedCount / total) * 100) : 0,
            totalHistoryEntries,
            uniqueAssessorCount: allAssessorIds.size,
            nodesWithDisagreement,
            moralStatusCounts,
        };
    }, [ghostNodes]);

    if (!stats || stats.total === 0) return null;

    const { total, statusCounts, criteriaStats, assessmentRate, reflexiveNoteCount, mostFailed, assessedCount, totalHistoryEntries, uniqueAssessorCount, nodesWithDisagreement, moralStatusCounts } = stats;

    // Donut chart segments
    const donutSegments = (['confirmed', 'contested', 'deferred', 'proposed'] as GhostNodeAssessmentStatus[])
        .filter(s => statusCounts[s] > 0);

    const donutSize = 80;
    const donutStroke = 10;
    const donutRadius = (donutSize - donutStroke) / 2;
    const donutCircumference = 2 * Math.PI * donutRadius;

    let cumulativeOffset = 0;

    return (
        <Card className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="h-4.5 w-4.5 text-indigo-600" />
                    Assessment Summary
                </CardTitle>
                <CardDescription className="text-xs">
                    Analyst review status across {total} Ghost Node{total !== 1 ? 's' : ''}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* ── Row 1: Donut Chart + Status Breakdown ── */}
                <div className="flex items-center gap-4">
                    {/* Mini Donut */}
                    <div className="relative flex-shrink-0">
                        <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`}>
                            {/* Background circle */}
                            <circle
                                cx={donutSize / 2} cy={donutSize / 2} r={donutRadius}
                                fill="none" stroke="#e2e8f0" strokeWidth={donutStroke}
                            />
                            {/* Segments */}
                            {donutSegments.map(status => {
                                const count = statusCounts[status];
                                const pct = count / total;
                                const dashLength = pct * donutCircumference;
                                const dashGap = donutCircumference - dashLength;
                                const offset = cumulativeOffset;
                                cumulativeOffset += dashLength;

                                return (
                                    <circle
                                        key={status}
                                        cx={donutSize / 2} cy={donutSize / 2} r={donutRadius}
                                        fill="none"
                                        stroke={STATUS_COLORS[status].fill}
                                        strokeWidth={donutStroke}
                                        strokeDasharray={`${dashLength} ${dashGap}`}
                                        strokeDashoffset={-offset}
                                        strokeLinecap="butt"
                                        transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
                                        className="transition-all duration-500"
                                    />
                                );
                            })}
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-slate-800">{assessmentRate}%</span>
                            <span className="text-[9px] text-slate-400">reviewed</span>
                        </div>
                    </div>

                    {/* Status legend */}
                    <div className="flex-1 grid grid-cols-2 gap-1.5">
                        {(['confirmed', 'contested', 'deferred', 'proposed'] as GhostNodeAssessmentStatus[]).map(status => (
                            <div key={status} className="flex items-center gap-1.5">
                                <div
                                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                    style={{ backgroundColor: STATUS_COLORS[status].fill }}
                                />
                                <span className="text-[11px] text-slate-600">
                                    {STATUS_COLORS[status].label}
                                </span>
                                <span className={`text-[11px] font-semibold ml-auto ${STATUS_COLORS[status].text}`}>
                                    {statusCounts[status]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Row 2: Criteria Heatmap ── */}
                <div className="space-y-1.5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Criteria Assessment Distribution
                    </h5>
                    {CRITERIA_META.map(c => {
                        const { met, unmet, unassessed } = criteriaStats[c.key];
                        const assessed = met + unmet;
                        const CIcon = c.icon;

                        return (
                            <div key={c.key} className="flex items-center gap-2">
                                <CIcon className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                <span className="text-[10px] text-slate-500 w-28 truncate" title={c.label}>
                                    {c.label}
                                </span>
                                {/* Stacked bar */}
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
                                    {met > 0 && (
                                        <div
                                            className="h-full bg-emerald-400 transition-all duration-300"
                                            style={{ width: `${(met / total) * 100}%` }}
                                            title={`Met: ${met}`}
                                        />
                                    )}
                                    {unmet > 0 && (
                                        <div
                                            className="h-full bg-red-400 transition-all duration-300"
                                            style={{ width: `${(unmet / total) * 100}%` }}
                                            title={`Unmet: ${unmet}`}
                                        />
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 w-8 text-right tabular-nums">
                                    {assessed}/{total}
                                </span>
                            </div>
                        );
                    })}
                    <div className="flex items-center gap-3 text-[9px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-sm inline-block" /> Met</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-sm inline-block" /> Unmet</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-100 rounded-sm inline-block border border-slate-200" /> Unassessed</span>
                    </div>
                </div>

                {/* ── Row 3: Key Insights ── */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {mostFailed && (
                        <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-200 bg-amber-50 gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Most contested: {
                                mostFailed.criterion === 'functionalRelevance' ? 'Functional Relevance' :
                                    mostFailed.criterion === 'textualTrace' ? 'Textual Trace' :
                                        mostFailed.criterion === 'structuralForeclosure' ? 'Structural Foreclosure' :
                                            mostFailed.criterion
                            } ({mostFailed.count}×)
                        </Badge>
                    )}
                    {reflexiveNoteCount > 0 && (
                        <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200 bg-indigo-50 gap-1">
                            <Eye className="h-2.5 w-2.5" />
                            {reflexiveNoteCount} reflexive note{reflexiveNoteCount !== 1 ? 's' : ''}
                        </Badge>
                    )}
                    {assessedCount === total && total > 0 && (
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            All nodes assessed
                        </Badge>
                    )}
                    {assessedCount === 0 && (
                        <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 bg-slate-50 gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            No assessments yet — click a Ghost Node to begin
                        </Badge>
                    )}
                    {totalHistoryEntries > 0 && (
                        <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200 bg-slate-50 gap-1">
                            <History className="h-2.5 w-2.5" />
                            {totalHistoryEntries} provenance entr{totalHistoryEntries !== 1 ? 'ies' : 'y'}
                        </Badge>
                    )}
                    {uniqueAssessorCount > 1 && (
                        <Badge variant="outline" className={`text-[10px] gap-1 ${nodesWithDisagreement > 0
                            ? 'text-amber-700 border-amber-200 bg-amber-50'
                            : 'text-emerald-700 border-emerald-200 bg-emerald-50'
                            }`}>
                            <Users className="h-2.5 w-2.5" />
                            {uniqueAssessorCount} analysts{nodesWithDisagreement > 0
                                ? ` — ${nodesWithDisagreement} node${nodesWithDisagreement !== 1 ? 's' : ''} with divergent verdicts`
                                : ' — all agree'
                            }
                        </Badge>
                    )}
                    {(moralStatusCounts.moral_patient + moralStatusCounts.moral_agent + moralStatusCounts.both) > 0 && (
                        <Badge variant="outline" className="text-[10px] text-violet-600 border-violet-200 bg-violet-50 gap-1">
                            <Shield className="h-2.5 w-2.5" />
                            {moralStatusCounts.moral_patient} patient{moralStatusCounts.moral_patient !== 1 ? 's' : ''}
                            {moralStatusCounts.moral_agent > 0 && ` · ${moralStatusCounts.moral_agent} agent${moralStatusCounts.moral_agent !== 1 ? 's' : ''}`}
                            {moralStatusCounts.both > 0 && ` · ${moralStatusCounts.both} both`}
                        </Badge>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
