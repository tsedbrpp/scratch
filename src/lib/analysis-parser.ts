/* eslint-disable @typescript-eslint/no-explicit-any */
import { computeDeLandaMetrics } from "@/lib/delanda-service";

export interface AnalysisParserResult {
    analysis: any;
    error?: string;
}

export function parseAnalysisResponse(responseText: string, analysisMode: string): any {
    let analysis: any;

    try {
        if (!responseText || !responseText.trim()) {
            throw new Error("Empty response text received from API");
        }

        // Robust JSON extraction
        let cleanedResponse = responseText
            .replace(/```json\s*/gi, '')
            .replace(/```/g, '')
            .replace(/^JSON:/i, '') // Handle "JSON:" prefix
            .trim();

        // Find the first '{' or '[' to handle potential preamble text
        const firstBrace = cleanedResponse.indexOf('{');
        const firstBracket = cleanedResponse.indexOf('[');

        let start = -1;
        let end = -1;

        // Determine if it's an object or array and find start/end
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            start = firstBrace;
            end = cleanedResponse.lastIndexOf('}');
        } else if (firstBracket !== -1) {
            start = firstBracket;
            end = cleanedResponse.lastIndexOf(']');
        }

        if (start !== -1 && end !== -1) {
            cleanedResponse = cleanedResponse.substring(start, end + 1);
        }

        analysis = JSON.parse(cleanedResponse);

        // [Robustness] Handle models returning valid JSON but incorrectly named keys
        // If we are in default/dsf mode but missing primary keys, treat as partial/fallback
        if ((!analysisMode || analysisMode === 'dsf') && !analysis.governance_power_accountability) {
            // Try to find ANY useful content
            const content = analysis.summary || analysis.content || analysis.response || analysis.answer || JSON.stringify(analysis, null, 2);

            // Remap to expected structure so UI displays it
            analysis = {
                key_insight: analysis.key_insight || 'Schema Mismatch (Valid JSON)',
                governance_power_accountability: content,
                plurality_inclusion_embodiment: 'See Governance & Power',
                agency_codesign_self_determination: 'Not parsed',
                reflexivity_situated_praxis: 'Not parsed',
                // Keep original data just in case
                ...analysis
            };
        }

        // [Robustness] Handle comparison mode missing keys
        if (analysisMode === 'comparison' && (!analysis.risk || !analysis.governance)) {
            const errorStruct = { convergence: "Missing from response", divergence: "Missing from response", coloniality: "Missing from response", resistance: "Missing from response", convergence_score: 0, coloniality_score: 0 };
            analysis = {
                risk: analysis.risk || errorStruct,
                governance: analysis.governance || errorStruct,
                rights: analysis.rights || errorStruct,
                scope: analysis.scope || errorStruct,
                verified_quotes: analysis.verified_quotes || [],
                system_critique: analysis.system_critique || "Partial analysis generated.",
                ...analysis
            };
        }
    } catch (parseError) {
        console.error("[ANALYSIS ERROR] JSON Parse failed:", parseError);
        console.log("[ANALYSIS ERROR] Failed text:", responseText);

        // Fallback structures based on mode
        if (analysisMode === 'resistance') {
            analysis = {
                strategy_detected: "Unstructured Analysis",
                evidence_quote: "See raw output",
                interpretation: responseText.substring(0, 300),
                confidence: "Low",
                raw_response: responseText
            };
        } else if (analysisMode === 'comparison') {
            const errorStruct = { convergence: "Failed to parse", divergence: "Failed to parse", coloniality: "Failed to parse", resistance: "Failed to parse", convergence_score: 0, coloniality_score: 0 };
            analysis = {
                risk: errorStruct,
                governance: errorStruct,
                rights: errorStruct,
                scope: errorStruct,
                verified_quotes: [],
                system_critique: "Analysis failed to produce structured output.",
                raw_response: responseText,
                error: "Failed to parse structured comparison"
            };
        } else if (analysisMode === 'ecosystem') {
            analysis = [{
                actor: "Unstructured Analysis",
                mechanism: "See raw output",
                impact: responseText.substring(0, 300),
                type: "Constraint"
            }];
        } else if (analysisMode === 'generate_resistance') {
            analysis = [{
                title: "Generation Failed",
                description: "Could not parse generated traces.",
                content: responseText
            }];
        } else if (analysisMode === 'assemblage_extraction_v3') {
            analysis = {
                assemblage: {
                    name: "Extraction Failed",
                    description: "Could not parse response",
                    properties: { stability: "Low", generativity: "Low", territorialization_score: 0, coding_intensity_score: 0 }
                },
                actors: [],
                relations: [],
                narrative: "Analysis failed to parse.",
                missing_voices: [],
                structural_voids: [],
                socio_technical_components: { infra: [], discourse: [] },
                policy_mobilities: { origin_concepts: [], local_mutations: [] },
                stabilization_mechanisms: [],
                traces: [],
                computed_metrics: {
                    territorialization_score: 0,
                    coding_intensity_score: 0,
                    territorialization_audit: ["Analysis Failed"],
                    coding_audit: ["Analysis Failed"]
                },
                raw_response: responseText
            };
        } else if (analysisMode === 'cultural_holes') {
            analysis = {
                holes: [],
                recommendations: [],
                overall_connectivity_score: 0,
                raw_response: responseText
            };
        } else if (analysisMode === 'legitimacy') {
            analysis = {
                orders: { market: 0, industrial: 0, civic: 0, domestic: 0, inspired: 0, fame: 0 },
                dominant_order: "Unstructured",
                justification_logic: responseText.substring(0, 300),
                moral_vocabulary: [],
                conflict_spot: "Unknown",
                raw_response: responseText
            };
        } else if (analysisMode === 'resistance_synthesis') {
            analysis = {
                executive_summary: responseText.substring(0, 300),
                dominant_strategies: [],
                emerging_themes: [],
                implications_for_policy: "Failed to parse structured synthesis.",
                raw_response: responseText
            };
        } else if (analysisMode === 'stress_test') {
            analysis = {
                inverted_text: responseText,
                raw_response: responseText
            };
        } else if (analysisMode === 'assemblage_explanation') {
            analysis = {
                narrative: responseText.substring(0, 500) || "Failed to generate assemblage explanation.",
                hulls: [],
                raw_response: responseText
            };
        } else {
            analysis = {
                key_insight: 'Automated Extraction (Unstructured Response)',
                governance_power_accountability: responseText,
                plurality_inclusion_embodiment: 'See "Governance & Power" for full text.',
                agency_codesign_self_determination: 'Not parsed.',
                reflexivity_situated_praxis: 'Not parsed.',
                raw_response: responseText
            };
        }
    }

    // Robustness Fixes
    // Ecosystem Mode: Ensure it's an array
    if (analysisMode === 'ecosystem' && !Array.isArray(analysis)) {
        console.log('[ANALYSIS FIX] Ecosystem analysis is not an array, attempting to extract...');
        if (analysis.impacts && Array.isArray(analysis.impacts)) {
            analysis = analysis.impacts;
        } else if (analysis.analysis && Array.isArray(analysis.analysis)) {
            analysis = analysis.analysis;
        } else {
            // If it's a single object, wrap it
            analysis = [analysis];
        }
    }

    // [Feature] Trace-Based Metrics Computation
    // Check both root-level and nested (assemblage.traces) to be robust
    const extractedTraces = analysis.traces || (analysis.assemblage && analysis.assemblage.traces);

    if (analysisMode === 'assemblage_extraction_v3' && extractedTraces) {
        const metrics = computeDeLandaMetrics(extractedTraces);

        // Inject computed scores into the assemblage properties for UI compatibility
        if (analysis.assemblage && analysis.assemblage.properties) {
            analysis.assemblage.properties.territorialization_score = metrics.territorialization_score;
            analysis.assemblage.properties.coding_intensity_score = metrics.coding_intensity_score;
        }

        // Attach full audit trail to the root so UI can find it
        analysis.computed_metrics = metrics;

        // Ensure traces are exposed at the root for easier access if they were nested
        if (!analysis.traces) {
            analysis.traces = extractedTraces;
        }
    }

    // [Fix] Ensure key_insight is never blank
    if (analysis && typeof analysis === 'object' && !Array.isArray(analysis)) {
        if (!analysis.key_insight || analysis.key_insight.trim() === '') {
            analysis.key_insight = analysis.governance_power_accountability
                ? (analysis.governance_power_accountability.substring(0, 80) + "...")
                : "Analysis completed";
        }

        // [Fix] Ensure governance_scores exist for DSF mode to prevent UI gaps (Governance Compass missing)
        if ((!analysisMode || analysisMode === 'dsf') && !analysis.governance_scores) {
            console.warn('[ANALYSIS FIX] Governance scores missing in DSF mode. Imputing defaults.');
            analysis.governance_scores = {
                centralization: 50,
                rights_focus: 50,
                flexibility: 50,
                market_power: 50,
                procedurality: 50
            };
            analysis.governance_score_explanations = {
                centralization: "Score imputed (missing from generation).",
                rights_focus: "Score imputed (missing from generation).",
                flexibility: "Score imputed (missing from generation).",
                market_power: "Score imputed (missing from generation).",
                procedurality: "Score imputed (missing from generation)."
            };
        }

        // [Fix] Ensure assemblage_explanation has required structure
        if (analysisMode === 'assemblage_explanation') {
            if (!analysis.narrative) {
                analysis.narrative = "Analysis completed but narrative is missing.";
            }
            if (!Array.isArray(analysis.hulls)) {
                analysis.hulls = [];
            }
        }
    }

    return analysis;
}
