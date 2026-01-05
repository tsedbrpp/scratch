const fetch = require('node-fetch');

async function testSearch() {
    try {
        console.log("Testing /api/resistance/search fallback...");
        const response = await fetch('http://localhost:3000/api/resistance/search?q=test_query');

        console.log(`Status: ${response.status}`);
        const data = await response.json();

        console.log("Source:", data.source);
        console.log("Result Count:", data.results?.length);

        if (data.source === 'mock' && data.results.length > 0) {
            console.log("✅ Fallback verification successful: Mock data returned.");
        } else {
            console.error("❌ Verification failed:", data);
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testSearch();
