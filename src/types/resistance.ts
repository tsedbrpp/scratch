/**
 * Resistance Artifacts Type Definitions
 * 
 * Primary data structures for resistance materials analysis.
 * Enables grounded theory-building about assemblage reconfigurations.
 */

export type ArtifactType =
    | 'manifesto'
    | 'policy_draft'
    | 'social_media'
    | 'protest_material'
    | 'interview'
    | 'petition'
    | 'open_letter'
    | 'other';

export interface ResistanceArtifact {
    id: string;
    title: string;
    type: ArtifactType;
    source: string; // Organization, individual, or movement
    date: string; // ISO date string
    text: string;

    // Links to assemblage
    target_policy?: string; // ID of policy document it challenges
    target_components: string[]; // Which assemblage components it addresses (e.g., "risk classification", "enforcement")

    // Analysis outputs
    frames?: DiscourseFrame[];
    rhetorical_strategies?: RhetoricalStrategy[];
    reconfiguration_potential?: ReconfigurationAnalysis;

    // Metadata
    uploaded_by: string;
    uploaded_at: string;
    tags: string[];
    notes?: string; // Researcher field notes
}

export interface DiscourseFrame {
    frame_name: string; // e.g., "data sovereignty", "algorithmic justice", "community control"
    description: string; // How this frame is deployed
    evidence_quotes: string[]; // Direct quotes supporting this frame
}

export interface RhetoricalStrategy {
    strategy: 'inversion' | 'reappropriation' | 'refusal' | 'counter_narrative' | 'scaling' | 'other';
    description: string; // How the strategy works
    example: string; // Concrete textual example
}

export interface ReconfigurationAnalysis {
    // Assemblage dynamics (Deleuzian)
    deterritorializes: string; // What existing assemblage component it destabilizes
    recodes: string; // How it reframes concepts/categories
    new_connections: string[]; // What new assemblages or relations it enables
    lines_of_flight: string[]; // Escape routes from dominant assemblage

    // Theoretical contribution
    theoretical_contribution: string; // What this reveals about assemblage dynamics
    empirical_evidence: string; // Grounding in artifact text
}

export interface ArtifactAnalysisRequest {
    artifact_id: string;
    analysis_type: 'discourse' | 'reconfiguration' | 'full';
}

export interface ArtifactAnalysisResult {
    artifact_id: string;
    frames: DiscourseFrame[];
    strategies: RhetoricalStrategy[];
    reconfiguration?: ReconfigurationAnalysis;
    generated_at: string;
}

// Filter/search types
export interface ArtifactFilters {
    type?: ArtifactType[];
    tags?: string[];
    target_policy?: string;
    date_from?: string;
    date_to?: string;
    search_text?: string;
}

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: string;
    date: string;
    type: ArtifactType;
}
