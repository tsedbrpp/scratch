"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface DraggablePanelProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose?: () => void;
    defaultPosition?: { x: number; y: number };
    className?: string;
    width?: string | number;
}

export function DraggablePanel({
    title,
    children,
    isOpen,
    onClose,
    defaultPosition = { x: 20, y: 20 },
    className,
    width = 320
}: DraggablePanelProps) {
    const [position, setPosition] = useState(defaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Mobile Detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMobile) return;
        setIsDragging(true);
        const rect = panelRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                // Constraints: Keep within viewport (roughly)
                const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
                const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    if (!isOpen) return null;

    // Mobile: Bottom Sheet Style
    if (isMobile) {
        return (
            <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85vh] bg-white border-t border-slate-200 shadow-2xl rounded-t-xl animate-in slide-in-from-bottom-10 duration-300">
                <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl shrink-0">
                    <div className="w-10" /> {/* Spacer */}
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" /> {/* Grab Handle Visual */}
                    <div className="w-10 flex justify-end">
                        {onClose && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                    <h3 className="font-semibold text-lg mb-4">{title}</h3>
                    {children}
                </div>
            </div>
        );
    }

    // Desktop: Draggable Floating Window
    return (
        <Card
            ref={panelRef}
            className={cn(
                "fixed z-50 bg-white/95 backdrop-blur-md shadow-xl border-slate-200/60 transition-shadow duration-200 flex flex-col overflow-hidden",
                isDragging ? "shadow-2xl cursor-grabbing select-none" : "shadow-xl",
                className
            )}
            style={{
                left: position.x,
                top: position.y,
                width: isMinimized ? 'auto' : width,
                height: isMinimized ? 'auto' : 'auto',
                maxHeight: isMinimized ? 'auto' : '85vh',
            }}
        >
            {/* Header / Drag Handle */}
            <div
                className={cn(
                    "flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/80 cursor-grab active:cursor-grabbing",
                    isMinimized ? "rounded-lg border-none" : ""
                )}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <GripHorizontal className="h-4 w-4 text-slate-400" />
                    <span className="truncate max-w-[150px]">{title}</span>
                </div>
                <div className="flex items-center gap-1 pl-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    </Button>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={onClose}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 relative min-h-[0px]">
                    {children}
                </div>
            )}
        </Card>
    );
}
