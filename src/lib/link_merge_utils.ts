import { EcosystemActor } from "@/types/ecosystem";
import { Relationship } from "@/types/relationship";

/**
 * Advanced normalization for actor names to ensure reliable matching.
 * Collapses spaces, removes trailing punctuation, and strips legal suffixes.
 */
export function normalizeActorName(name: string): string {
    if (!name) return "";
    return name
        .trim()
        .toLowerCase()
        .replace(/\(absent\)/gi, '')              // [NEW] Strip (Absent) suffix
        .replace(/\s+/g, ' ')                     // Normalize internal spaces
        .replace(/[.,;]$/g, '')                   // Remove trailing punctuation
        .replace(/\b(inc|llc|ltd|corp|co|gmbh|sa|s\.a|ltda)\b/gi, '') // Strip common legal suffixes
        .replace(/[^a-z0-9 ]/gi, '')              // Remove special chars
        .trim();                                  // Final trim after suffix removal
}

/**
 * Simple Levenshtein distance calculation for fuzzy matching fallback.
 * Used with a low threshold to prevent performance bottlenecks.
 */
export function levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
}
/**
 * Checks if two actor names are a match using exact normalization, word overlap, or limited fuzzy fallback.
 */
export function isActorMatch(name1: string, name2: string, threshold = 2): boolean {
    const norm1 = normalizeActorName(name1);
    const norm2 = normalizeActorName(name2);

    if (!norm1 || !norm2) return false;
    if (norm1 === norm2) return true;

    // [NEW] Word overlap match - extremely effective for "Brazilian Congress" vs "National Congress of Brazil"
    const words1 = new Set(norm1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(norm2.split(' ').filter(w => w.length > 2));

    if (words1.size > 0 && words2.size > 0) {
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        // If they share at least 2 significant words, or 100% of the shorter one's words
        if (intersection.size >= 2 || (intersection.size === Math.min(words1.size, words2.size) && intersection.size > 0)) {
            return true;
        }
    }

    // Substring match
    if (norm1.length > 8 && norm2.length > 8) {
        if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    }

    // Fuzzy fallback
    if (norm1.length > 5 && norm2.length > 5 && Math.abs(norm1.length - norm2.length) <= threshold) {
        return levenshteinDistance(norm1, norm2) <= threshold;
    }

    return false;
}

/**
 * Merge heuristic links with AI-discovered potential connections.
 * Formal AI data (potentialConnections) takes precedence over heuristic labels/descriptions.
 */
export function mergeLinks(
    heuristicLinks: any[],
    actors: EcosystemActor[],
    nameToIdMap: Map<string, string>
): any[] {
    // Ensure heuristic links are using the 'type' property (normalized from 'label')
    const normalizedHeuristic = heuristicLinks.map(hl => ({
        ...hl,
        type: hl.type || hl.label || "Relates To",
        label: hl.label || hl.type || "Relates To" // [NEW] Ensure both are set
    }));

    const mergedLinks = [...normalizedHeuristic];

    // 1. Identify "Formal" links from ghost node potentialConnections
    const formalLinks: any[] = [];

    // Combine potential_connections and potentialConnections to handle various AI output formats
    actors.forEach(actor => {
        const connData = (actor as any).potentialConnections || (actor as any).potential_connections || [];

        connData.forEach((conn: any) => {
            const sourceId = actor.id;
            const targetName = conn.targetActor || conn.target_actor;

            // Resolve target ID using name-to-ID map with normalization
            const targetId = findIdByName(targetName, nameToIdMap);

            if (targetId) {
                formalLinks.push({
                    source: sourceId,
                    target: targetId,
                    type: conn.relationshipType || conn.relationship_type || "Relates To",
                    description: conn.evidence || conn.quote || "AI-discovered association.",
                    analysis: {
                        mediatorScore: 0.65,
                        empiricalTraces: (conn.evidence || conn.quote) ? [conn.evidence || conn.quote] : [],
                        metadata: {
                            source: "AI Forensic Analysis",
                            confidence: "High",
                            aiModel: "GPT-4o Deep Forensic"
                        },
                        classification: "Mediator",
                        dimensions: {
                            transformation: { score: 0.75, justification: "AI inferred translation of marginalized interests." },
                            stability: { score: 0.4, justification: "Absence indicates low institutional stability for this link." },
                            multiplicity: { score: 0.6, justification: "Potentially multiple points of contact identified." },
                            generativity: { score: 0.5, justification: "Inclusion would create new network dynamics." },
                            contestation: { score: 0.8, justification: "High potential for conflict with dominant discourses." }
                        }
                    }
                });
            }
        });
    });

    // 2. Reconciliation: AI Wins on Overlap
    const getLinkKey = (s: string, t: string) => [s, t].sort().join('-|');

    const formalMap = new Map<string, any>();
    formalLinks.forEach(l => {
        const key = getLinkKey(l.source, l.target);
        formalMap.set(key, l);
    });

    // Update heuristic links if a formal counterpart exists
    const finalLinks = mergedLinks.map(hl => {
        const sId = typeof hl.source === 'string' ? hl.source : (hl.source as any).id;
        const tId = typeof hl.target === 'string' ? hl.target : (hl.target as any).id;

        const key = getLinkKey(sId, tId);
        if (formalMap.has(key)) {
            const formal = formalMap.get(key);
            formalMap.delete(key); // Mark as used
            return {
                ...hl,
                type: formal.type,
                label: formal.type, // [NEW] Ensure label is also updated
                description: formal.description,
                analysis: formal.analysis,
                nature: "mediator"
            };
        }
        return hl;
    });

    // Add remaining formal links
    formalMap.forEach(fl => {
        finalLinks.push(fl);
    });

    return finalLinks;
}

/**
 * Helper to find an actor ID by its name using robust normalization.
 */
function findIdByName(name: string, nameToIdMap: Map<string, string>): string | null {
    const normSearch = normalizeActorName(name);
    if (nameToIdMap.has(normSearch)) return nameToIdMap.get(normSearch)!;

    // Fuzzy fallback
    for (const [normName, id] of Array.from(nameToIdMap.entries())) {
        if (isActorMatch(normName, normSearch)) return id;
    }

    return null;
}
