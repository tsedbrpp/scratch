
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Fetch User Profile from Clerk
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        // 2. Fetch User Data from Redis
        const keys = [
            `user:${userId}:credits`,
            `user:${userId}:usage`,
            `user:${userId}:transactions`,
            `user:${userId}:settings`,
        ];

        // Fetch all values in parallel
        const values = await redis.mget(keys);

        // 3. Construct Export Bundle
        const exportData = {
            id: userId,
            timestamp: new Date().toISOString(),
            profile: {
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
            },
            data: {
                credits: values[0],
                usage: values[1] ? JSON.parse(values[1] as string) : null,
                transactions: values[2] ? JSON.parse(values[2] as string) : [],
                settings: values[3] ? JSON.parse(values[3] as string) : null,
            },
            // Note: Sources and Analyses are stored locally in IndexedDB (frontend) 
            // or in a separate Redis structure if implemented previously. 
            // Based on current codebase, documents seem to be client-side state or ephemeral?
            // Checking ArtifactRepository usage suggests local state or distinct backend store.
            // If strictly Redis KV, we might need to scan for more keys if documents are server-side.
            // For now, this covers the primary monetized/tracked data.

            // Re-checking artifacts: The app seems to rely heavily on client-side state for the actual analysis content 
            // in some flows, but let's double check if there's a server-side store for documents.
            // ... (Verified: Main persistence seems to be client-side or ephemeral execution for now, 
            // aside from what's tracked in usage logs).

            legal: {
                export_reason: "GDPR Article 20 - Data Portability",
                processor: "instantTEA",
            }
        };

        return NextResponse.json(exportData);

    } catch (error) {
        console.error("[EXPORT_DATA]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
