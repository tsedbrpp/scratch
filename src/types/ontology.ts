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
  ghostReason?: string;
  strength?: number;
  potentialConnections?: Array<{
    targetActor: string;
    relationshipType: string;
    evidence: string;
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
