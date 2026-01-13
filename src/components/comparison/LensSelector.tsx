"use client";

import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TrendingUp, ShieldAlert, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";

export type InterpretationLens = "assemblage" | "market" | "democratic" | "decolonial";

interface LensSelectorProps {
    currentLens: InterpretationLens;
    onLensChange: (lens: InterpretationLens) => void;
}

export function LensSelector({ currentLens, onLensChange }: LensSelectorProps) {
    return (
        <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-lg border border-slate-200 w-fit">
            <Button
                variant={currentLens === "assemblage" ? "default" : "ghost"}
                size="sm"
                onClick={() => onLensChange("assemblage")}
                className={`h-8 text-xs font-medium gap-1.5 ${currentLens === "assemblage" ? "bg-indigo-600 hover:bg-indigo-700" : "text-slate-600"}`}
            >
                <NetworkIcon className="h-3.5 w-3.5" />
                Relational (Default)
            </Button>
            <Button
                variant={currentLens === "market" ? "default" : "ghost"}
                size="sm"
                onClick={() => onLensChange("market")}
                className={`h-8 text-xs font-medium gap-1.5 ${currentLens === "market" ? "bg-purple-600 hover:bg-purple-700" : "text-slate-600"}`}
            >
                <TrendingUp className="h-3.5 w-3.5" />
                Market/Accel
            </Button>
            <Button
                variant={currentLens === "democratic" ? "default" : "ghost"}
                size="sm"
                onClick={() => onLensChange("democratic")}
                className={`h-8 text-xs font-medium gap-1.5 ${currentLens === "democratic" ? "bg-emerald-600 hover:bg-emerald-700" : "text-slate-600"}`}
            >
                <ShieldAlert className="h-3.5 w-3.5" />
                Prec/Democratic
            </Button>
            <Button
                variant={currentLens === "decolonial" ? "default" : "ghost"}
                size="sm"
                onClick={() => onLensChange("decolonial")}
                className={`h-8 text-xs font-medium gap-1.5 ${currentLens === "decolonial" ? "bg-amber-600 hover:bg-amber-700" : "text-slate-600"}`}
            >
                <Globe className="h-3.5 w-3.5" />
                Decolonial
            </Button>
        </div>
    );
}

function NetworkIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
        </svg>
    )
}
