"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ShieldAlert, RotateCcw, Settings } from "lucide-react";

interface UserRateLimit {
    userId: string;
    email: string;
    name: string;
    usage: number;
    totalUsage: number;
    limitOverride: number | null;
    capOverride: number | null;
    ttl: number;
}

export default function AdminPage() {
    const [users, setUsers] = useState<UserRateLimit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingMode, setEditingMode] = useState<'limit' | 'cap' | null>(null);
    const [newValue, setNewValue] = useState<string>("");

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/ratelimit');
            if (res.status === 401) {
                setIsAuthorized(false);
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSetLimit = async (userId: string) => {
        const limit = newValue === "" ? null : parseInt(newValue, 10);
        try {
            await fetch('/api/admin/ratelimit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: userId, action: 'set_limit', limit })
            });
            setEditingId(null);
            setEditingMode(null);
            setNewValue("");
            fetchUsers();
        } catch (error) {
            console.error("Failed to set limit", error);
        }
    };

    const handleSetCap = async (userId: string) => {
        const cap = newValue === "" ? null : parseInt(newValue, 10);
        try {
            await fetch('/api/admin/ratelimit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: userId, action: 'set_cap', cap })
            });
            setEditingId(null);
            setEditingMode(null);
            setNewValue("");
            fetchUsers();
        } catch (error) {
            console.error("Failed to set cap", error);
        }
    };

    const handleResetUsage = async (userId: string) => {
        try {
            await fetch('/api/admin/ratelimit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: userId, action: 'reset_usage' })
            });
            fetchUsers();
        } catch (error) {
            console.error("Failed to reset usage", error);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <ShieldAlert className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                <p className="text-slate-500 max-w-md text-center">
                    You do not have permission to view this page.
                    Please add your User ID to the <code>ADMIN_USER_IDS</code> environment variable.
                </p>
                <div className="p-4 bg-slate-100 rounded-md font-mono text-sm">
                    Check server logs for your User ID
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h2>
                <p className="text-slate-500">Manage API rate limits and user usage.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Registered Users</CardTitle>
                            <CardDescription>View API usage, set rate limits, and manage hard caps.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchUsers}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-center py-8 text-slate-500">No users found.</p>
                    ) : (
                        <div className="space-y-4">
                            {users.map(user => (
                                <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{user.name}</span>
                                            <span className="text-xs text-slate-500">({user.email})</span>
                                            {user.limitOverride !== null && (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                                    Rate: {user.limitOverride}/min
                                                </Badge>
                                            )}
                                            {user.capOverride !== null && (
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                    Cap: {user.capOverride}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs font-mono text-slate-400">{user.userId}</div>
                                        <div className="text-xs text-slate-500 flex gap-4">
                                            <span>
                                                Current Rate: <span className={user.usage > (user.limitOverride || 25) ? "text-red-600 font-bold" : "text-slate-700"}>{user.usage}</span> / {user.limitOverride || 25}
                                                <span className="ml-1 text-slate-400">({user.ttl > 0 ? `${user.ttl}s` : 'Idle'})</span>
                                            </span>
                                            <span>
                                                Total Lifetime: <span className={user.totalUsage > (user.capOverride || 100) ? "text-red-600 font-bold" : "text-slate-700"}>{user.totalUsage}</span> / {user.capOverride || 100}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {editingId === user.userId ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-24 h-8"
                                                    placeholder={editingMode === 'limit' ? "Rate Limit" : "Hard Cap"}
                                                    value={newValue}
                                                    onChange={(e) => setNewValue(e.target.value)}
                                                />
                                                <Button size="sm" onClick={() => editingMode === 'limit' ? handleSetLimit(user.userId) : handleSetCap(user.userId)}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditingMode(null); }}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => { setEditingId(user.userId); setEditingMode('limit'); setNewValue(user.limitOverride?.toString() || ""); }}>
                                                    <Settings className="mr-2 h-3 w-3" />
                                                    Rate
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => { setEditingId(user.userId); setEditingMode('cap'); setNewValue(user.capOverride?.toString() || ""); }}>
                                                    <ShieldAlert className="mr-2 h-3 w-3" />
                                                    Cap
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleResetUsage(user.userId)} title="Reset All Usage">
                                                    <RotateCcw className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
