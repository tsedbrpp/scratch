import React, { Suspense } from "react";
import { Activity } from "lucide-react";
import { ControversyDashboard } from "@/components/analysis/ControversyDashboard";

export const metadata = {
    title: "Controversy Mapping - InstantTea",
    description: "Meta-Synthesis of consensus, frictions, and structural contradictions.",
};

function LoadingShell() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full items-center justify-center p-12 text-slate-500 bg-slate-50 dark:bg-slate-950 animate-pulse">
            <Activity className="w-8 h-8 mb-4 opacity-50 text-indigo-500" />
            <p className="text-sm font-medium">Booting Controversy Mapping Engine...</p>
        </div>
    );
}

export default function ControversiesPage() {
    return (
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
            <Suspense fallback={<LoadingShell />}>
                <ControversyDashboard />
            </Suspense>
        </main>
    );
}
