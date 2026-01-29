import { EcosystemActor } from "@/types/ecosystem";

export function getLinkDetails(sourceType: string, targetType: string) {
    if (sourceType === "Policymaker" && targetType === "Startup") return { label: "Regulates", description: "Imposes legal boundaries and compliance costs." };
    if (sourceType === "Policymaker" && targetType === "Civil Society") return { label: "Excludes", description: "Often marginalizes from decision-making loops." };
    if (sourceType === "Information" && targetType === "Policymaker") return { label: "Informs", description: "Provides epistemic basis for policy." };

    if (sourceType === "Startup" && targetType === "Academic") return { label: "Enables", description: "Provides tools or data for research." };
    if (sourceType === "Infrastructure" && targetType === "Startup") return { label: "Enables", description: "Provides computational substrate for operations." };
    if (sourceType === "Startup" && targetType === "Algorithm") return { label: "Delegates", description: "Offloads decision-making authority to code." };

    if (sourceType === "Algorithm" && targetType === "Dataset") return { label: "Extracts", description: "Mines patterns from raw data, often without consent." };
    if (sourceType === "Infrastructure" && targetType === "Dataset") return { label: "Extracts", description: "Accumulates data capital from interactions." };

    if (sourceType === "Academic" && targetType === "Algorithm") return { label: "Audits", description: "Critically examines algorithmic outputs." };

    // Additional connections for robustness
    if (sourceType === "Civil Society" && targetType === "Academic") return { label: "Studies", description: "Provides qualitative data and community context." };
    if (sourceType === "Policymaker" && targetType === "Algorithm") return { label: "Governs", description: "Attempts to regulate code behavior." };

    // New Type Handlers
    if (sourceType.includes("AlgorithmicAgent") || targetType.includes("AlgorithmicAgent")) return { label: "Operates", description: "Autonomous agentic action." };
    if (sourceType === "LegalObject" || targetType === "LegalObject") return { label: "Codifies", description: "Materializes law into an object." };
    if (sourceType === targetType) return { label: "Coordinates", description: "Internal coordination." };

    return { label: "Relates To", description: "Generic connection." };
}

export function generateEdges(actors: EcosystemActor[]) {
    const edges: { source: EcosystemActor; target: EcosystemActor; label: string; description: string }[] = [];

    actors.forEach((source, i) => {
        actors.slice(i + 1).forEach((target) => {
            const sType = source.type;
            const tType = target.type;

            // Helper to check connection bidirectionally
            const isTypePair = (t1: string, t2: string) =>
                (sType === t1 && tType === t2) || (sType === t2 && tType === t1);

            const shouldConnect = (
                isTypePair("Policymaker", "Civil Society") ||
                isTypePair("Startup", "Academic") ||
                isTypePair("Policymaker", "Startup") ||
                isTypePair("Civil Society", "Academic") ||
                isTypePair("Infrastructure", "Startup") ||
                isTypePair("Infrastructure", "Policymaker") ||
                isTypePair("Infrastructure", "Academic") ||

                // Algorithm connections
                isTypePair("Startup", "Algorithm") ||
                isTypePair("Academic", "Algorithm") ||
                isTypePair("Algorithm", "Dataset") ||
                isTypePair("Policymaker", "Algorithm") ||
                isTypePair("Infrastructure", "Algorithm") ||
                isTypePair("Infrastructure", "Dataset") ||

                // Algorithmic Agent (Broader Scope)
                isTypePair("AlgorithmicAgent", "Dataset") ||
                isTypePair("AlgorithmicAgent", "Infrastructure") ||
                isTypePair("AlgorithmicAgent", "Policymaker") || // Regulation
                isTypePair("AlgorithmicAgent", "Civil Society") || // Impact/Audit
                isTypePair("AlgorithmicAgent", "Startup") || // Deployment
                isTypePair("AlgorithmicAgent", "Academic") || // Study

                isTypePair("LegalObject", "Policymaker") ||
                isTypePair("LegalObject", "Civil Society") ||

                // Broaden Policymaker connections
                (sType === "Policymaker" && tType === "Policymaker") || // Inter-agency
                (sType === "Civil Society" && tType === "Civil Society") || // Coalitions

                // Fallback for typed Ghost Nodes if they match above, or explicit broad connectivity?
                // Ghosts usually have valid types now, so they fall into above buckets.

                // Universal Catch-All for "Related" nodes if manually forced? No, stick to type logic for coherence.
                false
            );

            if (shouldConnect) {
                const { label, description } = getLinkDetails(sType, tType);
                edges.push({ source, target, label, description });
            }
        });
    });

    return edges;
}

// [NEW] Hull Calculation Logic
export function getHullPath(points: { x: number, y: number }[]) {
    if (points.length < 3) return "";
    points.sort((a, b) => a.x - b.x || a.y - b.y);

    // Cross product of vectors OA and OB
    const cross = (o: { x: number, y: number }, a: { x: number, y: number }, b: { x: number, y: number }) =>
        (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const lower = [];
    for (let i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) lower.pop();
        lower.push(points[i]);
    }

    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) upper.pop();
        upper.push(points[i]);
    }

    upper.pop(); lower.pop();
    const hull = lower.concat(upper);
    return `M ${hull.map(p => `${p.x},${p.y}`).join(" L ")} Z`;
}
