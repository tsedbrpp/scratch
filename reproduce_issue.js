
const fetch = require('node-fetch');

async function testStressTest() {
    const existingAnalysis = {
        governance_scores: {
            centralization: 70,
            rights_focus: 60,
            flexibility: 50,
            market_power: 40,
            procedurality: 80
        },
        key_insight: "This is a test insight",
        inverted_text: "Inverted text for testing purposes."
    };

    const payload = {
        text: "Original text content here...",
        analysisMode: 'stress_test',
        existingAnalysis: existingAnalysis
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(result, null, 2));

        if (result.analysis && result.analysis.governance_scores) {
            console.log('SUCCESS: governance_scores preserved.');
        } else {
            console.error('FAILURE: governance_scores MISSING.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testStressTest();
