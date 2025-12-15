const fetch = require('node-fetch');

async function testSearch() {
    console.log("Testing /api/search-traces...");
    try {
        const response = await fetch('http://localhost:3000/api/search-traces', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Mock user ID for dev environment if needed, though the API checks auth().
                // We might need to bypass auth or use a demo header if enabled.
            },
            body: JSON.stringify({
                customQuery: "uber driver resistance",
                platforms: ["reddit"]
            })
        });

        const text = await response.text();
        console.log("Raw Response:", text.substring(0, 500));
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.log("Response is not JSON.");
            return;
        }
        console.log("Status:", response.status);
        if (data.traces && data.traces.length > 0) {
            console.log("Trace Count:", data.traces.length);
            data.traces.slice(0, 5).forEach((t, i) => {
                console.log(`Trace ${i}: ${t.title} [${t.strategy}]`);
            });
        } else {
            console.log("No traces found or traces empty.");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testSearch();
