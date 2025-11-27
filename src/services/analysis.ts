import { AnalysisResult } from "@/types";

export type AnalysisMode = 'dsf' | 'cultural_framing' | 'institutional_logics' | 'resistance' | 'ecosystem' | 'ontology' | 'comparison' | 'generate_resistance';

interface AnalyzeRequest {
    text: string;
    sourceType: string;
    analysisMode?: AnalysisMode;
    sourceA?: any;
    sourceB?: any;
}

interface AnalyzeResponse {
    success: boolean;
    analysis: AnalysisResult;
    error?: string;
    details?: string;
}

export const analyzeDocument = async (
    text: string,
    mode: AnalysisMode = 'dsf',
    sourceType: string = 'Policy Document',
    force: boolean = false
): Promise<AnalysisResult> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                sourceType,
                analysisMode: mode,
                force
            })
        });

        const result: AnalyzeResponse = await response.json();

        if (!result.success) {
            throw new Error(result.details || result.error || 'Analysis failed');
        }

        return result.analysis;
    } catch (error) {
        console.error(`Analysis error (${mode}):`, error);
        throw error;
    }
};

export const generateSearchTerms = async (insight: string): Promise<string[]> => {
    try {
        const response = await fetch('/api/generate-search-terms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ insight })
        });

        const result = await response.json();
        return result.searchTerms || [];
    } catch (error) {
        console.error('Search terms generation error:', error);
        return [];
    }
};
