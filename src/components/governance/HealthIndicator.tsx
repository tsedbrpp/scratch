import React from 'react';
import { Loader2, ShieldCheck, ShieldAlert, AlertTriangle, FileWarning, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EscalationStatus } from '@/types/escalation';

interface HealthIndicatorProps {
    status: EscalationStatus | null;
    isAnalyzing: boolean;
    className?: string;
    onClick?: () => void;
}

export function HealthIndicator({ status, isAnalyzing, className, onClick }: HealthIndicatorProps) {
    if (isAnalyzing) {
        return (
            <div className={cn("flex items-center gap-2 text-xs text-slate-500 animate-pulse px-3 py-2", className)}>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Analyzing Risks...</span>
            </div>
        );
    }

    if (!status || status.level === 'NONE') {
        return (
            <button
                onClick={onClick}
                className={cn("flex items-center gap-2 text-xs text-emerald-600 px-3 py-2 rounded-md border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors w-full", className)}
            >
                <ShieldCheck className="h-4 w-4" />
                <span className="font-medium">Governance: Healthy</span>
            </button>
        );
    }

    let content: React.ReactNode;
    let styleClass: string;

    switch (status.status) {
        case 'DETECTED':
            styleClass = "text-rose-600 bg-rose-50 border-rose-200";
            content = (
                <>
                    {status.rationale?.includes('Sentinel') ? (
                        <Sparkles className="h-4 w-4 animate-pulse" />
                    ) : (
                        <ShieldAlert className="h-4 w-4" />
                    )}
                    <span className="font-bold">{status.rationale?.includes('Sentinel') ? 'Pattern Detected' : 'Risk Detected'}</span>
                </>
            );
            break;
        case 'OVERRIDDEN':
            styleClass = "text-amber-600 bg-amber-50 border-amber-200";
            content = (
                <>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-bold">Risk Overridden</span>
                </>
            );
            break;
        case 'DEFERRED':
            styleClass = "text-indigo-600 bg-indigo-50 border-indigo-200";
            content = (
                <>
                    <FileWarning className="h-4 w-4" />
                    <span className="font-bold">Structural Deferral</span>
                </>
            );
            break;
        case 'RESOLVED':
            styleClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
            content = (
                <>
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-bold">Risk Resolved</span>
                </>
            );
            break;
        default:
            return null;
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 text-xs px-3 py-2 rounded-md border transition-all hover:opacity-90 w-full",
                styleClass,
                className
            )}
        >
            {content}
        </button>
    );
}
