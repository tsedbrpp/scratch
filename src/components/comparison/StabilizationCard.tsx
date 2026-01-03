"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Anchor, Coins, Building2, Gavel } from 'lucide-react';

interface StabilizationMechanism {
    jurisdiction: string;
    mechanism: string;
    type: "Bureaucratic" | "Market" | "State" | "Legal";
}

interface StabilizationCardProps {
    mechanisms: StabilizationMechanism[];
}

export function StabilizationCard({ mechanisms }: StabilizationCardProps) {
    if (!mechanisms || mechanisms.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case "Bureaucratic": return <Building2 className="h-4 w-4" />;
            case "Market": return <Coins className="h-4 w-4" />;
            case "State": return <ShieldCheck className="h-4 w-4" />;
            case "Legal": return <Gavel className="h-4 w-4" />;
            default: return <Anchor className="h-4 w-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case "Bureaucratic": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Market": return "bg-purple-50 text-purple-700 border-purple-200";
            case "State": return "bg-red-50 text-red-700 border-red-200";
            case "Legal": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Anchor className="h-5 w-5 text-slate-500" />
                    Stabilization Mechanisms
                </CardTitle>
                <CardDescription>
                    Territorializing forces holding the assemblage together.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mechanisms.map((mech, idx) => (
                    <div key={idx} className={`p-3 rounded border flex items-start gap-3 ${getColor(mech.type)}`}>
                        <div className="mt-0.5 shrink-0 opacity-70">
                            {getIcon(mech.type)}
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase block mb-1 opacity-60">
                                {mech.jurisdiction} • {mech.type}
                            </span>
                            <p className="text-sm font-medium leading-tight">
                                {mech.mechanism}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
