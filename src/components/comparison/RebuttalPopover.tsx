"use client";

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Save, Flag } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface RebuttalPopoverProps {
    targetId: string; // Unique ID of the claim being contested
    initialRebuttal?: string;
    onSave: (targetId: string, text: string) => void;
    children: React.ReactNode;
}

export function RebuttalPopover({ targetId, initialRebuttal, onSave, children }: RebuttalPopoverProps) {
    const [text, setText] = useState(initialRebuttal || "");
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        onSave(targetId, text);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="group relative cursor-pointer border-b border-transparent hover:border-dashed hover:border-amber-400 transition-colors">
                    {children}
                    <div className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-500 hover:bg-amber-50 rounded-full">
                            {initialRebuttal ? <Flag className="h-3 w-3 fill-amber-500" /> : <MessageSquarePlus className="h-3 w-3" />}
                        </Button>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
                <div className="space-y-3">
                    <h4 className="font-medium text-xs flex items-center gap-2 text-slate-700">
                        <Flag className="h-3 w-3 text-amber-500" />
                        Rebut / Contest Claim
                    </h4>
                    <p className="text-[10px] text-slate-500">
                        Add your situated knowledge or contest this AI interpretation. This note will appear in reports.
                    </p>
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Why is this interpretation partial or incorrect?"
                        className="text-xs min-h-[80px]"
                    />
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleSave} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">
                            <Save className="h-3 w-3 mr-1" />
                            Save Note
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
