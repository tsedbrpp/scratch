import { PromptMetadata, ProvenanceChain, ProvenanceStep } from "@/types/provenance";
import crypto from 'crypto';

/**
 * Captures metadata about an LLM API call for transparency
 * This enables the "Show Prompt" feature
 */
export function capturePromptMetadata(
    prompt: string,
    modelVersion: string = "gpt-4-turbo-2024-04-09",
    temperature: number = 0.3,
    maxTokens?: number
): PromptMetadata {
    return {
        prompt_used: prompt,
        model_version: modelVersion,
        temperature,
        max_tokens: maxTokens,
        timestamp: new Date().toISOString()
    };
}

/**
 * Extracts confidence score and justification from LLM response
 * Expects the LLM to include a confidence field in its JSON response
 */
export function extractConfidenceScore(response: unknown): { score: number; justification: string } | null {
    // Type guard: ensure response is an object
    if (typeof response !== 'object' || response === null) {
        return null;
    }

    const resp = response as Record<string, unknown>;

    // Try to find confidence in various possible locations
    if (resp.confidence_score !== undefined) {
        return {
            score: typeof resp.confidence_score === 'number' ? resp.confidence_score : 0,
            justification: typeof resp.confidence_justification === 'string' ? resp.confidence_justification : "No justification provided"
        };
    }

    if (resp.confidence !== undefined) {
        if (typeof resp.confidence === 'object' && resp.confidence !== null) {
            const conf = resp.confidence as Record<string, unknown>;
            return {
                score: typeof conf.score === 'number' ? conf.score : 0,
                justification: typeof conf.justification === 'string' ? conf.justification : "No justification provided"
            };
        }
        return {
            score: typeof resp.confidence === 'number' ? resp.confidence : 0,
            justification: "No justification provided"
        };
    }

    return null;
}

/**
 * Requests a confidence score from the LLM using a second API call
 * This implements the multi-step confidence calculation strategy
 */
export async function calculateConfidenceScore(
    analysisResult: string,
    openaiApiKey: string
): Promise<{ score: number; justification: string }> {
    const confidencePrompt = `You are evaluating the confidence level of an analysis you just performed.

Analysis Result:
${analysisResult}

Rate your confidence in this analysis on a scale of 0-100, where:
- 90-100: Very high confidence, strong evidence, clear conclusions
- 70-89: High confidence, good evidence, minor ambiguities
- 50-69: Moderate confidence, some evidence, notable uncertainties
- 30-49: Low confidence, limited evidence, significant gaps
- 0-29: Very low confidence, weak evidence, highly speculative

Respond in JSON format:
{
  "score": <number 0-100>,
  "justification": "<brief explanation of why you assigned this score>"
}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-2024-04-09',
                messages: [
                    { role: 'system', content: 'You are a critical evaluator of AI analysis quality.' },
                    { role: 'user', content: confidencePrompt }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (content) {
            const parsed = JSON.parse(content);
            return {
                score: parsed.score || 0,
                justification: parsed.justification || "No justification provided"
            };
        }
    } catch (error) {
        console.error("Failed to calculate confidence score:", error);
    }

    // Fallback if confidence calculation fails
    return {
        score: 50,
        justification: "Confidence score could not be calculated"
    };
}

/**
 * Creates a new empty provenance chain
 */
export function createProvenanceChain(): ProvenanceChain {
    return {
        insight_id: crypto.randomUUID(),
        steps: [],
        created_at: new Date().toISOString()
    };
}

/**
 * Adds a step to the provenance chain
 */
export function addProvenanceStep(
    chain: ProvenanceChain,
    description: string,
    inputs: Record<string, any>,
    outputs: Record<string, any>,
    agent: string = "system"
): ProvenanceChain {
    const step: ProvenanceStep = {
        step_id: crypto.randomUUID(),
        description,
        inputs,
        outputs,
        agent,
        timestamp: new Date().toISOString()
    };

    return {
        ...chain,
        steps: [...chain.steps, step]
    };
}
