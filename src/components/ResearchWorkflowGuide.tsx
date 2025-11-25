"use client";

import { useState, useEffect } from "react";
import { BookOpen, X, ChevronRight, Database, GitGraph, FileText, Share2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ResearchWorkflowGuide() {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    // Auto-minimize on specific pages if needed, or keep persistent
    // For now, we'll just let the user control it.

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center gap-2"
                title="Open Research Guide"
            >
                <BookOpen size={20} />
                <span className="font-medium text-sm pr-1">CFP Guide</span>
            </button>
        );
    }

    const steps = [
        {
            id: 1,
            title: "Data Collection",
            icon: <Database size={16} />,
            desc: "Import and tag your primary policy texts (EU AI Act, PL 2338).",
            link: "/data",
            active: pathname === "/data"
        },
        {
            id: 2,
            title: "Trace Resistance",
            icon: <GitGraph size={16} />,
            desc: "Identify and map micro-resistances and friction points.",
            link: "/resistance",
            active: pathname === "/resistance"
        },
        {
            id: 3,
            title: "Synthesize Assemblages",
            icon: <Share2 size={16} />,
            desc: "Visualize the actor-mechanism-impact flows.",
            link: "/synthesis",
            active: pathname === "/synthesis"
        },
        {
            id: 4,
            title: "Reflexive Journaling",
            icon: <FileText size={16} />,
            desc: "Document your situated positionality and method.",
            link: "/reflexivity",
            active: pathname === "/reflexivity"
        }
    ];

    return (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-400" />
                        Research Workflow
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Guide for "Algorithmic Assemblages" CFP
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                    {steps.map((step) => (
                        <Link
                            key={step.id}
                            href={step.link}
                            className={`block group border rounded-lg p-3 transition-all ${step.active
                                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                                    : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className={`flex items-center gap-2 font-semibold text-sm ${step.active ? "text-blue-700" : "text-slate-700"
                                    }`}>
                                    <span className={`p-1 rounded ${step.active ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-50"
                                        }`}>
                                        {step.icon}
                                    </span>
                                    {step.title}
                                </div>
                                {step.active && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed pl-8">
                                {step.desc}
                            </p>
                        </Link>
                    ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Current Goal:</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Generate the <strong>Assemblage Sankey Diagram</strong> in the Synthesis tab to visualize the "Decolonial Situatedness" argument for your paper.
                    </p>
                </div>
            </div>
        </div>
    );
}
