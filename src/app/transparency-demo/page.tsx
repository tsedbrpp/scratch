"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { PromptDialog } from "@/components/transparency/PromptDialog";
import { Eye, Sparkles } from "lucide-react";
import { ConfidenceScore, PromptMetadata, ProvenanceChain } from "@/types/provenance";

/**
 * Demo page showing transparency features with mock data
 * This demonstrates the UI components before backend integration
 */
export default function TransparencyDemoPage() {
    const [dialogOpen, setDialogOpen] = useState(false);

    // Mock data for demonstration
    const mockConfidence: ConfidenceScore = {
        score: 85,
        justification: "This analysis is based on clear textual evidence from the policy document. The governance structure is explicitly defined in Section 3.2, and the enforcement mechanisms are detailed in Section 4.1. However, some ambiguity exists around the appeals process, which slightly reduces confidence.",
        calculated_at: new Date().toISOString()
    };

    const mockMetadata: PromptMetadata = {
        prompt_used: `You are an expert in Actor-Network Theory and policy analysis. Analyze the following policy document and identify:

1. Key governance structures and power dynamics
2. Enforcement mechanisms and accountability pathways
3. Rights frameworks and their implementation
4. Potential gaps between rhetoric and reality

Document to analyze:
[Policy text would be inserted here...]

Provide your analysis in structured JSON format with the following fields:
- governance_power_accountability
- plurality_inclusion_embodiment
- agency_codesign_self_determination
- reflexivity_situated_praxis`,
        model_version: "gpt-4-turbo-2024-04-09",
        temperature: 0.3,
        max_tokens: 4000,
        timestamp: new Date().toISOString()
    };

    const mockProvenance: ProvenanceChain = {
        insight_id: "demo-insight-123",
        created_at: new Date().toISOString(),
        steps: [
            {
                type: "source_extraction",
                timestamp: new Date(Date.now() - 10000).toISOString(),
                data: {
                    input: "Full policy document text...",
                    output: "Extracted key sections: Governance (Section 3), Enforcement (Section 4), Rights (Section 5)",
                }
            },
            {
                type: "prompt_generation",
                timestamp: new Date(Date.now() - 8000).toISOString(),
                data: {
                    input: "Analysis request: Governance analysis with ANT lens",
                    output: mockMetadata.prompt_used,
                }
            },
            {
                type: "ai_response",
                timestamp: new Date(Date.now() - 5000).toISOString(),
                data: {
                    input: mockMetadata.prompt_used,
                    output: "Formatted analysis result",
                    raw_json: {
                        governance_power_accountability: "Centralized decision-making with limited stakeholder input...",
                        plurality_inclusion_embodiment: "Narrow definition of affected parties...",
                        confidence_score: 85,
                        evidence_quotes: ["Section 3.2: 'The board shall have final authority...'"]
                    }
                }
            },
            {
                type: "formatting",
                timestamp: new Date(Date.now() - 2000).toISOString(),
                data: {
                    input: "Raw JSON response",
                    output: "Structured AnalysisResult object",
                    transformation_logic: "Applied type validation, formatted quotes, calculated risk scores"
                }
            }
        ]
    };

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Transparency Features Demo</h1>
                <p className="text-slate-600">
                    Demonstrating the "glass box" AI transparency components
                </p>
            </div>

            <div className="grid gap-6">
                {/* Confidence Badge Demo */}
                <Card>
                    <CardHeader>
                        <CardTitle>Confidence Score Display</CardTitle>
                        <CardDescription>
                            Color-coded badges with AI justification tooltips
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium mb-2">Example Analysis Result:</p>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">Governance Analysis</h4>
                                    <ConfidenceBadge confidence={mockConfidence} />
                                </div>
                                <p className="text-sm text-slate-600">
                                    This policy demonstrates centralized decision-making with limited stakeholder input.
                                    The governance structure concentrates power in a small board with minimal transparency
                                    requirements for decision-making processes.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-700">Try different confidence levels:</p>
                            <div className="flex flex-wrap gap-2">
                                <ConfidenceBadge confidence={{ score: 92, justification: "Very strong evidence", calculated_at: new Date().toISOString() }} />
                                <ConfidenceBadge confidence={{ score: 70, justification: "Moderate evidence with some ambiguity", calculated_at: new Date().toISOString() }} />
                                <ConfidenceBadge confidence={{ score: 45, justification: "Limited evidence, high uncertainty", calculated_at: new Date().toISOString() }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transparency Dialog Demo */}
                <Card>
                    <CardHeader>
                        <CardTitle>Prompt & Provenance Viewer</CardTitle>
                        <CardDescription>
                            Complete transparency into AI reasoning process
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Show Prompt
                            </Button>
                            <Button onClick={() => setDialogOpen(true)} variant="outline" className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Trace Provenance
                            </Button>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-900">
                                <strong>Note:</strong> This is a demonstration with mock data. In production, these buttons
                                will display the actual prompts and reasoning chains used to generate each analysis.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Phase 1 Features</CardTitle>
                        <CardDescription>
                            Transparency & trust-building components
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">✓ Confidence Scores</h4>
                                <p className="text-xs text-green-700">
                                    AI self-assessment with justification for every insight
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">✓ Show Prompt</h4>
                                <p className="text-xs text-blue-700">
                                    View exact prompts, model versions, and settings used
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">✓ Trace Provenance</h4>
                                <p className="text-xs text-purple-700">
                                    Complete reasoning chain from source to insight
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transparency Dialog */}
            <PromptDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                metadata={mockMetadata}
                provenance={mockProvenance}
            />
        </div>
    );
}
