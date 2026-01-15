import Link from "next/link";
import { ArrowLeft, Server, Database, Shield, Cpu, CreditCard, Layout } from "lucide-react";

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold tracking-tight">instantTEA System Documentation</h1>
                        <p className="mt-4 text-slate-300 text-lg">
                            Comprehensive technical guide for the Translational, Ephemeral Assemblages platform.
                        </p>
                    </div>

                    <div className="px-8 py-10 space-y-12">

                        {/* 1. System Overview */}
                        <section id="overview">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Layout className="h-6 w-6 text-blue-600" />
                                1. System Overview
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                                <p>
                                    <strong>instantTEA</strong> is an open-source platform for critical policy and governance research. It bridges the gap between policy intent and algorithmic reality by translating complex socio-technical assemblages into provisional, situated snapshots.
                                </p>
                                <div className="grid md:grid-cols-3 gap-6 mt-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-blue-900 mb-2">Translational</h3>
                                        <p className="text-sm">Actively producing knowledge through inscription and enrollment (ANT).</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-emerald-900 mb-2">Ephemeral</h3>
                                        <p className="text-sm">Capturing fleeting moments of territorialization and deterritorialization.</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-purple-900 mb-2">Critical</h3>
                                        <p className="text-sm">Exposing power structures and hidden agencies in governance systems.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Architecture */}
                        <section id="architecture">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Server className="h-6 w-6 text-indigo-600" />
                                2. Architecture
                            </h2>
                            <p className="text-slate-600 mb-6">
                                The application is built on a modern <strong>Next.js 16</strong> stack, optimized for performance, scalability, and security.
                            </p>

                            <div className="bg-slate-900 rounded-xl p-6 text-slate-300 overflow-x-auto">
                                <pre className="text-sm font-mono">
                                    {`Researcher --> [Auth: Clerk] --> [Next.js App Router]
                                       |
                   +-------------------+-------------------+
                   |                   |                   |
             [Data Layer]        [Intelligence]        [External]
             - Redis (DB)        - OpenAI GPT-4        - Stripe
             - Vector Search     - PDF Parser`}
                                </pre>
                            </div>

                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    ["Framework", "Next.js 16"],
                                    ["Language", "TypeScript"],
                                    ["Styling", "Tailwind CSS"],
                                    ["Database", "Redis"],
                                    ["Auth", "Clerk"],
                                    ["AI Model", "OpenAI GPT-4o"],
                                    ["Payments", "Stripe"],
                                    ["Viz", "D3.js / WebGL"]
                                ].map(([label, value]) => (
                                    <div key={label} className="border border-slate-200 p-3 rounded-lg">
                                        <div className="text-xs text-slate-500 uppercase font-semibold">{label}</div>
                                        <div className="text-slate-900 font-medium">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Key Components */}
                        <section id="components">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Database className="h-6 w-6 text-teal-600" />
                                3. Key Components & Data Flow
                            </h2>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">3.1 Authentication</h3>
                                    <p className="text-slate-600">
                                        Handled via <strong>Clerk</strong>. Middleware (<code>src/middleware.ts</code>) protects all API and dashboard routes.
                                        The app supports a read-only <strong>Demo Mode</strong> configured via environment variables.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">3.2 Data Ingestion & Analysis</h3>
                                    <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                        <li><strong>Ingestion:</strong> Users upload PDFs or scrape URLs.</li>
                                        <li><strong>Extraction:</strong> <code>content-extractor.ts</code> parses raw text.</li>
                                        <li><strong>Analysis:</strong> Text is sent to <code>/api/analyze</code> where LLM calls are coordinated using specific theoretical lenses. Results are cached in Redis (24h TTL).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">3.3 Payments & Credits</h3>
                                    <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <CreditCard className="h-5 w-5 text-slate-400 mt-1" />
                                        <div className="text-sm text-slate-600">
                                            <p className="mb-2"><strong>Model:</strong> Credit-based usage (1 analysis = 1 credit).</p>
                                            <p className="mb-2"><strong>Storage:</strong> Redis Atomic Counters.</p>
                                            <p><strong>Processing:</strong> Stripe Webhooks trigger credit top-ups with signature verification.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Security */}
                        <section id="security">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Shield className="h-6 w-6 text-red-600" />
                                4. Security Features
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="border border-slate-200 rounded-xl p-5">
                                    <h3 className="font-bold text-slate-900 mb-2">Configured Headers</h3>
                                    <p className="text-slate-600 text-sm">HSTS, X-Frame-Options, and No-Sniff are strictly enforced in <code>next.config.ts</code>.</p>
                                </div>
                                <div className="border border-slate-200 rounded-xl p-5">
                                    <h3 className="font-bold text-slate-900 mb-2">Input Validation</h3>
                                    <p className="text-slate-600 text-sm">Manual checks in API routes and read-only guards for all mutation endpoints ensure data integrity.</p>
                                </div>
                            </div>
                        </section>

                        {/* 5. Configuration */}
                        <section id="config">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Cpu className="h-6 w-6 text-amber-600" />
                                5. Configuration
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm whitespace-nowrap">
                                    <thead className="uppercase tracking-wider border-b-2 border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-900">Variable</th>
                                            <th className="px-6 py-3 font-bold text-slate-900">Description</th>
                                            <th className="px-6 py-3 font-bold text-slate-900">Required</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-slate-600">NEXT_PUBLIC_CLERK_KEY</td>
                                            <td className="px-6 py-4 text-slate-600">Clerk Auth Public Key</td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium">Yes</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-slate-600">OPENAI_API_KEY</td>
                                            <td className="px-6 py-4 text-slate-600">OpenAI API Key</td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium">Yes</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-slate-600">REDIS_URL</td>
                                            <td className="px-6 py-4 text-slate-600">Connection string for Redis</td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium">Yes</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-slate-600">STRIPE_SECRET_KEY</td>
                                            <td className="px-6 py-4 text-slate-600">Stripe Secret for payments</td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium">Yes</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                    </div>

                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 text-center text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} instantTEA Research Group. MIT License.
                    </div>
                </div>
            </div>
        </div>
    );
}
