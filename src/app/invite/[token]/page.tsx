'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface InviteDetails {
    teamName: string;
    inviterEmail: string;
    role: string;
}

interface PageProps {
    params: Promise<{ token: string }>;
}

export default function AcceptInvitePage({ params }: PageProps) {
    const router = useRouter();
    const { userId, isLoaded } = useAuth();
    const { switchToWorkspace } = useWorkspace();
    const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Unwrap params
    useEffect(() => {
        params.then(p => setToken(p.token));
    }, [params]);

    useEffect(() => {
        if (!token) return;

        // Redirect to login if not authenticated
        if (isLoaded && !userId) {
            router.push(`/sign-in?redirect_url=/invite/${token}`);
            return;
        }

        if (isLoaded && token) {
            fetchInviteDetails();
        }
    }, [isLoaded, token]);

    const fetchInviteDetails = async () => {
        try {
            const res = await fetch(`/api/collaboration/invites/${token}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 410) {
                    setError('This invitation has expired or has already been used.');
                } else if (res.status === 409) {
                    setError('You are already a member of this team.');
                } else {
                    setError(data.error || 'Invalid invitation link');
                }
                setIsLoading(false);
                return;
            }

            setInviteData(data);
        } catch (err) {
            setError('Failed to load invitation details');
        } finally {
            setIsLoading(false);
        }
    };

    const acceptInvitation = async () => {
        if (!token) return;

        setIsAccepting(true);
        try {
            const res = await fetch('/api/collaboration/invites/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Failed to accept invitation');
                setIsAccepting(false);
                return;
            }

            setAccepted(true);
            toast.success(`Welcome to ${inviteData?.teamName}!`);

            // Switch to team workspace and redirect
            setTimeout(() => {
                switchWorkspace(data.teamId);
                router.push('/dashboard');
            }, 1500);
        } catch (err) {
            toast.error('Network error accepting invitation');
            setIsAccepting(false);
        }
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6">
                        <Skeleton className="h-32 bg-zinc-800" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                            <h2 className="text-xl font-semibold text-white mb-2">Invalid Invitation</h2>
                            <p className="text-zinc-400 mb-6">{error}</p>
                            <Button onClick={() => router.push('/dashboard')} variant="outline">
                                Go to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (accepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                            <h2 className="text-xl font-semibold text-white mb-2">Welcome to the Team!</h2>
                            <p className="text-zinc-400">Redirecting to your team workspace...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-900/30 flex items-center justify-center border border-indigo-500/20">
                            <Users className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-white">Team Invitation</CardTitle>
                    <CardDescription>You've been invited to join a team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
                        <div>
                            <p className="text-sm text-zinc-400">Team Name</p>
                            <p className="text-lg font-semibold text-white">{inviteData?.teamName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Invited by</p>
                            <p className="text-white">{inviteData?.inviterEmail}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Role</p>
                            <p className="text-white font-medium">{inviteData?.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-zinc-400 bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>This invitation expires in 72 hours</span>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleAcceptInvite}
                            disabled={isAccepting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            size="lg"
                        >
                            {isAccepting ? 'Joining Team...' : 'Accept & Join Team'}
                        </Button>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="w-full"
                        >
                            Decline
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
