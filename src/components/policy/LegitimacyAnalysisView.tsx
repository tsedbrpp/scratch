import { LegitimacyAnalysis } from "@/types";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";


interface LegitimacyAnalysisViewProps {
    analysis: LegitimacyAnalysis;
}

export function LegitimacyAnalysisView({ analysis }: LegitimacyAnalysisViewProps) {
    if (!analysis || !analysis.orders) return null;

    // Helper to safely render any weird hallucinated structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderSafe = (content: any): React.ReactNode => {
        if (typeof content === 'string' || typeof content === 'number') return content;

        if (Array.isArray(content)) {
            // Check if items are primitive strings/numbers to decide layout
            const isPrimitive = content.every(c => typeof c === 'string' || typeof c === 'number');

            if (isPrimitive) {
                return content.join(", ");
            }

            // For objects (like value-mechanism pairs), render as a vertical stack
            return (
                <div className="flex flex-col gap-2 mt-1">
                    {content.map((c, i) => (
                        <div key={i} className="pl-2 border-l-2 border-slate-200">
                            {renderSafe(c)}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof content === 'object' && content !== null) {
            // Check if it's a known conflict spot structure
            if (content.location && content.description) {
                return (
                    <div className="space-y-1">
                        <span className="font-semibold">{renderSafe(content.location)}: </span>
                        <span>{renderSafe(content.description)}</span>
                    </div>
                );
            }
            // Fallback for unknown objects
            return Object.entries(content).map(([k, v]) => (
                <div key={k} className="text-xs mb-1">
                    <span className="font-semibold capitalize text-slate-600">{k.replace(/_/g, ' ')}:</span><br />
                    <div className="ml-1">{renderSafe(v)}</div>
                </div>
            ));
        }
        return JSON.stringify(content);
    };

    // Helper to extract score from potentially complex object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getScore = (val: any): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0 : parsed;
        }
        if (typeof val === 'object' && val !== null) {
            // gpt-5.1 likes to return { score: 8, evidence: "..." }
            if (val.score) return getScore(val.score);
            if (val.value) return getScore(val.value);
            if (val.strength) return getScore(val.strength);
        }
        return 0;
    };

    const data = [
        { subject: 'Market', A: getScore(analysis.orders.market), fullMark: 10 },
        { subject: 'Industrial', A: getScore(analysis.orders.industrial), fullMark: 10 },
        { subject: 'Civic', A: getScore(analysis.orders.civic), fullMark: 10 },
        { subject: 'Domestic', A: getScore(analysis.orders.domestic), fullMark: 10 },
        { subject: 'Inspired', A: getScore(analysis.orders.inspired), fullMark: 10 },
        { subject: 'Fame', A: getScore(analysis.orders.fame), fullMark: 10 },
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
                            <span className="text-lg font-bold text-slate-900">
                                {renderSafe(analysis.dominant_order)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Justification Logic</h4>
                        <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                            {renderSafe(analysis.justification_logic)}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Moral Vocabulary</h4>
                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(analysis.moral_vocabulary)
                                ? analysis.moral_vocabulary
                                : typeof analysis.moral_vocabulary === 'string'
                                    ? (analysis.moral_vocabulary as string).split(',').map(s => s.trim())
                                    : []
                            ).map((term, i) => (
                                <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                    {renderSafe(term)}
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
                    <CardContent className="text-sm text-amber-900 space-y-2">
                        {renderSafe(analysis.conflict_spot)}
                    </CardContent>
                </Card>
            )}


        </div>
    );
}
