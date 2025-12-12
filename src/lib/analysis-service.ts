import {
    DSF_SYSTEM_PROMPT,
    COMPARISON_SYSTEM_PROMPT,
    ECOSYSTEM_SYSTEM_PROMPT,
    RESISTANCE_SYSTEM_PROMPT,
    RESISTANCE_GENERATION_PROMPT,
    ONTOLOGY_SYSTEM_PROMPT,
    ONTOLOGY_COMPARISON_SYSTEM_PROMPT,
    CULTURAL_FRAMING_PROMPT,
    INSTITUTIONAL_LOGICS_PROMPT,
    LEGITIMACY_PROMPT,
    COMPARATIVE_SYNTHESIS_PROMPT,
    CULTURAL_HOLES_PROMPT,
    ASSEMBLAGE_EXTRACTION_PROMPT,
    RESISTANCE_SYNTHESIS_PROMPT,
    STRESS_TEST_SYSTEM_PROMPT
} from './prompts';

export interface AnalysisConfig {
    systemPrompt: string;
    userContent: string;
}


export function getAnalysisConfig(
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
): AnalysisConfig {
    const { text, title, sourceType, sourceA, sourceB, documents } = data;
    let systemPrompt = DSF_SYSTEM_PROMPT;
    let userContent = '';

    if (analysisMode === 'comparison') {
        systemPrompt = COMPARISON_SYSTEM_PROMPT;
        userContent = `SOURCE A(${sourceA.title}):
${sourceA.text}

SOURCE B(${sourceB.title}):
${sourceB.text}

Please compare these two sources according to the system prompt instructions.`;
    } else if (analysisMode === 'ecosystem') {
        systemPrompt = ECOSYSTEM_SYSTEM_PROMPT;
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please map the ecosystem impacts of this text according to the system prompt instructions.`;
    } else if (analysisMode === 'resistance') {
        systemPrompt = RESISTANCE_SYSTEM_PROMPT;
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text according to the system prompt instructions.`;
    } else if (analysisMode === 'generate_resistance') {
        systemPrompt = RESISTANCE_GENERATION_PROMPT;
        userContent = `POLICY DOCUMENT TEXT:
${text}

Please generate 3 synthetic resistance traces based on this policy.`;
    } else if (analysisMode === 'ontology') {
        systemPrompt = ONTOLOGY_SYSTEM_PROMPT;
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please extract the ontology / concept map from this text.`;
    } else if (analysisMode === 'ontology_comparison') {
        systemPrompt = ONTOLOGY_COMPARISON_SYSTEM_PROMPT;
        userContent = `ONTOLOGY A(${sourceA.title}):
${JSON.stringify(sourceA.data, null, 2)}

ONTOLOGY B(${sourceB.title}):
${JSON.stringify(sourceB.data, null, 2)}

Please compare these two ontologies according to the system prompt instructions.`;
    } else if (analysisMode === 'cultural_framing') {
        systemPrompt = CULTURAL_FRAMING_PROMPT;
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the cultural framing of this text according to the system prompt instructions.`;
    } else if (analysisMode === 'institutional_logics') {
        systemPrompt = INSTITUTIONAL_LOGICS_PROMPT;
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the institutional logics in this text according to the system prompt instructions.`;
    } else if (analysisMode === 'legitimacy') {
        systemPrompt = LEGITIMACY_PROMPT;
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze the legitimacy and justification orders in this text.`;
    } else if (analysisMode === 'comparative_synthesis') {
        systemPrompt = COMPARATIVE_SYNTHESIS_PROMPT;
        userContent = `DOCUMENTS TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize the analysis results for these documents.`;
    } else if (analysisMode === 'cultural_holes') {
        systemPrompt = CULTURAL_HOLES_PROMPT;
        userContent = `SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please identify cultural holes in this text.`;
    } else if (analysisMode === 'assemblage_extraction') {
        systemPrompt = ASSEMBLAGE_EXTRACTION_PROMPT;
        userContent = `TEXT CONTENT:
${text}

Please extract the assemblage from this text.`;
    } else if (analysisMode === 'resistance_synthesis') {
        systemPrompt = RESISTANCE_SYNTHESIS_PROMPT;
        userContent = `ANALYZED TRACES TO SYNTHESIZE:
${JSON.stringify(documents, null, 2)}

Please synthesize these resistance findings according to the system prompt instructions.`;
    } else if (analysisMode === 'stress_test') {
        systemPrompt = STRESS_TEST_SYSTEM_PROMPT;
        userContent = text || '';
    } else {
        // Default to DSF / Standard Analysis
        systemPrompt = DSF_SYSTEM_PROMPT;
        userContent = `DOCUMENT TITLE: ${title || 'Untitled Document'}
SOURCE TYPE: ${sourceType || 'Policy Document'}

TEXT CONTENT:
${text}

Please analyze this text using the Decolonial Situatedness Framework (DSF) as described in the system prompt.`;
    }

    return { systemPrompt, userContent };
}
