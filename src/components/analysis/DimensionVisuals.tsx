import React from 'react';
import { AnalysisResult } from "@/types";
import {
    ShieldCheck, UserCheck, Scale, Cpu,
    ArrowRight, AlertTriangle, Landmark, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * GOVERNANCE & POWER: Accountability Chain
 */
export function AccountabilityChain({ data }: { data?: AnalysisResult['accountability_map'] }) {
    if (!data) return null;
    const steps = [
        { label: 'Signatory', val: data.signatory, icon: ShieldCheck },
        { label: 'Liability', val: data.liability_holder, icon: Scale },
        { label: 'Appeals', val: data.appeals_mechanism, icon: UserCheck }
    ];

    return (
        <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between space-x-2">
                {steps.map((step, i) => (
                    <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center flex-1">
                            <div className={cn(
                                "p-1.5 rounded-full mb-1 transition-colors",
                                step.val ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                            )}>
                                <step.icon className="h-3 w-3" />
                            </div>
                            <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">{step.label}</span>
                            <span className="text-[9px] text-slate-600 font-medium leading-tight text-center px-1" title={step.val || 'Undefined'}>
                                {step.val || 'N/A'}
                            </span>
                        </div>
                        {i < steps.length - 1 && <ArrowRight className="h-2 w-2 text-slate-300 mt-2" />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

/**
 * GOVERNANCE: Power Symmetry Scale
 */
export function PowerBalanceScale({ centralization }: { centralization: number }) {
    const rotation = (centralization - 50) * 0.4;

    return (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Power Symmetry</span>
                <span className="text-[9px] font-bold text-blue-600">{centralization > 60 ? 'Hierarchical' : centralization < 40 ? 'Distributed' : 'Networked'}</span>
            </div>

            <div className="relative w-full h-12 flex items-center justify-center">
                <div className="absolute bottom-0 w-8 h-4 border-b-2 border-x-2 border-slate-200 rounded-b-md" />
                <div
                    className="absolute w-28 h-0.5 bg-slate-400 transition-all duration-1000 origin-center"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-slate-900 border-2 border-slate-700" />
                    <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-blue-500 border-2 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                </div>
            </div>

            <div className="w-full flex justify-between mt-1 px-4">
                <span className="text-[7px] text-slate-400 uppercase font-black tracking-tighter">Distributed</span>
                <span className="text-[7px] text-slate-400 uppercase font-black tracking-tighter">Sovereign</span>
            </div>
        </div>
    );
}

/**
 * PLURALITY: Inclusion Depth Bar
 */
export function InclusionDepthMeter({ score }: { score: number }) {
    const levels = ['Exclusionary', 'Tokenistic', 'Representational', 'Participatory', 'Radical Plurality'];
    const levelIndex = Math.min(Math.floor(score / 20), 4);

    return (
        <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Inclusion Depth</span>
                <span className="text-[9px] font-bold text-pink-600">{levels[levelIndex]}</span>
            </div>
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full",
                            i <= levelIndex ? "bg-pink-500" : "bg-slate-100"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * PLURALITY: Voice Representation Split
 */
export function VoiceSplit({ included, silenced }: { included: number, silenced?: string[] }) {
    const hasSilenced = silenced && silenced.length > 0;

    return (
        <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Epistemic Inclusion</span>
                <span className="text-[9px] font-bold text-pink-600">{hasSilenced ? 'Asymmetric' : 'Pluralist'}</span>
            </div>
            <div className="flex h-3 items-stretch gap-0.5 rounded-full overflow-hidden border border-slate-100">
                <div
                    className="bg-pink-500 flex items-center justify-center transition-all duration-700"
                    style={{ width: `${included}%` }}
                >
                    <span className="text-[5px] font-bold text-white uppercase px-1 truncate">Included</span>
                </div>
                <div
                    className="bg-slate-200 flex items-center justify-center transition-all duration-700"
                    style={{ width: `${100 - included}%` }}
                >
                    <span className="text-[5px] font-bold text-slate-400 uppercase px-1 truncate">Absent</span>
                </div>
            </div>
            {hasSilenced && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {silenced.slice(0, 3).map(voice => (
                        <span key={voice} className="text-[7px] bg-slate-50 text-slate-500 px-1 py-0.5 rounded border border-slate-100 max-w-[80px] truncate">
                            {voice}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * AGENCY: Ladder of Participation
 */
export function ParticipationLadder({ score }: { score: number }) {
    const rungs = [
        { name: 'Inform', threshold: 0 },
        { name: 'Consult', threshold: 25 },
        { name: 'Involve', threshold: 50 },
        { name: 'Collaborate', threshold: 75 },
        { name: 'Empower', threshold: 90 }
    ];

    const activeRungIndex = rungs.filter(r => score >= r.threshold).length - 1;

    return (
        <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Participation Ladder</span>
                <span className="text-[9px] font-bold text-emerald-600">{rungs[activeRungIndex].name}</span>
            </div>
            <div className="flex gap-0.5 items-end h-10 px-2 justify-center">
                {rungs.map((rung, i) => (
                    <div
                        key={rung.name}
                        className={cn(
                            "w-full rounded-sm transition-all duration-500",
                            i <= activeRungIndex ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-slate-100"
                        )}
                        style={{ height: `${(i + 1) * 20}%` }}
                        title={rung.name}
                    />
                ))}
            </div>
            <p className="text-[7px] text-slate-400 text-center mt-2 font-medium tracking-tighter uppercase">Manipulation &gt; Citizen Power</p>
        </div>
    );
}

/**
 * AGENCY: Agency Spectrum Meter
 */
export function AgencySpectrum({ score, humanInLoop }: { score: number, humanInLoop?: boolean }) {
    return (
        <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Agency Mode</span>
                <div className="flex items-center gap-1">
                    {humanInLoop ? <UserCheck className="h-2.5 w-2.5 text-emerald-600" /> : <Cpu className="h-2.5 w-2.5 text-slate-400" />}
                    <span className="text-[9px] font-bold text-emerald-600">{humanInLoop ? 'Human-Led' : 'Algorithmic'}</span>
                </div>
            </div>
            <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${score}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 px-0.5">
                <span className="text-[7px] text-slate-400">Passive</span>
                <span className="text-[7px] text-slate-400">Collaborative</span>
                <span className="text-[7px] text-slate-400">Autonomous</span>
            </div>
        </div>
    );
}

/**
 * REFLEXIVITY: Epistemic Awareness Indicator
 */
export function ReflexivityMeter({ score }: { score: number }) {
    return (
        <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Reflexive Awareness</span>
                <span className="text-[9px] font-bold text-amber-600">{score > 70 ? 'Situated' : score > 40 ? 'Evaluative' : 'Objective'}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-10 gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-2 w-full",
                                i < score / 10 ? "bg-amber-500" : "bg-slate-100",
                                i === 0 && "rounded-l-sm",
                                i === 9 && "rounded-r-sm"
                            )}
                        />
                    ))}
                </div>
                {score < 30 && <AlertTriangle className="h-3 w-3 text-amber-400 animate-pulse" />}
            </div>
        </div>
    );
}

/**
 * COLONIALITY: Center-Periphery Asymmetry
 */
export function ColonialityVisual({ score }: { score: number }) {
    const extractionIntensity = score;

    return (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Power Asymmetry</span>
                <span className="text-[9px] font-bold text-rose-600">
                    {score > 70 ? 'Extractive' : score > 40 ? 'Asymmetric' : 'Balanced'}
                </span>
            </div>

            <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
                <div className="absolute w-24 h-24 rounded-full border border-dashed border-slate-200 animate-[spin_20s_linear_infinite]" />
                <div className="absolute top-0 text-[7px] font-bold text-slate-300 uppercase tracking-widest">Subaltern Periphery</div>

                <div className="z-10 flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-xl transform rotate-45">
                        <Landmark className="h-5 w-5 text-white -rotate-45" />
                    </div>
                    <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest mt-1">Metropolitan Center</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <ArrowVector angle={0} intensity={extractionIntensity} />
                    <ArrowVector angle={120} intensity={extractionIntensity} />
                    <ArrowVector angle={240} intensity={extractionIntensity} />
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <ArrowVector angle={60} intensity={100 - extractionIntensity} Inward />
                    <ArrowVector angle={180} intensity={100 - extractionIntensity} Inward />
                    <ArrowVector angle={300} intensity={100 - extractionIntensity} Inward />
                </div>
            </div>

            <div className="w-full space-y-2 mt-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col">
                        <span className="text-[7px] text-slate-400 uppercase tracking-tighter">Extraction Intensity</span>
                        <div className="flex items-center gap-1.5">
                            <ArrowRight className="h-2.5 w-2.5 text-rose-500" />
                            <span className="text-[10px] font-mono font-bold text-rose-600">{extractionIntensity}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] text-slate-400 uppercase tracking-tighter">Local Agency</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500">{100 - extractionIntensity}%</span>
                            <ArrowRight className="h-2.5 w-2.5 text-slate-400 rotate-180" />
                        </div>
                    </div>
                </div>

                <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col gap-1 text-[8px] text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                        <ArrowRight className="h-2 w-2 text-rose-400" />
                        <span>Outward: Extraction of data & imposition of rules</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ArrowRight className="h-2 w-2 text-slate-300 rotate-180" />
                        <span>Inward: Resistance, localized use & pushback</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArrowVector({ angle, intensity, Inward = false }: { angle: number, intensity: number, Inward?: boolean }) {
    const scale = Math.max(0.2, intensity / 100);
    return (
        <div
            className="absolute transition-all duration-1000"
            style={{
                transform: `rotate(${angle}deg) translateX(${Inward ? '40px' : '20px'})`,
                opacity: scale
            }}
        >
            <ArrowRight className={cn(
                "h-3 w-3",
                Inward ? "rotate-180 text-slate-400" : "text-rose-400",
            )} style={{ transform: `scale(${scale})` }} />
        </div>
    );
}

/**
 * GOVERNANCE: Legitimacy Source Profile
 */
export function LegitimacySource({ source, mechanisms }: { source?: string, mechanisms?: string }) {
    if (!source) return null;

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="mb-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Legitimacy Foundation</span>
                <span className="text-sm font-bold text-indigo-700 leading-tight block">{source}</span>
            </div>

            <div className="relative flex flex-col items-start px-1">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center relative shadow-sm mb-3">
                    <div className="absolute inset-0 rounded-full border border-indigo-200 animate-[ping_3s_ease-in-out_infinite] opacity-30" />
                    <Zap className="h-4 w-4 text-indigo-500" />
                </div>

                {mechanisms && (
                    <div className="text-left w-full">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                            &quot;{mechanisms}&quot;
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * REFLEXIVITY: Blind Spot Radar
 */
export function BlindSpotRadar({ blindSpots }: { blindSpots?: import('@/types').BlindSpot[] }) {
    const hasSpots = blindSpots && blindSpots.length > 0;

    // Helper to get title from any blind spot tier
    const getTitle = (spot: import('@/types').BlindSpot): string => {
        return typeof spot === 'string' ? spot : spot.title;
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Epistemic Blind Spots</span>
                <span className="text-[9px] font-bold text-amber-600">{hasSpots ? `${blindSpots.length} Detected` : 'Low Risk'}</span>
            </div>

            <div className="relative w-full h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-slate-200">
                {/* Scanning Sweep */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(245,158,11,0.15)_90deg,transparent_180deg)] animate-[spin_4s_linear_infinite]" />

                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                {/* Radar Circles */}
                <div className="absolute w-20 h-20 border-2 border-slate-300 rounded-full" />
                <div className="absolute w-12 h-12 border-2 border-slate-300 rounded-full" />
                <div className="absolute w-4 h-4 border-2 border-slate-400 rounded-full bg-slate-200" />

                {/* Blind Spots (Pulsing Dots) */}
                {blindSpots?.slice(0, 4).map((spot, i) => (
                    <div
                        key={getTitle(spot)}
                        className="absolute w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse border border-amber-600"
                        style={{
                            left: `${25 + (i * 12) + (Math.sin(i) * 8)}%`,
                            top: `${35 + (i * 8) + (Math.cos(i) * 8)}%`,
                            animationDelay: `${i * 0.4}s`
                        }}
                        title={getTitle(spot)}
                    />
                ))}

                {/* Center Label */}
                <div className="absolute bottom-1 right-1 text-[6px] text-slate-400 font-mono uppercase tracking-widest">
                    Scanning...
                </div>
            </div>

            {hasSpots && (
                <>
                    <div className="mt-2 flex flex-col gap-1">
                        {blindSpots.slice(0, 4).map((spot, i) => (
                            <div key={i} className="flex items-start gap-1.5 bg-amber-50 p-1.5 rounded border border-amber-100">
                                <AlertTriangle className="h-2.5 w-2.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span className="text-[8px] text-slate-700 leading-tight">{getTitle(spot)}</span>
                            </div>
                        ))}
                    </div>
                    {blindSpots.length > 0 && (
                        <a
                            href="?section=reflexivity"
                            className="mt-2 text-[9px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 hover:underline transition-colors"
                        >
                            <span>View Full Blind Spot Analysis</span>
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    )}
                </>
            )}
        </div>
    );
}

/**
 * STRATEGIC: Impact Matrix Item
 */
export function ImpactMatrixItem({ title, detail, value }: { title: string, detail: string, value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{title}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${value === 'High' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{value}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">{detail}</p>
        </div>
    );
}
