
"use client";

import React from "react";
import { Terminal, Shield, Cpu, CreditCard } from "lucide-react";

export function SocialProof() {
    return (
        <div className="bg-white py-12 border-b border-slate-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-widest">
                    Built with Trusted Technologies
                </p>
                <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                    {/* Replaced Image logos with consistent Lucide icons + Text for cleaner, maintenance-free look */}

                    <div className="flex flex-col items-center gap-2 text-slate-400 group hover:text-slate-900 transition-colors cursor-default">
                        <Terminal className="h-8 w-8" />
                        <span className="text-xs font-bold">Next.js 14</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-slate-400 group hover:text-emerald-600 transition-colors cursor-default">
                        <Cpu className="h-8 w-8" />
                        <span className="text-xs font-bold">OpenAI & Google</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-slate-400 group hover:text-indigo-600 transition-colors cursor-default">
                        <CreditCard className="h-8 w-8" />
                        <span className="text-xs font-bold">Stripe Payments</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-slate-400 group hover:text-purple-600 transition-colors cursor-default">
                        <Shield className="h-8 w-8" />
                        <span className="text-xs font-bold">Clerk Auth</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
