"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PromptViewer } from "./PromptViewer";
import { ProvenanceViewer } from "./ProvenanceViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptMetadata, ProvenanceChain } from "@/types/provenance";

interface PromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    metadata?: PromptMetadata;
    provenance?: ProvenanceChain;
}

/**
 * Modal dialog for displaying prompt metadata and provenance chain
 * Provides tabbed interface for "Show Prompt" and "Trace Provenance" features
 */
export function PromptDialog({ open, onOpenChange, metadata, provenance }: PromptDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Analysis Transparency</DialogTitle>
                    <DialogDescription>
                        View the complete reasoning chain and prompt metadata for this analysis
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="prompt" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="prompt">Show Prompt</TabsTrigger>
                        <TabsTrigger value="provenance">Trace Provenance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="prompt" className="mt-4">
                        <PromptViewer metadata={metadata} />
                    </TabsContent>

                    <TabsContent value="provenance" className="mt-4">
                        <ProvenanceViewer provenance={provenance} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
