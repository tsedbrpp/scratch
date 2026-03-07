import React from "react";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function TheoreticalGrounding() {
    return (
        <div id="theory" className="bg-slate-950 py-24 sm:py-32 border-b border-slate-900 relative mt-16 sm:mt-24">
            {/* Slanted Section Divider */}
            <svg className="absolute top-0 left-0 w-full h-12 sm:h-24 -mt-12 sm:-mt-24 text-slate-950" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                <polygon points="0,100 100,0 100,100" />
            </svg>

            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-20">
                    <h2 className="text-base font-semibold leading-7 text-emerald-400">Theoretical Grounding</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Why &quot;Policy Prism&quot;?
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Left: Prism Visualization */}
                    <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 aspect-square max-w-md mx-auto lg:max-w-none lg:mx-0 w-full">
                        <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-emerald-500/10 transition-colors duration-700 pointer-events-none mix-blend-overlay z-10" />
                        <Image
                            src="/abstract_prism_v2.png"
                            alt="A glowing abstract 3D prism refracting blue and emerald light"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    </div>

                    {/* Right: Accordion Content */}
                    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border-b border-white/10">
                                <AccordionTrigger className="text-xl font-bold text-white hover:text-emerald-400 hover:no-underline px-2 py-4 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">
                                    <span className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                                        Refraction
                                        <span className="text-xs font-normal text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit">Analytical Decomposition</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-slate-300 leading-relaxed px-2 pb-6">
                                    Much like a physical prism scatters white light, our platform refracts seemingly monolithic policy issues into their constituent elements. It breaks down complex systemic challenges to reveal the hidden actors, discourses, and institutional logics that actively shape governance.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="border-b border-white/10">
                                <AccordionTrigger className="text-xl font-bold text-white hover:text-blue-400 hover:no-underline px-2 py-4 rounded transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                                    <span className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                                        Spectrum
                                        <span className="text-xs font-normal text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 w-fit">Multi-Lens Perspective</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-slate-300 leading-relaxed px-2 pb-6">
                                    Policies operate across a vast spectrum of meaning. By structurally mapping controversies and employing frameworks like Actor-Network Theory, it exposes the full range of alignments—from entrenched institutional consensus to marginal micro-resistance.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="border-none">
                                <AccordionTrigger className="text-xl font-bold text-white hover:text-purple-400 hover:no-underline px-2 py-4 rounded transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none">
                                    <span className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                                        Illumination
                                        <span className="text-xs font-normal text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 w-fit">Synthesis & Clarity</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-slate-300 leading-relaxed px-2 pb-6">
                                    The ultimate goal of structural analysis is clarity. By visualizing these ephemeral assemblages as concrete network interactions, Policy Prism pulls translating mechanisms out of the dark, rendering the invisible forces of public policy visible for experts and researchers.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    );
}
