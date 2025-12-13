import { EcosystemActor } from "@/types/ecosystem";

export type ScenarioId = "None" | "WeakEnforcement" | "PrivateStandards" | "ExpandedInclusion";

export interface ScenarioDelta {
    id: string; // Source-Target
    originalStrength: number;
    newStrength: number;
    delta: number;
    narrative: string;
}

export interface ScenarioResult {
    edgeMultipliers: Record<string, number>; // Key: "SourceID-TargetID", Value: Multiplier (e.g. 0.5, 1.2)
    deltas: ScenarioDelta[];
    narrative: string;
}

// Helper to get edge ID
const getEdgeId = (sourceId: string, targetId: string) => `${sourceId}-${targetId}`;

export function applyScenario(
    actors: EcosystemActor[],
    edges: { source: EcosystemActor; target: EcosystemActor; label: string }[],
    scenarioId: ScenarioId
): ScenarioResult {
    const result: ScenarioResult = {
        edgeMultipliers: {},
        deltas: [],
        narrative: ""
    };

    if (scenarioId === "None") return result;

    edges.forEach(edge => {
        const { source, target, label } = edge;
        const edgeId = getEdgeId(source.id, target.id);
        let multiplier = 1.0;
        let narrative = "";

        // --- SCENARIO LOGIC ---

        if (scenarioId === "WeakEnforcement") {
            result.narrative = "Formal regulatory power dissolves. Corporate self-regulation and harm externalization intensify.";

            // Rule 1: Regulatory edges weaken
            if (["Regulates", "Sanctions", "Inspects", "Audits"].includes(label)) {
                multiplier = 0.5;
                narrative = "Regulatory oversight collapses due to lack of enforcement.";
            }
            // Rule 2: Extraction / Externalization strengthens
            else if (["Extracts", "Externalizes", "Displaces"].includes(label)) {
                multiplier = 1.5;
                narrative = "Unchecked extraction intensifies.";
            }
            // Rule 3: Corporate-to-Algorithm ("Delegates") strengthens (technocratic control)
            else if (source.type === "Startup" && target.type === "Algorithm" && label === "Delegates") {
                multiplier = 1.3;
                narrative = "Reliance on automated decision-making grows in vacuum of law.";
            }
        }
        else if (scenarioId === "PrivateStandards") {
            result.narrative = "Compliance shifts from law to private certification. Standards bodies gain centrality.";

            // Rule 1: Infrastructure/Startup -> Standards strengthens
            // (Assuming we might map "Enables" to standard-setting context)
            if (target.type === "Civil Society" && label === "Excludes") {
                // Side effect: Exclusion often persists or changes form
                multiplier = 1.0;
            }

            // Rule 2: Policymaker -> Startup ("Regulates") weakens ("Safe Harbor")
            if (source.type === "Policymaker" && target.type === "Startup" && label === "Regulates") {
                multiplier = 0.7;
                narrative = "Regulation softened by 'Safe Harbor' compliance.";
            }

            // Rule 3: Information -> Policymaker ("Informs") strengthens (Lobbying via standards)
            if (source.type === "Information" && target.type === "Policymaker") {
                multiplier = 1.4;
                narrative = "Technical standards become the primary source of policy truth.";
            }
        }
        else if (scenarioId === "ExpandedInclusion") {
            result.narrative = "Marginalized actors gain power. Accountability loops strengthen; extraction is contested.";

            // Rule 1: Civil Society/Academic -> Any ("Audits", "Studies") strengthens
            if ((source.type === "Civil Society" || source.type === "Academic") && (label === "Audits" || label === "Studies" || label === "Excludes")) {
                if (label === "Excludes") {
                    multiplier = 0.2; // Exclusion is actively dismantled
                    narrative = "Exclusionary barriers are dismantled.";
                } else {
                    multiplier = 1.6; // Auditing power doubles
                    narrative = "Citizen oversight and algorithmic accountability robustified.";
                }
            }

            // Rule 2: Extraction weakens
            if (label === "Extracts") {
                multiplier = 0.4;
                narrative = "Data extraction curbed by consent mechanisms.";
            }
        }

        // --- END LOGIC ---

        if (multiplier !== 1.0) {
            result.edgeMultipliers[edgeId] = multiplier;
            result.deltas.push({
                id: edgeId,
                originalStrength: 1.0, // Assuming base is 1 for now
                newStrength: multiplier,
                delta: multiplier - 1.0,
                narrative
            });
        }
    });

    // Sort deltas by magnitude
    result.deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    return result;
}
