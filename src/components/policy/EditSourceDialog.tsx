"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Source } from "@/types";

interface EditSourceDialogProps {
    source: Source | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (sourceId: string, updates: Partial<Source>) => Promise<void>;
}

export function EditSourceDialog({ source, open, onOpenChange, onSave }: EditSourceDialogProps) {
    const [title, setTitle] = useState(source?.title || "");
    const [description, setDescription] = useState(source?.description || "");
    const [publicationDate, setPublicationDate] = useState(source?.publicationDate || "");
    const [version, setVersion] = useState(source?.version || "");
    const [jurisdiction, setJurisdiction] = useState(source?.jurisdiction || "");
    const [pageCount, setPageCount] = useState(source?.pageCount?.toString() || "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (source) {
            setTitle(source.title);
            setDescription(source.description);
            setPublicationDate(source.publicationDate || "");
            setVersion(source.version || "");
            setJurisdiction(source.jurisdiction || "");
            setPageCount(source.pageCount?.toString() || "");
        }
    }, [source]);

    const handleSave = async () => {
        if (!source) return;

        setIsSaving(true);
        try {
            const updates: Partial<Source> = {
                title,
                description,
                publicationDate: publicationDate || undefined,
                version: version || undefined,
                jurisdiction: (jurisdiction as Source["jurisdiction"]) || undefined,
                pageCount: pageCount ? parseInt(pageCount) : undefined,
            };

            await onSave(source.id, updates);
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving source:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Source</DialogTitle>
                    <DialogDescription>
                        Update source metadata and details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Document title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Document description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="publicationDate">Publication Date</Label>
                            <Input
                                id="publicationDate"
                                type="date"
                                value={publicationDate}
                                onChange={(e) => setPublicationDate(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Required for Temporal Dynamics
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="version">Version</Label>
                            <Input
                                id="version"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                placeholder="e.g., 1.0, Draft"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jurisdiction">Jurisdiction</Label>
                            <Input
                                id="jurisdiction"
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                                placeholder="e.g., EU, Brazil, US"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pageCount">Page Count</Label>
                            <Input
                                id="pageCount"
                                type="number"
                                value={pageCount}
                                onChange={(e) => setPageCount(e.target.value)}
                                placeholder="Number of pages"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !title}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
