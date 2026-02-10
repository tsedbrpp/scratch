/* eslint-disable @typescript-eslint/no-explicit-any */
import { computeDeLandaMetrics } from "@/lib/delanda-service";

export interface AnalysisParserResult {
    analysis: any;
    error?: string;
}

/**
 * Robustly extracts JSON string from a potentially noisy LLM response.
 * Handles markdown code blocks, prefixes, and surrounding text.
 */
function cleanJsonString(responseText: string): string {
    if (!responseText || !responseText.trim()) {
        throw new Error("Empty response text received from API");
    }

    let cleaned = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```/g, '')
        .replace(/^JSON:/i, '') // Handle "JSON:" prefix
        .trim();

    // Find the first '{' or '[' to handle potential preamble text
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    let start = -1;
    let end = -1;

    // Determine if it's an object or array and find start/end
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = cleaned.lastIndexOf('}');
    } else if (firstBracket !== -1) {
        start = firstBracket;
        end = cleaned.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
    }

    return cleaned;
}

/**
 * Fallback generator for when JSON parsing fails completely.
 */
function generateFallback(mode: string, responseText: string): any {
    console.error(`[ANALYSIS ERROR] JSON Parse failed for mode: ${mode}`);
    console.log("[ANALYSIS ERROR] Failed text:", responseText);

    const fallbacks: Record<string, any> = {
        resistance: {
            strategy_detected: "Unstructured Analysis",
            evidence_quote: "See raw output",
            interpretation: responseText.substring(0, 300),
            confidence: "Low",
            raw_response: responseText
        },
        comparison: {
            risk: { convergence: "Failed to parse", divergence: "Failed to parse" },
            governance: { convergence: "Failed to parse", divergence: "Failed to parse" },
            system_critique: "Analysis failed to produce structured output.",
            raw_response: responseText,
            error: "Failed to parse structured comparison"
        },
        ecosystem: [{
            actor: "Unstructured Analysis",
            mechanism: "See raw output",
            impact: responseText.substring(0, 300),
            type: "Constraint"
        }],
        assemblage_extraction_v3: {
            assemblage: {
                name: "Extraction Failed",
                description: "Could not parse response",
                properties: { stability: "Low", generativity: "Low", territorialization_score: 0, coding_intensity_score: 0 }
            },
            narrative: "Analysis failed to parse.",
            computed_metrics: {
                territorialization_score: 0,
                coding_intensity_score: 0,
                territorialization_audit: ["Analysis Failed"],
                coding_audit: ["Analysis Failed"]
            },
            raw_response: responseText
        }
    };

    return fallbacks[mode] || {
        key_insight: 'Automated Extraction (Unstructured Response)',
        governance_power_accountability: responseText,
        raw_response: responseText
    };
}

/**
 * Fixer for Assemblage Extraction V3 results.
 * Hoists nested fields and computes metrics.
 */
function fixAssemblageExtractionV3(analysis: any): any {
    // 1. Trace-Based Metrics Computation
    const extractedTraces = analysis.traces || (analysis.assemblage && analysis.assemblage.traces);

    if (extractedTraces) {
        const metrics = computeDeLandaMetrics(extractedTraces);

        // Inject computed scores into the assemblage properties for UI compatibility
        if (analysis.assemblage && analysis.assemblage.properties) {
            analysis.assemblage.properties.territorialization_score = metrics.territorialization_score;
            analysis.assemblage.properties.coding_intensity_score = metrics.coding_intensity_score;
        }

        // Attach full audit trail to the root
        analysis.computed_metrics = metrics;

        // Ensure traces are exposed at the root
        if (!analysis.traces) {
            analysis.traces = extractedTraces;
        }
    }

    // 2. Hoist nested assemblage fields to root for UI compatibility
    if (analysis.assemblage) {
        const keysToHoist = [
            'actors',
            'assemblage_network',
            'topology_analysis',
            'missing_voices',
            'structural_voids',
            'narrative',
            'socio_technical_components',
            'policy_mobilities',
            'stabilization_mechanisms',
            'relations_of_exteriority',
            'blindspot_intensity'
        ];

        keysToHoist.forEach(key => {
            if (!analysis[key] && analysis.assemblage[key]) {
                analysis[key] = analysis.assemblage[key];
            }
        });

        // [NEW] Hoist dominant_logic from properties
        if (analysis.assemblage.properties && analysis.assemblage.properties.dominant_logic) {
            analysis.dominant_logic = analysis.assemblage.properties.dominant_logic;
        }
    }

    return analysis;
}

/**
 * Main Parser Function
 */
export function parseAnalysisResponse(responseText: string, analysisMode: string): any {
    let analysis: any;

    try {
        const cleanedJson = cleanJsonString(responseText);
        analysis = JSON.parse(cleanedJson);

        // --- Mode-Specific Fixers ---

        // V3 Assemblage Fixer
        if (analysisMode === 'assemblage_extraction_v3') {
            return fixAssemblageExtractionV3(analysis);
        }

        // Ecosystem Mode Fixer
        if (analysisMode === 'ecosystem') {
            if (!Array.isArray(analysis)) {
                // If wrapped in 'analysis' or 'impacts' object, unwrap it if it's an array
                if (analysis.analysis && Array.isArray(analysis.analysis)) return analysis.analysis;
                if (analysis.impacts && Array.isArray(analysis.impacts)) return analysis; // Keep object if it has structure, let UI handle it
                // Single object wrap
                if (analysis.actor && analysis.impact) return [analysis];
            }
            return analysis;
        }

        // DSF / Default Fixer
        if ((!analysisMode || analysisMode === 'dsf')) {
            // Impute missing governance scores
            if (!analysis.governance_scores) {
                console.warn('[ANALYSIS FIX] Governance scores missing in DSF mode. Imputing defaults.');
                analysis.governance_scores = {
                    centralization: 50, rights_focus: 50, flexibility: 50, market_power: 50, procedurality: 50
                };
            }
            // Check content existence
            if (!analysis.governance_power_accountability) {
                const content = analysis.summary || analysis.content || JSON.stringify(analysis, null, 2);
                analysis = {
                    ...analysis,
                    key_insight: analysis.key_insight || 'Schema Mismatch (Valid JSON)',
                    governance_power_accountability: content,
                    plurality_inclusion_embodiment: 'See Governance & Power'
                };
            }
        }

        // Cultural Framing Fixer
        if (analysisMode === 'cultural_framing') {
            if (!analysis.dominant_cultural_logic) {
                // Synthesize from summary or other fields
                analysis.dominant_cultural_logic = analysis.key_insight ||
                    analysis.cultural_distinctiveness_rationale?.substring(0, 50) ||
                    "Cultural Logic Unspecified";
            }
            // Ensure key_insight is populated meaningfuly
            analysis.key_insight = analysis.dominant_cultural_logic;
        }

        // Comparison Mode Fixer
        if (analysisMode === 'comparison') {
            if (!analysis.risk || !analysis.governance) {
                const errorStruct = { convergence: "Missing", divergence: "Missing", coloniality: "Missing", resistance: "Missing", convergence_score: 0, coloniality_score: 0 };
                return {
                    risk: analysis.risk || errorStruct,
                    governance: analysis.governance || errorStruct,
                    rights: analysis.rights || errorStruct,
                    scope: analysis.scope || errorStruct,
                    verified_quotes: analysis.verified_quotes || [],
                    system_critique: analysis.system_critique || "Partial analysis generated.",
                    ...analysis
                };
            }
        }

        // Assemblage Explanation Fixer
        if (analysisMode === 'assemblage_explanation') {
            if (!analysis.narrative) analysis.narrative = "Narrative missing.";
            if (!Array.isArray(analysis.hulls)) analysis.hulls = [];
        }

        // [FIX] Comparative Synthesis Fixer
        if (analysisMode === 'comparative_synthesis') {
            // Ensure assemblage_network exists to prevent UI blank state
            if (!analysis.assemblage_network || !Array.isArray(analysis.assemblage_network.nodes)) {
                console.warn('[ANALYSIS FIX] Missing assemblage_network in comparative synthesis. Injecting empty structure.');
                analysis.assemblage_network = { nodes: [], edges: [] };
            }
            // Ensure arrays to prevent map errors
            if (!Array.isArray(analysis.key_divergences)) analysis.key_divergences = [];
            if (!Array.isArray(analysis.concept_mutations)) analysis.concept_mutations = [];
            if (!Array.isArray(analysis.stabilization_mechanisms)) analysis.stabilization_mechanisms = [];
        }

        // Generic fallback for key_insight
        if (analysis && typeof analysis === 'object' && !Array.isArray(analysis)) {
            if (!analysis.key_insight || analysis.key_insight.trim() === '') {
                analysis.key_insight = analysis.governance_power_accountability
                    ? (analysis.governance_power_accountability.substring(0, 80) + "...")
                    : "Analysis completed";
            }
        }

        return analysis;

    } catch (error) {
        return generateFallback(analysisMode, responseText);
    }
}
