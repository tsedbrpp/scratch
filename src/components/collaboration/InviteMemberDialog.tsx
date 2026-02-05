'use client';

import React, { useState } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface InviteMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({ open, onOpenChange }) => {
    const { inviteMember } = useTeam();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'OWNER' | 'EDITOR'>('EDITOR');
    const [isCreating, setIsCreating] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsCreating(true);
        const result = await inviteMember(email, role);
        setIsCreating(false);

        if (result.success && result.token) {
            const link = `${window.location.origin}/invite/${result.token}`;
            setInviteLink(link);
        }
    };

    const handleCopyLink = async () => {
        if (!inviteLink) return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            toast.success('Invitation link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const handleClose = () => {
        setEmail('');
        setRole('EDITOR');
        setInviteLink(null);
        setCopied(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-700 border-zinc-500 shadow-2xl text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-400" />
                        Invite Team Member
                    </DialogTitle>
                    <DialogDescription className="text-zinc-300">
                        Send an invitation link to add a new member to your team. The link expires in 72 hours.
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <form onSubmit={handleCreateInvite} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-200">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                    className="pl-10 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role" className="text-zinc-200">
                                Role
                            </Label>
                            <Select value={role} onValueChange={(v) => setRole(v as 'OWNER' | 'EDITOR')}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-600">
                                    <SelectItem value="EDITOR">Editor - Can view and edit</SelectItem>
                                    <SelectItem value="OWNER">Owner - Full admin access</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-zinc-400">
                                {role === 'OWNER'
                                    ? 'Owners can invite members, manage settings, and delete the team.'
                                    : 'Editors can view and edit team content but cannot manage members.'}
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="bg-zinc-800 border-zinc-600 hover:bg-zinc-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating || !email}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isCreating ? 'Creating...' : 'Create Invitation'}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-4">
                            <p className="text-sm text-zinc-300 mb-2">Invitation Link</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-zinc-900 px-3 py-2 rounded border border-zinc-700 text-indigo-300 break-all">
                                    {inviteLink}
                                </code>
                                <Button
                                    size="sm"
                                    onClick={handleCopyLink}
                                    className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-400 mt-2">
                                ⏱️ Expires in 72 hours • One-time use only
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleClose}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white w-full"
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
