import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Sidebar } from "@/components/Sidebar";

export default function PricingPage() {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            {/* Header / Hero */}
            <div className="bg-slate-900 pt-24 pb-12 px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                    Transparent Pricing for <span className="text-emerald-400">Open Science</span>
                </h1>
                <p className="text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
                    Start for free with our provisional mapping tools. Pay only when you need deep, AI-driven analysis.
                    Discounts available for students and academic researchers.
                </p>
            </div>

            <div className="flex-1 py-12 px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Pricing Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">

                        {/* Tier 1: Starter */}
                        <div className="rounded-3xl p-8 ring-1 ring-slate-200 bg-white shadow-xl flex flex-col justify-between hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-2 -mt-2 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 blur-2xl opacity-20"></div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-slate-900">Starter</h3>
                                <p className="mt-4 text-sm leading-6 text-slate-500">Perfect for exploring the tool and small assignments.</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-slate-900">Free</span>
                                    <span className="text-sm font-semibold leading-6 text-slate-600">/ forever</span>
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> 5 Free Credits on Signup</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> 1 Document Upload</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> Basic Assemblage Map</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> Access to Community Support</li>
                                </ul>
                            </div>
                            <Link href="/sign-up" className="mt-8 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                                Get Started
                            </Link>
                        </div>

                        {/* Tier 2: Researcher (Pay as you go) */}
                        <div className="rounded-3xl p-8 ring-1 ring-slate-200 bg-white shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-slate-900">Researcher</h3>
                                <p className="mt-4 text-sm leading-6 text-slate-500">Flexible credits for deep dives and dissertations.</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-slate-900">$0.50</span>
                                    <span className="text-sm font-semibold leading-6 text-slate-600">/ credit</span>
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-blue-600" /> Pay-as-you-go (No subscription)</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-blue-600" /> Deep AI Analysis (GPT-5.1)</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-blue-600" /> Unlimited Projects</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-blue-600" /> High-Res PDF Exports</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-blue-600" /> Comparative Synthesis</li>
                                </ul>
                            </div>
                            <Link href="/settings/billing" className="mt-8 block w-full rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-200 hover:ring-blue-300">
                                Buy Credits
                            </Link>
                        </div>

                        {/* Tier 3: Institution */}
                        <div className="rounded-3xl p-8 ring-1 ring-gray-200 bg-slate-50 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-slate-900">Institution</h3>
                                <p className="mt-4 text-sm leading-6 text-slate-500">For labs, departments, and research groups.</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-slate-900">Contact Us</span>
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-slate-600" /> Volume Discounts</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-slate-600" /> Centralized Billing</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-slate-600" /> Dedicated Training</li>
                                    <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-slate-600" /> Priority Support</li>
                                </ul>
                            </div>
                            <Link href="/contact" className="mt-8 block w-full rounded-md bg-slate-800 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700">
                                Contact Sales
                            </Link>
                        </div>

                    </div>

                    {/* Academic Grants Section */}
                    <div className="rounded-2xl bg-amber-50 p-8 border border-amber-100 text-center mb-16">
                        <h2 className="text-2xl font-bold text-amber-900 mb-4">🎓 Academic Grants Available</h2>
                        <p className="text-amber-800 mb-6 max-w-2xl mx-auto">
                            We are committed to supporting open research. If you are a student or academic researcher with limited funding,
                            please verify your <strong>.edu</strong> email address to apply for our research grant program.
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
