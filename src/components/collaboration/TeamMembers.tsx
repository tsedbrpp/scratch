'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { TeamMember } from '@/hooks/useTeam';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, UserMinus, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamMembersProps {
    members: TeamMember[];
    currentUserRole?: 'OWNER' | 'EDITOR' | 'VOTER';
    onRemoveMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({ members, currentUserRole, onRemoveMember }) => {
    const { userId: currentUserId } = useAuth();
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    // Sort: owners first, then by join date
    const sortedMembers = [...members].sort((a, b) => {
        if (a.role === 'OWNER' && b.role !== 'OWNER') return -1;
        if (a.role !== 'OWNER' && b.role === 'OWNER') return 1;
        return a.joinedAt - b.joinedAt;
    });

    const handleRemoveClick = (userId: string) => {
        setRemovingUserId(userId);
        setShowConfirmDialog(true);
    };

    const handleConfirmRemove = async () => {
        if (!removingUserId) return;

        setIsRemoving(true);
        await onRemoveMember(removingUserId);
        setIsRemoving(false);
        setShowConfirmDialog(false);
        setRemovingUserId(null);
    };

    const getInitials = (email: string, name?: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return email.slice(0, 2).toUpperCase();
    };

    const memberToRemove = members.find(m => m.userId === removingUserId);

    return (
        <>
            <div className="space-y-3">
                {sortedMembers.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No members yet</p>
                    </div>
                ) : (
                    sortedMembers.map((member) => {
                        const isCurrentUser = member.userId === currentUserId;
                        const canRemove = currentUserRole === 'OWNER' && !isCurrentUser;

                        return (
                            <div
                                key={member.userId}
                                className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-900/30 text-indigo-300 font-semibold border border-indigo-500/20">
                                        {getInitials(member.email, member.name)}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">
                                                {member.name || member.email}
                                            </span>
                                            {isCurrentUser && (
                                                <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-300">
                                                    You
                                                </Badge>
                                            )}
                                            {member.role === 'OWNER' && (
                                                <Crown className="w-4 h-4 text-amber-400" aria-label="Owner" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <span>{member.email}</span>
                                            <span>•</span>
                                            <span>Joined {formatDistanceToNow(member.joinedAt, { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                                        {member.role}
                                    </Badge>
                                    {canRemove && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveClick(member.userId)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                            aria-label={`Remove ${member.email}`}
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-zinc-800 border-zinc-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-300">
                            Are you sure you want to remove <strong>{memberToRemove?.email}</strong> from the team?
                            They will lose access to all team data and analyses.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmRemove}
                            disabled={isRemoving}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isRemoving ? 'Removing...' : 'Remove Member'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
