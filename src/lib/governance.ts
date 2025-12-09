export interface CompassPoint {
    x: number; // Asymmetrical (-1) vs Participatory (+1)
    y: number; // Extractive (-1) vs Regenerative (+1)
    label: string;
}

export interface DriftVector {
    rhetoric: CompassPoint;
    reality: CompassPoint;
    driftX: number;
    driftY: number;
    magnitude: number;
}

// Keywords for scoring (simplified for this implementation)
// Keywords for scoring (expanded for better matching)
const REGENERATIVE_KEYWORDS = [
    'capacity building', 'community ownership', 'local adaptation', 'public good', 'sustainability', 'empowerment',
    'humanity', 'benefit', 'safety', 'beneficial', 'robust', 'reliable', 'fairness', 'justice', 'equity', 'access', 'open source', 'public', 'thriving', 'ecosystem'
];
const EXTRACTIVE_KEYWORDS = [
    'data mining', 'user acquisition', 'behavioral surplus', 'monetization', 'lock-in', 'surveillance',
    'proprietary', 'closed', 'profit', 'commercial', 'usage policies', 'restrictions', 'license', 'fee', 'paid', 'exclusive', 'competitive', 'capture', 'market share', 'dominance'
];
const PARTICIPATORY_KEYWORDS = [
    'co-design', 'veto power', 'citizen jury', 'public consultation', 'multi-stakeholder', 'consensus',
    'oversight', 'accountability', 'transparency', 'explainability', 'audit', 'feedback', 'redress', 'appeal', 'collaboration', 'partnership', 'agency', 'choice', 'democratic'
];
const ASYMMETRICAL_KEYWORDS = [
    'unilateral', 'compliance requirement', 'terms of service', 'mandatory', 'enforcement', 'top-down',
    'centralized', 'control', 'authority', 'restricted', 'prohibited', 'disallowed', 'monitoring', 'rules', 'opaque', 'black box', 'limited access'
];

function calculateScore(text: string, positiveKeywords: string[], negativeKeywords: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    let count = 0;

    positiveKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            score += 1;
            count++;
        }
    });

    negativeKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            score -= 1;
            count++;
        }
    });

    // Normalize to -1 to 1 range, avoiding division by zero
    // We use a sigmoid-like squash or simple clamping. Here, simple clamping with a scaling factor.
    // Assuming 5 keywords is a "strong" signal.
    return Math.max(-1, Math.min(1, score * 0.2));
}

export function calculateCompassScore(text: string, label: string): CompassPoint {
    const y = calculateScore(text, REGENERATIVE_KEYWORDS, EXTRACTIVE_KEYWORDS);
    const x = calculateScore(text, PARTICIPATORY_KEYWORDS, ASYMMETRICAL_KEYWORDS);
    return { x, y, label };
}

export function calculateDrift(policyText: string, techText: string): DriftVector {
    const rhetoric = calculateCompassScore(policyText, "Rhetoric");
    const reality = calculateCompassScore(techText, "Reality");

    const driftX = reality.x - rhetoric.x;
    const driftY = reality.y - rhetoric.y;
    const magnitude = Math.sqrt(driftX * driftX + driftY * driftY);

    return {
        rhetoric,
        reality,
        driftX,
        driftY,
        magnitude
    };
}
