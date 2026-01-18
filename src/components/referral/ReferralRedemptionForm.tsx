"use client";

import { useActionState, useEffect } from "react";
import { redeemReferralCode } from "@/app/actions/referral";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const initialState = {
    success: false,
    error: "",
    message: ""
};

export function ReferralRedemptionForm() {
    const [state, formAction, isPending] = useActionState(redeemReferralCode, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form action={formAction} className="flex flex-col sm:flex-row gap-4 max-w-lg">
            <Input
                name="code"
                placeholder="Enter Code (e.g. TEA-XC92)"
                className="bg-slate-50 border-slate-300 font-mono uppercase placeholder:normal-case"
                required
            />
            <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
                disabled={isPending || state.success}
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Redeem Code
            </Button>
        </form>
    );
}
