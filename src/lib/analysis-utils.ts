import { AnalysisResult } from "@/types";

export interface VerifiedQuote {
    text: string;
    verified: boolean;
    confidence: number;
    context: string;
}

// Improved normalizer: robust against minor punctuation differences
export const normalize = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w ]/g, '').trim();

// Super-Normalize Fallback (Aggressive: "risk-based" == "riskbased")
// Strips ALL spaces and punctuation, keeping only alphanumeric.
export const superNormalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const checkFuzzyMatch = (quote: string, source: string): boolean => {
    const nQuote = normalize(quote);
    // 1. Direct match attempt (Standard)
    if (source.includes(nQuote)) return true;

    // 2. Super-Normalize Fallback
    const sQuote = superNormalize(quote);
    const sSource = superNormalize(source);
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
            // Fallback: If standard part fails, we might be out of luck for ellipsis + punctuation diffs.
            return false;
        });
    }
    return false;
};

export function verifyQuotes(text: string, analysis: AnalysisResult): VerifiedQuote[] {
    const quotes: VerifiedQuote[] = [];
    const normalizedText = normalize(text);

    // Helper to process a potential quote
    const processQuote = (quoteStr: string, path: string) => {
        const verified = checkFuzzyMatch(quoteStr, normalizedText);
        // If text is empty/undefined, we can't verify, so verified is false.
        const isVerified = !!normalizedText && verified;
        quotes.push({
            text: quoteStr,
            verified: isVerified,
            confidence: isVerified ? 1.0 : 0.0,
            context: path
        });
    };

    const traverse = (obj: unknown, path: string) => {
        if (!obj) return;

        if (typeof obj === 'string') {
            // Check strings for embedded quotes (heuristic: "..." > 20 chars)
            const match = obj.match(/"([^"]{20,})"/);
            if (match) {
                const quoteContent = match[1];
                processQuote(quoteContent, path);
            }
        } else if (typeof obj === 'object') {
            const record = obj as Record<string, unknown>;

            // Check explicit quote fields
            if ('quote' in record && typeof record.quote === 'string') {
                processQuote(record.quote, path + ".quote");
            }
            if ('evidence_quote' in record && typeof record.evidence_quote === 'string') {
                processQuote(record.evidence_quote, path + ".evidence_quote");
            }

            // Recurse
            for (const key in record) {
                if (key !== 'quote' && key !== 'evidence_quote' && key !== 'verified_quotes') {
                    traverse(record[key], path ? `${path}.${key}` : key);
                }
            }
        }
    };

    traverse(analysis, 'analysis');
    return quotes;
}

// Helper function to safely parse JSON from AI responses
export function safeJSONParse<T>(text: string, fallback: T): T {
    try {
        // Remove markdown code blocks if present
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```\n?/g, '');
        }
        cleaned = cleaned.trim();

        return JSON.parse(cleaned);
    } catch (error) {
        console.error('JSON parse error:', error, 'Text:', text);
        return fallback;
    }
}
