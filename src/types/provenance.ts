/**
 * Provenance and Transparency Types
 * 
 * These types support the "glass box" AI transparency features:
 * - Prompt metadata tracking
 * - Confidence scores with justifications
 * - Complete audit trails of AI reasoning
 */

/**
 * Metadata about the prompt used to generate an analysis
 */
export interface PromptMetadata {
    prompt_used: string;
    model_version: string;
    temperature: number;
    max_tokens?: number;
    timestamp: string;
}

/**
 * Confidence score with AI's self-assessment justification
 */
export interface ConfidenceScore {
    score: number; // 0-100
    justification: string; // AI's reasoning for the confidence level
    calculated_at: string;
}

/**
 * A single step in the provenance chain
 */
export interface ProvenanceStep {
    type: 'source_extraction' | 'prompt_generation' | 'ai_response' | 'formatting';
    timestamp: string;
    data: {
        input: string;
        output: string;
        raw_json?: any; // Store unformatted LLM response
        transformation_logic?: string; // Code/rules used for formatting
    };
}

/**
 * Complete provenance chain showing how an insight was derived
 */
export interface ProvenanceChain {
    insight_id: string;
    steps: ProvenanceStep[];
    created_at: string;
}
