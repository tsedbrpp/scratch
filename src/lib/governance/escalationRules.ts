import { AnalysisResult } from '../../types';
import { EscalationStatus, EscalationConfiguration, EscalationLevel } from '../../types/escalation';

// Mock context for Phase 1 - In Phase 2 this will be injected or fetched
export interface SystemContext {
    corpusSize?: number;
    recurrence_count?: number;
    recurrenceMap?: Record<string, number>;
}

/**
 * Computes configuration features for the escalation engine.
 * Specifically targets: Recurrence, Severity, and Variance.
 */
function computeConfigurationInference(analysis: AnalysisResult, context?: SystemContext): EscalationConfiguration {
    // 1. Risk Domain Severity (Heuristic based on keywords or tags)
    let severity: 'GENERAL' | 'MEDICAL' | 'LEGAL' | 'CRITICAL' = 'GENERAL';
    const text = (analysis.key_insight || analysis.raw_response || '').toLowerCase();

    if (text.includes('medical') || text.includes('patient') || text.includes('health')) severity = 'MEDICAL';
    if (text.includes('law') || text.includes('regulation') || text.includes('rights')) severity = 'LEGAL';

    // 2. Recurrence Count (Injected via SystemContext)
    const recurrence_count = context?.recurrence_count || 1;

    return {
        recurrence_count,
        risk_domain_severity: severity,
        evaluator_variance: 0,
        enforcement_signal_strength: 'LOW'
    };
}

// --------------------------------------------------------------------------
// RULE ENGINE IMPLEMENTATION
// --------------------------------------------------------------------------

/**
 * Interface definition for a Governance Rule.
 * This structure allows rules to be serialized/stored in DB in Phase 5.
 */
export interface GovernanceRule {
    id: string;
    description: string;
    evaluate: (analysis: AnalysisResult, config: EscalationConfiguration) => boolean;
    consequence: {
        level: EscalationLevel;
        reason: string;
    };
    meta?: {
        source: 'CONSTITUTION' | 'COMMUNITY_VOTE';
        version: number;
    };
}

/**
 * THE LIVE CONSTITUTION (Default Rules)
 * These are the current "If-Then" rules ratified by the system.
 */
export const GOVERNANCE_RULES: GovernanceRule[] = [
    {
        id: 'RULE_BLINDSPOT_INTENSITY',
        description: 'Flag High Blindspot Intensity as Advisory',
        evaluate: (a) => a.assemblage_analysis?.blindspot_intensity === 'High',
        consequence: {
            level: 'SOFT',
            reason: 'High Blindspot Intensity detected.'
        }
    },
    {
        id: 'RULE_HIGH_STAKES_DOMAIN',
        description: 'Bind Reassembly for High Stakes Domains with High Absence',
        evaluate: (a, c) => a.assemblage_analysis?.blindspot_intensity === 'High' &&
            (c.risk_domain_severity === 'MEDICAL' || c.risk_domain_severity === 'CRITICAL'),
        consequence: {
            level: 'MEDIUM',
            reason: 'High Absence in High-Stakes Domain.'
        }
    },
    {
        id: 'RULE_HIGH_RISK_TRAJECTORY',
        description: 'Bind Reassembly for High Risk Trajectories',
        evaluate: (a) => {
            const flights = a.assemblage_analysis?.trajectory_analysis?.lines_of_flight || [];
            return flights.some(l => l.risk_level === 'High');
        },
        consequence: {
            level: 'MEDIUM',
            reason: 'Detected High-Risk Line(s) of Flight.'
        }
    },
    {
        id: 'RULE_RECURRENT_PATTERN',
        description: 'Block Logic that makes frequent High-Risk appearances',
        evaluate: (a, c) => a.assemblage_analysis?.blindspot_intensity === 'High' &&
            (c.recurrence_count || 0) >= 3,
        consequence: {
            level: 'HARD',
            reason: 'Recurrent Pattern Logic detected across 3+ documents. Durability exceeds threshold.'
        }
    }
];

/**
 * Deterministic Rule Engine
 * Iterates through the active Ruleset and determines the highest signal.
 */
function evaluateDeterministicRules(analysis: AnalysisResult, config: EscalationConfiguration): { level: EscalationLevel, reasons: string[] } {
    const reasons: string[] = [];
    let maxLevelVal = 0;
    let maxLevel: EscalationLevel = 'NONE';

    for (const rule of GOVERNANCE_RULES) {
        try {
            if (rule.evaluate(analysis, config)) {
                reasons.push(rule.consequence.reason);
                const val = getLevelSeverity(rule.consequence.level);
                if (val > maxLevelVal) {
                    maxLevelVal = val;
                    maxLevel = rule.consequence.level;
                }
            }
        } catch (err) {
            console.error(`Rule ${rule.id} failed to evaluate:`, err);
        }
    }

    return { level: maxLevel, reasons };
}

// --------------------------------------------------------------------------
// SYSTEM HELPERS
// --------------------------------------------------------------------------

function getLevelSeverity(level: EscalationLevel): number {
    switch (level) {
        case 'HARD': return 3;
        case 'MEDIUM': return 2;
        case 'SOFT': return 1;
        case 'NONE': return 0;
        default: return 0;
    }
}

/**
 * Main Evaluation Function
 */
export async function evaluateEscalation(analysis: AnalysisResult, context?: SystemContext): Promise<EscalationStatus> {
    const config = computeConfigurationInference(analysis, context);

    // 1. Run Deterministic Rules
    const deterministic = evaluateDeterministicRules(analysis, config);
    let finalLevel = deterministic.level;
    let finalReasons = [...deterministic.reasons];
    let finalRationale = deterministic.reasons.join('\n'); // Default rationale from rules

    // 2. Hybrid Check
    if (finalLevel !== 'HARD') {
        try {
            const { evaluateEscalationWithAI } = await import('../../services/governance/escalationAi');
            const aiResult = await evaluateEscalationWithAI(analysis, config);

            if (aiResult) {
                if (getLevelSeverity(aiResult.level!) > getLevelSeverity(finalLevel)) {
                    finalLevel = aiResult.level!;
                    if (aiResult.reasons) finalReasons.push(...aiResult.reasons);
                    // Append AI rationale clearly
                    if (aiResult.rationale) finalRationale = finalRationale
                        ? `${finalRationale}\n\n[AI Signal]: ${aiResult.rationale}`
                        : aiResult.rationale;
                } else if (aiResult.level === finalLevel && aiResult.level !== 'NONE') {
                    if (aiResult.reasons) finalReasons.push(...aiResult.reasons);
                    if (aiResult.rationale) finalRationale += `\n\n[AI Signal]: ${aiResult.rationale}`;
                }
                config.evaluator_variance = Math.abs(getLevelSeverity(deterministic.level) - getLevelSeverity(aiResult.level!)) / 3;
            }
        } catch (e) {
            // console.warn("Pattern Sentinel skipped due to error:", e);
        }
    }

    return {
        level: finalLevel,
        status: finalLevel === 'NONE' ? 'RESOLVED' : 'DETECTED',
        reasons: finalReasons as any[],
        configuration: config,
        actions: [],
        printed_limitations: [],
        rationale: finalRationale
    };
}
