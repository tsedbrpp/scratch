import { PromptRegistry } from '@/lib/prompts/registry';

type StrategyResult = { systemPrompt: string; userContent: string };

const getLensInstruction = (lensType: string) => {
    switch (lensType) {
        case 'market':
            return `\n\n*** INTERPRETATION LENS: MARKET / ACCELERATIONIST ***
    Analyze this through the lens of market efficiency, innovation, and capital flow.
    - Highlight friction points that impede rapid deployment or scaling.
    - Frame "Risks" as potential liability costs or market barriers.
    - Identify opportunities for regulatory arbitrage or competitive advantage.
    - Tone: Pragmatic, economic, efficiency-oriented.`;
        case 'democratic':
            return `\n\n*** INTERPRETATION LENS: PRECARIOUS / DEMOCRATIC ***
    Analyze this through the lens of democratic oversight, labor rights, and vulnerability.
    - Highlight where "efficiency" masks exploitation or disenfranchisement.
    - Focus on the rights of workers, gig laborers, and marginalized groups.
    - Critique "technocratic" solutions that lack public accountability.
    - Tone: Critical, rights-focused, solidarity-oriented.`;
        case 'decolonial':
            return `\n\n*** INTERPRETATION LENS: DECOLONIAL / SOVEREIGNTY ***
    Analyze this through the lens of power asymmetries, data extractivism, and digital sovereignty.
    - Highlight "universalist" claims that mask Western normative imposition.
    - Focus on data extraction from the Global South vs. value capture in the Global North.
    - Identify mechanisms of "digital colonialism" or "legal transplants".
    - Tone: Structural, historical, resistance-oriented.`;
        case 'assemblage':
        default:
            return `\n\n*** INTERPRETATION LENS: RELATIONAL ASSEMBLAGE (DEFAULT) ***
    Analyze this through the lens of Actor-Network Theory and assemblage thinking.
    - Focus on the relations between human and non-human actors (institutions, code, markets).
    - Map the "translations" and "mutations" of concepts as they travel.
    - Tone: Analytical, descriptive, relational.`;
    }
};

export const strategies: Record<string, (userId: string, data: any) => Promise<StrategyResult>> = {
    comparison: async (userId, { sourceA, sourceB }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'comparison_framework'),
        userContent: `SOURCE A(${sourceA.title}):
${sourceA.text}

SOURCE B(${sourceB.title}):
${sourceB.text}

Please compare these sources according to the system prompt instructions.`
    }),

    ecosystem: async (userId, { sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'ecosystem_analysis'),
        userContent: `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please map the ecosystem impacts of this text according to the system prompt instructions.`
    }),

    resistance: async (userId, { sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'resistance_analysis'),
        userContent: `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text according to the system prompt instructions.`
    }),

    generate_resistance: async (userId, { text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'resistance_generation'),
        userContent: `POLICY DOCUMENT TEXT:
${text}

Please generate 3 synthetic resistance traces based on this policy.`
    }),

    ontology: async (userId, { sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'ontology_extraction'),
        userContent: `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please extract the ontology / concept map from this text.`
    }),

    ontology_comparison: async (userId, { sourceA, sourceB, sourceC }) => {
        const systemPrompt = await PromptRegistry.getEffectivePrompt(userId, 'ontology_comparison');
        let comparisonContent = `ONTOLOGY A(${sourceA.title}):
${JSON.stringify(sourceA.data, null, 2)}

ONTOLOGY B(${sourceB.title}):
${JSON.stringify(sourceB.data, null, 2)}`;

        if (sourceC) {
            comparisonContent += `

ONTOLOGY C(${sourceC.title}):
${JSON.stringify(sourceC.data, null, 2)}`;
        }

        return {
            systemPrompt,
            userContent: `${comparisonContent}

Please compare these ${sourceC ? 'three' : 'two'} ontologies according to the system prompt instructions.`
        };
    },

    cultural_framing: async (userId, { sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'cultural_framing'),
        userContent: `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the cultural framing of this text according to the system prompt instructions.`
    }),

    institutional_logics: async (userId, { sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'institutional_logics'),
        userContent: `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the institutional logics in this text according to the system prompt instructions.`
    }),

    legitimacy: async (userId, { sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'legitimacy_analysis'),
        userContent: `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the legitimacy and justification orders in this text.`
    }),

    comparative_synthesis: async (userId, { documents, lens = 'assemblage' }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'comparative_synthesis'),
        userContent: `DOCUMENTS TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize the analysis results for these documents.${getLensInstruction(lens)}`
    }),

    cultural_holes: async (userId, { sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'cultural_holes'),
        userContent: `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please identify cultural holes in this text.`
    }),

    assemblage_extraction_v3: async (userId, { text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'assemblage_extraction_v3'),
        userContent: `TEXT CONTENT:
${text}

Please extract the assemblage from this text.`
    }),

    resistance_synthesis: async (userId, { documents }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'resistance_synthesis'),
        userContent: `ANALYZED TRACES TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize these resistance findings according to the system prompt instructions.`
    }),

    stress_test: async (userId, { text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'stress_test'),
        userContent: text || ''
    }),

    assemblage_explanation: async (userId, { configurations }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'assemblage_explanation'),
        userContent: `ANALYSIS TARGET: Hull Metrics Integration

Here are the calculated Assemblage Metrics for the current ecosystem map:
${JSON.stringify(configurations, null, 2)}

Please interpret these "Stability" (Density) and "Porosity" (External Connectivity) scores.`
    }),

    ant_trace: async (userId, { actors, links }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'ant_trace_explanation'),
        userContent: `TRACED ACTORS:
${JSON.stringify(actors.map((a: any) => ({ name: a.name, type: a.type })), null, 2)}

ASSOCIATIONS:
${JSON.stringify(links.map((l: any) => ({ source: l.source, target: l.target, type: l.type })), null, 2)}

Please provide a methodological trace of this network.`
    }),

    assemblage_realist: async (userId, { traced_actors, detected_mechanisms, identified_capacities }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'assemblage_realist_explanation'),
        userContent: `ASSEMBLAGE COMPONENTS:
${JSON.stringify(traced_actors.map((a: any) => a.name), null, 2)}

DETECTED MECHANISMS (Territorialization/Coding):
${JSON.stringify(detected_mechanisms, null, 2)}

IDENTIFIED CAPACITIES:
${JSON.stringify(identified_capacities, null, 2)}

Please interpret the ontological status of this assemblage.`
    }),

    hybrid_reflexive: async (userId, { ant_trace, assemblage_analysis, tensions }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'hybrid_reflexive_explanation'),
        userContent: `ANT TRACE DATA:
Actor Count: ${ant_trace.actor_count}

ASSEMBLAGE MECHANISMS:
${JSON.stringify(assemblage_analysis, null, 2)}

THEORETICAL TENSIONS:
${JSON.stringify(tensions, null, 2)}

Please synthesize these findings and discuss the reflexivity of the analysis.`
    }),

    default: async (userId, { title, sourceType, text }) => ({
        systemPrompt: await PromptRegistry.getEffectivePrompt(userId, 'dsf_lens'),
        userContent: `DOCUMENT TITLE: ${title || 'Untitled Document'}
SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text using the Decolonial Situatedness Framework (DSF) as described in the system prompt.`
    })
};
