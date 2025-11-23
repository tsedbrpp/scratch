"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Database,
    BookOpen,
    Scale,
    Users,
    Scan,
    Network,
    Lightbulb,
    ArrowLeftRight,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
    const pathname = usePathname();

    const navGroups = [
        {
            title: "Overview",
            items: [
                {
                    name: "Assemblage Overview",
                    href: "/",
                    icon: LayoutDashboard,
                    description: "High-level view of the algorithmic assemblage and research progress."
                }
            ]
        },
        {
            title: "Micro (Individual/Trace)",
            items: [
                {
                    name: "Trace Archive",
                    href: "/data",
                    icon: Database,
                    description: "Archive of primary policy texts (PDFs) and source materials."
                },
                {
                    name: "Empirical Data",
                    href: "/empirical",
                    icon: Users,
                    description: "Collect and organize empirical traces from web sources."
                },
                {
                    name: "Resistance",
                    href: "/resistance",
                    icon: Users,
                    description: "Analyze micro-resistance strategies and counter-conduct."
                },
                {
                    name: "Reflexivity",
                    href: "/reflexivity",
                    icon: Scan,
                    description: "Document researcher positionality and recursive reflections."
                },
            ]
        },
        {
            title: "Meso (Field/Ecosystem)",
            items: [
                {
                    name: "Ecosystem Analysis",
                    href: "/ecosystem",
                    icon: Users,
                    description: "Map actors, detect cultural holes, and visualize social networks."
                },
                {
                    name: "Synthesis",
                    href: "/synthesis",
                    icon: Network,
                    description: "Cross-case synthesis and AI-powered framework comparison."
                },
            ]
        },
        {
            title: "Macro (System/Structural)",
            items: [
                {
                    name: "Comparison",
                    href: "/comparison",
                    icon: ArrowLeftRight,
                    description: "Side-by-side comparison of governance frameworks."
                },
                {
                    name: "Governance",
                    href: "/governance",
                    icon: Scale,
                    description: "Analyze resource orchestration and institutional logics."
                },
                {
                    name: "Hermeneutic Interpretation",
                    href: "/cultural",
                    icon: Lightbulb,
                    description: "Examine cultural framing and epistemic authority."
                },
                {
                    name: "Ontology",
                    href: "/ontology",
                    icon: BookOpen,
                    description: "Visual cartography of key concepts and their relationships."
                },
                {
                    name: "Temporal Dynamics",
                    href: "/timeline",
                    icon: Clock,
                    description: "Track the evolution of discourse and policy over time."
                },
            ]
        }
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-slate-950 text-white overflow-y-auto">
            <div className="flex h-16 items-center justify-center border-b border-slate-800 shrink-0">
                <Link href="/" className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-indigo-400" />
                    <h1 className="text-lg font-bold tracking-wider">DECOLONIAL AI</h1>
                </Link>
            </div>

            <TooltipProvider>
                <nav className="flex-1 px-2 py-4 space-y-6">
                    {navGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Tooltip key={item.name} delayDuration={300}>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                                                        isActive
                                                            ? "bg-slate-800 text-white"
                                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                                    )}
                                                >
                                                    <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                                                    {item.name}
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700 max-w-xs">
                                                <p>{item.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </TooltipProvider>

            <div className="border-t border-slate-800 p-4 shrink-0">
                <p className="text-xs text-slate-500">
                    Research Assistant v0.2
                </p>
            </div>
        </div>
    );
}
