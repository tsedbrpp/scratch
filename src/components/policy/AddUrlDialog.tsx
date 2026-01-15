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
} from "@/components/ui/dialog";
import { Globe, Loader2 } from "lucide-react";

interface AddUrlDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (url: string) => Promise<void>;
}

export function AddUrlDialog({ open, onOpenChange, onAdd }: AddUrlDialogProps) {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        setError(null);
        try {
            await onAdd(url);
            setUrl("");
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch URL");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add from Website</DialogTitle>
                    <DialogDescription>
                        Enter a URL to fetch and analyze content from a webpage.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="url" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="col-span-3"
                                required
                                placeholder="https://example.com/article"
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-500 text-center">
                                {error}
                            </div>
                        )}
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800">
                            <strong>Disclaimer:</strong> By using this feature, you confirm that you have the right to access and analyze the content from the provided URL. You are responsible for ensuring compliance with the target site&apos;s Terms of Service.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Fetching...
                                </>
                            ) : (
                                <>
                                    <Globe className="mr-2 h-4 w-4" />
                                    Fetch & Add
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
