export function sanitizeText(text: string): string {
    if (!text) return "";
    if (typeof text !== 'string') return String(text); // Defensive: handle non-string inputs

    let clean = text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\u2026/g, "...")
        .replace(/[\u00A0\u200B\u202F\u205F]/g, " ");

    clean = clean
        .replace(/\*\*/g, "")
        .replace(/^#+\s/gm, "")
        .replace(/`/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\*/g, "");

    clean = clean.replace(/^- /gm, "• ");

    return clean;
}
