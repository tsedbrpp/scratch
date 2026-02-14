import { MEDIATOR_ANALYSIS_PROMPT, MEDIATOR_ANALYSIS_PROMPT_LITE } from '@/lib/prompts/ant-mediators';
// import { generateObject } from '@/lib/utils'; // Assuming utilize existing AI wrapper or similar

import { Relationship, MediatorDimensions } from '@/types/relationship';

interface AnalysisInput {
    sourceActor: string;
    targetActor: string;
    relationshipType: string;
    empiricalTraces: string[];
    documentContext: string;
}

interface AnalysisOutput {
    mediatorScore: number;
    dimensions: MediatorDimensions;
    interpretation: string;
}

export async function analyzeMediatorScore(
    input: AnalysisInput,
    apiKey?: string // Optional override
): Promise<AnalysisOutput> {

    // 1. Construct Prompt (Use Lite for Speed)
    const prompt = MEDIATOR_ANALYSIS_PROMPT_LITE
        .replace('{{source}}', input.sourceActor)
        .replace('{{type}}', input.relationshipType)
        .replace('{{target}}', input.targetActor)
        .replace('{{traces}}', input.empiricalTraces.map(t => `- "${t}"`).join('\n'))
        .replace('{{context}}', input.documentContext.substring(0, 1500)); // [SPEED] Reduced context slightly

    // 2. Call AI Service
    const response = await fetch('/api/relationships/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: prompt,
            mode: 'json',
            model: 'gpt-4o-mini' // [SPEED] Use lighter model for bulk links
        })
    });

    if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const result = await response.json();

    // [FIX] Robust response parsing
    // API returns { analysis: { ... } } where analysis might be the object OR a string
    // If it's the object, it has { mediatorScore, dimensions, ... }

    let aiData = result.analysis;

    // Debug logging
    // console.log("AI Data Received:", aiData);

    if (!aiData) {
        // Fallback if parsing failed but we got something
        throw new Error("No analysis data returned");
    }

    if (typeof aiData === 'string') {
        try {
            aiData = JSON.parse(aiData);
        } catch (e) {
            console.warn("Failed to parse AI string response", e);
            throw new Error("Invalid JSON from AI");
        }
    }

    // 3. Map Response to AnalysisOutput

    let dimensions: MediatorDimensions;
    let avgScore: number;

    if (aiData.scores) {
        // LITE PROTOCOL (Enriched)
        const scores = aiData.scores;

        const getScoreVal = (val: any) => (typeof val === 'object' && val !== null) ? val.score : val;
        const getJustification = (val: any) => (typeof val === 'object' && val !== null) ? val.justification : (aiData.interpretation || "Generated via fast analysis.");

        const sTrans = scores.transformation;
        const sStab = scores.stability;
        const sMult = scores.multiplicity;
        const sGen = scores.generativity;
        const sCont = scores.contestation;

        avgScore = (
            (getScoreVal(sTrans) || 0) +
            (getScoreVal(sStab) || 0) +
            (getScoreVal(sMult) || 0) +
            (getScoreVal(sGen) || 0) +
            (getScoreVal(sCont) || 0)
        ) / 5;

        const mapDim = (val: any) => ({
            score: getScoreVal(val) || 0,
            justification: getJustification(val),
            confidence: (aiData.confidence || 'medium') as 'high' | 'medium' | 'low'
        });

        dimensions = {
            transformation: mapDim(sTrans),
            stability: mapDim(sStab),
            multiplicity: mapDim(sMult),
            generativity: mapDim(sGen),
            contestation: mapDim(sCont)
        };
    } else if (aiData.dimensions) {
        // FULL PROTOCOL (Fallback)
        dimensions = aiData.dimensions;
        avgScore = aiData.mediatorScore || 0;

        // Recalculate average if simple property missing
        if (!aiData.mediatorScore) {
            const vals = Object.values(dimensions).map((d: any) => d.score || 0);
            if (vals.length) avgScore = vals.reduce((a: any, b: any) => a + b, 0) / vals.length;
        }
    } else {
        throw new Error("Invalid AI response: Missing scores or dimensions");
    }

    return {
        mediatorScore: avgScore,
        dimensions: dimensions,
        interpretation: aiData.interpretation || "Analysis complete."
    };
}

// Batch Analysis
export async function analyzeMediatorScoresBatch(
    inputs: AnalysisInput[]
): Promise<AnalysisOutput[]> {
    const BATCH_SIZE = 10; // [SPEED] Increased concurrency
    const results: AnalysisOutput[] = [];

    for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
        const batch = inputs.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (input) => {
            try {
                return await analyzeMediatorScore(input);
            } catch (error) {
                console.error(`Analysis failed for ${input.sourceActor} -> ${input.targetActor}:`, error);
                // Return a fallback "safe" result to keep the pipe moving
                // Return a fallback "safe" result to keep the pipe moving
                const fallbackDimension = (reason: string) => ({ score: 1, reasoning: reason, justification: reason, confidence: 'low' as const });
                return {
                    mediatorScore: 1, // Default to Intermediary (low score)
                    dimensions: {
                        transformation: fallbackDimension("Analysis failed, defaulting to intermediary."),
                        stability: fallbackDimension("Assumed stable due to missing analysis."),
                        multiplicity: fallbackDimension("N/A"),
                        generativity: fallbackDimension("N/A"),
                        contestation: fallbackDimension("N/A")
                    },
                    interpretation: "Analysis failed. Treated as a stable intermediary."
                } as AnalysisOutput;
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}
