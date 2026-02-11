import React from 'react';
import { OntologyNode } from '@/types/ontology';
import { getColorForCategory } from '@/lib/ontology-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface ConceptDetailsModalProps {
    selectedNode: OntologyNode | null;
    isOpen: boolean;
    onClose: () => void;
    // Optional fallback for static nodes if needed, though we should aim to remove static data dependency here
    isStatic?: boolean;
}

export function ConceptDetailsModal({ selectedNode, isOpen, onClose, isStatic = false }: ConceptDetailsModalProps) {
    if (!selectedNode) return null;

    const selectedNodeColors = {
        bg: selectedNode.color || getColorForCategory(selectedNode.category),
        text: "text-slate-900"
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${selectedNodeColors.bg}`}>
                                <Brain className={`h-6 w-6 ${selectedNodeColors.text}`} />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-slate-900">
                                    {selectedNode.label}
                                </DialogTitle>
                                <div className="mt-1">
                                    <Badge variant="outline" className={`${selectedNodeColors.text} ${selectedNodeColors.bg} border-0`}>
                                        {selectedNode.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                        <p className="text-slate-700 leading-relaxed">
                            {selectedNode.description || "No description available."}
                        </p>
                    </div>

                    {selectedNode.quote && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidence</h4>
                            <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r">
                                <p className="text-slate-700 italic">
                                    &quot;{selectedNode.quote}&quot;
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedNode.isGhost && selectedNode.whyAbsent && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider">👻 Why Absent?</h4>
                                <div className="flex gap-2">
                                    {selectedNode.exclusionType && (
                                        <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                                selectedNode.exclusionType === 'silenced' ? 'bg-orange-50 border-orange-300 text-orange-700' :
                                                selectedNode.exclusionType === 'marginalized' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                                                selectedNode.exclusionType === 'structurally-excluded' ? 'bg-red-50 border-red-300 text-red-700' :
                                                'bg-purple-50 border-purple-300 text-purple-700'
                                            }`}
                                        >
                                            {selectedNode.exclusionType.replace('-', ' ')}
                                        </Badge>
                                    )}
                                    {selectedNode.absenceStrength !== undefined && (
                                        <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                                selectedNode.absenceStrength >= 86 ? 'bg-red-50 border-red-400 text-red-700 font-bold' :
                                                selectedNode.absenceStrength >= 61 ? 'bg-orange-50 border-orange-300 text-orange-700' :
                                                selectedNode.absenceStrength >= 31 ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                                                'bg-slate-50 border-slate-300 text-slate-700'
                                            }`}
                                        >
                                            Strength: {selectedNode.absenceStrength}/100
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r">
                                <p className="text-slate-700">
                                    {selectedNode.whyAbsent}
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedNode.isGhost && selectedNode.potentialConnections && selectedNode.potentialConnections.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">Potential Connections</h4>
                            <div className="space-y-3">
                                {selectedNode.potentialConnections.map((conn, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-shrink-0 text-purple-500 font-semibold text-sm">→</div>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900 mb-1">
                                                    {conn.targetActor}
                                                </div>
                                                <div className="text-xs text-purple-600 italic mb-2">
                                                    {conn.relationshipType}
                                                </div>
                                                <div className="text-sm text-slate-600 leading-relaxed">
                                                    {conn.evidence}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedNode.isGhost && selectedNode.institutionalLogics && (
                        <div>
                            <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">Institutional Logics</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(selectedNode.institutionalLogics).map(([logic, strength]) => (
                                    <div key={logic} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                        <span className="text-sm text-slate-700 capitalize">{logic}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {Math.round(strength * 100)}%
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isStatic && (
                        <div className="text-xs text-slate-400 mt-4">
                            * This is a static example node.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
