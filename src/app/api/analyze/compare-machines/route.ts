import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import { validateWorkspaceAccess } from "@/lib/auth-middleware";
import { StorageService } from "@/lib/storage-service";
import { getSources } from "@/lib/store";
import { aiCompareAbstractMachinesSchema, getCompareAbstractMachinesPrompt } from "@/lib/prompts/compare-machines";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const requestSchema = z.object({
    leftId: z.string(),
    rightId: z.string(),
    force: z.boolean().optional().default(false),
});

function stripQuotes(obj: unknown): unknown {
    if (Array.isArray(obj)) {
        return obj.map(stripQuotes);
    }
    if (obj !== null && typeof obj === "object") {
        const newObj: Record<string, unknown> = {};
        for (const key of Object.keys(obj)) {
            if (key !== "supporting_quotes") {
                newObj[key] = stripQuotes((obj as Record<string, unknown>)[key]);
            }
        }
        return newObj;
    }
    return obj;
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let contextId = userId;
        try {
            const workspaceId = req.headers.get('x-workspace-id');
            if (workspaceId) {
                const access = await validateWorkspaceAccess(userId, workspaceId);
                if (access.allowed) {
                    contextId = workspaceId;
                }
            }
        } catch (e: unknown) {
            console.error("[compare-machines] Auth Context error:", e);
        }

        const body = await req.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { leftId, rightId, force } = parsed.data;

        // Check Cache (Comparison analyses are shared globally through Demo Account ID if Demo mode enabled)
        const cacheContextId = process.env.NEXT_PUBLIC_DEMO_USER_ID || contextId;
        const cacheKey = `ai_compare_v2.1:${leftId}:${rightId}`;

        if (!force) {
            const cached = await StorageService.get<unknown>(cacheContextId, cacheKey);
            if (cached) {
                return NextResponse.json(cached);
            }
        }

        // Fetch Machines using the central store method to retrieve from sources_v2 hash
        const allSources = await getSources(contextId);
        const leftSource = allSources.find(s => s.id === leftId);
        const rightSource = allSources.find(s => s.id === rightId);

        if (!leftSource?.analysis?.abstract_machine || !rightSource?.analysis?.abstract_machine) {
            return NextResponse.json({ error: "Both documents must have an extracted abstract machine." }, { status: 400 });
        }

        // Strip heavy arrays to save tokens
        const leftStripped = stripQuotes(leftSource.analysis.abstract_machine);
        const rightStripped = stripQuotes(rightSource.analysis.abstract_machine);

        // Call LLM (using a seed for best-effort reproducibility)
        const modelName = process.env.OPENAI_MODEL || "gpt-5.1-2025-11-13";
        const { object } = await generateObject({
            model: openai(modelName),
            schema: aiCompareAbstractMachinesSchema,
            prompt: getCompareAbstractMachinesPrompt(
                leftSource.title,
                rightSource.title,
                JSON.stringify(leftStripped),
                JSON.stringify(rightStripped)
            ),
            temperature: 0.7,
            seed: 42,
        });

        // Save strictly formatted object
        const payload = {
            model_name: modelName,
            schema_version: 2.1,
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
            system_fingerprint: null,
            comparison: object
        };

        await StorageService.set(cacheContextId, cacheKey, payload);

        return NextResponse.json(payload);

    } catch (error) {
        console.error("[compare-machines] Error:", error);
        return NextResponse.json({ error: "Failed to generate comparison" }, { status: 500 });
    }
}
