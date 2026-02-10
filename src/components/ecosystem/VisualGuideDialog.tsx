
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Hexagon, Diamond, Triangle, Square, Circle, Zap } from 'lucide-react';

export function VisualGuideDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 bg-white/80 backdrop-blur-sm shadow-sm border-slate-200 text-slate-600 hover:text-slate-900">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Visual Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ecosystem Visual Semiotics</DialogTitle>
                    <DialogDescription>
                        A guide to reading the shapes, colors, and flows of the assemblage.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-8 py-4">
                    {/* SECTION 1: MORPHOLOGY (Shapes) */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">1. Actor Morphology (Function)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
                                    <Hexagon className="h-6 w-6 text-slate-600 fill-slate-100" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900">Material / Infrastructure</h4>
                                    <p className="text-xs text-slate-600 mt-1">Stable, foundational elements like Cloud Platforms, Datasets, or Hardware. They provide the &quot;ground&quot; for the network.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
                                    <Diamond className="h-6 w-6 text-indigo-600 fill-indigo-50" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900">Expressive / High Risk</h4>
                                    <p className="text-xs text-slate-600 mt-1">Discursive actors (Policy narratives) or sites of <strong>Ethical Risk</strong>. The sharp shape signals disruption or friction.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
                                    <Triangle className="h-6 w-6 text-red-600 fill-red-50" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900">Algorithmic Agents</h4>
                                    <p className="text-xs text-slate-600 mt-1">Active code, models, or autonomous agents. The directional shape suggests active processing or agency.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
                                    <Square className="h-6 w-6 text-purple-600 fill-purple-50" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900">Market / Commercial</h4>
                                    <p className="text-xs text-slate-600 mt-1">Private Tech, Big Tech, or Startups. The square represents established economic structures or commercial ventures.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-200">
                                    <Circle className="h-6 w-6 text-emerald-600 fill-emerald-50" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-900">Social / Institutional</h4>
                                    <p className="text-xs text-slate-600 mt-1">Human actors, Policymakers, academics, or Civil Society organizations.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: CURRENTS (Flows) */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">2. Assemblage Currents (Links)</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="w-24 h-0 border-t-2 border-red-500 relative flex items-center justify-end">
                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-red-500 border-b-[4px] border-b-transparent translate-x-1"></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-red-700">Power Flows (Regulations, Capital, Extraction)</h4>
                                    <p className="text-xs text-slate-600">Solid, red directional lines. These represent hard power, legal constraints, or resource extraction.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="w-24 h-0 border-t-2 border-amber-500 border-dashed"></div>
                                <div>
                                    <h4 className="font-semibold text-sm text-amber-700">Logic Flows (Epistemic, Informational)</h4>
                                    <p className="text-xs text-slate-600">Dashed, amber lines. These represent soft power, knowledge transfer, or logical dependencies.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: DYNAMICS (Hot Spots) */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">3. Ethical Dynamics</h3>
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-red-50 border border-red-100">
                            <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                                <div className="relative bg-white rounded-full p-2 border border-red-200">
                                    <Zap className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-red-900 flex items-center gap-2">
                                    Hot Spot (Structural Friction)
                                </h4>
                                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                                    A pulsing red glow indicates a <strong>Hot Spot</strong>. These are sites where the actor&apos;s instability (&quot;Deterritorialization&quot;) conflicts with its role—for example, a biased algorithm or a centralized infrastructure point. It signals high ethical risk or friction.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
