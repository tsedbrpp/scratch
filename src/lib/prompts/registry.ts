// Force rebuild
import { StorageService } from '@/lib/storage-service';
import { ABSENCE_PROMPT } from './absence';
import { ASSEMBLAGE_PROMPT } from './assemblage';
import { ASSEMBLAGE_EXPLANATION_PROMPT } from './assemblage-explanation';
import { COMPARATIVE_SYNTHESIS_PROMPT } from './comparative-synthesis';
import { COMPARISON_SYSTEM_PROMPT } from './comparison';
import { CRITIQUE_SYSTEM_PROMPT } from './critique';
import { THEME_EXTRACTION_PROMPT, BRIDGING_PROMPT, LENS_PROMPTS } from './cultural-analysis';
import { CULTURAL_FRAMING_PROMPT } from './cultural-framing';
import { KEY_TERM_EXTRACTION_PROMPT, SUBJECT_IDENTIFICATION_PROMPT, RESISTANCE_CURATION_PROMPT } from './search-traces';
import { DSF_SYSTEM_PROMPT } from './dsf';
import { ECOSYSTEM_SYSTEM_PROMPT } from './ecosystem';
import { INSTITUTIONAL_LOGICS_PROMPT } from './institutional-logics';
import { LEGITIMACY_PROMPT } from './legitimacy';
// Note: ONTOLOGY_SYSTEM_PROMPT has multiple exports, usually we just need the main one or we can register them separately.
import { ONTOLOGY_SYSTEM_PROMPT, ONTOLOGY_COMPARISON_SYSTEM_PROMPT } from './ontology';
import { RESISTANCE_SYSTEM_PROMPT, RESISTANCE_SYNTHESIS_PROMPT } from './resistance';
import { RESISTANCE_DISCOURSE_ANALYSIS_PROMPT } from './resistance-analysis';
import { STRESS_TEST_SYSTEM_PROMPT } from './stress-test';
import { MICRO_FASCISM_RISK_SUMMARY_PROMPT_TEMPLATE } from './micro-fascism';
import { LIBERATORY_CAPACITY_SUMMARY_PROMPT_TEMPLATE } from './liberatory';
import { ANT_TRACE_PROMPT, ASSEMBLAGE_REALIST_PROMPT, HYBRID_REFLEXIVE_PROMPT } from './theoretical-prompts';

export interface PromptDefinition {
    id: string;
    name: string;
    description: string;
    category: 'Analysis' | 'Extraction' | 'Simulation' | 'Critique';
    defaultValue: string;
    version: string;
    lastUpdated: string;
    changelog?: string[];
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
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
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
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['assemblage', 'actors', 'relations']
        }
    },
    'comparative_synthesis_v2': {
        id: 'comparative_synthesis_v2',
        name: 'Comparative Synthesis V2',
        description: 'Synthesizes findings across multiple analytic lenses (N-way comparison).',
        category: 'Analysis',
        defaultValue: COMPARATIVE_SYNTHESIS_PROMPT,
        version: '2.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: { format: 'json' }
    },
    'comparison_framework': {
        id: 'comparison_framework',
        name: 'Comparison Framework (DSF)',
        description: 'Compares two governance frameworks using the Decolonial Situatedness Framework.',
        category: 'Analysis',
        defaultValue: COMPARISON_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: { format: 'json' }
    },
    'critique_panel': {
        id: 'critique_panel',
        name: 'Critique Panel',
        description: 'Simulates a 3-person academic review panel (Decolonial, Actor-Network, Legal) to critique an analysis.',
        category: 'Critique',
        defaultValue: CRITIQUE_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
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
        defaultValue: CULTURAL_FRAMING_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'dsf_lens': {
        id: 'dsf_lens',
        name: 'Decolonial Situatedness Framework (DSF)',
        description: 'Core lens for analyzing power, coloniality, and situatedness in assemblages.',
        category: 'Analysis',
        defaultValue: DSF_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'micro_fascism_risk': {
        id: 'micro_fascism_risk',
        name: 'Micro-Fascism Risk Summary',
        description: 'Generates the diagnostic narrative for the Risk Index card.',
        category: 'Analysis',
        defaultValue: MICRO_FASCISM_RISK_SUMMARY_PROMPT_TEMPLATE,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: { format: 'text' }
    },
    'liberatory_capacity': {
        id: 'liberatory_capacity',
        name: 'Liberatory Capacity Summary',
        description: 'Generates the diagnostic narrative for the Liberatory Capacity Index (LGCI).',
        category: 'Analysis',
        defaultValue: LIBERATORY_CAPACITY_SUMMARY_PROMPT_TEMPLATE,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: { format: 'text' }
    },
    'ecosystem_analysis': {
        id: 'ecosystem_analysis',
        name: 'Ecosystem Impact Mapping',
        description: 'Maps policy mechanisms to second and third-order impacts on ecosystem actors.',
        category: 'Analysis',
        defaultValue: ECOSYSTEM_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'institutional_logics': {
        id: 'institutional_logics',
        name: 'Institutional Logics Lens',
        description: 'Analyzes competing organizing principles (Market, State, Professional, Community).',
        category: 'Analysis',
        defaultValue: INSTITUTIONAL_LOGICS_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'legitimacy_analysis': {
        id: 'legitimacy_analysis',
        name: 'Legitimacy (Orders of Worth)',
        description: 'Analyzes moral justifications using Boltanski & Thévenot’s Orders of Worth.',
        category: 'Analysis',
        defaultValue: LEGITIMACY_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'ontology_extraction': {
        id: 'ontology_extraction',
        name: 'Ontology Extraction',
        description: 'Extracts a structured Concept Map (nodes & links) from text.',
        category: 'Extraction',
        defaultValue: ONTOLOGY_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'ontology_comparison': {
        id: 'ontology_comparison',
        name: 'Ontology Comparison',
        description: 'Compares two different ontology maps.',
        category: 'Analysis',
        defaultValue: ONTOLOGY_COMPARISON_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },

    'resistance_analysis': {
        id: 'resistance_analysis',
        name: 'Resistance Analysis',
        description: 'Detects micro-resistance strategies (Gambiarra, Obfuscation, Refusal) in text.',
        category: 'Analysis',
        defaultValue: RESISTANCE_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },

    'resistance_synthesis': {
        id: 'resistance_synthesis',
        name: 'Resistance Synthesis',
        description: 'Synthesizes patterns from multiple resistance traces.',
        category: 'Analysis',
        defaultValue: RESISTANCE_SYNTHESIS_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'stress_test': {
        id: 'stress_test',
        name: 'Adversarial Stress Test',
        description: 'Red-teams a policy by reframing it through an opposing ideological lens.',
        category: 'Critique',
        defaultValue: STRESS_TEST_SYSTEM_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },

    'theme_extraction': {
        id: 'theme_extraction',
        name: 'Theme Extraction (Grounded Theory)',
        description: 'Extracts emic themes from policy documents.',
        category: 'Extraction',
        defaultValue: THEME_EXTRACTION_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
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
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
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
        defaultValue: LENS_PROMPTS['institutional_logics'],
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'cultural_lens_critical_data_studies': {
        id: 'cultural_lens_critical_data_studies',
        name: 'Lens: Critical Data Studies',
        description: 'Lens addition for critical data studies.',
        category: 'Analysis',
        defaultValue: LENS_PROMPTS['critical_data_studies'],
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'cultural_lens_actor_network_theory': {
        id: 'cultural_lens_actor_network_theory',
        name: 'Lens: Actor-Network Theory',
        description: 'Lens addition for ANT.',
        category: 'Analysis',
        defaultValue: LENS_PROMPTS['actor_network_theory'],
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'cultural_lens_dsf_lens': {
        id: 'cultural_lens_dsf_lens',
        name: 'Lens: DSF (Short)',
        description: 'Lens addition for Decolonial Situatedness Framework.',
        category: 'Analysis',
        defaultValue: LENS_PROMPTS['dsf_lens'],
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'key_term_extraction': {
        id: 'key_term_extraction',
        name: 'Key Term Extraction',
        description: 'Extracts searchable terms from policy documents.',
        category: 'Extraction',
        defaultValue: KEY_TERM_EXTRACTION_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
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
        defaultValue: SUBJECT_IDENTIFICATION_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry']
    },
    'resistance_curation': {
        id: 'resistance_curation',
        name: 'Resistance Curation',
        description: 'Classifies search results into resistance typologies.',
        category: 'Analysis',
        defaultValue: RESISTANCE_CURATION_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['items']
        }
    },

    'assemblage_explanation': {
        id: 'assemblage_explanation',
        name: 'Assemblage Explanation',
        description: 'Explains the political significance of Hull Stability and Porosity.',
        category: 'Analysis',
        defaultValue: ASSEMBLAGE_EXPLANATION_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['narrative', 'hulls']
        }
    },
    'ant_trace_explanation': {
        id: 'ant_trace_explanation',
        name: 'ANT Trace Explanation',
        description: 'Generates a descriptive methodological trace of the actor-network.',
        category: 'Analysis',
        defaultValue: ANT_TRACE_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['narrative']
        }
    },
    'assemblage_realist_explanation': {
        id: 'assemblage_realist_explanation',
        name: 'Assemblage Realist Explanation',
        description: 'Interprets mechanisms of territorialization and coding.',
        category: 'Analysis',
        defaultValue: ASSEMBLAGE_REALIST_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['narrative', 'trajectory_analysis']
        }
    },
    'hybrid_reflexive_explanation': {
        id: 'hybrid_reflexive_explanation',
        name: 'Hybrid Reflexive Explanation',
        description: 'Synthesizes ANT trace and Assemblage mechanisms with theoretical reflexivity.',
        category: 'Analysis',
        defaultValue: HYBRID_REFLEXIVE_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['narrative']
        }
    },
    'generate_search_terms': {
        id: 'generate_search_terms',
        name: 'Generate Search Terms',
        description: 'Extracts key search terms from policy insights for finding online discussions.',
        category: 'Extraction',
        defaultValue: `Given this policy insight, extract 3-5 key search terms or phrases that would be most effective for finding related discussions on Reddit. Focus on concrete topics, issues, or controversies that people would actually discuss online.\n\nReturn ONLY a JSON array of search terms, without any markdown formatting or explanation. Example format:\n["algorithmic bias", "AI regulation", "facial recognition"]`,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: []
        }
    },
    'trajectory_simulation': {
        id: 'trajectory_simulation',
        name: 'Trajectory Simulation',
        description: 'Simulates how an assemblage evolves under specific scenario conditions.',
        category: 'Simulation',
        defaultValue: `You are analyzing the trajectory of an algorithmic assemblage under specific conditions.\n\nGiven a set of actors and a scenario, predict how the assemblage will evolve. Consider:\n- How territorialization and deterritorialization forces shift\n- Which actors gain or lose influence\n- What new connections or disconnections emerge\n- How coding mechanisms change\n\nReturn your analysis as JSON with:\n- narrative: Overall trajectory description\n- deltas: Array of changes with source_id, target_id, change_type, and description\n- stabilization_mechanisms: What keeps the assemblage coherent\n- lines_of_flight: Potential escape routes or mutations`,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['narrative', 'deltas']
        }
    },
    'resistance_discourse_analysis': {
        id: 'resistance_discourse_analysis',
        name: 'Resistance Discourse Analysis',
        description: 'Analyzes resistance artifacts through assemblage theory and critical discourse analysis.',
        category: 'Analysis',
        defaultValue: RESISTANCE_DISCOURSE_ANALYSIS_PROMPT,
        version: '1.0.0',
        lastUpdated: '2026-02-06',
        changelog: ['Initial version tracked in registry'],
        outputSchema: {
            format: 'json',
            requiredKeys: ['frames', 'rhetorical_strategies', 'reconfiguration']
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
