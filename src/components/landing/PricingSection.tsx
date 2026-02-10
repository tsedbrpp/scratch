"use client";

import { CREDIT_PACKAGES } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { Check, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PricingSection() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden" id="pricing">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-slate-400 mb-4">
                        Start for free with our trial, then pay only for what you need. No monthly subscriptions, just credits that never expire.
                    </p>
                    <Link href="/why-credits" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium hover:underline inline-flex items-center gap-1">
                        Why use a credit system? <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Dynamic Pricing Cards */}
                    {['starter', 'pro', 'institution'].map((pkgId) => {
                        const pack = CREDIT_PACKAGES[pkgId as keyof typeof CREDIT_PACKAGES];
                        const isPopular = pack.popular;
                        const isInstitution = pkgId === 'institution';

                        return (
                            <div
                                key={pkgId}
                                className={cn(
                                    "relative group rounded-2xl bg-slate-900 transition-all duration-300 flex flex-col",
                                    isPopular
                                        ? "border-2 border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transform hover:-translate-y-1 z-10"
                                        : "border border-slate-800 hover:border-emerald-500/50"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-slate-950 text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> MOST POPULAR
                                    </div>
                                )}

                                {!isPopular && !isInstitution && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                                )}

                                <div className="p-8 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white">{pack.name}</h3>
                                        {pack.promo?.badge && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {pack.promo.badge}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-6 flex items-baseline">
                                        {isInstitution ? (
                                            <span className="text-4xl font-bold text-white">Custom</span>
                                        ) : pack.price === 0 ? (
                                            <>
                                                <span className="text-4xl font-bold text-white">Free</span>
                                                <span className="text-slate-500 ml-2">/ forever</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-4xl font-bold text-white">${pack.price}</span>
                                                {pack.savings && (
                                                    <span className="text-emerald-400 text-sm font-bold ml-3 bg-emerald-500/10 px-2 py-1 rounded">{pack.savings}</span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <p className="text-slate-400 text-sm mb-6 min-h-[40px]">
                                        {pack.description}
                                    </p>

                                    <ul className="space-y-4 mb-8">
                                        {pack.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <Check className={cn("w-5 h-5 shrink-0", isPopular || feature.includes("GPT-5.1") ? "text-emerald-400" : "text-slate-500")} />
                                                <span className={cn(isPopular ? "text-white" : "text-slate-300")}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 pt-0 mt-auto">
                                    {isInstitution ? (
                                        <a href="mailto:sales@instanttea.com" className="block">
                                            <Button className="w-full bg-transparent hover:bg-slate-800 text-white border border-slate-700 transition-all">
                                                Contact Sales
                                            </Button>
                                        </a>
                                    ) : (
                                        <Link href="/sign-up" className="block">
                                            <Button className={cn(
                                                "w-full transition-all",
                                                isPopular
                                                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                                                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600"
                                            )}>
                                                {pack.price === 0 ? "Start Free Trial" : `Get ${pack.name}`}
                                            </Button>
                                        </Link>
                                    )}
                                    <p className="text-xs text-center text-slate-500 mt-4">
                                        {isInstitution ? "Response within 24h" : pack.price === 0 ? "No credit card required" : "One-time payment"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                        <Info className="w-4 h-4" />
                        <span>All plans include access to standard lenses. Credits are used for analysis steps.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
