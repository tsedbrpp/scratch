import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Settings2, Globe, BookOpen, AlertTriangle } from "lucide-react";
import { PositionalityData } from "@/types";

interface PositionalityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: PositionalityData) => void;
}

export function PositionalityDialog({ isOpen, onClose, onConfirm }: PositionalityDialogProps) {
    const [locus, setLocus] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [reflexiveGap, setReflexiveGap] = useState("");
    const [enableCounterNarrative, setEnableCounterNarrative] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleConfirm = async () => {
        if (!locus || !discipline || !reflexiveGap) return;

        setIsSaving(true);
        const data: PositionalityData = {
            locus,
            discipline,
            reflexiveGap,
            enableCounterNarrative
        };

        try {
            // Save to logs
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            await fetch('/api/logs', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    action: "Positionality Calibration",
                    details: {
                        ...data,
                        context: "Pre-Analysis Calibration"
                    }
                })
            });

            onConfirm(data);
            // Reset for next time
            setLocus("");
            setDiscipline("");
            setReflexiveGap("");
            setEnableCounterNarrative(false);
        } catch (error) {
            console.error("Failed to save positionality statement", error);
            onConfirm(data);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <Settings2 className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">System Calibration</span>
                    </div>
                    <DialogTitle className="text-xl">Calibrate Interpretive Lenses</DialogTitle>
                    <DialogDescription>
                        Instant TEA uses your inputs to adjust its "Decolonial Prompts" and flag potential cultural misunderstandings.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Part 1: Locus of Enunciation */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h5 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-500" />
                            Part 1: Locus of Enunciation
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Geographic Locus</Label>
                                <Select value={locus} onValueChange={setLocus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Global North">Global North</SelectItem>
                                        <SelectItem value="Global South">Global South</SelectItem>
                                        <SelectItem value="Indigenous">Indigenous / First Nations</SelectItem>
                                        <SelectItem value="Diasporic">Diasporic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Disciplinary Lens</Label>
                                <Select value={discipline} onValueChange={setDiscipline}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Discipline" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Legal">Legal / Regulatory</SelectItem>
                                        <SelectItem value="Technical">Technical / Engineering</SelectItem>
                                        <SelectItem value="Sociological">Sociological / STS</SelectItem>
                                        <SelectItem value="Activist">Activist / Civil Society</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Part 2: Epistemic Distance */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-slate-500" />
                            Part 2: Epistemic Distance
                        </h5>
                        <div className="space-y-2">
                            <Label className="text-xs">Reflexive Gap Prediction</Label>
                            <p className="text-xs text-slate-500 mb-2">
                                Given your Locus ({locus || "..."}) and the Target Document, what specific concepts might you misinterpret?
                            </p>
                            <Textarea
                                placeholder="e.g., 'I might default to individual privacy definitions instead of communal data rights.'"
                                value={reflexiveGap}
                                onChange={(e) => setReflexiveGap(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>

                    {/* Part 3: Active Calibration */}
                    <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <h5 className="text-sm font-bold text-indigo-900 uppercase flex items-center gap-2">
                            <Settings2 className="h-4 w-4" />
                            Part 3: Active Calibration
                        </h5>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="counter-narrative"
                                checked={enableCounterNarrative}
                                onCheckedChange={(checked: boolean | "indeterminate") => setEnableCounterNarrative(checked === true)}
                                className="mt-1"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="counter-narrative" className="font-semibold text-indigo-900 cursor-pointer">
                                    Enable "Counter-Narrative" Prompts
                                </Label>
                                <p className="text-xs text-indigo-700 leading-relaxed">
                                    Force the AI to re-summarize key findings from the perspective of marginalized actors identified in the text.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!locus || !discipline || !reflexiveGap || isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save & Calibrate Engine
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
