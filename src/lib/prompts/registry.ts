import { StorageService } from '@/lib/storage-service';
import { ABSENCE_PROMPT } from './absence';
import { ASSEMBLAGE_PROMPT } from './assemblage';
import { COMPARATIVE_SYNTHESIS_PROMPT } from './comparative-synthesis';
import { COMPARISON_SYSTEM_PROMPT } from './comparison';
import { CRITIQUE_SYSTEM_PROMPT } from './critique';
import { CULTURAL_FRAMING_PROMPT } from './cultural-framing';
import { CULTURAL_HOLES_PROMPT } from './cultural-holes';
import { DSF_SYSTEM_PROMPT } from './dsf';
import { ECOSYSTEM_SYSTEM_PROMPT } from './ecosystem';
import { INSTITUTIONAL_LOGICS_PROMPT } from './institutional-logics';
import { LEGITIMACY_PROMPT } from './legitimacy';
// Note: ONTOLOGY_SYSTEM_PROMPT has multiple exports, usually we just need the main one or we can register them separately.
import { ONTOLOGY_SYSTEM_PROMPT, ONTOLOGY_COMPARISON_SYSTEM_PROMPT } from './ontology';
import { RESISTANCE_SYSTEM_PROMPT, RESISTANCE_GENERATION_PROMPT, RESISTANCE_SYNTHESIS_PROMPT } from './resistance';
import { STRESS_TEST_SYSTEM_PROMPT } from './stress-test';
import { TRAJECTORY_PROMPT } from './trajectory';

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
            requiredKeys: ['narrative', 'missing_voices', 'structural_voids', 'blindspot_intensity']
        }
    },
    'assemblage_extraction': {
        id: 'assemblage_extraction',
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
