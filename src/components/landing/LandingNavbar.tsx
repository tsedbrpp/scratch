"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrismIcon } from "@/components/icons/PrismIcon";
import { Menu, X, PanelLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const searchParams = useSearchParams();
    const isSidebarOpen = searchParams?.get("sidebar") === "true";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (isSidebarOpen) return null;

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "Theory", href: "#theory" },
        { name: "Methodology", href: "#methodology" },
        { name: "Pricing", href: "#pricing" },
    ];

    return (
        <>
            {/* Floating Sidebar Toggle Button */}
            {!isSidebarOpen && (
                <Link
                    href="/?sidebar=true"
                    className="fixed left-0 top-1/3 -translate-y-1/2 z-[60] bg-slate-900 text-slate-400 hover:text-white pt-4 pb-4 px-1.5 md:px-2 rounded-r-xl border border-l-0 border-slate-700 shadow-2xl transition-all hover:pr-4 flex flex-col items-center gap-2 group overflow-hidden"
                    title="Explore App Menu"
                >
                    <div className="p-1.5 rounded bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors">
                        <PanelLeft className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                    </div>
                    <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold tracking-widest uppercase mt-2 opacity-80 group-hover:opacity-100">
                        Explore App
                    </span>
                </Link>
            )}

            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800 py-3 shadow-lg" : "bg-transparent py-5"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex z-50">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center">
                                <PrismIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                Policy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Prism</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex flex-1 justify-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-2 outline-none"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex gap-4 items-center">
                        <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-3 py-2 outline-none">
                            Log in
                        </Link>
                        <Link href="/sign-up">
                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden z-50">
                        <button
                            title="Toggle Menu"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-40 bg-slate-900 border-b border-slate-800 pt-20 px-6 pb-6 flex flex-col gap-6 animate-in slide-in-from-top-4">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-slate-800"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                        <div className="py-6 border-t border-slate-800 flex flex-col gap-4">
                            <Link
                                href="/login"
                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-slate-800"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Log in
                            </Link>
                            <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-none py-6">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
