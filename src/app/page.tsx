"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Upload,
  Activity
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
  const { sources } = useSources();

  const docCount = sources.filter(s => s.type !== 'Trace').length;
  const traceCount = sources.filter(s => s.type === 'Trace').length;
  const analyzedCount = sources.filter(s => s.analysis || s.cultural_framing || s.institutional_logics).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Project Overview
        </h2>
        <p className="text-slate-500 mt-1">
          Tracking the material and discursive evolution of AI governance.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docCount}</div>
            <p className="text-xs text-slate-500">
              Primary policy texts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empirical Traces
            </CardTitle>
            <Search className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{traceCount}</div>
            <p className="text-xs text-slate-500">
              Collected from web sources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Analyzed Sources
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzedCount}</div>
            <p className="text-xs text-slate-500">
              Processed with AI lenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/data">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50">
            <Upload className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-slate-900">Upload Document</span>
            <span className="text-xs text-slate-500 font-normal">Add new PDF policy text</span>
          </Button>
        </Link>
        <Link href="/empirical">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50">
            <Search className="h-6 w-6 text-indigo-600" />
            <span className="font-semibold text-slate-900">Find Traces</span>
            <span className="text-xs text-slate-500 font-normal">Search web for evidence</span>
          </Button>
        </Link>
        <Link href="/comparison">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-cyan-500 hover:bg-cyan-50">
            <Scale className="h-6 w-6 text-cyan-600" />
            <span className="font-semibold text-slate-900">Compare Frameworks</span>
            <span className="text-xs text-slate-500 font-normal">Side-by-side analysis</span>
          </Button>
        </Link>
        <Link href="/synthesis">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-teal-500 hover:bg-teal-50">
            <Zap className="h-6 w-6 text-teal-600" />
            <span className="font-semibold text-slate-900">Generate Report</span>
            <span className="text-xs text-slate-500 font-normal">Create synthesis PDF</span>
          </Button>
        </Link>
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
