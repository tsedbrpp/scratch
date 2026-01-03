import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquarePlus } from "lucide-react";

interface RebuttalInputContext {
    dimensionKey: string;
    dimensionLabel: string;
    existingRebuttal?: string;
    onSave: (text: string) => void;
}

export function RebuttalButton({ dimensionKey, dimensionLabel, existingRebuttal, onSave }: RebuttalInputContext) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(existingRebuttal || "");

    const handleSave = () => {
        onSave(text);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-2 text-[10px] uppercase font-bold tracking-wider ${existingRebuttal ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                >
                    <MessageSquarePlus className="h-3 w-3 mr-1" />
                    {existingRebuttal ? "Edit Context" : "Contest"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-800">
                        <MessageSquarePlus className="h-5 w-5 text-purple-600" />
                        Contest: {dimensionLabel}
                    </DialogTitle>
                    <DialogDescription>
                        AI diagnosis is a starting point, not a verdict. Add your own expert context or rebuttal to this flag. This will be permanently attached to the specific "risk bit".
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="E.g. 'This centralization is necessary for immediate compliance enforcement...'"
                        className="min-h-[120px]"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-purple-600 text-white hover:bg-purple-700">Attach Rebuttal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
