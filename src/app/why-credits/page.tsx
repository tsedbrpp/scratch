import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Server, Database, Cpu, Scale, ShieldCheck } from "lucide-react";

export const metadata = {
    title: "Why Credits? | instantTEA",
    description: "Understanding the cost-allocation mechanism behind InstantTEA research infrastructure.",
};

export default function WhyCreditsPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-6 text-center">
                    <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                        Why InstantTEA Uses a Credit System
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        InstantTEA operates as a <strong>computational research infrastructure</strong>, not a static software tool.
                        Each analysis triggers real, marginal costs across multiple layers of the system.
                        Credits ensure sustainability, fairness, and transparency.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Point 1 */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <Cpu className="h-6 w-6 text-blue-500" />
                                1. Direct AI API Costs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 space-y-2">
                            <p>
                                Each analysis invokes external AI platforms (LLMs, embedding services).
                                These services charge per request or token.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Every document ingestion</li>
                                <li>Every multi-lens interpretive pass</li>
                                <li>Every synthesis or comparison</li>
                            </ul>
                            <p className="text-sm mt-2 italic text-slate-500">
                                Credits align usage directly with these variable expenses.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Point 2 */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <Database className="h-6 w-6 text-indigo-500" />
                                2. Persistent Storage & Retention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 space-y-2">
                            <p>
                                InstantTEA maintains structured analytic artifacts, versioned interpretations,
                                and research histories.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Structured actor/network artifacts</li>
                                <li>Versioned snapshots</li>
                                <li>Secure database operations</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Point 3 */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <Server className="h-6 w-6 text-emerald-500" />
                                3. Compute & Delivery Logic
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 space-y-2">
                            <p>
                                Delivering interactive analysis requires continuous infrastructure beyond simple API calls.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Serverless compute & background workers</li>
                                <li>Secure API gateways</li>
                                <li>Monitoring & error handling</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Point 4 */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <Scale className="h-6 w-6 text-purple-500" />
                                4. Fairness Across Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 space-y-2">
                            <p>
                                A credit system prevents heavy users from subsidizing others and ensures research-grade workloads remain viable.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Light users pay minimally</li>
                                <li>Power users pay proportionally</li>
                                <li>Supports deep, multi-document analysis</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Point 5 */}
                    <Card className="col-span-1 md:col-span-2 bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <ShieldCheck className="h-6 w-6 text-teal-400" />
                                5. Sustainability of a Research Platform
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="mb-2">InstantTEA is designed to support:</p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li>Interpretive rigor</li>
                                    <li>Reflexive auditability</li>
                                    <li>Long-term research projects</li>
                                </ul>
                            </div>
                            <div>
                                <p className="mb-2">Credits fund:</p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li>Ongoing model evaluation</li>
                                    <li>Infrastructure reliability</li>
                                    <li>Responsible governance</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Section */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-slate-700/50 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">In Short</h2>
                    <p className="text-lg text-slate-300 mb-6">
                        Credits are not a paywall; they are a <strong>cost-allocation mechanism</strong>.
                        They ensure that InstantTEA remains economically sustainable, fair, and capable of supporting
                        serious, computationally intensive interpretive work. <Link href="/governance/contributor-credits" className="text-emerald-400 hover:underline">Learn how to earn credits via contribution.</Link>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up">
                            <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800">
                                Log In
                            </Button>
                        </Link>
                        <Link href="/settings/billing">
                            <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-900/20">
                                Purchase Credits
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
