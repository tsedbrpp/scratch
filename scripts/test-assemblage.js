
// Usage: node scripts/test-assemblage.js
// Ensure your local server is running at localhost:3000
// Ensure NEXT_PUBLIC_ENABLE_DEMO_MODE=true and NEXT_PUBLIC_DEMO_USER_ID is set in .env.local

const API_URL = 'http://localhost:3000/api/analyze';

// !!! REPLACE THIS WITH YOUR DEMO USER ID FROM .env.local !!!
const DEMO_USER_ID = 'user_364D6LEBTCeN6mgbSfR8h3TrMdp';

async function testAssemblageExtraction() {
    console.log(`Testing Assemblage Extraction against ${API_URL}...`);

    const payload = {
        text: "The Ministry of Digital Affairs adopts a new National AI Accountability Framework modeled on emerging international standards. To ensure interoperability, the ministry collaborates with a regional standards consortium that provides technical templates for risk classification and documentation workflows. A major cloud provider hosts the compliance reporting portal, which automatically validates companies’ submissions before forwarding them to the Ministry.",
        analysisMode: "assemblage_extraction",
        sourceType: "Policy Document",
        force: true // Skip cache to test new prompt
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-demo-user-id': DEMO_USER_ID
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();

        if (data.success && data.analysis) {
            console.log("✅ Analysis Successful!");
            console.log("\n--- Assemblage Properties ---");
            console.log(JSON.stringify(data.analysis.assemblage.properties, null, 2));

            console.log("\n--- Actors (First 3) ---");
            data.analysis.actors.slice(0, 3).forEach(actor => {
                console.log(`[${actor.type}] ${actor.name}`);
                console.log(`   Role Type: ${actor.role_type}`);
                console.log(`   Evidence: ${actor.evidence_quotes?.[0] || 'None'}`);
            });

            console.log("\n--- Relations of Exteriority ---");
            if (data.analysis.assemblage.relations_of_exteriority) {
                const ext = data.analysis.assemblage.relations_of_exteriority;
                console.log(`Mobility Score: ${ext.mobility_score}`);
                console.log("Detachable Components:", ext.detachable);
                console.log("Embedded Components:", ext.embedded);
            } else {
                console.log("❌ No exteriority data found!");
            }
        } else {
            console.error("Analysis completed but returned no valid data:", data);
        }

    } catch (error) {
        console.error("Request failed:", error);
    }
}

testAssemblageExtraction();
