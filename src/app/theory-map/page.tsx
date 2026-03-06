"use client";

import { useServerStorage } from "@/hooks/useServerStorage";
import { useState, useRef } from "react";
import { ComparativeSynthesis, TEAAnalysis } from "@/types";
import { TeaTheoryMap } from "@/components/analysis/theory-map/TeaTheoryMap";
import { TheoryLegend } from "@/components/analysis/theory-map/TheoryLegend";
import { adaptSynthesisToTheoryMap } from "@/components/analysis/theory-map/adapter";
import { TheoryMapMode } from "@/components/analysis/theory-map/types";
import { Download, LayoutPanelTop } from "lucide-react";
import * as htmlToImage from "html-to-image";

export default function TheoryMapPage() {
    const [synthesisComparison] = useServerStorage<ComparativeSynthesis | null>("synthesis_comparison_result", null);
    const [teaAnalysis] = useServerStorage<TEAAnalysis | null>("tea_analysis_result", null);
    const [mode, setMode] = useState<TheoryMapMode>("interactive");
    const mapRef = useRef<HTMLDivElement>(null);

    const panels = adaptSynthesisToTheoryMap(synthesisComparison, teaAnalysis);

    const handleExport = async () => {
        if (!mapRef.current) return;
        try {
            // Force short re-render to strip journal UI or rely on current state
            const dataUrl = await htmlToImage.toPng(mapRef.current, { backgroundColor: mode === 'journal' ? '#ffffff' : '#171717', pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `tea-theory-map-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to export figure:", err);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8 pt-20">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="mb-12 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-light tracking-tight text-white mb-2">TEA Theory Map</h1>
                        <p className="text-neutral-400 max-w-2xl">
                            A translational grid positioning Actor-Network and Assemblage readings.
                            The central narrative traces how portable governance vocabularies drift across jurisdictions,
                            the friction they encounter, and exactly how they stabilize through local embedding infrastructures.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setMode(mode === 'interactive' ? 'journal' : 'interactive')}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm font-medium rounded-lg transition-colors border border-neutral-700"
                        >
                            <LayoutPanelTop className="w-4 h-4" />
                            {mode === 'interactive' ? "Journal Mode" : "Interactive Mode"}
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Figure
                        </button>
                    </div>
                </header>

                {panels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-24 text-center bg-neutral-800/50 rounded-xl border border-neutral-800">
                        <h3 className="text-xl text-neutral-300 font-medium mb-2">No Empirical Data Found</h3>
                        <p className="text-neutral-500 mb-6">
                            You must run a full Comparative Synthesis and TEA Analysis before viewing this map.
                        </p>
                    </div>
                ) : (
                    <div ref={mapRef} className={`p-4 rounded-xl ${mode === 'journal' ? 'bg-white' : 'bg-transparent'}`}>
                        <TeaTheoryMap panels={panels} mode={mode} />
                        <TheoryLegend mode={mode} />
                    </div>
                )}
            </div>
        </div>
    );
}
