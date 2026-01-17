import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function DELETE() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Delete Redis Data
        // Keys: user:{id}:credits, user:{id}:usage, user:{id}:transactions
        const keys = [
            `user:${userId}:credits`,
            `user:${userId}:usage`,
            `user:${userId}:transactions`,
            `user:${userId}:settings`,
        ];

        // Also clean up any other potential keys by pattern scanning if needed, 
        // but explicit keys are safer and faster.

        // Pipeline deletion
        const pipeline = redis.pipeline();
        keys.forEach(key => pipeline.del(key));
        await pipeline.exec();

        // 2. Delete from Clerk
        const client = await clerkClient();
        await client.users.deleteUser(userId);

        return new NextResponse("Account deleted successfully", { status: 200 });
    } catch (error) {
        console.error("[DELETE_ACCOUNT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
