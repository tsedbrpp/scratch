/* eslint-disable */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually since we're running a standalone script
const envPath = path.join(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });
}

const API_KEY = env.GOOGLE_SEARCH_API_KEY;
const CX = env.GOOGLE_SEARCH_CX || env.GOOGLE_SEARCH_ENGINE_ID;

if (!API_KEY || !CX) {
    console.log("Missing API keys in .env.local");
    process.exit(1);
}

function search(query) {
    return new Promise((resolve, reject) => {
        const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function runTest() {
    console.log("Testing Search Engine Configuration...");

    try {
        // Test 1: Wikipedia (Should work if engine is "Search the entire web")
        console.log("Attempting search: 'AI site:wikipedia.org'...");
        const wikiResults = await search('AI site:wikipedia.org');
        const wikiCount = wikiResults.items ? wikiResults.items.length : 0;
        console.log(`Wikipedia Results: ${wikiCount}`);

        // Test 2: Reddit (Should work if engine is valid)
        console.log("Attempting search: 'AI site:reddit.com'...");
        const redditResults = await search('AI site:reddit.com');
        const redditCount = redditResults.items ? redditResults.items.length : 0;
        console.log(`Reddit Results: ${redditCount}`);

        console.log("\n--- DIAGNOSIS ---");
        if (redditCount > 0 && wikiCount === 0) {
            console.log("RESTRICTED: The search engine is configured to ONLY search specific sites (likely just Reddit).");
            console.log("You need to enable 'Search the entire web' in your Google Programmable Search Engine settings.");
        } else if (redditCount > 0 && wikiCount > 0) {
            console.log("OPEN: The search engine is correctly searching the web.");
            console.log("If you are still seeing only Reddit results, it might be a relevance/ranking issue.");
        } else {
            console.log("BROKEN: Neither search returned results. Check your API Key and Quota.");
        }

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

runTest();
