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
  Cpu,
  GitGraph,
  Shield,
  Lock,
  GraduationCap,
  Building,
  Play
} from "lucide-react";
import Image from "next/image";
import { GalaxyGraph } from "@/components/landing/GalaxyGraph";
import { useServerStorage } from "@/hooks/useServerStorage";
import { EcosystemActor } from "@/types/ecosystem";


// --- DASHBOARD DATA ---


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
          {/* Replaced Text Title with Branding Image */}
          <div className="flex justify-center mb-6">
            <Image
              src="/algorithmic-assemblages.png"
              alt="Algorithmic Assemblages: Fields, Ecosystems, and Platforms"
              width={600}
              height={600}
              className="w-full max-w-xl h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          <p className="mt-6 text-lg leading-8 text-slate-200">
            <Link href="/glossary" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 hover:scale-105 transition-all duration-300 group">
              <span className="text-slate-300 group-hover:text-white transition-colors">What is</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-bold">Assemblage AI</span>
              <span className="text-slate-400 group-hover:text-blue-400 transition-colors">?</span>
            </Link>
          </p>
          <p className="mt-4 text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed text-left">
            Assemblage-AI is a platform dedicated to analyzing and managing AI governance, policy frameworks, and structural dynamics. It offers tools for data collection, ecosystem mapping, and critical reflection to explore the complexities of AI systems. Key insights include the challenges of centralized governance, limited inclusivity, and the tension between civic values and market-driven innovation. With resources like critical glossaries and literature reviews, Assemblage-AI aims to foster responsible and equitable AI practices while addressing global regulatory and ethical challenges.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/demo">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 px-8 transition-all hover:scale-105 group shadow-lg shadow-emerald-900/20">
                <Activity className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Explore Analysis Output
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-6">
            <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
              Log in to your account <span aria-hidden="true">→</span>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8">
                Get Started
              </Button>
            </Link>
          </div>

          {/* CSS-Based Dashboard Preview */}
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="relative rounded-xl bg-slate-900/80 shadow-2xl ring-1 ring-white/10 backdrop-blur-md overflow-hidden group">
                {/* 
                  VIDEO EFFECT INSTRUCTION:
                  To use a real video instead of the mock UI, uncomment the following video tag and remove the "Mock UI Body" div below.
                  Ensure you have a file named 'demo.mp4' in your public folder.
                */}
                {
                  <video
                    controls
                    playsInline
                    className="w-full h-full object-cover opacity-90"
                  >
                    <source src="/Sequence 01.mp4#t=0.001" type="video/mp4" />
                  </video>
                }

                {/* Scanline/CRT Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] bg-repeat opacity-20"></div>
                <div className="absolute inset-0 pointer-events-none z-50 bg-gradient-to-b from-white/5 to-transparent opacity-10"></div>


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

            {/* Gemini Logo */}
            <div className="col-span-1 flex justify-center">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#gemini-gradient)" />
                  <defs>
                    <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4E85F7" />
                      <stop offset="100%" stopColor="#D6669D" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-xl font-bold text-slate-600">Gemini</span>
              </div>
            </div>

            {/* Next.js Logo */}
            <div className="col-span-1 flex justify-center">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 19.7778H22L12 2Z" fill="black" className="fill-slate-900" />
                </svg>
                <span className="text-xl font-bold text-slate-600">Next.js</span>
              </div>
            </div>

            {/* Grok Logo */}
            <div className="col-span-1 flex justify-center">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="4" className="fill-slate-900" />
                  <path d="M6 18L18 6M18 6H10M18 6V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xl font-bold text-slate-600">Grok</span>
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

            {/* Video Panel */}
            <div className="mt-12 w-full max-w-4xl mx-auto">
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <div className="p-1 bg-indigo-500/20 rounded">
                      <Play className="h-4 w-4 text-indigo-400" />
                    </div>
                    Introduction To Assemblage-AI
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    A video exploration of the need for Assemblage-AI.
                  </p>
                </div>
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
              </div>
            </div>
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
              <Image
                src="/trust-ethics.png"
                alt="Digital Trust and Privacy"
                width={800}
                height={600}
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

function Dashboard({ sources }: { sources: Source[] }) {
  const docCount = sources.filter(s => s.type !== 'Trace').length;
  const traceCount = sources.filter(s => s.type === 'Trace').length;
  const analyzedCount = sources.filter(s => s.analysis || s.cultural_framing || s.institutional_logics).length;

  // Retrieve ecosystem state to visualize resistance
  const [actors] = useServerStorage<EcosystemActor[]>("ecosystem_actors", []);
  const highResistanceCount = actors.filter(a => (a.metrics?.resistance || 0) > 5).length;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Assemblage Dashboard
        </h2>
        <p className="text-slate-500 mt-1">
          Assemblage Resumed. Continue critical entanglement with complex narratives.
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

      {/* Rhizomatic Explorer (Primary Navigation) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Rhizomatic Navigation</h3>
            <p className="text-sm text-slate-500">Explore the assemblage through entangled concepts.</p>
          </div>
          {highResistanceCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 animate-pulse">
              High Resistance Detected in Ecosystem
            </span>
          )}
        </div>
        <div className="mb-12">
          <GalaxyGraph highResistanceCount={highResistanceCount} />
        </div>
      </div>

      {/* Quick Actions (Secondary) */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Assemblage Operations</h3>
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
    // Bypass login if demo mode is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true") {
      return <Dashboard sources={sources} />;
    }
    return <LandingPage />;
  }

  return <Dashboard sources={sources} />;
}
