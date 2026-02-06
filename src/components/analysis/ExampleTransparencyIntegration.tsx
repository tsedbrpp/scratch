/**
 * Example: How to integrate TransparencyPanel into analysis results
 * 
 * This shows how to use the transparency infrastructure in your components
 */

import React from 'react';
import { TransparencyPanel } from '@/components/analysis/TransparencyPanel';
import { TransparencyService } from '@/services/transparency-service';

export function ExampleAnalysisResults() {
    // Get transparency metadata for a specific metric
    const epistemicAsymmetryMetadata = TransparencyService.getEpistemicAsymmetryTransparency();

    // Example score from analysis
    const epistemicAsymmetryScore = 0.73;

    return (
        <div className="space-y-6">
            {/* Your existing analysis results */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                    Epistemic Asymmetry Analysis
                </h3>
                <div className="text-3xl font-bold text-indigo-400 mb-4">
                    {epistemicAsymmetryScore}
                </div>
                <p className="text-zinc-300">
                    This document shows significant epistemic asymmetry, with marginalized
                    knowledge claims being systematically excluded from the governance framework.
                </p>
            </div>

            {/* Add transparency panel below the metric */}
            <TransparencyPanel
                metadata={epistemicAsymmetryMetadata}
                score={epistemicAsymmetryScore}
            />

            {/* Or show all transparency metadata at once */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                    Algorithmic Transparency
                </h3>
                {Object.entries(TransparencyService.getAllTransparencyMetadata()).map(([key, metadata]) => (
                    <TransparencyPanel
                        key={key}
                        metadata={metadata}
                    />
                ))}
            </div>

            {/* Show overall design decisions and caveats */}
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-amber-300 mb-4">
                    Overall Caveats & Design Decisions
                </h3>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-white mb-2">Important Caveats:</h4>
                        <ul className="text-sm text-zinc-300 space-y-1 ml-4">
                            {TransparencyService.generateTransparencyReport({}).overall_caveats.map((caveat, i) => (
                                <li key={i} className="list-disc">{caveat}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-2">Design Decisions:</h4>
                        <ul className="text-sm text-zinc-300 space-y-1 ml-4">
                            {TransparencyService.generateTransparencyReport({}).design_decisions.map((decision, i) => (
                                <li key={i} className="list-disc">{decision}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
