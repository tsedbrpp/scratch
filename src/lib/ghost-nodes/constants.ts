export const EXPECTED_ACTORS: Record<string, string[]> = {
    policy: [
        "Civil Society Organizations",
        "Citizens / Public",
        "Academic Researchers",
        "Industry Representatives",
        "Regulators / Government Agencies",
        "Marginalized Communities",
        "Advocacy Groups",
        "Local Governments / Municipalities",
        "International Organizations",
        "Independent Watchdogs",
        "SMEs / Startups",
        "Consumers",
        "Labor Unions / Workers",
        "Environmental Groups",
        "Media / Journalists",
        "Indigenous Communities"
    ],
    ai_policy: [
        "Civil Society Organizations",
        "Privacy Advocates",
        "AI Safety Researchers",
        "Labor Representatives",
        "Data Subjects",
        "Algorithms / AI Systems", // Non-human actors
        "Data Centers / Cloud Providers",
        "Tech Gig Workers (Data Labelers)",
        "Content Creators / Artists",
        "Independent Auditors",
        "Local Communities (Compute Impact)",
        "Small / Open Source Developers",
        "Global South Stakeholders",
        "Legal / Human Rights Experts",
        "Ethics Boards"
    ],
    corporate: [
        "Employees / Workers",
        "Customers / Users",
        "Local Communities",
        "Suppliers / Vendors",
        "Shareholders / Investors",
        "Regulators",
        "Competitors",
        "Labor Unions",
        "Environmental Organizations",
        "Civil Rights Groups",
        "Independent Auditors",
        "Supply Chain Workers (Tier 2/3)"
    ],
    technology: [
        "End Users",
        "Accessibility Advocates",
        "Open Source Contributors",
        "Privacy Watchdogs",
        "Regulators",
        "Civil Society",
        "Data Subjects",
        "Marginalized Groups (Algorithmic Bias)",
        "Gig Workers",
        "Content Moderators",
        "Third-Party Developers",
        "Cybersecurity Community",
        "Environmental Groups (E-waste / Energy)",
        "Children / Youth Advocates"
    ],
    diplomatic: [
        "Civil Society Organizations",
        "Non-Aligned Nations",
        "Global South Representatives",
        "Indigenous Peoples",
        "Refugees / Displaced Persons",
        "International NGOs",
        "Local Conflict Communities",
        "Women / Marginalized Genders",
        "Youth Representatives",
        "Environmental Defenders",
        "Human Rights Observers",
        "Scientific Community",
        "Small Island Developing States (SIDS)"
    ],
    academic: [
        "Students",
        "Adjunct Faculty / Contingent Labor",
        "Local Community",
        "Staff / Administration",
        "Funding Agencies",
        "Industry Partners",
        "Alumni",
        "Research Subjects / Participants",
        "Academic Publishers",
        "Peer Reviewers",
        "Underrepresented Minorities (DEI)",
        "Libraries / Archives"
    ],
    tech_policy: [
        "Open Source Community",
        "Digital Rights Groups",
        "Marginalized Users",
        "Small Businesses / Startups",
        "Consumer Protection Agencies",
        "Gig Economy Workers",
        "Content Moderators",
        "Cybersecurity Researchers",
        "Data Privacy Advocates",
        "Telecom Providers",
        "Hardware Manufacturers",
        "Standard Setting Bodies",
        "Technical Community",
        "Academic Institutions",
        "International Organizations",
    ],
    default: [
        "Civil Society",
        "Citizens",
        "Marginalized Communities",
        "Academic Researchers",
        "Public Interest Groups",
    ],
};


export const PRE_NEGATION_TRIGGERS = [
    // Direct exclusion verbs
    /(?:does|shall|will|would|may|can)(?:\s+not)\s+(?:apply|extend|cover|include|impose|require|obligate)\s+(?:to\s+)?/gi,
    // Exclusion nouns/adjectives
    /(?:exclud(?:es?|ing|ed)?|exempt(?:s|ing|ed)?|except(?:ing)?)\s+/gi,
    // Prepositional exclusions
    /(?:other than|apart from|with the exception of|inapplicable to|not subject to|outside (?:the )?scope of)\s+/gi,
    // Scope-limiting (pseudo-negation — weaker signal)
    /(?:limited to|restricted to|confined to|only (?:applies?|relevant|intended) (?:to|for))\s+/gi,
];

export const SCOPE_TERMINATORS = /(?:\.|;|\n|(?:\b(?:but|however|except|although|unless)\b))/;

export const NEGATION_WINDOW_CHARS = 200;

export const PSEUDO_NEGATION = [
    /no\s+(?:change|increase|decrease|evidence|sign|indication|history|prior|previous|further)/gi,
    /(?:rule out|free of|without evidence of|regardless of|in lieu of|irrespective of)/gi,
    /not\s+(?:shown|demonstrated|apparent|necessarily|always|unlike)/gi,
    /no\s+(?:obligation|requirement|duty)\s+(?:exists?|arises?)\s+until/gi,
];

export const POST_NEGATION_TRIGGERS = [
    /excluded from|not included in|shall not include|does not extend to/gi,
    /exempt from|outside the scope of|inapplicable to/gi,
    /not covered by|not subject to|removed from/gi,
];

export const DISCOURSE_TAXONOMY = [
    'market efficiency',
    'economic competitiveness',
    'national security',
    'environmental sustainability',
    'social equity',
    'technical expertise',
    'bureaucratic standardization',
    'innovation / flexibility',
    'fiscal responsibility',
    'democratic participation',
    'data protection / privacy',
    'human rights',
    'geopolitical sovereignty',
    'precautionary principle / risk aversion',
] as const;

export const STAKEHOLDER_KEYWORDS = [
    'stakeholder', 'consultation', 'participation', 'governance', 'oversight',
    'public interest', 'transparency', 'accountability', 'representation',
    'community', 'society', 'citizens', 'public', 'voices', 'engagement',
    'impact', 'harm', 'benefits', 'equity', 'fairness', 'justice',
    'rights', 'freedoms', 'protection', 'safeguards', 'vulnerable', 'marginalized',
    'inclusion', 'diversity', 'ethics', 'moral', 'values', 'principles',
    'trust', 'safety', 'security', 'privacy', 'data protection', 'surveillance',
    'bias', 'discrimination', 'liability', 'redress', 'remedy', 'complaint'
];
