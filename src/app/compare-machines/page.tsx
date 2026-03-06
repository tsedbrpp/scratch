import React, { Suspense } from "react";
import { CompareMachinesClient } from "@/components/analysis/CompareMachinesClient";
import { Network } from "lucide-react";

export const metadata = {
    title: "Compare Abstract Machines - Policy Prism",
    description: "Compare abstract machines, operators, tokens, and double articulations side-by-side.",
};

function LoadingShell() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full items-center justify-center p-12 text-slate-500 bg-slate-50 dark:bg-slate-950 animate-pulse">
            <Network className="w-8 h-8 mb-4 opacity-50 text-blue-500" />
            <p className="text-sm font-medium">Booting abstract machine viewer...</p>
        </div>
    );
}

export default function CompareMachinesPage() {
    return (
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-white dark:bg-slate-950">
            <Suspense fallback={<LoadingShell />}>
                <CompareMachinesClient />
            </Suspense>
        </main>
    );
}
