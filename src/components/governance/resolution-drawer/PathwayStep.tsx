import React from 'react';
import { CheckCircle, AlertTriangle, FileWarning, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PathwayStepProps {
    pathway: 'MITIGATION' | 'JUSTIFICATION' | 'DEFERRAL';
    setPathway: (pathway: 'MITIGATION' | 'JUSTIFICATION' | 'DEFERRAL') => void;
    onContinue: () => void;
    onBack: () => void;
}

export const PathwayStep: React.FC<PathwayStepProps> = ({
    pathway,
    setPathway,
    onContinue,
    onBack
}) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-semibold text-slate-800">Select Resolution Pathway</h3>

            <div
                onClick={() => setPathway('MITIGATION')}
                className={cn("p-4 border rounded-lg cursor-pointer transition-all hover:bg-slate-50", pathway === 'MITIGATION' ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200")}
            >
                <div className="flex items-center gap-3 mb-1">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-slate-800">Mitigate / Fix</span>
                </div>
                <p className="text-xs text-slate-500 pl-8">Materially improve the analysis by adding context, tagging actors, or refining scope.</p>
            </div>

            <div
                onClick={() => setPathway('JUSTIFICATION')}
                className={cn("p-4 border rounded-lg cursor-pointer transition-all hover:bg-slate-50", pathway === 'JUSTIFICATION' ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200")}
            >
                <div className="flex items-center gap-3 mb-1">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="font-bold text-slate-800">Justify Override</span>
                </div>
                <p className="text-xs text-slate-500 pl-8">Explain why the ambiguity is valid in this context (e.g., philosophical nuance).</p>
            </div>

            <div
                onClick={() => setPathway('DEFERRAL')}
                className={cn("p-4 border rounded-lg cursor-pointer transition-all hover:bg-slate-50", pathway === 'DEFERRAL' ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200")}
            >
                <div className="flex items-center gap-3 mb-1">
                    <FileWarning className="h-5 w-5 text-slate-600" />
                    <span className="font-bold text-slate-800">Reflective Deferral</span>
                </div>
                <p className="text-xs text-slate-500 pl-8">Acknowledge a structural limit or scope constraint. This will be inscribed in the final report.</p>
            </div>

            <Button className="w-full mt-4" onClick={onContinue}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={onBack}>
                Back to Findings
            </Button>
        </div>
    );
};
