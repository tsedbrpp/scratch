"use client";

import { useSources } from "@/hooks/useSources";
import { Dashboard } from "@/components/Dashboard";

export default function DashboardPage() {
    // This hook gets read-only data for demo user if unauthenticated and demo mode is on
    const { sources } = useSources();

    return (
        <div className="container mx-auto max-w-7xl">
            <Dashboard sources={sources} />
        </div>
    );
}
