import { CandidateActor, ExclusionMatch } from './types';
import { PRE_NEGATION_TRIGGERS, POST_NEGATION_TRIGGERS, PSEUDO_NEGATION, SCOPE_TERMINATORS, NEGATION_WINDOW_CHARS } from './constants';

export function detectExplicitExclusions(
    text: string,
    candidates: CandidateActor[],
): Map<string, ExclusionMatch[]> {
    const results = new Map<string, ExclusionMatch[]>();
    // Split into sentences for scope containment
    const sentences = text.split(/(?<=[.;!?\n])\s+/);

    for (const sentence of sentences) {
        // Skip sentences that match pseudo-negation patterns (false positives)
        const sentenceLower = sentence.toLowerCase();
        const isPseudoNegation = PSEUDO_NEGATION.some(p => {
            const regex = new RegExp(p.source, p.flags);
            return regex.test(sentenceLower);
        });
        if (isPseudoNegation) continue;

        // --- Pre-negation triggers (original logic) ---
        for (const pattern of PRE_NEGATION_TRIGGERS) {
            // Create fresh regex per sentence to reset lastIndex
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            while ((match = regex.exec(sentence)) !== null) {
                // Extract scope: text after trigger, up to terminator or window limit
                const afterTrigger = sentence.slice(match.index + match[0].length);
                const scopeEnd = afterTrigger.search(SCOPE_TERMINATORS);
                const scope = afterTrigger
                    .slice(0, scopeEnd > 0 ? scopeEnd : NEGATION_WINDOW_CHARS)
                    .toLowerCase();
                const triggerText = match[0].trim();

                // Check each candidate against the scope
                for (const candidate of candidates) {
                    const nameLower = candidate.name.toLowerCase();
                    const exclusionEntry: ExclusionMatch = {
                        trigger: triggerText,
                        matchedText: scope.trim(),
                        confidence: 'weak',
                    };

                    // Strong match: candidate name appears in scope
                    if (scope.includes(nameLower)) {
                        exclusionEntry.confidence = 'strong';
                        const existing = results.get(candidate.name) || [];
                        existing.push(exclusionEntry);
                        results.set(candidate.name, existing);
                        continue;
                    }

                    // Weak match: ≥2 keywords appear in scope
                    const kwHits = candidate.keywords.filter(
                        kw => scope.includes(kw.toLowerCase())
                    ).length;
                    if (kwHits >= 2) {
                        const existing = results.get(candidate.name) || [];
                        existing.push(exclusionEntry);
                        results.set(candidate.name, existing);
                    }
                }
            }
        }

        // --- Post-negation triggers (actor appears BEFORE the negation cue) ---
        for (const candidate of candidates) {
            const nameIdx = sentenceLower.indexOf(candidate.name.toLowerCase());
            if (nameIdx < 0) continue;
            // Only look at text AFTER the actor name
            const afterName = sentence.slice(nameIdx + candidate.name.length);
            for (const postPattern of POST_NEGATION_TRIGGERS) {
                const postRegex = new RegExp(postPattern.source, postPattern.flags);
                if (postRegex.test(afterName)) {
                    const existing = results.get(candidate.name) || [];
                    existing.push({
                        trigger: afterName.match(new RegExp(postPattern.source, postPattern.flags))![0].trim(),
                        matchedText: afterName.slice(0, NEGATION_WINDOW_CHARS).trim(),
                        confidence: 'strong', // post-pattern with explicit name is strong
                    });
                    results.set(candidate.name, existing);
                    break; // one post-trigger per sentence per candidate is enough
                }
            }
        }
    }

    return results;
}

// ===================================================================
// GNDP v1.1 — Subsumption Override Detection
// ===================================================================

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GNDP v1.1: Check if a candidate flagged as "subsumed" actually has
 * dedicated provisions elsewhere in the text. If so, flag for manual
 * review rather than automatic invalidation.
 */
export function detectSubsumptionOverrides(
    text: string,
    candidates: CandidateActor[],
): Map<string, { hasDedicatedProvision: boolean; matchedText: string; action: 'manual_review_required' }> {
    const results = new Map<string, { hasDedicatedProvision: boolean; matchedText: string; action: 'manual_review_required' }>();
    const textLower = text.toLowerCase();

    for (const candidate of candidates) {
        if (candidate.ghostPathway !== 'subsumption') continue;

        const terms = [candidate.name, ...(candidate.aliases ?? [])];
        let found = false;

        for (const term of terms) {
            if (found) break;
            const escaped = escapeRegex(term.toLowerCase());

            const patterns = [
                new RegExp(`\\b${escaped}\\b.{0,80}\\b(shall|must|entitled|right|consulted|represented|complaint|remedy)\\b`, 'gi'),
                new RegExp(`\\b(rights?|protection|obligations?|consultation|representation)\\b.{0,80}\\b${escaped}\\b`, 'gi'),
            ];

            for (const pattern of patterns) {
                const match = pattern.exec(textLower);
                if (match) {
                    results.set(candidate.name, {
                        hasDedicatedProvision: true,
                        matchedText: text.slice(
                            Math.max(0, match.index - 50),
                            match.index + match[0].length + 50
                        ),
                        action: 'manual_review_required',
                    });
                    found = true;
                    break;
                }
            }
        }
    }
    return results;
}
