
import fetch from 'node-fetch';

async function testMediatorApi() {
    const url = 'http://localhost:3000/api/relationships/analyze'; // Adjust port if needed
    const body = {
        prompt: "Analyze the relationship between 'EU AI Act' and 'High-Risk AI Systems'. Trace: 'The Act strictly regulates high-risk systems to ensure safety.'",
        mode: "json"
    };

    try {
        console.log("Testing Mediator API:", url);
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
        console.error("Test Failed:", err);
    }
}

testMediatorApi();
