import { StructuralConcernService } from './src/lib/structural-concern-service';
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

    console.log("===================================");
    console.log("Testing Grounded Payload...");
    try {
        const result1 = await StructuralConcernService.analyzeStructuralConcern(
            openai,
            'test-user-id',
            'International Organizations',
            'Brazil AI Strategy 2021',
            groundedExcerpts
        );
        console.log("Result (Grounded):");
        console.log(JSON.stringify(result1, null, 2));
    } catch (e) {
        console.error(e);
    }

    const hallucinatedExcerpts = [
        { id: 'exc-99', text: 'The law applies to agricultural sensors, specifically tractors with GPS.' }
    ];

    console.log("\\n===================================");
    console.log("Testing Hallucination Payload...");
    try {
        const result2 = await StructuralConcernService.analyzeStructuralConcern(
            openai,
            'test-user-id',
            'UNESCO',
            'Brazil AI Strategy 2021',
            hallucinatedExcerpts
        );
        console.log("Result (Hallucinated - Should have insufficientEvidence: true):");
        console.log(JSON.stringify(result2, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
