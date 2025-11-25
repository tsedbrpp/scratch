import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Source } from "@/types";

interface ViewSourceDialogProps {
    source: Source | null;
    onOpenChange: (open: boolean) => void;
}

export function ViewSourceDialog({ source, onOpenChange }: ViewSourceDialogProps) {
    return (
        <Dialog open={!!source} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{source?.title}</DialogTitle>
                    <DialogDescription>
                        Extracted text content from {source?.type}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-md border border-slate-200 text-sm font-mono whitespace-pre-wrap">
                    {source?.extractedText || "No text content available."}
                </div>
            </DialogContent>
        </Dialog>
    );
}
