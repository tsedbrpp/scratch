import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Server, Trash2, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="h-8 w-8 text-emerald-400" />
                            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                        </div>
                        <p className="text-slate-300 text-lg">
                            We value your trust. This policy outlines how instantTEA collects, uses, and protects your research data.
                        </p>
                        <p className="text-slate-400 text-sm mt-4">Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="px-8 py-10 space-y-12">

                        {/* 1. Data Collection */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Eye className="h-6 w-6 text-blue-600" />
                                1. what data do we collect?
                            </h2>
                            <ul className="space-y-4 text-slate-600">
                                <li className="bg-slate-50 p-4 rounded-lg">
                                    <strong className="text-slate-900 block mb-1">Account Information</strong>
                                    Managed via <strong>Clerk</strong>. We store your email address and authentication ID to maintain your account and credits.
                                </li>
                                <li className="bg-slate-50 p-4 rounded-lg">
                                    <strong className="text-slate-900 block mb-1">Research Data</strong>
                                    Documents (PDFs) and URLs you upload for analysis. This content is processed solely for the purpose of generating your requested analysis.
                                </li>
                                <li className="bg-slate-50 p-4 rounded-lg">
                                    <strong className="text-slate-900 block mb-1">Usage Data</strong>
                                    Basic logs of API usage (token counts, error rates) to monitor system stability and credit consumption.
                                </li>
                            </ul>
                        </section>

                        {/* 2. Data Usage */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Server className="h-6 w-6 text-indigo-600" />
                                2. How We Use Your Data
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600">
                                <p>
                                    Your data is used exclusively to provide the instantTEA service.
                                </p>
                                <ul>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg my-4">
                                        <h3 className="font-bold text-blue-900 mb-2">Use of Third-Party AI Services</h3>
                                        <p className="text-sm text-blue-800 mb-2">
                                            To provide our analysis features, User Inputs (including prompts and uploaded text) are transmitted to third-party Large Language Model (LLM) providers via API.
                                        </p>
                                        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                            <li><strong>Primary Provider:</strong> OpenAI (GPT-4o / GPT-4 Turbo)</li>
                                            <li><strong>Processing Purpose:</strong> To generate the requested analysis, summary, or critique.</li>
                                            <li><strong>Data Retention:</strong> Data is shared for the sole purpose of generating a response. We do not opt-in to model training. Providers may retain data temporarily (e.g., 30 days) for abuse monitoring.</li>
                                        </ul>
                                    </div>
                                    <li><strong>Payments:</strong> All payment processing is handled by <strong>Stripe</strong>. We do not store credit card numbers.</li>
                                    <li><strong>Storage:</strong> Data is stored in a secure <strong>Redis</strong> database hosted on appropriate infrastructure.</li>
                                </ul>
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg mt-4">
                                    <strong className="text-emerald-900">No Model Training</strong>
                                    <p className="text-emerald-800 text-sm mt-1">We explicitly do not use, sell, or share your uploaded research data to train public AI models.</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Cookies & Tracking */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <span className="h-6 w-6 text-2xl">🍪</span>
                                3. Cookies & Tracking
                            </h2>
                            <p className="text-slate-600 mb-4">
                                We use a minimal set of **essential cookies** to make the site work. We do not use third-party advertising cookies.
                            </p>
                            <ul className="space-y-4 text-slate-600">
                                <li className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <strong className="text-slate-900 block mb-1">Authentication (Clerk)</strong>
                                    <p className="text-sm">Cookies like <code>__session</code> are used to keep you logged in securely.</p>
                                </li>
                                <li className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <strong className="text-slate-900 block mb-1">Payments (Stripe)</strong>
                                    <p className="text-sm">Stripe may use cookies for fraud detection and to process payments securely during checkout.</p>
                                </li>
                            </ul>
                        </section>

                        {/* 4. Data Protection */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Lock className="h-6 w-6 text-purple-600" />
                                4. Data Protection
                            </h2>
                            <p className="text-slate-600 mb-4">We implement industry-standard security measures:</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="border border-slate-200 p-4 rounded-lg">
                                    <h3 className="font-bold text-slate-900">Encryption</h3>
                                    <p className="text-sm text-slate-500">Data is encrypted in transit (TLS) and at rest where supported by our providers.</p>
                                </div>
                                <div className="border border-slate-200 p-4 rounded-lg">
                                    <h3 className="font-bold text-slate-900">Access Control</h3>
                                    <p className="text-sm text-slate-500">Strict Row-Level Security ensures you only access your own data.</p>
                                </div>
                            </div>
                        </section>

                        {/* 5. International Data Transfers */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Globe className="h-6 w-6 text-blue-500" />
                                5. International Data Transfers
                            </h2>
                            <p className="text-slate-600 mb-4">
                                Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                            </p>
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                                <h3 className="font-bold text-slate-900 mb-2">GDPR & Cross-Border Transfers</h3>
                                <p className="text-sm text-slate-600">
                                    If you are located in the European Economic Area (EEA), please note that we rely on **Standard Contractual Clauses (SCCs)** approved by the European Commission, and/or the **Data Privacy Framework (DPF)** where applicable, to ensure your data is protected during transfer to the United States or other jurisdictions.
                                </p>
                            </div>
                        </section>

                        {/* 6. Your Rights */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Trash2 className="h-6 w-6 text-red-600" />
                                6. Your Rights
                            </h2>
                            <p className="text-slate-600 mb-4">
                                You retain full ownership of your research data. You may delete your uploaded documents and analysis results at any time via the Dashboard.
                                Deleted data is permanently removed from our active database.
                            </p>
                            <p className="text-slate-600">
                                To request full account deletion, you may do so directly via the <Link href="/settings/billing" className="text-blue-600 hover:underline">Billing & Settings</Link> page in the "Danger Zone" section.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                            <h3 className="text-lg font-bold text-slate-900">Questions?</h3>
                            <p className="text-slate-600 mb-4">If you have any questions about this Privacy Policy, please contact us.</p>
                            <a href="mailto:admin@instanttea.com" className="text-blue-600 font-semibold hover:underline">admin@instanttea.com</a>
                        </section>

                    </div>

                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 text-center text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} instantTEA Research Group.
                    </div>
                </div>
            </div>
        </div>
    );
}
