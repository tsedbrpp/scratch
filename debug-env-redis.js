const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

console.log("REDIS_URL present:", !!process.env.REDIS_URL);
if (process.env.REDIS_URL) {
    console.log("REDIS_URL value preview:", process.env.REDIS_URL.substring(0, 15) + "...");
} else {
    console.log("REDIS_URL is NOT set (using default localhost)");
}
