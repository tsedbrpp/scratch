"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Network, Scale, Users, Lightbulb, Globe, ShieldCheck } from "lucide-react";

export default function LiteraturePage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900">Theoretical Framework & Literature Review</h1>
                <p className="text-slate-600 max-w-3xl">
                    This module maps the theoretical underpinnings of the "Decolonial Situatedness in Global AI Governance" project.
                    It grounds the application's methodology in key scholarship across Decolonial Studies, STS, and Critical Legal Theory.
                </p>
            </div>

            <Tabs defaultValue="assemblage" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="assemblage" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Network size={16} className="mr-2" /> Assemblage Theory
                    </TabsTrigger>
                    <TabsTrigger value="decolonial" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Globe size={16} className="mr-2" /> Decoloniality
                    </TabsTrigger>
                    <TabsTrigger value="resistance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Users size={16} className="mr-2" /> Resistance
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Scale size={16} className="mr-2" /> Critical Legal
                    </TabsTrigger>
                    <TabsTrigger value="reflexivity" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Lightbulb size={16} className="mr-2" /> Reflexivity
                    </TabsTrigger>
                    <TabsTrigger value="legitimacy" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <ShieldCheck size={16} className="mr-2" /> Legitimacy
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    {/* Assemblage Theory Content */}
                    <TabsContent value="assemblage" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Network className="text-blue-600" />
                                    Algorithmic Assemblages
                                </CardTitle>
                                <CardDescription>
                                    Understanding AI governance not as static laws, but as dynamic, socio-technical flows.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Assemblage (Agencement):</strong> A heterogeneous composition of human and non-human actors (Deleuze & Guattari).</li>
                                            <li><strong>Translation:</strong> The process by which actors modify and displace goals (Latour/Callon).</li>
                                            <li><strong>Performativity:</strong> How algorithms enact the realities they purport to describe (MacKenzie).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Deleuze & Guattari</Badge>
                                            <Badge variant="outline">Bruno Latour</Badge>
                                            <Badge variant="outline">Louise Amoore</Badge>
                                            <Badge variant="outline">N. Katherine Hayles</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Application in Project:</h4>
                                    <p className="text-sm text-slate-600">
                                        Used in the <strong>Synthesis Module</strong> to map the flow from Actors &rarr; Mechanisms &rarr; Impacts, visualizing how the EU AI Act and PL 2338 function as "assemblages" of power rather than just text.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Decoloniality Content */}
                    <TabsContent value="decolonial" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="text-emerald-600" />
                                    Decolonial Situatedness
                                </CardTitle>
                                <CardDescription>
                                    Analyzing how "universal" AI governance reinforces Global North epistemologies.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Coloniality of Power:</strong> The continuity of colonial forms of domination after the end of colonial administrations (Quijano).</li>
                                            <li><strong>Border Thinking:</strong> Thinking from the exteriority of the modern/colonial world system (Mignolo).</li>
                                            <li><strong>Data Colonialism:</strong> The extraction of data from the Global South for value capture in the North (Couldry & Mejias).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Aníbal Quijano</Badge>
                                            <Badge variant="outline">Walter Mignolo</Badge>
                                            <Badge variant="outline">Sylvia Wynter</Badge>
                                            <Badge variant="outline">Paola Ricaurte</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mt-4">
                                    <h4 className="text-sm font-semibold text-emerald-900 mb-2">Application in Project:</h4>
                                    <p className="text-sm text-emerald-800">
                                        Informs the <strong>Ontology Module</strong> and <strong>Cultural Analysis</strong>, questioning the "universal" applicability of the EU's "Risk-Based Approach" when transplanted to the Brazilian context.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Resistance Content */}
                    <TabsContent value="resistance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="text-amber-600" />
                                    Micro-Resistance & Friction
                                </CardTitle>
                                <CardDescription>
                                    Identifying how local actors adapt, resist, or subvert algorithmic governance.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Weapons of the Weak:</strong> Everyday forms of peasant resistance (Scott).</li>
                                            <li><strong>Friction:</strong> The awkward, unequal, unstable, and creative qualities of interconnection (Tsing).</li>
                                            <li><strong>Glitch Feminism:</strong> Using the error/glitch as a site of resistance (Russell).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">James C. Scott</Badge>
                                            <Badge variant="outline">Anna Lowenhaupt Tsing</Badge>
                                            <Badge variant="outline">Legacy Russell</Badge>
                                            <Badge variant="outline">Saidiya Hartman</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-4">
                                    <h4 className="text-sm font-semibold text-amber-900 mb-2">Application in Project:</h4>
                                    <p className="text-sm text-amber-800">
                                        Central to the <strong>Resistance Module</strong>, where we map "Friction Points" and "Subversion Strategies" in the implementation of AI laws.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Critical Legal Content */}
                    <TabsContent value="legal" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scale className="text-indigo-600" />
                                    Critical Legal Theory & TWAIL
                                </CardTitle>
                                <CardDescription>
                                    Examining international law as a site of struggle and hierarchy.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Legal Transplants:</strong> The movement of laws across borders and their mutation (Watson/Frankenberg).</li>
                                            <li><strong>TWAIL:</strong> Third World Approaches to International Law, critiquing the colonial origins of international norms.</li>
                                            <li><strong>Brussels Effect:</strong> The EU's unilateral power to regulate global markets (Bradford) - <em>critiqued here</em>.</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Antony Anghie</Badge>
                                            <Badge variant="outline">B.S. Chimni</Badge>
                                            <Badge variant="outline">Anu Bradford</Badge>
                                            <Badge variant="outline">Günter Frankenberg</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-4">
                                    <h4 className="text-sm font-semibold text-indigo-900 mb-2">Application in Project:</h4>
                                    <p className="text-sm text-indigo-800">
                                        Used in the <strong>Data Module</strong> and <strong>Comparison</strong> to analyze the "Brussels Effect" not as a neutral diffusion of standards, but as a form of "Legal Imperialism."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reflexivity Content */}
                    <TabsContent value="reflexivity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="text-purple-600" />
                                    Feminist Standpoint & Reflexivity
                                </CardTitle>
                                <CardDescription>
                                    Acknowledging the researcher's position within the assemblage.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Situated Knowledges:</strong> The view from a body, always complex, contradictory, structuring, and structured (Haraway).</li>
                                            <li><strong>Strong Objectivity:</strong> Starting research from the lives of marginalized groups to produce less partial accounts (Harding).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Donna Haraway</Badge>
                                            <Badge variant="outline">Sandra Harding</Badge>
                                            <Badge variant="outline">Patricia Hill Collins</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-4">
                                    <h4 className="text-sm font-semibold text-purple-900 mb-2">Application in Project:</h4>
                                    <p className="text-sm text-purple-800">
                                        Operationalized in the <strong>Reflexivity Module</strong> via the "Methodological Log" and "Positionality Statement," ensuring the researcher does not claim a "God Trick" view from nowhere.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Legitimacy Content */}
                    <TabsContent value="legitimacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="text-rose-600" />
                                    Sociology of Critique & Orders of Worth
                                </CardTitle>
                                <CardDescription>
                                    Analyzing how actors justify their actions and claims to legitimacy.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Orders of Worth (Cités):</strong> Distinct worlds of justification (Market, Industrial, Civic, Domestic, Inspired, Fame).</li>
                                            <li><strong>Tests of Worth:</strong> Moments where legitimacy is challenged and must be proven through evidence.</li>
                                            <li><strong>Compromise:</strong> Fragile agreements formed between conflicting orders of worth.</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Luc Boltanski</Badge>
                                            <Badge variant="outline">Laurent Thévenot</Badge>
                                            <Badge variant="outline">Eve Chiapello</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 mt-4">
                                    <h4 className="text-sm font-semibold text-rose-900 mb-2">Application in Project:</h4>
                                    <p className="text-sm text-rose-800">
                                        Used in the <strong>Legitimacy Module</strong> to analyze the "moral vocabulary" of AI policy documents, identifying which "Orders of Worth" (e.g., Industrial efficiency vs. Civic solidarity) are dominant.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
