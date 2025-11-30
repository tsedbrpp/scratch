"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Lightbulb, Sparkles, Lock, FileText, Activity, Grid, Download, Share2, Maximize2, SlidersHorizontal, Info, CheckCircle2 } from "lucide-react";
import { CulturalHoleCard } from "@/components/CulturalHoleCard";
import { CulturalHoleNetwork } from "@/components/CulturalHoleNetwork";
import { CulturalHoleMatrix } from "@/components/CulturalHoleMatrix";
import { CulturalAnalysisResult, BridgingConcept } from "@/types/cultural";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from "@/components/policy/AnalysisResults";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

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

// Mock Data for Document Analysis
const DEMO_FULL_ANALYSIS: any = {
    key_insight: "The EU AI Act represents a 'Brussels Effect' strategy, attempting to export a risk-based technocratic governance model that prioritizes market safety over situated social justice, potentially creating a 'compliance industrial complex' that marginalizes non-European epistemologies.",
    governance_power_accountability: "Centralized enforcement through the AI Office and national competent authorities. Accountability is procedural, focused on conformity assessments rather than direct democratic oversight.",
    plurality_inclusion_embodiment: "Limited. The 'risk' taxonomy is universalizing, failing to account for how AI harms are differentially embodied across race, gender, and geography (e.g., migration control systems).",
    agency_codesign_self_determination: "Low. The Act is top-down regulation. Affected communities have little role in the design or audit of high-risk systems, which are largely self-assessed by providers.",
    reflexivity_situated_praxis: "Absent. The Act assumes a 'view from nowhere' objectivity in risk calculation, ignoring the situated nature of data and the colonial history of classification systems.",
    legitimacy_claims: {
        source: "Industrial/Civic Compromise",
        mechanisms: "Standardization (CEN/CENELEC), Conformity Assessments, CE Marking",
        tensions: "Tension between 'protecting fundamental rights' (Civic) and 'ensuring the proper functioning of the internal market' (Industrial/Market)."
    },
    assemblage_dynamics: {
        territorialization: "Stabilizes the 'Single Market' for AI through harmonized rules, creating a bounded territory of 'trustworthy AI' that excludes non-compliant external systems.",
        deterritorialization: "Disrupts national regulatory autonomy, shifting power to supranational bodies and private standard-setting organizations.",
        coding: "Codes 'risk' as a technical property of the system, rather than a relational property of power dynamics, translating social harm into engineering metrics."
    }
};

const DEMO_STANDARD_ANALYSIS: any = {
    key_insight: "The EU AI Act establishes a comprehensive risk-based framework for AI safety, ensuring market harmonization while protecting fundamental rights through technical standards and conformity assessments.",
    governance_power_accountability: "Clear governance structure with EU AI Office and national authorities. Accountability ensured through ex-ante conformity assessments and post-market monitoring.",
    plurality_inclusion_embodiment: "Standardized approach to fundamental rights impact assessments. Focus on technical bias mitigation and data quality requirements.",
    agency_codesign_self_determination: "Transparency obligations for high-risk systems (e.g., registration in EU database) empower users. Human oversight requirements ensure agency.",
    reflexivity_situated_praxis: "Objective risk classification based on intended purpose and deployment context. Rigorous testing and validation protocols.",
    legitimacy_claims: {
        source: "Democratic/Legal",
        mechanisms: "Parliamentary Process, Expert Consultation, Impact Assessments",
        tensions: "Balancing innovation with regulation."
    },
    assemblage_dynamics: {
        territorialization: "Creates a trusted single market for AI.",
        deterritorialization: "Removes barriers to cross-border AI trade.",
        coding: "Codifies safety and fundamental rights into technical requirements."
    }
};

export default function DemoPage() {
    const [analysisMode, setAnalysisMode] = useState<'standard' | 'decolonial'>('decolonial');
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [selectedConcept, setSelectedConcept] = useState<BridgingConcept | null>(null);

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
                        Assemblage AI Demo
                    </h1>
                    <p className="text-lg text-slate-300 max-w-3xl">
                        Click the tabs below to explore cultural holes, review document insights, and access critical theoretical resources.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8">
                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg hidden md:block">
                            <Lock className="h-6 w-6 text-blue-100" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold">Ready to analyze your own data?</h3>
                            <p className="text-blue-100 text-sm">
                                Create an account to upload documents, run custom analyses, and save your research.
                            </p>
                        </div>
                    </div>
                    <Link href="/sign-up">
                        <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 whitespace-nowrap">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="document" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8">
                        <TabsTrigger value="document" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none py-3">
                            <FileText className="mr-2 h-4 w-4" /> Document Analysis
                        </TabsTrigger>
                        <TabsTrigger value="cultural" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none py-3">
                            <BrainCircuit className="mr-2 h-4 w-4" /> Cultural Analysis
                        </TabsTrigger>
                        <TabsTrigger value="matrix" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none py-3">
                            <Grid className="mr-2 h-4 w-4" /> Comparison Matrix
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
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BrainCircuit className="h-5 w-5 text-slate-600" />
                                                <CardTitle>Discourse Cluster Network</CardTitle>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`text-slate-400 hover:text-slate-600 ${isLiveMode ? 'text-indigo-600 bg-indigo-50' : ''}`}
                                                onClick={() => setIsLiveMode(!isLiveMode)}
                                            >
                                                {isLiveMode ? <Activity className="h-4 w-4 mr-2 animate-pulse" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                                                {isLiveMode ? "Live Mode Active" : "Fullscreen"}
                                            </Button>
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
                                                isLive={isLiveMode}
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


                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="matrix" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-5xl mx-auto">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Cross-Cultural Comparison Matrix</h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">
                                    Identify structural gaps and opportunities for bridging between different regulatory frameworks.
                                    Darker red cells indicate larger cultural distances.
                                </p>
                            </div>

                            <Card className="shadow-xl border-slate-200 overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Grid className="h-5 w-5 text-indigo-600" />
                                            <CardTitle className="text-lg text-slate-800">Distance Matrix</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                                                <SlidersHorizontal className="h-3 w-3 text-slate-500" />
                                                <span className="text-xs font-medium text-slate-600">Threshold:</span>
                                                <input type="range" className="w-24 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer" />
                                                <span className="text-xs font-medium text-slate-600">0.5</span>
                                            </div>
                                            <Badge variant="outline" className="bg-white">
                                                {DEMO_ANALYSIS.clusters.length} Clusters Analyzed
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 flex justify-center bg-white">
                                    <CulturalHoleMatrix
                                        clusters={DEMO_ANALYSIS.clusters}
                                        holes={DEMO_ANALYSIS.holes}
                                        onConceptClick={setSelectedConcept}
                                    />
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                        <Activity className="h-5 w-5 text-red-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Identify Gaps</h3>
                                    <p className="text-sm text-slate-600">
                                        Locate high-distance pairs (red cells) where regulatory frameworks are most divergent.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                                        <Lightbulb className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Find Opportunities</h3>
                                    <p className="text-sm text-slate-600">
                                        Hover over cells to reveal specific "bridging concepts" that can reconcile these differences.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <BrainCircuit className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Design Policy</h3>
                                    <p className="text-sm text-slate-600">
                                        Use the suggested "Policy Implications" to draft regulations that work across borders.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="document" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Document Analysis: EU AI Act</h2>
                                <p className="text-slate-600">
                                    Deep structural analysis using the Decolonial Situatedness Framework.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                                <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                                    <button
                                        onClick={() => setAnalysisMode('standard')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${analysisMode === 'standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Standard Risk Assessment
                                    </button>
                                    <button
                                        onClick={() => setAnalysisMode('decolonial')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${analysisMode === 'decolonial' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Decolonial Critique
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="gap-2 text-slate-600">
                                        <Download className="h-4 w-4" /> Export PDF
                                    </Button>
                                    <Button variant="outline" className="gap-2 text-slate-600">
                                        <Share2 className="h-4 w-4" /> Share Report
                                    </Button>
                                </div>
                            </div>
                            <AnalysisResults analysis={analysisMode === 'decolonial' ? DEMO_FULL_ANALYSIS : DEMO_STANDARD_ANALYSIS} />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Policy Drafter Dialog */}
                <Dialog open={!!selectedConcept} onOpenChange={(open) => !open && setSelectedConcept(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                                Generative Policy Drafter
                            </DialogTitle>
                            <DialogDescription>
                                Drafting a policy clause based on the bridging concept: <span className="font-bold text-slate-900">"{selectedConcept?.concept}"</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Context</h4>
                                <p className="text-sm text-slate-700">{selectedConcept?.explanation}</p>
                            </div>

                            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Drafted Clause (v0.1)
                                </h4>
                                <p className="font-mono text-sm text-indigo-900 leading-relaxed bg-white/50 p-4 rounded-lg border border-indigo-200/50">
                                    "Article 14(a): Providers of high-risk AI systems shall implement <strong>{selectedConcept?.concept.toLowerCase()}</strong> protocols. These protocols must demonstrate not only technical compliance but also alignment with local cultural norms and fundamental rights frameworks of the deployment context, subject to third-party audit."
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setSelectedConcept(null)}>Close</Button>
                                <Button className="bg-indigo-600 hover:bg-indigo-700">
                                    <Download className="h-4 w-4 mr-2" /> Save to Drafts
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
