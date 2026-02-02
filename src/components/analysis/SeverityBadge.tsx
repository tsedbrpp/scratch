"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
    severity: string | 'high' | 'medium' | 'low';
    className?: string;
}

/**
 * Accessible Severity Badge with icons and color-blind safe palettes
 */
export function SeverityBadge({ severity, className = "" }: SeverityBadgeProps) {
    const s = severity.toLowerCase();

    const config = {
        high: {
            label: 'High Severity',
            color: 'bg-red-100 text-red-700 border-red-200',
            icon: ShieldAlert,
            description: 'Critical epistemic gap affecting analysis validity'
        },
        medium: {
            label: 'Medium Severity',
            color: 'bg-amber-100 text-amber-700 border-amber-200',
            icon: AlertTriangle,
            description: 'Significant omission or assumption'
        },
        low: {
            label: 'Low Severity',
            color: 'bg-slate-100 text-slate-700 border-slate-200',
            icon: Info,
            description: 'Minor detail or subtle preference'
        }
    }[s] || {
        label: severity,
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: AlertCircle,
        description: 'Blind spot detected'
    };

    const StatusIcon = config.icon;

    return (
        <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${config.color} ${className}`}
            title={config.description}
            aria-label={config.label}
        >
            <StatusIcon className="h-3 w-3" aria-hidden="true" />
            <span>{config.label}</span>
        </Badge>
    );
}
