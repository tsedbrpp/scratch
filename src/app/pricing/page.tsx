import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Sidebar } from "@/components/Sidebar";
import { CREDIT_PACKAGES } from "@/config/pricing";
import { cn } from "@/lib/utils";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing & Academic Grants | InstantTea',
    description: 'Transparent pay-as-you-go pricing for open science AI governance mapping. Discounts and free grants available for students and academic researchers.',
};

export default function PricingPage() {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            {/* Header / Hero */}
            <div className="bg-slate-900 pt-24 pb-12 px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                    Transparent Pricing for <span className="text-emerald-400">Open Science</span>
                </h1>
                <p className="text-lg leading-8 text-slate-300 max-w-2xl mx-auto mb-8">
                    Start for free with our provisional mapping tools. Pay only when you need deep, AI-driven analysis.
                    Discounts available for students and academic researchers.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/why-credits">
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            Why Credits?
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 py-12 px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Pricing Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {Object.values(CREDIT_PACKAGES).map((pack) => (
                            <div key={pack.id} className={cn(
                                "rounded-3xl p-8 ring-1 bg-white flex flex-col justify-between transition-transform duration-300 relative overflow-hidden",
                                pack.popular ? "ring-indigo-200 shadow-xl hover:scale-105" : "ring-slate-200 shadow-sm",
                                pack.id === 'institution' ? "bg-slate-50 ring-gray-200" : "bg-white"
                            )}>
                                {pack.popular && (
                                    <div className="absolute top-0 right-0 -mr-2 -mt-2 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 blur-2xl opacity-20"></div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-slate-900">{pack.name}</h3>
                                    <p className="mt-4 text-sm leading-6 text-slate-500">{pack.description}</p>

                                    {/* Price Display */}
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        {pack.id === 'institution' ? (
                                            <span className="text-4xl font-bold tracking-tight text-slate-900">Contact Us</span>
                                        ) : pack.price === 0 ? (
                                            <>
                                                <span className="text-4xl font-bold tracking-tight text-slate-900">Free</span>
                                                <span className="text-sm font-semibold leading-6 text-slate-600">/ forever</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-4xl font-bold tracking-tight text-slate-900">${pack.price}</span>
                                                <span className="text-sm font-semibold leading-6 text-slate-600">/ {pack.credits} credits</span>
                                            </>
                                        )}
                                    </p>

                                    {/* Promo Badge */}
                                    {pack.promo?.badge && (
                                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800">
                                            {pack.promo.badge}
                                        </div>
                                    )}

                                    {/* Promo Banner Text */}
                                    {pack.promo?.bannerText && (
                                        <div className="mt-4 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                            {pack.promo.bannerText}
                                        </div>
                                    )}

                                    {/* Features List */}
                                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                                        {pack.features.map((feature, index) => (
                                            <li key={index} className="flex gap-x-3">
                                                <Check className={cn(
                                                    "h-6 w-5 flex-none",
                                                    pack.id === 'institution' ? "text-slate-600" :
                                                        pack.id === 'starter' ? "text-emerald-600" : "text-blue-600"
                                                )} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Call to Action */}
                                {pack.id === 'starter' ? (
                                    <Link href="/sign-up" className="mt-8 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">
                                        Get Started
                                    </Link>
                                ) : pack.id === 'institution' ? (
                                    <Link href="/contact" className="mt-8 block w-full rounded-md bg-slate-800 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700">
                                        Contact Sales
                                    </Link>
                                ) : (
                                    <Link href="/settings/billing" className="mt-8 block w-full rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-200 hover:ring-blue-300">
                                        Buy Credits
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Academic Grants Section */}
                    <div className="rounded-2xl bg-amber-50 p-8 border border-amber-100 text-center mb-16">
                        <h2 className="text-2xl font-bold text-amber-900 mb-4">🎓 Academic Grants Available</h2>
                        <p className="text-amber-800 mb-6 max-w-2xl mx-auto">
                            We are committed to supporting open research. If you are a student or academic researcher with limited funding,
                            please verify your <strong>.edu</strong> email address to apply for our research grant program (500 Free Credits).
                        </p>
                        <Button variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-100">
                            Apply for Grant
                        </Button>
                    </div>

                    {/* FAQ */}
                    <div className="max-w-3xl mx-auto divide-y divide-slate-900/10">
                        <h2 className="text-2xl font-bold leading-10 tracking-tight text-slate-900 text-center mb-8">Frequently asked questions</h2>
                        <dl className="space-y-8 divide-y divide-slate-900/10">
                            <div className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                                <dt className="text-base font-semibold leading-7 text-slate-900 lg:col-span-5">What constitutes a &quot;Credit&quot;?</dt>
                                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                    <p className="text-base leading-7 text-slate-600">
                                        One credit typically covers the AI processing cost for one standard academic PDF (up to 20 pages) or generating one complex assemblage map.
                                        Simple interactions like viewing existing maps are free.
                                    </p>
                                </dd>
                            </div>
                            <div className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                                <dt className="text-base font-semibold leading-7 text-slate-900 lg:col-span-5">Can I cancel my credits?</dt>
                                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                    <p className="text-base leading-7 text-slate-600">
                                        Since this is a pay-as-you-go model, there is no subscription to cancel.
                                        Credits never expire. If you purchase credits by mistake, contact us within 24 hours for a refund.
                                    </p>
                                </dd>
                            </div>
                            <div className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                                <dt className="text-base font-semibold leading-7 text-slate-900 lg:col-span-5">Is my research data private?</dt>
                                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                    <p className="text-base leading-7 text-slate-600">
                                        Yes. We do not use your uploaded documents to train our models.
                                        Your data is encrypted at rest and in transit. See our <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link> for details.
                                    </p>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}
