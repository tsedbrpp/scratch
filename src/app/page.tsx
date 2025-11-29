"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Source } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSources } from "@/hooks/useSources";
import {
  Database,
  BookOpen,
  Scale,
  Users,
  Scan,
  Network,
  Lightbulb,
  ArrowRight,
  FileText,
  Search,
  Zap,
  Activity,
  Upload,
  Layers,
  Cpu,
  GitGraph
} from "lucide-react";

// --- DASHBOARD DATA ---
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
  {
    name: "Temporal Dynamics",
    href: "/timeline",
    icon: Activity,
    description: "Track the evolution of governance concepts over time",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    iconColor: "text-pink-600",
  },
];

// --- COMPONENTS ---

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8 bg-slate-900 text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage: "url('/landing-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900 lg:from-slate-900/80 lg:via-slate-900/50" />

        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-300 ring-1 ring-white/10 hover:ring-white/20">
              Advanced Research Tool for Complex Systems
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Assemblage AI
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-200">
            Critical Analysis for Complex Narratives
          </p>
          <p className="mt-4 text-sm text-slate-300 max-w-lg mx-auto">
            Map connections, detect patterns, and uncover hidden structures in any archive. From policy documents to empirical traces, reveal the unseen assemblage.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
              Log in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-24 sm:py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Methodology</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From Archive to Insight
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              A systematic approach to analyzing complex textual datasets through multiple theoretical lenses.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                    <Database className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Data Ingestion
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    Upload PDFs, scrape web traces, and organize your primary sources. The system automatically extracts text and prepares it for analysis.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <Cpu className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  AI-Powered Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    Apply specific theoretical lenses (Resistance, Cultural Framing, Institutional Logics) using advanced LLMs to extract structured insights.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-600">
                    <GitGraph className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Network Synthesis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    Visualize relationships between actors, concepts, and documents. Detect cultural holes and generate comparative reports.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// ...

function Dashboard({ sources }: { sources: Source[] }) {
  const docCount = sources.filter(s => s.type !== 'Trace').length;
  const traceCount = sources.filter(s => s.type === 'Trace').length;
  const analyzedCount = sources.filter(s => s.analysis || s.cultural_framing || s.institutional_logics).length;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Assemblage Dashboard
        </h2>
        <p className="text-slate-500 mt-1">
          Welcome back. Continue your critical analysis of complex narratives.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Documents
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{docCount}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Primary policy texts
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">
              Empirical Traces
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Search className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">{traceCount}</div>
            <p className="text-xs text-indigo-600 mt-1 font-medium">
              Collected from web sources
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">
              Analyzed Sources
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{analyzedCount}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Processed with AI lenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/data">
            <div className="group relative flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-semibold text-slate-900 group-hover:text-blue-700">Upload Document</span>
              <span className="text-xs text-slate-500 mt-1">Add new PDF policy text</span>
            </div>
          </Link>
          <Link href="/empirical">
            <div className="group relative flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                <Search className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-900 group-hover:text-indigo-700">Find Traces</span>
              <span className="text-xs text-slate-500 mt-1">Search web for evidence</span>
            </div>
          </Link>
          <Link href="/comparison">
            <div className="group relative flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                <Scale className="h-6 w-6 text-cyan-600" />
              </div>
              <span className="font-semibold text-slate-900 group-hover:text-cyan-700">Compare Frameworks</span>
              <span className="text-xs text-slate-500 mt-1">Side-by-side analysis</span>
            </div>
          </Link>
          <Link href="/synthesis">
            <div className="group relative flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <span className="font-semibold text-slate-900 group-hover:text-teal-700">Generate Report</span>
              <span className="text-xs text-slate-500 mt-1">Create synthesis PDF</span>
            </div>
          </Link>
        </div>
      </div>

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
    </div>
  );
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const { sources } = useSources();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return <Dashboard sources={sources} />;
}
