import React from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { Source } from "@/types";
import { AnalysisResults } from "@/components/policy/AnalysisResults";
import { Button } from "@/components/ui/button";
import { EcosystemActor } from "@/types/ecosystem";

interface PolicyFocusViewProps {
    source: Source;
    onUpdateSource: (updates: Partial<Source>) => Promise<void>;
    onClose: () => void;
}

export function PolicyFocusView({ source, onUpdateSource, onClose }: PolicyFocusViewProps) {
    // Dynamic key for this specific document's ecosystem actors
    // This hook automatically handles fetching and persisting to the correct key
    const [actors, setActors] = useServerStorage<EcosystemActor[]>(`ecosystem_actors_${source.id}`, []);

    const handleAddActor = async (actor: EcosystemActor) => {
        // We only need to update the state. The hook handles the server persistence.
        // We rely on the hook's internal logic to write to `ecosystem_actors_${source.id}`.
        setActors(prev => [...prev, actor]);
        alert(`Actor "${actor.name}" added to Ecosystem!`);
    };

    return (
        <div className="fixed inset-0 z-50 bg-white p-6 overflow-auto animate-in slide-in-from-bottom-10">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Focus Mode: {source.title}</h2>
                    <Button variant="outline" onClick={onClose}>Close Focus</Button>
                </div>
                <div className="grid grid-cols-1 gap-8">
                    <div className="">
                        {source.analysis ? (
                            <AnalysisResults
                                analysis={source.analysis}
                                sourceTitle={source.title}
                                sourceId={source.id}
                                ecosystemActors={actors} // Pass the specific actors for this doc
                                onUpdate={async (updates) => {
                                    await onUpdateSource({
                                        analysis: { ...source.analysis!, ...updates }
                                    });
                                }}
                                onAddActor={handleAddActor}
                                onViewActor={(name) => {
                                    alert(`Actor "${name}" already exists in this ecosystem graph.`);
                                    // Future: could navigate to /ecosystem?policyId={source.id}&actor={name}
                                }}
                            />
                        ) : (
                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-500 italic">No analysis data available for this document yet.</p>
                                <Button
                                    variant="default"
                                    className="mt-4"
                                    onClick={onClose}
                                >
                                    Go back and run analysis
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
