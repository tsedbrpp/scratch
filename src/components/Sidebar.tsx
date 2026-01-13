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
    X,
    LucideIcon,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface NavGroup {
    title: string;
    items: {
        name: string;
        href: string;
        icon: LucideIcon;
        description: string;
    }[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        title: "Overview",
        items: [
            {
                name: "Dashboard",
                href: "/",
                icon: LayoutDashboard,
                description: "High-level view of the algorithmic assemblage and research progress."
            }
        ]
    },
    {
        title: "Material Collection",
        items: [
            {
                name: "Policy Archive",
                href: "/data",
                icon: Database,
                description: "Archive of primary policy texts and source materials."
            },
            {
                name: "Trace Provenance",
                href: "/empirical",
                icon: Users,
                description: "Collect and organize empirical traces from web sources."
            }
        ]
    },
    {
        title: "Counter-Conduct",
        items: [
            {
                name: "Micro-Resistance",
                href: "/resistance",
                icon: Users,
                description: "Analyze micro-resistance strategies and counter-conduct."
            },
            {
                name: "Reflexive Positioning",
                href: "/reflexivity",
                icon: Scan,
                description: "Examine how your own perspective and context shape the analysis."
            },
        ]
    },
    {
        title: "Assemblage Cartography",
        items: [
            {
                name: "Assemblage Compass",
                href: "/ecosystem",
                icon: Network,
                description: "Trace territories, flows, and coding intensities of the assemblage."
            },
            {
                name: "Cross-Case Synthesis",
                href: "/synthesis",
                icon: Network,
                description: "Cross-case analysis and comparative framework synthesis."
            },
        ]
    },
    {
        title: "Structural Analysis",
        items: [
            {
                name: "Policy Mobilities",
                href: "/comparison",
                icon: ArrowLeftRight,
                description: "Trace policy mutations and translations across jurisdictions."
            },
            {
                name: "Institutional Logics",
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
        title: "Theoretical Resources",
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
    },
    {
        title: "Settings",
        items: [
            {
                name: "Tune Prompts",
                href: "/settings/prompts",
                icon: Scan,
                description: "Customize system prompts for analysis and extraction."
            }
        ]
    }
];

function SidebarContent({ pathname, isMounted, isCollapsed, toggleCollapse }: { pathname: string; isMounted: boolean; isCollapsed: boolean; toggleCollapse?: () => void }) {
    return (
        <div className="flex flex-col h-full bg-white text-slate-900">
            <div className={cn("flex items-center border-b border-slate-100 transition-all duration-300", isCollapsed ? "p-4 justify-center" : "p-6")}>
                <Link href="/" className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <span className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap animate-in fade-in duration-300">
                            Assemblage<span className="text-blue-600">-AI</span>
                        </span>
                    )}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                {NAV_GROUPS.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {!isCollapsed && (
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 animate-in fade-in duration-300 whitespace-nowrap">
                                {group.title}
                            </h3>
                        )}
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
                                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group",
                                                        isActive
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                                        isCollapsed && "justify-center px-2"
                                                    )}
                                                >
                                                    <item.icon size={20} className="shrink-0" />
                                                    {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-200">{item.name}</span>}
                                                </Link>
                                            </TooltipTrigger>
                                            {/* Show tooltip if collapsed OR if explicitly wanted (though description is long) */}
                                            {isCollapsed && (
                                                <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800 ml-2">
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-xs text-slate-300 max-w-[200px]">{item.description}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className={cn("border-t border-slate-100 bg-slate-50 flex flex-col gap-2 transition-all duration-300", isCollapsed ? "p-2 items-center" : "p-4")}>
                <div className="flex items-center gap-3 justify-center w-full">
                    {isMounted && <UserButton showName={!isCollapsed} />}
                </div>
                {toggleCollapse && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapse}
                        className={cn("w-full text-slate-400 hover:text-slate-600 hover:bg-slate-200", isCollapsed ? "h-8 px-0" : "h-8")}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4 mr-2" /> Collapse</>}
                    </Button>
                )}
            </div>
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Close mobile menu when path changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Handle hydration mismatch
    useEffect(() => {
        setIsMounted(true);
        // Recover collapsed state from local storage if desired, but for now just default
        const savedCollapsed = localStorage.getItem("sidebar-collapsed");
        if (savedCollapsed === "true") setIsCollapsed(true);
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem("sidebar-collapsed", String(newState));
            return newState;
        });
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "hidden md:flex border-r border-slate-200 bg-white flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-[72px]" : "w-64"
                )}
            >
                <SidebarContent
                    pathname={pathname}
                    isMounted={isMounted}
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-30">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">
                        Assemblage<span className="text-blue-600">-AI</span>
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
                            <SidebarContent pathname={pathname} isMounted={isMounted} isCollapsed={false} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
