export interface OntologyNode {
  id: string;
  label: string;
  category: string;
  description?: string;
  quote?: string;
  x?: number;
  y?: number;
  color?: string;
  // Ghost node fields
  isGhost?: boolean;
  whyAbsent?: string; // AI-generated explanation of why this actor is absent
  absenceStrength?: number; // 0-100 score indicating how "strongly absent" this actor is
  exclusionType?: 'silenced' | 'marginalized' | 'structurally-excluded' | 'displaced'; // Mechanism of exclusion
  absenceType?: 'textual-absence' | 'structural-exclusion' | 'discursive-marginalization' | 'constitutive-silence'; // ANT absence category
  discourseThreats?: Array<{
    dominantDiscourse: string;
    conflictType: string;
    explanation: string;
  }>;
  ghostReason?: string; // Legacy field
  strength?: number; // Legacy field
  potentialConnections?: Array<{
    targetActor: string;
    relationshipType: string;
    evidence: string;
  }>;
  institutionalLogics?: {
    market: number;
    state: number;
    professional: number;
    community: number;
  };
  evidenceQuotes?: Array<{
    quote: string;
    actors: string[];
    sourceRef: string;
  }>;
  claim?: {
    summaryBullets: string[];
    disambiguations: string[];
    fullReasoning: string;
  };
  roster?: {
    actors: string[];
    mechanisms: string[];
  };
  missingSignals?: Array<{
    signal: string;
    searchTerms: string[];
  }>;
}

export interface OntologyLink {
  source: string;
  target: string;
  relation: string;
}

export interface OntologyData {
  summary?: string;
  nodes: OntologyNode[];
  links: OntologyLink[];
  institutionalLogics?: {
    market: {
      strength: number;
      champions: string[];
      material: string;
      discursive: string;
    };
    state: {
      strength: number;
      champions: string[];
      material: string;
      discursive: string;
    };
    professional: {
      strength: number;
      champions: string[];
      material: string;
      discursive: string;
    };
    community: {
      strength: number;
      champions: string[];
      material: string;
      discursive: string;
    };
  };
  ghostNodeCount?: number;
  methodologicalNotes?: string; // AI transparency: explains analytical approach and biases
  userActorsUsed?: string[]; // Custom actors the user specified for ghost node detection
  dominantDiscourses?: string[];
}

export interface ComparisonResult {
  summary: string;
  shared_concepts: string[];
  unique_concepts_source_a: string[];
  unique_concepts_source_b: string[];
  unique_concepts_source_c?: string[]; // Optional 3rd source
  structural_differences: string;
  relationship_divergences: { concept: string; difference: string }[];
  system_critique?: {
    blind_spots?: string[];
    over_interpretation?: string;
    legitimacy_correction?: string;
  };
  assemblage_metrics?: {
    jurisdiction: string;
    territorialization: number;
    territorialization_justification: string;
    coding: number;
    coding_justification: string;
  }[];
  sourceAId?: string;
  sourceBId?: string;
  sourceCId?: string;
}
