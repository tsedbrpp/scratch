'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { toast } from 'sonner';

export interface TeamMember {
    userId: string;
    email: string;
    role: 'OWNER' | 'EDITOR';
    joinedAt: number;
    name?: string;
}

export interface TeamDetails {
    id: string;
    name: string;
    createdBy: string;
    createdAt: number;
    members: TeamMember[];
}

export const useTeam = () => {
    const { currentWorkspaceId, workspaceType } = useWorkspace();
    const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isTeamWorkspace = workspaceType === 'TEAM';

    // Fetch team details and members
    const fetchTeamDetails = async () => {
        if (!isTeamWorkspace || !currentWorkspaceId) {
            setTeamDetails(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/collaboration/teams/${currentWorkspaceId}`);

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('Team not found');
                } else if (res.status === 403) {
                    throw new Error('You do not have access to this team');
                }
                throw new Error('Failed to fetch team details');
            }

            const data = await res.json();
            setTeamDetails(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Invite member
    const inviteMember = async (email: string, role: 'OWNER' | 'EDITOR' = 'EDITOR') => {
        if (!currentWorkspaceId) return { success: false, error: 'No team selected' };

        try {
            const res = await fetch('/api/collaboration/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: currentWorkspaceId, email, role })
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Failed to create invitation' };
            }

            toast.success(`Invitation sent to ${email}`);
            return { success: true, token: data.token, expiresAt: data.expiresAt };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Network error';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Remove member
    const removeMember = async (userId: string) => {
        if (!currentWorkspaceId) return { success: false, error: 'No team selected' };

        try {
            const res = await fetch(`/api/collaboration/teams/${currentWorkspaceId}/members/${userId}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Failed to remove member' };
            }

            toast.success('Member removed from team');
            await fetchTeamDetails(); // Refresh
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Network error';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Auto-fetch when workspace changes
    useEffect(() => {
        fetchTeamDetails();
    }, [currentWorkspaceId, workspaceType]);

    return {
        teamDetails,
        isLoading,
        error,
        isTeamWorkspace,
        inviteMember,
        removeMember,
        refreshTeam: fetchTeamDetails
    };
};
