"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
    return (
        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg"></div>
                        <span className="text-xl font-bold text-white">instantTEA</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-xs">
                        An open-source platform for critical policy and governance research, bridging the gap between policy intent and reality.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/data" className="hover:text-blue-400 transition-colors">Data Collection</Link></li>
                        <li><Link href="/ecosystem" className="hover:text-blue-400 transition-colors">Ecosystem Map</Link></li>
                        <li><Link href="/synthesis" className="hover:text-blue-400 transition-colors">Analysis Tools</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/docs/user" className="hover:text-blue-400 transition-colors">User Guide</Link></li>
                        <li><Link href="/why-credits" className="hover:text-emerald-400 transition-colors">Why Costs/Credits?</Link></li>
                        <li><Link href="/governance/contributor-credits" className="hover:text-amber-400 transition-colors">Contributor Policy</Link></li>
                        <li><Link href="/docs" className="hover:text-blue-400 transition-colors">System Documentation</Link></li>
                        <li><Link href="https://github.com/tsedbrpp/scratch" className="hover:text-blue-400 transition-colors">GitHub Repository</Link></li>
                        <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                        <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-xs text-center">
                &copy; {new Date().getFullYear()} instantTEA Research Group. Open Source (MIT License).
            </div>
        </footer>
    );
}
