const fetch = require('node-fetch');

async function testFetch() {
    const urls = [
        "https://edri.org/wp-content/uploads/2021/12/Political-statement-AI-Act.pdf",
        "https://www.accessnow.org/wp-content/uploads/2022/11/Access-Now-Version-Human-Rights-Implications-of-Algorithmic-Impact-Assessme-nts_-Priority-Recommendations-to-Guide-Effective-Development-and-Use.pdf"
    ];

    console.log("Testing fetch-url API with real PDFs...");

    for (const url of urls) {
        try {
            console.log(`\nFetching: ${url}`);
            const response = await fetch('http://localhost:3000/api/fetch-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                console.log(`SUCCESS: Fetched ${data.title}`);
                console.log(`Content length: ${data.content.length} characters`);
                console.log(`Sample: ${data.content.substring(0, 100)}...`);
            } else {
                console.error(`FAILURE: ${response.status} - ${data.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(`FAILURE: Network error for ${url}`, e.message);
        }
    }
}

testFetch();
