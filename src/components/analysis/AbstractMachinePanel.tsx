import React from "react";
import { AbstractMachineAnalysis } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, AlertCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AbstractMachinePanelProps {
    analysis: AbstractMachineAnalysis;
}

export function AbstractMachinePanel({ analysis }: AbstractMachinePanelProps) {
    if (!analysis) return null;

    const saveAsJson = () => {
        const dataStr = JSON.stringify(analysis, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        // Use a descriptive filename based on the current date
        link.download = `abstract_machine_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <Sparkles className="h-6 w-6 text-violet-600" />
                        Abstract Machine (The Diagram)
                        {analysis.version && <Badge variant="outline" className="text-[10px] ml-2">v{analysis.version}</Badge>}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        Extracts the underlying virtual rules, structural operators, and double articulations governing the assemblage.
                    </p>
                    {analysis.metadata && (
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                            <span>Confidence: {(analysis.metadata.overall_confidence * 100).toFixed(0)}%</span>
                            <span>•</span>
                            <span>{new Date(analysis.metadata.extraction_timestamp).toLocaleString()}</span>
                        </div>
                    )}
                </div>
                <Button variant="outline" size="sm" onClick={saveAsJson} className="flex gap-2">
                    <Download className="h-4 w-4" />
                    Save JSON
                </Button>
            </div>

            {/* 1. The Diagram (Operators, Constraints, Transformations) */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">I. The Diagram</h3>

                {/* Operators */}
                {analysis.diagram.operators && analysis.diagram.operators.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {analysis.diagram.operators.map((op) => (
                            <Card key={op.id} className="border-violet-100 shadow-sm">
                                <CardHeader className="pb-2 bg-violet-50/50">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-md font-mono text-violet-800 flex items-center gap-2">
                                            {op.name}()
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[10px] bg-white border-violet-200 text-violet-600">Operator</Badge>
                                    </div>
                                    <CardDescription className="text-sm font-medium text-slate-700 mt-1">{op.definition}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Inputs</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {op.inputs.map(i => <Badge key={i} variant="secondary" className="text-[10px]">{i}</Badge>)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Outputs</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {op.outputs.map(o => <Badge key={o} variant="default" className="bg-violet-600 text-[10px]">{o}</Badge>)}
                                            </div>
                                        </div>
                                    </div>

                                    {op.constraints && op.constraints.length > 0 && (
                                        <div>
                                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Constraints</span>
                                            <ul className="list-disc list-inside text-xs text-slate-600 mt-1">
                                                {op.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {op.supporting_quotes && op.supporting_quotes.length > 0 && (
                                        <div className="bg-slate-50 p-2 rounded-md border border-slate-100 mt-2">
                                            <div className="flex items-start gap-2">
                                                <Quote className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                                                <div className="space-y-1">
                                                    {op.supporting_quotes.map((q, i) => (
                                                        <p key={i} className="text-[11px] text-slate-600 italic">"{q.quote}"</p>
                                                    ))}
                                                    <p className="text-[10px] text-violet-600 font-medium mt-1">{op.interpretive_link}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Global Constraints & Transformations */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Constraints */}
                    {analysis.diagram.constraints && analysis.diagram.constraints.length > 0 && (
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-800">Global Constraints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {analysis.diagram.constraints.map((c) => (
                                        <li key={c.id} className="text-sm text-slate-700">
                                            <div className="font-medium mb-1">{c.rule}</div>
                                            {c.supporting_quotes && c.supporting_quotes.length > 0 && (
                                                <div className="text-[11px] text-slate-500 italic border-l-2 border-slate-300 pl-2">
                                                    "{c.supporting_quotes[0].quote}"
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Transformations */}
                    {analysis.diagram.transformations && analysis.diagram.transformations.length > 0 && (
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-800">State Transformations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.diagram.transformations.map((t, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-md border border-slate-100">
                                            <Badge variant="outline" className="bg-white">{t.from}</Badge>
                                            <span className="text-slate-400">→</span>
                                            <Badge variant="outline" className="bg-white border-violet-200 text-violet-700">{t.to}</Badge>
                                            <span className="text-[10px] text-slate-500 italic ml-auto">via {t.trigger}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* 2. Double Articulation */}
            {analysis.double_articulation && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 pb-2">II. Double Articulation</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="shadow-sm border-amber-100">
                            <CardHeader className="bg-amber-50/50 pb-2">
                                <CardTitle className="text-sm font-bold text-amber-800">Content (Machinic Assemblage)</CardTitle>
                                <CardDescription className="text-xs">Bodies, actions, and physical states.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ul className="text-sm text-slate-700 space-y-2">
                                    {analysis.double_articulation.content_strata.map((item) => (
                                        <li key={item.id} className="border-l-2 border-amber-300 pl-2">
                                            <span className="font-semibold">{item.id}</span>: {item.description}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-sky-100">
                            <CardHeader className="bg-sky-50/50 pb-2">
                                <CardTitle className="text-sm font-bold text-sky-800">Expression (Collective Assemblage of Enunciation)</CardTitle>
                                <CardDescription className="text-xs">Signs, labels, narratives, and laws.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ul className="text-sm text-slate-700 space-y-2">
                                    {analysis.double_articulation.expression_strata.map((item) => (
                                        <li key={item.id} className="border-l-2 border-sky-300 pl-2">
                                            <span className="font-semibold">{item.id}</span>: {item.description}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resonances & Clashes */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {analysis.double_articulation.resonances && analysis.double_articulation.resonances.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest pl-1">Resonances</h4>
                                {analysis.double_articulation.resonances.map((r, idx) => (
                                    <div key={idx} className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-amber-900">{r.content_id}</span>
                                            <span className="text-emerald-400">↔</span>
                                            <span className="font-semibold text-sky-900">{r.expression_id}</span>
                                        </div>
                                        <p className="text-emerald-800 text-xs">{r.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {analysis.double_articulation.clashes && analysis.double_articulation.clashes.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-widest pl-1">Clashes</h4>
                                {analysis.double_articulation.clashes.map((c, idx) => (
                                    <div key={idx} className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-amber-900">{c.content_id}</span>
                                            <span className="text-rose-400 font-bold">VS</span>
                                            <span className="font-semibold text-sky-900">{c.expression_id}</span>
                                        </div>
                                        <p className="text-rose-800 text-xs">{c.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Affective Capacities & Limits */}
            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-200">
                {analysis.affective_capacities && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-800 pb-1 border-b">III. Affective Capacities</h3>
                        <div className="space-y-2">
                            {analysis.affective_capacities.map((ac, idx) => (
                                <div key={idx} className="bg-white border text-sm border-slate-200 p-3 rounded-lg shadow-sm">
                                    <div className="font-bold text-slate-900 mb-1">{ac.capacity}</div>
                                    <div className="text-xs font-mono text-slate-500 mb-2">Mechanism: {ac.mechanism}</div>
                                    <div className="text-slate-600 mt-1 pl-2 border-l-2 border-violet-200">{ac.note}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {analysis.limits && analysis.limits.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-800 pb-1 border-b text-rose-800 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Limits & Omissions
                        </h3>
                        <ul className="space-y-2">
                            {analysis.limits.map((limit, idx) => (
                                <li key={idx} className="bg-rose-50/50 text-rose-900 border border-rose-100 text-sm p-3 rounded-lg text-sm shadow-sm">
                                    {limit}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

        </div>
    );
}
