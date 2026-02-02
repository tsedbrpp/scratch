import { AnalysisResult } from "@/types";

export interface VerifiedQuote {
    text: string;
    verified: boolean;
    confidence: number;
    context: string;
    source?: string;
    index?: number;
}

// Normalize text for comparison
function normalize(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Check if a quote exists in source text with fuzzy matching
export function checkFuzzyMatch(quote: string, source: string): { verified: boolean; index: number } {
    const normalizedQuote = normalize(quote);
    const normalizedSource = normalize(source);

    // Direct match
    const directIndex = source.toLowerCase().indexOf(quote.toLowerCase());
    if (directIndex !== -1) {
        return { verified: true, index: directIndex };
    }

    // Fuzzy match (allow minor variations)
    const index = normalizedSource.indexOf(normalizedQuote);
    if (index !== -1) {
        return { verified: true, index };
    }

    return { verified: false, index: -1 };
}

export function verifyQuotes(text: string, analysis: AnalysisResult): VerifiedQuote[] {
    const quotes: VerifiedQuote[] = [];
    const normalizedText = normalize(text);

    // Helper to process a potential quote
    const processQuote = (quoteStr: string, path: string) => {
        const matchResult = checkFuzzyMatch(quoteStr, text); // Use original text for indexing? No, utils uses normalized. 
        // Wait, checkFuzzyMatch internally normalizes. But we need index relative to something.
        // If checkFuzzyMatch returns index in ORIGINAL text (via directIndex), that's great.

        // CORRECTION: My previous edit to checkFuzzyMatch used `source.toLowerCase().indexOf`
        // which returns index in the original string! Perfect.

        const { verified, index } = matchResult;

        // If text is empty/undefined, we can't verify
        const isVerified = !!text && verified;

        quotes.push({
            text: quoteStr,
            verified: isVerified,
            confidence: isVerified ? 1.0 : 0.0,
            context: path,
            index: index !== -1 ? index : undefined
        });
    };

    // ... (rest of traverse)

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
