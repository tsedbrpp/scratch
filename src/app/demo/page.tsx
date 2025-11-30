"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Lightbulb, Sparkles, Lock } from "lucide-react";
import { CulturalHoleCard } from "@/components/CulturalHoleCard";
import { CulturalHoleNetwork } from "@/components/CulturalHoleNetwork";
import { CulturalHoleMatrix } from "@/components/CulturalHoleMatrix";
import { CulturalAnalysisResult } from "@/types/cultural";

// --- FROZEN DEMO DATA ---
const DEMO_ANALYSIS: CulturalAnalysisResult = {
    timestamp: new Date().toISOString(),
    summary: "This analysis reveals a significant 'cultural hole' between the EU's risk-based, state-centric approach and Brazil's rights-based, collective-focused framework. The primary tension lies between 'technocratic universalism' and 'data sovereignty'.",
    clusters: [
        {
            id: "c1",
            name: "Technocratic Universalism (EU)",
            description: "Governance through standardized risk assessments and expert oversight.",
            themes: ["Risk Management", "Standardization", "Market Harmonization", "Fundamental Rights as Compliance"],
            sources: ["EU AI Act"],
            centroid: [0.1, 0.2], // Mock coordinates
            size: 4,
            quotes: [
                { text: "High-risk AI systems shall be subject to a conformity assessment...", source: "EU AI Act" },
                { text: "Ensure the proper functioning of the internal market...", source: "EU AI Act" }
            ]
        },
        {
            id: "c2",
            name: "Data Sovereignty (Brazil)",
            description: "Focus on collective rights, anti-discrimination, and national control over data.",
            themes: ["Collective Rights", "Anti-Discrimination", "National Sovereignty", "Algorithmic Racism"],
            sources: ["Brazil PL 2338"],
            centroid: [0.8, 0.9], // Mock coordinates
            size: 4,
            quotes: [
                { text: "The discipline of AI use shall observe... non-discrimination and correction of biases...", source: "Brazil PL 2338" },
                { text: "Guaranteeing the centrality of the human person...", source: "Brazil PL 2338" }
            ]
        },
        {
            id: "c3",
            name: "Corporate Self-Regulation (US)",
            description: "Emphasis on innovation, voluntary standards, and market-driven governance.",
            themes: ["Innovation First", "Voluntary Standards", "Market Competition", "Light-touch Regulation"],
            sources: ["US Executive Order on AI"],
            centroid: [0.5, 0.8], // Mock coordinates
            size: 3,
            quotes: [
                { text: "Promoting innovation and competition...", source: "US Executive Order" },
                { text: "Industry standards and best practices...", source: "US Executive Order" }
            ]
        }
    ],
    holes: [
        {
            id: "h1",
            clusterA: "c1",
            clusterB: "c2",
            distance: 0.85,
            opportunity: "Developing 'Sovereign Compliance' mechanisms that satisfy EU standards while enforcing local collective rights.",
            policyImplication: "Create 'tropicalized' conformity assessments that include racial impact studies as a mandatory component of risk analysis.",
            bridgingConcepts: [
                {
                    concept: "Situated Risk Assessment",
                    explanation: "Risk metrics that adapt to local social vulnerabilities rather than universal technical standards."
                },
                {
                    concept: "Algorithmic Reparations",
                    explanation: "Moving beyond 'bias mitigation' to active redress for historical inequalities."
                }
            ]
        },
        {
            id: "h2",
            clusterA: "c1",
            clusterB: "c3",
            distance: 0.6,
            opportunity: "Harmonizing 'Auditable Innovation' where voluntary standards can be certified for EU compliance.",
            policyImplication: "Establish 'Safe Harbor' frameworks where US innovation practices meet EU safety thresholds through third-party audit.",
            bridgingConcepts: [
                {
                    concept: "Certified Self-Regulation",
                    explanation: "Industry standards that are formally recognized as meeting regulatory requirements."
                }
            ]
        },
        {
            id: "h3",
            clusterA: "c2",
            clusterB: "c3",
            distance: 0.9,
            opportunity: "Constructing 'Rights-Based Innovation' that sees data protection as a competitive advantage rather than a constraint.",
            policyImplication: "Incentivize 'Privacy-Enhancing Technologies' (PETs) that allow for innovation while respecting data sovereignty.",
            bridgingConcepts: [
                {
                    concept: "Sovereign Innovation Zones",
                    explanation: "Sandboxes where foreign tech can operate if they adopt local data governance rules."
                }
            ]
        }
    ]
};

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Demo Header */}
            <div className="bg-slate-900 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/">
                            <Button variant="ghost" className="text-slate-300 hover:text-white pl-0">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/50">
                            Demo Mode
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Sample Analysis: EU vs. Brazil
                    </h1>
                    <p className="text-lg text-slate-300 max-w-3xl">
                        This is a pre-generated analysis comparing the <strong>EU AI Act</strong> and <strong>Brazil's PL 2338</strong>.
                        It demonstrates how Assemblage.ai detects "cultural holes" between different governance frameworks.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Context & Clusters */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Summary Card */}
                        <Card className="shadow-lg border-blue-100">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-50">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-blue-900">Executive Summary</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-slate-700 leading-relaxed text-lg">
                                    {DEMO_ANALYSIS.summary}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Network Visualization (Mocked) */}
                        <Card className="shadow-md">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5 text-slate-600" />
                                    <CardTitle>Discourse Cluster Network</CardTitle>
                                </div>
                                <CardDescription>
                                    Visualizing the semantic distance between EU and Brazilian policy concepts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
                                    <CulturalHoleNetwork
                                        clusters={DEMO_ANALYSIS.clusters}
                                        holes={DEMO_ANALYSIS.holes}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detailed Clusters */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {DEMO_ANALYSIS.clusters.map((cluster) => (
                                <Card key={cluster.id} className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{cluster.name}</CardTitle>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {cluster.sources.map(s => (
                                                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-slate-600">{cluster.description}</p>

                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Key Themes</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {cluster.themes.map(t => (
                                                    <Badge key={t} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Evidence</h4>
                                            <ul className="space-y-2">
                                                {cluster.quotes?.map((quote, i) => (
                                                    <li key={i} className="text-xs text-slate-600 italic border-l-2 border-blue-300 pl-2">
                                                        "{quote.text}"
                                                        <span className="block text-[10px] text-slate-400 not-italic mt-1">— {quote.source}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Cultural Holes & Insights */}
                    <div className="space-y-6">
                        <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Lightbulb className="h-6 w-6 text-yellow-400" />
                                <h3 className="text-xl font-bold">Detected Cultural Holes</h3>
                            </div>
                            <p className="text-indigo-200 text-sm mb-6">
                                Areas where the two frameworks diverge significantly, creating opportunities for theoretical innovation.
                            </p>

                            <div className="space-y-4">
                                {DEMO_ANALYSIS.holes.map((hole) => (
                                    <CulturalHoleCard
                                        key={hole.id}
                                        hole={hole}
                                        clusters={DEMO_ANALYSIS.clusters}
                                    />
                                ))}
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Comparison Matrix</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CulturalHoleMatrix
                                    clusters={DEMO_ANALYSIS.clusters}
                                    holes={DEMO_ANALYSIS.holes}
                                />
                            </CardContent>
                        </Card>

                        {/* CTA Box */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white text-center shadow-xl">
                            <Lock className="h-8 w-8 mx-auto mb-4 text-blue-200" />
                            <h3 className="text-lg font-bold mb-2">Ready to analyze your own data?</h3>
                            <p className="text-blue-100 text-sm mb-6">
                                Create an account to upload documents, run custom analyses, and save your research.
                            </p>
                            <Link href="/sign-up">
                                <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                                    Get Started for Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
