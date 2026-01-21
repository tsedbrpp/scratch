import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { SynthesisTopologyAxis, SynthesisComparisonResult } from '@/types/synthesis';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RelationalAxisMapProps {
    topology: SynthesisComparisonResult['topology_analysis'];
    sourceAName?: string;
    sourceBName?: string;
}

const AxisRow = ({
    data,
    dimension,
    sourceAName = "Source A",
    sourceBName = "Source B"
}: {
    data: SynthesisTopologyAxis;
    dimension: string;
    sourceAName?: string;
    sourceBName?: string;
}) => {
    if (!data) return null;

    // Safety check: ensure scores are numbers
    const rawA = Number(data.a_score);
    const rawB = Number(data.b_score);

    const safeA = isNaN(rawA) ? 5 : Math.max(0, Math.min(10, rawA));
    const safeB = isNaN(rawB) ? 5 : Math.max(0, Math.min(10, rawB));

    // Scale 0-10 to 0-100%
    const posA = (safeA / 10) * 100;
    const posB = (safeB / 10) * 100;

    // Confidence Halo Size (inverse of confidence? or direct?)
    // Higher confidence = smaller, tighter halo. Lower confidence = larger, fuzzy halo.
    const haloSizeA = Math.max(5, (1 - (data.confidence || 0.8)) * 30);

    // Distance for tension line styling
    const distance = Math.abs(posA - posB);

    return (
        <div className="mb-8 relative group">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{dimension}</span>
                    <span className="text-xs text-muted-foreground/70 font-mono">{data.anchors?.low || "0"}</span>
                </div>
                <div className="flex flex-col items-end">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="outline" className="cursor-help hover:bg-muted/50 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Info className="w-3 h-3 mr-1" /> Decision Rule
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md p-4">
                                <p className="font-semibold mb-2 text-xs uppercase">AI Decision Rule:</p>
                                <p className="text-sm italic">"{data.decision_rule || "No explanation provided."}"</p>
                                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                    Confidence: {((data.confidence || 0) * 100).toFixed(0)}%
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className="text-xs text-muted-foreground/70 font-mono">{data.anchors?.high || "10"}</span>
                </div>
            </div>

            <div className="relative h-12 w-full select-none">
                {/* Axis Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border rounded-full transform -translate-y-1/2" />

                {/* Tension Line (Connector) */}
                <div
                    className="absolute top-1/2 h-1 transform -translate-y-1/2 transition-all duration-500"
                    style={{
                        left: `${Math.min(posA, posB)}%`,
                        width: `${Math.abs(posA - posB)}%`,
                        background: `repeating-linear-gradient(90deg, transparent, transparent 4px, ${distance > 20 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.3)'} 4px, ${distance > 20 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.3)'} 8px)`
                    }}
                />

                {/* Point A */}
                <div
                    className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:z-20 transition-all duration-500"
                    style={{ left: `${posA}%` }}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    {/* Confidence Halo */}
                                    <div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10"
                                        style={{ width: `${haloSizeA * 4}px`, height: `${haloSizeA * 4}px` }}
                                    />
                                    {/* Dot */}
                                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-background shadow-sm ring-2 ring-blue-500/20" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <div className="font-bold text-blue-500 mb-1">{sourceAName}</div>
                                <div className="text-xs mb-2">Score: {safeA.toFixed(1)} / 10</div>
                                <div className="text-xs text-muted-foreground border-l-2 border-blue-500 pl-2 italic">
                                    {data.evidence?.a_quotes && data.evidence.a_quotes.length > 0
                                        ? `"${data.evidence.a_quotes[0]}"`
                                        : "No specific quote extracted."}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Point B */}
                <div
                    className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:z-20 transition-all duration-500"
                    style={{ left: `${posB}%` }}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    {/* Confidence Halo (using same generic confidence for now, unless we split confidence per source later) */}
                                    <div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10"
                                        style={{ width: `${haloSizeA * 4}px`, height: `${haloSizeA * 4}px` }}
                                    />
                                    {/* Dot */}
                                    <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-background shadow-sm ring-2 ring-orange-500/20" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <div className="font-bold text-orange-500 mb-1">{sourceBName}</div>
                                <div className="text-xs mb-2">Score: {safeB.toFixed(1)} / 10</div>
                                <div className="text-xs text-muted-foreground border-l-2 border-orange-500 pl-2 italic">
                                    {data.evidence?.b_quotes && data.evidence.b_quotes.length > 0
                                        ? `"${data.evidence.b_quotes[0]}"`
                                        : "No specific quote extracted."}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

            </div>
        </div>
    );
};

export function RelationalAxisMap({
    topology,
    sourceAName = "Source A",
    sourceBName = "Source B"
}: RelationalAxisMapProps) {

    if (!topology) {
        return (
            <Card className="h-full bg-muted/20 border-dashed flex items-center justify-center p-8 text-muted-foreground">
                Topology data not available. Run synthesis to generate.
            </Card>
        );
    }

    // Only render axes that actually have data
    const axes = [
        { key: 'risk', label: 'Risk Definition', data: topology.risk },
        { key: 'governance', label: 'Governance Structure', data: topology.governance },
        { key: 'rights', label: 'Rights Framework', data: topology.rights },
        { key: 'scope', label: 'Territorial Scope', data: topology.scope },
    ].filter(a => a.data);

    return (
        <Card className="h-full border-l-4 border-l-primary/20 shadow-none">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                        Relational Topology
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">{sourceAName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-muted-foreground">{sourceBName}</span>
                        </div>
                    </div>
                </div>
                <CardDescription>
                    Positionality map on key governance axes. Halos indicate AI confidence (larger = less confident).
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="space-y-2">
                    {axes.map(axis => (
                        <AxisRow
                            key={axis.key}
                            dimension={axis.label}
                            data={axis.data}
                            sourceAName={sourceAName}
                            sourceBName={sourceBName}
                        />
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    <span>Hover over points to see evidence. Click specific axes for detailed breakdown.</span>
                </div>
            </CardContent>
        </Card>
    );
}
