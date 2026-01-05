const fetch = require('node-fetch');

async function testFetch400() {
    console.log("Testing /api/fetch-url for 400 error...");

    const headers = {
        'Content-Type': 'application/json',
        'x-demo-user-id': 'demo-user'
    };

    // Test 1: Empty object (simulate url undefined)
    const response1 = await fetch('http://localhost:3000/api/fetch-url', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({})
    });
    console.log(`Test 1 (Empty Body) Status: ${response1.status}`);
    const data1 = await response1.json();
    console.log(`Test 1 Response:`, data1);

    // Test 2: Valid URL
    const response2 = await fetch('http://localhost:3000/api/fetch-url', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ url: "https://example.com" })
    });
    console.log(`Test 2 (Valid URL) Status: ${response2.status}`);

}

testFetch400();
