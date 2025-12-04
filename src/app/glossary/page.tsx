"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Quote, ExternalLink } from "lucide-react";

const TERMS = [
    {
        term: "Algorithmic Assemblage",
        definition: "A complex, emergently structured sociotechnical system where value creation, capture, and resource orchestration occur. It is not just a tool but a dynamic arrangement of code, data, humans, norms, and material resources.",
        scholar: "Faraj, S., Pachidi, S., & Sayegh, K. (2018); Hannigan, T., et al. (2025)",
        category: "Core Concept",
        url: "https://www.callsforpapers.org/special-issues/algorithmic-assemblages"
    },
    {
        term: "Discursive Field",
        definition: "A social domain structured by language and meaning-making practices. In this context, it refers to how algorithmic technologies differentially circumscribe meaning across global fields and societies.",
        scholar: "Miranda, S., et al. (2022)",
        category: "Macro",
        url: "https://doi.org/10.25300/MISQ/2022/15736"
    },
    {
        term: "Legitimacy Dynamics",
        definition: "The processes by which an algorithmic system or institution justifies its authority and right to exist. This involves navigating tensions between different forms of legitimacy (e.g., democratic, technocratic, market-based).",
        scholar: "Jennings, P.D., et al. (2025)",
        category: "Macro",
        url: "https://www.callsforpapers.org/special-issues/algorithmic-assemblages"
    },
    {
        term: "Sociotechnical System",
        definition: "An approach that views technology and social structures as inextricably linked. Algorithms are not isolated technical artifacts but are embedded in and shape social relations.",
        scholar: "Faraj, S., et al. (2018)",
        category: "Core Concept",
        url: "https://doi.org/10.1016/j.infoandorg.2018.02.005"
    },
    {
        term: "Gambiarra",
        definition: "A Brazilian term for 'workaround' or 'kludge'. In this context, it represents a form of micro-resistance where users creatively repurpose or subvert algorithmic systems to meet their needs.",
        scholar: "Decolonial Theory / Local Context",
        category: "Micro (Resistance)"
    },
    {
        term: "Cultural Hole",
        definition: "A gap or disconnect in meaning, language, or values between different groups within an ecosystem (e.g., between policymakers and developers). These holes can be sources of misunderstanding or opportunities for innovation.",
        scholar: "Hannigan, T. (Interpretive Data Science)",
        category: "Meso",
        url: "https://interpretivedatascience.com/"
    },
    {
        term: "Institutional Logic",
        definition: "The socially constructed, historical patterns of material practices, assumptions, values, beliefs, and rules by which individuals produce and reproduce their material subsistence, organize time and space, and provide meaning to their social reality.",
        scholar: "Thornton, Ocasio, & Lounsbury (2012); Applied by Jennings/Faraj",
        category: "Meso"
    },
    {
        term: "Resource Orchestration",
        definition: "The process by which assets are structured, bundled, and leveraged to create value. In algorithmic assemblages, this orchestration often shifts from within organizations to loosely coupled platforms.",
        scholar: "Hannigan, T., et al. (2025)",
        category: "Macro",
        url: "https://www.callsforpapers.org/special-issues/algorithmic-assemblages"
    }
];

export default function GlossaryPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Critical Glossary
                </h2>
                <p className="text-slate-500">
                    Key theoretical concepts for the analysis of Algorithmic Assemblages.
                </p>
            </div>

            {/* Video Panel */}
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-400" />
                        Introduction To Assemblage Theory
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        A video exploration of algorithmic assemblages.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="aspect-video w-full bg-black relative">
                        <video
                            controls
                            className="w-full h-full object-contain"
                            poster="/landing-bg.png"
                        >
                            <source src="/assemblagebr.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {TERMS.map((item, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-xl font-semibold text-slate-800">
                                    {item.term}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                    {item.category}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-600 leading-relaxed">
                                {item.definition}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                <Quote className="h-3 w-3 text-indigo-400" />
                                <span className="font-medium">Scholarship:</span>
                                <span className="italic">{item.scholar}</span>
                                {(item as any).url && (
                                    <a
                                        href={(item as any).url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="hidden sm:inline">View Source</span>
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
}
