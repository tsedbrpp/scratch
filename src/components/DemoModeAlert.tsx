"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Lock } from "lucide-react";
import { usePathname } from "next/navigation";

export function DemoModeAlert() {
    const { isReadOnly } = useDemoMode();
    const hasAlerted = useRef(false);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname?.startsWith('/survey')) return;

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
    }, [isReadOnly, pathname]);

    if (pathname?.startsWith('/survey')) return null;
    return null;
}
