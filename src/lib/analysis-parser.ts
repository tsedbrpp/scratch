/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AnalysisParserResult {
    analysis: any;
    error?: string;
}

export function parseAnalysisResponse(responseText: string, analysisMode: string): any {
    let analysis: any;

    try {
        // Robust JSON extraction
        let cleanedResponse = responseText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

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
    } catch (parseError) {
        console.error("[ANALYSIS ERROR] JSON Parse failed:", parseError);
        console.log("[ANALYSIS ERROR] Failed text:", responseText);

        // Fallback structures based on mode
        if (analysisMode === 'resistance') {
            analysis = {
                strategy_detected: "Unstructured Analysis",
                evidence_quote: "See raw response",
                interpretation: responseText.substring(0, 300),
                confidence: "Low",
                raw_response: responseText
            };
        } else if (analysisMode === 'comparison') {
            analysis = {
                raw_response: responseText,
                error: "Failed to parse structured comparison"
            };
        } else if (analysisMode === 'ecosystem') {
            analysis = [{
                actor: "Unstructured Analysis",
                mechanism: "See raw response",
                impact: responseText.substring(0, 300),
                type: "Constraint"
            }];
        } else if (analysisMode === 'generate_resistance') {
            analysis = [{
                title: "Generation Failed",
                description: "Could not parse generated traces.",
                content: responseText
            }];
        } else if (analysisMode === 'assemblage_extraction') {
            analysis = {
                assemblage: { name: "Extraction Failed", description: "Could not parse response", properties: { stability: "Low", generativity: "Low" } },
                actors: [],
                relations: [],
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
                inverted_text: responseText, // Fallback: Assume the whole response is the inverted text
                raw_response: responseText
            };
        } else {
            analysis = {
                governance_power_accountability: responseText.substring(0, 300),
                plurality_inclusion_embodiment: 'See full analysis',
                agency_codesign_self_determination: 'See full analysis',
                reflexivity_situated_praxis: 'See full analysis',
                key_insight: 'Analysis completed',
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

    return analysis;
}
