
import dotenv from 'dotenv';
import path from 'path';
import { ANT_TRACE_PROMPT, ASSEMBLAGE_REALIST_PROMPT, HYBRID_REFLEXIVE_PROMPT } from '../src/lib/prompts/theoretical-prompts';
import OpenAI from 'openai';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyPrompts() {
    console.log("🔍 Verifying Theoretical Prompts...");

    // Mock Data
    const mockTracedActors = [
        { name: "Global AI Treaty", type: "Law", associations: ["United Nations", "Tech Giants"] },
        { name: "Open Source Developers", type: "Civil Society", associations: ["GitHub", "Hugging Face"] }
    ];

    const mockTraceInput = JSON.stringify({
        tracedActors: mockTracedActors,
        associations: [
            { source: "Global AI Treaty", target: "Tech Giants", type: "Regulation" }
        ]
    });

    const mockAssemblageInput = JSON.stringify({
        tracedActors: mockTracedActors,
        mechanisms: [{ type: "Territorialization", intensity: "High", description: "Treaty enforcing boundaries" }],
        capacities: ["Regulation", "Standardization"]
    });

    const mockHybridInput = JSON.stringify({
        antTrace: mockTraceInput,
        assemblageMechanisms: mockAssemblageInput
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Helper to call OpenAI
    async function testPrompt(name: string, systemPrompt: string, userContent: string) {
        console.log(`\nTesting ${name}...`);
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            console.log(`✅ ${name} Output:\n`, content);
            return content;
        } catch (error) {
            console.error(`❌ ${name} Failed:`, error);
        }
    }

    // Run Tests
    if (process.env.OPENAI_API_KEY) {
        await testPrompt("ANT Trace", ANT_TRACE_PROMPT, mockTraceInput);
        await testPrompt("Assemblage Realist", ASSEMBLAGE_REALIST_PROMPT, mockAssemblageInput);
        await testPrompt("Hybrid Reflexive", HYBRID_REFLEXIVE_PROMPT, mockHybridInput);
    } else {
        console.warn("⚠️ No OPENAI_API_KEY found. Skipping live test. Printing prompts for manual review.");
        console.log("\n--- ANT TRACE PROMPT ---\n", ANT_TRACE_PROMPT);
        console.log("\n--- ASSEMBLAGE REALIST PROMPT ---\n", ASSEMBLAGE_REALIST_PROMPT);
        console.log("\n--- HYBRID REFLEXIVE PROMPT ---\n", HYBRID_REFLEXIVE_PROMPT);
    }
}

verifyPrompts();
