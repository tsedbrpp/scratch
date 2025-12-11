/* eslint-disable @typescript-eslint/no-explicit-any */
export function verifyQuotes(text: string, analysis: any): any[] {
    const quotes: any[] = [];
    // Improved normalizer: robust against minor punctuation differences
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w ]/g, '').trim();
    const normalizedText = normalize(text);

    const checkFuzzyMatch = (quote: string, source: string): boolean => {
        const nQuote = normalize(quote);
        // 1. Direct match attempt (Standard)
        if (source.includes(nQuote)) return true;

        // 2. Super-Normalize Fallback (Aggressive: "risk-based" == "riskbased")
        // Strips ALL spaces and punctuation, keeping only alphanumeric.
        const superNormalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const sQuote = superNormalize(quote);
        const sSource = superNormalize(text); // Use original text for super-source to avoid double-process
        if (sSource.includes(sQuote)) return true;

        // 3. Ellipsis handling: "Start of quote... end of quote"
        const parts = quote.split(/\.\.\.|…/);
        if (parts.length > 1) {
            let lastIndex = 0;
            return parts.every(part => {
                if (!part || part.length < 3) return true;
                // Try standard match first
                const nPart = normalize(part);
                const index = source.indexOf(nPart, lastIndex);
                if (index !== -1) {
                    lastIndex = index + nPart.length;
                    return true;
                }
                // Try super-match for part
                const sPart = superNormalize(part);
                const sSourcePart = superNormalize(text); // Ideally we'd need to track index in super-text...
                // Complex to track indices across normalizations. 
                // Simplified: just check if super-part exists?. No, order matters.
                // Fallback: If standard part fails, we might be out of luck for ellipsis + punctuation diffs.
                // But let's at least check "super" inclusion for the whole part regardless of order? No, too risky.
                return false;
            });
        }
        return false;
    };

    const traverse = (obj: any, path: string) => {
        if (!obj) return;

        // Check strings for embedded quotes (heuristic: "..." > 20 chars)
        if (typeof obj === 'string') {
            const match = obj.match(/"([^"]{20,})"/);
            if (match) {
                const quoteContent = match[1];
                const verified = checkFuzzyMatch(quoteContent, normalizedText);
                if (verified || !normalizedText) {
                    quotes.push({ text: quoteContent, verified: !!normalizedText && verified, confidence: (!!normalizedText && verified) ? 1.0 : 0.0, context: path });
                }
            }
        } else if (typeof obj === 'object') {
            // Check explicit quote fields
            if ('quote' in obj && typeof obj.quote === 'string') {
                const verified = checkFuzzyMatch(obj.quote, normalizedText);
                quotes.push({ text: obj.quote, verified: !!normalizedText && verified, confidence: (!!normalizedText && verified) ? 1.0 : 0.0, context: path + ".quote" });
            }
            if ('evidence_quote' in obj && typeof obj.evidence_quote === 'string') {
                const verified = checkFuzzyMatch(obj.evidence_quote, normalizedText);
                quotes.push({ text: obj.evidence_quote, verified: !!normalizedText && verified, confidence: (!!normalizedText && verified) ? 1.0 : 0.0, context: path + ".evidence_quote" });
            }

            // Recurse
            for (const key in obj) {
                if (key !== 'quote' && key !== 'evidence_quote' && key !== 'verified_quotes') {
                    traverse(obj[key], path ? `${path}.${key}` : key);
                }
            }
        }
    };

    traverse(analysis, 'analysis');
    return quotes;
}
