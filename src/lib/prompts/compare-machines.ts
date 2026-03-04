import { z } from "zod";

export const aiCompareAbstractMachinesSchema = z.object({
    shared_spine: z.object({
        explanation: z.string().describe("What core operators or constraints unify these two machines?"),
        items: z.array(z.object({
            element_name: z.string(),
            significance: z.string().describe("How this element acts as an Obligatory Passage Point.")
        }))
    }),
    differences: z.object({
        explanation: z.string().describe("Where do the machines diverge fundamentally?"),
        items: z.array(z.object({
            element_name: z.string(),
            description: z.string()
        }))
    }),
    double_articulation: z.object({
        explanation: z.string().describe("Compare the tensions between content (substance/form) and expression in both machines."),
        left_content_items: z.array(z.string()).describe("List of elements forming the 'machinic assemblage of bodies' in the left machine."),
        left_expression_items: z.array(z.string()).describe("List of elements forming the 'collective assemblage of enunciation' in the left machine."),
        right_content_items: z.array(z.string()).describe("List of elements forming the 'machinic assemblage of bodies' in the right machine."),
        right_expression_items: z.array(z.string()).describe("List of elements forming the 'collective assemblage of enunciation' in the right machine.")
    }),
    affective_capacities: z.object({
        explanation: z.string().describe("Analyze how 'affect' (capacity to act/be acted upon) shifts between the two models."),
        scores: z.array(z.object({
            stakeholder: z.string().describe("E.g., 'Institutions', 'Providers', 'Consumers'"),
            left_score: z.number().min(0).max(1).describe("Relative leverage capacity of this stakeholder in the left machine (0.0 to 1.0)"),
            right_score: z.number().min(0).max(1).describe("Relative leverage capacity of this stakeholder in the right machine (0.0 to 1.0)"),
            confidence: z.number().min(0).max(1).describe("The model's self-assessed confidence in this qualitative interpretation (0.0 to 1.0)"),
            rationale: z.string().describe("Brief evidence or reasoning logic explaining the scores")
        }))
    }),
    scenario_assessments: z.object({
        explanation: z.string().describe("Describe hypothetical scenario findings traversing this Obligatory Passage Point spine."),
        simulations: z.array(z.object({
            scenario: z.string().describe("E.g., 'Sanction Event', 'Institutional Intervention', 'Contest Success'"),
            left_likelihood: z.number().min(0).max(1).describe("Hypothetical likelihood rate (0.0 to 1.0) for the left machine"),
            right_likelihood: z.number().min(0).max(1).describe("Hypothetical likelihood rate (0.0 to 1.0) for the right machine"),
            confidence: z.number().min(0).max(1).describe("The model's self-assessed confidence in this probability heuristic (0.0 to 1.0)"),
            rationale: z.string().describe("Brief evidence or reasoning logic explaining why the structures produce these differing likelihoods")
        }))
    }),
    conclusion: z.string().describe("A summary manuscript-style paragraph of the structural comparison.")
});

export type AICompareAbstractMachinesResponse = z.infer<typeof aiCompareAbstractMachinesSchema>;

export const getCompareAbstractMachinesPrompt = (leftTitle: string, rightTitle: string, leftJson: string, rightJson: string) => `
You are an assemblage theory expert (Deleuze & Guattari / DeLanda) analyzing two “abstract machine” extractions from AI governance policy documents.

INPUTS:
- DOCUMENT A (${leftTitle}): ${leftJson}
- DOCUMENT B (${rightTitle}): ${rightJson}

TASK:
Compare the two abstract machines and return an explanation in the style of an academic assemblage/ANT-informed manuscript section. Use the JSON content only; do not invent facts.

Your analysis must strictly adhere to the designated JSON output schema.
Focus on:
1. Identifying the 'Shared Spine' (Obligatory Passage Points present in both).
2. The fundamental structural differences (Operators/Constraints present in one but absent/mutated in the other).
3. The 'Double Articulation' tensions (Content vs Expression).
4. 'Affective Capacities' (Generate realistic 0-1 relational leverage scores for key stakeholders: e.g., Institutions, Providers, Affected Persons). Provide rationale and a confidence value.
5. 'Scenario Assessments' (Simulate realistic, hypothetical likelihoods from 0-1 for broad outcomes like Sanction Rates or Intervention Success, based purely on the structural restrictiveness of the machines). Provide rationale and a confidence value.
`;
