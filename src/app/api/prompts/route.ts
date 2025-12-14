import { NextRequest, NextResponse } from 'next/server';
import { PromptRegistry, PromptId } from '@/lib/prompts/registry';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    let { userId } = await auth();

    // Demo Mode Override
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const definitions = PromptRegistry.getAllDefinitions();

    // Fetch values for all prompts in parallel
    const promptsWithValues = await Promise.all(definitions.map(async (def) => {
        const effectiveValue = await PromptRegistry.getEffectivePrompt(userId!, def.id);
        return {
            ...def,
            currentValue: effectiveValue,
            isModified: effectiveValue !== def.defaultValue
        };
    }));

    return NextResponse.json({ prompts: promptsWithValues });
}

export async function POST(request: NextRequest) {
    let { userId } = await auth();

    // Demo Mode Override
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, value, action } = body;

        if (!id) {
            return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
        }

        if (action === 'reset') {
            await PromptRegistry.resetToDefault(userId, id as PromptId);
        } else {
            if (!value) {
                return NextResponse.json({ error: "Value is required for update" }, { status: 400 });
            }
            await PromptRegistry.saveOverride(userId, id as PromptId, value);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update prompt:", error);
        return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
    }
}
