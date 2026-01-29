import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText, Globe, Search, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

interface AssemblageExtractionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    // State
    isExtracting: boolean;
    extractionText: string;
    setExtractionText: (text: string) => void;

    // Actions
    onExtract: () => void;
}

export function AssemblageExtractionDialog({
    open,
    onOpenChange,
    isExtracting,
    extractionText,
    setExtractionText,
    onExtract
}: AssemblageExtractionDialogProps) {
    const [isFileUploading, setIsFileUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsFileUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/extract-file', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze document');
            }

            if (data.text) {
                setExtractionText(data.text);
                toast.success(`Extracted content from ${file.name}`);
            }
        } catch (error) {
            console.error('File upload failed:', error);
            toast.error('Failed to extract text from file.');
        } finally {
            setIsFileUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Extract & Trace Assemblage</DialogTitle>
                    <DialogDescription>
                        Identify actors, agencies, and relationships to populate the ecosystem.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">Source Text</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleFileUpload}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs gap-2"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        disabled={isFileUploading}
                                    >
                                        {isFileUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                                        {isFileUploading ? 'Extracting...' : 'Upload Doc'}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-1">
                                Paste research text or upload a document (PDF, DOCX, TXT).
                            </p>
                        </div>
                        <Textarea
                            placeholder="Paste text here or upload a document..."
                            value={extractionText}
                            onChange={(e) => setExtractionText(e.target.value)}
                            className="min-h-[200px] max-h-[400px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="shrink-0 pt-4 bg-white dark:bg-slate-950 z-20 relative">
                    <Button onClick={onExtract} disabled={isExtracting || !extractionText} className="bg-slate-900 text-white hover:bg-slate-800 w-full sm:w-auto">
                        {isExtracting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Tracing Text...
                            </>
                        ) : (
                            <>
                                <FileText className="mr-2 h-4 w-4" />
                                Trace Actors
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
