// Quick test to verify your Google Search API credentials
// Run this with: node test-google-search.js

async function testGoogleSearch() {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    console.log('🔍 Checking environment variables...\n');

    if (!apiKey) {
        console.log('❌ GOOGLE_SEARCH_API_KEY is not set');
        return;
    }
    console.log('✅ GOOGLE_SEARCH_API_KEY is set');
    console.log(`   Length: ${apiKey.length} characters`);
    console.log(`   Preview: ${apiKey.substring(0, 10)}...`);

    if (!searchEngineId) {
        console.log('❌ GOOGLE_SEARCH_ENGINE_ID is not set');
        return;
    }
    console.log('✅ GOOGLE_SEARCH_ENGINE_ID is set');
    console.log(`   Value: ${searchEngineId}`);

    console.log('\n🌐 Testing API connection...\n');

    try {
        const searchQuery = 'test';
        const enhancedQuery = `${searchQuery} (site:reddit.com OR site:news.ycombinator.com OR site:*.stackexchange.com OR inurl:forum OR inurl:discussion)`;
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&num=1`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.log('❌ API Error:', data.error.message);
            console.log('   Status:', data.error.status);
            if (data.error.status === 'INVALID_ARGUMENT') {
                console.log('\n💡 Tip: Check that your Search Engine ID is correct');
            }
        } else if (data.items) {
            console.log('✅ API is working!');
            console.log(`   Found ${data.items.length} result(s)`);
            console.log(`   First result: ${data.items[0].title}`);
        } else {
            console.log('⚠️  API responded but no results found');
        }
    } catch (error) {
        console.log('❌ Connection Error:', error.message);
    }
}

testGoogleSearch();
