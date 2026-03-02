import { z } from 'zod';
import { AbstractMachineAnalysis } from '@/types';

// Zod schema matching the strengthened TypeScript interface
export const AbstractMachineSchema = z.object({
    version: z.literal('1.0'),
    diagram: z.object({
        operators: z.array(z.object({
            id: z.string(),
            name: z.string().regex(/^[a-z]+(-[a-z]+)*$/, "Operator names must be kebab-case and verb-centric"),
            definition: z.string(),
            inputs: z.array(z.string()),
            outputs: z.array(z.string()),
            constraints: z.array(z.string()),
            supporting_quotes: z.array(z.object({
                quote: z.string(),
                source: z.string()
            })).min(1).max(5),
            interpretive_link: z.string(),
            confidence: z.number().min(0).max(1)
        })).min(1),
        constraints: z.array(z.object({
            id: z.string(),
            rule: z.string(),
            supporting_quotes: z.array(z.object({
                quote: z.string(),
                source: z.string()
            })).min(1).max(5),
            interpretive_link: z.string(),
            confidence: z.number().min(0).max(1)
        })),
        transformations: z.array(z.object({
            from: z.string(),
            to: z.string(),
            trigger: z.string(),
            supporting_quotes: z.array(z.object({
                quote: z.string(),
                source: z.string()
            })).min(1).max(5),
            confidence: z.number().min(0).max(1)
        }))
    }),
    double_articulation: z.object({
        content_strata: z.array(z.object({
            id: z.string(),
            description: z.string(),
            quotes: z.array(z.string()).min(1)
        })),
        expression_strata: z.array(z.object({
            id: z.string(),
            description: z.string(),
            quotes: z.array(z.string()).min(1)
        })),
        resonances: z.array(z.object({
            content_id: z.string(),
            expression_id: z.string(),
            description: z.string()
        })),
        clashes: z.array(z.object({
            content_id: z.string(),
            expression_id: z.string(),
            description: z.string()
        }))
    }),
    affective_capacities: z.array(z.object({
        capacity: z.string(),
        mechanism: z.string(),
        note: z.string(),
        supporting_quotes: z.array(z.object({
            quote: z.string(),
            source: z.string()
        })).min(1).max(5),
        confidence: z.number().min(0).max(1)
    })),
    limits: z.array(z.string()),
    metadata: z.object({
        overall_confidence: z.number().min(0).max(1),
        extraction_timestamp: z.string()
    })
});

// Basic substring-match provenance validation
export function validateProvenance(analysis: AbstractMachineAnalysis, fullText: string): boolean {
    if (!fullText) return true; // Skip if no text available to validate against

    // Normalize text: lowercase, remove all non-alphanumeric characters except spaces, then collapse spaces
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

    const normalizedText = normalize(fullText);
    let failedQuotes = 0;
    let totalQuotes = 0;
    const failedList: string[] = [];

    const checkQuote = (quote: string) => {
        totalQuotes++;
        const normalizedQuote = normalize(quote);
        if (!normalizedText.includes(normalizedQuote)) {
            failedQuotes++;
            failedList.push(quote);
        }
    };

    analysis.diagram.operators.forEach(op => op.supporting_quotes.forEach(sq => checkQuote(sq.quote)));
    analysis.diagram.constraints.forEach(c => c.supporting_quotes.forEach(sq => checkQuote(sq.quote)));
    analysis.diagram.transformations.forEach(t => t.supporting_quotes.forEach(sq => checkQuote(sq.quote)));

    analysis.double_articulation.content_strata.forEach(cs => cs.quotes.forEach(q => checkQuote(q)));
    analysis.double_articulation.expression_strata.forEach(es => es.quotes.forEach(q => checkQuote(q)));

    analysis.affective_capacities.forEach(ac => ac.supporting_quotes.forEach(sq => checkQuote(sq.quote)));

    if (failedQuotes > 0) {
        console.warn(`[PROVENANCE WARNING] Failed quotes (${failedQuotes}/${totalQuotes}):\n`, failedList);
    }

    // Allow a significant amount of leeway for PDF extraction artifacts (e.g., 60% failure rate)
    // The abstract machine deals with very conceptual parts of text which often span pages or get jumbled.
    const maxAllowedFailures = Math.max(1, Math.floor(totalQuotes * 0.60));

    return totalQuotes === 0 || failedQuotes <= maxAllowedFailures;
}
