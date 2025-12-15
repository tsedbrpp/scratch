import React from 'react';
import { EcosystemActor } from '@/types/ecosystem';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowUpDown } from 'lucide-react';

interface EcosystemTableProps {
    actors: EcosystemActor[];
    onSelectActor: (id: string) => void;
    selectedActorId: string | null;
}

export function EcosystemTable({ actors, onSelectActor, selectedActorId }: EcosystemTableProps) {
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof EcosystemActor | 'metrics.resistance' | 'metrics.influence'; direction: 'asc' | 'desc' } | null>(null);

    const sortedActors = React.useMemo(() => {
        let sortableActors = [...actors];
        if (sortConfig !== null) {
            sortableActors.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof EcosystemActor];
                let bValue: any = b[sortConfig.key as keyof EcosystemActor];

                // Handle nested metrics
                if (sortConfig.key === 'metrics.resistance') {
                    aValue = a.metrics?.resistance || 0;
                    bValue = b.metrics?.resistance || 0;
                } else if (sortConfig.key === 'metrics.influence') {
                    aValue = a.metrics?.influence || 0;
                    bValue = b.metrics?.influence || 0;
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

    return (
        <div className="rounded-md border bg-white overflow-y-auto max-h-[600px] shadow-sm">
            <Table>
                <TableCaption>A list of actors in the current ecosystem.</TableCaption>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[200px] cursor-pointer hover:bg-slate-100" onClick={() => requestSort('name')}>
                            Name <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-slate-400" />
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => requestSort('type')}>
                            Type <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-slate-400" />
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right cursor-pointer hover:bg-slate-100" onClick={() => requestSort('metrics.influence')}>
                            Influence <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-slate-400" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:bg-slate-100" onClick={() => requestSort('metrics.resistance')}>
                            Resistance <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-slate-400" />
                        </TableHead>
                        <TableHead className="text-right">Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedActors.map((actor) => (
                        <TableRow
                            key={actor.id}
                            className={`cursor-pointer transition-colors ${selectedActorId === actor.id ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'} ${actor.source === 'absence_fill' ? 'bg-amber-50/30' : ''}`}
                            onClick={() => onSelectActor(actor.id)}
                        >
                            <TableCell className="font-medium">
                                {actor.name}
                                {actor.source === 'absence_fill' && (
                                    <Badge variant="outline" className="ml-2 border-amber-300 text-amber-600 text-[10px] h-4 px-1">
                                        Recovered
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-normal text-xs">{actor.type}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate text-xs text-slate-500" title={actor.description}>
                                {actor.description}
                            </TableCell>
                            <TableCell className="text-right">{actor.metrics?.influence || '-'}</TableCell>
                            <TableCell className="text-right">
                                {actor.metrics?.resistance !== undefined && actor.metrics.resistance > 6 ? (
                                    <span className="text-red-600 font-bold">{actor.metrics.resistance}</span>
                                ) : (
                                    <span className="text-slate-500">{actor.metrics?.resistance || '-'}</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {actor.url && (
                                    <a href={actor.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600" onClick={(e) => e.stopPropagation()}>
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
