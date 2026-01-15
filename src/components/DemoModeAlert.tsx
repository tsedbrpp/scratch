"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Lock } from "lucide-react";

export function DemoModeAlert() {
    const { isReadOnly } = useDemoMode();
    const hasAlerted = useRef(false);

    useEffect(() => {
        if (isReadOnly && !hasAlerted.current) {
            toast("Read-Only Demo Mode", {
                description: "Analyze, Search, and AI functionalities are disabled for unauthenticated users. You can view existing data but cannot generate new insights.",
                icon: <Lock className="h-4 w-4 text-amber-500" />,
                duration: 8000,
                position: "top-center",
                action: {
                    label: "Dismiss",
                    onClick: () => { }
                }
            });
            hasAlerted.current = true;
        }
    }, [isReadOnly]);

    return null;
}
