import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EcosystemActor } from "@/types/ecosystem";
import { Loader2, Network } from "lucide-react";

interface MaterializeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialName: string;
    initialDescription: string;
    sourceContext: {
        sourceId: string;
        type: "accountability" | "legitimacy" | "cultural_absence" | "trace";
        detail: string;
    };
    onConfirm: (actor: Omit<EcosystemActor, "id">) => Promise<void>;
}

export function MaterializeDialog({
    isOpen,
    onClose,
    initialName,
    initialDescription,
    sourceContext,
    onConfirm
}: MaterializeDialogProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [type, setType] = useState<EcosystemActor["type"]>("Policymaker");
    const [roleType, setRoleType] = useState<EcosystemActor["role_type"]>("Mixed");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when dialog opens with new data
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setDescription(initialDescription);
            setIsSubmitting(false);

            // Heuristic for type
            if (sourceContext.type === "accountability") setType("Policymaker");
            if (sourceContext.type === "cultural_absence") setType("Civil Society");
        }
    }, [isOpen, initialName, initialDescription, sourceContext.type]);

    const handleConfirm = async () => {
        if (!name) return;
        setIsSubmitting(true);
        try {
            await onConfirm({
                name,
                description,
                type,
                role_type: roleType,
                influence: "Medium", // Default
                source: "default",
                materialized_from: {
                    source_id: sourceContext.sourceId,
                    context_type: sourceContext.type,
                    context_detail: sourceContext.detail
                }
            });
            onClose();
        } catch (error) {
            console.error("Failed to materialize actor:", error);
            // Optionally show error state
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-indigo-600" />
                        Materialize in Ecosystem
                    </DialogTitle>
                    <DialogDescription>
                        Convert this analysis insight into a persistent actor in the ecosystem graph.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Actor Type
                        </Label>
                        <Select value={type} onValueChange={(val: EcosystemActor["type"]) => setType(val)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Policymaker">Policymaker</SelectItem>
                                <SelectItem value="Civil Society">Civil Society</SelectItem>
                                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                <SelectItem value="Algorithm">Algorithm</SelectItem>
                                <SelectItem value="Startup">Startup</SelectItem>
                                <SelectItem value="Academic">Academic</SelectItem>
                                <SelectItem value="Dataset">Dataset</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Ontology
                        </Label>
                        <Select value={roleType} onValueChange={(val) => setRoleType(val as EcosystemActor["role_type"])}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Role Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Material">Material (Hardware/Bodies)</SelectItem>
                                <SelectItem value="Expressive">Expressive (Code/Law)</SelectItem>
                                <SelectItem value="Mixed">Mixed (Assemblage)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="desc" className="text-right pt-2">
                            Context
                        </Label>
                        <Textarea
                            id="desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3 h-20 text-xs"
                        />
                    </div>

                    <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 flex gap-2 border border-slate-100 italic">
                        <span className="font-bold not-italic">Source:</span>
                        {sourceContext.type.replace('_', ' ')} • {sourceContext.detail}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!name || isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Network className="mr-2 h-4 w-4" />
                                Add to Ecosystem
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
