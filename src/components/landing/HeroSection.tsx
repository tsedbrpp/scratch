

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
                    <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-emerald-400 ring-1 ring-emerald-400/20 bg-emerald-400/10 hover:ring-emerald-400/30 transition-all flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <span className="flex items-center gap-1"><span className="text-lg">🍵</span> Instant Insight. Steeped in Theory.</span>
                        <span className="hidden sm:inline w-px h-4 bg-emerald-400/20"></span>
                        <a href="mailto:demo@instanttea.com?subject=Schedule%2030-min%20Demo" className="font-semibold text-emerald-300 hover:text-emerald-200">
                            Book a 30-min Demo <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
                {/* Replaced Text Title with Branding Image */}
                <div className="flex justify-center mb-6">
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-500 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        instantTEA
                    </h1>
                </div>

                <div className="mt-6 space-y-8">
                    <div className="text-lg leading-8 text-slate-200 text-left max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl font-bold text-white mb-4 text-center">Easy Team Tool for Mapping Policy and Governance</h2>
                        <p>
                            InstantTea is a simple tool made for teams like policy experts and researchers who need to understand complicated systems fast.
                        </p>
                        <p>
                            Instead of taking weeks to figure out connections between people, organizations, rules, and tech, your team can create clear maps in seconds with InstantTea.
                        </p>
                        <p>
                            It uses smart ideas (Actor-Network Theory and Assemblage Theory) behind the scenes—you don’t need to know them. You just get honest, up-to-date views of changing situations.
                        </p>

                        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 shadow-xl my-8">
                            <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Teams Love InstantTea</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <span className="text-emerald-400 mt-1">✨</span>
                                    <div>
                                        <span className="text-emerald-300 font-bold block mb-1">Work together live</span>
                                        <span className="text-slate-300">Everyone can edit the same map, add notes, and talk about it at the same time.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-emerald-400 mt-1">👁️</span>
                                    <div>
                                        <span className="text-emerald-300 font-bold block mb-1">Nothing hidden</span>
                                        <span className="text-slate-300">You see exactly how the map is made, so you can trust it.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-emerald-400 mt-1">⚡</span>
                                    <div>
                                        <span className="text-emerald-300 font-bold block mb-1">Super fast</span>
                                        <span className="text-slate-300">Get useful insights in seconds, not weeks, and spend more time planning.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-emerald-400 mt-1">🔄</span>
                                    <div>
                                        <span className="text-emerald-300 font-bold block mb-1">Built for change</span>
                                        <span className="text-slate-300">Things shift quickly in policy. InstantTea gives temporary views that spark team discussions.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <p className="font-medium text-emerald-100 text-center text-xl max-w-2xl mx-auto">
                            Perfect for mapping rules, stakeholders, or new tech setups. InstantTea helps teams make smarter decisions together.
                        </p>
                        <p className="text-center font-bold text-white text-lg mt-4">
                            Start using InstantTea today and make complex policy work simpler for your team!
                        </p>
                    </div>
                </div>
                <div className="mt-10 flex flex-col items-center justify-center gap-6">
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/data" className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                            <Button size="lg" className="relative bg-black hover:bg-slate-900 text-emerald-400 border border-emerald-500/50 px-8 py-6 text-lg font-bold shadow-2xl transition-all hover:scale-[1.02] flex flex-col gap-0 items-center leading-tight">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 animate-pulse" />
                                    <span>Explore Sample Analysis</span>
                                </div>
                                <span className="text-[10px] font-normal text-emerald-600/80 uppercase tracking-widest">Interactive Demo</span>
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
                    <Link href="/sign-up" className="relative group">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg transform group-hover:scale-110 transition-transform whitespace-nowrap">
                            🎁 GET 5 FREE CREDITS
                        </div>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 mt-2">
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
