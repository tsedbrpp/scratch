/**
 * normalizeCounterfactual.ts
 * 
 * Migration layer: normalizes v1/v2 cached counterfactual objects into v3 shape.
 * Safe defaults for missing fields; marks confidence.unknown when inferring.
 */

import type { CounterfactualResult } from './types';

/**
 * Typed mechanism step (v3).
 */
interface TypedMechanismStep {
    kind: string;
    step: string;
}

/**
 * Normalize a single counterfactual result into v3 shape.
 * - v1: has counterfactualImpact, territorialization, riskRedistribution, reasoning
 * - v2: has chokepoint.bindingDuty, mechanismChain as string[], confidence without grounded/inferred/unknown
 * - v3: has role semantics, typed chain, enforcement ladder, confidence granularity
 */
export function normalizeCounterfactualResult(cf: CounterfactualResult): CounterfactualResult {
    const result = { ...cf };

    // --- Chokepoint role semantics ---
    if (result.chokepoint) {
        const cp = { ...result.chokepoint };

        // If v2 bindingDuty exists but v3 fields missing, infer defaults
        if (cp.bindingDuty && !cp.obligatedActor) {
            cp.standingActor = cp.standingActor || result.actorId?.replace(/-/g, ' ') || 'affected group';
            cp.obligatedActor = cp.obligatedActor || 'competent authority';
            cp.obligatedActorType = cp.obligatedActorType || 'Authority';
            cp.obligationType = cp.obligationType || 'Investigate';
        }
        result.chokepoint = cp;
    }

    // --- Mechanism chain: normalize v2 string[] to typed steps ---
    if (result.mechanismChain && result.mechanismChain.length > 0) {
        const first = result.mechanismChain[0];
        if (typeof first === 'string') {
            // v2 plain strings → v3 typed steps with best-effort kind assignment
            const plainSteps = result.mechanismChain as string[];
            result.mechanismChain = plainSteps.map((step, i) => inferMechanismKind(step, i, plainSteps.length));
        }
    }

    // --- Confidence granularity ---
    if (result.confidence) {
        const conf = { ...result.confidence };
        if (!conf.grounded && !conf.inferred && !conf.unknown) {
            // v2 → v3: extract from caveat if available
            conf.grounded = conf.grounded || undefined;
            conf.inferred = conf.inferred || (conf.caveat ? conf.caveat : undefined);
            conf.unknown = conf.unknown || 'Migration from v2 — grounded/inferred/unknown not assessed';
        }
        result.confidence = conf;
    }

    // --- Estimated impact: no enforcement ladder in v1/v2, leave as-is ---

    return result;
}

/**
 * Normalize an array of counterfactual results.
 */
export function normalizeCounterfactuals(cfs: CounterfactualResult[]): CounterfactualResult[] {
    return cfs.map(normalizeCounterfactualResult);
}

/**
 * Infer mechanism step kind from position and content heuristics.
 */
function inferMechanismKind(step: string, index: number, total: number): TypedMechanismStep {
    const lower = step.toLowerCase();

    // Position-based + keyword heuristics
    if (index === 0 || lower.includes('document') || lower.includes('evidence') || lower.includes('record')) {
        return { kind: 'EvidenceCollection', step };
    }
    if (lower.includes('aggregate') || lower.includes('compile') || lower.includes('file') || lower.includes('complaint')) {
        return { kind: 'Aggregation', step };
    }
    if (lower.includes('threshold') || lower.includes('eligible') || lower.includes('accept') || lower.includes('admissib')) {
        return { kind: 'Admissibility', step };
    }
    if (lower.includes('review') || lower.includes('initiate') || lower.includes('open') || lower.includes('trigger')) {
        return { kind: 'ReviewInitiation', step };
    }
    if (lower.includes('notify') || lower.includes('notice') || lower.includes('inform')) {
        return { kind: 'Notice', step };
    }
    if (lower.includes('respond') || lower.includes('mitigat') || lower.includes('due process') || lower.includes('propose')) {
        return { kind: 'ResponseDueProcess', step };
    }
    if (lower.includes('enforce') || lower.includes('order') || lower.includes('correct') || lower.includes('sanction') || lower.includes('recall') || lower.includes('suspend')) {
        return { kind: 'RemedyEnforcement', step };
    }
    if (index === total - 1 || lower.includes('deter') || lower.includes('pre-empt') || lower.includes('preempt') || lower.includes('anticipat') || lower.includes('comply')) {
        return { kind: 'Deterrence', step };
    }

    // Default based on position
    if (index < total / 3) return { kind: 'EvidenceCollection', step };
    if (index < (2 * total) / 3) return { kind: 'ReviewInitiation', step };
    return { kind: 'RemedyEnforcement', step };
}
