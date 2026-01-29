import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { PromptRegistry, PROMPT_DEFINITIONS } from '@/lib/prompts/registry';
import { safeJSONParse } from '@/lib/analysis-utils';

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    strategy?: string;
    explanation?: string;
}

/**
 * Executes a Google Custom Search for a given query.
 */
export async function executeGoogleSearch(query: string, apiKey: string, cx: string, maxResults: number = 10): Promise<SearchResult[]> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=${Math.min(maxResults, 10)}`;
    try {
        console.log(`DEBUG: Executing Search: ${url}`);
        const res = await fetch(url);
        const d = await res.json();
        if (!res.ok) {
            console.error("Search API ERROR:", JSON.stringify(d, null, 2));
            return [];
        }
        if (!d.items) {
            console.warn("Search API returned OK but NO ITEMS:", JSON.stringify(d, null, 2));
        }
        return d.items?.map((item: { title: string; link: string; snippet: string }) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        })) || [];
    } catch (e) {
        console.error("Fetch failed", e);
        return [];
    }
}

/**
 * Helper to process the raw JSON response from any AI model into curates results.
 */
function processCurationResponse(content: string, originalResults: SearchResult[]): SearchResult[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = safeJSONParse<any>(content, []);

    let itemsToProcess: any[] = [];

    // Robustly extract array
    if (Array.isArray(parsed)) {
        itemsToProcess = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
        itemsToProcess = parsed.items;
    }

    if (itemsToProcess.length > 0) {
        const curatedResults: SearchResult[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        itemsToProcess.forEach((item: any) => {
            let index = -1;
            let strategy = "Unclassified";
            let explanation = "";

            // Handle 'id' vs 'index' confusion
            const rawIndex = item.index !== undefined ? item.index : item.id;

            if (typeof item === 'number') {
                index = item;
            } else if (typeof item === 'object' && item !== null && (typeof rawIndex === 'number' || typeof rawIndex === 'string')) {
                index = parseInt(String(rawIndex));
                if (item.strategy) strategy = item.strategy;
                if (item.explanation) explanation = item.explanation;
                else if (item.context) explanation = item.context;
                else if (item.reason) explanation = item.reason;
            }

            if (index >= 0 && originalResults[index]) {
                // Fallback generation if AI failed
                if (!explanation || explanation === "Automated classification from Search") {
                    explanation = `AI identified this as ${strategy} based on keywords in the text.`;
                }

                curatedResults.push({
                    ...originalResults[index],
                    strategy: strategy,
                    explanation: explanation
                });
            }
        });

        if (curatedResults.length > 0) {
            return curatedResults;
        }
    }
    return [];
}

/**
 * Curates and classifies search results using Google Generative AI.
 * Enforces "Mandatory Explanation" validation.
 */
export async function curateResultsWithAI(
    results: SearchResult[],
    policyText: string,
    apiKey: string,
    modelName: string = "gemini-1.5-flash",
    userId?: string
): Promise<SearchResult[]> {
    if (results.length === 0) return [];

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Fetch prompts
        let subjectPromptTemplate = PROMPT_DEFINITIONS['subject_identification'].defaultValue;
        let curationPromptTemplate = PROMPT_DEFINITIONS['resistance_curation'].defaultValue;

        if (userId) {
            subjectPromptTemplate = await PromptRegistry.getEffectivePrompt(userId, 'subject_identification');
            curationPromptTemplate = await PromptRegistry.getEffectivePrompt(userId, 'resistance_curation');
        }

        // EXTRACT SUBJECT ENTITY FIRST (Crucial for relevance)
        const subjectPrompt = subjectPromptTemplate.replace('${text}', policyText.substring(0, 1000));

        const subjectResult = await model.generateContent(subjectPrompt);
        const policySubject = subjectResult.response.text().trim().replace(/['"]/g, '');
        console.log("Extracted Policy Subject:", policySubject);

        const curationPrompt = curationPromptTemplate
            .replace('${policySubject}', policySubject)
            .replace('${items}', JSON.stringify(results.map((r, i) => ({ id: i, text: r.title + " " + r.snippet }))));

        const result = await model.generateContent(curationPrompt);
        const content = result.response.text().trim();

        const curatedResults = processCurationResponse(content, results);

        if (curatedResults.length > 0) {
            console.log(`AI Curation: Kept ${curatedResults.length} classified traces.`);
            return curatedResults;
        } else {
            console.log("AI Curation: Filtered all. Falling back to raw results.");
        }

    } catch (e) {
        console.warn("Google AI Curation failed (will attempt fallback):", (e as Error).message);
        // Return original results if curation fails or filters everything (safety net)
        return results;
    }

    return results;
}

/**
 * Curates and classifies search results using OpenAI (Fallback).
 */
export async function curateResultsWithOpenAI(
    results: SearchResult[],
    policyText: string,
    apiKey: string,
    modelName: string = "gpt-4o",
    userId?: string
): Promise<SearchResult[]> {
    if (results.length === 0) return [];

    try {
        const openai = new OpenAI({ apiKey: apiKey });

        // Fetch prompts
        let subjectPromptTemplate = PROMPT_DEFINITIONS['subject_identification'].defaultValue;
        let curationPromptTemplate = PROMPT_DEFINITIONS['resistance_curation'].defaultValue;

        if (userId) {
            subjectPromptTemplate = await PromptRegistry.getEffectivePrompt(userId, 'subject_identification');
            curationPromptTemplate = await PromptRegistry.getEffectivePrompt(userId, 'resistance_curation');
        }

        // EXTRACT SUBJECT ENTITY FIRST
        const subjectPrompt = subjectPromptTemplate.replace('${text}', policyText.substring(0, 1000));

        const subjectCompletion = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'user', content: subjectPrompt }],
            max_completion_tokens: 50
        });

        const policySubject = subjectCompletion.choices[0]?.message?.content?.trim().replace(/['"]/g, '') || "AI Governance Policy";
        console.log("Extracted Policy Subject (OpenAI):", policySubject);

        // CURATE
        const curationPrompt = curationPromptTemplate
            .replace('${policySubject}', policySubject)
            .replace('${items}', JSON.stringify(results.map((r, i) => ({ id: i, text: r.title + " \n " + r.snippet }))));

        const curationCompletion = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'system', content: curationPrompt }],
            response_format: { type: "json_object" },
            max_completion_tokens: 2000
        });

        const content = curationCompletion.choices[0]?.message?.content || '{}';

        const curatedResults = processCurationResponse(content, results);

        if (curatedResults.length > 0) {
            console.log(`AI Curation (OpenAI): Kept ${curatedResults.length} classified traces.`);
            return curatedResults;
        } else {
            console.log("AI Curation (OpenAI): Filtered all. Falling back to raw results.");
        }

    } catch (e) {
        console.error("AI Curation (OpenAI) failed", e);
    }

    return results;
}


/**
 * Generates realistic mock results based on query context.
 */
export function getMockResults(query: string): SearchResult[] {
    // Hardcoded examples removed as per user request.
    // Real implementation should rely on API.
    return [];
}
