const path = require('path');
const dotenv = require('dotenv');

// Explicitly load from absolute path
const envPath = path.resolve(__dirname, '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env.local:", result.error);
}

console.log("Loading env from:", envPath);
console.log("GOOGLE_SEARCH_API_KEY present:", !!process.env.GOOGLE_SEARCH_API_KEY);
console.log("GOOGLE_SEARCH_CX present:", !!process.env.GOOGLE_SEARCH_CX);

if (process.env.GOOGLE_SEARCH_API_KEY) {
    console.log("Key length:", process.env.GOOGLE_SEARCH_API_KEY.length);
}
