import Link from "next/link";
import { ArrowLeft, Scale, AlertTriangle, FileText, Gavel, ShieldCheck } from "lucide-react";

export default function TermsOfServicePage() {
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
                            <Scale className="h-8 w-8 text-blue-400" />
                            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                        </div>
                        <p className="text-slate-300 text-lg">
                            The rules and regulations for using the instantTEA platform.
                        </p>
                        <p className="text-slate-400 text-sm mt-4">Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="px-8 py-10 space-y-12">

                        {/* 1. Acceptance */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <FileText className="h-6 w-6 text-emerald-600" />
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-slate-600">
                                By accessing or using <strong>instantTEA</strong>, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                            </p>
                        </section>

                        {/* 2. Acceptable Use */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                                2. Acceptable Use
                            </h2>
                            <p className="text-slate-600 mb-4">
                                You agree to use the platform only for lawful purposes in accordance with its intended research function.
                            </p>
                            <ul className="space-y-3 text-slate-600">
                                <li className="flex items-start gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                                    <span className="text-sm"><strong>You must NOT</strong> upload content that is illegal, harmful, threatening, abusive, harassment, defamatory, vulgar, obscene, or invasive of another's privacy.</span>
                                </li>
                                <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="h-5 w-5 flex items-center justify-center font-bold text-slate-400">1</span>
                                    <span className="text-sm">You retain all rights to the data you upload.</span>
                                </li>
                                <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="h-5 w-5 flex items-center justify-center font-bold text-slate-400">2</span>
                                    <span className="text-sm">You are responsible for maintaining the confidentiality of your account credentials.</span>
                                </li>
                            </ul>
                        </section>

                        {/* 3. Disclaimers */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                                3. Disclaimers & Limitation of Liability
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600">
                                <p>
                                    <strong>AI Analysis Tools:</strong> The services use Artificial Intelligence. Output is probabilistic and may contain errors. You should independently verify all critical information.
                                </p>
                                <p>
                                    <strong>"As Is" Service:</strong> The service is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind. We do not guarantee the service will be uninterrupted or error-free.
                                </p>
                                <p>
                                    **Limitation:** In no event shall instantTEA be liable for any indirect, incidental, special, consequential or punitive damages.
                                </p>
                            </div>
                        </section>

                        {/* 4. Governing Law */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                <Gavel className="h-6 w-6 text-slate-700" />
                                4. Governing Law
                            </h2>
                            <p className="text-slate-600">
                                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the provider is established, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                            <h3 className="text-lg font-bold text-slate-900">Contact Us</h3>
                            <p className="text-slate-600 mb-4">If you have any questions about these Terms, please contact us.</p>
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
