
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Activity, Sparkles, Users, Eye, Zap, RefreshCw, Shield } from "lucide-react";
import { HeroGraph } from "@/components/landing/HeroGraph";
import { PrismIcon } from "@/components/icons/PrismIcon";

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
                        <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-400" /> Clarity through Analysis.</span>
                        <span className="hidden sm:inline w-px h-4 bg-emerald-400/20"></span>
                        <a href="mailto:demo@policyprism.io?subject=Schedule%2030-min%20Demo" className="font-semibold text-emerald-300 hover:text-emerald-200">
                            Book a 30-min Demo <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
                {/* Branding Icon and Text */}
                <div className="flex justify-center items-center gap-4 md:gap-6 mb-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/20 animate-in fade-in zoom-in duration-1000">
                        <PrismIcon className="text-white w-10 h-10 md:w-12 md:h-12" />
                    </div>
                    <div className="text-5xl md:text-7xl font-black tracking-tight text-white animate-in fade-in zoom-in duration-1000">
                        Policy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Prism</span>
                    </div>
                </div>

                <div className="mt-6 space-y-8">
                    <div className="text-lg leading-8 text-slate-200 text-left max-w-3xl mx-auto space-y-6">
                        <h1 className="text-3xl font-bold text-white mb-4 text-center">Mapping the Invisible Forces of Policy and Governance</h1>
                        <p>
                            Policy Prism is an open-source structural mapping platform designed for researchers, analysts, and policy experts.
                        </p>
                        <p>
                            Instantly map the complex relationships between actors, discourses, and institutional logics that shape policy outcomes. Our platform refracts vast archives into actionable network intelligence.
                        </p>
                        <p>
                            By fusing Large Language Models with structural frameworks like Actor-Network Theory, Policy Prism accelerates discovery from weeks to seconds—giving your team unparalleled clarity in rapidly shifting environments.
                        </p>

                        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 shadow-xl my-8">
                            <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Teams Chose Policy Prism</h3>
                            <ul className="space-y-4 text-left">
                                <li className="flex gap-4 items-start group">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-400/10 flex items-center justify-center shrink-0 border border-slate-400/20 group-hover:scale-110 group-hover:bg-slate-400/20 transition-all">
                                        <Shield className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <div>
                                        <span className="text-white font-bold block mb-1">Uncompromising Privacy</span>
                                        <span className="text-slate-300">GDPR-ready with zero data training. Your sensitive policy documents remain strictly confidential.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start group">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0 border border-emerald-400/20 group-hover:scale-110 group-hover:bg-emerald-400/20 transition-all">
                                        <Users className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <span className="text-emerald-300 font-bold block mb-1">Work together live</span>
                                        <span className="text-slate-300">Everyone can edit the same map, add notes, and talk about it at the same time.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start group">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center shrink-0 border border-blue-400/20 group-hover:scale-110 group-hover:bg-blue-400/20 transition-all">
                                        <Eye className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-blue-300 font-bold block mb-1">Nothing hidden</span>
                                        <span className="text-slate-300">You see exactly how the map is made, so you can trust it.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start group">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0 border border-amber-400/20 group-hover:scale-110 group-hover:bg-amber-400/20 transition-all">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <span className="text-amber-300 font-bold block mb-1">Super fast</span>
                                        <span className="text-slate-300">Get useful insights in seconds, not weeks, and spend more time planning.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start group">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-violet-400/10 flex items-center justify-center shrink-0 border border-violet-400/20 group-hover:scale-110 group-hover:bg-violet-400/20 transition-all">
                                        <RefreshCw className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div>
                                        <span className="text-violet-300 font-bold block mb-1">Built for change</span>
                                        <span className="text-slate-300">Things shift quickly in policy. Policy Prism gives temporary views that spark team discussions.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <p className="font-medium text-emerald-100 text-center text-xl max-w-2xl mx-auto">
                            Perfect for mapping rules, stakeholders, or new tech setups. Policy Prism helps teams make smarter decisions together.
                        </p>
                        <p className="text-center font-bold text-white text-lg mt-4">
                            Start using Policy Prism today and make complex policy work simpler for your team!
                        </p>
                    </div>
                </div>
                <div className="mt-10 flex flex-col items-center justify-center gap-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10 w-full px-4">
                        <Link href="/?demoMode=true" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 h-14 rounded-full shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]">
                                Try the interactive demo
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/sign-up" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-white font-semibold px-8 h-14 rounded-full backdrop-blur-sm transition-all hover:border-slate-600">
                                Upload a policy document
                                <Upload className="ml-2 w-5 h-5 opacity-70" />
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <Link href="/LICENSE.txt" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                            <Image
                                src="https://img.shields.io/badge/License-MIT-yellow.svg"
                                alt="MIT License"
                                width={88}
                                height={24}
                                unoptimized
                                className="h-6 w-auto"
                            />
                        </Link>
                    </div>
                </div>
                <div className="mt-8 flex flex-col items-center justify-center gap-6">
                    <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-300">
                        Log in to your account <span aria-hidden="true">→</span>
                    </Link>
                    <Link href="/sign-up" className="relative group">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg transform group-hover:scale-110 transition-transform whitespace-nowrap">
                            🎁 GET 50 FREE CREDITS FOR SIGNING UP
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
                            <video
                                controls
                                className="w-full h-full object-cover opacity-90"
                            >
                                <source src="/Sequence%2001.mp4#t=0.001" type="video/mp4" />
                            </video>

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
