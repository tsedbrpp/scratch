import { NextRequest, NextResponse } from 'next/server';
import { getSources } from '@/lib/store';
import { getAuthenticatedUserId } from '@/lib/auth-helper';
import { validateWorkspaceAccess } from '@/lib/auth-middleware';

// Helper to resolve effective context
async function getEffectiveContext(req: NextRequest, userId: string) {
    const workspaceId = req.headers.get('x-workspace-id');
    const targetContext = workspaceId || userId;
    const access = await validateWorkspaceAccess(userId, targetContext);

    if (!access.allowed) {
        throw new Error('Access Denied to Workspace');
    }

    return { contextId: targetContext, role: access.role };
}

export async function GET(request: NextRequest) {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { contextId } = await getEffectiveContext(request, userId);
        const sources = await getSources(contextId);

        const searchParams = request.nextUrl.searchParams;
        const isListOnly = searchParams.get('list') === 'true';
        const idsParam = searchParams.get('ids');

        // Filter sources to only those that have an abstract machine extracted
        const sourcesWithMachines = sources.filter(s => s.analysis?.abstract_machine);

        if (idsParam) {
            const ids = idsParam.split(',').map(id => id.trim());
            // Return full abstract machines for requested IDs
            const requestedMachines = sourcesWithMachines
                .filter(s => ids.includes(s.id))
                .map(s => ({
                    id: s.id,
                    title: s.title,
                    abstract_machine: s.analysis!.abstract_machine
                }));
            return NextResponse.json(requestedMachines);
        }

        // Default or list=true: return lightweight list
        const lightweightList = sourcesWithMachines.map(s => ({
            id: s.id,
            title: s.title
        }));

        return NextResponse.json(lightweightList);

    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown Error';
        if (msg === 'Access Denied to Workspace') return new NextResponse("Forbidden", { status: 403 });
        return NextResponse.json({ error: 'Failed to fetch abstract machines' }, { status: 500 });
    }
}
