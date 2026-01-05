const urls = [
    "https://www.eff.org/deeplinks/2023/12/eu-ai-act-deal-reached-human-rights-still-risk",
    "https://blog.mozilla.org/en/mozilla/eu-ai-act/"
];

async function checkUrls() {
    for (const url of urls) {
        try {
            console.log(`Checking ${url}...`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            console.log(`Status: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.error(`Failed: ${error.message}`);
        }
        console.log('---');
    }
}

checkUrls();
