import React from 'react';
import { OntologyNode } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConceptListProps {
    nodes: OntologyNode[];
    selectedNodeId: string | null;
    onSelectNode: (nodeId: string) => void;
}

export function ConceptList({ nodes, selectedNodeId, onSelectNode }: ConceptListProps) {
    return (
        <div className="space-y-4 h-[600px] overflow-y-auto pr-2">
            <h3 className="text-lg font-semibold text-slate-900 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
                Actants and Ghost nodes
            </h3>
            <div className="space-y-3">
                {nodes.length > 0 ? (
                    nodes.map((node) => (
                        <Card
                            key={node.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${selectedNodeId === node.id ? 'ring-2 ring-indigo-500' : ''}`}
                            style={{ borderLeftColor: node.color || getColorForCategory(node.category) }}
                            onClick={() => onSelectNode(node.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-900">{node.label}</h4>
                                        {node.isGhost && <span className="text-sm">👻</span>}
                                    </div>
                                    <div className="flex gap-1">
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                            {node.category}
                                        </Badge>
                                        {node.isGhost && (
                                            <Badge className="text-[10px] px-1.5 py-0 h-5 bg-purple-600 text-white">
                                                Ghost
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {node.description && (
                                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                        {node.description}
                                    </p>
                                )}
                                {node.isGhost && node.ghostReason && (
                                    <div className="bg-purple-50 p-2 rounded text-[10px] text-purple-700 border-l-2 border-purple-600 mb-2">
                                        <span className="font-semibold">Why absent?</span> {node.ghostReason}
                                    </div>
                                )}
                                {node.quote && !node.isGhost && (
                                    <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-500 italic border-l-2 border-slate-200">
                                        &quot;{node.quote.substring(0, 80)}...&quot;
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400 text-sm">
                        No concepts found for this category.
                    </div>
                )}
            </div>
        </div>
    );
}
