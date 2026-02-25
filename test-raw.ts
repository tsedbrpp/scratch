import { z } from 'zod';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function run() {
    const groundedExcerpts = [
        { id: 'exc-1', text: 'The Executive Branch will designate the competent authority.' },
        { id: 'exc-2', text: 'Coordination occurs between the competent authority and public bodies of the public administration.' },
        { id: 'exc-3', text: 'Promote cooperation actions with authorities in other countries, of an international or transnational nature.' },
        { id: 'exc-4', text: 'Standards preceded by public consultation and hearings.' }
    ];

    const formattedExcerpts = groundedExcerpts.map(e => `[ID: ${e.id}]\\nQuote: "${e.text}"\\n---`).join('\\n\\n');

    const systemPrompt = `You are a critical structural policy analyst. Your task is to perform a thesis-driven "structural exclusion mapping" to determine exactly how and why the actor "International Organizations" is positioned, recognized, or excluded within the policy document "Brazil AI Strategy 2021".

CRITICAL INSTRUCTIONS:
1. You may ONLY draw conclusions supported by the explicitly provided excerpts.
2. Do NOT import outside knowledge (e.g., do not invent a role for UNESCO just because they do standard-setting normally). 
3. If the excerpts do not contain enough structural/role-allocating data to make a claim about the actor's governance standing, set "insufficientEvidence" to true.
4. If you make a claim (e.g., "The law bounds coordination strictly to internal state organs"), you MUST cite the exact excerpt ID(s) that prove this.
5. Every claim in the "claims" array MUST have at least one valid excerpt ID in its "supportedBy" array. DO NOT INVENT IDs.
6. Provide a "thesis", which is a sharp, 1-2 sentence "Net effect" conclusion answering: Does the text grant them structural standing, treat them merely as epistemic inputs, or silence them by bounding authority elsewhere?`;

    const userPrompt = `Actor to analyze: International Organizations
Document: Brazil AI Strategy 2021

EXCERPTS TO ANALYZE:
${formattedExcerpts}

Generate a tight, structural concern analysis. Return the structured JSON with fields: insufficientEvidence (boolean), thesis (string), claims (array of objects with sectionTitle, claimText, supportedBy string array, logicType string).`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content || '{}';
        console.log("RAW JSON OUTPUT:");
        console.log(content);
    } catch (e) {
        console.error(e);
    }
}

run();
