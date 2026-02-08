import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { CREDIT_PACKAGES, CreditPackage } from "@/config/pricing";

interface CreditTopUpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreditTopUpDialog({ open, onOpenChange }: CreditTopUpDialogProps) {
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES.standard);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: selectedPackage.id
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);
            if (!data.url) throw new Error("No checkout URL returned");

            // Redirect to Stripe
            window.location.href = data.url;

        } catch (error) {
            console.error(error);
            alert("Failed to initiate purchase. Please try again.");
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
                        {selectedPackage.promo?.bannerText && (
                            <div className="mt-2 bg-amber-50 text-amber-800 text-xs px-2 py-1.5 rounded-md border border-amber-200">
                                <strong>Note:</strong> {selectedPackage.promo.bannerText}
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-4">
                    {Object.values(CREDIT_PACKAGES).map((pack) => (
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
                            {pack.promo?.badge && (
                                <div className="absolute -top-2 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                                    {pack.promo.badge}
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

