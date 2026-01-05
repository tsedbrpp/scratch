const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

async function sync() {
    const redis = new Redis(process.env.REDIS_URL);
    // Move user:demo-user... to user:user_364D6LE... OR vice versa?
    // User wants VERCEL docs on LOCALHOST.
    // Vercel = Real User (user_364...)
    // Localhost = Demo User (demo-user)
    // So we copy FROM Real User TO Demo User.

    // BUT script said "Source data not found" for Real User.
    // This implies the Real User ALSO doesn't have data in the standard key?
    // OR my hardcoded ID was wrong.

    // Let's copy from 'user:demo-user:storage:sources' (which has the local migration) 
    // TO 'user:user_364D6LEBTCeN6mgbSfR8h3TrMdp:storage:sources' just in case they log in?
    // No, user wants the opposite.

    // Wait, the previous migration moved Local -> Remote as 'user:demo-user:storage:sources'.
    // If Vercel has documents, they are under 'user:user_364...'.
    // If they are missing there, then Vercel is empty too?

    // Let's just list ALL 'sources' keys.
    const keys = await redis.keys('*:sources');
    console.log("Found source keys:", keys);

    redis.disconnect();
}
sync();
