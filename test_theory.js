const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

async function run() {
    try {
        const prompt = `
        You are an expert socio-technical theorist specializing in Actor-Network Theory (Latour, Callon, Law) and Assemblage Theory (Deleuze, Guattari, DeLanda).
        
        Your task is to translate the provided Policy Analysis Findings into high-level theoretical readings.
        
        INPUT DATA:
        {}
        
        INSTRUCTIONS:
        For each suitable key finding (select the top 3-5 most structural/systemic findings):
        1. State the Finding (Result N).
        2. Provide an "ANT Reading": Use concepts like Obligatory Passage Point (OPP), Inscription Devices, Translation, Enrollment, Black-boxing, Immutable Mobiles.
        3. Provide an "Assemblage Reading": Use concepts like Territorialization, Deterritorialization, Coding/Decoding, Stratification, Lines of Flight, Agencement.
        4. Add a final "Theoretical Contribution" section summary (Hevner-style relevance).
        
        FORMAT:
        Result 1: [Finding Summary]
        
        ANT Reading: [Analysis]
        
        Assemblage Reading: [Analysis]
        
        ...
        
        Theoretical Implications:
        [Summary]
        `;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: "You are a senior STS (Science and Technology Studies) scholar." },
                { role: "user", content: prompt }
            ],
            max_completion_tokens: 4000
        });

        console.log("Response text:", JSON.stringify(completion.choices[0].message.content));
        console.log("Finish reason:", completion.choices[0].finish_reason);
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
