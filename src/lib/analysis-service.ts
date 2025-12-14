import { PromptRegistry } from '@/lib/prompts/registry';

export interface AnalysisConfig {
    systemPrompt: string;
    userContent: string;
}

export async function getAnalysisConfig(
    userId: string,
    analysisMode: string,
    data: {
        text?: string;
        title?: string;
        sourceType?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceA?: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceB?: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        documents?: any[];
    }
): Promise<AnalysisConfig> {
    const { text, title, sourceType, sourceA, sourceB, documents } = data;

    // Default safe userId if missing (though route ensures it)
    const safeUserId = userId || 'default';

    let systemPrompt = '';
    let userContent = '';

    if (analysisMode === 'comparison') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'comparison_framework');
        userContent = `SOURCE A(${sourceA.title}):
${sourceA.text}

SOURCE B(${sourceB.title}):
${sourceB.text}

Please compare these two sources according to the system prompt instructions.`;
    } else if (analysisMode === 'ecosystem') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'ecosystem_analysis');
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please map the ecosystem impacts of this text according to the system prompt instructions.`;
    } else if (analysisMode === 'resistance') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'resistance_analysis');
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text according to the system prompt instructions.`;
    } else if (analysisMode === 'generate_resistance') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'resistance_generation');
        userContent = `POLICY DOCUMENT TEXT:
${text}

Please generate 3 synthetic resistance traces based on this policy.`;
    } else if (analysisMode === 'ontology') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'ontology_extraction');
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please extract the ontology / concept map from this text.`;
    } else if (analysisMode === 'ontology_comparison') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'ontology_comparison');
        userContent = `ONTOLOGY A(${sourceA.title}):
${JSON.stringify(sourceA.data, null, 2)}

ONTOLOGY B(${sourceB.title}):
${JSON.stringify(sourceB.data, null, 2)}

Please compare these two ontologies according to the system prompt instructions.`;
    } else if (analysisMode === 'cultural_framing') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'cultural_framing');
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the cultural framing of this text according to the system prompt instructions.`;
    } else if (analysisMode === 'institutional_logics') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'institutional_logics');
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the institutional logics in this text according to the system prompt instructions.`;
    } else if (analysisMode === 'legitimacy') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'legitimacy_analysis');
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the legitimacy and justification orders in this text.`;
    } else if (analysisMode === 'comparative_synthesis') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'comparative_synthesis');
        userContent = `DOCUMENTS TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize the analysis results for these documents.`;
    } else if (analysisMode === 'cultural_holes') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'cultural_holes');
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please identify cultural holes in this text.`;
    } else if (analysisMode === 'assemblage_extraction') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'assemblage_extraction');
        userContent = `TEXT CONTENT:
${text}

Please extract the assemblage from this text.`;
    } else if (analysisMode === 'resistance_synthesis') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'resistance_synthesis');
        userContent = `ANALYZED TRACES TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize these resistance findings according to the system prompt instructions.`;
    } else if (analysisMode === 'stress_test') {
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'stress_test');
        userContent = text || '';
    } else {
        // Default to DSF / Standard Analysis
        systemPrompt = await PromptRegistry.getEffectivePrompt(safeUserId, 'dsf_lens');
        userContent = `DOCUMENT TITLE: ${title || 'Untitled Document'}
SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text using the Decolonial Situatedness Framework (DSF) as described in the system prompt.`;
    }

    return { systemPrompt, userContent };
}
