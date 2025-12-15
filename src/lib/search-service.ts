import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

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
        const res = await fetch(url);
        const d = await res.json();
        if (!res.ok) {
            console.error("Search API invalid:", d);
            return [];
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
 * Curates and classifies search results using Google Generative AI.
 * Enforces "Mandatory Explanation" validation.
 */
export async function curateResultsWithAI(
    results: SearchResult[],
    policyText: string,
    apiKey: string,
    modelName: string = "gemini-1.5-flash-001"
): Promise<SearchResult[]> {
    if (results.length === 0) return [];

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // EXTRACT SUBJECT ENTITY FIRST (Crucial for relevance)
        const subjectPrompt = `Identify the SPECIFIC Policy, Act, Bill, Platform, or Company this text describes. 
        Text: "${policyText.substring(0, 1000)}"
        Return ONLY the name (e.g. "EU AI Act"). If unclear, return "AI Governance Policy".`;

        const subjectResult = await model.generateContent(subjectPrompt);
        const policySubject = subjectResult.response.text().trim().replace(/['"]/g, '');
        console.log("Extracted Policy Subject:", policySubject);

        const curationPrompt = `You are a helpful Research Assistant filtering for relevance.

TARGET SUBJECT: "${policySubject}"

WE ARE LOOKING FOR 4 TYPES OF RESISTANCE (Broadly interpreted):
1. **Gambiarra**: Creative workarounds, hacks, or tricks to bypass the system.
2. **Obfuscation**: Hiding data, using fake GPS, or confusing the algorithm.
3. **Solidarity**: Collective action, unions, strikes, or helping other workers.
4. **Refusal**: Quitting, opting out, or refusing to accept tasks.

INSTRUCTIONS:
1. **Relevance Check**: Keep items related to the subject or general AI/Algo resistance.
2. **Typology Match**: Classify into one of the 4 types. If unsure, use "Refusal" or "Solidarity" if it fits loosely.
3. **Inclusion Goal**: Try to keep at least 50% of the relevant results.

INPUT LIST:
${JSON.stringify(results.map((r, i) => ({ id: i, text: r.title + " " + r.snippet })))}

OUTPUT:
Return a JSON array of objects. EXPLANATION IS MANDATORY.
[
  { "index": 0, "strategy": "Gambiarra", "explanation": "Brief context of the workaround." },
  { "index": 5, "strategy": "Refusal", "explanation": "Why this counts as refusal." }
]`;

        const result = await model.generateContent(curationPrompt);
        const content = result.response.text().trim();
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const match = cleanContent.match(/\[[\s\S]*\]/);

        if (match) {
            const validItems = JSON.parse(match[0]);

            if (Array.isArray(validItems)) {
                const curatedResults: SearchResult[] = [];

                validItems.forEach((item: any) => {
                    let index = -1;
                    let strategy = "Unclassified";
                    let explanation = ""; // Start empty to trigger fallback

                    // Handle 'id' vs 'index' confusion
                    const rawIndex = item.index !== undefined ? item.index : item.id;

                    if (typeof item === 'number') {
                        index = item;
                    } else if (typeof item === 'object' && item !== null && typeof rawIndex === 'number') {
                        index = rawIndex;
                        if (item.strategy) strategy = item.strategy;

                        // Robust parsing for explanation synonyms
                        if (item.explanation) explanation = item.explanation;
                        else if (item.context) explanation = item.context;
                        else if (item.reason) explanation = item.reason;
                    }

                    if (index >= 0 && results[index]) {
                        // Fallback generation if AI failed
                        if (!explanation || explanation === "Automated classification from Search") {
                            explanation = `AI identified this as ${strategy} based on keywords in the text.`;
                        }

                        curatedResults.push({
                            ...results[index],
                            strategy: strategy,
                            explanation: explanation
                        });
                    }
                });

                if (curatedResults.length > 0) {
                    console.log(`AI Curation: Kept ${curatedResults.length} classified traces.`);
                    return curatedResults;
                } else {
                    console.log("AI Curation: Filtered all. Falling back to raw results.");
                }
            }
        }
    } catch (e) {
        console.warn("Google AI Curation failed (will attempt fallback):", (e as Error).message);
        // Return original results if curation fails or filters everything (safety net)
        return results;
    }
}

/**
 * Curates and classifies search results using OpenAI (Fallback).
 */
export async function curateResultsWithOpenAI(
    results: SearchResult[],
    policyText: string,
    apiKey: string,
    modelName: string = "gpt-4o"
): Promise<SearchResult[]> {
    if (results.length === 0) return [];

    try {
        const openai = new OpenAI({ apiKey: apiKey });

        // EXTRACT SUBJECT ENTITY FIRST
        const subjectPrompt = `Identify the SPECIFIC Policy, Act, Bill, Platform, or Company this text describes. 
        Text: "${policyText.substring(0, 1000)}"
        Return ONLY the name (e.g. "EU AI Act"). If unclear, return "AI Governance Policy".`;

        const subjectCompletion = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'user', content: subjectPrompt }],
            max_completion_tokens: 50
        });

        const policySubject = subjectCompletion.choices[0]?.message?.content?.trim().replace(/['"]/g, '') || "AI Governance Policy";
        console.log("Extracted Policy Subject (OpenAI):", policySubject);

        const curationPrompt = `You are a helpful Research Assistant classifying search results for an AI Resistance project.
            
Target Policy/Subject: "${policySubject}"

YOUR GOAL: Identify and classify traces of resistance from the search results.
CRITICAL: You MUST attempt to classify as many items as possible. Do not filter aggressively. We need data.

CLASSIFICATION CATEGORIES (Strategies):
1. **Gambiarra**: Creative workarounds, hacks, using tools in unintended ways.
2. **Obfuscation**: Hiding data, noise injection, burner accounts, VPNs, camouflaging.
3. **Solidarity**: Collective action, unions, forums, sharing tips, strikes.
4. **Refusal**: Opting out, quitting, blocking, non-compliance, uninstalling.

INSTRUCTIONS:
1. **Analyze** each search result snippet.
2. **Classify** it into one of the 4 strategies. If it fits multiple, pick the dominant one.
3. **Balanced Mix**: Strive to find examples for ALL 4 categories if possible.
4. **Relevance**: If it mentions the subject OR general algorithmic resistance/frustration, INCLUDE IT.
5. **Output Format**: JSON Object with a "items" array.

INPUT LIST:
${JSON.stringify(results.map((r, i) => ({ id: i, text: r.title + " \n " + r.snippet })))}

OUTPUT JSON STRUCTURE:
{
  "items": [
    { "index": 0, "strategy": "Gambiarra", "explanation": "User describes using a script to bypass..." },
    { "index": 1, "strategy": "Refusal", "explanation": "Workers are refusing to log in..." }
  ]
}`;

        const curationCompletion = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'system', content: curationPrompt }],
            response_format: { type: "json_object" },
            max_completion_tokens: 2000
        });

        const content = curationCompletion.choices[0]?.message?.content || '{}';

        let validItems: any[] = [];
        try {
            const parsed = JSON.parse(content);
            // Handle if it returns { items: [...] } or just [...]
            validItems = Array.isArray(parsed) ? parsed : (parsed.items || []);

            // If empty, try to see if the root object has keys that look like an array index
            if (!Array.isArray(validItems) && parsed && typeof parsed === 'object') {
                // sometimes models return { "0": {...}, "1": {...} }
                validItems = Object.values(parsed);
            }
        } catch (e) {
            console.error("OpenAI JSON parse failed. Content was:", content);
            console.error(e);
        }

        if (validItems.length === 0) {
            // No valid items found
        } else if (Array.isArray(validItems)) {
            const curatedResults: SearchResult[] = [];
            // ... existing loop ...
            validItems.forEach((item: any) => {
                let index = -1;
                let strategy = "Unclassified";
                let explanation = "";

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

                if (index >= 0 && results[index]) {
                    if (!explanation || explanation === "Automated classification from Search") {
                        explanation = `AI identified this as ${strategy} based on keywords in the text.`;
                    }

                    // Ensure we aren't overwriting if multiple classifications hit same item?
                    // For now just push.
                    curatedResults.push({
                        ...results[index],
                        strategy: strategy,
                        explanation: explanation
                    });
                }
            });

            if (curatedResults.length > 0) {
                console.log(`AI Curation (OpenAI): Kept ${curatedResults.length} classified traces.`);
                return curatedResults;
            } else {
                console.log("AI Curation (OpenAI): Filtered all. Falling back to raw results.");
            }
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
