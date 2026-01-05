const fetch = require('node-fetch');

async function testFetchUrlAuth() {
    try {
        console.log("Testing /api/fetch-url auth fix...");
        const urlToFetch = "https://www.example.com";
        const body = JSON.stringify({ url: urlToFetch });

        // Emulate the frontend logic for headers
        const headers = {
            'Content-Type': 'application/json',
            'x-demo-user-id': 'demo-user' // Using the default we patched in
        };

        const response = await fetch('http://localhost:3000/api/fetch-url', {
            method: 'POST',
            headers: headers,
            body: body
        });

        console.log(`Status: ${response.status}`);

        if (response.status === 401) {
            console.error("❌ Still Unauthorized (401)");
        } else if (response.status === 200) {
            console.log("✅ Success: Authorized (200)");
            const data = await response.json();
            console.log("Response data preview:", JSON.stringify(data).substring(0, 100));
        } else {
            console.log(`Received status ${response.status}`);
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testFetchUrlAuth();
