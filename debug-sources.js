const fetch = require('node-fetch');

async function checkSources() {
    try {
        const response = await fetch('http://localhost:3000/api/sources');
        const data = await response.json();
        console.log("Total Sources:", data.length);
        data.forEach(s => {
            console.log(`Source: ${s.title}`);
            console.log(`  - Has Analysis: ${!!s.analysis}`);
            console.log(`  - Has Extracted Text: ${!!s.extractedText}`);
            console.log(`  - Text Length: ${s.extractedText ? s.extractedText.length : 0}`);
        });
    } catch (e) {
        console.error("Error:", e);
    }
}

checkSources();
