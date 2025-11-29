export interface OntologyNode {
    id: string;
    label: string;
    category: string;
    description?: string;
    quote?: string;
    x?: number;
    y?: number;
    color?: string;
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
}

export interface ComparisonResult {
    summary: string;
    shared_concepts: string[];
    unique_concepts_source_a: string[];
    unique_concepts_source_b: string[];
    structural_differences: string;
    relationship_divergences: { concept: string; difference: string }[];
}
