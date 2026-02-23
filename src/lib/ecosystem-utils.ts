
import { EcosystemActor, AssemblageAnalysis, AiAbsenceAnalysis } from "@/types/ecosystem";

// --- Swiss Design System Constants ---
export const SWISS_COLORS = {
    // Categorical Palette (Sophisticated/Muted)
    policymaker: "#2563EB", // Strong Blue
    civilsociety: "#D97706", // Amber/Gold
    privatetech: "#7C3AED", // Vivid Purple
    academic: "#059669", // Emerald Green
    infrastructure: "#475569", // Slate
    algorithm: "#DC2626", // Red
    dataset: "#0891B2", // Cyan
    default: "#94A3B8"
};

export const normalizeTaxonomyKey = (type: string): string => {
    let key = type.toLowerCase().replace(/\s/g, "");
    if (key.includes('startup') || key.includes('company')) return 'privatetech';
    if (key.includes('policy') || key.includes('government') || key.includes('regulator')) return 'policymaker';
    if (key.includes('civil') || key.includes('ngo') || key.includes('union')) return 'civilsociety';
    if (key.includes('academic') || key.includes('university') || key.includes('research')) return 'academic';
    if (key.includes('infrastructure') || key.includes('compute') || key.includes('hardware')) return 'infrastructure';
    if (key.includes('algorithm') || key.includes('model')) return 'algorithm';
    if (key.includes('data')) return 'dataset';

    // Fallback dictionary map
    if (key === 'startup') return 'privatetech';

    return key;
};

export const getActorColor = (type: string) => {
    const key = normalizeTaxonomyKey(type);
    return SWISS_COLORS[key as keyof typeof SWISS_COLORS] || SWISS_COLORS.default;
};

export type ActorShape = "circle" | "rect" | "triangle" | "square" | "hexagon" | "diamond";

export const getActorShape = (actor: EcosystemActor): ActorShape => {
    const t = actor.type.toLowerCase();
    const r = actor.role_type;

    // Direct Role Mapping
    if (r === 'Material') return 'hexagon';
    if (r === 'Expressive') return 'diamond';

    // Type-based Fallbacks
    if (t.includes('infrastructure') || t.includes('dataset')) return 'hexagon';
    if (t.includes('algorithm') || t.includes('model') || t.includes('algorithmic')) return 'triangle';
    if (t.includes('privatetech') || t.includes('startup') || t.includes('company')) return 'square';
    if (t.includes('legal') || t.includes('law')) return 'rect';
    if (t.includes('bias') || t.includes('inequity') || t.includes('risk')) return 'diamond';

    return 'circle'; // Policymaker, Academic, Civil Society
};

export interface GhostActor extends EcosystemActor {
    isGhost: boolean;
}

export function generateGhostId(name: string): string {
    const sanitized = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `ghost-${sanitized}`;
}

export const mergeGhostNodes = (actors: EcosystemActor[], unifiedGhosts: any[] = []): GhostActor[] => {
    const baseActors: GhostActor[] = actors.map(a => ({ ...a, isGhost: false }));
    const absences = unifiedGhosts;

    if (absences && absences.length > 0) {
        // Create a normalized set of existing standard actor names for deduplication
        const existingNames = new Set(
            actors.map(a => a.name.toLowerCase().trim().replace(/[^a-z0-9]/g, ''))
        );

        absences.forEach((absent) => {
            if (!absent.name) return;

            const normalizedName = absent.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

            // Only drop if there is an EXACT name match with a standard actor. 
            // We trust the Unified Catalog (which already deduplicates internally).
            if (existingNames.has(normalizedName)) {
                return;
            }

            // Preserve incoming type if provided (e.g., from page.tsx), otherwise fallback
            let normalizedType = absent.type || "Civil Society";
            if (!absent.type || absent.type.startsWith("Missing Voice")) {
                const role = (absent.role || absent.category || "").toLowerCase();
                if (role.includes("government") || role.includes("state") || role.includes("ministry")) normalizedType = "Policymaker";
                else if (role.includes("academic") || role.includes("research") || role.includes("expert")) normalizedType = "Academic";
                else if (role.includes("startup") || role.includes("business") || role.includes("private") || role.includes("tech")) normalizedType = "PrivateTech";
                else if (role.includes("infra") || role.includes("platform")) normalizedType = "Infrastructure";
                else if (role.includes("data") || role.includes("set")) normalizedType = "Dataset";
                else if (role.includes("algo") || role.includes("ai")) normalizedType = "Algorithm";
                else if (role.includes("agent")) normalizedType = "AlgorithmicAgent";
                else if (role.includes("law") || role.includes("legal")) normalizedType = "LegalObject";
            }

            // Ensure the ID has the "ghost-" prefix for EcosystemMap rendering rules, but preserve the catalog ID/fingerprint
            const finalId = absent.id ? (absent.id.startsWith('ghost-') ? absent.id : `ghost-${absent.id}`) : generateGhostId(absent.name);

            baseActors.push({
                ...absent,
                id: finalId,
                sourceId: absent.sourceId || 'absence_analysis',
                source: 'absence_fill',
                name: absent.name,
                type: normalizedType as EcosystemActor['type'],
                description: absent.description || absent.reason || "Structurally absent actor",
                // Preserve V2 Analytical Properties
                absenceType: absent.absenceType || absent.absence_type,
                exclusionType: absent.exclusionType || absent.exclusion_type,
                metrics: absent.metrics || {
                    territorialization: "Weak",
                    deterritorialization: "Strong",
                    coding: "Weak"
                },
                influence: absent.influence || "Low",
                isGhost: true
            });
        });
    }

    return baseActors as GhostActor[];
};

export const inferActorType = (name: string): EcosystemActor['type'] => {
    const n = name.toLowerCase();
    if (n.includes("ministry") || n.includes("agency") || n.includes("commission") || n.includes("eu ")) return "Policymaker";
    if (n.includes("university") || n.includes("institute") || n.includes("lab")) return "Academic";
    if (n.includes("corp") || n.includes("inc") || n.includes("ltd") || n.includes("startup") || n.includes("google") || n.includes("amazon") || n.includes("microsoft")) return "PrivateTech";
    if (n.includes("foundation") || n.includes("ngo") || n.includes("association") || n.includes("union")) return "Civil Society";
    if (n.includes("platform") || n.includes("cloud") || n.includes("server") || n.includes("api")) return "Infrastructure";
    if (n.includes("algorithm") || n.includes("model") || n.includes("ai ") || n.includes("risk score") || n.includes("classifier")) return "Algorithm";
    if (n.includes("dataset") || n.includes("training data") || n.includes("registry") || n.includes("benchmark")) return "Dataset";
    return "Civil Society"; // Default
};

// [NEW] Shared Bias Intensity Logic
export const getBiasIntensity = (actor: EcosystemActor): number => {
    if (actor.metrics?.bias_intensity !== undefined) return actor.metrics.bias_intensity;

    // HEURISTIC: High Resistance + Low Legitimacy = High Risk
    // Use inclusive parsing for string values (case-insensitive, legacy support)
    const deterrStr = String(actor.metrics?.deterritorialization || '').toLowerCase();
    let deterr = 0;

    if (typeof actor.metrics?.deterritorialization === 'number') {
        deterr = actor.metrics.deterritorialization;
    } else {
        if (deterrStr.includes('strong') || deterrStr.includes('high')) deterr = 8;
        else if (deterrStr.includes('moderate') || deterrStr.includes('medium')) deterr = 5;
        else if (deterrStr.includes('weak') || deterrStr.includes('low')) deterr = 2;
        else deterr = 4; // Default/Unknown fallback
    }

    const isAlgorithm = actor.type === 'Algorithm' || actor.type === 'AlgorithmicAgent' || actor.type === 'Dataset';
    const isCapitalist = actor.type === 'PrivateTech' || actor.id.toLowerCase().includes('profit');
    const isInfra = actor.type === 'Infrastructure';

    // Relaxed thresholds to ensure visibility on real data
    if (isAlgorithm && deterr >= 4) return 0.9; // Triggers on Moderate or unknown
    if (isCapitalist && deterr >= 5) return 0.8; // Triggers on Moderate
    if (isInfra && deterr >= 6) return 0.7; // Triggers on Strong/High

    return 0;
};

// [NEW] Shared Metric Calculation
// Avoids circular dependency by accepting edges or generating them if we move generateEdges here? 
// Actually, circular dependency risk: graph-utils imports types, ecosystem-utils imports types. Safe.
// But we need to import generateEdges from graph-utils.
import { generateEdges } from '@/lib/graph-utils';
import { EcosystemConfiguration } from "@/types/ecosystem";

export const calculateAssemblageMetrics = (actors: EcosystemActor[], config: EcosystemConfiguration | null, excludedActorIds: string[] = []) => {
    if (!config || !actors.length) {
        console.log('[StressTestDebug] Metrics: No config or actors', { config, actorCount: actors.length });
        return { porosity: 0, stability: 0, internal: 0, external: 0, coding_intensity: 0, health: 0 };
    }

    // Filter actors first
    const activeActors = actors.filter(a => !excludedActorIds.includes(a.id));
    const memberIds = config.memberIds || []; // Safe fallback

    // Debug: Log ID overlap
    const memberSet = new Set(memberIds.filter(id => !excludedActorIds.includes(id)));

    if (memberSet.size === 0) {
        console.log('[StressTestDebug] Metrics: No active members found', {
            totalMemberIds: memberIds.length,
            excluded: excludedActorIds.length,
            memberIdsSample: memberIds.slice(0, 3)
        });
        return { porosity: 0, stability: 0, internal: 0, external: 0, coding_intensity: 0, health: 0 };
    }

    // Use generateEdges to get all potential links based on types
    const edges = generateEdges(activeActors);

    // Debug: Log Edges
    // console.log('[StressTestDebug] Metrics: Edges generated', edges.length);

    let internal = 0;
    let external = 0;

    edges.forEach(edge => {
        const sIn = memberSet.has(edge.source.id);
        const tIn = memberSet.has(edge.target.id);

        if (sIn && tIn) internal++;
        else if (sIn || tIn) external++;
    });

    const total = internal + external;
    const porosity = total > 0 ? external / total : 0; // High external links = High Porosity
    const stability = total > 0 ? internal / total : 0; // High internal links = High Stability (Territorialization)

    // [NEW] Coding Intensity: Based on Type Homogeneity (Shannon Entropy)
    // High Coding = Low Entropy (Uniform types, strict sorting)
    // Low Coding = High Entropy (Heterogeneous mixing)
    const members = activeActors.filter(a => memberSet.has(a.id));
    const typeCounts: Record<string, number> = {};
    members.forEach(m => {
        typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });

    const frequencies = Object.values(typeCounts).map(count => count / members.length);
    const entropy = frequencies.reduce((sum, p) => sum - p * Math.log(p), 0);
    // Normalize entropy (Max entropy = log(numTypes)) - defaulting to 1 if mainly 1 type is possible? 
    // Max entropy for N items is log(N), or log(num_categories). We have ~9 categories.
    const maxEntropy = Math.log(9);
    const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

    // Coding Intensity = 1 - Entropy (High Homogeneity = High Coding)
    const coding_intensity = 1 - normalizedEntropy;

    const health = stability * coding_intensity * activeActors.length;

    // console.log('[StressTestDebug] Metrics Calculated:', { stability, coding_intensity, members: members.length });

    return {
        porosity,
        stability,
        internal,
        external,
        coding_intensity,
        health
    };
};


export const calculateConfigMetrics = (
    config: EcosystemConfiguration,
    links: { source: string | object; target: string | object }[]
): EcosystemConfiguration => {
    const memberSet = new Set(config.memberIds.map(id => String(id).trim()));
    let internal = 0;
    let external = 0;

    links.forEach(l => {
        // Handle both D3 object and ID string cases
        const sourceRaw = typeof l.source === 'object' && 'id' in l.source ? (l.source as EcosystemActor).id : String(l.source);
        const targetRaw = typeof l.target === 'object' && 'id' in l.target ? (l.target as EcosystemActor).id : String(l.target);

        const s = String(sourceRaw).trim();
        const t = String(targetRaw).trim();

        const sIn = memberSet.has(s);
        const tIn = memberSet.has(t);

        if (sIn && tIn) internal++;
        else if (sIn || tIn) external++;
    });

    const total = internal + external;
    const porosity = total > 0 ? external / total : 0;
    const stability = total > 0 ? internal / total : 0;

    return {
        ...config,
        properties: {
            ...config.properties,
            porosity_index: porosity,
            calculated_stability: stability,
            internal_links: internal,
            external_links: external,
            total_links: total
        }
    };
};

// [NEW] Shared Actor-to-Stage Mapping Logic
export const isActorRelevantToStage = (actor: EcosystemActor, stageId: string): boolean => {
    const t = actor.type.toLowerCase().replace(/\s/g, "");

    switch (stageId) {
        case 'problem':
            // Social actors: Civil Society, NGOs, Academics
            return ['civilsociety', 'ngo', 'academic', 'activist', 'public', 'humandights', 'labor'].some(k => t.includes(k));

        case 'regulation':
            // Regulatory actors: Policymakers, Governments, Legal Objects
            return ['policymaker', 'government', 'legislator', 'regulator', 'court', 'legalobject', 'law', 'commissioner'].some(k => t.includes(k));

        case 'inscription':
            // Technical technicalities: Algorithms, Datasets, Infrastructure bits
            return ['standard', 'algorithm', 'technologist', 'expert', 'scientist', 'dataset', 'model', 'metric', 'benchmark'].some(k => t.includes(k));

        case 'delegation':
            // Operational mobilization: Auditors, Cloud, Infra, compliance agents
            return ['auditor', 'cloud', 'infrastructure', 'compliance', 'legal', 'algorithmicagent', 'platform', 'verifier'].some(k => t.includes(k));

        case 'market':
            // Market outcomes: Startups, Private Tech, Users, SMEs
            return ['privatetech', 'startup', 'private', 'corporation', 'sme', 'user', 'consumer', 'business', 'market'].some(k => t.includes(k));

        default:
            return false;
    }
};
