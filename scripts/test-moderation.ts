import { isContentFlagged } from '../src/lib/moderation-service';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTests() {
    console.log("--- Testing OpenAI Moderation Service ---");

    const safeText = "The EU AI Act provides a legal framework for artificial intelligence.";
    const flaggedText = "I want to kill them all. I will murder everyone in the building with a bomb."; // OpenAI's standard trigger for violence

    try {
        console.log("\nTesting Safe Text:");
        console.log(`Input: "${safeText}"`);
        const isSafeFlagged = await isContentFlagged(safeText);
        console.log(`Flagged: ${isSafeFlagged}`);
        if (!isSafeFlagged) {
            console.log("✅ PASS: Safe text passed moderation.");
        } else {
            console.error("❌ FAIL: Safe text was flagged incorrectly.");
        }

        console.log("\nTesting Unsafe Text:");
        console.log(`Input: "${flaggedText}"`);
        const isUnsafeFlagged = await isContentFlagged(flaggedText);
        console.log(`Flagged: ${isUnsafeFlagged}`);
        if (isUnsafeFlagged) {
            console.log("✅ PASS: Unsafe text was correctly flagged.");
        } else {
            console.error("❌ FAIL: Unsafe text bypassed moderation.");
        }

    } catch (e) {
        console.error("Test failed due to exception:", e);
    }
}

runTests();
