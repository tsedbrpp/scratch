
"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShieldCheck, Info, Globe, Loader2, Layers, Compass, TrendingUp, TrendingDown } from 'lucide-react';
import { AssemblageAnalysis, EcosystemActor, ReflexiveLogEntry } from '@/types/ecosystem';
import { FragilityIndicator } from '@/components/ui/provisional-badge';
import { RatificationControls } from './RatificationControls';
import { ReflexiveLog } from './ReflexiveLog';
import { Button } from '@/components/ui/button';

interface AssemblageAnalysisViewProps {
    analysis: AssemblageAnalysis;
    actors?: EcosystemActor[];
    reflexiveLogs?: ReflexiveLogEntry[];
    onAddLog?: (entry: ReflexiveLogEntry) => void;
    onDeleteLog?: (entryId: string) => void;
    onRatify?: () => void;
    onContest?: (interpretation: string, basis: string) => void;
    onEnrichLinks?: () => void;
    isEnriching?: boolean;
    enrichProgress?: number;
}

export function AssemblageAnalysisView({
    analysis,
    actors = [],
    reflexiveLogs,
    onAddLog,
    onDeleteLog,
    onRatify,
    onContest,
    onEnrichLinks,
    isEnriching = false,
    enrichProgress = 0
}: AssemblageAnalysisViewProps) {
    return (
        <Tabs defaultValue="critique" className="w-full">
            <TabsList className={`grid w-full ${reflexiveLogs ? 'grid-cols-5' : 'grid-cols-4'} bg-slate-100/50 p-1 mb-4 h-auto`}>
                <TabsTrigger value="critique" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Critique
                </TabsTrigger>
                <TabsTrigger value="actants" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Actants
                </TabsTrigger>
                <TabsTrigger value="mechanisms" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Mechanisms
                </TabsTrigger>
                <TabsTrigger value="relations" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Relations
                </TabsTrigger>
                <TabsTrigger value="trajectory" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Trajectory
                </TabsTrigger>
                <TabsTrigger value="stress_test" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    Stress Test
                </TabsTrigger>
                {reflexiveLogs && (
                    <TabsTrigger value="journal" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                        Journal
                    </TabsTrigger>
                )}
            </TabsList>

            {reflexiveLogs && onAddLog && onDeleteLog && (
                <TabsContent value="journal" className="space-y-4 h-[400px]">
                    <ReflexiveLog
                        logs={reflexiveLogs}
                        onAddLog={onAddLog}
                        onDeleteLog={onDeleteLog}
                    />
                </TabsContent>
            )}

            <TabsContent value="critique" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">Understanding the Critique</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            This panel uses <span className="font-semibold text-indigo-600">Assemblage Theory</span> to deconstruct the policy document.
                            It highlights the <span className="italic">Provisional Status</span> (yellow = Simulated, green = Ratified) and identifies <span className="font-semibold text-red-600">Structural Voids</span>—actors or issues the policy explicitly excludes.
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-xs italic">
                    &quot;{analysis.narrative}&quot;
                    {analysis.provisional_status && (
                        <div className="mt-2 pt-2 border-t border-amber-200">
                            <FragilityIndicator score={analysis.provisional_status.fragility_score} />
                        </div>
                    )}
                </div>

                {/* Ratification Controls */}
                {analysis.provisional_status && onRatify && onContest && (
                    <div className="mt-4">
                        <RatificationControls
                            inscription={analysis.provisional_status}
                            onRatify={onRatify}
                            onContest={onContest}
                        />
                    </div>
                )}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Excluded Voices</h4>
                    <div className="space-y-2">
                        {analysis.missing_voices?.map((mv, i) => (
                            <div key={i} className="bg-white p-2 rounded border border-slate-200 shadow-sm flex justify-between gap-2">
                                <div>
                                    <span className="font-semibold text-xs text-slate-900 block">{mv.name}</span>
                                    <p className="text-[10px] text-slate-500">{mv.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Structural Voids List */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Structural Voids</h4>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {analysis.structural_voids?.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                </div>

                {/* System Critique (Comprehensive Scan) */}
                {analysis.system_critique && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-4">
                        <h4 className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Critical Voids Report
                        </h4>

                        {/* Handle String or Object */}
                        {typeof analysis.system_critique === 'string' ? (
                            <p className="text-xs text-red-900 whitespace-pre-wrap leading-relaxed">
                                {analysis.system_critique}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {analysis.system_critique.critique && (
                                    <p className="text-xs text-red-900 whitespace-pre-wrap leading-relaxed">
                                        {analysis.system_critique.critique}
                                    </p>
                                )}

                                {analysis.system_critique.blind_spots && analysis.system_critique.blind_spots.length > 0 && (
                                    <div>
                                        <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">Detected Blind Spots</span>
                                        <ul className="list-disc list-inside text-xs text-red-800 space-y-1 pl-1">
                                            { }
                                            {analysis.system_critique.blind_spots.map((bs: any, i: number) => (
                                                <li key={i}>{typeof bs === 'string' ? bs : bs.title || bs.description || JSON.stringify(bs)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.system_critique.over_interpretation && (
                                    <div className="bg-white/50 p-2 rounded border border-red-200">
                                        <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">Over-Interpretation Check</span>
                                        <p className="text-xs text-red-800">
                                            {Array.isArray(analysis.system_critique.over_interpretation)
                                                ? analysis.system_critique.over_interpretation.join(' ')
                                                : analysis.system_critique.over_interpretation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="actants" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-slate-700">Understanding Actants</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            In ANT, agency is distributed. This tab traces both <span className="font-semibold text-indigo-600">Human Actors</span> and <span className="font-semibold text-indigo-600">Non-Human Actants</span> (infrastructures, protocols, discourses) that enforce the system&apos;s logic.
                        </p>
                    </div>
                </div>



                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Involved Actors</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto mb-4 border rounded p-2 bg-slate-50">
                        {actors && actors.length > 0 ? (
                            actors.map(actor => (
                                <div key={actor.id} className="flex items-center justify-between text-xs bg-white p-2 border border-slate-100 rounded shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${['algorithm', 'infrastructure', 'technology'].some(t => actor.type.toLowerCase().includes(t)) ? 'bg-slate-400' :
                                            ['law', 'regulation'].some(t => actor.type.toLowerCase().includes(t)) ? 'bg-indigo-400' :
                                                'bg-emerald-400'
                                            }`} />
                                        <span className="font-medium text-slate-700">{actor.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 uppercase">{actor.type}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 italic p-2">No specific actors linked to this assemblage.</p>
                        )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Infrastructures (Detected)</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {analysis.socio_technical_components?.infra?.map((inf, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                                {inf}
                            </span>
                        )) || <p className="text-xs text-slate-400">No infrastructures detected.</p>}
                    </div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Discourses (Detected)</h4>
                    <div className="space-y-2">
                        {analysis.socio_technical_components?.discourse?.map((d, i) => (
                            <p key={i} className="text-xs text-slate-600 border-l-2 border-indigo-200 pl-2">
                                {d}
                            </p>
                        )) || <p className="text-xs text-slate-400">No discourses detected.</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="relations" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">Relations of Exteriority</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            How portable is this system? <span className="font-semibold text-green-600">Detachable</span> components (e.g., standard servers) can move easily. <span className="font-semibold text-red-600">Embedded</span> components (e.g., specific cultural narratives) are stuck in place.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase">Mobility Score</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${analysis.relations_of_exteriority?.mobility_score === "High" ? "bg-green-100 text-green-700" :
                            analysis.relations_of_exteriority?.mobility_score === "Low" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                            }`}>
                            {analysis.relations_of_exteriority?.mobility_score || "Unknown"}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3">
                        High exteriority means components can be easily detached and reused in other assemblages.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-green-600 block border-b border-green-100 pb-1">Detachable</span>
                            {analysis.relations_of_exteriority?.detachable?.length ? (
                                analysis.relations_of_exteriority?.detachable.map((item, i) => (
                                    <p key={i} className="text-xs text-slate-600 pl-1">{item}</p>
                                ))
                            ) : <p className="text-[10px] text-slate-400 italic">None identified</p>}
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-red-600 block border-b border-red-100 pb-1">Embedded (Interior)</span>
                            {analysis.relations_of_exteriority?.embedded?.length ? (
                                analysis.relations_of_exteriority?.embedded.map((item, i) => (
                                    <p key={i} className="text-xs text-slate-600 pl-1">{item}</p>
                                ))
                            ) : <p className="text-[10px] text-slate-400 italic">None identified</p>}
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Origin Concepts
                    </h4>
                    <p className="text-[10px] text-blue-700 italic mb-2">Global norms or models imported into this assemblage (e.g., &quot;Risk-Based Approach&quot;).</p>
                    <ul className="list-disc list-inside text-xs text-blue-900 space-y-1">
                        {analysis.policy_mobilities?.origin_concepts?.map((c, i) => <li key={i}>{c}</li>) || <li>None detected</li>}
                    </ul>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Local Mutations</h4>
                    <p className="text-[10px] text-emerald-700 italic mb-2">How global concepts are adapted or twisted to fit local power structures.</p>
                    <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
                        {analysis.policy_mobilities?.local_mutations?.map((m, i) => <li key={i}>{m}</li>) || <li>None detected</li>}
                    </ul>
                </div>
            </TabsContent>

            <TabsContent value="mechanisms" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">Stabilization Mechanisms</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Assemblages naturally fall apart (entropy). These are the active <span className="font-semibold text-indigo-600">Mechanisms</span> (audits, fines, templates, rituals) that hold the network together and prevent &quot;lines of flight&quot;.
                        </p>
                    </div>
                </div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stabilization Mechanisms</h4>
                <p className="text-xs text-slate-500 mb-2">How this assemblage holds together against disruption:</p>
                <div className="space-y-2">
                    {analysis.stabilization_mechanisms?.map((mech, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <ShieldCheck className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                            <span>{mech}</span>
                        </div>
                    )) || <p className="text-xs text-slate-400">No mechanisms detected.</p>}
                </div>

                {/* Realist Interpretation (Comprehensive Scan) */}
                {analysis.realist_narrative && (
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-4">
                        <h4 className="text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center gap-1">
                            <Layers className="h-3 w-3" /> Realist Interpretation
                        </h4>
                        <p className="text-xs text-indigo-900 whitespace-pre-wrap leading-relaxed">
                            {analysis.realist_narrative}
                        </p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="trajectory" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <div className="bg-purple-100 p-1 rounded">
                        <Compass className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-slate-700">Temporal Trajectory</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Assemblages are not static; they are strictly <span className="italic">historical</span>. This panel forecasts whether the territory is <span className="font-semibold text-green-600">Stabilizing</span> (becoming a fortress) or <span className="font-semibold text-red-600">Collapsing</span> (leaking via Lines of Flight).
                        </p>
                    </div>
                </div>

                {!analysis.trajectory_analysis ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-lg text-slate-400">
                        <Compass className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-xs">No trajectory data found.</p>
                        <p className="text-[10px] italic mt-1">Run "Comprehensive Analysis" to generate.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Forecast Banner */}
                        <div className={`p-4 rounded-lg border flex items-center gap-4 ${analysis.trajectory_analysis.forecast === 'Stabilizing' ? 'bg-green-50 border-green-200' :
                            analysis.trajectory_analysis.forecast === 'Collapsing' ? 'bg-red-50 border-red-200' :
                                'bg-purple-50 border-purple-200'
                            }`}>
                            <div className={`p-2 rounded-full ${analysis.trajectory_analysis.forecast === 'Stabilizing' ? 'bg-green-100 text-green-700' :
                                analysis.trajectory_analysis.forecast === 'Collapsing' ? 'bg-red-100 text-red-700' :
                                    'bg-purple-100 text-purple-700'
                                }`}>
                                {analysis.trajectory_analysis.forecast === 'Stabilizing' ? <ShieldCheck className="h-6 w-6" /> :
                                    analysis.trajectory_analysis.forecast === 'Collapsing' ? <TrendingDown className="h-6 w-6" /> :
                                        <TrendingUp className="h-6 w-6" />}
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold uppercase ${analysis.trajectory_analysis.forecast === 'Stabilizing' ? 'text-green-800' :
                                    analysis.trajectory_analysis.forecast === 'Collapsing' ? 'text-red-800' :
                                        'text-purple-800'
                                    }`}>
                                    Forecast: {analysis.trajectory_analysis.forecast}
                                </h3>
                                <p className="text-xs opacity-80 text-black">
                                    {analysis.trajectory_analysis.forecast === 'Stabilizing' ? 'Reterritorialization dominant. Boundaries hardening.' :
                                        analysis.trajectory_analysis.forecast === 'Collapsing' ? 'Deterritorialization dominant. Structure failing.' :
                                            'High volatility. System mutation in progress.'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Lines of Flight */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> Lines of Flight
                                </h4>
                                <div className="space-y-2">
                                    {analysis.trajectory_analysis.lines_of_flight.map((lof, i) => (
                                        <div key={i} className="bg-white p-2 border border-l-2 border-l-red-400 border-slate-200 rounded shadow-sm">
                                            <p className="text-xs text-slate-700 mb-1">{lof.description}</p>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${lof.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                                                lof.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {lof.risk_level} Risk
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reterritorialization */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Stabilizing Forces
                                </h4>
                                <div className="space-y-2">
                                    {analysis.trajectory_analysis.reterritorialization_forces.map((force, i) => (
                                        <div key={i} className="bg-slate-50 p-2 border border-slate-200 rounded flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                            <p className="text-xs text-slate-600">{force}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="stress_test" className="space-y-4">
                {/* Educational Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3">
                    <div className="bg-orange-100 p-1 rounded">
                        <Activity className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-slate-700">Adversarial Stress Test</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Simulate the resilience of this assemblage. <span className="font-semibold text-orange-600">Disable actors</span> below to see if the network collapses. If removing a single actor causes a massive drop in Territorialization, that actor is an <span className="italic">Obligatory Passage Point (OPP)</span>.
                        </p>
                    </div>
                </div>

                {!analysis.assemblage ? (
                    <div className="text-center p-8 text-slate-400 text-xs italic">
                        Stress test requires a structural assemblage configuration.
                    </div>
                ) : (
                    <StressTestSimulator
                        actors={actors}
                        config={analysis.assemblage}
                    />
                )}
            </TabsContent>
        </Tabs>
    );
}

// Sub-component for clean state management
import { calculateAssemblageMetrics } from '@/lib/ecosystem-utils';
import { Activity, EyeOff, Eye, AlertTriangle, ArrowDown, ArrowRight } from 'lucide-react';
import { EcosystemConfiguration } from "@/types/ecosystem";

function StressTestSimulator({ actors, config }: { actors: EcosystemActor[], config: EcosystemConfiguration }) {
    console.log('[StressTestDebug] Simulator received:', { actorCount: actors.length, config });

    if (!config) {
        return <div className="text-red-500 text-xs p-4">Error: Missing Assemblage Configuration</div>;
    }

    const [excludedIds, setExcludedIds] = React.useState<string[]>([]);

    // Memoize Baseline
    const baseline = React.useMemo(() => calculateAssemblageMetrics(actors, config, []), [actors, config]);

    // Calculate Simulation
    const simulation = calculateAssemblageMetrics(actors, config, excludedIds);

    const toggleActor = (id: string) => {
        setExcludedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // Calculate Delta (Percent Change)
    const tDelta = baseline.stability > 0 ? ((simulation.stability - baseline.stability) / baseline.stability) * 100 : 0;
    const isCollapse = tDelta < -20;

    // Filter relevant actors (members of this assemblage)
    const memberIds = config.memberIds || [];
    const members = actors.filter(a => memberIds.includes(a.id));

    // Hybrid Baseline Logic: Reconcile AI Qualitative Score vs Graph Quantitative Score
    // If Graph says 10 (Closed System) but AI says X (e.g. 6), we calibrate the baseline to X
    // while preserving the relative impact of the simulation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiScoreT = Number((config.properties as any)?.territorialization_score) || Number((config.properties as any)?.territoriality) || 5;
    const baselineRawT = baseline.stability * 10;

    // Trigger hybrid mode if graph is "too perfect" (>9.5) but AI disagrees (<9)
    const useHybridT = baselineRawT > 9.5 && aiScoreT < 9;

    const effectiveBaselineT = useHybridT ? aiScoreT : baselineRawT;

    // Apply the simulation's relative degradation to the effective baseline
    // If Sim is 90% of Base, Diff is 0.9 * AI_Score
    const relativePerformance = baseline.stability > 0 ? simulation.stability / baseline.stability : 0;
    // Cap performance at 1.0 (cannot be more stable than the baseline in this context) if using hybrid
    const cappedRelPerfT = useHybridT ? Math.min(relativePerformance, 1.0) : relativePerformance;
    const displayedT = useHybridT ? cappedRelPerfT * effectiveBaselineT : simulation.stability * 10;


    // [FIX] Hybrid Logic for CODING INTENSITY
    const aiScoreC = Number((config.properties as any)?.coding_intensity_score) || Number((config.properties as any)?.coding) || 5;
    const baselineRawC = baseline.coding_intensity * 10;
    const useHybridC = baselineRawC > 9.5 && aiScoreC < 9;
    const effectiveBaselineC = useHybridC ? aiScoreC : baselineRawC;

    // Relative degradation for Coding
    const relPerfC = baseline.coding_intensity > 0 ? simulation.coding_intensity / baseline.coding_intensity : 0;
    const cappedRelPerfC = useHybridC ? Math.min(relPerfC, 1.0) : relPerfC;
    const displayedC = useHybridC ? cappedRelPerfC * effectiveBaselineC : simulation.coding_intensity * 10;


    return (
        <div className="space-y-4">
            {/* Metric Dashboard */}
            <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${isCollapse ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'} transition-colors duration-300`}>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Territorialization (T)</span>
                    <div className="flex items-end gap-2">
                        <span className={`text-2xl font-bold ${isCollapse ? 'text-red-600' : 'text-slate-800'}`}>
                            {displayedT.toFixed(1)}
                        </span>
                        <div className="flex items-center text-xs mb-1.5 font-medium">
                            {useHybridT && <span className="text-[10px] text-slate-400 mr-2 border border-slate-200 rounded px-1" title="Calibrated to AI Analysis Baseline">AI</span>}
                            {tDelta < -0.1 ? (
                                <span className="text-red-500 flex items-center">
                                    <ArrowDown className="h-3 w-3 mr-0.5" />
                                    {Math.abs(tDelta).toFixed(0)}%
                                </span>
                            ) : (
                                <span className="text-slate-400">0%</span>
                            )}
                        </div>
                    </div>
                    {isCollapse && (
                        <div className="mt-2 text-[10px] font-bold text-red-600 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> SYSTEM COLLAPSE DETECTED
                        </div>
                    )}
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Coding Intensity (C)</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-800">
                            {displayedC.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400 mb-1.5 font-medium">
                            / 10
                        </span>
                        {useHybridC && <span className="text-[10px] text-slate-400 mb-1.5 ml-2 border border-slate-200 rounded px-1" title="Calibrated to AI Analysis Baseline">AI</span>}
                    </div>
                </div>
            </div>

            {/* Actor List */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Disable Actors</h4>
                    <span className="text-[10px] text-slate-400">{excludedIds.length} disabled</span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[250px] overflow-y-auto bg-white">
                    {members.map(member => {
                        const isExcluded = excludedIds.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                onClick={() => toggleActor(member.id)}
                                className={`flex items-center justify-between p-2 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${isExcluded ? 'bg-slate-50 opacity-50 grayscale' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${['algorithm', 'infrastructure'].some(t => member.type.toLowerCase().includes(t)) ? 'bg-slate-400' : 'bg-emerald-400'}`} />
                                    <span className={`text-xs font-medium ${isExcluded ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {member.name}
                                    </span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    {isExcluded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
