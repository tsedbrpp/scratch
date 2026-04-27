"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Shield,
    FileText,
    Ban,
    MessageSquare,
    Save,
    Loader2,
    Eye,
    History,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useDemoMode } from '@/hooks/useDemoMode';
import type { AnalystAssessment, GhostNodeAssessmentStatus } from '@/lib/ghost-nodes/types';

// ─── Client-side fingerprint (matches GhostNodeStore.generateFingerprint) ────

async function computeFingerprint(name: string, policyId: string): Promise<string> {
    const normalizedName = name.trim().toLowerCase();
    const rawData = `${policyId}:${normalizedName}:`;  // empty themes string
    const encoder = new TextEncoder();
    const data = encoder.encode(rawData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Types ───────────────────────────────────────────────────────────────

interface GhostNodeData {
    fingerprint?: string;
    label?: string;
    name?: string;
    policyId?: string;
    description?: string;
    ghostReason?: string;
    whyAbsent?: string;
    absenceType?: string;
    exclusionType?: string;
    evidence?: Array<{ rationale: string; quote: string; sourceRef?: string }>;
    evidenceQuotes?: Array<{ quote: string; context?: string }>;
    analystAssessment?: AnalystAssessment;
    criterionEvidence?: {
        functionalRelevance?: Array<{ quote: string; rationale?: string; sourceRef?: string }>;
        textualTrace?: Array<{ quote: string; rationale?: string; sourceRef?: string }>;
        structuralForeclosure?: Array<{ quote: string; rationale?: string; sourceRef?: string }>;
    };
    // GNDP v1.1: Subsumption fields
    ghostPathway?: string;
    subsumptionSource?: {
        absorbingCategory: string;
        sourceRef?: string;
        absorptionEvidence?: string;
        differentiatedClaims?: string[];
    };
    schematicAdequacy?: {
        assessment: string;
        adequacyRationale?: string;
        capacityNonRegistration?: Array<{
            capacity: string;
            procedurallyActionable: boolean;
            reason: string;
        }>;
    };
}

interface GhostNodeReflexiveAssessmentProps {
    ghostNode: GhostNodeData;
    policyId: string;
    onAssessmentSaved?: (fingerprint: string, assessment: AnalystAssessment) => void;
}

// ─── Constants ───────────────────────────────────────────────────────

const CRITERIA = [
    {
        key: 'functionalRelevance' as const,
        label: 'Functional Relevance',
        icon: Shield,
        question: 'Does this actor plausibly bear a governance function given the regime\'s stated objectives?',
        tooltip: 'Analyst must cite at least one specific stated objective to which the actor is functionally relevant.',
    },
    {
        key: 'textualTrace' as const,
        label: 'Textual Trace',
        icon: FileText,
        question: 'Does the document invoke the actor\'s interests, harms, or standing without enrolling them as agents?',
        tooltip: 'Analyst must identify the specific passage that names or implies the actor\'s interests.',
    },
    {
        key: 'structuralForeclosure' as const,
        label: 'Structural Foreclosure',
        icon: Ban,
        question: 'Does the procedural architecture foreclose the actor\'s participation in governance?',
        tooltip: 'Analyst must confirm no provision assigns the actor a decision-making, consultative, or enforcement role.',
    },
] as const;

const STATUS_CONFIG: Record<GhostNodeAssessmentStatus, {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof CheckCircle2;
}> = {
    proposed: { label: 'Proposed', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: Eye },
    confirmed: { label: 'Confirmed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
    contested: { label: 'Contested', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
    deferred: { label: 'Deferred', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300', icon: Clock },
};

// ─── Component ───────────────────────────────────────────────────────

export function GhostNodeReflexiveAssessment({
    ghostNode,
    policyId,
    onAssessmentSaved,
}: GhostNodeReflexiveAssessmentProps) {
    const { isReadOnly } = useDemoMode();
    const existing = ghostNode.analystAssessment;

    // Compute fingerprint: use provided one, or derive SHA-256 matching server-side store
    const [computedFingerprint, setComputedFingerprint] = useState<string | null>(ghostNode.fingerprint || null);
    useEffect(() => {
        if (ghostNode.fingerprint) {
            setComputedFingerprint(ghostNode.fingerprint);
            return;
        }
        const name = ghostNode.label || ghostNode.name;
        const pid = ghostNode.policyId;
        if (name && pid) {
            computeFingerprint(name, pid).then(fp => setComputedFingerprint(fp));
        }
    }, [ghostNode.fingerprint, ghostNode.label, ghostNode.name, ghostNode.policyId]);

    const effectiveFingerprint = computedFingerprint;

    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Assessment state
    const [criteria, setCriteria] = useState<{
        functionalRelevance: boolean | null;
        textualTrace: boolean | null;
        structuralForeclosure: boolean | null;
        subsumptionJudgment?: 'nominal_only' | 'partially_operative' | 'operationally_adequate' | null;
    }>(existing?.criteriaChecklist ?? {
        functionalRelevance: null,
        textualTrace: null,
        structuralForeclosure: null,
        subsumptionJudgment: null,
    });

    const [contestReason, setContestReason] = useState(existing?.contestReason ?? '');
    const [reflexiveNote, setReflexiveNote] = useState(existing?.reflexiveNote ?? '');
    const [moralStatus, setMoralStatus] = useState<AnalystAssessment['moralStatus']>(existing?.moralStatus ?? 'undetermined');
    const [failedCriterion, setFailedCriterion] = useState<AnalystAssessment['failedCriterion']>(existing?.failedCriterion);

    // Derive status from criteria
    const deriveStatus = useCallback((): GhostNodeAssessmentStatus => {
        const { functionalRelevance, textualTrace, structuralForeclosure } = criteria;
        const allChecked = functionalRelevance !== null && textualTrace !== null && structuralForeclosure !== null;

        if (!allChecked) return 'proposed';
        if (functionalRelevance && textualTrace && structuralForeclosure) return 'confirmed';
        if (contestReason.trim().length > 0) return 'contested';
        return 'contested';
    }, [criteria, contestReason]);

    const currentStatus = existing?.status ?? deriveStatus();
    const statusConfig = STATUS_CONFIG[currentStatus];
    const StatusIcon = statusConfig.icon;

    // Toggle criterion
    const toggleCriterion = (key: keyof typeof criteria, value: boolean) => {
        setCriteria(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
    };

    // Find evidence for a criterion — explicit tags first, then keyword heuristics
    const getEvidenceForCriterion = (key: string): Array<{ quote: string; rationale?: string }> => {
        // 1. Use explicit criterion-tagged evidence if available
        const tagged = ghostNode.criterionEvidence?.[key as keyof typeof ghostNode.criterionEvidence];
        if (tagged && tagged.length > 0) return tagged;

        // 2. Keyword heuristics on general evidence
        const allEvidence = [
            ...(ghostNode.evidence ?? []).map(e => ({ quote: e.quote || '', rationale: e.rationale })),
            ...(ghostNode.evidenceQuotes ?? []).map(e => ({ quote: e.quote, rationale: e.context })),
        ].filter(e => e.quote);

        if (allEvidence.length === 0) return [];

        const CRITERION_KEYWORDS: Record<string, string[]> = {
            functionalRelevance: ['function', 'objective', 'purpose', 'governance', 'role', 'protect', 'ensure', 'harm', 'rights', 'safety', 'risk'],
            textualTrace: ['mention', 'invoke', 'reference', 'named', 'interest', 'behalf', 'subject', 'affect', 'citizen', 'consumer', 'worker', 'individual'],
            structuralForeclosure: ['no provision', 'no mechanism', 'no standing', 'no role', 'excluded', 'foreclose', 'absent', 'complaint', 'enforce', 'participate', 'consult'],
        };

        const keywords = CRITERION_KEYWORDS[key] || [];

        // Score each evidence item by keyword matches
        const scored = allEvidence.map(e => {
            const text = (e.quote + ' ' + (e.rationale || '')).toLowerCase();
            const score = keywords.filter(kw => text.includes(kw)).length;
            return { ...e, score };
        });

        // Return items with score > 0, sorted by match strength
        const matched = scored.filter(e => e.score > 0).sort((a, b) => b.score - a.score);
        if (matched.length > 0) return matched.slice(0, 2);

        // 3. Fallback: distribute by position (FR=first, TT=second, SF=third)
        const idx = key === 'functionalRelevance' ? 0 : key === 'textualTrace' ? 1 : 2;
        if (idx < allEvidence.length) return [allEvidence[idx]];
        return [allEvidence[allEvidence.length - 1]];
    };

    // Save
    const handleSave = async () => {
        if (isReadOnly || !effectiveFingerprint) return;
        setIsSaving(true);

        const assessment: AnalystAssessment = {
            status: deriveStatus(),
            criteriaChecklist: criteria,
            failedCriterion: deriveStatus() === 'contested' ? failedCriterion : undefined,
            contestReason: deriveStatus() === 'contested' ? contestReason : undefined,
            reflexiveNote: reflexiveNote.trim() || undefined,
            moralStatus: moralStatus || 'undetermined',
            assessedAt: new Date().toISOString(),
        };

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const res = await fetch(`/api/ghost-nodes/${policyId}/assess`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ fingerprint: effectiveFingerprint, assessment }),
            });

            if (res.ok) {
                onAssessmentSaved?.(effectiveFingerprint, assessment);
            }
        } catch (err) {
            console.error('Failed to save assessment:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Defer
    const handleDefer = async () => {
        if (isReadOnly || !effectiveFingerprint) return;
        setIsSaving(true);

        const assessment: AnalystAssessment = {
            status: 'deferred',
            criteriaChecklist: criteria,
            reflexiveNote: reflexiveNote.trim() || undefined,
            assessedAt: new Date().toISOString(),
        };

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const res = await fetch(`/api/ghost-nodes/${policyId}/assess`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ fingerprint: effectiveFingerprint, assessment }),
            });

            if (res.ok) {
                onAssessmentSaved?.(effectiveFingerprint, assessment);
            }
        } catch (err) {
            console.error('Failed to defer assessment:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const nodeLabel = ghostNode.label || ghostNode.name || 'Ghost Node';

    return (
        <div className={`rounded-lg border ${statusConfig.border} ${statusConfig.bg} transition-all duration-200`}>
            {/* ── Header (always visible) ── */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/50 transition-colors rounded-t-lg"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon className={`h-4 w-4 flex-shrink-0 ${statusConfig.color}`} />
                    <span className="text-xs font-semibold text-slate-800 truncate">{nodeLabel}</span>
                    <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${statusConfig.color} ${statusConfig.border}`}>
                        {statusConfig.label}
                    </Badge>
                    {ghostNode.absenceType && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-slate-500 border-slate-200">
                            {ghostNode.absenceType}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {/* Criteria quick indicators */}
                    {CRITERIA.map(c => {
                        const val = (existing?.criteriaChecklist ?? criteria)[c.key];
                        return (
                            <div
                                key={c.key}
                                className={`w-2 h-2 rounded-full ${val === true ? 'bg-emerald-500' :
                                    val === false ? 'bg-red-400' :
                                        'bg-slate-300'
                                    }`}
                                title={`${c.label}: ${val === true ? '✓' : val === false ? '✗' : '—'}`}
                            />
                        );
                    })}
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                </div>
            </button>

            {/* ── Expanded Assessment Panel ── */}
            {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-200/50">
                    {/* Ghost Node reason/description */}
                    {(ghostNode.ghostReason || ghostNode.whyAbsent || ghostNode.description) && (
                        <div className="mt-2 p-2 bg-white/70 rounded text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                            {ghostNode.ghostReason || ghostNode.whyAbsent || ghostNode.description}
                        </div>
                    )}

                    {/* ── GNDP v1.1: Subsumption Context ── */}
                    {ghostNode.ghostPathway === 'subsumption' && ghostNode.subsumptionSource && (
                        <div className="space-y-1.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Categorical Subsumption Detected
                            </h5>
                            <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] space-y-1">
                                <div>
                                    <span className="font-medium text-amber-700">Subsumed under: </span>
                                    <span className="text-amber-600">&ldquo;{ghostNode.subsumptionSource.absorbingCategory}&rdquo;</span>
                                    {ghostNode.subsumptionSource.sourceRef && (
                                        <span className="text-amber-400 ml-1">({ghostNode.subsumptionSource.sourceRef})</span>
                                    )}
                                </div>
                                {ghostNode.schematicAdequacy && (
                                    <div>
                                        <span className="font-medium text-amber-700">Operational adequacy: </span>
                                        <span className={`font-semibold ${ghostNode.schematicAdequacy.assessment === 'Deficient' ? 'text-red-600' : ghostNode.schematicAdequacy.assessment === 'Partial' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {ghostNode.schematicAdequacy.assessment}
                                        </span>
                                    </div>
                                )}
                                {ghostNode.schematicAdequacy?.capacityNonRegistration && ghostNode.schematicAdequacy.capacityNonRegistration.length > 0 && (
                                    <details className="group">
                                        <summary className="text-[10px] text-amber-500 cursor-pointer hover:text-amber-700">
                                            Non-registered capacities ({ghostNode.schematicAdequacy.capacityNonRegistration.length})
                                        </summary>
                                        <ul className="mt-1 space-y-0.5 ml-3">
                                            {ghostNode.schematicAdequacy.capacityNonRegistration.map((cap, i) => (
                                                <li key={i} className="text-[10px] text-slate-600">
                                                    <span className="font-medium">{cap.capacity}</span>
                                                    <span className="text-slate-400"> — {cap.reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                                <p className="text-[9px] text-amber-400 italic mt-1">
                                    This is a candidate classification. Use the Subsumption Judgment criterion below to confirm or override.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Three-Criterion Checklist (§4.2) ── */}
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Evidentiary Criteria (§4.2)
                        </h5>

                        {CRITERIA.map(c => {
                            const val = criteria[c.key];
                            const evidenceItems = getEvidenceForCriterion(c.key);
                            const CIcon = c.icon;

                            return (
                                <div key={c.key} className="bg-white rounded-md border border-slate-100 p-2 space-y-1.5">
                                    <div className="flex items-start gap-2">
                                        <CIcon className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-medium text-slate-700">{c.label}</div>
                                            <div className="text-[10px] text-slate-500 italic">{c.question}</div>
                                        </div>
                                        {/* Toggle buttons */}
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => toggleCriterion(c.key, true)}
                                                disabled={isReadOnly}
                                                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${val === true
                                                    ? 'bg-emerald-500 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'
                                                    }`}
                                                title="Criterion met"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => toggleCriterion(c.key, false)}
                                                disabled={isReadOnly}
                                                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${val === false
                                                    ? 'bg-red-500 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'
                                                    }`}
                                                title="Criterion not met"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Show extracted evidence */}
                                    {evidenceItems.length > 0 && (
                                        <div className="ml-5 space-y-1">
                                            {evidenceItems.map((ev, i) => (
                                                <div key={i} className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border-l-2 border-indigo-200">
                                                    {ev.rationale && (
                                                        <span className="font-medium text-indigo-600 not-italic">{ev.rationale}: </span>
                                                    )}
                                                    <span className="italic">
                                                        &ldquo;{ev.quote.length > 200 ? ev.quote.slice(0, 200) + '…' : ev.quote}&rdquo;
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* If marked false, prompt for which criterion failed */}
                                    {val === false && (
                                        <div className="ml-5">
                                            <button
                                                onClick={() => setFailedCriterion(c.key)}
                                                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${failedCriterion === c.key
                                                    ? 'bg-amber-200 text-amber-800 font-medium'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-amber-100'
                                                    }`}
                                            >
                                                Mark as failed criterion
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── GNDP v1.1: Subsumption Judgment (fourth criterion) ── */}
                    {ghostNode.ghostPathway === 'subsumption' && (
                        <div className="space-y-1.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Subsumption Judgment (v1.1)
                            </h5>
                            <div className="bg-white rounded-md border border-slate-100 p-2 space-y-1.5">
                                <div className="text-[11px] font-medium text-slate-700">Is the actor&apos;s inclusion through a broad category operationally meaningful?</div>
                                <div className="text-[10px] text-slate-500 italic">Select &ldquo;Operationally adequate&rdquo; to override the Subsumed Ghost classification.</div>
                                <select
                                    value={criteria.subsumptionJudgment ?? ''}
                                    onChange={e => setCriteria(prev => ({ ...prev, subsumptionJudgment: (e.target.value || null) as any }))}
                                    disabled={isReadOnly}
                                    className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
                                >
                                    <option value="">Not assessed</option>
                                    <option value="nominal_only">Nominal only — no actor-specific mechanisms</option>
                                    <option value="partially_operative">Partially operative — some mechanisms exist</option>
                                    <option value="operationally_adequate">Operationally adequate — override subsumption</option>
                                </select>
                                {criteria.subsumptionJudgment === 'operationally_adequate' && (
                                    <div className="text-[10px] text-emerald-600 bg-emerald-50 p-1.5 rounded border border-emerald-100">
                                        ✓ Subsumption classification will be overridden. The actor is reclassified as formally included with limited but genuine procedural standing.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Contest Reason (if any criterion is false) ── */}
                    {Object.values(criteria).some(v => v === false) && (
                        <div className="space-y-1">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Contest Reason
                            </h5>
                            <Textarea
                                value={contestReason}
                                onChange={e => setContestReason(e.target.value)}
                                placeholder="Why does this Ghost Node classification not hold? Which evidence is insufficient?"
                                className="text-xs min-h-[60px] bg-white"
                                disabled={isReadOnly}
                            />
                        </div>
                    )}

                    {/* ── Reflexive Prompts (Floridi-grounded) ── */}
                    <div className="space-y-1">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Reflexive Note
                        </h5>
                        <div className="space-y-1 text-[10px] text-slate-400 italic">
                            <p>1. How might your disciplinary position, institutional location, or epistemic commitments affect your reading of this absence?</p>
                            <p>2. Is this actor a moral patient — affected by governance decisions — who has been denied moral agency within the assemblage? What informational asymmetries sustain that denial? <span className="not-italic text-slate-300">(Floridi, 2013)</span></p>
                            <p>3. Whose absence is this? Which social categories (gender, race, coloniality, labor status) are disproportionately represented among the structurally excluded? <span className="not-italic text-slate-300">(D&apos;Ignazio &amp; Klein, 2020)</span></p>
                        </div>
                        <Textarea
                            value={reflexiveNote}
                            onChange={e => setReflexiveNote(e.target.value)}
                            placeholder="e.g., As a legal scholar, I may overweight procedural standing..."
                            className="text-xs min-h-[50px] bg-white"
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* ── Moral Status (Floridi) ── */}
                    <div className="space-y-1">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-violet-500 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Moral Status <span className="font-normal normal-case text-slate-400">(Floridi, 2013)</span>
                        </h5>
                        <p className="text-[10px] text-slate-400 italic">
                            Classify this Ghost Node&apos;s moral standing within the governance assemblage.
                        </p>
                        <select
                            value={moralStatus}
                            onChange={e => setMoralStatus(e.target.value as AnalystAssessment['moralStatus'])}
                            disabled={isReadOnly}
                            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-300"
                        >
                            <option value="undetermined">Undetermined</option>
                            <option value="moral_patient">Moral Patient — affected by decisions, denied agency</option>
                            <option value="moral_agent">Moral Agent — capable of acting, excluded from governance</option>
                            <option value="both">Both — affected and capable, yet excluded</option>
                        </select>
                    </div>

                    {/* ── Provenance Chain (P3) ── */}
                    {existing?.assessmentHistory && existing.assessmentHistory.length > 0 && (
                        <details className="group">
                            <summary className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 select-none">
                                <History className="h-3 w-3" />
                                Assessment Provenance ({existing.assessmentHistory.length} entr{existing.assessmentHistory.length === 1 ? 'y' : 'ies'})
                                <ChevronDown className="h-3 w-3 ml-auto transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
                                {[...existing.assessmentHistory].reverse().map((entry, i) => {
                                    const actionLabels: Record<string, string> = {
                                        initial: 'Initial assessment',
                                        revision: 'Revised',
                                        contest: 'Contested',
                                        confirm: 'Confirmed',
                                        defer: 'Deferred',
                                    };
                                    const statusColors: Record<string, string> = {
                                        confirmed: 'text-emerald-600',
                                        contested: 'text-amber-600',
                                        deferred: 'text-slate-500',
                                        proposed: 'text-slate-400',
                                    };
                                    const date = new Date(entry.timestamp);
                                    const criteriaIcons = [
                                        entry.criteriaChecklist.functionalRelevance === true ? '✓' : entry.criteriaChecklist.functionalRelevance === false ? '✗' : '—',
                                        entry.criteriaChecklist.textualTrace === true ? '✓' : entry.criteriaChecklist.textualTrace === false ? '✗' : '—',
                                        entry.criteriaChecklist.structuralForeclosure === true ? '✓' : entry.criteriaChecklist.structuralForeclosure === false ? '✗' : '—',
                                    ];

                                    return (
                                        <div key={i} className="flex items-start gap-2 p-1.5 bg-white rounded border border-slate-100 text-[10px]">
                                            <div className="w-1 h-full bg-slate-200 rounded-full flex-shrink-0 self-stretch min-h-[20px]" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`font-semibold ${statusColors[entry.status] || 'text-slate-500'}`}>
                                                        {actionLabels[entry.action] || entry.action}
                                                    </span>
                                                    <span className="text-slate-300">·</span>
                                                    <span className="text-slate-400 tabular-nums">
                                                        FR:{criteriaIcons[0]} TT:{criteriaIcons[1]} SF:{criteriaIcons[2]}
                                                    </span>
                                                    {entry.assessorId && (
                                                        <>
                                                            <span className="text-slate-300">·</span>
                                                            <span className="text-slate-400 truncate max-w-[60px]" title={entry.assessorId}>
                                                                <Users className="h-2.5 w-2.5 inline" /> {entry.assessorId.slice(0, 8)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-slate-400 mt-0.5">
                                                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    {entry.contestReason && (
                                                        <span className="text-amber-500 ml-1">— {entry.contestReason.slice(0, 60)}{entry.contestReason.length > 60 ? '…' : ''}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* P4: Inter-analyst disagreement indicator */}
                            {(() => {
                                const assessors = new Map<string, string>();
                                existing.assessmentHistory.forEach(e => {
                                    if (e.assessorId) assessors.set(e.assessorId, e.status);
                                });
                                if (assessors.size > 1) {
                                    const verdicts = [...assessors.values()];
                                    const allAgree = verdicts.every(v => v === verdicts[0]);
                                    return (
                                        <div className={`mt-1.5 p-1.5 rounded text-[10px] flex items-center gap-1.5 ${allAgree
                                            ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                                            : 'bg-amber-50 border border-amber-100 text-amber-700'
                                            }`}>
                                            <Users className="h-3 w-3 flex-shrink-0" />
                                            {allAgree ? (
                                                <span>{assessors.size} analysts agree: <strong>{verdicts[0]}</strong></span>
                                            ) : (
                                                <span>
                                                    <strong>Disagreement detected</strong> across {assessors.size} analysts —
                                                    {[...assessors.entries()].map(([id, v]) => ` ${id.slice(0, 6)}: ${v}`).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </details>
                    )}

                    {/* ── Action Buttons ── */}
                    {!isReadOnly && effectiveFingerprint && (
                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Save className="h-3 w-3" />
                                )}
                                Save Assessment
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDefer}
                                disabled={isSaving}
                                className="text-xs h-7 text-slate-500 gap-1"
                            >
                                <Clock className="h-3 w-3" />
                                Defer
                            </Button>
                            {existing && (
                                <span className="text-[10px] text-slate-400 ml-auto">
                                    Last assessed: {new Date(existing.assessedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Read-only notice */}
                    {isReadOnly && (
                        <p className="text-[10px] text-slate-400 italic pt-1">
                            Assessment is read-only in Demo Mode.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
