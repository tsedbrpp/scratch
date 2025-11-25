import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface AddDocumentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (title: string, description: string, pageCount: string, publicationDate: string, version: string) => void;
}

export function AddDocumentDialog({ open, onOpenChange, onAdd }: AddDocumentDialogProps) {
    const [newSource, setNewSource] = useState({
        title: "",
        description: "",
        pageCount: "",
        publicationDate: "",
        version: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(newSource.title, newSource.description, newSource.pageCount, newSource.publicationDate, newSource.version);
        setNewSource({ title: "", description: "", pageCount: "", publicationDate: "", version: "" });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" /> Add Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Policy Document</DialogTitle>
                    <DialogDescription>
                        Add a policy document manually or upload a PDF.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={newSource.title}
                                onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                                className="col-span-3"
                                required
                                placeholder="e.g., EU AI Act"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={newSource.description}
                                onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                                className="col-span-3"
                                required
                                placeholder="e.g., Official Journal Version"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pages" className="text-right">
                                Pages
                            </Label>
                            <Input
                                id="pages"
                                type="number"
                                value={newSource.pageCount}
                                onChange={(e) => setNewSource({ ...newSource, pageCount: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={newSource.publicationDate}
                                onChange={(e) => setNewSource({ ...newSource, publicationDate: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="version" className="text-right">
                                Version
                            </Label>
                            <Input
                                id="version"
                                value={newSource.version}
                                onChange={(e) => setNewSource({ ...newSource, version: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g., 1.0, Draft"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Document</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
