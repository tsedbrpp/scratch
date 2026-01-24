"use client";

import { useViewMode } from "@/hooks/useViewMode";
import { Button } from "@/components/ui/button";
import { BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewModeToggle({ className }: { className?: string }) {
    const { mode, setMode } = useViewMode();

    return (
        <div className={cn("flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200", className)}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('guided')}
                className={cn(
                    "flex-1 gap-2 text-xs font-medium h-7 transition-all",
                    mode === 'guided'
                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
            >
                <BookOpen className="h-3.5 w-3.5" />
                Guided
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('advanced')}
                className={cn(
                    "flex-1 gap-2 text-xs font-medium h-7 transition-all",
                    mode === 'advanced'
                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
            >
                <Layers className="h-3.5 w-3.5" />
                Advanced
            </Button>
        </div>
    );
}
