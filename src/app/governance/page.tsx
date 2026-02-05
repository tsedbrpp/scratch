"use client";

import { useState, useMemo } from 'react';
import { Source } from '@/types';
import { useSources } from '@/hooks/useSources';
import { FrameworkRadar } from '@/components/governance/FrameworkRadar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ComparisonField = 'governance_power_accountability' | 'plurality_inclusion_embodiment' | 'agency_codesign_self_determination' | 'reflexivity_situated_praxis';

// --- Sub-components (extracted for optimization) ---

const ComparisonSection = ({
    field,
    leftSource,
    rightSource
}: {
    field: ComparisonField,
    leftSource?: Source | null,
    rightSource?: Source | null
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className={`border-l-4 ${leftSource ? 'border-l-indigo-500' : 'border-slate-200'}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    {leftSource?.title || "Select Source 1"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {leftSource?.analysis?.[field] || <span className="text-slate-400 italic">No data available</span>}
                </div>
            </CardContent>
        </Card>

        <Card className={`border-l-4 ${rightSource ? 'border-l-emerald-500' : 'border-slate-200'}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    {rightSource?.title || "Select Source 2"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {rightSource?.analysis?.[field] || <span className="text-slate-400 italic">Select a second source to compare</span>}
                </div>
            </CardContent>
        </Card>
    </div>
);

const RiskBox = ({ source, colorLogic }: { source?: Source | null, colorLogic: (l?: string) => string }) => {
    const riskData = source?.analysis?.structural_pillars?.risk;
    const badge = riskData?.badge || "Unknown";

    return (
        <div className={`p-4 rounded-lg border flex flex-col gap-2 ${colorLogic(badge === "High Risk" ? "High" : "Low")}`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm">{riskData?.title || "Risk Classification"}</h4>
                <Badge variant="outline">{badge}</Badge>
            </div>
            <p className="text-xs mt-1">{riskData?.description || "No specific risk classification found."}</p>
            {riskData?.quote && (
                <div className="mt-2 text-xs italic border-l-2 border-inherit pl-2 opacity-80">
                    &quot;{riskData.quote}&quot;
                </div>
            )}
        </div>
    );
};

export default function ResourceOrchestrationPage() {
    const { sources, isLoading } = useSources();
    const [leftSourceId, setLeftSourceId] = useState<string | null>(null);
    const [rightSourceId, setRightSourceId] = useState<string | null>(null);

    // Initialize state with first available sources
    useMemo(() => {
        if (!isLoading && sources.length > 0) {
            if (!leftSourceId) setLeftSourceId(sources[0].id);
            if (!rightSourceId && sources.length > 1) setRightSourceId(sources[1].id);
        }
    }, [isLoading, sources, leftSourceId, rightSourceId]);

    const leftSource = useMemo(() => sources.find(s => s.id === leftSourceId), [sources, leftSourceId]);
    const rightSource = useMemo(() => sources.find(s => s.id === rightSourceId), [sources, rightSourceId]);

    // Prepare Radar Data
    const radarData = useMemo(() => {
        if (!leftSource) return [];

        const dimensions = [
            { key: 'centralization', label: 'Centralization' },
            { key: 'rights_focus', label: 'Rights Focus' },
            { key: 'flexibility', label: 'Flexibility' },
            { key: 'market_power', label: 'Market Power' },
            { key: 'procedurality', label: 'Procedural' },
        ];

        return dimensions.map(dim => ({
            dimension: dim.label,
            A: leftSource.analysis?.governance_scores?.[dim.key as keyof typeof leftSource.analysis.governance_scores] || 0,
            B: rightSource?.analysis?.governance_scores?.[dim.key as keyof typeof rightSource.analysis.governance_scores] || 0,
            fullMark: 100
        }));
    }, [leftSource, rightSource]);

    const getRiskColor = (level?: string) => {
        switch (level) {
            case 'High': return 'border-red-500 bg-red-50 text-red-900';
            case 'Medium': return 'border-amber-500 bg-amber-50 text-amber-900';
            case 'Low': return 'border-emerald-500 bg-emerald-50 text-emerald-900';
            default: return 'border-slate-200 bg-white text-slate-500';
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-light text-slate-900 mb-2">Resource Orchestration</h1>
                <p className="text-slate-500 mb-8">Comparative analysis of governance mechanisms across AI frameworks.</p>

                {/* Controls */}
                <Card className="mb-8 border-slate-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 w-full">
                            <span className="text-sm font-semibold text-slate-600 w-32 shrink-0">Framework Comparison</span>
                            <Select value={leftSourceId || ""} onValueChange={setLeftSourceId}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Select Source 1" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sources.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={rightSourceId || ""} onValueChange={setRightSourceId}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Select Source 2 (Optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {sources.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Radar Chart */}
                <div className="mb-12 h-[400px] w-full bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <FrameworkRadar
                        data={radarData}
                        labelA={leftSource?.title || "Source A"}
                        labelB={rightSource?.title || "Source B"}
                        selectedSourceB={rightSourceId || undefined}
                    />
                </div>

                {/* Grounded Insights Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1 rounded bg-purple-100 text-purple-600">
                        <Info className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800">Grounded Governance Insights</h2>
                    <Badge variant="secondary" className="text-xs">Original</Badge>
                </div>

                {/* Comparison Sections */}
                <div className="space-y-12">
                    {/* 1. Governance & Power */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            Governance & Power
                        </h3>
                        <ComparisonSection field="governance_power_accountability" leftSource={leftSource} rightSource={rightSource} />
                    </div>

                    {/* 2. Plurality & Inclusion */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            Plurality & Inclusion
                        </h3>
                        <ComparisonSection field="plurality_inclusion_embodiment" leftSource={leftSource} rightSource={rightSource} />
                    </div>

                    {/* 3. Agency & Co-Design */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            Agency & Co-Design
                        </h3>
                        <ComparisonSection field="agency_codesign_self_determination" leftSource={leftSource} rightSource={rightSource} />
                    </div>

                    {/* 4. Reflexivity */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            Reflexivity
                        </h3>
                        <ComparisonSection field="reflexivity_situated_praxis" leftSource={leftSource} rightSource={rightSource} />
                    </div>
                </div>

                {/* Risk Classification */}
                <div className="mt-12 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-slate-600" />
                    <h2 className="text-xl font-bold text-slate-800">Risk Classification</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <RiskBox source={leftSource} colorLogic={getRiskColor} />
                    <RiskBox source={rightSource} colorLogic={getRiskColor} />
                </div>

                {/* Enforcement Bodies */}
                <div className="mt-12 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-slate-600" />
                    <h2 className="text-xl font-bold text-slate-800">Enforcement Bodies</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Left Enforcement */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <CardTitle className="text-xs uppercase text-slate-400">{leftSource?.title}</CardTitle>
                                {leftSource?.analysis?.structural_pillars?.enforcement?.badge && <Badge>{leftSource.analysis.structural_pillars.enforcement.badge}</Badge>}
                            </div>
                            <h4 className="font-bold text-sm mt-1">{leftSource?.analysis?.structural_pillars?.enforcement?.title || "Enforcement Bodies"}</h4>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">{leftSource?.analysis?.structural_pillars?.enforcement?.description}</p>
                        </CardContent>
                    </Card>
                    {/* Right Enforcement */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <CardTitle className="text-xs uppercase text-slate-400">{rightSource?.title}</CardTitle>
                                {rightSource?.analysis?.structural_pillars?.enforcement?.badge && <Badge>{rightSource.analysis.structural_pillars.enforcement.badge}</Badge>}
                            </div>
                            <h4 className="font-bold text-sm mt-1">{rightSource?.analysis?.structural_pillars?.enforcement?.title || "Enforcement Bodies"}</h4>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">{rightSource?.analysis?.structural_pillars?.enforcement?.description}</p>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </div>
    );
}
