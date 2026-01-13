"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Lightbulb, Sparkles, FileText, Activity, Grid, Download, Share2, Maximize2, SlidersHorizontal } from "lucide-react";
import { AnalysisResult } from "@/types";
import { CulturalAnalysisResult } from "@/types/cultural";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from "@/components/policy/AnalysisResults";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

// --- FROZEN DEMO DATA ---
const DEMO_ANALYSIS: CulturalAnalysisResult = {
    timestamp: new Date().toISOString(),
    summary: "This comparative analysis exposes a foundational epistemic divergence: The EU operates on a logic of 'Market Hygiene' (mitigating risk to facilitate trade), while Brazil's framework is grounded in 'Situated Rights' (protecting collective vulnerability against power asymmetry). The US model remains distinct as 'Geopolitical Techno-Optimism'.",
    clusters: [
        {
            id: "c1",
            name: "EU: Instrumental Rationality",
            description: "A framework where safety is operationalized as product compliance. Rights are proceduralized into technical standards.",
            themes: ["Market Hygiene", "Technocratic Universalism", "Risk Taxonomy", "Procedural Fairness"],
            sources: ["EU AI Act"],
            centroid: [0.15, 0.25],
            size: 5,
            quotes: [
                { text: "The purpose of this Regulation is to improve the functioning of the internal market...", source: "EU AI Act, Recital 1" },
                { text: "High-risk AI systems should be designed... to ensure appropriate levels of accuracy, robustness and cybersecurity.", source: "EU AI Act, Art. 15" }
            ]
        },
        {
            id: "c2",
            name: "Brazil: Rights-Based Precaution",
            description: "A framework emphasizing the redress of historical inequality and collective harm, viewing data as a manifestation of personality.",
            themes: ["Data Sovereignty", "Algorithmic Reparations", "Collective Redress", "Reverse Burden of Proof"],
            sources: ["Brazil PL 2338"],
            centroid: [0.85, 0.85],
            size: 5,
            quotes: [
                { text: "The use of AI systems must observe... non-discrimination, justice, and the correction of biases...", source: "PL 2338/23, Art. 3" },
                { text: "Ensuring the centrality of the human person and the preservation of democratic regimes.", source: "PL 2338/23, Art. 1" }
            ]
        },
        {
            id: "c3",
            name: "US: Geopolitical Acceleration",
            description: "Governance serves to maintain strategic hegemony. Regulation is voluntary to avoid slowing down innovation velocity.",
            themes: ["National Security", "Innovation Velocity", "Voluntary Commitments", "Industry Self-Policing"],
            sources: ["US Exec. Order 14110"],
            centroid: [0.45, 0.75],
            size: 4,
            quotes: [
                { text: "Leading the world in innovation and discovery...", source: "EO 14110" },
                { text: "We must govern the development and use of AI safely and responsibly [without] stifling innovation.", source: "EO 14110" }
            ]
        }
    ],

};

// Mock Data for Document Analysis
const DEMO_FULL_ANALYSIS: AnalysisResult = {
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

const DEMO_STANDARD_ANALYSIS: AnalysisResult = {
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
                        A quick overview of Assemblage-AI
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">System Function: Decolonial Situatedness in Global AI Governance Research Platform</h2>
                        <p className="text-slate-700 leading-relaxed">
                            This application is a specialized research instrument designed to operationalize the <strong>Decolonial Situatedness Framework (DSF)</strong> for analyzing global AI governance. Unlike standard legal compliance tools, it functions as an &quot;epistemic lens,&quot; revealing the hidden structural power dynamics, cultural assumptions, and colonial legacies embedded within policy texts (e.g., the EU AI Act, Brazil&apos;s PL 2338).
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Core Capabilities</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-1">1. Multi-Lens Algorithmic Analysis</h4>
                                <p className="text-sm text-slate-600 mb-2">The system employs advanced LLM-driven qualitative analysis to interpret documents through distinct theoretical frameworks:</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-2">
                                    <li><strong>Institutional Logics:</strong> Identifies conflicting values (Market vs. State vs. Community).</li>
                                    <li><strong>Cultural Framing:</strong> Exposes regionally specific assumptions about technology and rights.</li>
                                    <li><strong>Legitimacy Dynamics:</strong> Maps the moral justifications (Orders of Worth) used to defend authority.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-1">2. Ecosystem & Assemblage Mapping</h4>
                                <p className="text-sm text-slate-600">It visualizes governance not as static text, but as active &quot;assemblages.&quot; The <strong>Ecosystem Impact Map</strong> traces how specific policy mechanisms (e.g., &quot;sandboxes&quot;) constrain or afford possibilities for diverse actors, distinguishing between material infrastructures and discursive norms.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-1">3. Comparative Synthesis</h4>
                                <p className="text-sm text-slate-600">The platform features a <strong>Convergence/Divergence Engine</strong> that quantifies the &quot;epistemic distance&quot; between frameworks. It generates &quot;Coloniality Scores&quot; to highlight where Global North standards may be overshadowing local contexts, visualizing these asymmetries via radar charts and synthesis matrices.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-1">4. Empirical Grounding (Micro-Resistance)</h4>
                                <p className="text-sm text-slate-600">To counter abstract high-level rhetoric, the system integrates an <strong>Empirical Traces</strong> engine. It searches live data sources (forums, Reddit) to find &quot;micro-resistances&quot;—real-world examples of how workers and communities subvert or navigate algorithmic control (e.g., &quot;gambiarra&quot; or workarounds), grounding theory in lived experience.</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-700 italic border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50">
                        Ultimately, this system transforms static policy analysis into a dynamic, comparative critique, empowering researchers to challenge hegemonic norms in global AI governance.
                    </p>
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
                                            <div className="text-center p-8 text-slate-400">
                                                Network Visualization Placeholder
                                            </div>
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
                                                                &quot;{quote.text}&quot;
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

                            {/* Right Column: Cultural Holes (Removed) */}
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500">
                                    <h3 className="text-lg font-semibold">Discourse Fields Analysis</h3>
                                    <p className="text-sm mt-2">The "Cultural Holes" visualization has been deprecated in favor of Discourse Fields. Please verify the live analysis page for the latest updates.</p>
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
                                    <div className="text-center p-8 text-slate-400">
                                        Comparison Matrix Placeholder
                                    </div>
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
                                        Hover over cells to reveal specific &quot;bridging concepts&quot; that can reconcile these differences.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <BrainCircuit className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Design Policy</h3>
                                    <p className="text-sm text-slate-600">
                                        Use the suggested &quot;Policy Implications&quot; to draft regulations that work across borders.
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

            </div >
        </div >
    );
}
