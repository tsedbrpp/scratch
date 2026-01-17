"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted/closed
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-slate-900 border border-slate-700 text-slate-200 p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="font-bold text-white text-sm mb-1">🍪 Cookie Notice</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        We use essential cookies to ensure the site functions properly (authentication & payments). We do not track you for ads.
                    </p>
                </div>
                <button
                    onClick={handleAccept}
                    className="text-slate-500 hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="flex items-center gap-3 pt-1">
                <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-medium"
                    onClick={handleAccept}
                >
                    Acknowledge
                </Button>
                <Link href="/privacy" className="w-full">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 h-8 text-xs"
                    >
                        Privacy Policy
                    </Button>
                </Link>
            </div>
        </div>
    );
}
