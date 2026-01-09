import React from 'react';
import { EcosystemActor } from '@/types/ecosystem';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';

interface AssemblageCompassProps {
    actors: EcosystemActor[];
    onSelectActor: (id: string) => void;
    selectedActorId: string | null;
}

export function AssemblageCompass({ actors, onSelectActor, selectedActorId }: AssemblageCompassProps) {

    // Pseudo-random jitter based on actor ID string to be deterministic but scattered
    // (Prevents jittering on re-renders)
    const getJitter = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (hash % 1000) / 1000 - 0.5; // -0.5 to 0.5
    };

    // Helper to convert qualitative metrics to numeric scale for plotting
    const qualitativeToNumeric = (val: string | number | undefined): number => {
        if (typeof val === 'number') return val;
        switch (val) {
            case 'High': return 8;
            case 'Moderate': return 5;
            case 'Low': return 2;
            case 'Weak': return 2;
            default: return 5;
        }
    };

    // Prepare data for the scatter plot
    const data = actors.map(actor => {
        // Use new assemblage metrics (with fallback to legacy top-level field)
        const baseTerr = qualitativeToNumeric(actor.metrics?.territorialization || actor.influence);
        const baseDeterr = qualitativeToNumeric(actor.metrics?.deterritorialization);

        // Apply jitter properties - scaled to avoid shifting too much 
        // (0.4 jitter means max deviation is +/- 0.2 units on 0-10 scale)
        const jitterX = getJitter(actor.id + "x") * 0.4;
        const jitterY = getJitter(actor.id + "y") * 0.4;

        return {
            id: actor.id,
            name: actor.name,
            type: actor.type,
            x: Math.max(0, Math.min(10, baseTerr + jitterX)), // Clamp to 0-10
            y: Math.max(0, Math.min(10, baseDeterr + jitterY)),
            z: 100, // Size
            fill: getColorByType(actor.type),
            actor: actor // Pass full actor for tooltip
        };
    });

    // Quadrant Definitions
    // Q1 (High Inf, High Res): Battleground
    // Q2 (High Inf, Low Res): Strata
    // Q3 (Low Inf, High Res): Lines of Flight
    // Q4 (Low Inf, Low Res): Amorphous

    if (actors.length === 0) {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center text-center p-8 border border-slate-200 border-dashed rounded-xl bg-slate-50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Info className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Actors Mapped Yet</h3>
                <p className="text-slate-500 max-w-md mb-6">
                    This policy document hasn't been analyzed yet. Go to the <strong>Visual Assemblage</strong> tab and use the <strong>Materialize</strong> or <strong>Simulation</strong> tools to populate the map.
                </p>
                <div className="text-xs text-slate-400">
                    Once actors are created, they will appear on this epistemic plane based on their territorialization and resistance scores.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[1000px] bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden flex flex-col">
            <div className="bg-white/90 p-2 rounded-md border shadow-sm mb-4 shrink-0 self-start z-10 flex items-center gap-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Plane of Consistency</h3>
                    <p className="text-xs text-slate-500">Mapping the vectors of becoming.</p>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <Info className="h-4 w-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 h-96 overflow-y-auto p-4" align="start">
                        <h4 className="font-bold text-slate-900 mb-2 text-sm">Assemblage Theory Guide</h4>
                        <div className="space-y-4 text-xs text-slate-600">

                            {/* Axes */}
                            <div className="border-b border-slate-100 pb-2">
                                <p className="font-semibold text-slate-900 mb-1">X-Axis: Territorialization</p>
                                <p>Forces that stabilize identity, enforce boundaries, and increase internal homogeneity. (Rules, Standards, Habits, Code)</p>
                            </div>
                            <div className="border-b border-slate-100 pb-2">
                                <p className="font-semibold text-slate-900 mb-1">Y-Axis: Deterritorialization</p>
                                <p>Forces that destabilize, create new connections, and facilitate escape. (Innovation, Rebellion, Glitches, Art)</p>
                            </div>

                            {/* Quadrants */}
                            <div>
                                <h5 className="font-bold text-slate-900 mb-2 mt-3 text-xs">The Four Quadrants</h5>

                                <div className="mb-2">
                                    <span className="text-red-600 font-bold block">The Battleground (Q1)</span>
                                    <p>High Influence / High Resistance. The zone of active conflict, negotiation, and power struggles. Institutions under siege.</p>
                                </div>
                                <div className="mb-2">
                                    <span className="text-blue-600 font-bold block">The Strata (Q2)</span>
                                    <p>High Influence / Low Resistance. Stable, sedimented institutions. "Black boxes" that are unquestioned and widely adopted.</p>
                                </div>
                                <div className="mb-2">
                                    <span className="text-emerald-600 font-bold block">Lines of Flight (Q3)</span>
                                    <p>Low Influence / High Resistance. Radical experiments, hackers, and movements attempting to escape the dominant logic.</p>
                                </div>
                                <div className="mb-2">
                                    <span className="text-slate-500 font-bold block">The Amorphous (Q4)</span>
                                    <p>Low Influence / Low Resistance. Passive components, raw resources, or disengaged users. Potential energy waiting to be formed.</p>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="w-full h-[900px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

                        {/* Background Zones - Subtle Tinting */}
                        <ReferenceArea x1={5} x2={10} y1={5} y2={10} fill="rgba(239, 68, 68, 0.05)" /> {/* Top Right: Battleground */}
                        <ReferenceArea x1={5} x2={10} y1={0} y2={5} fill="rgba(59, 130, 246, 0.05)" />  {/* Bottom Right: Strata */}
                        <ReferenceArea x1={0} x2={5} y1={5} y2={10} fill="rgba(16, 185, 129, 0.05)" />  {/* Top Left: Flight */}
                        <ReferenceArea x1={0} x2={5} y1={0} y2={5} fill="rgba(100, 116, 139, 0.05)" />  {/* Bottom Left: Amorphous */}

                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Territorialization"
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            label={{ value: 'Degree of Territorialization (Influence)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Deterritorialization"
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            label={{ value: 'Degree of Deterritorialization (Resistance)', angle: -90, position: 'left', offset: 0, fill: '#64748b', fontSize: 12, style: { textAnchor: 'middle' } }}
                        />
                        <ZAxis type="number" dataKey="z" range={[64, 400]} />

                        {/* Quadrant Labels */}
                        <ReferenceLine x={5} stroke="#94a3b8" strokeDasharray="5 5" />
                        <ReferenceLine y={5} stroke="#94a3b8" strokeDasharray="5 5" />

                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                        <Scatter
                            name="Actors"
                            data={data}
                            fill="#8884d8"
                            onClick={(node) => onSelectActor(node.payload.id)}
                            className="cursor-pointer"
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Quadrant Text Labels (Absolute Positioned Overlay for better control) */}
            <div className="absolute top-[20%] right-[15%] text-red-900/40 font-bold text-2xl select-none pointer-events-none text-center">
                THE BATTLEGROUND<br /><span className="text-xs font-normal opacity-70">Contested Territory</span>
            </div>
            <div className="absolute bottom-[20%] right-[15%] text-blue-900/40 font-bold text-2xl select-none pointer-events-none text-center">
                THE STRATA<br /><span className="text-xs font-normal opacity-70">Institutional Stability</span>
            </div>
            <div className="absolute top-[20%] left-[15%] text-emerald-900/40 font-bold text-2xl select-none pointer-events-none text-center">
                LINES OF FLIGHT<br /><span className="text-xs font-normal opacity-70">Escape & Innovation</span>
            </div>
            <div className="absolute bottom-[20%] left-[15%] text-slate-500/30 font-bold text-2xl select-none pointer-events-none text-center">
                AMORPHOUS<br /><span className="text-xs font-normal opacity-70">Potential Energy</span>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const actor = data.actor;

        return (
            <Card className="bg-white/95 backdrop-blur shadow-xl border-slate-200 p-3 min-w-[200px]">
                <p className="font-bold text-sm text-slate-900 mb-1">{data.name}</p>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {data.type}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 mb-2">
                    <div>
                        <span className="text-slate-500 block">Territorialization</span>
                        <span className="font-mono font-bold text-indigo-600">
                            {data.actor.metrics?.territorialization || data.actor.influence || "Unknown"}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Deterritorialization</span>
                        <span className="font-mono font-bold text-emerald-600">
                            {data.actor.metrics?.deterritorialization || "Unknown"}
                        </span>
                    </div>
                </div>

                <p className="text-[10px] text-slate-500 italic leading-tight">
                    {actor.description.slice(0, 100)}...
                </p>
            </Card>
        );
    }
    return null;
};

// Helper to match map colors
function getColorByType(type: string) {
    switch (type) {
        case 'Policymaker': return '#4f46e5'; // Indigo
        case 'Startup': return '#0ea5e9'; // Sky
        case 'Civil Society': return '#ea580c'; // Orange
        case 'Academic': return '#8b5cf6'; // Violet
        case 'Infrastructure': return '#64748b'; // Slate
        case 'Algorithm': return '#ec4899'; // Pink
        case 'Dataset': return '#10b981'; // Emerald
        default: return '#94a3b8';
    }
}
