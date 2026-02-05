'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { useAuth } from '@clerk/nextjs';
import { Command, Check, ChevronsUpDown, Plus, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const WorkspaceSelector = () => {
    const {
        currentWorkspaceId,
        availableTeams,
        workspaceType,
        switchWorkspace,
        createTeam,
        isLoading
    } = useWorkspace();
    const { userId } = useAuth();

    const [open, setOpen] = useState(false); // Dropdown state
    const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Current Active Name
    const currentName = workspaceType === 'PERSONAL'
        ? "Personal Workspace"
        : availableTeams.find(t => t.id === currentWorkspaceId)?.name || "Team Workspace";

    // Handlers
    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        setIsCreating(true);
        const success = await createTeam(newTeamName);
        setIsCreating(false);

        if (success) {
            setShowNewTeamDialog(false);
            setNewTeamName('');
        }
    };

    if (isLoading) {
        return <Button variant="outline" className="w-[200px] justify-between h-9 animate-pulse">Loading...</Button>;
    }

    return (
        <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-10 px-3 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 transition-colors"
                    >
                        <div className="flex items-center gap-2 truncate">
                            {workspaceType === 'PERSONAL' ? (
                                <User className="w-4 h-4 text-zinc-400" />
                            ) : (
                                <Users className="w-4 h-4 text-indigo-400" />
                            )}
                            <span className="truncate text-zinc-200">{currentName}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px] bg-zinc-950 border-zinc-800">
                    <DropdownMenuLabel className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                        My Workspaces
                    </DropdownMenuLabel>

                    {/* Personal Option */}
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => userId && switchWorkspace(userId)}
                            className="cursor-pointer focus:bg-zinc-900"
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-zinc-400" />
                                    <span>Personal Account</span>
                                </div>
                                {workspaceType === 'PERSONAL' && <Check className="h-4 w-4" />}
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="bg-zinc-800" />

                    {/* Teams List */}
                    <DropdownMenuGroup>
                        {availableTeams.length > 0 && (
                            <DropdownMenuLabel className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                                Teams
                            </DropdownMenuLabel>
                        )}
                        {availableTeams.map((team) => (
                            <DropdownMenuItem
                                key={team.id}
                                onSelect={() => switchWorkspace(team.id)}
                                className="cursor-pointer focus:bg-zinc-900"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-5 h-5 rounded bg-indigo-900/30 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                                            {team.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="truncate max-w-[140px]">{team.name}</span>
                                    </div>
                                    {currentWorkspaceId === team.id && <Check className="h-4 w-4" />}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="bg-zinc-800" />

                    {/* Create New Action */}
                    <DropdownMenuItem
                        onSelect={() => setShowNewTeamDialog(true)}
                        className="cursor-pointer focus:bg-zinc-900 text-indigo-400 hover:text-indigo-300"
                    >
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Team
                        </div>
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Team Dialog */}
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700 shadow-2xl backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle>Create Team</DialogTitle>
                    <DialogDescription>
                        Create a shared workspace for your team. You can invite members after creating it.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="e.g. Research Group A"
                            className="col-span-3 bg-zinc-900 border-zinc-700"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isCreating || !newTeamName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isCreating ? 'Creating...' : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
