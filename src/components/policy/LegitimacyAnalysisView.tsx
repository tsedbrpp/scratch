import { LegitimacyAnalysis } from "@/types";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { SystemCritiqueSection } from "@/components/common/SystemCritiqueSection";

interface LegitimacyAnalysisViewProps {
    analysis: LegitimacyAnalysis;
}

export function LegitimacyAnalysisView({ analysis }: LegitimacyAnalysisViewProps) {
    if (!analysis || !analysis.orders) return null;

    const data = [
        { subject: 'Market', A: analysis.orders.market, fullMark: 10 },
        { subject: 'Industrial', A: analysis.orders.industrial, fullMark: 10 },
        { subject: 'Civic', A: analysis.orders.civic, fullMark: 10 },
        { subject: 'Domestic', A: analysis.orders.domestic, fullMark: 10 },
        { subject: 'Inspired', A: analysis.orders.inspired, fullMark: 10 },
        { subject: 'Fame', A: analysis.orders.fame, fullMark: 10 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Radar Chart */}
                <div className="w-full md:w-1/2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                            <Radar
                                name="Legitimacy"
                                dataKey="A"
                                stroke="#4f46e5"
                                strokeWidth={2}
                                fill="#6366f1"
                                fillOpacity={0.4}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Analysis Details */}
                <div className="w-full md:w-1/2 space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Dominant Order</h4>
                        <div className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-indigo-600" />
                            <span className="text-lg font-bold text-slate-900">{analysis.dominant_order}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Justification Logic</h4>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                            {analysis.justification_logic}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Moral Vocabulary</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.moral_vocabulary?.map((term, i) => (
                                <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                    {term}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Conflict Spot */}
            {analysis.conflict_spot && (
                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                            ⚠️ Conflict Spot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-amber-900">
                            {analysis.conflict_spot}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* System Critique (Devil's Advocate) */}
            {analysis.system_critique && (
                <SystemCritiqueSection critique={analysis.system_critique} />
            )}
        </div>
    );
}
