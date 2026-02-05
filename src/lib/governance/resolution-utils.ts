/**
 * Resolution Drawer Utilities
 * Shared logic for parsing and processing governance rationales.
 */

export interface ParsedRisk {
    type: string;
    mechanism: string;
    evidence?: string;
}

/**
 * Parses dynamic discursive risk lines from a status rationale.
 * Format: Type: Mechanism | Evidence: Text
 */
export const parseRiskRationale = (type: string, rationale?: string | null): ParsedRisk | null => {
    if (!rationale) return null;

    const line = rationale.split('\n').find(l => l.startsWith(`${type}:`));
    if (!line) return null;

    const parts = line.split('| Evidence:');
    return {
        type,
        mechanism: parts[0]?.replace(`${type}:`, '').trim() || '',
        evidence: parts[1]?.trim()
    };
};

/**
 * Extracts AI scout fragments from ambiguity context.
 */
export const extractUncertaintyFragments = (rationale?: string | null) => {
    if (!rationale || !rationale.includes("Ambiguity Context:")) return [];

    const contextPart = rationale.split("Ambiguity Context:")[1];
    return contextPart.split('\n\n').filter(f => f.trim().length > 0).map(fragment => {
        const lines = fragment.split('\n');
        const titleLine = lines.find(l => l.startsWith('Possible '));
        const evidenceLine = lines.find(l => l.startsWith('Evidence: '));

        if (!titleLine) return null;

        const [typePart, mechanism] = titleLine.split(': ');
        return {
            type: typePart.replace('Possible ', ''),
            mechanism: mechanism || '',
            evidence: evidenceLine?.replace('Evidence: ', '').replace(/^"|"$/g, '')
        };
    }).filter(f => f !== null);
};

export const getStatusColor = (level: string) => {
    switch (level) {
        case 'HARD': return 'bg-rose-500 text-white';
        case 'MEDIUM': return 'bg-amber-500 text-white';
        case 'SOFT': return 'bg-indigo-500 text-white';
        case 'NONE': return 'bg-emerald-500 text-white';
        default: return 'bg-slate-500 text-white';
    }
};

export const getStatusText = (level: string) => {
    switch (level) {
        case 'HARD': return 'text-rose-600';
        case 'MEDIUM': return 'text-amber-600';
        case 'SOFT': return 'text-indigo-600';
        case 'NONE': return 'text-emerald-600';
        default: return 'text-slate-600';
    }
};
