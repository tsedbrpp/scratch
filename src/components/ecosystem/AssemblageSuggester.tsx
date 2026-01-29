import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Network, RefreshCw, Layers } from 'lucide-react';
import { EcosystemActor, EcosystemEdge, EcosystemConfiguration } from '@/types/ecosystem';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AssemblageSuggesterProps {
    actors: EcosystemActor[];
    edges: EcosystemEdge[];
    configurations: EcosystemConfiguration[];
    onCreateAssemblage: (name: string, actorIds: string[]) => void;
}

interface Suggestion {
    id: number;
    nodes: string[];
    diversityScore: number;
    metrics: {
        humanCount: number;
        nonHumanCount: number;
        size: number;
    };
    name: string;
}

export function AssemblageSuggester({ actors, edges, configurations, onCreateAssemblage }: AssemblageSuggesterProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleSuggest = React.useCallback(async () => {
        setIsCalculating(true);
        try {
            // [AI-ENHANCED] Call Server-Side Detection
            const response = await fetch('/api/assemblages/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actors,
                    edges: edges.map(e => ({
                        source: typeof e.source === 'object' && 'id' in e.source ? (e.source as EcosystemActor).id : String(e.source),
                        target: typeof e.target === 'object' && 'id' in e.target ? (e.target as EcosystemActor).id : String(e.target),
                        type: e.type
                    })),
                    config: {
                        alpha: 1.0, // Balance Semantic/Structural
                        similarityThreshold: 0.75
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Detection failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            if (data.suggestions) {
                // Filter out suggestions that match existing configurations
                const filteredSuggestions = data.suggestions.filter((suggestion: Suggestion) => {
                    // Check if an assemblage with this name already exists
                    const nameExists = configurations.some(config =>
                        config.name.toLowerCase() === suggestion.name.toLowerCase()
                    );
                    if (nameExists) return false;

                    // Check if this exact set of nodes already exists in a configuration
                    const suggestionNodeSet = new Set(suggestion.nodes);
                    return !configurations.some(config => {
                        const configNodeSet = new Set(config.memberIds);
                        // Check if sets are equal (same size and all elements match)
                        if (suggestionNodeSet.size !== configNodeSet.size) return false;
                        return Array.from(suggestionNodeSet).every(node => configNodeSet.has(node));
                    });
                });
                setSuggestions(filteredSuggestions);
            }

        } catch (error) {
            console.error("Failed to suggest assemblages:", error);
            setSuggestions([]);
        } finally {
            setIsCalculating(false);
        }
    }, [actors, edges]);

    useEffect(() => {
        if (isOpen) {
            handleSuggest();
        }
    }, [isOpen, handleSuggest]);
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Suggest Assemblages
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white" align="start">
                <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Network className="h-4 w-4 text-slate-500" />
                        Assemblage Scout
                    </h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSuggest} disabled={isCalculating}>
                        <RefreshCw className={`h-3.5 w-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <ScrollArea className="h-[300px] p-3">
                    {isCalculating ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                            <RefreshCw className="h-6 w-6 animate-spin opacity-20" />
                            <span className="text-xs">Analyzing network topology...</span>
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            No strong assemblages detected.<br />Try adding more connections.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suggestions.map((s, idx) => (
                                <div key={idx} className="border rounded-md p-3 hover:bg-slate-50 transition-colors group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-sm text-slate-800">{s.name}</div>
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <span>{s.metrics.size} Actors</span>
                                                <span>&bull;</span>
                                                <span>{s.metrics.humanCount} Human</span>
                                                <span>/</span>
                                                <span>{s.metrics.nonHumanCount} Non-Human</span>
                                            </div>
                                        </div>
                                        <Badge variant={s.diversityScore > 0.7 ? "default" : "secondary"} className="text-[10px] h-5">
                                            Div: {(s.diversityScore * 100).toFixed(0)}%
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>Socio-Technical Heterogeneity</span>
                                        </div>
                                        <Progress value={s.diversityScore * 100} className="h-1" />
                                    </div>

                                    {/* Display actor names in this assemblage */}
                                    <div className="mb-3 p-2 bg-slate-50 rounded border border-slate-100">
                                        <div className="text-[10px] font-medium text-slate-600 mb-1">Actors:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {s.nodes.map((nodeId) => {
                                                const actor = actors.find(a => a.id === nodeId);
                                                return actor ? (
                                                    <Badge
                                                        key={nodeId}
                                                        variant="outline"
                                                        className="text-[9px] px-1.5 py-0 h-4 bg-white"
                                                    >
                                                        {actor.name}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full text-xs h-7 gap-1"
                                        onClick={() => {
                                            onCreateAssemblage(s.name, s.nodes);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <Layers className="h-3 w-3" />
                                        Form Assemblage
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t bg-slate-50 text-[10px] text-slate-400 text-center">
                    Powered by AI-Enhanced Louvain (Semantically Aware)
                </div>
            </PopoverContent>
        </Popover>
    );
}
