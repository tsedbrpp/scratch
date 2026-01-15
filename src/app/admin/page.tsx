"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, RefreshCw, ShieldAlert, RotateCcw, Settings, Coins, History, Plus, Minus } from "lucide-react";

interface UserRateLimit {
    userId: string;
    email: string;
    name: string;
    usage: number;
    totalUsage: number;
    credits: number; // Added
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

    // Credit Management State
    const [creditUser, setCreditUser] = useState<UserRateLimit | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [adjustAmount, setAdjustAmount] = useState("");

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

    const handleOpenCreditDialog = async (user: UserRateLimit) => {
        setCreditUser(user);
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/admin/history?userId=${user.userId}`);
            const data = await res.json();
            setHistory(data.history || []);
        } catch (e) {
            console.error("Failed to fetch history", e);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleAdjustCredits = async () => {
        if (!creditUser || !adjustAmount) return;
        const amount = parseInt(adjustAmount, 10);
        if (isNaN(amount) || amount === 0) return;

        try {
            await fetch('/api/admin/ratelimit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: creditUser.userId, action: 'add_credits', amount })
            });
            // Refresh main users list
            fetchUsers();

            // Allow time for propagation or just optimistic update?
            // Let's reload the history to confirm transaction logged
            const res = await fetch(`/api/admin/history?userId=${creditUser.userId}`);
            const data = await res.json();
            setHistory(data.history || []);

            // Optimistically update the dialog's balance view
            setCreditUser(prev => prev ? { ...prev, credits: (prev.credits || 0) + amount } : null);
            setAdjustAmount("");
        } catch (error) {
            console.error("Failed to adjust credits", error);
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
                                            <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">
                                                {user.credits ?? 0} Credits
                                            </Badge>
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
                                                <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100" onClick={() => handleOpenCreditDialog(user)}>
                                                    <Coins className="mr-2 h-3 w-3" />
                                                    Credits
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

            <Dialog open={!!creditUser} onOpenChange={(open) => !open && setCreditUser(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Credits: {creditUser?.name}</DialogTitle>
                        <DialogDescription>UserId: {creditUser?.userId}</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <span className="text-sm text-slate-500">Current Balance</span>
                                <div className="text-3xl font-bold text-indigo-600">{creditUser?.credits ?? '...'}</div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Adjust Balance</h4>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Amount (+/-)"
                                        value={adjustAmount}
                                        onChange={(e) => setAdjustAmount(e.target.value)}
                                    />
                                    <Button onClick={handleAdjustCredits} disabled={!adjustAmount}>Apply</Button>
                                </div>
                                <div className="flex gap-2 text-xs">
                                    <Button variant="outline" size="sm" onClick={() => setAdjustAmount("10")}>+10</Button>
                                    <Button variant="outline" size="sm" onClick={() => setAdjustAmount("100")}>+100</Button>
                                    <Button variant="outline" size="sm" onClick={() => setAdjustAmount("-10")}>-10</Button>
                                    <Button variant="outline" size="sm" onClick={() => setAdjustAmount("-100")}>-100</Button>
                                </div>
                            </div>
                        </div>

                        {/* History */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-md p-2">
                            <h4 className="text-sm font-medium sticky top-0 bg-white pb-2 border-b">Transaction History</h4>
                            {historyLoading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5" /></div>
                            ) : history.length === 0 ? (
                                <div className="text-sm text-slate-400 text-center p-4">No transactions</div>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((tx: any) => (
                                        <div key={tx.id} className="text-xs flex justify-between items-center border-b pb-1 last:border-0">
                                            <div>
                                                <div className="font-medium text-slate-700">{tx.type}</div>
                                                <div className="text-slate-400">{new Date(tx.createdAt).toLocaleString()}</div>
                                            </div>
                                            <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
