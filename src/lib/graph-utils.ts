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
                (source.type === "Infrastructure" && target.type === "Dataset")
            );

            if (shouldConnect) {
                const { label, description } = getLinkDetails(source.type, target.type);
                edges.push({ source, target, label, description });
            }
        });
    });

    return edges;
}
