
const { OpenAI } = require('openai');

// Mock environment
const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;
const model = process.env.OPENAI_MODEL || "gpt-4o";

console.log("Testing OpenAI Configuration:");
console.log("Model:", model);
console.log("Base URL:", baseURL || "Default (OpenAI)");

if (!apiKey) {
    console.error("Error: OPENAI_API_KEY is missing in environment.");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL
});

async function testConnection() {
    try {
        console.log("Sending test request...");
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Say 'Connection Successful' if you can hear me." }
            ]
        });
        console.log("Response:", completion.choices[0].message.content);
        console.log("SUCCESS: Backend configuration is valid.");
    } catch (error) {
        console.error("FAILURE: OpenAI API call failed.");
        console.error(error);
    }
}

testConnection();
