import { EcosystemActor, EcosystemEdge } from "@/types/ecosystem";
import { getActorColor, getBiasIntensity } from "@/lib/ecosystem-utils";

// --- Types ---

export interface NodeViz {
    // Base Identity
    color: string;
    roleType: "Material" | "Expressive" | "Mixed";

    // Orthogonal Metrics (Normalized 0-1)
    ethicalRisk: number;         // Emissive Glow Strength (Renamed from biasIntensity)
    confidence: number;          // Opacity / Wireframe Toggle
    territorialization: number;  // Surface Smoothness (1 = Glossy, 0 = Rough)
    deterritorialization: number;// Jitter Magnitude
    coding: number;              // Edge Sharpness / Ring Thickness
    heat: number;                // [NEW] Pulsing Frequency

    // Flags
    isProvisional: boolean;      // Wireframe Mode
    isGhost: boolean;            // Transparent Mode
    hasMissingMetrics: boolean;  // [NEW] Flag for striped texture
}

export interface LinkViz {
    flowType: "power" | "logic" | "mixed";
    flowColor: string;           // Particle Color
    strength: number;            // Line Thickness
    confidence: number;          // Particle Density / Dashed Line
}

// --- Logic ---

/**
 * Maps raw actor data to normalized visual properties.
 * Defensive design: Defaults to safe "Medium" values if metrics are missing.
 */
export const computeNodeViz = (actor: EcosystemActor): NodeViz => {
    // 1. Bias (Emissive)
    const bias = getBiasIntensity(actor);

    // 2. Metrics (Territorialization = Stability, Deterritorialization = Mutation)
    // Handle both qualitative strings and quantitative numbers (legacy vs new)
    const normalizeMetric = (val: string | number | undefined): number | null => {
        if (typeof val === 'number') return Math.min(1, Math.max(0, val / 10)); // Assuming 1-10 scale
        if (!val) return null; // STRICT NULL HANDLING (No more default 0.5)

        const v = String(val).toLowerCase();
        if (v === 'strong' || v === 'high') return 0.9;
        if (v === 'moderate' || v === 'medium') return 0.5;
        if (v === 'weak' || v === 'low') return 0.2;
        return null;
    };

    const t = normalizeMetric(actor.metrics?.territorialization) ?? 0.5; // Final fallback for visual safety
    const d = normalizeMetric(actor.metrics?.deterritorialization) ?? 0.1;
    const c = normalizeMetric(actor.metrics?.coding) ?? 0.5;

    const hasMissingMetrics = !actor.metrics?.territorialization; // Flag for striped texture

    // 3. Epistemic Confidence (Trace Strength) -> Opacity
    const trace = actor.trace_metadata;
    let confidence = 1.0;

    // 4. Ontological Status (Mode of Existence) -> Wireframe
    let isProvisional = false;

    if (trace) {
        // Epistemic Confidence maps to Opacity
        // If missing confidence, do NOT default to medium. We handle visual mapping in rendering.
        confidence = trace.confidence !== undefined ? trace.confidence : 1.0;

        // Ontological Status maps to Wireframe
        isProvisional = trace.provisional || false;
    }

    // Ghost Override (Deep Uncertainty)
    const isGhost = actor.id.startsWith('ghost-') || actor.source === 'absence_fill';
    if (isGhost) {
        confidence = 0.4;
        isProvisional = true;
    }

    // 5. Role Type
    const roleType = actor.role_type || "Mixed"; // Default to mixed

    return {
        color: getActorColor(actor.type),
        roleType,
        ethicalRisk: bias,   // [NEW] Renamed from biasIntensity (mapped from bias var)
        confidence,          // Opacity
        territorialization: t,
        deterritorialization: d,
        coding: c,
        heat: (d * 0.7) + (bias * 0.3), // [NEW] Theoretical Heat Mix (Mutation-heavy)
        isProvisional,       // Wireframe
        isGhost,
        hasMissingMetrics // [NEW] Flag for striped texture
    };
};

/**
 * Maps link data to visual properties.
 */
export const computeLinkViz = (link: EcosystemEdge): LinkViz => {
    // Flow Type & Color
    const type = (link.flow_type || "mixed") as LinkViz['flowType'];
    let color = "#E2E8F0"; // Default Slate-200

    if (type === 'power') color = "#F43F5E"; // Rose-500 (Aggressive)
    else if (type === 'logic') color = "#F59E0B"; // Amber-500 (Epistemic)

    // Strength (Thickness)
    const strength = link.weight || (link.type === 'Strong' ? 1.0 : 0.5);

    // Confidence
    const confidence = link.confidence || 1.0;

    return {
        flowType: type,
        flowColor: color,
        strength,
        confidence
    };
};
