import Link from "next/link";
import { ArrowLeft, BookOpen, User, Activity, Share2, CreditCard, HelpCircle } from "lucide-react";

export default function UserDocsPage() {
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
                    <div className="bg-gradient-to-r from-emerald-900 to-slate-900 px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold tracking-tight">instantTEA User Guide</h1>
                        <p className="mt-4 text-emerald-100 text-lg">
                            Your platform for analyzing complex socio-technical systems through the lenses of Actor-Network Theory and Assemblage Theory.
                        </p>
                    </div>

                    <div className="px-8 py-10 space-y-12">

                        {/* 1. Getting Started */}
                        <section id="getting-started">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <User className="h-6 w-6 text-emerald-600" />
                                1. Getting Started
                            </h2>
                            <div className="space-y-6 text-slate-600">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Account Creation</h3>
                                    <p>Navigate to the Sign Up page and enter your email or use Google Auth. New accounts typically start with a small number of free credits.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Dashboard Overview</h3>
                                    <p>Your Dashboard provides an "at-a-glance" view of:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                                        <li><strong>Active Sources:</strong> Documents you have uploaded.</li>
                                        <li><strong>Recent Analyses:</strong> Your latest insights.</li>
                                        <li><strong>Credit Balance:</strong> Remaining credits for running AI analysis.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 2. Core Workflows */}
                        <section id="workflows">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                                2. Core Workflows
                            </h2>
                            <div className="space-y-8">
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">2.1 Managing Data Sources</h3>
                                    <p className="text-slate-600 mb-4">Navigate to the <strong>Data</strong> page to manage your materials.</p>
                                    <ul className="space-y-3 text-slate-600 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-slate-900 min-w-[80px]">Upload PDF:</span>
                                            <span>Add policy documents or articles (Limit: 10MB).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-slate-900 min-w-[80px]">Add URL:</span>
                                            <span>Paste a link to scrape web content.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-slate-900 min-w-[80px]">Indexing:</span>
                                            <span>Automatic text extraction and indexing.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">2.2 Running Analysis</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
                                        <li>Select a source from the list.</li>
                                        <li>Choose an <strong>Analysis Mode</strong> (e.g., Situated Teleology, Normative Attractors).</li>
                                        <li>Click <strong>Analyze</strong> (Cost: 1 Credit/run).</li>
                                    </ol>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">2.3 The Ecosystem Map</h3>
                                    <p className="text-slate-600 mb-4">The heart of instantTEA, visualizng traced actors and relationships.</p>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Nodes & Edges</h4>
                                            <p className="text-slate-500">Entities (Actors) and their interactions (Relations).</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Side Panels</h4>
                                            <p className="text-slate-500">Filter actors on the left, view analysis details on the right.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Advanced Features */}
                        <section id="advanced">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Activity className="h-6 w-6 text-purple-600" />
                                3. Advanced Features
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Comparative Synthesis</h3>
                                    <p className="text-slate-600 text-sm">Compare two documents to find divergent definitions and policy conflict points.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Assemblage Mechanisms</h3>
                                    <p className="text-slate-600 text-sm">Analyze <strong>Territorialization</strong> (stabilizing forces) and <strong>Deterritorialization</strong> (destabilizing forces).</p>
                                </div>
                            </div>
                        </section>

                        {/* 4. Credits & Billing */}
                        <section id="credits">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <CreditCard className="h-6 w-6 text-amber-600" />
                                4. Credits & Billing
                            </h2>
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">1</div>
                                    <p className="text-amber-900 font-medium">1 Credit = 1 AI Analysis Request</p>
                                </div>
                                <p className="text-slate-600 text-sm mb-4">
                                    Viewing results and uploading documents is free. To top up, click the <strong>Credits badge</strong> in the dashboard and select a package via Stripe.
                                </p>
                            </div>
                        </section>

                        {/* 5. FAQ */}
                        <section id="faq">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <HelpCircle className="h-6 w-6 text-slate-600" />
                                5. FAQ
                            </h2>
                            <div className="space-y-4">
                                <details className="group p-4 bg-slate-50 rounded-lg open:bg-white open:shadow-lg transition-all">
                                    <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                                        Is my data used to train AI models?
                                        <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="mt-2 text-slate-600 text-sm">
                                        <strong>No.</strong> We strictly segment user data and do not use it for model training.
                                    </p>
                                </details>
                                <details className="group p-4 bg-slate-50 rounded-lg open:bg-white open:shadow-lg transition-all">
                                    <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                                        Can I export my graph?
                                        <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="mt-2 text-slate-600 text-sm">
                                        Yes. On the Ecosystem page, specific export options allow you to download the graph data as JSON or CSV.
                                    </p>
                                </details>
                                <details className="group p-4 bg-slate-50 rounded-lg open:bg-white open:shadow-lg transition-all">
                                    <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                                        What is "Demo Mode"?
                                        <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="mt-2 text-slate-600 text-sm">
                                        If you see a notification about "Demo Mode," it means you are viewing a read-only version of the app. You can explore data but cannot upload files or spend credits.
                                    </p>
                                </details>
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
