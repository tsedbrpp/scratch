import { AnalysisResult, Source, PositionalityData } from "@/types";

export type AnalysisMode = 'dsf' | 'cultural_framing' | 'institutional_logics' | 'resistance' | 'ecosystem' | 'ontology' | 'comparison' | 'generate_resistance' | 'cultural_holes' | 'legitimacy' | 'comparative_synthesis' | 'assemblage_extraction' | 'resistance_synthesis' | 'stress_test';

interface AnalyzeRequest {
    text: string;
    sourceType: string;
    analysisMode?: AnalysisMode;
    sourceA?: { title: string; text: string };
    sourceB?: { title: string; text: string };
    documents?: Source[]; // For comparative synthesis
    existingAnalysis?: AnalysisResult;
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
    force: boolean = false,
    documentId?: string,
    title?: string,
    positionality?: PositionalityData,
    existingAnalysis?: AnalysisResult
): Promise<AnalysisResult> => {
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }
        console.log('analyzeDocument headers:', headers);

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                text,
                sourceType,
                analysisMode: mode,
                force,
                documentId,
                title,
                positionality,
                existingAnalysis
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

 
export const synthesizeComparison = async (documents: Source[], lens: string = "assemblage", force: boolean = false): Promise<AnalysisResult> => {
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                analysisMode: 'comparative_synthesis',
                // [FIX] Strict sanitization to prevent token overflow. Only pass essential fields.
                documents: documents.map(d => ({
                    id: d.id,
                    title: d.title,
                    description: d.description,
                    type: d.type,
                    jurisdiction: d.jurisdiction,
                    publicationDate: d.publicationDate,
                    extractedText: d.extractedText?.substring(0, 30000) || '', // Reduced to 30k to be safe
                    analysis: d.analysis ? {
                        escalation_status: d.analysis.escalation_status
                    } : undefined
                })),
                lens,
                force
            })
        });

        const result: AnalyzeResponse = await response.json();

        if (!result.success) {
            throw new Error(result.details || result.error || 'Synthesis failed');
        }

        return result.analysis;
    } catch (error) {
        console.error('Comparative synthesis error:', error);
        throw error;
    }
};

export const generateSearchTerms = async (insight: string): Promise<string[]> => {
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }

        const response = await fetch('/api/generate-search-terms', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ insight })
        });

        const result = await response.json();
        return result.searchTerms || [];
    } catch (error) {
        console.error('Search terms generation error:', error);
        return [];
    }
};
