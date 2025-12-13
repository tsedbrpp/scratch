import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ABSENCE_PROMPT } from '@/lib/prompts/absence';
import { EcosystemActor } from '@/types/ecosystem';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    console.log("Absence Analysis API Called at " + new Date().toISOString());

    // if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
    //     // Simulate AI processing delay
    //     await new Promise(resolve => setTimeout(resolve, 1500));

    //     // Return mock data for demo mode
    //     return NextResponse.json({
    //         success: true,
    //         analysis: {
    //             narrative: "In demo mode: The ecosystem shows a significant gap in representation from the Global South, primarily focusing on EU/US market dynamics. Labor voices in the data supply chain are notably absent.",
    //             missing_voices: [
    //                 { name: "Data Labeling Workers", reason: "Crucial for model production but invisible in high-level policy.", category: "Labor" },
    //                 { name: "Environmental Impact Auditors", reason: "No actors tracking carbon footprint of compute.", category: "Environment" }
    //             ],
    //             structural_voids: ["Independent third-party algorithmic audit mechanism", "Public redress channels"],
    //             blindspot_intensity: "High"
    //         }
    //     });
    // }

    try {
        const { actors, text } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ success: false, error: "OpenAI API Key missing" }, { status: 500 });
        }

        const actorContext = actors.map((a: EcosystemActor) => `- ${a.name} (${a.type}): ${a.description}`).join('\n');
        const userContent = `
        ACTORS:
        ${actorContext}

        CONTEXT TEXT:
        ${text || "No specific text provided. Analyze the actor list composition."}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: ABSENCE_PROMPT },
                { role: "user", content: userContent }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content returned from OpenAI");

        const analysis = JSON.parse(content);

        return NextResponse.json({ success: true, analysis });

    } catch (error) {
        console.error("Absence Analysis Error:", error);
        return NextResponse.json({ success: false, error: "Failed to analyze absences" }, { status: 500 });
    }
}
