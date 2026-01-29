import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen } from "lucide-react";

export function TheoreticalTensionsDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    Theoretical Tensions
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-5 w-5" />
                        Methodological Limitations & Critique
                    </DialogTitle>
                    <DialogDescription>
                        Crucial reflexivity warnings for the researcher using this tool.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
                        <p className="font-semibold text-amber-900 mb-2">The "God Trick" Warning</p>
                        <p>
                            This tool risks creating an "illusion of coherence"—over-reading the presence of mapped nodes as evidence that governance is stable, legible, and rational.
                            Remember: <strong>The Map is Not the Territory.</strong>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <section>
                            <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                1. The Illusion of Coherence
                            </h3>
                            <p>
                                The analysis may attribute stability to legal instruments merely by virtue of their textual existence.
                                It risks eliding the <strong>contingent politics</strong> of drafting, implementation, and enforcement.
                                A node on this graph appears "fixed," but the reality it represents is often messy, contested, and incoherent.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                2. Reification of the "Neutral" Translator
                            </h3>
                            <p>
                                By "translating" texts into analyzable objects, this tool risks positioning the researcher and the AI as neutral arbiters of truth.
                                This ignores our own <strong>interpretive agency</strong> and the possibility that the tool's schema itself shapes what "counts" as relevant governance, silencing alternative interpretive communities.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                3. Reduction of Stakeholders
                            </h3>
                            <p>
                                Policymakers and civil society are reduced to "modeled stakeholders" (nodes).
                                This is an interpretive leap that assumes they are adequately represented by a circle on a screen.
                                We must remain aware that this modeling reflects <strong>design choices</strong> rather than raw, unmediated power relations.
                            </p>
                        </section>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 italic">
                            Systematic Critique applied to "Assemblage Extraction" — Use this graph as a "thinking device" to trace relations, not as an objective "truth machine."
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
