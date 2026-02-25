import fetch from 'node-fetch';

async function run() {
    const res = await fetch('http://localhost:3000/api/prompts', {
        headers: {
            'x-demo-user-id': 'user_364D6LEBTCeN6mgbSfR8h3TrMdp'
        }
    });
    const data = await res.json();
    if (data.prompts) {
        const found = data.prompts.find((p: any) => p.id === 'structural_concern');
        console.log('Found structural_concern?', !!found);
        if (!found) {
            console.log('Available IDs:', data.prompts.map((p: any) => p.id));
        }
    } else {
        console.log('Error:', data);
    }
}
run();
