
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { ANTTraceService } from '../src/lib/ant-trace-service';
// We will mimic the 'strategies' behavior by importing them or just using the prompt directly to test the flow.
// Actually, simulating the API call structure is better.

dotenv.config({ path: '.env.local' });

// ENFORCE DEMO MODE
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID;
if (!DEMO_USER_ID) {
    console.error("❌ ERROR: NEXT_PUBLIC_DEMO_USER_ID is missing from .env.local");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function simulateFullWorkflow() {
    console.log(`\n=== 🧪 SIMULATION: WEEK 3 MICRO-RESISTANCE (User: ${DEMO_USER_ID}) ===\n`);

    // 1. MOCK DATA (As if coming from Client with traceType tags)
    const sourceA = {
        title: "[Sim] Brazil PL 2338",
        text: "Article 4: Risk assessment must consider local labor impacts...",
        traces: [
            {
                title: "Driver Strike Sao Paulo",
                description: "Drivers turned off apps in unison to force surge pricing.",
                extractedText: "Resistance Strategy: Gambiarra. Drivers use GPS spoofing...",
                traceType: "resistance" // NEW TAG
            }
        ]
    };

    const sourceB = {
        title: "[Sim] EU AI Act",
        text: "Article 6: High-risk systems require conformity assessment...",
        traces: [
            {
                title: "Rider Forum Berlin",
                description: "Riders share tips on shielding GPS during breaks.",
                extractedText: "Resistance Strategy: Emergent. Riders call it 'Digital Cloaking'...",
                traceType: "resistance" // NEW TAG
            }
        ]
    };

    // 2. CONSTRUCT PROMPT (Mimicking 'comparison' strategy in analysis-strategies.ts)
    // We want to verify that the SYSTEM PROMPT + USER CONTENT generates the Resonances.

    // Import the prompt we updated
    const { COMPARISON_SYSTEM_PROMPT } = await import('../src/lib/prompts/comparison');

    console.log("➡️  Step 1: Constructing Payload...");
    const userContent = `
SOURCE A(${sourceA.title}):
${sourceA.text}
TRACE EVIDENCE (Source A):
- ${sourceA.traces[0].title}: ${sourceA.traces[0].extractedText}

SOURCE B(${sourceB.title}):
${sourceB.text}
TRACE EVIDENCE (Source B):
- ${sourceB.traces[0].title}: ${sourceB.traces[0].extractedText}

Compare these contexts. specifically focusing on Transversal Resonances.
`;

    console.log("➡️  Step 2: Sending to OpenAI (GPT-4o)...");

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: COMPARISON_SYSTEM_PROMPT },
                { role: "user", content: userContent }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        console.log("\n✅ Step 3: Analysis Received.\n");
        console.log("--- TRANSVERSAL RESONANCES ---");
        console.log(JSON.stringify(result.resonances, null, 2));

        // Validation Checks
        let passed = true;
        if (!result.resonances) {
            console.error("❌ FAIL: 'resonances' key missing.");
            passed = false;
        } else {
            if (result.resonances.shared_strategies.some((s: string) => s.includes("Gambiarra"))) {
                console.log("✅ PASS: 'Gambiarra' identified as shared resonance.");
            } else {
                console.warn("⚠️ WARN: 'Gambiarra' not explicitly listed in shared_strategies.");
            }

            if (result.resonances.narrative.length > 50) {
                console.log("✅ PASS: Narrative is detailed.");
            }
        }

        // Typology Check
        if (result.resonances?.shared_strategies?.includes("Emergent Strategy") || JSON.stringify(result).includes("Emergent")) {
            console.log("✅ PASS: 'Emergent Strategy' logic is active.");
        }

        console.log(`\n=== SIMULATION ${passed ? 'COMPLETED SUCCESSFULLY' : 'FAILED'} ===`);

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

simulateFullWorkflow().catch(console.error);
