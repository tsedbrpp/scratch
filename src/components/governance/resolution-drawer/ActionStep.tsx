import React from 'react';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EscalationStatus, DeferralReason } from '@/types/escalation';

interface ActionStepProps {
    pathway: 'MITIGATION' | 'JUSTIFICATION' | 'DEFERRAL';
    status: EscalationStatus;
    rationale: string;
    setRationale: (val: string) => void;
    mitigationId: string;
    setMitigationId: (val: string) => void;
    deferralReason: DeferralReason;
    setDeferralReason: (val: DeferralReason) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export const ActionStep: React.FC<ActionStepProps> = ({
    pathway,
    status,
    rationale,
    setRationale,
    mitigationId,
    setMitigationId,
    deferralReason,
    setDeferralReason,
    onSubmit,
    onBack
}) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-semibold text-slate-800">Finalize {pathway}</h3>

            {/* Explanatory Context for Action */}
            <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 border border-slate-100 mb-4">
                {pathway === 'MITIGATION' && "Select a specific strategy to address the identified risks. This action will be logged in the system provenance chain."}
                {pathway === 'JUSTIFICATION' && "Provide a rigorous theoretical defense for the detected ambiguity. This will be recorded as a deliberate 'Override' in the governance log."}
                {pathway === 'DEFERRAL' && "Acknowledge a limitation that prevents immediate resolution. This text will be visibly inscribed in the final export to ensure transparency."}
            </div>

            {/* Suggested Defense / Rationale Templates */}
            {status.rationale?.includes("Ambiguity Context:") && pathway === 'JUSTIFICATION' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 mb-4">
                    <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">
                                Suggested Theoretical Defense
                            </h4>
                            <p className="text-xs text-indigo-700 mb-2 italic">
                                "The system detects a conflict between your descriptive intent and the normative language. You may assert the following defense:"
                            </p>

                            {(() => {
                                let suggestion = "";
                                if (status.rationale?.includes("Hidden Normativity")) {
                                    suggestion = "The identified statement is a descriptive analysis of the policy's structural effects, not a normative endorsement of the regime. The 'normativity' belongs to the subject of study, not the author.";
                                } else if (status.rationale?.includes("Subtle Determinism")) {
                                    suggestion = "The deterministic phrasing reflects the causal logic claimed by the technology itself, effectively quoting its 'internal reality' rather than asserting it as objective truth.";
                                } else {
                                    suggestion = "The ambiguity arises from the complexity of the subject matter, where standard definitions break down. This is an intentional theoretical choice.";
                                }

                                return (
                                    <div className="flex flex-col gap-2">
                                        <div className="bg-white p-2 rounded border border-indigo-200 text-xs text-slate-600 font-mono">
                                            "{suggestion}"
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="self-start text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-100 h-7"
                                            onClick={() => setRationale(suggestion)}
                                        >
                                            Apply Suggestion
                                        </Button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {pathway === 'MITIGATION' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Strategy</label>
                    <Select value={mitigationId} onValueChange={setMitigationId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Strategy..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MITIGATION_CONTEXT">Add Discursive Context</SelectItem>
                            <SelectItem value="MITIGATION_SCOPE">Restrict Policy Scope</SelectItem>
                            <SelectItem value="MITIGATION_ACTORS">Tag Hidden Actors</SelectItem>
                            <SelectItem value="MITIGATION_CUSTOM">Custom Remediation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {pathway === 'DEFERRAL' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Reason for Deferral</label>
                    <Select value={deferralReason} onValueChange={(v) => setDeferralReason(v as DeferralReason)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Reason..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STRUCTURAL_LIMIT">Structural Limit of Corpus</SelectItem>
                            <SelectItem value="SCOPE_LIMIT">Outside Policy Mandate</SelectItem>
                            <SelectItem value="EPISTEMIC_GAP">Acknowledged Epistemic Gap</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">
                    {pathway === 'JUSTIFICATION' ? 'Justification Argument' : 'Remediation Rationale'}
                </label>
                <Textarea
                    placeholder={pathway === 'JUSTIFICATION' ? "Explain why this risk is valid nuance..." : "How does this resolve the identified risk?"}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    className="min-h-[120px] text-sm"
                />
            </div>

            <Button
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                onClick={onSubmit}
                disabled={!rationale || (pathway === 'MITIGATION' && !mitigationId)}
            >
                Commit Resolution <ShieldCheck className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={onBack}>
                Change Pathway
            </Button>

            {/* Action History Section */}
            {status.actions && status.actions.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Provenance / Action History</h4>
                    <div className="space-y-3">
                        {status.actions.map((action, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded text-xs border border-slate-100">
                                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                                    <span>{action.type}</span>
                                    <span className="text-slate-400">{new Date(action.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-500 italic">"{(action as any).rationale || (action as any).reason || "Action logged"}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
