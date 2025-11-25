import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { query } = await request.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ success: false, error: "Missing GOOGLE_API_KEY in .env.local" }, { status: 500 });
        }

        // Use Gemini to generate synthetic ecosystem actors based on the query
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
        You are an expert on AI governance ecosystems and social network analysis.
        
        Your task is to identify relevant "Ecosystem Actors" based on the user's search query: "${query}"

        1. **Semantic Analysis**: First, analyze the *intent* and *context* of the query. 
           - If the query is about a topic (e.g., "Generative AI regulation"), identify key stakeholders (regulators, affected startups, critics).
           - If the query is about a region (e.g., "Brazil AI"), identify local and international players active there.
           - If the query is about a conflict (e.g., "Copyright resistance"), identify opposing sides.

        2. **Actor Generation**: Generate a realistic list of 3-5 distinct actors based on this analysis.
           - The actors should be plausible real-world entities (or realistic archetypes if specific names aren't found).
           - Ensure diversity: include at least one Policymaker, one Startup/Company, and one Civil Society/Academic actor if relevant.

        Return a JSON object with a key "actors" containing an array of objects. Each object must have:
        - "id": A unique string ID (kebab-case based on name).
        - "name": Name of the actor.
        - "type": One of "Startup", "Policymaker", "Civil Society", "Academic".
        - "description": A rich description explaining *why* they are relevant to the query "${query}".
        - "influence": "High", "Medium", or "Low".

        Output JSON only.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up code blocks if present
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        return NextResponse.json({ success: true, actors: parsedData.actors });

    } catch (error) {
        console.error("Simulation error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to simulate ecosystem"
        }, { status: 500 });
    }
}
