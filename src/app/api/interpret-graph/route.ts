import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { isReadOnlyAccess } from '@/lib/auth-helper';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    // BLOCK READ-ONLY DEMO USERS
    if (await isReadOnlyAccess()) {
        return NextResponse.json({ error: "Demo Mode is Read-Only. Sign in to interpret graphs." }, { status: 403 });
    }

    try {
        const { nodes, edges } = await req.json();

        const systemPrompt = `You are an expert Assemblage Theorist and Data Vis analyst. 
        Your job is to look at the raw data of a network graph and explain its "Shape" and "DNA" to a user.
        
        The graph represents a comparison between two legal frameworks (e.g. India vs Brazil).
        
        **Node Types & Meanings:**
        - 'right' (Amber/Yellow): Rights, protections, human-centric.
        - 'mechanism' (Green): Bureaucracy, risk checks, engines of compliance.
        - 'risk' (Red): Harms, dangers.
        - 'policy' (Blue): The law itself (Anchors).
        - 'concept' (Purple): Abstract ideas.

        **Your Task:**
        1. Analyze the clusters. Is one side mostly "Rights" (Yellow) and the other "Mechanisms" (Green)? 
        2. Explain the "Operating System" of each cluster based on its dominant node types.
        3. Explain the "Bridge" (if the AI Analyst node exists).
        
        **Output Format:**
        Return a JSON object:
        {
            "title": "Short catchy title (MAX 10 WORDS) describing the contrast (e.g. 'Bureaucracy of Risk vs. Shield of Rights')",
            "analysis": "A clear, non-academic paragraph explaining what the visual patterns mean. Use bolding."
        }`;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify({ nodes, edges }) }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return NextResponse.json(result);

    } catch (error) {
        console.error("Graph interpretation failed:", error);
        return NextResponse.json({ error: "Failed to interpret graph" }, { status: 500 });
    }
}
