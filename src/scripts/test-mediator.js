
// Simple script to test the Analysis API
// Run with: node src/scripts/test-mediator.js

async function testMediatorApi() {
    const url = 'http://localhost:3000/api/relationships/analyze';
    const body = {
        prompt: "Analyze the relationship between 'EU AI Act' and 'High-Risk AI Systems'. Trace: 'The Act strictly regulates high-risk systems to ensure safety.'",
        mode: "json"
    };

    try {
        console.log("Testing Mediator API:", url);

        // Node 18+ has global fetch
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error("API Error:", response.status, response.statusText);
            const text = await response.text();
            console.error("Response:", text);
        } else {
            const data = await response.json();
            console.log("API Success!");
            console.log("Analysis Result:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        if (err.cause && err.cause.code === 'ECONNREFUSED') {
            console.error("Connection Refused. Is the server running on localhost:3000?");
        } else {
            console.error("Test Failed:", err);
        }
    }
}

testMediatorApi();
