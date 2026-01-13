import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ProvisionalInscription } from '@/types/provisional';
import { FragilityIndicator } from '@/components/ui/provisional-badge';
import { CheckCircle2, AlertTriangle, MessageSquarePlus, ShieldAlert } from 'lucide-react';

interface RatificationControlsProps {
    inscription: ProvisionalInscription;
    onRatify: () => void;
    onContest: (interpretation: string, basis: string) => void;
}

export function RatificationControls({ inscription, onRatify, onContest }: RatificationControlsProps) {
    const [isContesting, setIsContesting] = useState(false);
    const [altInterpretation, setAltInterpretation] = useState("");
    const [theoreticalBasis, setTheoreticalBasis] = useState("");

    const isRatified = inscription.source === "user_validated";

    const handleContestSubmit = () => {
        if (!altInterpretation.trim()) return;
        onContest(altInterpretation, theoreticalBasis);
        setIsContesting(false);
        setAltInterpretation("");
        setTheoreticalBasis("");
    };

    return (
        <Card className="border-l-4 border-l-yellow-400 bg-yellow-50/30">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-yellow-600" />
                        Epistemic Status: {inscription.fragility_score.interpretation.toUpperCase()}
                    </div>
                    {isRatified && (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Ratified
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <FragilityIndicator score={inscription.fragility_score} className="flex-1" />
                    {!isRatified && (
                        <Button size="sm" onClick={onRatify} className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ratify Findings
                        </Button>
                    )}
                </div>

                <div className="text-xs text-slate-600 space-y-2">
                    <p className="font-semibold text-slate-700">Authority Conditions (Requirements for Stability):</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                        {inscription.authority_conditions.map((cond, i) => (
                            <li key={i}>{cond}</li>
                        ))}
                    </ul>
                </div>

                {!isContesting ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsContesting(true)}
                        className="w-full text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                    >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Contest / Add Alternative Interpretation
                    </Button>
                ) : (
                    <div className="space-y-3 bg-white p-3 rounded-md border border-slate-200 animate-in fade-in slide-in-from-top-1">
                        <h4 className="text-xs font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            Contest this Inscription
                        </h4>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Alternative Reading</label>
                            <Textarea
                                value={altInterpretation}
                                onChange={(e) => setAltInterpretation(e.target.value)}
                                placeholder="How else could this be interpreted?"
                                className="text-xs min-h-[60px]"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Theoretical Basis</label>
                            <Textarea
                                value={theoreticalBasis}
                                onChange={(e) => setTheoreticalBasis(e.target.value)}
                                placeholder="e.g., Latour's 'Reassembling the Social', Post-structuralism..."
                                className="text-xs min-h-[40px]"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsContesting(false)} className="h-7 text-xs">Cancel</Button>
                            <Button size="sm" onClick={handleContestSubmit} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white">
                                Submit Contest
                            </Button>
                        </div>
                    </div>
                )}

                {inscription.alternative_interpretations && inscription.alternative_interpretations.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Recorded Contests</p>
                        {inscription.alternative_interpretations.map((alt, i) => (
                            <div key={i} className="bg-white p-2 text-xs border border-slate-100 rounded shadow-sm">
                                <p className="font-medium text-slate-800">"{alt.interpretation}"</p>
                                <p className="text-[10px] text-slate-500 mt-1 italic">Basis: {alt.theoretical_basis}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
