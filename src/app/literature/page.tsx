"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Globe, Users, BookOpen, Lightbulb, Microscope } from "lucide-react";

export default function LiteraturePage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900">Theoretical Framework & Literature Review</h1>
                <p className="text-slate-600 max-w-3xl">
                    This module maps the theoretical underpinnings of the research, grounding the application's methodology in Assemblage Theory, Actor-Network Theory, hermeneutic design science, and decolonial computing.
                </p>
            </div>

            <Tabs defaultValue="assemblage" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="assemblage" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Network size={16} className="mr-2" /> Assemblage
                    </TabsTrigger>
                    <TabsTrigger value="ant" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Microscope size={16} className="mr-2" /> ANT
                    </TabsTrigger>
                    <TabsTrigger value="decolonial" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Globe size={16} className="mr-2" /> Decolonial
                    </TabsTrigger>
                    <TabsTrigger value="resistance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Users size={16} className="mr-2" /> Resistance
                    </TabsTrigger>
                    <TabsTrigger value="hermeneutic" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Lightbulb size={16} className="mr-2" /> Hermeneutic
                    </TabsTrigger>
                    <TabsTrigger value="policy" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BookOpen size={16} className="mr-2" /> Policy
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    {/* Assemblage Theory */}
                    <TabsContent value="assemblage" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Network className="text-blue-600" />
                                    Assemblage Theory (DeLanda)
                                </CardTitle>
                                <CardDescription>
                                    Understanding algorithmic governance as heterogeneous assemblages of material and expressive components, not static structures.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Territorialization/Deterritorialization:</strong> Processes that stabilize or destabilize assemblages (DeLanda, 2006).</li>
                                            <li><strong>Coding/Decoding:</strong> The degree of rigidity in component definitions (DeLanda, 2006).</li>
                                            <li><strong>Relations of Exteriority:</strong> Components maintain autonomy and can be detached (DeLanda, 2006).</li>
                                            <li><strong>Emergence:</strong> Properties arise from component interactions, not reducible to parts (DeLanda, 2016).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Texts</h3>
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="bg-slate-50 p-2 rounded border">
                                                <strong>DeLanda, M. (2006).</strong> <em>A New Philosophy of Society: Assemblage Theory and Social Complexity.</em> Continuum.
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded border">
                                                <strong>DeLanda, M. (2016).</strong> <em>Assemblage Theory.</em> Edinburgh University Press.
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded border">
                                                <strong>Deleuze, G., & Guattari, F. (1987).</strong> <em>A Thousand Plateaus.</em> University of Minnesota Press.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Application in Tool:</h4>
                                    <p className="text-sm text-blue-800">
                                        The <strong>Assemblage Compass</strong> visualizes actors along territorialization/deterritorialization axes. Metrics are qualitative (Strong/Moderate/Weak) to avoid pseudo-quantification, embodying interpretive rigor.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ANT */}
                    <TabsContent value="ant" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Microscope className="text-purple-600" />
                                    Actor-Network Theory (ANT)
                                </CardTitle>
                                <CardDescription>
                                    Following actors (human and non-human) to trace how networks are performed and maintained.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Symmetry:</strong> Treat human and non-human actors equally in analysis (Latour, 1993).</li>
                                            <li><strong>Translation:</strong> How actors enroll others by modifying interests (Callon, 1986).</li>
                                            <li><strong>Obligatory Passage Points:</strong> Situations all actors must traverse (Callon, 1986).</li>
                                            <li><strong>Black Boxes:</strong> Stabilized networks hiding internal complexity (Latour, 1987).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Bruno Latour</Badge>
                                            <Badge variant="outline">Michel Callon</Badge>
                                            <Badge variant="outline">John Law</Badge>
                                            <Badge variant="outline">Annemarie Mol</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-4">
                                    <h4 className="text-sm font-semibold text-purple-900 mb-2">Application in Tool:</h4>
                                    <p className="text-sm text-purple-800">
                                        The <strong>Trace Provenance</strong> module follows actors across web sources, treating algorithms, datasets, and legal objects as actors with agency. Every actor requires empirical evidence (traces).
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Decolonial */}
                    <TabsContent value="decolonial" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="text-emerald-600" />
                                    Decolonial Computing & Epistemic Justice
                                </CardTitle>
                                <CardDescription>
                                    Challenging the universalization of Global North epistemologies in AI governance.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Coloniality of Power:</strong> Continuity of colonial domination in knowledge systems (Quijano, 2000).</li>
                                            <li><strong>Data Colonialism:</strong> Digital extraction as colonial resource appropriation (Couldry & Mejias, 2019).</li>
                                            <li><strong>Epistemic Justice:</strong> Recognition of marginalized groups as knowers (Fricker, 2007; Santos, 2014).</li>
                                            <li><strong>Border Thinking:</strong> Thinking from the exteriority of modernity/coloniality (Mignolo, 2000).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Aníbal Quijano</Badge>
                                            <Badge variant="outline">Walter Mignolo</Badge>
                                            <Badge variant="outline">Paola Ricaurte</Badge>
                                            <Badge variant="outline">Lilly Irani</Badge>
                                            <Badge variant="outline">Kavita Philip</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mt-4">
                                    <h4 className="text-sm font-semibold text-emerald-900 mb-2">Application in Tool:</h4>
                                    <p className="text-sm text-emerald-800">
                                        The <strong>Cultural Framing</strong> and <strong>Policy Mobilities</strong> modules analyze how EU AI Act concepts mutate when transplanted to Brazil, revealing epistemic violence in "universal" frameworks.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Resistance */}
                    <TabsContent value="resistance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="text-amber-600" />
                                    Micro-Resistance & Counter-Conduct
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
                                            <li><strong>Counter-Conduct:</strong> Struggles against techniques that conduct conduct (Foucault, 2007).</li>
                                            <li><strong>Weapons of the Weak:</strong> Everyday forms of resistance (Scott, 1985).</li>
                                            <li><strong>Friction:</strong> Unstable, creative qualities of interconnection (Tsing, 2005).</li>
                                            <li><strong>Gambiarra:</strong> Brazilian improvised workarounds as situated knowledge (Lemos, 2007).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Michel Foucault</Badge>
                                            <Badge variant="outline">James C. Scott</Badge>
                                            <Badge variant="outline">Anna Tsing</Badge>
                                            <Badge variant="outline">Legacy Russell</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-4">
                                    <h4 className="text-sm font-semibold text-amber-900 mb-2">Application in Tool:</h4>
                                    <p className="text-sm text-amber-800">
                                        The <strong>Micro-Resistance</strong> module analyzes discourse frames, rhetorical strategies, and reconfiguration potential in resistance artifacts, grounding analysis in empirical traces.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Hermeneutic */}
                    <TabsContent value="hermeneutic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="text-indigo-600" />
                                    Hermeneutic Design Science & Reflexivity
                                </CardTitle>
                                <CardDescription>
                                    Building interpretive tools that acknowledge researcher positionality and AI provisionality.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Hermeneutic Circle:</strong> Iterative interpretation of parts and wholes (Gadamer, 1960).</li>
                                            <li><strong>Provisional Inscriptions:</strong> AI outputs as tentative, requiring ratification (Introna, 2019).</li>
                                            <li><strong>Situated Knowledge:</strong> All knowledge is embodied and positioned (Haraway, 1988).</li>
                                            <li><strong>Strong Objectivity:</strong> Starting from marginalized standpoints (Harding, 1991).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Lucas Introna</Badge>
                                            <Badge variant="outline">Donna Haraway</Badge>
                                            <Badge variant="outline">Sandra Harding</Badge>
                                            <Badge variant="outline">Hans-Georg Gadamer</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-4">
                                    <h4 className="text-sm font-semibold text-indigo-900 mb-2">Application in Tool:</h4>
                                    <p className="text-sm text-indigo-800">
                                        The <strong>Reflexive Positioning</strong> module logs methodological decisions and theoretical tensions. All AI outputs are marked as provisional, requiring researcher validation.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Policy Mobilities */}
                    <TabsContent value="policy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="text-rose-600" />
                                    Policy Mobilities & Institutional Logics
                                </CardTitle>
                                <CardDescription>
                                    Analyzing how policies mutate across jurisdictions and how institutions justify their actions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Concepts</h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                                            <li><strong>Policy Mobilities:</strong> Policies transform through local assemblages (Peck & Theodore, 2010).</li>
                                            <li><strong>Institutional Logics:</strong> Competing organizing principles (Market, State, Community) (Thornton et al., 2012).</li>
                                            <li><strong>Orders of Worth:</strong> Moral frameworks for justification (Boltanski & Thévenot, 2006).</li>
                                            <li><strong>Legal Transplants:</strong> Laws mutate when moved across contexts (Watson, 1974; Frankenberg, 2010).</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-slate-900">Key Scholars</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">Jamie Peck</Badge>
                                            <Badge variant="outline">Patricia Thornton</Badge>
                                            <Badge variant="outline">Luc Boltanski</Badge>
                                            <Badge variant="outline">Günter Frankenberg</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 mt-4">
                                    <h4 className="text-sm font-semibold text-rose-900 mb-2">Application in Tool:</h4>
                                    <p className="text-sm text-rose-800">
                                        The <strong>Policy Mobilities</strong> and <strong>Institutional Logics</strong> modules trace concept genealogies and competing rationalities, revealing how "transparency" means different things in EU vs. Brazil.
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
