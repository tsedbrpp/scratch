import { NextRequest, NextResponse } from 'next/server';
import { calculateDrift } from '@/lib/governance';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    let { userId } = await auth();

    // Check for demo user if not authenticated
    if (!userId && process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
        const demoUserId = request.headers.get('x-demo-user-id');
        if (demoUserId === process.env.NEXT_PUBLIC_DEMO_USER_ID) {
            userId = demoUserId;
        }
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { policyText, techText } = body;

        if (!policyText || !techText) {
            return NextResponse.json(
                { error: 'Both policyText and techText are required' },
                { status: 400 }
            );
        }

        const driftAnalysis = calculateDrift(policyText, techText);

        return NextResponse.json({
            success: true,
            analysis: driftAnalysis
        });

    } catch (error) {
        console.error('Governance compass analysis error:', error);
        return NextResponse.json(
            { error: 'Analysis failed' },
            { status: 500 }
        );
    }
}
