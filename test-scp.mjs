import fetch from 'node-fetch';

async function run() {
    const payload = {
        analysisMode: 'structural_concern',
        actorName: 'International Organizations',
        title: 'Brazil AI Strategy 2021',
        force: true,
        excerpts: [
            { id: 'exc-1', text: 'The Executive Branch will designate the competent authority.' },
            { id: 'exc-2', text: 'Coordination occurs between the competent authority and public bodies of the public administration.' },
            { id: 'exc-3', text: 'Promote cooperation actions with authorities in other countries, of an international or transnational nature.' },
            { id: 'exc-4', text: 'Standards preceded by public consultation and hearings.' }
        ]
    };

    console.log("Testing Grounded Payload...");
    let res = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    console.log(JSON.stringify(await res.json(), null, 2));

    const hallucinationPayload = {
        analysisMode: 'structural_concern',
        actorName: 'UNESCO',
        title: 'Brazil AI Strategy 2021',
        force: true,
        excerpts: [
            { id: 'exc-99', text: 'The law applies to agricultural sensors, specifically tractors with GPS.' }
        ]
    };

    console.log("\\n\\nTesting Hallucination Payload (Should return insufficientEvidence: true)...");
    res = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hallucinationPayload)
    });
    console.log(JSON.stringify(await res.json(), null, 2));
}

run();
