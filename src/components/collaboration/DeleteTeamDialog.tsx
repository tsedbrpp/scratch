'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/providers/WorkspaceProvider';

interface DeleteTeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamId: string;
    teamName: string;
    memberCount: number;
}

export function DeleteTeamDialog({
    open,
    onOpenChange,
    teamId,
    teamName,
    memberCount
}: DeleteTeamDialogProps) {
    const router = useRouter();
    const { switchWorkspace, refreshTeams } = useWorkspace();
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const isConfirmed = confirmText === teamName;

    const handleDelete = async () => {
        if (!isConfirmed) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/collaboration/teams/${teamId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete team');
            }

            toast.success(`Team "${teamName}" has been permanently deleted`);

            // Switch to personal workspace
            switchWorkspace('PERSONAL');

            // Refresh team list to remove deleted team
            await refreshTeams();

            // Close dialog and redirect
            onOpenChange(false);
            router.push('/dashboard');
        } catch (error) {
            console.error('[Delete Team Error]', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete team');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl">Delete Team</DialogTitle>
                    </div>
                    <DialogDescription className="text-base pt-4">
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-red-900 font-medium">
                            The following will be permanently deleted:
                        </p>
                        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                            <li>All team documents and data</li>
                            <li>Team collaboration settings</li>
                            <li>All pending invitations</li>
                        </ul>
                        <p className="text-sm text-red-900 font-medium pt-2">
                            <strong>{memberCount}</strong> {memberCount === 1 ? 'member' : 'members'} will lose access
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-name" className="text-sm font-medium">
                            Type <span className="font-mono bg-zinc-100 px-1 rounded">{teamName}</span> to confirm:
                        </Label>
                        <Input
                            id="confirm-name"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={teamName}
                            disabled={isDeleting}
                            className="font-mono"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!isConfirmed || isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Team'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
