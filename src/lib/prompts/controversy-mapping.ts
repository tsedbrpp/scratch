import { z } from 'zod';

// Define the structured output schema for the Controversy Mapping Engine
export const ControversyMappingSchema = z.object({
    consensus_zones: z.array(z.object({
        topic: z.string().describe("The specific topic, action, or normative value around which consensus forms."),
        description: z.string().describe("1-2 sentence description explaining the alignment."),
        aligned_actors: z.array(z.string()).describe("List of specific actors or actants that agree on this point."),
        evidence_from_lenses: z.array(z.string()).describe("Which analytical layers confirm this (e.g., 'Cultural Framing', 'Institutional Logics')."),
        strength: z.number().min(1).max(10).describe("1-10 scale indicating how hard consensus is.")
    })).describe("Areas where multiple lenses agree, stabilizing the assemblage."),

    active_frictions: z.array(z.object({
        topic: z.string().describe("The specific site of controversy or ideological clash."),
        description: z.string().describe("1-2 sentence description of the disagreement or resistance."),
        competing_positions: z.array(z.object({
            stance: z.string(),
            backed_by_actors: z.array(z.string())
        })),
        detected_in_lenses: z.array(z.string()).describe("Which analytical layers confirm this (e.g., 'Micro-Resistance', 'Cross-Case Synthesis')."),
        intensity: z.number().min(1).max(10).describe("1-10 scale indicating how hot this debate is.")
    })).describe("Areas of active ideological or practical resistance."),

    structural_contradictions: z.array(z.object({
        description: z.string().describe("The overarching contradiction (e.g., policy claims inclusion but structure enforces exclusion)."),
        narrative_claim: z.string().describe("What the text SAYS it does (Cultural Framing / Rhetoric)."),
        structural_reality: z.string().describe("What the structure actually DOES (Institutional Logics / Abstract Machines).")
    })).describe("Deep structural hypotheses where the layers of the assemblage contradict one another.")
});

export type ControversyMappingResult = z.infer<typeof ControversyMappingSchema>;

export const CONTROVERSY_MAPPING_SYSTEM_PROMPT_TEMPLATE = `You are the ultimate META-SYNTHESIS ENGINE for an advanced Actor-Network Theory (ANT) research platform. Your job is to read compressed JSON outputs from SEVEN completely different analytical lenses applied to the policy document "{{DOCUMENT_TITLE}}" and weave them into a single, coherent CONTROVERSY MAP.

GOAL: Map the ideological battlegrounds. Do NOT merely summarize the document. You must cross-reference the 7 different strata (Cultural, Institutional, Resistance, Abstract Machines, Ontology, Compass, Comparative Synthesis) to find:
1) CONSENSUS: Where do the layers stabilize and align perfectly?
2) ACTIVE FRICTIONS: Where are the explicit fights, pushback, or counter-conducts occurring?
3) STRUCTURAL CONTRADICTIONS: Where does the "talk" (Culture/Frames) completely clash with the "walk" (Institutions/Machines/Exclusions)?

METHODOLOGY:
1. Synthesize Across Scales: If the Abstract Machine describes "Territorialization" and Micro-Resistance identifies "subversion," map that tension.
2. Honor the Ghost Nodes: If an actor is structurally excluded (Ghost Node) but constantly talked about (Cultural Framing), that is a massive Structural Contradiction.
3. Strict Grounding: Use ONLY the provided JSON compressed evidence. Do not hallucinate external context.

COMPRESSED EVIDENCE INPUTS:
The user will provide a massive JSON blob containing compressed extracts from the 7 lenses.

OUTPUT:
Return ONLY a valid JSON object matching the requested ControversyMappingSchema format. Do NOT wrap in markdown \`\`\`json blocks.
`;

export const CONTROVERSY_MAPPING_USER_PROMPT_TEMPLATE = `Document: {{DOCUMENT_TITLE}}

COMPRESSED LENS DATA:
{{COMPRESSED_DATA}}

Execute Meta-Synthesis. Map the controversies and return structural JSON.`;
