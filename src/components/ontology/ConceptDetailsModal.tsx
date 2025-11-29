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
