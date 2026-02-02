import { BlindSpot, BlindSpotBasic, BlindSpotEnhanced, BlindSpotInteractive } from '@/types';

/**
 * Type Guards
 */

export function isBlindSpotString(spot: BlindSpot): spot is string {
    return typeof spot === 'string';
}

export function isBlindSpotBasic(spot: BlindSpot): spot is BlindSpotBasic {
    return typeof spot === 'object' && 'id' in spot && 'title' in spot && !('description' in spot);
}

export function isBlindSpotEnhanced(spot: BlindSpot): spot is BlindSpotEnhanced {
    return typeof spot === 'object' && 'description' in spot && !('status' in spot);
}

export function isBlindSpotInteractive(spot: BlindSpot): spot is BlindSpotInteractive {
    return typeof spot === 'object' && 'status' in spot;
}

/**
 * Tier Detection
 */

export function detectBlindSpotTier(spot: BlindSpot): 0 | 1 | 2 | 3 {
    if (isBlindSpotString(spot)) return 0;
    if (isBlindSpotInteractive(spot)) return 3;
    if (isBlindSpotEnhanced(spot)) return 2;
    if (isBlindSpotBasic(spot)) return 1;
    return 0;
}

export function detectOverallTier(spots: BlindSpot[]): 0 | 1 | 2 | 3 {
    if (spots.length === 0) return 0;
    const tiers = spots.map(detectBlindSpotTier);
    return Math.max(...tiers) as 0 | 1 | 2 | 3;
}

/**
 * Validation and Inference
 */

const HIGH_SEVERITY_KEYWORDS = [
    'excludes', 'ignores', 'colonial', 'reproduces', 'overlooks major',
    'silences', 'erases', 'marginalizes', 'extractive', 'asymmetric power'
];

const LOW_SEVERITY_KEYWORDS = [
    'minor', 'edge case', 'tangential', 'peripheral', 'secondary'
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    epistemic: ['assumes', 'presumes', 'knowledge', 'literacy', 'expertise', 'understanding'],
    power: ['enforcement', 'authority', 'control', 'sovereignty', 'jurisdiction', 'capacity'],
    materiality: ['infrastructure', 'resources', 'material', 'physical', 'environmental'],
    temporality: ['urgency', 'timeline', 'future', 'legacy', 'maintenance'],
    coloniality: ['colonial', 'center', 'periphery', 'global south', 'extraction', 'imposition']
};

export function inferSeverity(spot: BlindSpot): 'low' | 'medium' | 'high' {
    const text = (typeof spot === 'string' ? spot : (spot.title + ' ' + (spot as any).description || '')).toLowerCase();

    if (HIGH_SEVERITY_KEYWORDS.some(kw => text.includes(kw))) return 'high';
    if (LOW_SEVERITY_KEYWORDS.some(kw => text.includes(kw))) return 'low';
    return 'medium';
}

export function inferCategory(spot: BlindSpot): BlindSpotBasic['category'] {
    const text = (typeof spot === 'string' ? spot : spot.title).toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => text.includes(kw))) {
            return category as BlindSpotBasic['category'];
        }
    }

    return 'epistemic'; // Default fallback
}

/**
 * Validation
 */

export function validateBlindSpot(spot: any): BlindSpot {
    // If it's a string, return as-is (Tier 0)
    if (typeof spot === 'string') {
        return spot;
    }

    // Ensure required fields
    if (!spot.id) {
        spot.id = generateBlindSpotId();
    }

    if (!spot.title) {
        spot.title = 'Unnamed blind spot';
    }

    // Validate severity
    if (spot.severity && !['low', 'medium', 'high'].includes(spot.severity)) {
        spot.severity = inferSeverity(spot);
    }

    // Validate category
    if (spot.category && !['epistemic', 'power', 'materiality', 'temporality', 'coloniality'].includes(spot.category)) {
        spot.category = inferCategory(spot);
    }

    // Truncate long evidence quotes
    if (spot.evidence?.quote && spot.evidence.quote.length > 200) {
        spot.evidence.quote = spot.evidence.quote.slice(0, 197) + '...';
    }

    // Limit mitigations to 3
    if (spot.suggested_mitigations && spot.suggested_mitigations.length > 3) {
        spot.suggested_mitigations = spot.suggested_mitigations.slice(0, 3);
    }

    return spot as BlindSpot;
}

/**
 * Migration
 */

export function migrateBlindSpot(spot: string): BlindSpotBasic {
    return {
        id: generateBlindSpotId(),
        title: spot,
        severity: inferSeverity(spot),
        category: inferCategory(spot)
    };
}

export function migrateLegacyBlindSpots(spots: string[]): BlindSpotBasic[] {
    return spots.map(migrateBlindSpot);
}

/**
 * Coverage Score Calculation
 */

export function calculateEpistemicCoverageScore(spots: BlindSpot[]): number {
    if (spots.length === 0) return 100;

    const severityWeights = {
        high: 15,
        medium: 8,
        low: 3
    };

    let totalPenalty = 0;

    for (const spot of spots) {
        const severity = typeof spot === 'string'
            ? inferSeverity(spot)
            : spot.severity || inferSeverity(spot);

        totalPenalty += severityWeights[severity];
    }

    return Math.max(0, 100 - totalPenalty);
}

/**
 * Utilities
 */

export function generateBlindSpotId(): string {
    return `bs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getBlindSpotTitle(spot: BlindSpot): string {
    return typeof spot === 'string' ? spot : spot.title;
}

export function getBlindSpotSeverity(spot: BlindSpot): 'low' | 'medium' | 'high' {
    if (typeof spot === 'string') return inferSeverity(spot);
    return spot.severity || inferSeverity(spot);
}

export function getBlindSpotCategory(spot: BlindSpot): BlindSpotBasic['category'] {
    if (typeof spot === 'string') return inferCategory(spot);
    return spot.category || inferCategory(spot);
}

/**
 * Grouping and Filtering
 */

export function groupBlindSpotsByCategory(spots: BlindSpot[]): Record<string, BlindSpot[]> {
    const groups: Record<string, BlindSpot[]> = {
        epistemic: [],
        power: [],
        materiality: [],
        temporality: [],
        coloniality: [],
        uncategorized: []
    };

    for (const spot of spots) {
        const category = getBlindSpotCategory(spot) || 'uncategorized';
        groups[category].push(spot);
    }

    return groups;
}

export function groupBlindSpotsBySeverity(spots: BlindSpot[]): Record<string, BlindSpot[]> {
    const groups: Record<string, BlindSpot[]> = {
        high: [],
        medium: [],
        low: []
    };

    for (const spot of spots) {
        const severity = getBlindSpotSeverity(spot);
        groups[severity].push(spot);
    }

    return groups;
}

export function sortBlindSpotsBySeverity(spots: BlindSpot[]): BlindSpot[] {
    const severityOrder = { high: 0, medium: 1, low: 2 };

    return [...spots].sort((a, b) => {
        const severityA = getBlindSpotSeverity(a);
        const severityB = getBlindSpotSeverity(b);
        return severityOrder[severityA] - severityOrder[severityB];
    });
}
