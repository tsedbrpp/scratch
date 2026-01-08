import { StorageService } from '@/lib/storage-service';
import { ABSENCE_PROMPT } from './absence';
import { ASSEMBLAGE_PROMPT } from './assemblage';
import { COMPARATIVE_SYNTHESIS_PROMPT } from './comparative-synthesis';
import { COMPARISON_SYSTEM_PROMPT } from './comparison';
import { CRITIQUE_SYSTEM_PROMPT } from './critique';
import { CULTURAL_FRAMING_PROMPT } from './cultural-framing';
import { THEME_EXTRACTION_PROMPT, BRIDGING_PROMPT, LENS_PROMPTS } from './cultural-analysis';
import { KEY_TERM_EXTRACTION_PROMPT, SUBJECT_IDENTIFICATION_PROMPT, RESISTANCE_CURATION_PROMPT } from './search-traces';
import { CULTURAL_HOLES_PROMPT } from './cultural-holes';
import { DSF_SYSTEM_PROMPT } from './dsf';
import { ECOSYSTEM_SYSTEM_PROMPT } from './ecosystem';
import { INSTITUTIONAL_LOGICS_PROMPT } from './institutional-logics';
import { LEGITIMACY_PROMPT } from './legitimacy';
// Note: ONTOLOGY_SYSTEM_PROMPT has multiple exports, usually we just need the main one or we can register them separately.
import { ONTOLOGY_SYSTEM_PROMPT, ONTOLOGY_COMPARISON_SYSTEM_PROMPT } from './ontology';
import { PERSPECTIVE_SIMULATION_PROMPT } from './perspective-simulation';
import { RESISTANCE_SYSTEM_PROMPT, RESISTANCE_GENERATION_PROMPT, RESISTANCE_SYNTHESIS_PROMPT } from './resistance';
import { STRESS_TEST_SYSTEM_PROMPT } from './stress-test';
import { TRAJECTORY_PROMPT } from './trajectory';
import { MICRO_FASCISM_RISK_SUMMARY_PROMPT_TEMPLATE } from './micro-fascism';
import { LIBERATORY_CAPACITY_SUMMARY_PROMPT_TEMPLATE } from './liberatory';
import { ECOSYSTEM_GENERATION_PROMPT_TEMPLATE, COMPLIANCE_CASCADE_PROMPT_TEMPLATE } from './ecosystem-simulation';

export interface PromptDefinition {
    id: string;
    name: string;
    description: string;
    category: 'Analysis' | 'Extraction' | 'Simulation' | 'Critique';
    defaultValue: string;
    outputSchema?: {
        format: 'json' | 'text';
        requiredKeys?: string[];
    };
}

export const PROMPT_DEFINITIONS: Record<string, PromptDefinition> = {
    'absence_analysis': {
        id: 'absence_analysis',
        name: 'Absence Analysis',
        description: 'Analyzes missing voices, silent actors, and structural voids in the ecosystem.',
        category: 'Analysis',
        defaultValue: ABSENCE_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: ['narrative', 'missing_voices', 'structural_voids', 'blindspot_intensity', 'socio_technical_components', 'policy_mobilities', 'stabilization_mechanisms']
        }
    },
    'assemblage_extraction_v3': {
        id: 'assemblage_extraction_v3',
        name: 'Assemblage Extraction',
        description: 'Extracts actors, mechanisms, and relations from raw text using Assemblage Theory.',
        category: 'Extraction',
        defaultValue: ASSEMBLAGE_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: ['assemblage', 'actors', 'relations']
        }
    },
    'comparative_synthesis': {
        id: 'comparative_synthesis',
        name: 'Comparative Synthesis',
        description: 'Synthesizes findings across multiple analytic lenses (Framing, Logics, Legitimacy).',
        category: 'Analysis',
        defaultValue: COMPARATIVE_SYNTHESIS_PROMPT,
        outputSchema: { format: 'json' }
    },
    'comparison_framework': {
        id: 'comparison_framework',
        name: 'Comparison Framework (DSF)',
        description: 'Compares two governance frameworks using the Decolonial Situatedness Framework.',
        category: 'Analysis',
        defaultValue: COMPARISON_SYSTEM_PROMPT,
        outputSchema: { format: 'json' }
    },
    'critique_panel': {
        id: 'critique_panel',
        name: 'Critique Panel',
        description: 'Simulates a 3-person academic review panel (Decolonial, Actor-Network, Legal) to critique an analysis.',
        category: 'Critique',
        defaultValue: CRITIQUE_SYSTEM_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: ['blind_spots', 'over_interpretation', 'legitimacy_correction']
        }
    },
    'cultural_framing': {
        id: 'cultural_framing',
        name: 'Cultural Framing Lens',
        description: 'Analyzes implicit cultural assumptions, metaphors, and state-market imaginaries.',
        category: 'Analysis',
        defaultValue: CULTURAL_FRAMING_PROMPT
    },
    'cultural_holes': {
        id: 'cultural_holes',
        name: 'Cultural Holes Analysis',
        description: 'Identifies disconnects in meaning and vocabulary between different actor groups.',
        category: 'Analysis',
        defaultValue: CULTURAL_HOLES_PROMPT
    },
    'dsf_lens': {
        id: 'dsf_lens',
        name: 'Decolonial Situatedness Framework (DSF)',
        description: 'Core lens for analyzing power, coloniality, and situatedness in assemblages.',
        category: 'Analysis',
        defaultValue: DSF_SYSTEM_PROMPT
    },
    'micro_fascism_risk': {
        id: 'micro_fascism_risk',
        name: 'Micro-Fascism Risk Summary',
        description: 'Generates the diagnostic narrative for the Risk Index card.',
        category: 'Analysis',
        defaultValue: MICRO_FASCISM_RISK_SUMMARY_PROMPT_TEMPLATE,
        outputSchema: { format: 'text' }
    },
    'liberatory_capacity': {
        id: 'liberatory_capacity',
        name: 'Liberatory Capacity Summary',
        description: 'Generates the diagnostic narrative for the Liberatory Capacity Index (LGCI).',
        category: 'Analysis',
        defaultValue: LIBERATORY_CAPACITY_SUMMARY_PROMPT_TEMPLATE,
        outputSchema: { format: 'text' }
    },
    'ecosystem_analysis': {
        id: 'ecosystem_analysis',
        name: 'Ecosystem Impact Mapping',
        description: 'Maps policy mechanisms to second and third-order impacts on ecosystem actors.',
        category: 'Analysis',
        defaultValue: ECOSYSTEM_SYSTEM_PROMPT
    },
    'institutional_logics': {
        id: 'institutional_logics',
        name: 'Institutional Logics Lens',
        description: 'Analyzes competing organizing principles (Market, State, Professional, Community).',
        category: 'Analysis',
        defaultValue: INSTITUTIONAL_LOGICS_PROMPT
    },
    'legitimacy_analysis': {
        id: 'legitimacy_analysis',
        name: 'Legitimacy (Orders of Worth)',
        description: 'Analyzes moral justifications using Boltanski & Thévenot’s Orders of Worth.',
        category: 'Analysis',
        defaultValue: LEGITIMACY_PROMPT
    },
    'ontology_extraction': {
        id: 'ontology_extraction',
        name: 'Ontology Extraction',
        description: 'Extracts a structured Concept Map (nodes & links) from text.',
        category: 'Extraction',
        defaultValue: ONTOLOGY_SYSTEM_PROMPT
    },
    'ontology_comparison': {
        id: 'ontology_comparison',
        name: 'Ontology Comparison',
        description: 'Compares two different ontology maps.',
        category: 'Analysis',
        defaultValue: ONTOLOGY_COMPARISON_SYSTEM_PROMPT
    },
    'perspective_simulation': {
        id: 'perspective_simulation',
        name: 'Perspective Simulation',
        description: 'Generates conflicting viewpoints (Market vs Democratic) on a topic.',
        category: 'Simulation',
        defaultValue: PERSPECTIVE_SIMULATION_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: ['perspectiveA', 'perspectiveB']
        }
    },
    'resistance_analysis': {
        id: 'resistance_analysis',
        name: 'Resistance Analysis',
        description: 'Detects micro-resistance strategies (Gambiarra, Obfuscation, Refusal) in text.',
        category: 'Analysis',
        defaultValue: RESISTANCE_SYSTEM_PROMPT
    },
    'resistance_generation': {
        id: 'resistance_generation',
        name: 'Resistance Generation',
        description: 'Generates synthetic user resistance traces for simulation.',
        category: 'Simulation',
        defaultValue: RESISTANCE_GENERATION_PROMPT
    },
    'resistance_synthesis': {
        id: 'resistance_synthesis',
        name: 'Resistance Synthesis',
        description: 'Synthesizes patterns from multiple resistance traces.',
        category: 'Analysis',
        defaultValue: RESISTANCE_SYNTHESIS_PROMPT
    },
    'stress_test': {
        id: 'stress_test',
        name: 'Adversarial Stress Test',
        description: 'Red-teams a policy by reframing it through an opposing ideological lens.',
        category: 'Critique',
        defaultValue: STRESS_TEST_SYSTEM_PROMPT
    },
    'trajectory_simulation': {
        id: 'trajectory_simulation',
        name: 'Trajectory Simulation',
        description: 'Simulates structural shifts in the ecosystem under different governance scenarios.',
        category: 'Simulation',
        defaultValue: TRAJECTORY_PROMPT
    },
    'theme_extraction': {
        id: 'theme_extraction',
        name: 'Theme Extraction (Grounded Theory)',
        description: 'Extracts emic themes from policy documents.',
        category: 'Extraction',
        defaultValue: THEME_EXTRACTION_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: ['theme', 'quote']
        }
    },
    'bridging_concepts': {
        id: 'bridging_concepts',
        name: 'Bridging Concepts',
        description: 'Generates theoretical bridges for structural holes.',
        category: 'Analysis',
        defaultValue: BRIDGING_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: ['bridgingConcepts', 'opportunity', 'policyImplication']
        }
    },
    'cultural_lens_institutional_logics': {
        id: 'cultural_lens_institutional_logics',
        name: 'Lens: Institutional Logics',
        description: 'Lens addition for analyzing institutional logics.',
        category: 'Analysis',
        defaultValue: LENS_PROMPTS['institutional_logics']
    },
    'cultural_lens_critical_data_studies': {
        id: 'cultural_lens_critical_data_studies',
        name: 'Lens: Critical Data Studies',
        description: 'Lens addition for critical data studies.',
        category: 'Analysis',
        defaultValue: LENS_PROMPTS['critical_data_studies']
    },
    'cultural_lens_actor_network_theory': {
        id: 'cultural_lens_actor_network_theory',
        name: 'Lens: Actor-Network Theory',
        description: 'Lens addition for ANT.',
        category: 'Analysis',
        defaultValue: LENS_PROMPTS['actor_network_theory']
    },
    'cultural_lens_dsf_lens': {
        id: 'cultural_lens_dsf_lens',
        name: 'Lens: DSF (Short)',
        description: 'Lens addition for Decolonial Situatedness Framework.',
        category: 'Analysis',
        defaultValue: LENS_PROMPTS['dsf_lens']
    },
    'key_term_extraction': {
        id: 'key_term_extraction',
        name: 'Key Term Extraction',
        description: 'Extracts searchable terms from policy documents.',
        category: 'Extraction',
        defaultValue: KEY_TERM_EXTRACTION_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: []
        }
    },
    'subject_identification': {
        id: 'subject_identification',
        name: 'Subject Identification',
        description: 'Identifies the policy/entity name from text.',
        category: 'Extraction',
        defaultValue: SUBJECT_IDENTIFICATION_PROMPT
    },
    'resistance_curation': {
        id: 'resistance_curation',
        name: 'Resistance Curation',
        description: 'Classifies search results into resistance typologies.',
        category: 'Analysis',
        defaultValue: RESISTANCE_CURATION_PROMPT,
        outputSchema: {
            format: 'json',
            requiredKeys: ['items']
        }
    },
    'ecosystem_generation': {
        id: 'ecosystem_generation',
        name: 'Ecosystem Actor Generation',
        description: 'Generates relevant actors based on a user query.',
        category: 'Simulation',
        defaultValue: ECOSYSTEM_GENERATION_PROMPT_TEMPLATE,
        outputSchema: {
            format: 'json',
            requiredKeys: ['actors']
        }
    },
    'compliance_cascade': {
        id: 'compliance_cascade',
        name: 'Compliance Cascade Simulation',
        description: 'Simulates phase transitions in the ecosystem triggered by an event.',
        category: 'Simulation',
        defaultValue: COMPLIANCE_CASCADE_PROMPT_TEMPLATE,
        outputSchema: {
            format: 'json',
            requiredKeys: ['timeline']
        }
    }
};

export type PromptId = keyof typeof PROMPT_DEFINITIONS;

export class PromptRegistry {
    static getAllDefinitions(): PromptDefinition[] {
        return Object.values(PROMPT_DEFINITIONS);
    }

    static getDefinition(id: string): PromptDefinition | undefined {
        return PROMPT_DEFINITIONS[id as PromptId];
    }

    /**
     * Returns the effective prompt for a user:
     * 1. Checks for a user-specific override in StorageService.
     * 2. Falls back to the hardcoded default value.
     */
    static async getEffectivePrompt(userId: string, id: string): Promise<string> {
        const overrideKey = `prompt_override:${id}`;
        const customValue = await StorageService.get<string>(userId, overrideKey);

        if (customValue) {
            return customValue;
        }

        const def = this.getDefinition(id);
        return def ? def.defaultValue : '';
    }

    static async saveOverride(userId: string, id: string, value: string): Promise<void> {
        const overrideKey = `prompt_override:${id}`;
        await StorageService.set(userId, overrideKey, value);
    }

    static async resetToDefault(userId: string, id: string): Promise<void> {
        const overrideKey = `prompt_override:${id}`;
        await StorageService.delete(userId, overrideKey);
    }
}
