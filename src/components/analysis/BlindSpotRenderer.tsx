import React from 'react';
import { BlindSpot } from '@/types';
import { LegacyBlindSpot } from './LegacyBlindSpot';
import { BasicBlindSpotCard } from './BasicBlindSpotCard';
import { EnhancedBlindSpotCard } from './EnhancedBlindSpotCard';
import { isBlindSpotString, isBlindSpotBasic, isBlindSpotEnhanced, isBlindSpotInteractive } from '@/utils/blindSpotHelpers';

interface BlindSpotRendererProps {
    spot: BlindSpot;
    index: number;
    onReAnalyze?: (spotId: string) => void;
    onMarkAddressed?: (spotId: string) => void;
}

/**
 * Smart renderer that detects blind spot tier and routes to appropriate component
 * Supports progressive enhancement from Tier 0 (string) to Tier 3 (interactive)
 */
export function BlindSpotRenderer({ spot, index, onReAnalyze, onMarkAddressed }: BlindSpotRendererProps) {
    // Tier 0: Legacy string
    if (isBlindSpotString(spot)) {
        return <LegacyBlindSpot text={spot} index={index} />;
    }

    // Tier 3: Interactive
    if (isBlindSpotInteractive(spot)) {
        return (
            <EnhancedBlindSpotCard
                spot={spot}
                onReAnalyze={onReAnalyze}
                onMarkAddressed={onMarkAddressed}
            />
        );
    }

    // Tier 2: Enhanced
    if (isBlindSpotEnhanced(spot)) {
        return <EnhancedBlindSpotCard spot={spot} />;
    }

    // Tier 1: Basic
    if (isBlindSpotBasic(spot)) {
        return <BasicBlindSpotCard spot={spot} />;
    }

    // Fallback to legacy for unknown types
    return <LegacyBlindSpot text={spot.title || 'Unknown blind spot'} index={index} />;
}
