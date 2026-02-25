import fetch from 'node-fetch';

async function run() {
    const payload = {
        analysisMode: 'structural_concern',
        actorName: 'International Organizations',
        title: 'Brazil AI Strategy 2021',
        force: true,
        excerpts: [
            { id: 'exc-1', text: 'The Executive Branch will designate the competent authority.' }
        ]
    };

    let res = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-demo-user-id': 'user_364D6LEBTCeN6mgbSfR8h3TrMdp'
        },
        body: JSON.stringify(payload)
    });
    console.log(await res.text());
}

run();
