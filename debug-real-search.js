require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function debugSearch() {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;
    const query = "AI Act resistance manifesto filetype:pdf";

    if (!apiKey || !cx) {
        console.error("❌ Keys not found in .env.local");
        return;
    }

    console.log(`Using Key: ${apiKey.substring(0, 5)}...`);
    console.log(`Using CX: ${cx}`);
    console.log(`Query: ${query}`);

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log(`Total Results: ${data.searchInformation?.totalResults}`);

        if (data.items) {
            data.items.slice(0, 3).forEach((item, i) => {
                console.log(`\n[${i + 1}] ${item.title}`);
                console.log(`    Link: ${item.link}`);
                console.log(`    Snippet: ${item.snippet}`);
            });
        } else {
            console.log("No items returned.");
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

debugSearch();
