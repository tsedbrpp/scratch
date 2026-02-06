'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type WorkspaceType = 'PERSONAL' | 'TEAM';

export interface Team {
    id: string;
    name: string;
    createdBy: string;
    createdAt: number;
    status: string;
}

interface WorkspaceContextProps {
    // State
    currentWorkspaceId: string | null;
    workspaceType: WorkspaceType;
    availableTeams: Team[];
    isLoading: boolean;

    // Actions
    switchWorkspace: (id: string) => void;
    refreshTeams: () => Promise<void>;
    createTeam: (name: string) => Promise<boolean>;
}

// ----------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
    return context;
};

// ----------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId, isLoaded } = useAuth();

    const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
    const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Initialize Workspace ID (Personal by default)
    useEffect(() => {
        if (isLoaded && userId && !currentWorkspaceId) {
            // Restore from localStorage if possible
            const saved = localStorage.getItem('last_workspace_id');
            if (saved) {
                // Optimistically set the saved ID (Team or Personal)
                setCurrentWorkspaceId(saved);
            } else {
                // Default to Personal IMMEDIATELY if no saved state
                setCurrentWorkspaceId(userId);
            }
        }
    }, [isLoaded, userId, currentWorkspaceId]);

    // 2. Fetch Teams
    const fetchTeams = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/collaboration/teams');
            if (res.ok) {
                const data = await res.json();
                setAvailableTeams(data.teams || []);

                // Re-hydrate selection from LocalStorage if valid
                const saved = localStorage.getItem('last_workspace_id');
                if (saved && saved !== userId) {
                    const exists = data.teams.some((t: Team) => t.id === saved);
                    if (exists) {
                        setCurrentWorkspaceId(saved);
                    }
                }
            } else {
                console.error('Failed to fetch teams');
                // Don't toast error on background fetch, distracts user
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchTeams();
        }
    }, [userId]);

    // 3. Actions
    const switchWorkspace = (id: string) => {
        setCurrentWorkspaceId(id);
        localStorage.setItem('last_workspace_id', id);

        // Safety: If switching to personal, force ID check
        if (id === userId) {
            toast.success('Switched to Personal Workspace');
        } else {
            const team = availableTeams.find(t => t.id === id);
            if (team) toast.success(`Switched to ${team.name}`);
        }

        // Logic: Trigger a "soft reload" or data re-fetch?
        // In simple React apps, context change triggers re-render of consumers.
        // If consumers use `currentWorkspaceId` as a query key for basic data, it handles itself.
        // We assume components like useAnalysis() will use this ID.
    };

    const createTeam = async (name: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/collaboration/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Failed to create team');
                return false;
            }

            toast.success('Team created successfully');
            await fetchTeams(); // Refresh list
            switchWorkspace(data.teamId); // Auto-switch
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Network error creating team');
            return false;
        }
    };

    // Derived State
    const workspaceType = (currentWorkspaceId && currentWorkspaceId.startsWith('team_')) ? 'TEAM' : 'PERSONAL';

    return (
        <WorkspaceContext.Provider value={{
            currentWorkspaceId,
            workspaceType,
            availableTeams,
            isLoading,
            switchWorkspace,
            refreshTeams: fetchTeams,
            createTeam
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
