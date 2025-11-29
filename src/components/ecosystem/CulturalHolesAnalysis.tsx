import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, Users } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CulturalHolesAnalysisResult, CulturalHole } from '@/types/ecosystem';

interface CulturalHolesAnalysisProps {
    culturalHoles: CulturalHolesAnalysisResult | null;
    isAnalyzingHoles: boolean;
    onAnalyze: () => void;
}

export function CulturalHolesAnalysis({ culturalHoles, isAnalyzingHoles, onAnalyze }: CulturalHolesAnalysisProps) {
    return (
        <Card className="min-h-[300px] flex flex-col">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-600" />
                        <CardTitle>Cultural Holes & Disconnects</CardTitle>
                    </div>
                    <Button size="sm" variant="outline" onClick={onAnalyze} disabled={isAnalyzingHoles}>
                        {isAnalyzingHoles ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Analyze Holes"
                        )}
                    </Button>
                </div>
                <CardDescription>
                    Identifying semantic distance and missing links between actor communities.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 bg-slate-50/50 p-6 border-t">
                {culturalHoles ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-slate-700">Connectivity Score</h4>
                            <Badge variant={culturalHoles.overall_connectivity_score > 0.7 ? "default" : "destructive"}>
                                {(culturalHoles.overall_connectivity_score * 100).toFixed(0)}%
                            </Badge>
                        </div>

                        <ConceptCloud holes={culturalHoles.holes} />

                        <div className="space-y-4">
                            {culturalHoles.holes?.map((hole: CulturalHole, i: number) => (
                                <div key={i} className="bg-white p-4 rounded-md border border-amber-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-amber-700 text-sm">{hole.concept}</span>
                                        <Badge variant="outline" className="text-xs">{hole.significance}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-2">{hole.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>Between:</span>
                                        {hole.between?.map((g: string) => (
                                            <Badge key={g} variant="secondary" className="text-[10px] h-5">{g}</Badge>
                                        ))}
                                    </div>
                                    <CulturalHoleChart hole={hole} />
                                </div>
                            ))}
                        </div>

                        {culturalHoles.recommendations?.length > 0 && (
                            <div className="pt-4 border-t border-slate-200">
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Bridging Recommendations</h4>
                                <ul className="space-y-2">
                                    {culturalHoles.recommendations.map((rec: { role: string; action: string }, i: number) => (
                                        <li key={i} className="text-xs text-slate-600 flex gap-2">
                                            <span className="font-bold text-indigo-600">• {rec.role}:</span>
                                            {rec.action}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-400 py-8">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No analysis yet.</p>
                        <p className="text-xs mt-1">Click "Analyze Holes" to detect disconnects.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CulturalHoleChart({ hole }: { hole: CulturalHole }) {
    if (!hole.scores) return null;

    const data = Object.entries(hole.scores).map(([name, score]) => ({
        name,
        score: score as number
    }));

    return (
        <div className="mt-4 h-[150px] w-full">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Concept Affinity Gap</p>
                <div className="flex gap-2 text-[9px] text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>High Affinity</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>Low Affinity</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 10]} hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score < 5 ? '#f59e0b' : '#3b82f6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function ConceptCloud({ holes }: { holes: CulturalHole[] }) {
    if (!holes || holes.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            {holes.map((hole, i) => {
                const size = hole.significance === 'High' ? 'text-lg' : hole.significance === 'Medium' ? 'text-sm' : 'text-xs';
                const weight = hole.significance === 'High' ? 'font-bold' : 'font-medium';
                const opacity = hole.significance === 'High' ? 'opacity-100' : 'opacity-70';

                return (
                    <span key={i} className={`${size} ${weight} ${opacity} text-indigo-600 bg-white px-2 py-1 rounded-full border border-indigo-100 shadow-sm`}>
                        {hole.concept}
                    </span>
                );
            })}
        </div>
    );
}
