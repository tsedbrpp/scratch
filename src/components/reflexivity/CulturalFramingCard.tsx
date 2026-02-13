import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ConceptNetworkGraph } from './ConceptNetworkGraph';
import { AnalysisResult } from '@/types';
import {
    VolumeX,
    Quote,
    Landmark,
    Cpu,
    Scale,
    BookOpen,
    GraduationCap,
    Shield,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import { TextParser } from '@/components/ui/TextParser';

interface CulturalFramingCardProps {
    result: AnalysisResult;
}

// --- Dimension Metadata ---
const DIMENSIONS = [
    { key: 'state_market_society', label: 'State / Market / Society', icon: Landmark, color: 'amber' },
    { key: 'technology_role', label: 'Technology Role', icon: Cpu, color: 'blue' },
    { key: 'rights_conception', label: 'Rights Conception', icon: Scale, color: 'emerald' },
    { key: 'historical_context', label: 'Historical Context', icon: BookOpen, color: 'rose' },
    { key: 'epistemic_authority', label: 'Epistemic Authority', icon: GraduationCap, color: 'indigo' },
    { key: 'enforcement_culture', label: 'Enforcement Culture', icon: Shield, color: 'slate' },
] as const;

type DimensionKey = typeof DIMENSIONS[number]['key'];

// --- Bullet Parser ---
interface ParsedBullet {
    mainText: string;
    mechanism?: string;
    rhetoric?: string;
    pageRefs: string[];
}

function parseBullets(raw: string | undefined | null): ParsedBullet[] {
    if (!raw) return [];
    const bullets = raw.split('•').map(b => b.trim()).filter(Boolean);
    return bullets.map(bullet => {
        let mainText = bullet;
        let mechanism: string | undefined;
        let rhetoric: string | undefined;
        const pageRefs: string[] = [];

        // Extract (Mechanism: ...) 
        const mechMatch = mainText.match(/\(Mechanism:\s*([^)]+)\)/i);
        if (mechMatch) {
            mechanism = mechMatch[1].trim();
            mainText = mainText.replace(mechMatch[0], '');
        }

        // Extract (Rhetoric: ...) 
        const rhetMatch = mainText.match(/\(Rhetoric:\s*"?([^")\n]+)"?\)/i);
        if (rhetMatch) {
            rhetoric = rhetMatch[1].trim();
            mainText = mainText.replace(rhetMatch[0], '');
        }

        // Extract (Page N, ...) 
        const pageMatches = mainText.matchAll(/\(Page\s+\d+[^)]*\)/gi);
        for (const m of pageMatches) {
            pageRefs.push(m[0].replace(/[()]/g, ''));
            mainText = mainText.replace(m[0], '');
        }

        // Clean up multiple spaces / dashes
        mainText = mainText.replace(/\s{2,}/g, ' ').replace(/\s*–\s*$/, '').trim();

        return { mainText, mechanism, rhetoric, pageRefs };
    });
}

// --- Distinctiveness Gauge ---
function DistinctivenessGauge({ score }: { score: number | undefined | null }) {
    const value = typeof score === 'number' ? Math.max(0, Math.min(1, score)) : null;
    if (value === null) return null;

    const pct = Math.round(value * 100);
    const label = value < 0.33 ? 'Low' : value < 0.66 ? 'Mid' : 'High';
    const barColor = value < 0.33 ? 'bg-slate-400' : value < 0.66 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className="flex items-center gap-3" aria-label={`Cultural Distinctiveness: ${label} (${pct}%)`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Distinctiveness
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold">
                {label} ({pct}%)
            </Badge>
        </div>
    );
}

// --- Dimension Tab Content ---
function DimensionContent({ bullets }: { bullets: ParsedBullet[] }) {
    if (bullets.length === 0) {
        return <p className="text-xs text-slate-400 italic py-3">No analysis available for this dimension.</p>;
    }

    return (
        <div className="space-y-3 py-2">
            {bullets.map((b, i) => (
                <div key={i} className="bg-white rounded-md border border-slate-100 p-3 shadow-sm hover:shadow transition-shadow">
                    <TextParser text={b.mainText} className="space-y-1 [&_li]:text-xs [&_li]:leading-relaxed [&_li]:text-slate-700 [&_span.text-indigo-300]:hidden" />
                    {(b.mechanism || b.rhetoric) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {b.mechanism && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                                    <Eye className="h-2.5 w-2.5" /> Mechanism: {b.mechanism}
                                </span>
                            )}
                            {b.rhetoric && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">
                                    <Quote className="h-2.5 w-2.5" /> Rhetoric: &ldquo;{b.rhetoric}&rdquo;
                                </span>
                            )}
                        </div>
                    )}
                    {b.pageRefs.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {b.pageRefs.map((ref, j) => (
                                <span key={j} className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                    {ref}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// --- Main Component ---
export function CulturalFramingCard({ result }: CulturalFramingCardProps) {
    const summary = result.plain_language_summary;
    const dominantLabel = summary?.dominant_cultural_logic?.label || result.dominant_cultural_logic || 'Undetermined';
    const dominantExplanation = summary?.dominant_cultural_logic?.explanation;

    // Memoize parsed dimension data
    const parsedDimensions = useMemo(() => {
        return DIMENSIONS.reduce((map, dim) => {
            const raw = result[dim.key as keyof AnalysisResult] as string | undefined;
            map[dim.key] = parseBullets(raw);
            return map;
        }, {} as Record<DimensionKey, ParsedBullet[]>);
    }, [result]);

    return (
        <div className="space-y-4">
            {/* 1. Executive Summary / One-Sentence Overview */}
            {summary?.one_sentence_overview && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-md p-3">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                        Overview
                    </span>
                    <p className="text-xs leading-relaxed text-amber-900">
                        {summary.one_sentence_overview}
                    </p>
                </div>
            )}

            {/* 2. Dominant Cultural Logic + Distinctiveness */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-amber-50 border border-amber-100 rounded-md p-3">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">
                        Dominant Cultural Logic
                    </span>
                    <p className="font-semibold text-amber-900 leading-tight text-sm">
                        {dominantLabel}
                    </p>
                    {dominantExplanation && (
                        <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
                            {dominantExplanation}
                        </p>
                    )}
                </div>
                <div className="sm:w-56 flex items-center sm:items-end">
                    <DistinctivenessGauge score={result.cultural_distinctiveness_score} />
                </div>
            </div>

            {/* 3. Key Points Accordion */}
            {summary?.key_points && summary.key_points.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            Key Findings ({summary.key_points.length})
                        </span>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        {summary.key_points.map((kp) => (
                            <AccordionItem key={kp.number} value={`kp-${kp.number}`} className="border-b border-slate-100 last:border-0">
                                <AccordionTrigger className="px-3 py-2.5 text-xs font-semibold text-slate-800 hover:text-amber-700 hover:no-underline [&[data-state=open]]:text-amber-700">
                                    <span className="flex items-center gap-2 text-left">
                                        <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                                            {kp.number}
                                        </span>
                                        {kp.heading}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3">
                                    <div className="space-y-2 pl-7">
                                        {kp.paragraphs?.map((p, i) => (
                                            <p key={i} className="text-xs leading-relaxed text-slate-600">{p}</p>
                                        ))}
                                    </div>
                                    {/* Evidence strip */}
                                    {kp.evidence && (
                                        <div className="mt-2 pl-7 pt-2 border-t border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Evidence</span>
                                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                                {kp.evidence}
                                            </p>
                                        </div>
                                    )}
                                    {/* Summary callout */}
                                    {kp.summary && (
                                        <div className="mt-2 pl-7 bg-amber-50/50 rounded p-2 border-l-2 border-amber-300">
                                            <p className="text-[10px] font-medium text-amber-800 leading-relaxed">
                                                {kp.summary}
                                            </p>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}

            {/* 4. Dimension Deep-Dive Tabs */}
            {Object.values(parsedDimensions).some(bullets => bullets.length > 0) && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            Dimension Deep-Dive
                        </span>
                    </div>
                    <Tabs defaultValue={DIMENSIONS[0].key} className="w-full">
                        <TabsList className="w-full h-auto flex flex-wrap gap-0 rounded-none bg-white border-b border-slate-100 p-0">
                            {DIMENSIONS.map((dim) => {
                                const Icon = dim.icon;
                                const count = parsedDimensions[dim.key].length;
                                return (
                                    <TabsTrigger
                                        key={dim.key}
                                        value={dim.key}
                                        className="flex-1 min-w-[120px] rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-amber-50/50 data-[state=active]:shadow-none py-2 px-2 text-[11px] gap-1"
                                    >
                                        <Icon className="h-3 w-3" />
                                        <span className="hidden sm:inline">{dim.label}</span>
                                        <span className="sm:hidden">{dim.label.split(' ')[0]}</span>
                                        {count > 0 && (
                                            <span className="text-[9px] text-slate-400 ml-0.5">({count})</span>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                        {DIMENSIONS.map((dim) => (
                            <TabsContent key={dim.key} value={dim.key} className="px-3 pb-3 mt-0">
                                <DimensionContent bullets={parsedDimensions[dim.key]} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            )}

            {/* 5. Silenced Voices */}
            {(result.silenced_voices?.length || summary?.silenced_voices_detailed) && (
                <div className="border border-red-100 rounded-lg bg-red-50/30 p-3">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                        <VolumeX className="h-3 w-3" /> Silenced Voices
                    </span>
                    {result.silenced_voices && result.silenced_voices.length > 0 && (
                        <ul className="space-y-1 mb-2">
                            {result.silenced_voices.map((voice, idx) => (
                                <li key={idx} className="text-xs text-red-800 font-medium flex items-start gap-2">
                                    <AlertTriangle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                                    {voice}
                                </li>
                            ))}
                        </ul>
                    )}
                    {summary?.silenced_voices_detailed && (
                        <details className="group">
                            <summary className="text-[10px] font-medium text-red-500 cursor-pointer hover:text-red-700 select-none transition-colors w-fit">
                                <span className="group-open:hidden">+ View detailed analysis</span>
                                <span className="hidden group-open:inline">Hide detailed analysis</span>
                            </summary>
                            <p className="mt-2 text-xs text-red-800/80 leading-relaxed bg-white/60 rounded p-2 border border-red-100">
                                {summary.silenced_voices_detailed}
                            </p>
                        </details>
                    )}
                </div>
            )}

            {/* 6. Concept Network Graph */}
            {result.concept_map && result.concept_map.nodes?.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Cultural Logic Network
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {result.concept_map.nodes.length} Nodes · {result.concept_map.edges?.length || 0} Edges
                        </span>
                    </div>
                    <div className="h-[500px] w-full relative">
                        <ConceptNetworkGraph data={result.concept_map} />
                    </div>
                </div>
            )}
        </div>
    );
}
