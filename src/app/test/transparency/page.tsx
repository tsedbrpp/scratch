'use client';

import React from 'react';
import { TransparencyPanel } from '@/components/analysis/TransparencyPanel';
import { TransparencyService } from '@/services/transparency-service';

/**
 * Test page for algorithmic transparency features
 * Navigate to /test/transparency to view
 */
export default function TransparencyTestPage() {
    const epistemicMetadata = TransparencyService.getEpistemicAsymmetryTransparency();
    const powerMetadata = TransparencyService.getPowerConcentrationTransparency();
    const fullReport = TransparencyService.generateTransparencyReport({});

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Algorithmic Transparency Test</h1>
                    <p className="text-zinc-400">
                        This page demonstrates the transparency infrastructure for Instant TEA's scoring algorithms.
                    </p>
                </div>

                {/* Example Metric 1: Epistemic Asymmetry */}
                <div className="space-y-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2">Epistemic Asymmetry Score</h2>
                        <div className="text-4xl font-bold text-indigo-400 mb-2">0.73</div>
                        <p className="text-zinc-300">
                            This example document shows significant epistemic asymmetry, with marginalized
                            knowledge claims being systematically excluded from the governance framework.
                        </p>
                    </div>

                    <TransparencyPanel
                        metadata={epistemicMetadata}
                        score={0.73}
                    />
                </div>

                {/* Example Metric 2: Power Concentration */}
                <div className="space-y-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2">Power Concentration Index</h2>
                        <div className="text-4xl font-bold text-purple-400 mb-2">0.42</div>
                        <p className="text-zinc-300">
                            Power is moderately concentrated, with a few key actors controlling
                            significant decision-making authority.
                        </p>
                    </div>

                    <TransparencyPanel
                        metadata={powerMetadata}
                        score={0.42}
                    />
                </div>

                {/* Overall Caveats & Design Decisions */}
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-amber-300 mb-4">
                        Overall Caveats & Design Decisions
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-white mb-2">⚠️ Important Caveats:</h3>
                            <ul className="text-sm text-zinc-300 space-y-2 ml-4">
                                {fullReport.overall_caveats.map((caveat, i) => (
                                    <li key={i} className="list-disc">{caveat}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-amber-500/30">
                            <h3 className="font-semibold text-white mb-2">💡 Design Decisions:</h3>
                            <ul className="text-sm text-zinc-300 space-y-2 ml-4">
                                {fullReport.design_decisions.map((decision, i) => (
                                    <li key={i} className="list-disc">{decision}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* All Metrics */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">All Available Transparency Metadata</h2>
                    {Object.entries(TransparencyService.getAllTransparencyMetadata()).map(([key, metadata]) => (
                        <div key={key}>
                            <h3 className="text-lg font-semibold text-zinc-300 mb-2">
                                {metadata.metric_name}
                            </h3>
                            <TransparencyPanel metadata={metadata} />
                        </div>
                    ))}
                </div>

                {/* Documentation Link */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-300 mb-2">
                        📚 Full Documentation
                    </h3>
                    <p className="text-sm text-zinc-300 mb-3">
                        For complete transparency documentation, see:
                    </p>
                    <code className="text-xs bg-zinc-800 text-indigo-300 px-3 py-1 rounded">
                        docs/algorithmic-transparency.md
                    </code>
                </div>
            </div>
        </div>
    );
}
