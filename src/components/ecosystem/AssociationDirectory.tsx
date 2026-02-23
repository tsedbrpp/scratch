import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, X, Activity, Filter, ArrowRight } from 'lucide-react';
import { EcosystemActor } from '@/types/ecosystem';

interface AssociationDirectoryProps {
    links: any[]; // The processed links array from EcosystemMap
    actors: EcosystemActor[]; // The merged/hydrated actors
    onSelectLink: (link: any) => void;
    onClose: () => void;
}

export function AssociationDirectory({ links, actors, onSelectLink, onClose }: AssociationDirectoryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterClassification, setFilterClassification] = useState<string>('all');

    // Create a quick lookup for actor names if needed (though links often have IDs or Node objects)
    const actorMap = useMemo(() => {
        const map = new Map<string, string>();
        actors.forEach(a => map.set(a.id, a.name));
        return map;
    }, [actors]);

    const getActorName = (actorOrId: any) => {
        if (!actorOrId) return 'Unknown';
        if (typeof actorOrId === 'string') return actorMap.get(actorOrId) || actorOrId;
        if (typeof actorOrId === 'object' && actorOrId.name) return actorOrId.name;
        if (typeof actorOrId === 'object' && actorOrId.id) return actorMap.get(actorOrId.id) || actorOrId.id;
        return 'Unknown';
    };

    // Extract unique interaction types for the filter dropdown
    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        links.forEach(l => {
            if (l.type) types.add(l.type);
        });
        return Array.from(types).sort();
    }, [links]);

    // Extract unique classifications for the filter dropdown
    const availableClassifications = useMemo(() => {
        const classes = new Set<string>();
        links.forEach(l => {
            if (l.analysis?.classification) classes.add(l.analysis.classification);
        });
        return Array.from(classes).sort();
    }, [links]);

    const filteredLinks = useMemo(() => {
        return links.filter(link => {
            const sourceName = getActorName(link.source).toLowerCase();
            const targetName = getActorName(link.target).toLowerCase();
            const linkType = (link.type || '').toLowerCase();
            const linkDesc = (link.description || '').toLowerCase();
            const query = searchQuery.toLowerCase();

            const matchesSearch = !query ||
                sourceName.includes(query) ||
                targetName.includes(query) ||
                linkType.includes(query) ||
                linkDesc.includes(query);

            const matchesType = filterType === 'all' || link.type === filterType;
            const matchesClass = filterClassification === 'all' || link.analysis?.classification === filterClassification;

            return matchesSearch && matchesType && matchesClass;
        }).sort((a, b) => {
            // Sort by mediator score if available, otherwise by type
            const scoreA = a.analysis?.mediatorScore || 0;
            const scoreB = b.analysis?.mediatorScore || 0;
            if (scoreA !== scoreB) return scoreB - scoreA;
            return (a.type || '').localeCompare(b.type || '');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [links, searchQuery, filterType, filterClassification, actorMap]);

    return (
        <Card className="flex flex-col h-full w-[350px] shadow-xl border-l border-slate-200 bg-white/95 backdrop-blur-sm rounded-none absolute right-0 top-0 z-50 animate-in slide-in-from-right-full duration-300">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between shrink-0 bg-white">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-900 tracking-tight">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    Association Directory
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100" onClick={onClose}>
                    <X className="h-4 w-4 text-slate-500" />
                </Button>
            </CardHeader>
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 shrink-0 space-y-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search actors, types, or descriptions..."
                        className="pl-9 h-9 text-xs bg-white border-slate-200 focus-visible:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <select
                        className="flex-1 text-xs border border-slate-200 rounded-md h-8 px-2 bg-white outline-none focus:border-indigo-500 text-slate-700 w-1/2"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        {availableTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <select
                        className="flex-1 text-xs border border-slate-200 rounded-md h-8 px-2 bg-white outline-none focus:border-indigo-500 text-slate-700 w-1/2"
                        value={filterClassification}
                        onChange={(e) => setFilterClassification(e.target.value)}
                    >
                        <option value="all">All Profiles</option>
                        {availableClassifications.map(c => (
                            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            <CardContent className="p-0 flex-1 overflow-hidden bg-slate-50/30">
                <ScrollArea className="h-full">
                    {filteredLinks.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                            <Activity className="h-8 w-8 text-slate-200 block" />
                            <p>No associations found matching criteria.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredLinks.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelectLink(link)}
                                    className="w-full text-left p-3 hover:bg-indigo-50 transition-colors group relative"
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <div className="flex items-center gap-1.5 flex-wrap flex-1 pr-2">
                                            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]" title={getActorName(link.source)}>
                                                {getActorName(link.source)}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                                            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]" title={getActorName(link.target)}>
                                                {getActorName(link.target)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        <span className="text-[10px] uppercase font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex-shrink-0">
                                            {link.type}
                                        </span>
                                        {link.flow_type && (
                                            <span className="text-[9px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
                                                {link.flow_type} flow
                                            </span>
                                        )}
                                        {link.analysis?.classification && (
                                            <span className="text-[9px] uppercase font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex-shrink-0">
                                                {link.analysis.classification.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                        {link.analysis?.mediatorScore !== undefined && (
                                            <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
                                                score: {link.analysis.mediatorScore.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    {link.description && (
                                        <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-1 italic">
                                            {link.description}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <div className="p-2 border-t border-slate-100 bg-white shrink-0">
                <p className="text-[10px] text-center text-slate-400 font-medium">
                    Showing {filteredLinks.length} of {links.length} total associations
                </p>
            </div>
        </Card>
    );
}
