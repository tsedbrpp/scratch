const fetch = require('node-fetch');

async function testAnalysis() {
    const artifactText = "This automated system is a form of digital colonialism. We refuse to be data subjects. We claim sovereignty over our digital territories.";

    console.log("Testing discourse analysis API...");
    try {
        const response = await fetch('http://localhost:3000/api/resistance/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                artifact_id: 'test-id',
                artifact_text: artifactText,
                analysis_type: 'full'
            })
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        if (data.success) {
            console.log("SUCCESS: Analysis received");
            console.log(JSON.stringify(data.analysis, null, 2));
        } else {
            console.error("FAILURE: API returned error");
            console.error(data);
        }
    } catch (e) {
        console.error("FAILURE: Network or script error", e);
    }
}

testAnalysis();
