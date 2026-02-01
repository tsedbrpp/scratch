import { EcosystemActor } from "@/types/ecosystem";

export function getLinkDetails(sourceType: string, targetType: string): { label: string, description: string, flow_type: 'power' | 'logic' } {
    if (sourceType === "Policymaker" && targetType === "Startup") return { label: "Regulates", description: "Imposes legal boundaries.", flow_type: 'power' };
    if (sourceType === "Policymaker" && targetType === "Civil Society") return { label: "Excludes", description: "Social marginalization.", flow_type: 'power' };
    if (sourceType === "Information" && targetType === "Policymaker") return { label: "Informs", description: "Epistemic basis.", flow_type: 'logic' };

    if (sourceType === "Startup" && targetType === "Academic") return { label: "Enables", description: "Tools for research.", flow_type: 'logic' };
    if (sourceType === "Infrastructure" && targetType === "Startup") return { label: "Enables", description: "Computational substrate.", flow_type: 'power' };
    if (sourceType === "Startup" && targetType === "Algorithm") return { label: "Delegates", description: "Authority to code.", flow_type: 'power' };

    if (sourceType === "Algorithm" && targetType === "Dataset") return { label: "Extracts", description: "Mines patterns.", flow_type: 'power' };
    if (sourceType === "Infrastructure" && targetType === "Dataset") return { label: "Extracts", description: "Accumulates data capital.", flow_type: 'power' };

    if (sourceType === "Academic" && targetType === "Algorithm") return { label: "Audits", description: "Critical examination.", flow_type: 'logic' };

    if (sourceType === "Civil Society" && targetType === "Academic") return { label: "Studies", description: "Community context.", flow_type: 'logic' };
    if (sourceType === "Policymaker" && targetType === "Algorithm") return { label: "Governs", description: "Regulates behavior.", flow_type: 'power' };

    if (sourceType.includes("AlgorithmicAgent") || targetType.includes("AlgorithmicAgent")) return { label: "Operates", description: "Autonomous action.", flow_type: 'power' };
    if (sourceType === "LegalObject" || targetType === "LegalObject") return { label: "Codifies", description: "Materializes law.", flow_type: 'logic' };
    if (sourceType === targetType) return { label: "Coordinates", description: "Internal loops.", flow_type: 'logic' };

    return { label: "Relates To", description: "Generic connection.", flow_type: 'logic' };
}

export function generateEdges(actors: EcosystemActor[]) {
    const edges: { source: EcosystemActor; target: EcosystemActor; label: string; description: string; flow_type: 'power' | 'logic' }[] = [];

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
                const details = getLinkDetails(sType, tType);
                edges.push({
                    source,
                    target,
                    label: details.label,
                    description: details.description,
                    flow_type: details.flow_type
                });
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
