
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ReportSectionSelection } from "@/types/report";
import { Loader2, FileDown } from "lucide-react";

interface ExportReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (selection: ReportSectionSelection) => Promise<void>;
    isGenerating: boolean;
}

export function ExportReportDialog({ open, onOpenChange, onGenerate, isGenerating }: ExportReportDialogProps) {
    const defaultSelection: ReportSectionSelection = {
        documentAnalysis: true,
        comparisonMatrix: true,
        synthesis: true,
        resistance: true,
        ecosystem: true,
        cultural: true,
        ontology: true,
        multiLens: true,
        scenarios: true,
        logs: true,
        configurations: true,
        resistanceArtifacts: true
    };

    const [selection, setSelection] = useState<ReportSectionSelection>(defaultSelection);

    const toggleSection = (key: keyof ReportSectionSelection) => {
        setSelection(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleGenerate = async () => {
        await onGenerate(selection);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Analysis Report</DialogTitle>
                    <DialogDescription>
                        Select the sections you want to include in the generated DOCX report.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="doc"
                                checked={selection.documentAnalysis}
                                onCheckedChange={() => toggleSection('documentAnalysis')}
                            />
                            <Label htmlFor="doc" className="cursor-pointer">Document Analysis (Individual)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="comp"
                                checked={selection.comparisonMatrix}
                                onCheckedChange={() => toggleSection('comparisonMatrix')}
                            />
                            <Label htmlFor="comp" className="cursor-pointer">Comparative Matrix & Governance Compass</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="syn"
                                checked={selection.synthesis}
                                onCheckedChange={() => toggleSection('synthesis')}
                            />
                            <Label htmlFor="syn" className="cursor-pointer">Cross-Case Synthesis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="res"
                                checked={selection.resistance}
                                onCheckedChange={() => toggleSection('resistance')}
                            />
                            <Label htmlFor="res" className="cursor-pointer">Micro-Resistance Analysis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="eco"
                                checked={selection.ecosystem}
                                onCheckedChange={() => toggleSection('ecosystem')}
                            />
                            <Label htmlFor="eco" className="cursor-pointer">Ecosystem & Assemblage Analysis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="cult"
                                checked={selection.cultural}
                                onCheckedChange={() => toggleSection('cultural')}
                            />
                            <Label htmlFor="cult" className="cursor-pointer">Cultural Framing (Discursive Fields)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="ont"
                                checked={selection.ontology}
                                onCheckedChange={() => toggleSection('ontology')}
                            />
                            <Label htmlFor="ont" className="cursor-pointer">Ontological Cartography</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="multi"
                                checked={selection.multiLens}
                                onCheckedChange={() => toggleSection('multiLens')}
                            />
                            <Label htmlFor="multi" className="cursor-pointer">Reflexive Multi-Lens Analysis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="configs"
                                checked={selection.configurations}
                                onCheckedChange={() => toggleSection('configurations')}
                            />
                            <Label htmlFor="configs" className="cursor-pointer">Ecosystem Configurations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="scenarios"
                                checked={selection.scenarios}
                                onCheckedChange={() => toggleSection('scenarios')}
                            />
                            <Label htmlFor="scenarios" className="cursor-pointer">Scenario Analysis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="logs"
                                checked={selection.logs}
                                onCheckedChange={() => toggleSection('logs')}
                            />
                            <Label htmlFor="logs" className="cursor-pointer">Methodological Logs & Reflexivity</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="artifacts"
                                checked={selection.resistanceArtifacts}
                                onCheckedChange={() => toggleSection('resistanceArtifacts')}
                            />
                            <Label htmlFor="artifacts" className="cursor-pointer">Resistance Artifacts (Primary Data)</Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileDown className="mr-2 h-4 w-4" />
                                Generate DOCX
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
