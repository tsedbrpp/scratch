import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  BookOpen,
  Scale,
  Users,
  Scan,
  Network,
  Lightbulb,
  Brain,
  Sparkles,
  ArrowRight
} from "lucide-react";

const features = [
  // Data Collection
  {
    name: "Documents",
    href: "/data",
    icon: Database,
    description: "Archive of primary policy texts (PDFs) and source materials",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    name: "Empirical Data",
    href: "/empirical",
    icon: Users,
    description: "Collect and organize empirical traces from web sources",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconColor: "text-indigo-600",
  },
  // Micro Analysis
  {
    name: "Resistance",
    href: "/resistance",
    icon: Users,
    description: "Analyze micro-resistance strategies and counter-conduct",
    color: "bg-red-50 text-red-700 border-red-200",
    iconColor: "text-red-600",
  },
  {
    name: "Critical Reflection",
    href: "/reflexivity",
    icon: Scan,
    description: "Examine how your own perspective and context shape the analysis",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    iconColor: "text-orange-600",
  },
  // Meso Analysis
  {
    name: "Ecosystem Analysis",
    href: "/ecosystem",
    icon: Users,
    description: "Map actors, detect cultural holes, and visualize social networks",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  {
    name: "Cross-Case Analysis",
    href: "/synthesis",
    icon: Network,
    description: "Cross-case analysis and AI-powered framework comparison",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    iconColor: "text-teal-600",
  },
  // Macro Analysis
  {
    name: "Comparison",
    href: "/comparison",
    icon: Scale,
    description: "Side-by-side comparison of governance frameworks",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    iconColor: "text-cyan-600",
  },
  {
    name: "Governance",
    href: "/governance",
    icon: Scale,
    description: "Analyze resource orchestration and institutional logics",
    color: "bg-green-50 text-green-700 border-green-200",
    iconColor: "text-green-600",
  },
  {
    name: "Cultural Framing",
    href: "/cultural",
    icon: Lightbulb,
    description: "Examine cultural framing and epistemic authority",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconColor: "text-amber-600",
  },
  {
    name: "Concept Network",
    href: "/ontology",
    icon: BookOpen,
    description: "Visual map of key concepts and their relationships",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    iconColor: "text-purple-600",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Research Dashboard
        </h2>
        <p className="text-slate-500 mt-1">
          Research Dashboard
        </p>
      </div>

      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-white">AI-Powered Research Assistant</CardTitle>
          </div>
          <CardDescription className="text-slate-300">
            Comparative algorithmic assemblage analysis using the Decolonial Situatedness Framework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">AI Analysis</span>
              </div>
              <p className="text-xs text-slate-300">
                GPT-4 powered analysis through 4 decolonial lenses
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-semibold text-white">Ecosystem Mapping</span>
              </div>
              <p className="text-xs text-slate-300">
                Visualize material and discursive interconnections
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Cultural Holes</span>
              </div>
              <p className="text-xs text-slate-300">
                Identify discourse gaps and innovation opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Research Tools</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.name} href={feature.href}>
                <Card className={`${feature.color} border-2 hover:shadow-lg transition-all cursor-pointer group`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                        </div>
                        <CardTitle className="text-base">{feature.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Open tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to begin your research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-slate-900">Upload Policy Documents</p>
                <p className="text-sm text-slate-600">
                  Go to <Link href="/data" className="text-blue-600 hover:underline">Documents</Link> and upload PDF documents for analysis
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-slate-900">Analyze with AI</p>
                <p className="text-sm text-slate-600">
                  Use the "Analyze with AI" button to extract insights through decolonial lenses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-slate-900">Compare and Synthesize</p>
                <p className="text-sm text-slate-600">
                  Use <Link href="/synthesis" className="text-teal-600 hover:underline">Cross-Case Analysis</Link> to compare frameworks and map ecosystem impacts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                4
              </div>
              <div>
                <p className="font-medium text-slate-900">Detect Cultural Holes</p>
                <p className="text-sm text-slate-600">
                  Use <Link href="/cultural" className="text-amber-600 hover:underline">Cultural Framing</Link> to identify discourse gaps and innovation opportunities
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
