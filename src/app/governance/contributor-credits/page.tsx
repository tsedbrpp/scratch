import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen, Scale, GitPullRequest, Eye, Globe, Shield } from "lucide-react";

export const metadata = {
    title: "Contributor Credit Policy | instantTEA",
    description: "Policy on earning usage credits through substantive contributions to Assemblage-AI.",
};

export default function ContributorCreditPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-6">
                    <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                    <div className="border-b border-slate-800 pb-8">
                        <h1 className="text-4xl font-extrabold text-white mb-2">Assemblage-AI Contributor Credit Policy</h1>
                        <p className="text-slate-400 text-lg">Version 1.0 • Effective: Upon publication</p>
                    </div>
                </div>

                {/* 1. Purpose */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-emerald-500">1.</span> Purpose
                    </h2>
                    <p className="text-slate-400 leading-relaxed">
                        This policy defines how users may earn <strong>usage credits</strong> through substantive contributions to the critical, interpretive, and technical development of Assemblage-AI. The policy exists to:
                    </p>
                    <ul className="list-disc pl-6 text-slate-400 space-y-2">
                        <li>Recognize <strong>intellectual and critical labor</strong> as infrastructural work</li>
                        <li>Support reflexive governance of the system</li>
                        <li>Reduce economic barriers to participation</li>
                        <li>Maintain the sustainability of the hosted platform</li>
                    </ul>
                    <div className="bg-slate-900/50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-slate-300">
                            Credits issued under this policy offset computational costs; they do not represent wages, ownership, or employment.
                        </p>
                    </div>
                </section>

                {/* 2. Principle of Alignment */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-emerald-500">2.</span> Principle of Alignment
                    </h2>
                    <p className="text-slate-400 leading-relaxed">
                        Assemblage-AI treats critique as a <strong>constitutive component</strong> of the system rather than external feedback. Accordingly:
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardContent className="pt-6 text-center">
                                <Scale className="mx-auto h-8 w-8 text-indigo-400 mb-2" />
                                <p className="text-sm text-slate-300">Valued for theoretical & methodological substance</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardContent className="pt-6 text-center">
                                <Shield className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                                <p className="text-sm text-slate-300">Quality over quantity</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardContent className="pt-6 text-center">
                                <Eye className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                                <p className="text-sm text-slate-300">Disagreement is valued, not penalized</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 3. Eligible Categories */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-emerald-500">3.</span> Eligible Contribution Categories
                    </h2>
                    <div className="grid gap-6">
                        <CategoryCard
                            title="3.1 Interpretive Critique"
                            icon={<BookOpen className="h-5 w-5 text-pink-400" />}
                            description="Substantive challenges to system outputs, identifying missing actors or alternative theoretical readings."
                            function="Surfacing absences and destabilizing premature closure."
                        />
                        <CategoryCard
                            title="3.2 Bias, Ethics, and Governance Review"
                            icon={<Shield className="h-5 w-5 text-red-400" />}
                            description="Identifying epistemic narrowing, colonial assumptions, or hidden governance effects."
                            function="Preventing black-boxing and reinforcing reflexive accountability."
                        />
                        <CategoryCard
                            title="3.3 Methodological Evaluation"
                            icon={<Scale className="h-5 w-5 text-blue-400" />}
                            description="Assessment of how lenses are operationalized, scoring rubrics, and prompt structures."
                            function="Improving research validity and interpretive rigor."
                        />
                        <CategoryCard
                            title="3.4 Documentation & Translation"
                            icon={<Globe className="h-5 w-5 text-green-400" />}
                            description="Improving clarity for non-technical audiences, translation, and educational materials."
                            function="Expanding situated participation and interpretive reach."
                        />
                        <CategoryCard
                            title="3.5 Technical & Design Contributions"
                            icon={<GitPullRequest className="h-5 w-5 text-purple-400" />}
                            description="Code contributions (PRs), performance fixes, and transparency-enhancing design."
                            function="Stabilizing the technical substrate without centralizing control."
                        />
                    </div>
                </section>

                {/* 4. Credit Award Guidelines */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-emerald-500">4.</span> Credit Award Guidelines
                    </h2>
                    <p className="text-slate-400">Credits are awarded based on <strong>substance and impact</strong>, not effort claimed.</p>

                    <div className="overflow-hidden rounded-lg border border-slate-800">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900 text-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Level</th>
                                    <th className="px-6 py-3 font-semibold">Typical Characteristics</th>
                                    <th className="px-6 py-3 font-semibold">Range</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                                <tr className="hover:bg-slate-900/80 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">Minor</td>
                                    <td className="px-6 py-4">Clarifications, small corrections, targeted suggestions</td>
                                    <td className="px-6 py-4 text-emerald-400 font-mono">1–3</td>
                                </tr>
                                <tr className="hover:bg-slate-900/80 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">Moderate</td>
                                    <td className="px-6 py-4">Well-argued critique, documented bias, useful review</td>
                                    <td className="px-6 py-4 text-emerald-400 font-mono">4–8</td>
                                </tr>
                                <tr className="hover:bg-slate-900/80 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">Substantial</td>
                                    <td className="px-6 py-4">Deep theoretical intervention, major fix, validated redesign</td>
                                    <td className="px-6 py-4 text-emerald-400 font-mono">9–20</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-slate-500 italic">Final credit determination is made by the Assemblage-AI governance team.</p>
                </section>

                {/* 5-10 Remaining Sections (Grouped for brevity) */}
                <div className="grid gap-8 md:grid-cols-2">
                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-white">5. Review Process</h3>
                        <ol className="list-decimal pl-5 space-y-2 text-slate-400 text-sm">
                            <li>Submit via designated channels (GitHub/Forms).</li>
                            <li>Reviewed for relevance, specificity, and good faith.</li>
                            <li>Accepted contributions logged and credits issued.</li>
                        </ol>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-white">6. Integrity Safeguards</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400 text-sm">
                            <li>Repetitive or bad-faith submissions rejected.</li>
                            <li>Credits may be capped per period.</li>
                            <li><strong>Disagreement is welcome; manipulation is not.</strong></li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-white">7. Open Source</h3>
                        <p className="text-slate-400 text-sm">
                            This policy applies only to the hosted platform. Forking and self-hosting do not require credits and are not governed by this policy.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-white">8. Usage & Scope</h3>
                        <p className="text-slate-400 text-sm">
                            Credits are non-transferable, have no cash value, and apply only to hosted usage.
                            Policy is subject to revision based on community feedback.
                        </p>
                    </section>
                </div>

                {/* Closing */}
                <div className="bg-gradient-to-br from-indigo-900/20 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-8 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-white">"Critical thought is infrastructure."</h2>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        This policy formalizes a commitment to reward those who help the system see its blind spots, question its assumptions, and remain open to revision.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link href="/settings/billing">
                            <Button variant="outline" className="border-slate-600 hover:bg-slate-800 text-slate-300">
                                View My Credits
                            </Button>
                        </Link>
                        <Link href="https://github.com/tsedbrpp/scratch" target="_blank">
                            <Button className="bg-slate-800 hover:bg-slate-700 text-white gap-2">
                                <GitPullRequest className="h-4 w-4" />
                                Contribute on GitHub
                            </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

function CategoryCard({ title, icon, description, function: func }: { title: string, icon: any, description: string, function: string }) {
    return (
        <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-200 flex items-center gap-3">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-slate-400 text-sm">{description}</p>
                <div className="flex items-start gap-2 text-xs text-emerald-400/80 bg-emerald-900/10 p-2 rounded">
                    <span className="font-semibold uppercase tracking-wider shrink-0">Function:</span>
                    {func}
                </div>
            </CardContent>
        </Card>
    );
}
