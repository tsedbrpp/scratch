
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { RESISTANCE_SYSTEM_PROMPT } from '../src/lib/prompts/resistance';
import { COMPARISON_SYSTEM_PROMPT } from '../src/lib/prompts/comparison';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testEmergentStrategy() {
    console.log('\n--- TEST 1: EMERGENT STRATEGY IDENTIFICATION ---');
    const text = "To protest the new algorithmic scheduling, we didn't strike. Instead, we all logged on at exactly 9:00 AM, accepted every single ride request, filled out every safety form with maximum detail (taking 10 minutes per form), and overwhelmed the validation server. It wasn't a refusal; it was hyper-compliance.";

    console.log('Input Text:', text);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: RESISTANCE_SYSTEM_PROMPT },
                { role: "user", content: `Analyze the following text for resistance:\n"${text}"` }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        console.log('\nResult:', JSON.stringify(result, null, 2));

        if (result.strategy_detected?.includes("Emergent") || result.strategy_detected?.includes("Malicious Compliance")) {
            console.log("✅ PASS: Emergent Strategy Detected.");
        } else {
            console.log("⚠️ WARNING: Emergent Strategy NOT detected (Check Prompt Logic).");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function testTransversalResonance() {
    console.log('\n--- TEST 2: TRANSVERSAL RESONANCE SYNTHESIS ---');

    const sourceA = `
  [Brazil PL 2338 Context]
  Drivers in Sao Paulo use "Gambiarra" strategies like GPS-spoofing to force surge pricing. This is a creative improvisation to survive capability gaps.
  `;

    const sourceB = `
  [EU AI Act Context]
  In Berlin, riders use "GPS-Cloaking" tools to hide from the algorithm's tracking while on break. This mirrors the improvisation seen in the Global South, but adapting to GDPR privacy rules.
  `;

    console.log('Source A:', sourceA);
    console.log('Source B:', sourceB);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: COMPARISON_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `SOURCE A (Brazil):\n${sourceA}\n\nSOURCE B (EU):\n${sourceB}\n\nCompare these contexts. specifically focusing on Transversal Resonances.`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        console.log('\nResult (Resonances Section):', JSON.stringify(result.resonances, null, 2));

        if (result.resonances) {
            console.log("✅ PASS: Resonances Object Found.");
            if (result.resonances.narrative.includes("parallel") || result.resonances.narrative.includes("resonate")) {
                console.log("✅ PASS: Narrative reflects 'Resonance' logic.");
            }
        } else {
            console.log("❌ FAIL: 'resonances' key missing from output.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

async function run() {
    await testEmergentStrategy();
    await testTransversalResonance();
}

run();
