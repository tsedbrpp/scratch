import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, MapPin, GripHorizontal, Network } from 'lucide-react';
import { StudyCase, StudyState } from '@/lib/study-config';

interface StudyNavigatorProps {
    currentCase: StudyCase | undefined;
    studyState: StudyState;
    onNext: () => void;
    onPrev: () => void;
    onLocateNode: () => void;
    onSave: () => void;
    canAdvance: boolean;
}

export function StudyNavigator({
    currentCase,
    studyState,
    onNext,
    onPrev,
    onLocateNode,
    onSave,
    canAdvance,
}: StudyNavigatorProps) {
    // Drag functionality state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const startElemPos = useRef({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setPosition({
            x: startElemPos.current.x + dx,
            y: startElemPos.current.y + dy
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
    }, [handleMouseMove]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        e.preventDefault();

        dragStartPos.current = { x: e.clientX, y: e.clientY };
        startElemPos.current = { ...position };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'grabbing';
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [handleMouseMove, handleMouseUp]);


    if (!currentCase) return null;

    const totalCases = studyState.playlist.length;
    const currentCaseNumber = studyState.currentCaseIndex + 1;
    const progressPercent = (currentCaseNumber / totalCases) * 100;

    // Calculate estimated time remaining
    const casesRemaining = totalCases - currentCaseNumber;
    const estTimeRemaining = casesRemaining * 8;

    return (
        <Card
            className="fixed bottom-6 right-6 w-[350px] bg-white shadow-2xl border-t-4 border-t-purple-600 z-50 animate-in slide-in-from-bottom-10 fade-in transition-shadow will-change-transform"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                // Disable transition during drag for smoothness if needed, but 'transform' is usually fast enough. 
                // However, the initial animation might conflict. 
                // Let's rely on standard transform.
            }}
        >
            <CardContent className="p-4 space-y-4">
                {/* Drag Handle */}
                <div
                    className="flex justify-center -mt-2 -mx-4 py-1 cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors group"
                    onMouseDown={handleMouseDown}
                    title="Drag to move"
                >
                    <GripHorizontal className="text-slate-200 group-hover:text-slate-400 h-4 w-4 transition-colors" />
                </div>

                {/* Header / Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                        <span>Case {currentCaseNumber} of {totalCases}</span>
                        <div className="flex items-center gap-2">
                            <span>Est. Remaining: {estTimeRemaining}m</span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50"
                                onClick={onSave}
                                title="Save progress to file"
                            >
                                <Network className="h-3 w-3" /> {/* Using Network icon as placeholder, preferably Download/Save if imported */}
                                Save & Resume
                            </Button>
                        </div>
                    </div>
                    {/* Custom Progress Bar since component missing */}
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-600 transition-all duration-500 ease-in-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Current Case Title */}
                <div>
                    <h3 className="font-bold text-lg leading-tight text-foreground">
                        {currentCase.title}
                    </h3>
                    {currentCase.isCalibration && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            Calibration
                        </span>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onPrev}
                        disabled={studyState.currentCaseIndex === 0}
                        title="Review Previous Case"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="default"
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                        onClick={onLocateNode}
                        title="Evaluate this case"
                    >
                        <Network className="mr-2 h-4 w-4" />
                        Evaluate Case
                    </Button>

                    <Button
                        onClick={onNext}
                        disabled={!canAdvance}
                        className={!canAdvance ? "opacity-50" : ""}
                        title={canAdvance ? "Go to next case" : "Complete assessment to continue"}
                    >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
