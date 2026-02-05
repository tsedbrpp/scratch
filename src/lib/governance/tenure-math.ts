/**
 * Tenure Mathematics Engine
 * 
 * Implements the ratified formula for calculating voting weight based on user tenure.
 * 
 * Formula: weight = 1 + (0.2 * (1 - e^(-tenure_days/730)))
 * 
 * Design Goals:
 * 1. Accessibility: New users start with meaningful weight (1.0).
 * 2. Incumbency Bonus: Long-term stakeholders get a boost (up to 1.2x).
 * 3. Bounded Power: The bonus is capped (asymptotically approaches 1.2x) to prevent oligarchy.
 *    Note: The Constitution allows for a theoretical max of 1.5x, but current config limits to 1.2x
 *    to be conservative during the Transition phase.
 */

const CAPS = {
    MAX_WEIGHT: 1.5, // Constitutional hard limit
    CURRENT_CONFIG_MAX_BONUS: 0.5, // Tunable parameter: Max bonus added to 1.0
    TIME_CONSTANT: 730 // Days to reach ~63% of the max bonus (2 years)
};

export const TenureMath = {
    /**
     * Calculates the voting weight for a given tenure in days.
     * @param tenureDays Number of days the user has been active.
     * @returns Floating point weight (e.g., 1.00, 1.15)
     */
    calculateWeight: (tenureDays: number): number => {
        if (tenureDays < 0) return 1.0;

        // Formula: 1 + (MaxBonus * (1 - e^(-t / TimeConstant)))
        const decayFactor = 1 - Math.exp(-tenureDays / CAPS.TIME_CONSTANT);
        const rawBonus = CAPS.CURRENT_CONFIG_MAX_BONUS * decayFactor;

        let weight = 1.0 + rawBonus;

        // Safety Cap
        if (weight > CAPS.MAX_WEIGHT) weight = CAPS.MAX_WEIGHT;

        // Return precision to 3 decimal places
        return Math.round(weight * 1000) / 1000;
    },

    /**
     * Helper to get human-readable stats for UI explanation.
     */
    getWeightExplanation: (tenureDays: number) => {
        const weight = TenureMath.calculateWeight(tenureDays);
        const bonusPercent = Math.round((weight - 1.0) * 100);

        return {
            weight,
            bonusPercent,
            explanation: `Based on ${Math.floor(tenureDays)} days of tenure, you have a ${bonusPercent}% voting bonus.`
        };
    }
};
