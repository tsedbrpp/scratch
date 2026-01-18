import { useState } from "react";
import { AnalysisResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ValidationSectionProps {
    userImpression: string;
    existingValidation?: AnalysisResult['validation_status'];
    sourceTitle?: string;
    analysis: AnalysisResult;
    onValidate?: (status: AnalysisResult['validation_status']) => void;
}

export function ValidationSection({
    userImpression,
    existingValidation,
    sourceTitle,
    analysis,
    onValidate
}: ValidationSectionProps) {
    const [agreement, setAgreement] = useState<"yes" | "no" | null>(existingValidation?.agreement || null);
    const [justification, setJustification] = useState(existingValidation?.justification || "");
    const [isFinalized, setIsFinalized] = useState(!!existingValidation);

    const handleFinalize = async () => {
        if (agreement === 'no' && justification.length < 10) return;

        const status = {
            agreement: agreement!,
            justification: agreement === 'no' ? justification : "Agreed with AI",
            timestamp: new Date().toISOString()
        };

        setIsFinalized(true);
        if (onValidate) {
            onValidate(status);
        }

        // Log the validation (Rich Conflict Resolution Log)
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            // Construct Rich Log
            const logBody = {
                action: "Conflict Resolution Log",
                details: {
                    sessionId: `AUDIT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                    targetDocument: sourceTitle || "Unknown Document",
                    discrepancy: {
                        metric: "Governance Compass (Rhetoric vs Reality)",
                        systemProposition: {
                            placement: analysis.verification_gap?.high_rhetoric_low_verification ? "HIGH_RHETORIC" : "ALIGNED",
                            evidence: analysis.key_insight || "Automated analysis",
                            ontologicalSource: "Instant TEA Default Ontology"
                        },
                        humanAnchor: {
                            placement: "USER_DEFINED",
                            evidence: userImpression,
                            status: "ANCHOR_BIAS_MITIGATED"
                        }
                    },
                    resolution: {
                        action: agreement === 'no' ? "MANUAL_OVERRIDE" : "ACCEPTED_AI",
                        finalValue: agreement === 'no' ? "USER_OVERRIDE" : "AI_CONSENSUS"
                    },
                    justification: {
                        rationale: justification || "User agreed with AI analysis."
                    },
                    reflexivity: {
                        epistemicCaptureFlag: agreement === 'no',
                        systemNote: agreement === 'no'
                            ? "User detected discrepancy between AI interpretation and situated context."
                            : "User validated AI interpretation.",
                        feedbackLoop: agreement === 'no'
                            ? "Log tagged for ontology tuning."
                            : "Reinforcement signal recorded."
                    }
                }
            };

            await fetch('/api/logs', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(logBody)
            });
        } catch (e) {
            console.error("Failed to log validation", e);
        }
    };

    if (isFinalized) {
        return (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-center text-sm font-medium">
                Analysis Validated & Logged.
            </div>
        );
    }

    return (
        <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Human-in-the-Loop Validation</h4>

            <div className="space-y-3">
                <p className="text-sm text-slate-700">Do you agree with the AI&apos;s analysis?</p>
                <div className="flex gap-3">
                    <Button
                        variant={agreement === 'yes' ? "default" : "outline"}
                        onClick={() => setAgreement('yes')}
                        className={agreement === 'yes' ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                        Yes, it aligns
                    </Button>
                    <Button
                        variant={agreement === 'no' ? "default" : "outline"}
                        onClick={() => setAgreement('no')}
                        className={agreement === 'no' ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                        No, I disagree
                    </Button>
                </div>
            </div>

            {agreement === 'no' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-red-800">
                        You must provide a justification for overriding the system:
                    </p>
                    <Textarea
                        placeholder="Explain why the AI analysis is incorrect or incomplete..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="min-h-[80px]"
                    />
                </div>
            )}

            {agreement && (
                <Button
                    onClick={handleFinalize}
                    disabled={agreement === 'no' && justification.length < 10}
                    className="w-full"
                >
                    Finalize & Log Validation
                </Button>
            )}
        </div>
    );
}
