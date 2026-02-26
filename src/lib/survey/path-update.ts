/**
 * Immutable object update by path.
 * Solves the React generic deep-merge clobbering problem (e.g. updating one cell in a table row wiping out another).
 * 
 * @param obj The root object to clone and mutate safely
 * @param path Dot-notation path (e.g. 'mechanismEval_evidence_collection.effectiveness')
 * @param value The value to set at the terminal path
 * @returns A strictly new object reference with the deep path updated
 */
export function setImmutablePath<T extends Record<string, any>>(obj: T, path: string, value: any): T {
    if (!path) return { ...obj };

    const parts = path.split('.');

    // Base case: shallow clone if no depth
    if (parts.length === 1) {
        return {
            ...obj,
            [parts[0]]: value
        };
    }

    const key = parts[0];
    const rest = parts.slice(1).join('.');

    // Recursive case: clone this level, delegate down
    return {
        ...obj,
        [key]: setImmutablePath(obj[key] || {}, rest, value)
    };
}
