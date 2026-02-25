import { PromptRegistry } from './src/lib/prompts/registry';
import { StorageService } from './src/lib/storage-service';
import OpenAI from 'openai';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function runTest() {
    const openai = new OpenAI();

    // Simulate what the service is doing
    let systemPrompt = await PromptRegistry.getEffectivePrompt('system', 'structural_concern'); // ID is wrong here in service too - 'system' vs 'structural_concern'
    console.log("FETCHED SYSTEM PROMPT:", systemPrompt);
}

runTest();
