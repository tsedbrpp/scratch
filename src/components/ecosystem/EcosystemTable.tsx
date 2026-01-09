import React from 'react';
import { EcosystemActor } from '@/types/ecosystem';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, ArrowUpDown, Check, Minus, Gavel, Coins, Code2, Megaphone } from 'lucide-react';

interface EcosystemTableProps {
    actors: EcosystemActor[];
    onSelectActor: (id: string) => void;
    selectedActorId: string | null;
}

export function EcosystemTable({ actors, onSelectActor, selectedActorId }: EcosystemTableProps) {
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof EcosystemActor | 'metrics.resistance' | 'metrics.influence'; direction: 'asc' | 'desc' } | null>(null);

    const getMetricRank = (val: string | number | undefined): number => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        // Map qualitative to rank
        const map: Record<string, number> = {
            "Strong": 3, "High": 3,
            "Moderate": 2, "Medium": 2,
            "Weak": 1, "Low": 1,
            "Latent": 0
        };
        return map[val] || 0;
    };

    const sortedActors = React.useMemo(() => {
        const sortableActors = [...actors];
        if (sortConfig !== null) {
            sortableActors.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof EcosystemActor];
                let bValue: any = b[sortConfig.key as keyof EcosystemActor];

                // Handle nested metrics with rank conversion
                if (sortConfig.key === 'metrics.resistance') {
                    aValue = getMetricRank(a.metrics?.resistance);
                    bValue = getMetricRank(b.metrics?.resistance);
                } else if (sortConfig.key === 'metrics.influence') {
                    aValue = getMetricRank(a.metrics?.influence);
                    bValue = getMetricRank(b.metrics?.influence);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableActors;
    }, [actors, sortConfig]);

    const requestSort = (key: keyof EcosystemActor | 'metrics.resistance' | 'metrics.influence') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Helper to determine functional aptitude
    const getFunctionalAptitude = (type: string) => {
        const t = type.toLowerCase();
        return {
            regulatory: ['policy', 'law', 'regulation', 'government', 'court', 'legislator', 'regulator'].some(k => t.includes(k)),
            fund: ['fund', 'capital', 'investor', 'market', 'corporation', 'private', 'bank'].some(k => t.includes(k)),
            implement: ['startup', 'technologist', 'infrastructure', 'algorithm', 'standard', 'cloud', 'developer', 'lab'].some(k => t.includes(k)),
            contest: ['civilsociety', 'ngo', 'academic', 'activist', 'public', 'union', 'advocate'].some(k => t.includes(k)),
        };
    };

    const renderCheck = (active: boolean) => active ? (
        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
    ) : (
        <Minus className="h-3 w-3 text-slate-200 mx-auto" />
    );

    return (
        <TooltipProvider>
            <div className="rounded-md border bg-white overflow-y-auto max-h-[600px] shadow-sm">
                <Table>
                    <TableCaption>Actor-Function Matrix: Capabilities of Ecosystem Participants</TableCaption>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="w-[180px] cursor-pointer hover:bg-slate-100" onClick={() => requestSort('name')}>
                                Name <ArrowUpDown className="ml-2 h-3.5 w-3.5 inline-block text-slate-400" />
                            </TableHead>
                            <TableHead className="w-[100px] cursor-pointer hover:bg-slate-100" onClick={() => requestSort('type')}>
                                Type
                            </TableHead>

                            {/* Functional Matrix Columns */}
                            <TableHead className="text-center w-[60px]" title="Regulatory Capability">
                                <Gavel className="h-4 w-4 mx-auto text-slate-500" />
                            </TableHead>
                            <TableHead className="text-center w-[60px]" title="Financial/Funding Capability">
                                <Coins className="h-4 w-4 mx-auto text-slate-500" />
                            </TableHead>
                            <TableHead className="text-center w-[60px]" title="Technical Implementation">
                                <Code2 className="h-4 w-4 mx-auto text-slate-500" />
                            </TableHead>
                            <TableHead className="text-center w-[60px]" title="Contestation/Advocacy">
                                <Megaphone className="h-4 w-4 mx-auto text-slate-500" />
                            </TableHead>

                            <TableHead className="text-right cursor-pointer hover:bg-slate-100" onClick={() => requestSort('metrics.influence')}>
                                Infl. <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-slate-400" />
                            </TableHead>
                            <TableHead className="text-right cursor-pointer hover:bg-slate-100" onClick={() => requestSort('metrics.resistance')}>
                                Res. <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-slate-400" />
                            </TableHead>
                            <TableHead className="text-right">Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedActors.map((actor) => {
                            const aptitude = getFunctionalAptitude(actor.type);
                            return (
                                <TableRow
                                    key={actor.id}
                                    className={`cursor-pointer transition-colors ${selectedActorId === actor.id ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'} ${actor.source === 'absence_fill' ? 'bg-amber-50/30' : ''}`}
                                    onClick={() => onSelectActor(actor.id)}
                                >
                                    <TableCell className="font-medium py-2">
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-[150px] text-xs font-semibold text-slate-700">{actor.name}</span>
                                            {actor.source === 'absence_fill' && (
                                                <span className="text-[9px] text-amber-600 font-medium">Recovered Check</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Badge variant="secondary" className="font-normal text-[10px] px-1.5 h-5">{actor.type}</Badge>
                                    </TableCell>

                                    {/* Functional Matrix Cells */}
                                    <TableCell className="text-center py-2 bg-slate-50/50 border-x border-slate-50">{renderCheck(aptitude.regulatory)}</TableCell>
                                    <TableCell className="text-center py-2 bg-slate-50/50 border-x border-slate-50">{renderCheck(aptitude.fund)}</TableCell>
                                    <TableCell className="text-center py-2 bg-slate-50/50 border-x border-slate-50">{renderCheck(aptitude.implement)}</TableCell>
                                    <TableCell className="text-center py-2 bg-slate-50/50 border-x border-slate-50">{renderCheck(aptitude.contest)}</TableCell>

                                    <TableCell className="text-right py-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-help decoration-slate-300 underline underline-offset-2 decoration-dotted text-xs text-slate-500 font-mono">
                                                    {actor.metrics?.influence || '-'}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[300px] p-3 text-xs">
                                                <p className="font-semibold mb-2">Influence Quality: {actor.metrics?.influence}</p>
                                                {/* Dimensional Breakdown */}
                                                {actor.metrics?.territoriality !== undefined && (
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-[10px] text-slate-500">
                                                        <span>Territoriality:</span><span className="font-mono text-slate-900">{actor.metrics.territoriality}</span>
                                                        <span>Coding:</span><span className="font-mono text-slate-900">{actor.metrics.coding}</span>
                                                        <span>Centrality:</span><span className="font-mono text-slate-900">{actor.metrics.centrality}</span>
                                                    </div>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="text-right py-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className={`cursor-help decoration-slate-300 underline underline-offset-2 decoration-dotted text-xs font-mono font-bold ${(actor.metrics?.resistance === 'Strong' || (typeof actor.metrics?.resistance === 'number' && actor.metrics.resistance > 6)) ? 'text-red-500' : 'text-slate-400'
                                                    }`}>
                                                    {actor.metrics?.resistance || '-'}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[300px] p-3 text-xs">
                                                <p className="font-semibold mb-2">Resistance Quality: {actor.metrics?.resistance}</p>
                                                {/* Dimensional Breakdown */}
                                                {actor.metrics?.counter_conduct !== undefined && (
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-[10px] text-slate-500">
                                                        <span>Counter-Conduct:</span><span className="font-mono text-slate-900">{actor.metrics.counter_conduct}</span>
                                                        <span>Opposition:</span><span className="font-mono text-slate-900">{actor.metrics.discursive_opposition}</span>
                                                    </div>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell className="text-right py-2">
                                        {actor.url && (
                                            <a href={actor.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600" onClick={(e) => e.stopPropagation()}>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}
