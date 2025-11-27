"use client";

import { useState, useEffect } from "react";
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
    Clock,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu when path changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

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
                    name: "Cultural Framing",
                    href: "/cultural",
                    icon: Lightbulb,
                    description: "Examine cultural framing and epistemic authority."
                },
                {
                    name: "Concept Network",
                    href: "/ontology",
                    icon: BookOpen,
                    description: "Visual map of key concepts and their relationships."
                },
                {
                    name: "Temporal Dynamics",
                    href: "/timeline",
                    icon: Clock,
                    description: "Track the evolution of discourse and policy over time."
                },
            ]
        },
        {
            title: "Educational Resources",
            items: [
                {
                    name: "Critical Glossary",
                    href: "/glossary",
                    icon: BookOpen,
                    description: "Definitions of key theoretical concepts and terms."
                },
                {
                    name: "Literature Review",
                    href: "/literature",
                    icon: BookOpen,
                    description: "Theoretical framework and key scholarship."
                }
            ]
        }
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">
                        Assemblage<span className="text-blue-600">.ai</span>
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <TooltipProvider key={item.href} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                                        isActive
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                    )}
                                                >
                                                    <item.icon size={18} />
                                                    {item.name}
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="max-w-xs bg-slate-900 text-white border-slate-800 hidden md:block">
                                                <p>{item.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                            Jane Doe
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            Researcher
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col h-full flex-shrink-0">
                <SidebarContent />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">
                        Assemblage<span className="text-blue-600">.ai</span>
                    </span>
                </Link>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        <div className="flex justify-end p-4 border-b border-slate-100">
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <SidebarContent />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
