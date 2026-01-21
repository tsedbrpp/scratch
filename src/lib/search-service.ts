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
    const q = query.toLowerCase();

    // 1. Health / Medical Context
    if (q.includes('health') || q.includes('doctor') || q.includes('nurse') || q.includes('patient') || q.includes('medical')) {
        return [
            {
                title: "Reddit - Nurses venting about new automated scheduling system",
                link: "https://reddit.com/r/nursing/comments/auto-schedule-nightmare",
                snippet: `Has anyone figured out how to swap shifts on the new AI scheduler ? It keeps denying my requests for "insufficient coverage" even when I have a cover.I've started just trading shifts offline and not logging it.`
            },
            {
                title: "Doctor's Forum: The new diagnostic support tool is hallucinating",
                link: "https://medical-community.com/t/ai-diagnostic-issues",
                snippet: `The administration is pushing us to use this new support tool, but it misses obvious contraindications. I've started documenting every single error in the notes to protect myself liability-wise.`
            },
            {
                title: "Patient Advocacy Group - Denied claims by algorithm",
                link: "https://patient-rights.org/forum/insurance-denial",
                snippet: `My claim was auto-denied in 2 seconds. The customer service rep admitted a "system flag" triggered it. We are organizing a letter-writing campaign to the state board.`
            }
        ];
    }

    // 2. Education / Academic Context
    if (q.includes('school') || q.includes('teacher') || q.includes('student') || q.includes('exam') || q.includes('grade') || q.includes('education')) {
        return [
            {
                title: "Teachers Subreddit - AI grading tools are a joke",
                link: "https://reddit.com/r/Teachers/comments/ai-grading-fail",
                snippet: `The district wants us to use this tool for essay grading, but it gives an 'A' to gibberish if the grammar is perfect. I'm secretly re-grading them all by hand at night.`
            },
            {
                title: "Student Forum: Beating the proctoring algorithm",
                link: "https://student-underground.com/proctoring-bypass",
                snippet: `The eye-tracking software flags you if you look away for 2 seconds. I found that if you tape a picture of eyes to your glasses, it sometimes gets confused. Anyone else try this?`
            },
            {
                title: "University Policy Discussion - Surveillance on campus",
                link: "https://campus-news.com/opinion/camera-rollout",
                snippet: `Students are protesting the new facial recognition cameras in the dorms. Several groups have started wearing masks/face paint to mess with the detection rates.`
            }
        ];
    }

    // 3. Finance / Banking Context
    if (q.includes('bank') || q.includes('loan') || q.includes('credit') || q.includes('finance') || q.includes('money')) {
        return [
            {
                title: "Personal Finance Reddit - Credit limit decreased by 'model update'",
                link: "https://reddit.com/r/personalfinance/comments/credit-drop",
                snippet: `I've never missed a payment, but my limit was slashed by 50% yesterday. The bank said it was an "automated risk reassessment." I'm moving all my accounts to a credit union.`
            },
            {
                title: "Small Business Forum - Loan application loop",
                link: "https://biz-community.com/t/loan-denial",
                snippet: `The automated portal keeps rejecting my PDF uploads because the "format is unrecognizable," even though it's standard. I found a specific older version of Acrobat that seems to bypass the filter.`
            }
        ];
    }

    // 4. Default / Generic Context
    return [
        {
            title: "Community Forum - Issues with new automated policy enforcement",
            link: "https://reddit.com/r/technology/comments/policy-issues",
            snippet: `Is anyone else getting flagged for "suspicious activity" just for using a VPN? The new system seems way too aggressive. I've had to create a new account just to get support.`
        },
        {
            title: "User Experience Discussion - Workarounds for the new update",
            link: "https://tech-forum.com/t/update-workaround",
            snippet: `The new interface hides the manual override button, but if you inspect element and delete the overlay div, you can still click it. Here is the script I wrote to auto-delete it.`
        },
        {
            title: "Hacker News: Unintended consequences of algorithmic moderation",
            link: "https://news.ycombinator.com/item?id=123456",
            snippet: `This policy update was supposed to stop spam, but it's blocking legitimate power users. The community is starting to migrate to alternative platforms that don't track usage as heavily.`
        }
    ];
}
