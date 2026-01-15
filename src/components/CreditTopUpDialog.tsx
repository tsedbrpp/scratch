import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Coins } from "lucide-react";

interface CreditTopUpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreditTopUpDialog({ open, onOpenChange, onSuccess }: CreditTopUpDialogProps) {
    const [loading, setLoading] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            // Mock Purchase of 10 Credits
            const res = await fetch('/api/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 10,
                    referenceId: `purchase-${Date.now()}` // Mock distinct ID
                })
            });

            if (!res.ok) throw new Error("Purchase failed");

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            alert("Failed to purchase credits. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-indigo-600" />
                        Top Up Credits
                    </DialogTitle>
                    <DialogDescription>
                        You need credits to run advanced AI analyses.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="border rounded-lg p-4 bg-slate-50 flex items-center justify-between cursor-pointer ring-2 ring-indigo-500 bg-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Standard Pack</h4>
                                <p className="text-xs text-slate-500">10 Credits for $10.00</p>
                            </div>
                        </div>
                        <div className="text-lg font-bold text-indigo-700">$10</div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handlePurchase} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Purchase Credits
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
