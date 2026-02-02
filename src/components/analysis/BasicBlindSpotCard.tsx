"use client";

import React from 'react';
import { BlindSpotBasic } from '@/types';
import { Eye, Scale, Boxes, Clock, Globe } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';

interface BasicBlindSpotCardProps {
    spot: BlindSpotBasic;
}

const CATEGORY_CONFIG = {
    epistemic: { icon: Eye, color: 'purple', label: 'Epistemic' },
    power: { icon: Scale, color: 'red', label: 'Power' },
    materiality: { icon: Boxes, color: 'green', label: 'Materiality' },
    temporality: { icon: Clock, color: 'blue', label: 'Temporality' },
    coloniality: { icon: Globe, color: 'rose', label: 'Coloniality' }
};

/**
 * Tier 1: Basic structured blind spot with severity and category
 * Shows title, severity badge, and category icon
 */
export function BasicBlindSpotCard({ spot }: BasicBlindSpotCardProps) {
    const categoryConfig = spot.category ? CATEGORY_CONFIG[spot.category] : null;
    const CategoryIcon = categoryConfig?.icon;

    return (
        <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900 flex-1">{spot.title}</span>
                <SeverityBadge severity={spot.severity || 'medium'} />
            </div>
            {categoryConfig && CategoryIcon && (
                <div className="flex items-center gap-1.5">
                    <CategoryIcon className={`h-3 w-3 text-${categoryConfig.color}-600`} />
                    <span className="text-xs text-slate-500">{categoryConfig.label}</span>
                </div>
            )}
        </div>
    );
}
