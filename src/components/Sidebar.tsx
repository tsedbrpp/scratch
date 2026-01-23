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
    PanelLeftOpen,
    Coins,
    LogIn,
    UserPlus,
    Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/hooks/useDemoMode";

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
                description: "Research hub and multiple entry points."
            },
            {
                name: "Landing Page",
                href: "/?view=landing",
                icon: BookOpen,
                description: "View the project landing page and overview."
            }
        ]
    },
    {
        title: "Trace (The Making)",
        items: [
            {
                name: "Materials Archive",
                href: "/data",
                icon: Database,
                description: "Ingest and manage policy texts."
            },
            {
                name: "Assemblage Compass",
                href: "/ecosystem",
                icon: Network,
                description: "Trace actors, territories, and flows."
            },
            {
                name: "Trace Provenance",
                href: "/empirical",
                icon: Users,
                description: "Ingest and trace web sources."
            }
        ]
    },
    {
        title: "Analyze (The Thinking)",
        items: [
            {
                name: "Dynamics & Mobilities",
                href: "/comparison",
                icon: ArrowLeftRight,
                description: "Trace policy translations and mobilities."
            },
            {
                name: "Cultural Framing",
                href: "/cultural",
                icon: Lightbulb,
                description: "Analyze epistemic framing and absences."
            },
            {
                name: "Institutional Logics",
                href: "/governance",
                icon: Scale,
                description: "Analyze resource orchestration and logics."
            },
            {
                name: "Temporal Dynamics",
                href: "/timeline",
                icon: Clock,
                description: "Track evolution of discourse over time."
            },
            {
                name: "Cross-Case Synthesis",
                href: "/synthesis",
                icon: Network,
                description: "Comparative synthesis across cases."
            },
            {
                name: "Micro-Resistance",
                href: "/resistance",
                icon: Users, // Using Users as proxy for "Resistance" group
                description: "Analyze counter-conduct and resistance."
            }
        ]
    },
    {
        title: "Manage (The Infrastructure)",
        items: [
            {
                name: "Concept Network",
                href: "/ontology",
                icon: BookOpen,
                description: "Map key concepts and relationships."
            },
            {
                name: "Glossary & Theory",
                href: "/glossary",
                icon: BookOpen,
                description: "Theoretical resources and definitions."
            },
            {
                name: "Reflexivity",
                href: "/reflexivity",
                icon: Scan,
                description: "Examine positionality and analytical lens."
            }
        ]
    },
    {
        title: "Settings",
        items: [
            {
                name: "Billing & Credits",
                href: "/settings/billing",
                icon: Coins,
                description: "Manage credits and subscription."
            },
            {
                name: "Lens Configuration",
                href: "/settings/prompts",
                icon: Scan,
                description: "Customize analysis prompts."
            },
            {
                name: "Earn Credits",
                href: "/governance/contributor-credits",
                icon: Gift,
                description: "Contributor program."
            }
        ]
    }
];

function SidebarContent({ pathname, isMounted, isCollapsed, toggleCollapse }: { pathname: string; isMounted: boolean; isCollapsed: boolean; toggleCollapse?: () => void }) {
    const { isReadOnly } = useDemoMode();
    const { isSignedIn } = useAuth();

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-900 shadow-2xl">
            <div className={cn("flex items-center border-b border-slate-900 transition-all duration-300", isCollapsed ? "p-4 justify-center" : "p-6")}>
                <Link href="/" className="flex items-center gap-2 overflow-hidden group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap animate-in fade-in duration-300 group-hover:text-blue-100 transition-colors">
                                Instant <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">TEA</span>
                            </span>
                            {isReadOnly && (
                                <span className="text-[10px] leading-tight font-bold text-amber-500 animate-in fade-in uppercase tracking-wider">
                                    Demo Mode
                                </span>
                            )}
                        </div>
                    )}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {NAV_GROUPS.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {!isCollapsed && (
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 animate-in fade-in duration-300 whitespace-nowrap">
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
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group overflow-hidden",
                                                        isActive
                                                            ? "bg-gradient-to-r from-blue-600/10 to-emerald-600/10 text-white shadow-lg shadow-blue-900/5 ring-1 ring-white/10"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-900/50",
                                                        isCollapsed && "justify-center px-2"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-r-full" />
                                                    )}
                                                    <item.icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-blue-400" : "group-hover:text-slate-300")} />
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

            <div className={cn("border-t border-slate-900 bg-slate-950 flex flex-col gap-2 transition-all duration-300", isCollapsed ? "p-2 items-center" : "p-4")}>
                <div className="flex flex-col gap-2 w-full">
                    {isMounted && (
                        isSignedIn ? (
                            <div className="flex items-center gap-3 justify-center w-full">
                                <div className="bg-slate-900 rounded-full p-0.5 ring-1 ring-white/10">
                                    <UserButton showName={!isCollapsed} appearance={{
                                        elements: {
                                            userButtonBox: "flex flex-row-reverse",
                                            userButtonOuterIdentifier: "text-slate-300 font-semibold pl-2",
                                            avatarBox: "w-8 h-8"
                                        }
                                    }} />
                                </div>
                            </div>
                        ) : (
                            <div className={cn("flex flex-col gap-2", isCollapsed ? "items-center" : "w-full")}>
                                {isCollapsed ? (
                                    <>
                                        <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href="/login">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                                                            <LogIn className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">Log In</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href="/sign-up">
                                                        <Button size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-500 text-white">
                                                            <UserPlus className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">Get Started</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="w-full">
                                            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900">
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Log In
                                            </Button>
                                        </Link>
                                        <Link href="/sign-up" className="w-full">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        )
                    )}
                </div>
                {toggleCollapse && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapse}
                        className={cn("w-full text-slate-500 hover:text-slate-300 hover:bg-slate-900 mt-2", isCollapsed ? "h-8 px-0" : "h-8")}
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
                    "hidden md:flex bg-slate-950 flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out z-20 relative",
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
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-900 fixed top-0 left-0 right-0 z-30">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-white tracking-tight">
                        Instant <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">TEA</span>
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
