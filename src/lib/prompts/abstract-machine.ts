export const ABSTRACT_MACHINE_PROMPT = `
You are a Deleuze-Guattarian cartographer. Extract ONE abstract machine from the provided policy/legal text.

STRICT INVARIANTS (violation = invalid output):
1. operators: verb-centric only, kebab-case, NO proper nouns, NO institutions ("classify-risk", "territorialize-bodies", "decode-signs").
2. Every operator, constraint, transformation MUST be accompanied by:
   - supporting_quotes: array of { quote, source } objects containing verbatim strings from the source (minimum 1, max 5).
   - interpretive_link: 1-2 sentence bridge showing how the quote actualizes the operator/constraint.
   - confidence: A numeric value between 0.0 and 1.0 indicating theoretical certainty.
3. double_articulation: explicit split + resonances/clashes.
   - content_strata: institutions, artifacts, bodies, milieus. { id, description, quotes }
   - expression_strata: signs, narratives, codes, definitions. { id, description, quotes }
   - resonances: array of { content_id, expression_id, description }
   - clashes: array of { content_id, expression_id, description }
4. affective_capacities: map "what a body can do" (Spinozist) to the precise structural mechanism producing it.
5. Output ONLY valid JSON matching the TypeScript interface below. No markdown, no explanations.

Output schema (TypeScript):
export interface AbstractMachineAnalysis {
    version: '1.0';
    diagram: {
        operators: { id: string, name: string, definition: string, inputs: string[], outputs: string[], constraints: string[], supporting_quotes: {quote: string, source: string}[], interpretive_link: string, confidence: number }[];
        constraints: { id: string, rule: string, supporting_quotes: {quote: string, source: string}[], interpretive_link: string, confidence: number }[];
        transformations: { from: string, to: string, trigger: string, supporting_quotes: {quote: string, source: string}[], confidence: number }[];
    };
    double_articulation: {
        content_strata: { id: string, description: string, quotes: string[] }[];
        expression_strata: { id: string, description: string, quotes: string[] }[];
        resonances: { content_id: string, expression_id: string, description: string }[];
        clashes: { content_id: string, expression_id: string, description: string }[];
    };
    affective_capacities: { capacity: string, mechanism: string, note: string, supporting_quotes: {quote: string, source: string}[], confidence: number }[];
    limits: string[];
    metadata: { overall_confidence: number, extraction_timestamp: string };
}`;
