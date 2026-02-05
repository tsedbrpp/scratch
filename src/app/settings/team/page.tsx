'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { useTeam } from '@/hooks/useTeam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InviteMemberDialog } from '@/components/collaboration/InviteMemberDialog';
import { TeamMembers } from '@/components/collaboration/TeamMembers';
import { Users, UserPlus, ArrowLeft, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TeamSettingsPage() {
    const router = useRouter();
    const { workspaceType, currentWorkspaceId } = useWorkspace();
    const { teamDetails, isLoading, error, isTeamWorkspace, removeMember } = useTeam();
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    // Guard: Redirect if not in team workspace
    if (!isTeamWorkspace) {
        return (
            <div className="container max-w-4xl mx-auto py-12">
                <Card className="bg-zinc-700 border-zinc-500">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Users className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                            <h2 className="text-xl font-semibold text-zinc-300 mb-2">Not in a Team Workspace</h2>
                            <p className="text-zinc-400 mb-4">
                                Switch to a team workspace to manage team settings.
                            </p>
                            <Button onClick={() => router.push('/dashboard')} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-12 space-y-6">
                <Skeleton className="h-32 bg-zinc-800" />
                <Skeleton className="h-64 bg-zinc-800" />
            </div>
        );
    }

    // Error state
    if (error || !teamDetails) {
        return (
            <div className="container max-w-4xl mx-auto py-12">
                <Card className="bg-zinc-700 border-zinc-500">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <p className="text-red-400">{error || 'Failed to load team details'}</p>
                            <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentUserMember = teamDetails.members.find(m => m.userId === currentWorkspaceId);
    const currentUserRole = currentUserMember?.role;
    const isOwner = currentUserRole === 'OWNER';

    return (
        <div className="container max-w-4xl mx-auto py-12 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-400" />
                        Team Settings
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage your team members and settings</p>
                </div>
                <Button onClick={() => router.push('/dashboard')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Team Info Card */}
            <Card className="bg-zinc-700 border-zinc-500">
                <CardHeader>
                    <CardTitle className="text-white">Team Information</CardTitle>
                    <CardDescription>Basic details about your team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-zinc-400">Team Name</p>
                            <p className="text-white font-medium">{teamDetails.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Created</p>
                            <p className="text-white">
                                {formatDistanceToNow(teamDetails.createdAt, { addSuffix: true })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Team ID</p>
                            <p className="text-white font-mono text-sm">{teamDetails.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Total Members</p>
                            <p className="text-white">{teamDetails.members.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Members Card */}
            <Card className="bg-zinc-700 border-zinc-500">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Team Members
                            </CardTitle>
                            <CardDescription>
                                {isOwner
                                    ? 'Manage who has access to this team workspace'
                                    : 'View team members'}
                            </CardDescription>
                        </div>
                        {isOwner && (
                            <Button
                                onClick={() => setShowInviteDialog(true)}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite Member
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <TeamMembers
                        members={teamDetails.members}
                        currentUserRole={currentUserRole}
                        onRemoveMember={removeMember}
                    />
                </CardContent>
            </Card>

            {/* Invite Dialog */}
            <InviteMemberDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
        </div>
    );
}
