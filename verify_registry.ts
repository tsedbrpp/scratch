import { PromptRegistry } from './src/lib/prompts/registry';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyRegistry() {
    console.log('Verifying Prompt Registry...');

    // Simulate a user
    const userId = 'test_user_123';

    // Test 1: Fetch a standard prompt
    console.log('\n--- Test 1: Fetch DSF Prompt ---');
    const dsfPrompt = await PromptRegistry.getEffectivePrompt(userId, 'dsf_lens');
    if (dsfPrompt && dsfPrompt.includes('Decolonial Situatedness Framework')) {
        console.log('✅ Success: Fetched DSF Prompt (Default)');
    } else {
        console.error('❌ Failed: DSF Prompt content mismatch or empty');
    }

    // Test 2: Fetch a specific lens prompt (Institutional Logics)
    console.log('\n--- Test 2: Fetch Institutional Logics Prompt ---');
    const logicsPrompt = await PromptRegistry.getEffectivePrompt(userId, 'institutional_logics');
    if (logicsPrompt && logicsPrompt.includes('Institutional Logics')) {
        console.log('✅ Success: Fetched Institutional Logics Prompt');
    } else {
        console.error('❌ Failed: Institutional Logics Prompt content mismatch');
    }

    // Test 3: Fetch a non-existent prompt (should default or error? Typescript prevents this but runtime?)
    // In our implementation, we cast strings, so let's see.
    // Actually getEffectivePrompt signature is (userId: string, promptId: string) 
    // but the implementation uses `keyof typeof PROMPT_DEFINITIONS` internally or string.

    console.log('Verification Complete.');
}

verifyRegistry().catch(err => console.error(err));
