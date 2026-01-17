"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { HeroGraph } from "@/components/landing/HeroGraph";

export function HeroSection() {
    return (
        <div className="relative isolate px-6 pt-14 lg:px-8 bg-slate-900 text-white overflow-hidden">
            {/* Living 3D Network Background */}
            <HeroGraph />

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900 pointer-events-none" />

            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
            </div>

            {/* Abstract Data Grid Background (Retained for texture) */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                    <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-emerald-400 ring-1 ring-emerald-400/20 bg-emerald-400/10 hover:ring-emerald-400/30 transition-all">
                        Quick insight. Slow truth.
                    </div>
                </div>
                {/* Replaced Text Title with Branding Image */}
                <div className="flex justify-center mb-6">
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-500 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        instantTEA
                    </h1>
                </div>

                <div className="mt-6 space-y-8">
                    <div className="text-lg leading-8 text-slate-200 text-left max-w-3xl mx-auto space-y-4">
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">What is instantTEA?</h3>
                        <p>
                            <strong>instantTEA</strong> is a methodological tool and analytical framework for rapidly translating complex socio-technical assemblages into provisional, situated snapshots. Drawing from Actor-Network Theory (ANT) and assemblage theory, it generates quick insights into relational networks—tracing actors, connections, and emergences—while explicitly acknowledging the temporality and incompleteness of these translations.
                        </p>
                        <p>
                            Unlike traditional &quot;instant&quot; tools that imply finality, instantTEA embraces ephemerality: outputs are fast to produce but inherently provisional, inviting deeper, slower interpretation. It resists black-boxing, compliance theater, and reification, making it ideal for analyzing dynamic systems like global AI governance.
                        </p>
                    </div>

                    <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 italic text-xl text-slate-300 bg-slate-800/50 rounded-r-lg max-w-2xl mx-auto my-8">
                        &quot;instantTEA provides fast translations of complex assemblages—while making explicit that these translations are provisional, situated, and incomplete.&quot;
                    </blockquote>
                </div>
                <div className="mt-10 flex flex-col items-center justify-center gap-6">
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/data">
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 px-8 transition-all hover:scale-105 group shadow-lg shadow-emerald-900/20">
                                <Activity className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                                Explore Demo Mode
                            </Button>
                        </Link>

                        <Link href="https://github.com/tsedbrpp/scratch" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-sm transition-all hover:scale-105">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                Star on GitHub
                            </Button>
                        </Link>
                    </div>
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
    );
}
