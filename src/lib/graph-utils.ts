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
            const shouldConnect = (
                (source.type === "Policymaker" && target.type === "Civil Society") ||
                (source.type === "Startup" && target.type === "Academic") ||
                (source.type === "Policymaker" && target.type === "Startup") ||
                (source.type === "Civil Society" && target.type === "Academic") ||
                (source.type === "Infrastructure" && target.type === "Startup") ||
                (source.type === "Infrastructure" && target.type === "Policymaker") ||
                (source.type === "Infrastructure" && target.type === "Academic") ||
                // Algorithm connections
                (source.type === "Startup" && target.type === "Algorithm") ||
                (source.type === "Academic" && target.type === "Algorithm") ||
                (source.type === "Algorithm" && target.type === "Dataset") ||
                (source.type === "Policymaker" && target.type === "Algorithm") ||
                (source.type === "Infrastructure" && target.type === "Algorithm") ||
                (source.type === "Infrastructure" && target.type === "Dataset") ||
                // Support for new types
                (source.type === "AlgorithmicAgent" && (target.type === "Dataset" || target.type === "Infrastructure")) ||
                ((source.type === "Dataset" || source.type === "Infrastructure") && target.type === "AlgorithmicAgent") ||
                (source.type === "LegalObject" && (target.type === "Policymaker" || target.type === "Civil Society")) ||
                ((source.type === "Policymaker" || source.type === "Civil Society") && target.type === "LegalObject") ||
                // Broaden Policymaker connections
                (source.type === "Policymaker" && target.type === "Policymaker") || // Inter-agency
                (source.type === "Civil Society" && target.type === "Civil Society") // Coalitions
            );

            if (shouldConnect) {
                const { label, description } = getLinkDetails(source.type, target.type);
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
