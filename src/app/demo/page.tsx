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

                    import GlossaryPage from "../glossary/page";
                    import LiteraturePage from "../literature/page";
                    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
                    import { FileText, Book, GraduationCap, Activity } from "lucide-react";

                    // Mock Data for Document Analysis
                    const DEMO_DOC_ANALYSIS = {
                        title: "EU AI Act (Final Draft)",
                        type: "Policy Document",
                        summary: "The EU AI Act establishes a comprehensive legal framework for AI, categorizing systems by risk level. It bans unacceptable risks (e.g., social scoring), imposes strict obligations on high-risk systems, and requires transparency for limited-risk AI. The Act aims to balance innovation with fundamental rights protection.",
                        entities: [
                            { name: "European Commission", type: "Organization", sentiment: "Neutral" },
                            { name: "High-Risk AI Systems", type: "Concept", sentiment: "Negative" },
                            { name: "Fundamental Rights", type: "Concept", sentiment: "Positive" },
                            { name: "Conformity Assessment", type: "Process", sentiment: "Neutral" },
                            { name: "Market Surveillance Authority", type: "Role", sentiment: "Neutral" }
                        ],
                        sentiment: {
                            score: 0.2, // Slightly positive/neutral
                            label: "Balanced / Regulatory",
                            breakdown: { positive: 35, neutral: 50, negative: 15 }
                        }
                    };

                    export default function DemoPage() {
                    return(
        <div className = "min-h-screen bg-slate-50 pb-20" >
                            {/* Demo Header */ }
                            < div className = "bg-slate-900 text-white py-12 px-6" >
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
                                        Assemblage.ai Demo
                                    </h1>
                                    <p className="text-lg text-slate-300 max-w-3xl">
                                        Explore the full capabilities of the platform without logging in. Analyze cultural holes, review document insights, and access critical theoretical resources.
                                    </p>
                                </div>
            </div >

    <div className="max-w-7xl mx-auto px-6 -mt-8">
        <Tabs defaultValue="cultural" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8">
                <TabsTrigger value="cultural" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none py-3">
                    <BrainCircuit className="mr-2 h-4 w-4" /> Cultural Analysis
                </TabsTrigger>
                <TabsTrigger value="document" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none py-3">
                    <FileText className="mr-2 h-4 w-4" /> Document Analysis
                </TabsTrigger>
                <TabsTrigger value="glossary" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none py-3">
                    <Book className="mr-2 h-4 w-4" /> Critical Glossary
                </TabsTrigger>
                <TabsTrigger value="literature" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none py-3">
                    <GraduationCap className="mr-2 h-4 w-4" /> Literature Review
                </TabsTrigger>
            </TabsList>

            <TabsContent value="cultural" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-xl shadow-2xl border border-indigo-500/30 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                        <Lightbulb className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white leading-tight">Detected Cultural Holes</h3>
                                        <p className="text-indigo-200 text-xs mt-1">
                                            Strategic opportunities for innovation
                                        </p>
                                    </div>
                                </div>

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
            </TabsContent>

            <TabsContent value="document" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Document Summary: {DEMO_DOC_ANALYSIS.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 leading-relaxed">{DEMO_DOC_ANALYSIS.summary}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Key Entities & Concepts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {DEMO_DOC_ANALYSIS.entities.map((entity, i) => (
                                        <Badge key={i} variant="secondary" className={`
                                                    ${entity.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                                                entity.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                                                    'bg-slate-100 text-slate-800'}
                                                `}>
                                            {entity.name} ({entity.type})
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-600" />
                                    Sentiment Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-4">
                                    <div className="text-4xl font-bold text-slate-900 mb-2">{DEMO_DOC_ANALYSIS.sentiment.label}</div>
                                    <div className="text-sm text-slate-500">Overall Tone</div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Positive</span>
                                        <span>{DEMO_DOC_ANALYSIS.sentiment.breakdown.positive}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${DEMO_DOC_ANALYSIS.sentiment.breakdown.positive}%` }}></div>
                                    </div>

                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Neutral</span>
                                        <span>{DEMO_DOC_ANALYSIS.sentiment.breakdown.neutral}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400" style={{ width: `${DEMO_DOC_ANALYSIS.sentiment.breakdown.neutral}%` }}></div>
                                    </div>

                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Negative</span>
                                        <span>{DEMO_DOC_ANALYSIS.sentiment.breakdown.negative}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${DEMO_DOC_ANALYSIS.sentiment.breakdown.negative}%` }}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="glossary" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GlossaryPage />
            </TabsContent>

            <TabsContent value="literature" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LiteraturePage />
            </TabsContent>
        </Tabs>
    </div>
        </div >
    );
}
