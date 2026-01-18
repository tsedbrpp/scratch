"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, ExternalLink } from "lucide-react";

const TERMS = [
    {
        term: "Assemblage (Agencement)",
        definition: "A heterogeneous composition of material and expressive components that maintains its identity while remaining open to change. Not a static structure but a process of becoming, characterized by relations of exteriority where components retain autonomy.",
        scholar: "Deleuze & Guattari (1987); DeLanda (2006, 2016)",
        category: "Assemblage Theory",
        url: "https://www.euppublishing.com/doi/abs/10.3366/para.2008.0054"
    },
    {
        term: "Territorialization",
        definition: "Processes that stabilize an assemblage by increasing internal homogeneity, sharpening boundaries, and coding components. Examples: standardization, regulation, identity formation.",
        scholar: "DeLanda (2006)",
        category: "Assemblage Theory"
    },
    {
        term: "Deterritorialization",
        definition: "Processes that destabilize an assemblage by increasing heterogeneity, blurring boundaries, and decoding components. Includes lines of flight, mutation, and resistance to capture.",
        scholar: "DeLanda (2006)",
        category: "Assemblage Theory"
    },
    {
        term: "Coding",
        definition: "The degree to which an assemblage's components are rigidly defined versus flexibly interpreted. High coding = strict categorization; low coding = interpretive openness.",
        scholar: "DeLanda (2006)",
        category: "Assemblage Theory"
    },
    {
        term: "Relations of Exteriority",
        definition: "A key principle of assemblage theory: components of an assemblage maintain their autonomy and can be detached and plugged into different assemblages. Contrasts with relations of interiority (essence).",
        scholar: "DeLanda (2006)",
        category: "Assemblage Theory"
    },
    {
        term: "Actor-Network",
        definition: "A heterogeneous network of aligned interests, including both human and non-human actors. Networks are not given but must be constantly performed and maintained through translation work.",
        scholar: "Latour (2005); Callon (1986)",
        category: "ANT",
        url: "https://www.bruno-latour.fr/node/70.html"
    },
    {
        term: "Translation",
        definition: "The process by which actors modify, displace, and appropriate each other's goals to create alignment. Includes problematization, interessement, enrollment, and mobilization.",
        scholar: "Callon (1986); Latour (1987)",
        category: "ANT"
    },
    {
        term: "Obligatory Passage Point",
        definition: "A situation that must be traversed by all actors in a network. Whoever controls the passage point gains power to define the network's trajectory.",
        scholar: "Callon (1986)",
        category: "ANT"
    },
    {
        term: "Black Box",
        definition: "A stabilized network that functions as a single actor, hiding its internal complexity. Opening black boxes reveals the heterogeneous work that sustains them.",
        scholar: "Latour (1987, 1999)",
        category: "ANT"
    },
    {
        term: "Provisional Inscription",
        definition: "AI-generated interpretations marked as tentative and subject to researcher ratification. Embodies hermeneutic design principle that AI outputs are one reading among many, not authoritative truth.",
        scholar: "Introna (2019); Hermeneutic Design Science",
        category: "Methodology"
    },
    {
        term: "Hermeneutic Circle",
        definition: "The iterative process of interpretation where understanding of parts depends on understanding of the whole, and vice versa. Applied to algorithmic analysis: micro-traces inform macro-patterns, which reframe micro-interpretations.",
        scholar: "Gadamer (1960); Introna (2019)",
        category: "Methodology",
        url: "https://doi.org/10.1007/s10796-019-09927-4"
    },
    {
        term: "Coloniality of Power",
        definition: "The continuity of colonial forms of domination after formal colonialism ended. Manifests in knowledge hierarchies, economic extraction, and racialized social classification.",
        scholar: "Quijano (2000)",
        category: "Decolonial Theory",
        url: "https://www.jstor.org/stable/2696316"
    },
    {
        term: "Data Colonialism",
        definition: "The appropriation of human life through data extraction, processing, and commodification. Extends colonial logics of resource extraction to the digital realm.",
        scholar: "Couldry & Mejias (2019)",
        category: "Decolonial Theory",
        url: "https://doi.org/10.1177/1527476419862146"
    },
    {
        term: "Epistemic Justice",
        definition: "Recognition of marginalized groups as knowers and the inclusion of diverse knowledge systems. Challenges the universalization of Global North epistemologies.",
        scholar: "Fricker (2007); Santos (2014)",
        category: "Decolonial Theory"
    },
    {
        term: "Counter-Conduct",
        definition: "Foucauldian concept for struggles against techniques of power that seek to conduct conduct. Includes refusal, reappropriation, and alternative ways of being governed.",
        scholar: "Foucault (2007)",
        category: "Resistance",
        url: "https://www.jstor.org/stable/j.ctt7s8xg"
    },
    {
        term: "Gambiarra",
        definition: "Brazilian Portuguese term for creative workarounds and improvised solutions. Represents situated knowledge and tactical resistance to imposed systems.",
        scholar: "Lemos (2007); Brazilian Context",
        category: "Resistance"
    },
    {
        term: "Lines of Flight",
        definition: "Trajectories of escape from stratified assemblages. Not mere resistance but creative deterritorialization that opens new possibilities.",
        scholar: "Deleuze & Guattari (1987)",
        category: "Resistance"
    },
    {
        term: "Institutional Logics",
        definition: "Socially constructed patterns of practices, assumptions, values, and rules that organize social reality. Multiple logics (Market, State, Professional, Community) coexist and conflict.",
        scholar: "Thornton, Ocasio, & Lounsbury (2012)",
        category: "Institutional Theory",
        url: "https://doi.org/10.1093/acprof:oso/9780199601936.001.0001"
    },
    {
        term: "Orders of Worth",
        definition: "Distinct moral frameworks for justifying actions and claims (Market, Industrial, Civic, Domestic, Inspired, Fame, Green, Projective). Actors draw on multiple orders to build legitimacy.",
        scholar: "Boltanski & Thévenot (2006)",
        category: "Legitimacy",
        url: "https://press.princeton.edu/books/paperback/9780691115788/on-justification"
    },
    {
        term: "Situated Knowledge",
        definition: "All knowledge is produced from specific embodied positions. Challenges the 'view from nowhere' by insisting on accountability for one's location in knowledge production.",
        scholar: "Haraway (1988)",
        category: "Methodology",
        url: "https://www.jstor.org/stable/3178066"
    },
    {
        term: "Policy Mobilities",
        definition: "The movement, mutation, and translation of policies across jurisdictions. Policies are not transferred intact but transformed through local assemblages.",
        scholar: "Peck & Theodore (2010)",
        category: "Policy Studies",
        url: "https://doi.org/10.1068/a4272"
    }
];

export default function GlossaryPage() {
    const categories = Array.from(new Set(TERMS.map(t => t.category)));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Critical Glossary
                </h2>
                <p className="text-slate-500 mt-2">
                    Key theoretical concepts grounding the analysis of algorithmic assemblages through Assemblage Theory, ANT, hermeneutic design science, and decolonial computing.
                </p>
            </div>

            {categories.map((category) => (
                <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">
                        {category}
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {TERMS.filter(t => t.category === category).map((item, index) => (
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

                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div >
    );
}
