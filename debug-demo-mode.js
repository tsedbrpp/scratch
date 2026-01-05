const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

console.log("NEXT_PUBLIC_ENABLE_DEMO_MODE:", process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE);
console.log("NEXT_PUBLIC_DEMO_USER_ID:", process.env.NEXT_PUBLIC_DEMO_USER_ID);
