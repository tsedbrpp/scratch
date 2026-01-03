import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Layers, RefreshCw } from "lucide-react";
import { AVAILABLE_PERSPECTIVES, DEFAULT_PERSPECTIVE_A, DEFAULT_PERSPECTIVE_B } from "@/lib/perspectives";

interface InterpretationLensSelectorProps {
    currentLens: string;
    onLensChange: (lensId: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    hasResults: boolean;
    perspectiveAId?: string;
    perspectiveBId?: string;
}

export function InterpretationLensSelector({
    currentLens,
    onLensChange,
    onGenerate,
    isGenerating,
    hasResults,
    perspectiveAId,
    perspectiveBId
}: InterpretationLensSelectorProps) {

    const perspA = AVAILABLE_PERSPECTIVES.find(p => p.id === (perspectiveAId || DEFAULT_PERSPECTIVE_A.id)) || DEFAULT_PERSPECTIVE_A;
    const perspB = AVAILABLE_PERSPECTIVES.find(p => p.id === (perspectiveBId || DEFAULT_PERSPECTIVE_B.id)) || DEFAULT_PERSPECTIVE_B;

    if (!hasResults) {
        return (
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-500" />
                        Interpretation Sets
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        Compare this document through different theoretical lenses to avoid a single narrative.
                    </p>
                </div>
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    variant="outline"
                    className="gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                >
                    {isGenerating ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                        <Sparkles className="h-3 w-3" />
                    )}
                    {isGenerating ? "Simulating..." : "Generate Perspectives"}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-slate-100/80 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                <Layers className="h-3 w-3" />
                Active Lens:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-md border border-slate-200 shadow-sm">
                <button
                    onClick={() => onLensChange('default')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${currentLens === 'default'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    Assemblage / DSF (Default)
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button
                    onClick={() => onLensChange(perspA.id)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${currentLens === perspA.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    {perspA.name}
                </button>
                <button
                    onClick={() => onLensChange(perspB.id)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${currentLens === perspB.id
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    {perspB.name}
                </button>
            </div>
        </div>
    );
}
