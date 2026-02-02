import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextHighlightDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    text: string;
    highlightText: string;
    sourceTitle?: string;
}

export function TextHighlightDialog({ open, onOpenChange, text, highlightText, sourceTitle }: TextHighlightDialogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLSpanElement>(null);

    // Auto-scroll to highlight when opened
    useEffect(() => {
        if (open && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [open, highlightText]);

    // Simple text fragment finder
    // We attempt to find the highlightText in the text and wrap it.
    // Since fuzzy matching is complex, we'll try a direct search first.
    // If exact match fails, we might just show the text at the top.

    // Note: To support fuzzy "pinpointing", this ideally would take an INDEX passed from the analysis,
    // but right now we only have the text string. 
    // We will do a robust normalization match here for display purposes.

    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

    // Split text into [before, match, after]
    let contentNode: React.ReactNode = <div className="text-sm font-mono whitespace-pre-wrap">{text}</div>;

    if (highlightText) {
        const index = text.toLowerCase().indexOf(highlightText.toLowerCase());

        if (index !== -1) {
            const before = text.substring(0, index);
            const match = text.substring(index, index + highlightText.length);
            const after = text.substring(index + highlightText.length);

            contentNode = (
                <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-600">
                    {before}
                    <span
                        ref={highlightRef}
                        className="bg-yellow-200 text-slate-900 px-1 py-0.5 rounded font-bold border-b-2 border-yellow-400"
                    >
                        {match}
                    </span>
                    {after}
                </div>
            );
        } else {
            // Fallback: Try normalized matching just for locating approximate position?
            // Or just show text.
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>Source Text Verification</span>
                        {sourceTitle && <Badge variant="outline" className="font-normal">{sourceTitle}</Badge>}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden border rounded-md bg-slate-50 relative">
                    <ScrollArea className="h-full max-h-[60vh] p-4">
                        {contentNode}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
