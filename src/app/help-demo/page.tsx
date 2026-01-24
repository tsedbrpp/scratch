"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { GlossaryLink } from "@/components/help/GlossaryLink";
import { getGlossaryDefinition } from "@/lib/glossary-definitions";
import { Compass, Network, Shield, HelpCircle } from "lucide-react";

/**
 * Demo page showcasing Phase 2 contextual help features
 */
export default function ContextualHelpDemoPage() {
    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Contextual Help Demo</h1>
                <p className="text-slate-600">
                    Phase 2 onboarding features: tooltips, glossary links, and progressive disclosure
                </p>
            </div>

            <div className="grid gap-6">
                {/* HelpTooltip Examples */}
                <Card>
                    <CardHeader>
                        <CardTitle>HelpTooltip Component</CardTitle>
                        <CardDescription>
                            Enhanced tooltips with descriptions and glossary links
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Example 1: Basic tooltip */}
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900">Assemblage Compass</h4>
                            <HelpTooltip
                                title="Assemblage Compass"
                                description={getGlossaryDefinition('assemblage-compass')}
                                glossaryTerm="assemblage-compass"
                            />
                        </div>

                        {/* Example 2: Tooltip with icon */}
                        <div className="flex items-center gap-2">
                            <Compass className="h-5 w-5 text-slate-600" />
                            <span className="text-sm text-slate-700">Network Visualization</span>
                            <HelpTooltip
                                title="Network Visualization"
                                description="Interactive graph showing relationships between actors, technologies, and institutions in the policy assemblage."
                                learnMoreUrl="/docs/user#network-viz"
                            />
                        </div>

                        {/* Example 3: Tooltip with custom trigger */}
                        <div>
                            <HelpTooltip
                                title="Institutional Logics"
                                description={getGlossaryDefinition('institutional-logics')}
                                glossaryTerm="institutional-logics"
                            >
                                <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    What are Institutional Logics?
                                </button>
                            </HelpTooltip>
                        </div>
                    </CardContent>
                </Card>

                {/* GlossaryLink Examples */}
                <Card>
                    <CardHeader>
                        <CardTitle>GlossaryLink Component</CardTitle>
                        <CardDescription>
                            Inline glossary terms with hover definitions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none">
                            <p className="text-slate-700 leading-relaxed">
                                This analysis uses{' '}
                                <GlossaryLink
                                    term="Actor-Network Theory"
                                    definition={getGlossaryDefinition('actor-network-theory')}
                                >
                                    Actor-Network Theory
                                </GlossaryLink>
                                {' '}to examine how{' '}
                                <GlossaryLink
                                    term="Institutional Logics"
                                    definition={getGlossaryDefinition('institutional-logics')}
                                >
                                    institutional logics
                                </GlossaryLink>
                                {' '}shape policy implementation. We identify{' '}
                                <GlossaryLink
                                    term="OPP"
                                    definition={getGlossaryDefinition('opp')}
                                >
                                    obligatory passage points
                                </GlossaryLink>
                                {' '}and analyze{' '}
                                <GlossaryLink
                                    term="Micro-Resistance"
                                    definition={getGlossaryDefinition('micro-resistance')}
                                >
                                    micro-resistance
                                </GlossaryLink>
                                {' '}patterns that emerge during{' '}
                                <GlossaryLink
                                    term="Territorialization"
                                    definition={getGlossaryDefinition('territorialization')}
                                >
                                    territorialization
                                </GlossaryLink>.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle>Key Features with Help</CardTitle>
                        <CardDescription>
                            Examples of tooltips integrated into feature cards
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Card 1 */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Compass className="h-5 w-5 text-blue-700" />
                                        <h4 className="font-semibold text-blue-900">Assemblage Compass</h4>
                                    </div>
                                    <HelpTooltip
                                        title="Assemblage Compass"
                                        description={getGlossaryDefinition('assemblage-compass')}
                                        glossaryTerm="assemblage-compass"
                                    />
                                </div>
                                <p className="text-xs text-blue-700">
                                    Map actor networks and relationships
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Network className="h-5 w-5 text-purple-700" />
                                        <h4 className="font-semibold text-purple-900">Drift Analysis</h4>
                                    </div>
                                    <HelpTooltip
                                        title="Drift Analysis"
                                        description={getGlossaryDefinition('drift-analysis')}
                                        glossaryTerm="drift-analysis"
                                    />
                                </div>
                                <p className="text-xs text-purple-700">
                                    Measure rhetoric vs. reality gap
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-green-700" />
                                        <h4 className="font-semibold text-green-900">Micro-Resistance</h4>
                                    </div>
                                    <HelpTooltip
                                        title="Micro-Resistance"
                                        description={getGlossaryDefinition('micro-resistance')}
                                        glossaryTerm="micro-resistance"
                                    />
                                </div>
                                <p className="text-xs text-green-700">
                                    Identify subtle opposition patterns
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">HelpTooltip</h4>
                            <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto">
                                {`<HelpTooltip
  title="Feature Name"
  description="Helpful explanation"
  glossaryTerm="term-slug"
  learnMoreUrl="/docs/feature"
/>`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm mb-2">GlossaryLink</h4>
                            <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-x-auto">
                                {`<GlossaryLink 
  term="Term Name" 
  definition="Definition text"
>
  term text
</GlossaryLink>`}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
