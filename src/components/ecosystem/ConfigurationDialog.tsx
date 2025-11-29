import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfigurationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    onConfirm: () => void;
}

export function ConfigurationDialog({
    isOpen,
    onClose,
    name,
    setName,
    description,
    setDescription,
    onConfirm
}: ConfigurationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Ecosystem Configuration</DialogTitle>
                    <DialogDescription>
                        Group selected actors into a unified entity for analysis.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g., The Dual Configuration"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                            placeholder="Briefly describe this configuration..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={!name}>
                        Create Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
