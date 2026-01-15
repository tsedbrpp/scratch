"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Coins, Check, History, LogIn } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function BillingPage() {
    const { userId, isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingCredits, setIsLoadingCredits] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    const fetchCredits = async () => {
        try {
            const res = await fetch('/api/credits');
            const data = await res.json();
            setCredits(data.credits);
            if (data.history) setHistory(data.history);
        } catch (error) {
            console.error("Failed to fetch credits", error);
        } finally {
            setIsLoadingCredits(false);
        }
    };

    useEffect(() => {
        // Only fetch credits if we have a user (even demo user returns something for api/credits, 
        // but we mainly care about display here. If strictly blocked, it might fail. 
        // Actually api/credits handles demo users fine for reading.
        fetchCredits();

        // Check for URL params
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            alert("Payment successful! credits added.");
            // Clean URL
            window.history.replaceState({}, '', '/settings/billing');
        }
        if (query.get('canceled')) {
            alert("Payment canceled.");
            window.history.replaceState({}, '', '/settings/billing');
        }
    }, []);

    const handlePurchase = async () => {
        if (!isSignedIn) {
            router.push('/sign-up');
            return;
        }

        setLoading(true);
        console.log("Purchase initiated");

        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
            alert("Configuration Error: Missing Stripe Publishable Key. Please check your .env.local file and restart the server.");
            setLoading(false);
            return;
        }

        try {
            console.log("Calling Checkout API...");
            // Create Checkout Session
            const res = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 10, // $10.00
                    credits: 10
                })
            });

            console.log("API Response Status:", res.status);
            const data = await res.json();
            console.log("API Response Data:", data);

            if (data.error) throw new Error(data.error);
            if (!data.url) throw new Error("No checkout URL returned");

            // Direct Redirect to Stripe URL
            console.log("Redirecting to:", data.url);
            window.location.href = data.url;

        } catch (error: any) {
            console.error("Purchase Flow Error:", error);
            alert(`Failed to initiate purchase: ${error.message}`);
            setLoading(false);
        }
        // Note: Loading state stays true until redirect or error
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Billing & Credits</h1>
                <p className="text-slate-500">Manage your credits and subscription plan.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Current Balance Card */}
                <Card className="md:col-span-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                    <CardHeader>
                        <CardTitle className="text-indigo-100 font-medium">Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Coins className="h-10 w-10 text-indigo-200" />
                            <div className="text-5xl font-bold">
                                {isLoadingCredits ? "..." : credits}
                            </div>
                            <div className="text-indigo-200 self-end mb-2">credits available</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Options */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">Purchase Credits</h2>

                    <Card className="border-2 border-indigo-100 ring-2 ring-indigo-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-indigo-600" />
                                Standard Pack
                            </CardTitle>
                            <CardDescription>Perfect for standard research projects.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-baseline mb-4">
                                <span className="text-3xl font-bold text-slate-900">$10</span>
                                <span className="text-slate-500">one-time payment</span>
                            </div>
                            <ul className="space-y-2 text-sm text-slate-600 mb-6">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    10 Analysis Credits
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Access to all lenses
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Export to PDF
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {isSignedIn ? (
                                <Button
                                    onClick={handlePurchase}
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Purchase Credits
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => router.push('/sign-up')}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign Up to Purchase
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <Card className="opacity-75 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                        <CardHeader>
                            <CardTitle className="text-slate-500">Pro Subscription</CardTitle>
                            <CardDescription>Unlimited analysis for power users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-baseline mb-4">
                                <span className="text-3xl font-bold text-slate-400">$49</span>
                                <span className="text-slate-400">/ month</span>
                            </div>
                            <p className="text-sm text-slate-500 italic">Coming soon...</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History Placeholder */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">History</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Recent Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <div className="text-sm text-slate-500 text-center py-8">
                                        No recent transactions found.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {history.map((tx) => (
                                            <div key={tx.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <div className="font-medium text-slate-900">
                                                        {tx.type === 'PURCHASE' ? 'Credit Purchase' : 'Usage'}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
