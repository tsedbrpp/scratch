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
    step_id: string; // Unique ID for this step
    description: string; // Human-readable description
    agent: string; // Who performed this step (system, user, openai)
    timestamp: string;
    inputs: Record<string, any>; // Flexible inputs
    outputs: Record<string, any>; // Flexible outputs
}

/**
 * Complete provenance chain showing how an insight was derived
 */
export interface ProvenanceChain {
    insight_id: string;
    steps: ProvenanceStep[];
    created_at: string;
}
