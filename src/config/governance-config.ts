/**
 * Governance Constitutional Configuration
 * Defines the progression of system phases from Genesis.
 */

export const GENESIS_TIMESTAMP = new Date('2025-01-01T00:00:00Z').getTime();

export const PHASE_DURATIONS = {
    FOUNDING: 90 * 24 * 60 * 60 * 1000,   // 3 Months
    TRANSITION: 180 * 24 * 60 * 60 * 1000 // 6 Months (Cumulative)
};

export const VETO_CONFIG = {
    MAX_TRANSITION_VETOES: 3
};
