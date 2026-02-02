import React from 'react';
import { BlindSpotDashboard } from '@/components/analysis/BlindSpotDashboard';
import type { BlindSpotEnhanced } from '@/types';

/**
 * Demo component to showcase the new Enhanced Blind Spot Dashboard
 * This demonstrates what the UI will look like when analyses generate structured blind spots
 */
export function BlindSpotDashboardDemo() {
    // Sample Tier 2 (Enhanced) blind spots
    const sampleBlindSpots: BlindSpotEnhanced[] = [
        {
            id: 'demo_1',
            title: 'Presumes high state enforcement capacity',
            description: 'Analysis references "competent authority" sanctions without noting resource constraints in federal systems.',
            severity: 'high',
            category: 'power',
            evidence: {
                type: 'absence',
                context: 'No mention of enforcement challenges in fragmented jurisdictions or low-capacity states.',
                quote: 'The competent authority shall impose sanctions...'
            },
            implications: 'Overestimates policy effectiveness in low-capacity contexts (e.g., U.S. states with limited regulatory budgets).',
            suggested_mitigations: [
                'Re-analyze with "limited state capacity" lens',
                'Upload comparative cases from fragmented jurisdictions',
                'Consider enforcement gap literature (Gunningham & Sinclair 2017)'
            ]
        },
        {
            id: 'demo_2',
            title: 'Ignores informal economy workers',
            description: 'Analysis assumes formal employment relationships, overlooking gig workers and informal labor.',
            severity: 'high',
            category: 'coloniality',
            evidence: {
                type: 'assumption',
                context: 'Policy language assumes employer-employee relationships throughout.'
            },
            implications: 'Excludes 40% of Global South labor force per ILO data, reproducing colonial patterns of formal/informal divide.',
            suggested_mitigations: [
                'Incorporate informal economy scholarship (Chen 2012)',
                'Re-analyze with focus on platform workers'
            ]
        },
        {
            id: 'demo_3',
            title: 'Assumes technical literacy',
            description: 'Transparency requirements presume users can interpret technical disclosures.',
            severity: 'medium',
            category: 'epistemic',
            evidence: {
                type: 'assumption',
                context: 'No mention of accessibility or plain-language requirements in transparency provisions.'
            },
            implications: 'Transparency may only benefit technical elites, excluding lay users.',
            suggested_mitigations: [
                'Analyze accessibility standards',
                'Consider plain-language mandate requirements'
            ]
        },
        {
            id: 'demo_4',
            title: 'Overlooks environmental compute costs',
            description: 'Analysis does not address energy consumption or carbon footprint of AI systems.',
            severity: 'medium',
            category: 'materiality',
            evidence: {
                type: 'absence',
                context: 'No environmental impact assessment or sustainability requirements mentioned.'
            },
            implications: 'Ignores material externalities of AI deployment.',
            suggested_mitigations: [
                'Incorporate environmental justice lens',
                'Review EU AI Act sustainability provisions'
            ]
        },
        {
            id: 'demo_5',
            title: 'Minor: Edge case for legacy systems',
            description: 'Does not address transition period for pre-existing AI systems.',
            severity: 'low',
            category: 'temporality'
        }
    ];

    const mockCritique = {
        blind_spots: sampleBlindSpots,
        epistemic_coverage_score: 54, // 2 high (30) + 2 medium (16) = 46 penalty
        detection_tier: 2 as const
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Enhanced Blind Spot Dashboard Demo
                    </h1>
                    <p className="text-sm text-slate-600 mb-4">
                        This demonstrates what the new dashboard looks like with Tier 2 (Enhanced) blind spots.
                        Try clicking "View Detailed Breakdown" and expanding individual cards.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                        <strong>Note:</strong> Your existing analyses still have simple string blind spots (Tier 0).
                        To see this UI in production, you'll need to either:
                        <ul className="list-disc list-inside mt-1 ml-2">
                            <li>Run a new analysis (Phase 3 will enhance the API to generate structured output)</li>
                            <li>Manually migrate existing analyses (not recommended)</li>
                        </ul>
                    </div>
                </div>

                <BlindSpotDashboard critique={mockCritique} />

                <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Coverage Score Calculation</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        100 - (2 high × 15) - (2 medium × 8) - (1 low × 3) = <strong>54%</strong> (Fair)
                    </p>
                </div>
            </div>
        </div>
    );
}
