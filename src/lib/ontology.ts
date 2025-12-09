export interface OntologyNode {
    id: string;
    name: string;
    category: string;
    keywords: string[];
}

export const SEED_ONTOLOGY: OntologyNode[] = [
    {
        id: 'labor',
        name: 'Labor Unions & Gig Workers',
        category: 'Civil Society',
        keywords: ['union', 'worker', 'labor', 'collective bargaining', 'gig economy', 'driver', 'rider']
    },
    {
        id: 'indigenous',
        name: 'Indigenous Data Sovereignty',
        category: 'Civil Society',
        keywords: ['indigenous', 'first nations', 'aboriginal', 'sovereignty', 'traditional knowledge', 'land rights']
    },
    {
        id: 'environment',
        name: 'Environmental Justice Groups',
        category: 'Civil Society',
        keywords: ['environment', 'climate', 'carbon', 'ecological', 'sustainability', 'green']
    },
    {
        id: 'global_south',
        name: 'Global South Governments',
        category: 'State',
        keywords: ['global south', 'developing nations', 'g77', 'brics', 'colonial', 'imperial']
    },
    {
        id: 'migrants',
        name: 'Migrants & Refugees',
        category: 'Vulnerable Populations',
        keywords: ['migrant', 'refugee', 'asylum', 'border', 'displacement', 'stateless']
    },
    {
        id: 'future_generations',
        name: 'Future Generations',
        category: 'Vulnerable Populations',
        keywords: ['future generation', 'long-term', 'posterity', 'intergenerational']
    }
];

export function detectSilences(text: string): OntologyNode[] {
    const lowerText = text.toLowerCase();
    return SEED_ONTOLOGY.filter(node => {
        // Return true if NONE of the keywords are present
        return !node.keywords.some(keyword => lowerText.includes(keyword));
    });
}
