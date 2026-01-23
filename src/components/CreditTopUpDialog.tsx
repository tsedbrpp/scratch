import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Coins, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditTopUpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const PACKAGES = [
    { id: 'standard', credits: 10, price: 10, name: "Standard Pack", popular: false },
    { id: 'pro', credits: 50, price: 45, name: "Pro Pack", popular: true, savings: "Save 10%" },
    { id: 'enterprise', credits: 100, price: 80, name: "Power User", popular: false, savings: "Save 20%" },
];

export function CreditTopUpDialog({ open, onOpenChange, onSuccess }: CreditTopUpDialogProps) {
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            // Mock Purchase
            const res = await fetch('/api/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedPackage.credits,
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
                        Select a credit package to run advanced AI analyses.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-4">
                    {PACKAGES.map((pack) => (
                        <div
                            key={pack.id}
                            onClick={() => setSelectedPackage(pack)}
                            className={cn(
                                "relative border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all",
                                selectedPackage.id === pack.id
                                    ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                                    : "bg-white border-slate-200 hover:border-indigo-200"
                            )}
                        >
                            {pack.popular && (
                                <div className="absolute -top-2 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Popular
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center",
                                    selectedPackage.id === pack.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{pack.name}</h4>
                                    <p className="text-xs text-slate-500">{pack.credits} Credits</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-slate-900">${pack.price}</div>
                                {pack.savings && (
                                    <div className="text-xs text-green-600 font-medium">{pack.savings}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex-col !space-x-0 gap-2 sm:flex-row sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handlePurchase} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Purchase {selectedPackage.credits} Credits - ${selectedPackage.price}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

