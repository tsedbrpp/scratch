import { StorageService } from './src/lib/storage-service';
import { loadEnvConfig } from '@next/env';

async function run() {
    loadEnvConfig(process.cwd());
    const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID;
    if (!userId) {
        console.log("No demo user id");
        return;
    }

    const data = await StorageService.get(userId, 'synthesis_comparison_result') as Record<string, any>;
    console.log("Data exists:", !!data);
    if (data) {
        const str = JSON.stringify(data);
        console.log("Keys in data:", Object.keys(data));
        if (data.key_divergences && Array.isArray(data.key_divergences) && data.key_divergences.length > 0) {
            console.log("Divergences length:", data.key_divergences.length);
            console.log("First divergence keys:", Object.keys(data.key_divergences[0] as object));
        }
    }
}

run().catch(console.error);
