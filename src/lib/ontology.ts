export interface OntologyNode {
    id: string;
    name: string;
    category: string; // e.g., "EU AI Act", "Brazil PL 2338", "US AI EO", "Cross-Regime"
    keywords: string[];
}

/**
 * Policy-specific ontology focused on:
 * - EU AI Act
 * - Brazil PL 2338
 * - US AI Executive Order on AI
 * plus key cross-regime concepts.
 */
export const SEED_ONTOLOGY: OntologyNode[] = [
    // ============================
    // EU AI ACT CLUSTERS
    // ============================
    {
        id: "eu_high_risk",
        name: "EU AI Act – High-Risk Regime",
        category: "EU AI Act",
        keywords: [
            "eu ai act",
            "high-risk",
            "high risk",
            "annex iii",
            "conformity assessment",
            "notified body",
            "notified bodies",
            "provider",
            "deployer",
            "market surveillance authority",
            "market surveillance authorities",
            "post-market monitoring",
            "quality management system"
        ]
    },
    {
        id: "eu_fundamental_rights",
        name: "EU AI Act – Fundamental Rights & Charter",
        category: "EU AI Act",
        keywords: [
            "fundamental rights",
            "charter of fundamental rights",
            "fundamental rights impact assessment",
            "fria",
            "non-discrimination",
            "health and safety",
            "risk to fundamental rights",
            "human dignity",
            "vulnerable persons"
        ]
    },
    {
        id: "eu_governance",
        name: "EU AI Act – Governance & Institutions",
        category: "EU AI Act",
        keywords: [
            "european ai board",
            "ai board",
            "national competent authority",
            "national competent authorities",
            "notifying authority",
            "harmonised standards",
            "harmonized standards",
            "cen",
            "cenelec",
            "standardisation request",
            "standardization request"
        ]
    },

    // ============================
    // BRAZIL PL 2338 CLUSTERS
    // ============================
    {
        id: "br_risk_rights",
        name: "Brazil PL 2338 – Risk & Rights Framing",
        category: "Brazil PL 2338",
        keywords: [
            "pl 2338",
            "lei de inteligencia artificial",
            "brazil",
            "brasil",
            "fundamental rights",
            "human rights",
            "dignity",
            "discrimination",
            "racial discrimination",
            "structural racism",
            "social inequality"
        ]
    },
    {
        id: "br_governance",
        name: "Brazil PL 2338 – Governance & Enforcement",
        category: "Brazil PL 2338",
        keywords: [
            "anpd",
            "national data protection authority",
            "autoridade nacional de protecao de dados",
            "competent authority",
            "regulatory authority",
            "regulatory sandbox",
            "national ai strategy"
        ]
    },
    {
        id: "br_global_south",
        name: "Brazil PL 2338 – Global South Positioning",
        category: "Brazil PL 2338",
        keywords: [
            "global south",
            "latin america",
            "developing countries",
            "developing nation",
            "peripheral countries",
            "postcolonial",
            "south-south",
            "digital colonialism"
        ]
    },

    // ============================
    // US AI EXECUTIVE ORDER CLUSTERS
    // ============================
    {
        id: "us_safety_security",
        name: "US AI Executive Order – Safety & Security",
        category: "US AI EO",
        keywords: [
            "executive order",
            "ai safety",
            "ai safety and security",
            "frontier model",
            "frontier ai",
            "dual-use",
            "national security",
            "critical infrastructure",
            "chemical",
            "biological",
            "cybersecurity",
            "red-teaming",
            "red teaming",
            "secure by design"
        ]
    },
    {
        id: "us_rights_labor",
        name: "US AI Executive Order – Civil Rights & Labor",
        category: "US AI EO",
        keywords: [
            "civil rights",
            "equal opportunity",
            "algorithmic discrimination",
            "non-discrimination",
            "worker surveillance",
            "workplace monitoring",
            "labor rights",
            "collective bargaining",
            "federal contractors",
            "employment discrimination"
        ]
    },
    {
        id: "us_innovation_competitiveness",
        name: "US AI Executive Order – Innovation & Competitiveness",
        category: "US AI EO",
        keywords: [
            "innovation",
            "american leadership",
            "global competitiveness",
            "small businesses",
            "innovation hubs",
            "research and development",
            "r&d",
            "nist",
            "risk management framework",
            "rmf",
            "testbeds",
            "public-private partnership"
        ]
    },

    // ============================
    // CROSS-REGIME CLUSTERS
    // ============================
    {
        id: "cross_data_protection",
        name: "Cross-Regime – Data Protection & Privacy",
        category: "Cross-Regime",
        keywords: [
            "gdpr",
            "data protection",
            "data subject",
            "personal data",
            "sensitive data",
            "privacy",
            "consent",
            "processing of personal data",
            "data controller",
            "data processor"
        ]
    },
    {
        id: "cross_international_alignment",
        name: "Cross-Regime – International Alignment & Diffusion",
        category: "Cross-Regime",
        keywords: [
            "international cooperation",
            "regulatory convergence",
            "brussels effect",
            "oecd",
            "g7",
            "unesco",
            "council of europe",
            "international standards",
            "global governance",
            "standards alignment"
        ]
    },
    {
        id: "cross_marginalized_groups",
        name: "Cross-Regime – Marginalized & Vulnerable Groups",
        category: "Cross-Regime",
        keywords: [
            "marginalized",
            "vulnerable",
            "indigenous",
            "persons with disabilities",
            "people with disabilities",
            "migrants",
            "refugees",
            "children",
            "youth",
            "elderly",
            "older persons"
        ]
    }
];

/**
 * Detect ontology nodes that are "silent" (under-represented or absent)
 * in a given text.
 *
 * @param text       The policy or analysis text to scan.
 * @param threshold  Minimum number of keyword matches required to consider
 *                   the node as "present". Default 0 = strict silence:
 *                   any match means "not silent".
 */
export function detectSilences(
    text: string,
    threshold: number = 0
): OntologyNode[] {
    const lowerText = text.toLowerCase();

    // Tokenize text into normalized words
    const tokens = new Set(
        lowerText
            .replace(/[^a-z0-9\s-]/g, "")
            .split(/\s+/)
            .filter(Boolean)
    );

    return SEED_ONTOLOGY.filter((node) => {
        let matches = 0;

        for (const keyword of node.keywords) {
            const kw = keyword.toLowerCase();

            // Exact token match
            if (tokens.has(kw)) {
                matches++;
                continue;
            }

            // Phrase or hyphenated match (for multi-word expressions)
            if (lowerText.includes(kw)) {
                matches++;
                continue;
            }
        }

        // Silence = number of keyword matches ≤ threshold
        return matches <= threshold;
    });
}

// Optional richer diagnostics

export interface SilenceResult {
    node: OntologyNode;
    matches: number;
    total: number;
    silence: boolean;
}

/**
 * Returns both silence/no-silence and simple coverage scores
 * for each ontology node.
 */
export function detectSilenceWithScores(
    text: string,
    threshold: number = 0
): SilenceResult[] {
    const lower = text.toLowerCase();

    return SEED_ONTOLOGY.map((node) => {
        const matches = node.keywords.filter((k) =>
            lower.includes(k.toLowerCase())
        ).length;

        return {
            node,
            matches,
            total: node.keywords.length,
            silence: matches <= threshold
        };
    });
}
