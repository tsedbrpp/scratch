/**
 * Narrative Interpretation Utilities
 * 
 * Converts numerical scores and metrics into rich qualitative narratives
 * for I&O journal-style interpretive analysis.
 */

export interface RiskAnalysis {
    score: number;
    level: "Interpretive" | "Directional Drift" | "Micro-Fascist Hardening";
    flags: Record<string, boolean>;
}

export interface CapacityAnalysis {
    score: number;
    level: "Rhetorical/Fragile" | "Partial/Conditional" | "Structural/Robust";
    signals: Record<string, boolean>;
}

/**
 * Generate narrative interpretation of micro-fascism risk analysis
 */
export function interpretRiskNarrative(risk: RiskAnalysis): string {
    if (risk.level === 'Micro-Fascist Hardening' || risk.score >= 5) {
        return "The assemblage exhibits pronounced authoritarian characteristics, manifested through exclusionary boundaries, opaque decision-making, and punitive enforcement mechanisms that concentrate power while marginalizing affected communities. These dynamics create conditions for micro-fascist organizing where bureaucratic authority supersedes democratic accountability.";
    } else if (risk.level === 'Directional Drift' || risk.score >= 3) {
        return "Moderate authoritarian tendencies emerge in bureaucratic rigidity and limited participatory channels, though countervailing democratic elements provide some accountability. The assemblage oscillates between technocratic efficiency and inclusive governance, creating friction points where power concentrates.";
    } else {
        return "The assemblage demonstrates democratic robustness with distributed authority, transparent procedures, and meaningful participation mechanisms. While not without hierarchies, power relations remain contestable and subject to procedural checks that prevent authoritarian drift.";
    }
}

/**
 * Generate narrative interpretation of liberatory capacity analysis
 */
export function interpretCapacityNarrative(capacity: CapacityAnalysis): string {
    if (capacity.level === 'Structural/Robust' || capacity.score >= 6) {
        return "The assemblage creates substantive openings for emancipatory practice through collective rights frameworks, participatory governance structures, and explicit recognition of marginalized epistemologies. These enabling conditions support bottom-up organizing and resist neoliberal enclosure of political possibility.";
    } else if (capacity.level === 'Partial/Conditional' || capacity.score >= 3) {
        return "Liberatory potential exists but remains constrained by institutional inertia and market logics. While formal rights and consultation mechanisms provide some agency, systemic barriers limit transformative capacity. The assemblage offers tactical openings rather than strategic reconfigurations of power.";
    } else {
        return "Limited liberatory capacity emerges within a predominantly technocratic framework that forecloses radical alternatives. Participation channels privilege expert knowledge over lived experience, and accountability mechanisms reinforce existing hierarchies rather than enabling collective self-determination.";
    }
}

/**
 * Generate narrative interpretation of centralization dynamics
 */
export function interpretCentralizationNarrative(score: number): string {
    if (score >= 75) {
        return "Authority flows hierarchically through formal bureaucratic channels, creating rigid decision-making structures that marginalize participatory input. Centralization concentrates epistemic authority in technocratic institutions, establishing them as obligatory passage points that filter and transform grassroots knowledge claims.";
    } else if (score >= 50) {
        return "Governance exhibits mixed centralization with formal hierarchy coexisting alongside distributed networks. Decision-making authority oscillates between concentrated nodes and peripheral actors, creating uneven power geometries where influence depends on positional leverage within the assemblage.";
    } else {
        return "Distributed governance structures enable polycentric authority with multiple sites of legitimate decision-making. Decentralization creates spaces for local adaptation and contestation, though coordination challenges may fragment coherent action across scales.";
    }
}

/**
 * Generate narrative interpretation of territorialization
 */
export function interpretTerritorializationNarrative(score: number): string {
    if (score >= 75) {
        return "The assemblage exhibits strong territorializing forces through standardized procedures, fixed classifications, and bureaucratic routinization. These stabilizing mechanisms create predictable patterns but risk rigidity, limiting adaptive capacity to emergent challenges and marginalizing practices that don't fit prescribed templates.";
    } else if (score >= 50) {
        return "Territorializing and deterritorializing forces create dynamic tension. While institutional patterns provide stable reference points, spaces for improvisation and reinterpretation allow the assemblage to flex and evolve. This balanced instability enables both coherence and innovation.";
    } else {
        return "Deterritorializing flows dominate, creating fluid, emergent patterns that resist codification. This openness enables creative recombination and adaptive governance but may lack the stable infrastructure needed for long-term institutionalization. The assemblage remains in formation, its boundaries contested and porous.";
    }
}

/**
 * Generate narrative interpretation of material flows
 */
export function interpretMaterialFlowNarrative(description: string, intensity?: number): string {
    const intensityPhrase = intensity && intensity >= 7 ?
        "intensive circulation" :
        intensity && intensity >= 4 ?
            "moderate flow" :
            "limited movement";

    return `Material resources circulate through the assemblage with ${intensityPhrase}, shaping power relations and enabling or constraining organizational practices. ${description} These flows create dependencies and affordances that structure what becomes possible within the assemblage's operational field.`;
}

/**
 * Generate narrative for verification gap analysis
 */
export function interpretVerificationGapNarrative(hasGap: boolean, explanation: string): string {
    if (hasGap) {
        return `A significant rhetorical-empirical gap emerges where aspirational language outpaces concrete enforcement mechanisms. ${explanation} This disconnect between text and practice creates space for symbolic compliance while substantive accountability remains elusive.`;
    } else {
        return `Claims are grounded in verifiable mechanisms, creating aligned rhetoric and enforcement. ${explanation} This coherence between stated intentions and operational capacity suggests the assemblage can deliver on its commitments.`;
    }
}

/**
 * Generate narrative list of triggered indicators
 */
export function narrativizeFlags(flags: Record<string, boolean>, context: string): string[] {
    return Object.entries(flags)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
            const readable = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `${readable} patterns observed in ${context}`;
        });
}

/**
 * Convert score-based stress test to narrative
 */
export function interpretStressTestNarrative(
    sensitivity: 'High' | 'Medium' | 'Low',
    originalScore: number,
    perturbedScore: number
): string {
    const shift = Math.abs(originalScore - perturbedScore);

    if (sensitivity === 'High') {
        return `Critical fragility detected: the assemblage's authority collapses under rhetorical inversion (${shift}-point degradation), revealing dependence on persuasive framing rather than robust structural mechanisms. This brittleness suggests the policy relies more on ideological legitimation than material accountability, making it vulnerable to hostile interpretation or bad-faith implementation.`;
    } else if (sensitivity === 'Medium') {
        return `Moderate rhetorical dependency emerges through adversarial reframing (${shift}-point shift). While the assemblage possesses some structural integrity, hostile actors could exploit framing ambiguities to weaken its authority. This suggests a need for more concrete enforcement mechanisms to insulate governance from interpretive manipulation.`;
    } else {
        return `Robust structural resilience withstands rhetorical inversion with minimal degradation (${shift}-point variance). The assemblage's authority derives from concrete mechanisms and specific mandates rather than aspirational language, enabling it to resist hostile spin and maintain operational coherence across varied interpretive contexts.`;
    }
}
