import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileType } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
    onFilesDropped: (files: File[]) => void;
    children?: React.ReactNode;
    className?: string;
    accept?: string[]; // e.g. ['.pdf', '.docx']
    isReadOnly?: boolean;
}

export function FileDropZone({
    onFilesDropped,
    children,
    className,
    accept = ['.pdf', '.docx', '.doc'],
    isReadOnly = false
}: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isReadOnly) return;
        setIsDragging(true);
    }, [isReadOnly]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set false if leaving the main container, not entering a child
        if (e.target === overlayRef.current) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isReadOnly) {
            e.dataTransfer.dropEffect = 'none';
            return;
        }
        e.dataTransfer.dropEffect = 'copy';
    }, [isReadOnly]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (isReadOnly) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        // Filter by extensions if provided
        const validFiles = files.filter(file => {
            const ext = '.' + file.name.split('.').pop()?.toLowerCase();
            return accept.includes(ext);
        });

        if (validFiles.length > 0) {
            onFilesDropped(validFiles);
        } else {
            // Maybe alert or callback error? For now silent rejection of invalid types.
            // Or we pass all and let parent decide. But filtering here is good UX.
            // Let's fallback to passing them if extension check is loose.
            // Actually, simplest is to pass them and let parent validate.
            // But for now, let's filter.
        }
    }, [onFilesDropped, accept, isReadOnly]);

    return (
        <div
            className={cn("relative transition-all", className)}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave} // Captures bubbling leaves from children
            onDrop={handleDrop}
        >
            {children}

            {/* Drag Overlay */}
            {isDragging && !isReadOnly && (
                <div
                    ref={overlayRef}
                    className="absolute inset-0 z-50 rounded-xl bg-indigo-50/90 border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
                    onDragLeave={() => setIsDragging(false)} // Double check leave on overlay
                    onDrop={handleDrop}
                >
                    <div className="bg-white p-4 rounded-full shadow-lg mb-4 pointer-events-none">
                        <Upload className="h-8 w-8 text-indigo-600 animate-bounce" />
                    </div>
                    <h3 className="text-xl font-bold text-indigo-900 pointer-events-none">Drop to Upload</h3>
                    <p className="text-indigo-600 font-medium pointer-events-none">PDF or Word Documents</p>
                </div>
            )}
        </div>
    );
}
