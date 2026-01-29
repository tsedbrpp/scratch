"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableCardProps {
    title: React.ReactNode;
    children: React.ReactNode;
    width?: number | string;
    onClose: () => void;
    className?: string;
    initialX?: number;
    initialY?: number;
}

export function DraggableCard({
    title,
    children,
    width = 400,
    onClose,
    className,
    initialX = 50,
    initialY = 50
}: DraggableCardProps) {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            e.preventDefault(); // Prevent text selection

            const newX = e.clientX - dragStartPos.current.x;
            const newY = e.clientY - dragStartPos.current.y;

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only trigger drag if clicking the header itself, not buttons inside it
        if ((e.target as HTMLElement).closest('button')) return;

        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    return (
        <Card
            ref={cardRef}
            className={cn(
                "absolute z-50 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200 dark:border-slate-800 flex flex-col",
                className
            )}
            style={{
                left: position.x,
                top: position.y,
                width: width,
                maxHeight: '80vh',
                cursor: 'auto'
            }}
        >
            {/* Draggable Header */}
            <div
                className={cn(
                    "p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between select-none cursor-grab active:cursor-grabbing bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl",
                    isDragging && "cursor-grabbing"
                )}
                onMouseDown={handleMouseDown}
            >
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 pointer-events-none">
                    {title}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {children}
            </div>
        </Card>
    );
}
