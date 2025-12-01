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
  GitGraph,
  Shield,
  Lock,
  GraduationCap,
  Building,
  Play,
  Library
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

        {/* Abstract Data Grid Background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

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
            Analysis of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-bold">Algorithmic Assemblages</span>
          </p>
          <p className="mt-4 text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed text-left">
            Assemblage-AI is a platform dedicated to analyzing and managing AI governance, policy frameworks, and structural dynamics. It offers tools for data collection, ecosystem mapping, and critical reflection to explore the complexities of AI systems. Key insights include the challenges of centralized governance, limited inclusivity, and the tension between civic values and market-driven innovation. With resources like critical glossaries and literature reviews, Assemblage-AI aims to foster responsible and equitable AI practices while addressing global regulatory and ethical challenges.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-8 transition-all hover:scale-105 group">
                <Play className="mr-2 h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
                Try Sample Analysis
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
              Log in to your account <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* CSS-Based Dashboard Preview */}
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="relative rounded-xl bg-slate-900/80 shadow-2xl ring-1 ring-white/10 backdrop-blur-md overflow-hidden">
                {/* Mock UI Header */}
                <div className="border-b border-white/10 bg-white/5 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="ml-4 h-2 w-32 bg-white/10 rounded-full"></div>
                </div>
                {/* Mock UI Body */}
                <div className="p-6 grid grid-cols-3 gap-6">
                  {/* Sidebar Mock */}
                  <div className="col-span-1 space-y-3">
                    <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <div className="text-[11px] font-medium text-blue-100 leading-tight">Centralized Governance</div>
                    </div>
                    <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      <div className="text-[11px] font-medium text-purple-100 leading-tight">Limited Inclusivity</div>
                    </div>
                    <div className="px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                      <div className="text-[11px] font-medium text-teal-100 leading-tight">Civic vs Market Values</div>
                    </div>
                    <div className="mt-8 h-32 w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-white/5 p-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:200%_0,0_0] duration-1000"></div>
                      <div className="text-[8px] text-slate-500 font-mono mb-1">STATUS</div>
                      <div className="text-xs text-emerald-400 font-mono">System Active</div>
                    </div>
                  </div>
                  {/* Main Content Mock */}
                  <div className="col-span-2 space-y-4">
                    <div className="bg-white/5 rounded-xl border border-white/5 p-4 text-left">
                      <h4 className="text-sm font-semibold text-slate-200 mb-3">Key Insights from Assemblage-AI</h4>
                      <ul className="space-y-3">
                        <li className="text-xs leading-relaxed text-slate-400">
                          <strong className="text-blue-400 block mb-0.5">Challenges of Centralized Governance</strong>
                          Highlighting the difficulties in managing AI systems under centralized frameworks.
                        </li>
                        <li className="text-xs leading-relaxed text-slate-400">
                          <strong className="text-purple-400 block mb-0.5">Limited Inclusivity</strong>
                          Addressing the lack of diverse representation in AI governance and policy-making.
                        </li>
                        <li className="text-xs leading-relaxed text-slate-400">
                          <strong className="text-teal-400 block mb-0.5">Civic Values vs Market Innovation</strong>
                          Exploring the conflict between societal values and profit-oriented AI development.
                        </li>
                      </ul>
                    </div>
                    <div className="h-64 w-full bg-slate-950 rounded-xl border border-white/10 relative overflow-hidden">
                      {/* Abstract Chart Lines */}
                      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                        <path d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100" fill="none" stroke="url(#gradient1)" strokeWidth="2" />
                        <path d="M0,150 C200,50 400,250 600,150 C800,50 1000,200 1200,150" fill="none" stroke="url(#gradient2)" strokeWidth="2" />
                        <defs>
                          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Floating Nodes */}
                      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)] animate-pulse"></div>
                      <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,0.5)] animate-pulse delay-75"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)] animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Coverage Section */}
      <div className="bg-white py-10 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm font-semibold leading-8 text-slate-500 uppercase tracking-widest">
            Comparative Analysis of Major AI Regimes
          </p>
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:gap-x-10 sm:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            <div className="col-span-1 flex flex-col items-center justify-center gap-2 group cursor-default">
              <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">🇪🇺</span>
              <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">EU AI Act</span>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center gap-2 group cursor-default">
              <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">🇺🇸</span>
              <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">US Executive Order</span>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center gap-2 group cursor-default">
              <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">🇨🇳</span>
              <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">China Interim Measures</span>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center gap-2 group cursor-default">
              <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">🇧🇷</span>
              <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">Brazil PL 2338</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white py-12 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm font-semibold leading-8 text-slate-500 uppercase tracking-widest">
            Powered by industry-leading technology
          </p>
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Google Logo */}
            <div className="col-span-1 flex justify-center">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-xl font-bold text-slate-600">Google</span>
              </div>
            </div>

            {/* OpenAI Logo */}
            <div className="col-span-1 flex justify-center">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <svg className="h-8 w-8 text-black" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.0462 6.0462 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.09-1.1088l2.9251-1.6923 2.9251 1.6923v3.3846l-2.9251 1.6923-2.9251-1.6923z" />
                </svg>
                <span className="text-xl font-bold text-slate-600">OpenAI</span>
              </div>
            </div>

            {/* Redis Logo */}
            <div className="col-span-1 flex justify-center">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.4 3.6H3.6C1.6 3.6 0 5.2 0 7.2v9.6c0 2 1.6 3.6 3.6 3.6h16.8c2 0 3.6-1.6 3.6-3.6V7.2c0-2-1.6-3.6-3.6-3.6zm-12 12H4.8v-2.4h3.6v2.4zm0-4.8H4.8V8.4h3.6v2.4zm4.8 4.8H9.6v-2.4h3.6v2.4zm0-4.8H9.6V8.4h3.6v2.4zm4.8 4.8h-3.6v-2.4h3.6v2.4zm0-4.8h-3.6V8.4h3.6v2.4zm4.8 4.8h-3.6v-2.4h3.6v2.4zm0-4.8h-3.6V8.4h3.6v2.4z" />
                </svg>
                <span className="text-xl font-bold text-slate-600">Redis</span>
              </div>
            </div>
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

      {/* Audience Section */}
      <div className="py-24 sm:py-32 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Community</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Who uses Assemblage-AI?
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-start p-6 bg-slate-50 rounded-2xl">
              <div className="p-3 bg-blue-100 rounded-xl mb-4">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Academic Researchers</h3>
              <p className="text-slate-600 leading-relaxed">
                Scholars in STS, Information Systems, and Law studying AI policy, algorithmic governance, and sociotechnical imaginaries.
              </p>
            </div>
            <div className="flex flex-col items-start p-6 bg-slate-50 rounded-2xl">
              <div className="p-3 bg-indigo-100 rounded-xl mb-4">
                <Building className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Policy Teams</h3>
              <p className="text-slate-600 leading-relaxed">
                Regulators and analysts comparing global AI frameworks, tracking compliance logic, and identifying regulatory gaps.
              </p>
            </div>
            <div className="flex flex-col items-start p-6 bg-slate-50 rounded-2xl">
              <div className="p-3 bg-teal-100 rounded-xl mb-4">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Advocates & NGOs</h3>
              <p className="text-slate-600 leading-relaxed">
                Civil society organizations examining power dynamics, data justice, and the social impact of algorithmic systems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Ethics Section */}
      <div className="py-24 sm:py-32 bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Trust, Ethics & Privacy</h2>
              <p className="mt-6 text-lg leading-8">
                Built for critical research with a commitment to data sovereignty and transparency.
              </p>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <img
                src="/trust-ethics.png"
                alt="Digital Trust and Privacy"
                className="relative rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-auto hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <Lock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                Data Handling & Privacy
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                <p className="flex-auto">
                  Uploaded documents are stored securely and are <strong>never used to train public AI models</strong>. You retain full ownership of your data. Files can be permanently deleted from our servers at any time.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
                Research Context
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                <p className="flex-auto">
                  Developed as part of academic research on using AI for critical analysis. This open-source tool is designed to reveal power structures, not reinforce them.
                </p>
              </dd>
            </div>
          </div>

          {/* Privacy Badges */}
          <div className="mt-16 pt-10 border-t border-white/10 flex flex-wrap justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">GDPR Ready</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Lock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Database className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">No Model Training</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <GitGraph className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-slate-300">Open Source</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg"></div>
              <span className="text-xl font-bold text-white">Assemblage-AI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              An open-source platform for critical AI governance research, bridging the gap between policy intent and algorithmic reality.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/data" className="hover:text-blue-400 transition-colors">Data Collection</Link></li>
              <li><Link href="/ecosystem" className="hover:text-blue-400 transition-colors">Ecosystem Map</Link></li>
              <li><Link href="/synthesis" className="hover:text-blue-400 transition-colors">Analysis Tools</Link></li>
              <li><Link href="/demo" className="hover:text-blue-400 transition-colors">Live Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">GitHub Repository</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-xs text-center">
          &copy; {new Date().getFullYear()} Assemblage-AI Research Group. Open Source (MIT License).
        </div>
      </footer>
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
                <Card className={`${feature.color} border-2 hover:shadow-lg transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both`}>
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
