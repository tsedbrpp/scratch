"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Coins, Check, History, LogIn } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";
import { DataExportSection } from "@/components/settings/DataExportSection";
import { TransactionHistory, Transaction } from "@/components/TransactionHistory";
import { CREDIT_PACKAGES } from "@/config/pricing";
import { cn } from "@/lib/utils";

export default function BillingPage() {
    const { userId, isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingCredits, setIsLoadingCredits] = useState(true);
    const [history, setHistory] = useState<Transaction[]>([]);

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
        // Initial fetch
        fetchCredits();

        const query = new URLSearchParams(window.location.search);

        if (query.get('success')) {
            toastSuccess();
            // Poll for updates (Stripe webhooks can take a few seconds)
            const MAX_RETRIES = 10;
            let attempts = 0;

            const pollInterval = setInterval(async () => {
                attempts++;
                try {
                    const res = await fetch('/api/credits');
                    const data = await res.json();

                    // If credits increased (or just to be safe, update state)
                    if (data.credits !== null) {
                        setCredits(current => {
                            // If we have a new value that is different, we might stop polling? 
                            // Actually difficult to know "previous" state here without ref.
                            // But simply refreshing the UI 10 times over 20 seconds is fine.
                            return data.credits;
                        });
                        setHistory(data.history || []);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }

                if (attempts >= MAX_RETRIES) {
                    clearInterval(pollInterval);
                }
            }, 2000); // Check every 2 seconds

            // Clean URL
            window.history.replaceState({}, '', '/settings/billing');
        }

        if (query.get('canceled')) {
            alert("Payment canceled.");
            window.history.replaceState({}, '', '/settings/billing');
        }

        return () => {
            // Cleanup provided by scoping, standard useEffect cleanup handles component unmount
        }
    }, []);

    // Helper for toast (since we don't have a toast component in this file explicitly imported, use alert for now or assumed existing patterns)
    const toastSuccess = () => {
        // We will use a simple timeout to avoid blocking execution with alert immediately
        setTimeout(() => alert("Payment successful! Updating balance..."), 500);
    };

    const handlePurchase = async (packageId: string) => {
        if (!isSignedIn) {
            router.push('/sign-up');
            return;
        }

        setLoading(true);

        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
            alert("Configuration Error: Missing Stripe Publishable Key. Please check your .env.local file and restart the server.");
            setLoading(false);
            return;
        }

        try {
            // Create Checkout Session
            const res = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: packageId
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);
            if (!data.url) throw new Error("No checkout URL returned");

            // Direct Redirect to Stripe URL
            window.location.href = data.url;

        } catch (error: unknown) {
            console.error("Purchase Flow Error:", error);
            alert(`Failed to initiate purchase: ${(error as Error).message}`);
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

            {/* Academic Banking Grant Offer */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                        <span className="text-2xl">🎓</span> Student & Researcher Grant
                    </h3>
                    <p className="text-indigo-700 mt-1 max-w-xl">
                        Are you a student or academic researcher? We support open science!
                        Email us from your <strong>.edu</strong> or institutional address to receive <span className="font-bold underline">500 Free Credits</span> for your work.
                    </p>
                </div>
                <a href="mailto:support@instanttea.com?subject=Academic Grant Request" className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                    Claim Academic Grant
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Credit Value Explanation */}
                <Card className="md:col-span-3 bg-slate-50 border-slate-200">
                    <CardContent className="pt-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <span className="text-2xl">💡</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">What is a Credit?</h4>
                                <p className="text-sm text-slate-600">
                                    <strong>1 Credit = 1 Document Analysis</strong>.
                                    Looking at a document through a single lens (e.g., &quot;Legitimacy&quot; or &quot;Cultural Framing&quot;) costs 1 credit.
                                    Complex synthesis tasks may cost more.
                                </p>
                                <Link href="/why-credits" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                                    Learn more about credits &rarr;
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Options */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">Purchase Credits</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.values(CREDIT_PACKAGES).map((pack) => (
                            <Card key={pack.id} className={cn(
                                "border-2 relative overflow-hidden transition-all hover:border-indigo-300",
                                pack.popular ? "border-indigo-500 ring-4 ring-indigo-50/50" : "border-slate-200",
                                pack.id === 'institution' ? "bg-slate-50 border-slate-200" : "bg-white",
                                pack.id === 'starter' ? "opacity-75 bg-slate-50" : "" // Visual cue for unavailable
                            )}>
                                {pack.popular && (
                                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        POPULAR
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-indigo-600" />
                                        {pack.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {pack.description}
                                        {pack.promo?.badge && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                {pack.promo.badge}
                                            </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-baseline mb-4">
                                        {pack.id === 'institution' ? (
                                            <span className="text-3xl font-bold text-slate-900">Contact Us</span>
                                        ) : pack.price === 0 ? (
                                            <span className="text-3xl font-bold text-slate-900">Free Trial</span>
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-900">${pack.price}</span>
                                        )}

                                        {pack.id !== 'institution' && pack.id !== 'starter' && (
                                            <div className="text-right">
                                                <span className="text-slate-500 block text-xs">one-time payment</span>
                                                {pack.savings && (
                                                    <span className="text-green-600 text-xs font-bold">{pack.savings}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {pack.promo?.bannerText && (
                                        <div className="mb-4 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                            {pack.promo.bannerText}
                                        </div>
                                    )}

                                    <ul className="space-y-2 text-sm text-slate-600 mb-6">
                                        {pack.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <Check className={cn(
                                                    "h-4 w-4",
                                                    pack.id === 'institution' ? "text-slate-500" : "text-green-500"
                                                )} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {pack.id === 'institution' ? (
                                        <Button
                                            onClick={() => router.push('/contact')}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                                        >
                                            Contact Sales
                                        </Button>
                                    ) : isSignedIn ? (
                                        <Button
                                            onClick={() => handlePurchase(pack.id)}
                                            disabled={loading || pack.id === 'starter'}
                                            className={cn(
                                                "w-full",
                                                pack.popular ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                                            )}
                                        >
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {pack.id === 'starter' ? "New Users Only" : `Buy ${pack.credits} Credits`}
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
                        ))}
                    </div>



                    {/* Contributor Card */}
                    <Card className="border-emerald-500/20 bg-emerald-900/5">
                        <CardHeader>
                            <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                <Coins className="h-5 w-5" />
                                Earn Credits
                            </CardTitle>
                            <CardDescription>
                                Contribute to the ecosystem relative to your expertise.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Research-grade contributions (critiques, bias reviews, or code) can earn you usage credits.
                            </p>
                            <Link href="/governance/contributor-credits">
                                <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
                                    View Contributor Policy
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {isSignedIn && (
                        <>
                            <DeleteAccountSection />
                            <DataExportSection />
                        </>
                    )}
                </div>

                {/* Transaction History */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900">History</h2>
                    <TransactionHistory transactions={history} />
                </div>
            </div>
        </div >
    );
}
